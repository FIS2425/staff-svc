import { beforeAll, beforeEach, afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import * as db from '@tests/setup/database';
import { request } from '@tests/setup/setup';
import { v4 as uuidv4 } from 'uuid';
import nock from 'nock';
import jwt from 'jsonwebtoken';
import Doctor from '../../../src/schemas/Doctor';

let doctorId;
let userId;

const clinicAdminUser = {
  _id: uuidv4(),
  email: 'testuser2@mail.com',
  password: 'Passw0rd!',
  roles: ['doctor', 'clinicadmin'],
}

beforeAll(async () => {
  await db.clearDatabase();
});

beforeEach(async () => {
  // Mock the response from the authentication microservice
  nock('http://auth-svc:3001')
    .post('/users')
    .reply(201, { _id: uuidv4() });
  nock('http://auth-svc:3001')
    .delete(/\/users\/.*/)
    .reply(204);

  nock('http://payment-svc:3003')
    .get(/\/clinics\/.*/)
    .reply(200);
  nock('http://payment-svc:3003')
    .get(/\/plans\/.*/)
    .reply(200, { name: 'Professional' });

  const token = jwt.sign(
    { userId: clinicAdminUser._id, roles: clinicAdminUser.roles },
    process.env.VITE_JWT_SECRET,
  );
  request.set('Cookie', `token=${token}`);

  const clinicAdminStaff = new Doctor({
    name: 'clinic',
    surname: 'admin',
    specialty: 'cardiology',
    dni: '10000004H',
    userId: clinicAdminUser._id,
    clinicId: '27163ac7-4f4d-4669-a0c1-4b8538405475',
    password: 'Passw0rd!',
    email: 'johndoe@example.com',
  })

  await clinicAdminStaff.save()
  // Register a doctor from Clinic A using POST /staff/register
  const newDoctor = {
    name: 'John',
    surname: 'Doe',
    specialty: 'cardiology',
    dni: '64781738F',
    password: 'Passw0rd!',
    email: 'johndoe@example.com',
  };
  const response = await request.post('/staff/register').send(newDoctor);
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
        password: 'Passw0rd!',
        email: 'janesmith@example.com',
      };

      // Mock the response from the authentication microservice
      nock('http://auth-svc:3001')
        .post('/users')
        .reply(201, { _id: uuidv4() });
      
      nock('http://payment-svc:3003')
        .get(/\/clinics\/.*/)
        .reply(200);
      nock('http://payment-svc:3003')
        .get(/\/plans\/.*/)
        .reply(200, { name: 'Professional' });

      const response = await request.post('/staff/register').send(newDoctor2);
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newDoctor2.name);
      expect(response.body.surname).toBe(newDoctor2.surname);
      expect(response.body.specialty).toBe(newDoctor2.specialty);
      expect(response.body.clinicId).toBe('27163ac7-4f4d-4669-a0c1-4b8538405475');
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
      expect(response.body.message).toBe('No doctors found for the given clinicId and speciality');
    });
  });
  
  describe('test GET /staff/:doctorId', () => {
    it('should return 200 and the doctor if the doctor is found', async () => {
      const response = await request.get(`/staff/${doctorId}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(doctorId);
      expect(response.body.name).toBe('John');
      expect(response.body.surname).toBe('Doe');
    });

    it('should return 404 if the doctor is not found', async () => {
      const response = await request.get(`/staff/${uuidv4()}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });
  });

  describe('test GET /staff/me', () => {
    it('should return 200 and the authenticated doctor if the token is valid', async () => {

      const doctorToken = jwt.sign(
        { userId: userId, roles: ['doctor'] },
        process.env.VITE_JWT_SECRET,
      );

      request.set('Cookie', `token=${doctorToken}`);
      const response = await request.get('/staff/me');
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(doctorId);
      expect(response.body.name).toBe('John');
      expect(response.body.surname).toBe('Doe');
    });

    it('should return 404 if the token belongs to another doctor', async () => {
      const anotherDoctorToken = jwt.sign(
        { userId: uuidv4(), roles: ['doctor'] },
        process.env.VITE_JWT_SECRET,
      );
      request.set('Cookie', `token=${anotherDoctorToken}`);

      const response = await request.get('/staff/me');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Authenticated doctor not found');
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