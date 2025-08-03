import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';
import {
  addMinutes,
  format,
  startOfDay,
  isAfter,
  isBefore,
  addDays,
} from 'date-fns';
import {
  WeekDayEnum,
  AppointmentSlot,
  AppointmentStatus,
} from '@prisma/client';

type Slot = {
  date: string;
  start_time: string;
  end_time: string;
};

@Injectable()
export class DoctorAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async createAvailability(
    dto: CreateDoctorAvailabilityDto & { doctor_id: number },
  ) {
    const { doctor_id, weekdays, start_time, end_time, slot_duration_minutes } =
      dto;

    // Validate doctor exists and has correct role
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctor_id,
        role: { role_name: 'doctor' },
      },
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found or invalid role');
    }

    // Validate time format and logic
    this.validateTimeSlots(start_time, end_time, slot_duration_minutes);

    // Get current availability to compare weekdays
    const currentAvailability = await this.prisma.doctorAvailability.findFirst({
      where: { user_id: doctor_id },
      include: {
        available_days: true,
      },
    });

    let availability;
    let removedDays: string[] = [];

    if (currentAvailability) {
      // Check which days are being removed
      const currentDays = currentAvailability.available_days.map(
        (d) => d.day_of_week,
      );
      const newDays = weekdays.map((d) => d.toLowerCase());
      removedDays = currentDays.filter((day) => !newDays.includes(day));

      // Cancel appointments for removed days
      if (removedDays.length > 0) {
        await this.cancelAppointmentsForRemovedDays(doctor_id, removedDays);
      }

      // Update existing availability
      availability = await this.prisma.doctorAvailability.update({
        where: { id: currentAvailability.id },
        data: {
          start_time,
          end_time,
          appointment_duration_mins: slot_duration_minutes,
        },
      });

      // Remove old available days
      await this.prisma.doctorAvailableDay.deleteMany({
        where: { availability_id: availability.id },
      });
    } else {
      // Create new availability
      availability = await this.prisma.doctorAvailability.create({
        data: {
          user_id: doctor_id,
          start_time,
          end_time,
          appointment_duration_mins: slot_duration_minutes,
        },
      });
    }

    // Add new available days
    await this.prisma.doctorAvailableDay.createMany({
      data: weekdays.map((day) => ({
        availability_id: availability.id,
        day_of_week: day.toLowerCase() as WeekDayEnum,
      })),
    });

    // Delete only unbooked slots for this doctor
    await this.prisma.appointmentSlot.deleteMany({
      where: {
        user_id: doctor_id,
        is_booked: false,
        slot_date: {
          gte: new Date(),
        },
      },
    });

    // Generate new slots for next 30 days
    const createdSlots = await this.generateFutureSlots(
      doctor_id,
      availability.id,
      weekdays,
      start_time,
      end_time,
      slot_duration_minutes,
    );

    return {
      availability: {
        ...availability,
        available_days: weekdays,
      },
      created_slots_count: createdSlots.length,
      cancelled_appointments_count:
        removedDays.length > 0
          ? await this.getCancelledAppointmentsCount(doctor_id, removedDays)
          : 0,
      message: `Successfully updated availability. ${removedDays.length > 0 ? `Cancelled appointments for removed days: ${removedDays.join(', ')}` : ''}`,
    };
  }

  private async cancelAppointmentsForRemovedDays(
    doctor_id: number,
    removedDays: string[],
  ) {
    // Get all future appointments for the doctor on removed days
    const futureAppointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          user_id: doctor_id,
          slot_date: {
            gte: startOfDay(new Date()),
          },
        },
        status: AppointmentStatus.confirmed,
      },
      include: {
        slot: true,
      },
    });

    // Filter appointments that fall on removed days
    const appointmentsToCancel = futureAppointments.filter((appointment) => {
      const appointmentDay = appointment.slot.slot_date
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      return removedDays.includes(appointmentDay);
    });

    // Cancel these appointments and free up slots
    for (const appointment of appointmentsToCancel) {
      await this.prisma.$transaction(async (prisma) => {
        // Update appointment status to cancelled
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            status: AppointmentStatus.cancelled,
            updated_at: new Date(),
          },
        });

        // Free up the slot
        await prisma.appointmentSlot.update({
          where: { id: appointment.slot_id },
          data: { is_booked: false },
        });
      });
    }
  }

  private async getCancelledAppointmentsCount(
    doctor_id: number,
    removedDays: string[],
  ): Promise<number> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        slot: {
          user_id: doctor_id,
        },
        status: AppointmentStatus.cancelled,
        updated_at: {
          gte: new Date(Date.now() - 5000), // Last 5 seconds
        },
      },
    });
    return appointments.length;
  }

  private validateTimeSlots(
    start_time: string,
    end_time: string,
    duration: number,
  ) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      throw new BadRequestException('Invalid time format. Use HH:mm format');
    }

    const [startH, startM] = start_time.split(':').map(Number);
    const [endH, endM] = end_time.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('End time must be after start time');
    }

    const totalMinutes = endMinutes - startMinutes;
    if (totalMinutes < duration) {
      throw new BadRequestException(
        'Duration is longer than available time window',
      );
    }
  }

  private async generateFutureSlots(
    doctor_id: number,
    availability_id: number,
    weekdays: string[],
    start_time: string,
    end_time: string,
    slot_duration_minutes: number,
  ): Promise<AppointmentSlot[]> {
    const createdSlots: AppointmentSlot[] = [];
    const today = new Date();
    const daysAhead = 30;

    const normalizedWeekdays = weekdays.map((d) => d.toLowerCase());

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const weekday = date
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();

      if (normalizedWeekdays.includes(weekday)) {
        const slots = this.generateDailySlots(
          date,
          start_time,
          end_time,
          slot_duration_minutes,
        );

        for (const slot of slots) {
          try {
            const created = await this.prisma.appointmentSlot.create({
              data: {
                user_id: doctor_id,
                availability_id: availability_id,
                slot_date: startOfDay(new Date(slot.date)),
                start_time: slot.start_time,
                end_time: slot.end_time,
              },
            });

            createdSlots.push(created);
          } catch (error) {
            console.log(
              `Slot already exists for ${slot.date} ${slot.start_time}`,
            );
          }
        }
      }
    }

    return createdSlots;
  }

  generateDailySlots(
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

  async getAvailability(doctor_id: number, requesting_user_id?: number) {
    // Validate doctor exists
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctor_id,
        role: { role_name: 'doctor' },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const availability = await this.prisma.doctorAvailability.findFirst({
      where: { user_id: doctor_id },
      include: {
        available_days: true,
      },
    });

    if (!availability) {
      return {
        availability: null,
        available_slots: [],
        message: 'Doctor has not set availability yet',
      };
    }

    // Get available slots (unbooked, future slots only)
    const slots = await this.prisma.appointmentSlot.findMany({
      where: {
        user_id: doctor_id,
        is_booked: false,
        slot_date: {
          gte: startOfDay(new Date()),
        },
      },
      orderBy: [{ slot_date: 'asc' }, { start_time: 'asc' }],
    });

    // Filter out past slots (same day but past time)
    const now = new Date();
    const availableSlots = slots.filter((slot) => {
      const slotDateTime = new Date(slot.slot_date);
      const [hours, minutes] = slot.start_time.split(':').map(Number);
      slotDateTime.setHours(hours, minutes);
      return isAfter(slotDateTime, now);
    });

    return {
      availability: {
        ...availability,
        weekdays: availability.available_days.map((day) => day.day_of_week),
      },
      available_slots: availableSlots,
    };
  }

  async bookAppointment(dto: {
    patient_id: number;
    slot_id: number;
    notes?: string;
  }) {
    const { patient_id, slot_id, notes } = dto;

    // Validate patient exists and has correct role
    const patient = await this.prisma.user.findFirst({
      where: {
        id: patient_id,
        role: { role_name: 'patient' },
      },
    });

    if (!patient) {
      throw new BadRequestException('Patient not found or invalid role');
    }

    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slot_id },
      include: {
        user: true,
      },
    });

    if (!slot) {
      throw new BadRequestException('Appointment slot not found');
    }

    if (slot.is_booked) {
      throw new BadRequestException('Appointment slot is already booked');
    }

    // Check if slot is in the future
    const slotDateTime = new Date(slot.slot_date);
    const [hours, minutes] = slot.start_time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes);

    if (isBefore(slotDateTime, new Date())) {
      throw new BadRequestException('Cannot book appointment in the past');
    }

    // Check if patient already has an appointment on the same day
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        user_id: patient_id,
        status: AppointmentStatus.confirmed,
        slot: {
          slot_date: slot.slot_date,
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'Patient already has an appointment on this day',
      );
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (prisma) => {
      // Mark slot as booked
      await prisma.appointmentSlot.update({
        where: { id: slot_id },
        data: { is_booked: true },
      });

      // Create appointment with confirmed status by default
      const appointment = await prisma.appointment.create({
        data: {
          slot_id,
          user_id: patient_id,
          notes: notes || null,
          status: AppointmentStatus.confirmed,
        },
        include: {
          slot: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  DoctorProfile: {
                    select: {
                      specialization: true,
                      hospital: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return appointment;
    });

    return {
      appointment: result,
      message: 'Appointment booked successfully',
    };
  }

  async getPatientAppointments(patient_id: number, requesting_user_id: number) {
    // Check if requesting user is the patient or a doctor
    const requestingUser = await this.prisma.user.findFirst({
      where: { id: requesting_user_id },
      include: { role: true },
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    // Only allow patient to see their own appointments or doctors to see any
    if (
      requestingUser.role.role_name === 'patient' &&
      requesting_user_id !== patient_id
    ) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    if (
      requestingUser.role.role_name !== 'patient' &&
      requestingUser.role.role_name !== 'doctor'
    ) {
      throw new ForbiddenException(
        'Only patients and doctors can view appointments',
      );
    }

    // Validate patient exists
    const patient = await this.prisma.user.findFirst({
      where: {
        id: patient_id,
        role: { role_name: 'patient' },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.appointment.findMany({
      where: { user_id: patient_id },
      include: {
        slot: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                DoctorProfile: {
                  select: {
                    specialization: true,
                    hospital: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        slot: {
          slot_date: 'asc',
        },
      },
    });
  }

  async getDoctorAppointments(doctor_id: number, requesting_user_id: number) {
    // Check if requesting user is the doctor
    const requestingUser = await this.prisma.user.findFirst({
      where: { id: requesting_user_id },
      include: { role: true },
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    // Only allow doctor to see their own appointments
    if (
      requestingUser.role.role_name === 'doctor' &&
      requesting_user_id !== doctor_id
    ) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    if (requestingUser.role.role_name !== 'doctor') {
      throw new ForbiddenException('Only doctors can view doctor appointments');
    }

    // Validate doctor exists
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctor_id,
        role: { role_name: 'doctor' },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.prisma.appointment.findMany({
      where: {
        slot: {
          user_id: doctor_id,
        },
      },
      include: {
        slot: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
      },
      orderBy: {
        slot: {
          slot_date: 'asc',
        },
      },
    });
  }

  async updateAppointmentStatus(
    appointment_id: number,
    new_status: AppointmentStatus,
    requesting_user_id: number,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointment_id },
      include: {
        slot: {
          include: {
            user: true, // Doctor
          },
        },
        user: true, // Patient
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check if requesting user is either the doctor or the patient
    const isDoctorUser = appointment.slot.user.id === requesting_user_id;
    const isPatientUser = appointment.user.id === requesting_user_id;

    if (!isDoctorUser && !isPatientUser) {
      throw new ForbiddenException('You can only update your own appointments');
    }

    // Validate status transitions
    if (appointment.status === AppointmentStatus.completed) {
      throw new BadRequestException('Cannot modify completed appointments');
    }

    if (new_status === AppointmentStatus.completed && !isDoctorUser) {
      throw new ForbiddenException(
        'Only doctors can mark appointments as completed',
      );
    }

    // Use transaction for status update
    const result = await this.prisma.$transaction(async (prisma) => {
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointment_id },
        data: {
          status: new_status,
          updated_at: new Date(),
        },
        include: {
          slot: true,
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      // If cancelled, free up the slot (only if not past)
      if (new_status === AppointmentStatus.cancelled) {
        const slotDateTime = new Date(appointment.slot.slot_date);
        const [hours, minutes] = appointment.slot.start_time
          .split(':')
          .map(Number);
        slotDateTime.setHours(hours, minutes);

        // Only free up slot if it's in the future
        if (isAfter(slotDateTime, new Date())) {
          await prisma.appointmentSlot.update({
            where: { id: appointment.slot.id },
            data: { is_booked: false },
          });
        }
      }

      return updatedAppointment;
    });

    return {
      appointment: result,
      message: `Appointment ${new_status} successfully`,
    };
  }

  // Cron job method to auto-cancel missed appointments
  async autoCancelMissedAppointments() {
    const yesterday = addDays(new Date(), -1);

    const missedAppointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.confirmed,
        slot: {
          slot_date: {
            lt: startOfDay(yesterday),
          },
        },
      },
      include: {
        slot: true,
      },
    });

    for (const appointment of missedAppointments) {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.cancelled,
          updated_at: new Date(),
        },
      });
    }

    return {
      cancelled_count: missedAppointments.length,
      message: `Auto-cancelled ${missedAppointments.length} missed appointments`,
    };
  }
}
