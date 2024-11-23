import { beforeAll,beforeEach, afterAll, describe, expect, it } from 'vitest';
import * as db from '@tests/setup/database';
import { request } from '@tests/setup/setup';
import { v4 as uuidv4 } from 'uuid';

let doctorId;

beforeAll(async () => {
  await db.clearDatabase();
});

beforeEach(async () => {
  // Registrar un doctor de la Clinic A usando POST /staff/register
  const newDoctor = {
    name: 'John',
    surname: 'Doe',
    specialty: 'cardiology',
    dni: '64781738F',
    clinicId: '27163ac7-4f4d-4669-a0c1-4b8538405475',
    password: 'password123',
    email: 'johndoe@example.com',
  };
  const response = await request.post('/staff/register').send(newDoctor);
  doctorId = response.body._id;
});



afterAll(async () => {
  await db.clearDatabase();
});

describe('STAFF TEST', () => {
  describe('test POST /staff/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request.post('/staff/register').send({});
      expect(response.status).toBe(400);
      //expect(response.body.message).toBe('All fields are required.');
    });

    it('should return 201 and create a new doctor if all required fields are provided', async () => {
      const newDoctor2 = {
        name: 'Jane',
        surname: 'Smith',
        specialty: 'neurology',
        dni: '20060493P',
        clinic: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
        password: 'password123',
        email: 'janesmith@example.com',
      };
      const response = await request.post('/staff/register').send(newDoctor2);
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newDoctor2.name);
      expect(response.body.surname).toBe(newDoctor2.surname);
    });
  });

  describe('test GET /staff/clinic/:clinicId/speciality/:speciality?', () => {
    it('should return 200 and all doctors for a clinic', async () => {
      const response = await request.get('/staff/clinic/27163ac7-4f4d-4669-a0c1-4b8538405475/speciality/cardiology');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 404 if no doctors are found for the given clinic and speciality', async () => {
      const response = await request.get('/staff/clinic/1854ab8f-41c5-4de9-b027-4acbd276320a/speciality/NonExistentSpeciality');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No doctors found for the given clinic and speciality');
    });
  });

  describe('test PUT /staff/:doctorId', () => {
    it('should return 404 if doctor is not found', async () => {
      const response = await request.put(`/staff/${uuidv4()}`).send({ specialty: 'neurology' });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });

    it('should return 200 and update the doctor speciality if valid fields are provided', async () => {
      const updatedData = { specialty: 'neurology' };
      const response = await request.put(`/staff/${doctorId}`).send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body.doctor.specialty).toBe(updatedData.specialty);
    });
  });

  describe('test DELETE /staff/:doctorId', () => {
    it('should return 404 if doctor is not found', async () => {
      const response = await request.delete(`/staff/${uuidv4()}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });

    it('should return 204 if doctor is successfully deleted', async () => {
      const response = await request.delete(`/staff/${doctorId}`);
      expect(response.status).toBe(204);
    });
  });
});