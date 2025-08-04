import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';
import { addMinutes, format, startOfDay } from 'date-fns';
import { WeekDayEnum, AppointmentSlot } from '@prisma/client';
import { endOfDay, differenceInYears } from 'date-fns';
import { AppointmentStatus } from '@prisma/client';



type Slot = {
  date: string;
  start_time: string;
  end_time: string;
};

@Injectable()
export class DoctorAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  // NEW METHOD: Book appointment by slot with doctor validation
  async bookAppointmentBySlot(dto: {
    patient_id: number;
    slot_id: number;
    doctor_id: number;
    notes?: string;
  }) {
    const { patient_id, slot_id, doctor_id, notes } = dto;

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

    // Validate doctor exists and has correct role
    const doctor = await this.prisma.user.findFirst({
      where: {
        id: doctor_id,
        role: { role_name: 'doctor' },
      },
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
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found or invalid role');
    }

    // Find and validate the slot
    const slot = await this.prisma.appointmentSlot.findUnique({
      where: { id: slot_id },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!slot) {
      throw new BadRequestException('Appointment slot not found');
    }

    // Validate that the slot belongs to the specified doctor
    if (slot.user_id !== doctor_id) {
      throw new BadRequestException(
        `This slot belongs to Dr. ${slot.user.first_name} ${slot.user.last_name}, not the specified doctor`,
      );
    }

    if (slot.is_booked) {
      throw new BadRequestException('Appointment slot is already booked');
    }

    // Check if slot is in the future
    const slotDateTime = new Date(slot.slot_date);
    const [hours, minutes] = slot.start_time.split(':').map(Number);
    slotDateTime.setHours(hours, minutes);

    if (slotDateTime <= new Date()) {
      throw new BadRequestException('Cannot book appointment in the past');
    }

    // Check if patient already has an appointment with this doctor on the same date
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        user_id: patient_id,
        slot: {
          user_id: doctor_id,
          slot_date: slot.slot_date,
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'You already have an appointment with this doctor on this date',
      );
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (prisma) => {
      // Mark slot as booked
      await prisma.appointmentSlot.update({
        where: { id: slot_id },
        data: { is_booked: true },
      });

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          slot_id,
          user_id: patient_id,
          notes: notes || null,
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
                      fee: true,
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
              phone_number: true,
            },
          },
        },
      });

      return appointment;
    });

    // Format the response
    const formattedAppointment = {
      id: result.id,
      status: result.status,
      notes: result.notes,
      patient: result.user,
      doctor: {
        id: result.slot.user.id,
        name: `${result.slot.user.first_name} ${result.slot.user.last_name}`,
        specialization: result.slot.user.DoctorProfile?.specialization,
        hospital: result.slot.user.DoctorProfile?.hospital,
        fee: result.slot.user.DoctorProfile?.fee,
      },
      appointment_details: {
        date: format(new Date(result.slot.slot_date), 'yyyy-MM-dd'),
        day: format(new Date(result.slot.slot_date), 'EEEE'),
        start_time: result.slot.start_time,
        end_time: result.slot.end_time,
      },
      created_at: result.created_at,
    };

    return {
      success: true,
      appointment: formattedAppointment,
      message: `Appointment booked successfully with Dr. ${doctor.first_name} ${doctor.last_name}`,
    };
  }

  // NEW METHOD: Get all available doctors
  async getAvailableDoctors() {
    const doctors = await this.prisma.user.findMany({
      where: {
        role: { role_name: 'doctor' },
        DoctorAvailability: {
          some: {}, // Has availability set
        },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        DoctorProfile: {
          select: {
            specialization: true,
            hospital: true,
            fee: true,
            rating: true,
            years_of_experience: true,
          },
        },
        DoctorAvailability: {
          select: {
            start_time: true,
            end_time: true,
            appointment_duration_mins: true,
            available_days: {
              select: {
                day_of_week: true,
              },
            },
          },
        },
        _count: {
          select: {
            AppointmentSlot: {
              where: {
                is_booked: false,
                slot_date: {
                  gte: startOfDay(new Date()),
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        name: `${doctor.first_name} ${doctor.last_name}`,
        specialization:
          doctor.DoctorProfile?.specialization || 'General Practice',
        hospital: doctor.DoctorProfile?.hospital,
        fee: doctor.DoctorProfile?.fee,
        rating: doctor.DoctorProfile?.rating,
        years_of_experience: doctor.DoctorProfile?.years_of_experience,
        availability: {
          working_hours: doctor.DoctorAvailability[0]
            ? {
                start_time: doctor.DoctorAvailability[0].start_time,
                end_time: doctor.DoctorAvailability[0].end_time,
                slot_duration:
                  doctor.DoctorAvailability[0].appointment_duration_mins,
              }
            : null,
          available_days:
            doctor.DoctorAvailability[0]?.available_days.map(
              (d) => d.day_of_week,
            ) || [],
        },
        available_slots_count: doctor._count.AppointmentSlot,
      })),
    };
  }

  // EXISTING METHODS BELOW (keep all your existing methods)

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
      throw new BadRequestException('Doctor not found');
    }

    // Validate time format and logic
    this.validateTimeSlots(start_time, end_time, slot_duration_minutes);

    let availability = await this.prisma.doctorAvailability.findFirst({
      where: { user_id: doctor_id },
    });

    if (availability) {
      // Update existing availability
      availability = await this.prisma.doctorAvailability.update({
        where: { id: availability.id },
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
      message: `Successfully created ${createdSlots.length} appointment slots`,
    };
  }

  private validateTimeSlots(
    start_time: string,
    end_time: string,
    duration: number,
  ) {
    // Validate time format (HH:mm)
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

  // UPDATED METHOD: Enhanced getAvailability with slot IDs
  async getAvailability(doctor_id: number) {
    const availability = await this.prisma.doctorAvailability.findFirst({
      where: { user_id: doctor_id },
      include: {
        available_days: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
            DoctorProfile: {
              select: {
                specialization: true,
                hospital: true,
                fee: true,
              },
            },
          },
        },
      },
    });

    if (!availability) {
      return {
        success: false,
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

    // Group slots by date for better organization
    const slotsByDate = slots.reduce((acc, slot) => {
      const date = format(new Date(slot.slot_date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        slot_id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        day: format(new Date(slot.slot_date), 'EEEE'),
      });
      return acc;
    }, {});

    return {
      success: true,
      doctor: {
        id: doctor_id,
        name: `${availability.user.first_name} ${availability.user.last_name}`,
        specialization: availability.user.DoctorProfile?.specialization,
        hospital: availability.user.DoctorProfile?.hospital,
        fee: availability.user.DoctorProfile?.fee,
      },
      availability: {
        working_hours: {
          start_time: availability.start_time,
          end_time: availability.end_time,
          slot_duration: availability.appointment_duration_mins,
        },
        available_days: availability.available_days.map(
          (day) => day.day_of_week,
        ),
      },
      available_slots: slotsByDate,
      total_slots: slots.length,
    };
  }

  async bookAppointment(dto: {
    patient_id: number;
    slot_id: number;
    notes?: string;
  }) {
    const { patient_id, slot_id, notes } = dto;

    // Validate patient exists
    const patient = await this.prisma.user.findFirst({
      where: {
        id: patient_id,
        role: { role_name: 'patient' },
      },
    });

    if (!patient) {
      throw new BadRequestException('Patient not found');
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

    if (slotDateTime <= new Date()) {
      throw new BadRequestException('Cannot book appointment in the past');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (prisma) => {
      // Mark slot as booked
      await prisma.appointmentSlot.update({
        where: { id: slot_id },
        data: { is_booked: true },
      });

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          slot_id,
          user_id: patient_id,
          notes: notes || null,
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

  async getPatientAppointments(patient_id: number) {
    const appointments = await this.prisma.appointment.findMany({
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

    // Format the slot dates and add day names
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      slot: {
        ...appointment.slot,
        slot_date: format(new Date(appointment.slot.slot_date), 'yyyy-MM-dd'),
        day: format(new Date(appointment.slot.slot_date), 'EEEE').toLowerCase(),
      },
    }));

    return formattedAppointments;
  }

  async getDoctorAppointments(doctor_id: number) {
    const appointments = await this.prisma.appointment.findMany({
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

    // Format the slot dates and add day names
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      slot: {
        ...appointment.slot,
        slot_date: format(new Date(appointment.slot.slot_date), 'yyyy-MM-dd'),
        day: format(new Date(appointment.slot.slot_date), 'EEEE').toLowerCase(),
      },
    }));

    return formattedAppointments;
  }

  async getDoctorPatientCount(doctorId: number): Promise<{ patientCount: number }> {
  const distinctPatients = await this.prisma.appointment.findMany({
    where: {
      slot: {
        user_id: doctorId, // slot.user_id is the doctor
      },
    },
    select: {
      user_id: true, // user_id is the patient
    },
    distinct: ['user_id'], // unique patients only
  });

  return { patientCount: distinctPatients.length };
}



async getAllPatientsByDoctor(doctorId: number): Promise<any[]> {
  const appointments = await this.prisma.appointment.findMany({
    where: {
      slot: {
        user_id: doctorId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          gender: true,
          date_of_birth: true,
          ChronicConditionHistory: {
            select: {
              name: true, // ✅ Corrected field from your model
            },
            take: 1, // Only the first condition (you can increase or loop if needed)
          },
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const uniquePatientsMap = new Map<number, any>();

  for (const appointment of appointments) {
    const user = appointment.user;
    if (!user) continue;

    const patientId = user.id;
    if (!uniquePatientsMap.has(patientId)) {
      const fullName = `${user.first_name} ${user.last_name}`;
      const age = differenceInYears(new Date(), new Date(user.date_of_birth));

      uniquePatientsMap.set(patientId, {
        user_id: patientId,
        name: fullName,
        gender: user.gender,
        age,
        appointment_date: appointment.created_at,
        condition: user.ChronicConditionHistory[0]?.name || 'N/A',
        status: appointment.status,
      });
    }
  }

  return Array.from(uniquePatientsMap.values());
}


async getTodaysAppointmentsByDoctor(doctorId: number): Promise<{ total: number; appointments: any[] }> {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // Fetch appointments with user details
  const appointments = await this.prisma.appointment.findMany({
    where: {
      created_at: {
        gte: todayStart,
        lte: todayEnd,
      },
      slot: {
        user_id: doctorId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          gender: true,
          date_of_birth: true,
          ChronicConditionHistory: {
            select: {
              name: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  // Count total number of today's appointments for the doctor
  const total = await this.prisma.appointment.count({
    where: {
      created_at: {
        gte: todayStart,
        lte: todayEnd,
      },
      slot: {
        user_id: doctorId,
      },
    },
  });

  // Format appointment info
  const formattedAppointments = appointments.map((appointment) => {
    const user = appointment.user;
    const fullName = `${user.first_name} ${user.last_name}`;
    const age = differenceInYears(new Date(), new Date(user.date_of_birth));
    return {
      user_id: user.id,
      name: fullName,
      gender: user.gender,
      age,
      appointment_time: appointment.created_at,
      condition: user.ChronicConditionHistory[0]?.name || 'N/A',
      status: appointment.status,
    };
  });

  return {
    total,
    appointments: formattedAppointments,
  };
}



async updateAppointmentStatus(appointmentId: number, newStatus: AppointmentStatus) {
  // Optional: verify appointment exists first (optional)
  const appointment = await this.prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new Error('Appointment not found');
  }

  return this.prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus },
  });
}




}
