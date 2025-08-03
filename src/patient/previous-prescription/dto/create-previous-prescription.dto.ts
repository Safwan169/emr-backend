// src/patient/previous-prescription/dto/create-previous-prescription.dto.ts

export class CreatePreviousPrescriptionDto {
  description?: string;
  file_url: string; // this field is required
}
