import { beforeAll,beforeEach, afterAll, describe, expect, it } from 'vitest';
import * as db from '@tests/setup/database';
import Doctor from '../../../src/schemas/Doctor';

beforeAll(async () => {
  await db.clearDatabase();
});

beforeEach(async () => {
  await db.clearDatabase();
});

afterAll(async () => {
  await db.clearDatabase();
});

describe('Doctor model', () => {
  it('should create a doctor with valid data', async () => {
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
  });

  it('should fail to create a doctor with invalid DNI', async () => {
    const doctorData = {
      name: 'John',
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678A', // Invalid DNI
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '27163ac7-4f4d-4669-a0c1-4b8538405475'
    };

    const doctor = new Doctor(doctorData);
    let error;

    try {
      await doctor.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.dni).toBeDefined();
    expect(error.errors.dni.message).toBe('12345678A is not a valid DNI number!');
  });

  it('should fail to create a doctor without required fields', async () => {
    const doctorData = {
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678Z',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '27163ac7-4f4d-4669-a0c1-4b8538405475'
    };

    const doctor = new Doctor(doctorData);
    let error;

    try {
      await doctor.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('should fail to create a doctor with a specialty outside the enum', async () => {
    const doctorData = {
      name: 'John',
      surname: 'Doe',
      specialty: 'invalidSpecialty', // Invalid specialty
      dni: '12345678Z',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '27163ac7-4f4d-4669-a0c1-4b8538405475'
    };

    const doctor = new Doctor(doctorData);
    let error;

    try {
      await doctor.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.specialty).toBeDefined();
    expect(error.errors.specialty.message).toBe('`invalidSpecialty` is not a valid enum value for path `specialty`.');
  });

  it('should fail to create a doctor with the same DNI', async () => {
    const doctorData1 = {
      name: 'John',
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678Z',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '27163ac7-4f4d-4669-a0c1-4b8538405475'
    };
  
    const doctorData2 = {
      name: 'Jane',
      surname: 'Smith',
      specialty: 'neurology',
      dni: '12345678Z', // Mismo DNI que doctorData1
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '1854ab8f-41c5-4de9-b027-4acbd276320a'
    };
  
    const doctor1 = new Doctor(doctorData1);
    await doctor1.save();
  
    const doctor2 = new Doctor(doctorData2);
    let error;
  
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await doctor2.save();
    } catch (e) {
      error = e;
    }
  
    expect(error).toBeDefined();
    expect(error.message).toContain('duplicate key error');
  });

  it('should fail to create a doctor with an invalid userId', async () => {
    const doctorData = {
      name: 'John',
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678Z',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: 'invalidUserId' // Invalid userId
    };

    const doctor = new Doctor(doctorData);
    let error;

    try {
      await doctor.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.userId).toBeDefined();
    expect(error.errors.userId.message).toBe('invalidUserId is not a valid UUID!');
  });

  it('should fail to create a doctor with an invalid clinicId', async () => {
    const doctorData = {
      name: 'John',
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678Z',
      clinicId: 'invalidClinicId', // Invalid clinicId
      userId: '1854ab8f-41c5-4de9-b027-4acbd276320a'
    };

    const doctor = new Doctor(doctorData);
    let error;

    try {
      await doctor.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.clinicId).toBeDefined();
    expect(error.errors.clinicId.message).toBe('invalidClinicId is not a valid UUID!');
  });

  it('should fail to create a doctor with an existing userId', async () => {
    const doctorData1 = {
      name: 'John',
      surname: 'Doe',
      specialty: 'cardiology',
      dni: '12345678Z',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '1854ab8f-41c5-4de9-b027-4acbd276320a'
    };

    const doctorData2 = {
      name: 'Jane',
      surname: 'Smith',
      specialty: 'neurology',
      dni: '87654321X',
      clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
      userId: '1854ab8f-41c5-4de9-b027-4acbd276320a' // Same userId as doctorData1
    };

    const doctor1 = new Doctor(doctorData1);
    await doctor1.save();

    const doctor2 = new Doctor(doctorData2);
    let error;

    try {
      await doctor2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain('duplicate key error');
  });
});