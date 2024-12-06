import { beforeAll, beforeEach, afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import * as db from '@tests/setup/database';
import { request } from '@tests/setup/setup';
import { v4 as uuidv4 } from 'uuid';
import nock from 'nock';
import jwt from 'jsonwebtoken';

let doctorId;
let userId;

const clinicAdmin = {
  _id: uuidv4(),
  email: 'testuser2@mail.com',
  password: 'Passw0rd!',
  roles: ['clinicadmin'],
}

beforeAll(async () => {
  await db.clearDatabase();
  console.log('HOLAAA'+process.env.API_PREFIX || process.env.VITE_API_PREFIX)
});

beforeEach(async () => {
  // Mock the response from the authentication microservice
  nock(process.env.AUTH_SVC || process.env.VITE_AUTH_SVC)
    .post('/users')
    .reply(201, { _id: uuidv4() });
  nock(process.env.AUTH_SVC || process.env.VITE_AUTH_SVC)
    .delete(/\/users\/.*/)
    .reply(204);

  const token = jwt.sign(
    { userId: clinicAdmin._id, roles: clinicAdmin.roles },
    process.env.JWT_SECRET || process.env.VITE_JWT_SECRET,
  );
  request.set('Cookie', `token=${token}`);

  // Register a doctor from Clinic A using POST /staff/register
  const newDoctor = {
    name: 'John',
    surname: 'Doe',
    specialty: 'cardiology',
    dni: '64781738F',
    clinicId: '27163ac7-4f4d-4669-a0c1-4b8538405475',
    password: 'Passw0rd!',
    email: 'johndoe@example.com',
  };
  const response = await request.post(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/register').send(newDoctor);
  console.log(response.body);
  doctorId = response.body._id;
  userId = response.body.userId;
});

afterEach(() => {
  vi.clearAllMocks();
  nock.cleanAll(); // Clear all nock interceptors
});


afterAll(async () => {
  await db.clearDatabase();
});

describe('STAFF TEST', () => {
  describe('test POST /staff/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request.post(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/register').send({});
      expect(response.status).toBe(400);
      //expect(response.body.message).toBe('All fields are required.');
    });

    it('should return 201 and create a new doctor if all required fields are provided', async () => {
      const newDoctor2 = {
        name: 'Jane',
        surname: 'Smith',
        specialty: 'neurology',
        dni: '20060493P',
        clinicId: '51fdcf6c-4ca5-4983-8c3e-8b7a01c3429c',
        password: 'Passw0rd!',
        email: 'janesmith@example.com',
      };

      // Mock the response from the authentication microservice
      nock(process.env.AUTH_SVC || process.env.VITE_AUTH_SVC)
        .post('/users')
        .reply(201, { _id: uuidv4() });

      const response = await request.post(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/register').send(newDoctor2);
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newDoctor2.name);
      expect(response.body.surname).toBe(newDoctor2.surname);
    });
  });

  describe('test GET /staff/clinic/:clinicId/speciality/:speciality?', () => {
    it('should return 200 and all doctors for a clinic', async () => {
      const response = await request.get(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/clinic/27163ac7-4f4d-4669-a0c1-4b8538405475/speciality/cardiology');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 404 if no doctors are found for the given clinic and speciality', async () => {      
      const response = await request.get(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/clinic/1854ab8f-41c5-4de9-b027-4acbd276320a/speciality/NonExistentSpeciality');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No doctors found for the given clinicId and speciality');
    });
  });
  
  describe('test GET /staff/:doctorId', () => {
    it('should return 200 and the doctor if the doctor is found', async () => {
      const response = await request.get(process.env.API_PREFIX || process.env.VITE_API_PREFIX + `/staff/${doctorId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(doctorId);
      expect(response.body.name).toBe('John');
      expect(response.body.surname).toBe('Doe');
    });

    it('should return 404 if the doctor is not found', async () => {
      const response = await request.get(process.env.API_PREFIX || process.env.VITE_API_PREFIX + `/staff/${uuidv4()}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });
  });

  describe('test GET /staff/me', () => {
    it('should return 200 and the authenticated doctor if the token is valid', async () => {

      const doctorToken = jwt.sign(
        { userId: userId, roles: ['doctor'] },
        process.env.JWT_SECRET || process.env.VITE_JWT_SECRET,
      );

      request.set('Cookie', `token=${doctorToken}`);
      const response = await request.get(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/me');
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(doctorId);
      expect(response.body.name).toBe('John');
      expect(response.body.surname).toBe('Doe');
    });

    it('should return 404 if the token belongs to another doctor', async () => {
      const anotherDoctorToken = jwt.sign(
        { userId: uuidv4(), roles: ['doctor'] },
        process.env.JWT_SECRET || process.env.VITE_JWT_SECRET,
      );
      request.set('Cookie', `token=${anotherDoctorToken}`);

      const response = await request.get(process.env.API_PREFIX || process.env.VITE_API_PREFIX + '/staff/me');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Authenticated doctor not found');
    });
  });

  describe('test PUT /staff/:doctorId', () => {
    it('should return 404 if doctor is not found', async () => {
      const response = await request.put(process.env.API_PREFIX || process.env.VITE_API_PREFIX + `/staff/${uuidv4()}`).send({ specialty: 'neurology' });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });

    it('should return 200 and update the doctor speciality if valid fields are provided', async () => {
      const updatedData = { specialty: 'neurology' };
      const response = await request.put(process.env.API_PREFIX || process.env.VITE_API_PREFIX + `/staff/${doctorId}`).send(updatedData);
      expect(response.status).toBe(200);
      expect(response.body.doctor.specialty).toBe(updatedData.specialty);
    });
  });

  describe('test DELETE /staff/:doctorId', () => {
    it('should return 404 if doctor is not found', async () => {
      const response = await request.delete(process.env.API_PREFIX || process.env.VITE_API_PREFIX + `/staff/${uuidv4()}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });

    it('should return 204 if doctor is successfully deleted', async () => {
      const response = await request.delete(process.env.API_PREFIX || process.env.VITE_API_PREFIX + `/staff/${doctorId}`);
      expect(response.status).toBe(204);
    });
  });
});