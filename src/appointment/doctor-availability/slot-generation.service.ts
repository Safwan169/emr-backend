import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { addDays, startOfDay, format, addMinutes } from 'date-fns';

type Slot = {
  date: string;
  start_time: string;
  end_time: string;
};

@Injectable()
export class SlotGenerationService {
  private readonly logger = new Logger(SlotGenerationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every day at 2:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateDailySlots() {
    this.logger.log('Starting daily slot generation...');

    try {
      // Get all doctor availabilities
      const availabilities = await this.prisma.doctorAvailability.findMany({
        include: {
          available_days: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      let totalSlotsCreated = 0;
      let doctorsProcessed = 0;

      for (const availability of availabilities) {
        const slotsCreated = await this.generateSlotsForDoctor(availability);
        totalSlotsCreated += slotsCreated;
        doctorsProcessed++;

        if (slotsCreated > 0) {
          this.logger.log(
            `Generated ${slotsCreated} slots for Dr. ${availability.user.first_name} ${availability.user.last_name}`,
          );
        }
      }

      this.logger.log(
        `Daily slot generation completed. Processed ${doctorsProcessed} doctors, created ${totalSlotsCreated} new slots.`,
      );
    } catch (error) {
      this.logger.error('Error in daily slot generation:', error);
    }
  }

  private async generateSlotsForDoctor(availability: any): Promise<number> {
    const {
      id: availability_id,
      user_id: doctor_id,
      start_time,
      end_time,
      appointment_duration_mins,
      available_days,
    } = availability;

    // Generate slots for the next 30 days starting from today
    const today = new Date();
    const endDate = addDays(today, 30);
    let slotsCreated = 0;

    // Get weekdays from available_days
    const weekdays = available_days.map((day) => day.day_of_week);

    for (let date = new Date(today); date <= endDate; date = addDays(date, 1)) {
      const weekday = date
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();

      if (weekdays.includes(weekday)) {
        // Check if slots already exist for this date
        const existingSlots = await this.prisma.appointmentSlot.findFirst({
          where: {
            user_id: doctor_id,
            slot_date: startOfDay(date),
          },
        });

        // Only create slots if they don't exist
        if (!existingSlots) {
          const dailySlots = this.createDailySlots(
            date,
            start_time,
            end_time,
            appointment_duration_mins,
          );

          for (const slot of dailySlots) {
            try {
              await this.prisma.appointmentSlot.create({
                data: {
                  user_id: doctor_id,
                  availability_id: availability_id,
                  slot_date: startOfDay(new Date(slot.date)),
                  start_time: slot.start_time,
                  end_time: slot.end_time,
                },
              });
              slotsCreated++;
            } catch (error) {
              // Skip if slot already exists due to unique constraint
              // This is normal and expected
            }
          }
        }
      }
    }

    return slotsCreated;
  }

  private createDailySlots(
    date: Date,
    start: string,
    end: string,
    interval: number,
  ): Slot[] {
    const dateString = format(date, 'yyyy-MM-dd');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const slots: Slot[] = [];
    let startTime = new Date(date);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endH, endM, 0, 0);

    while (startTime < endTime) {
      const slotStart = new Date(startTime);
      const slotEnd = addMinutes(slotStart, interval);

      if (slotEnd > endTime) break;

      slots.push({
        date: dateString,
        start_time: format(slotStart, 'HH:mm'),
        end_time: format(slotEnd, 'HH:mm'),
      });

      startTime = slotEnd;
    }

    return slots;
  }

  // Manual trigger method for testing
  async generateSlotsManually() {
    this.logger.log('Manual slot generation triggered...');
    await this.generateDailySlots(); // This now calls the correct method
    return { message: 'Manual slot generation completed' };
  }

  // Clean up old slots (runs weekly on Sunday at 3 AM)
  @Cron('0 3 * * 0')
  async cleanupOldSlots() {
    this.logger.log('Starting cleanup of old unbooked slots...');

    try {
      const yesterday = addDays(new Date(), -1);

      const deletedSlots = await this.prisma.appointmentSlot.deleteMany({
        where: {
          is_booked: false,
          slot_date: {
            lt: startOfDay(yesterday),
          },
        },
      });

      this.logger.log(`Cleaned up ${deletedSlots.count} old unbooked slots`);
    } catch (error) {
      this.logger.error('Error in cleanup old slots:', error);
    }
  }
}
