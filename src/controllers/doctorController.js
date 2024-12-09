import Doctor from '../schemas/Doctor.js';
import axios from 'axios';

import logger from '../config/logger.js';
import { registerValidator } from '../utils/validation.js';

const AUTH_SVC = process.env.AUTH_SVC || 'http://auth-svc:3001';

export const register = async (req, res) => {
  try {
    const { name, surname, specialty, dni, clinicId, password, email } = req.body;
    const { error } = registerValidator().validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if a doctor with the same DNI already exists
    const existingDoctor = await Doctor.findOne({ dni });
    if (existingDoctor) {
      return res.status(400).json({ message: 'A doctor with the same DNI already exists' });
    }

    const doctor = new Doctor({
      name,
      surname,
      specialty,
      dni,
      clinicId,
    });

    try {
      const authResponse = await axios.post(`${AUTH_SVC }/users`, {
        password,
        email,
        roles: ['doctor']
      }, {
        withCredentials: true,
        headers: {
          Cookie: `token=${req.cookies.token}`
        }
      });

      doctor.userId = authResponse.data._id;

      await doctor.save();
      logger.info(`Doctor ${doctor._id} created`, {
        method: req.method,
        url: req.originalUrl,
        appointmentId: doctor._id,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip
      });
      res.status(201).json(doctor);

    } catch (error) {
      logger.error('Could not create an user', {
        method: req.method,
        url: req.originalUrl,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
        error: error
      });

      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    logger.error('Could not create a doctor', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      error: error
    })

    res.status(400).json({ message: error.message });
  }
}
// Get me
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      logger.error('Authenticated doctor not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
        userId
      });
      return res.status(404).json({ message: 'Authenticated doctor not found' });
    }

    logger.info('Doctor retrieved successfully', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      doctorId: doctor._id
    });
    res.status(200).json(doctor);
  } catch (error) {
    logger.error('Error retrieving authenticated doctor', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      error: error.message
    });
    res.status(400).json({ message: 'Error retrieving authenticated doctor. Please try again later.' });
  }
}


// Get by Id
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      logger.error('Doctor not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
        doctorId
      });
      return res.status(404).json({ message: 'Doctor not found' });
    }

    logger.info('Doctor retrieved successfully', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      doctorId
    });
    res.status(200).json(doctor);
  } catch (error) {
    logger.error('Error retrieving doctor', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      error: error.message
    });
    res.status(400).json({ message: error.message });
  }
};

// Función para obtener todos los doctores de una clínica filtrados por especialidad
export const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { clinicId, speciality } = req.params;

    let doctors;
    if (speciality) {
      // Buscar doctores por clínica y especialidad
      doctors = await Doctor.find({ clinicId, specialty: speciality });
    } else {
      // Buscar todos los doctores por clínica
      doctors = await Doctor.find({ clinicId });
    }

    if (doctors.length === 0) {
      logger.error('No doctors found for the given clinicId and speciality', {
        method: req.method,
        url: req.originalUrl,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
        clinicId,
        speciality
      });
      return res.status(404).json({ message: 'No doctors found for the given clinicId and speciality' });
    }

    logger.info('Doctors retrieved successfully', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      clinicId,
      speciality
    });
    res.status(200).json(doctors);
  } catch (error) {
    logger.error('Error retrieving doctors', {
      method: req.method,
      url: req.originalUrl,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
      error: error.message
    });
    res.status(400).json({ message: error.message });
  }
}

export const updateDoctorSpeciality = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { specialty } = req.body;

    // Buscar el doctor por ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      logger.error('Doctor not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip
      });
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Actualizar la especialidad del doctor
    doctor.specialty = specialty;
    await doctor.save();

    logger.info(`Doctor ${doctor._id} speciality updated to ${specialty}`, {
      method: req.method,
      url: req.originalUrl,
      doctorId: doctor._id,
      specialty,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip
    });
    res.status(200).json({ message: 'Speciality updated successfully', doctor });

  } catch (error) {
    logger.error('Error updating doctor speciality', {
      method: req.method,
      url: req.originalUrl,
      error: error.message,
      ip: req.headers && req.headers['x-forwarded-for'] || req.ip
    });
    res.status(400).json({ message: error.message });
  }
};


export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      logger.error('Doctor not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.headers && req.headers['x-forwarded-for'] || req.ip
      });
      res.status(404).json({ message: 'Doctor not found' });
    } else {
      try {
        const authResponse = await axios.delete(`${AUTH_SVC}/users/${doctor.userId}`, {
          withCredentials: true,
          headers: {
            Cookie: `token=${req.cookies.token}`
          }
        });
        
        if (authResponse.status === 204) {
          await doctor.deleteOne();
          logger.info(`Doctor ${doctor._id} deleted from database`,  {
            method: req.method,
            url: req.originalUrl,
            appointmentId: doctor._id,
            ip: req.headers && req.headers['x-forwarded-for'] || req.ip
          });
        
          res.status(204).send();
        } else {
          logger.error('Error deleting user from auth service', {
            method: req.method,
            url: req.originalUrl,
            status: authResponse.status
          });
          res.status(500).json({ message: 'Error deleting user from auth service' });
          return;
        }
      } catch (error) {
        logger.error('Error deleting user', {
          method: req.method,
          url: req.originalUrl,
          ip: req.headers && req.headers['x-forwarded-for'] || req.ip,
          error: error
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}