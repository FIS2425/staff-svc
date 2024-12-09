import mongoose from 'mongoose';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import Doctor from '../../src/schemas/Doctor';

beforeAll(async () => {
  // Conectar a la base de datos antes de ejecutar los tests
  await mongoose.connect(process.env.VITE_MONGOURL);
});

afterAll(async () => {
  // Limpiar la base de datos y desconectar después de los tests
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Doctor model', () => {
  it('should create, get, and delete a doctor with valid data', async () => {
    const doctorData = {
      name: 'John',
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678Z',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '1854ab8f-41c5-4de9-b027-4acbd276320a'
    };
  
    const doctor = new Doctor(doctorData);
    const savedDoctor = await doctor.save();
  
    expect(savedDoctor._id).toBeDefined();
    expect(savedDoctor.name).toBe(doctorData.name);
    expect(savedDoctor.surname).toBe(doctorData.surname);
    expect(savedDoctor.specialty).toBe(doctorData.specialty);
    expect(savedDoctor.dni).toBe(doctorData.dni);
    expect(savedDoctor.clinicId).toBe(doctorData.clinicId);
    expect(savedDoctor.userId).toBe(doctorData.userId);
    expect(savedDoctor.active).toBe(true);

    // Get the doctor
    const foundDoctor = await Doctor.findById(savedDoctor._id);
    expect(foundDoctor).toBeDefined();
    expect(foundDoctor.name).toBe(doctorData.name);
    expect(foundDoctor.surname).toBe(doctorData.surname);
    expect(foundDoctor.specialty).toBe(doctorData.specialty);
    expect(foundDoctor.dni).toBe(doctorData.dni);
    expect(foundDoctor.clinicId).toBe(doctorData.clinicId);
    expect(foundDoctor.userId).toBe(doctorData.userId);
    expect(foundDoctor.active).toBe(true);

    // Delete the doctor
    await Doctor.findByIdAndDelete(savedDoctor._id);
    const deletedDoctor = await Doctor.findById(savedDoctor._id);
    expect(deletedDoctor).toBeNull();
  });
});