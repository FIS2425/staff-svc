import Doctor from '../schemas/Doctor.js';
import axios from 'axios';

import logger from '../config/logger.js';

export const register = async (req, res) => {
  try {
    // if (req.user.roles.includes('Admin')) {
    const { name, surname, specialty, dni, clinic, password, email } = req.body;
    try {
    //   const authResponse = await axios.post(`http://${process.env.AUTH_SVC}/register`, {
    //     password,
    //     email,
    //     roles: ['Doctor']
    //   });

      const doctor = new Doctor({
        name,
        surname,
        specialty,
        dni,
        clinic,
        // userId: authResponse.data._id
        userId: '38e37cc7-992a-4530-a381-fd907fb921b3'
      });

      await doctor.save();
      logger.info(`Doctor ${doctor._id} created`);
      res.status(201).json(doctor);

    } catch (error) {
      logger.error('Invalid credentials', {
        method: req.method,
        url: req.originalUrl,
        error: error
      });

      res.status(400).json({ message: error.message });
    }
    // } else {
    //   logger.error('User is not an admin', {
    //     method: req.method,
    //     url: req.originalUrl
    //   });
    //   res.status(403).json({ message: 'Forbidden' });
    // }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Función para obtener todos los doctores de una clínica filtrados por especialidad
export const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { clinic, speciality } = req.params;
    let doctors;
    if (speciality) {
      // Buscar doctores por clínica y especialidad
      doctors = await Doctor.find({ clinic, specialty: speciality });
    } else {
      // Buscar todos los doctores por clínica
      doctors = await Doctor.find({ clinic });
    }

    res.status(200).json(doctors);
  } catch (error) {
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
        url: req.originalUrl
      });
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Verificar que el usuario autenticado es el mismo que el usuario del doctor
    // if (doctor.userId !== req.user.id) {
    //   logger.error('Unauthorized attempt to update speciality', {
    //     method: req.method,
    //     url: req.originalUrl,
    //     userId: req.user.id
    //   });
    //   return res.status(403).json({ message: 'Forbidden: You can only update your own speciality' });
    // }

    // Actualizar la especialidad del doctor
    doctor.specialty = specialty;
    await doctor.save();

    logger.info(`Doctor ${doctor._id} speciality updated to ${specialty}`);
    res.status(200).json({ message: 'Speciality updated successfully', doctor });

  } catch (error) {
    logger.error('Error updating doctor speciality', {
      method: req.method,
      url: req.originalUrl,
      error: error.message
    });
    res.status(400).json({ message: error.message });
  }
};


export const deleteDoctor = async (req, res) => {
  try {
    // if (req.user.roles.includes('Admin')) {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      logger.error('Doctor not found', {
        method: req.method,
        url: req.originalUrl
      });
      res.status(404).json({ message: 'Doctor not found' });
    } else {
      try {
        // const authResponse = await axios.delete(`http://${process.env.AUTH_SVC}/${doctor.userId}`);
        
        // if (authResponse.status === 200) {
        await doctor.deleteOne();
        logger.info(`Doctor ${doctor._id} deleted from database`);
        
        res.status(204).send();
        // } else {
        //   logger.error('Error deleting user from auth service', {
        //     method: req.method,
        //     url: req.originalUrl,
        //     status: authResponse.status
        //   });
        //   res.status(500).json({ message: 'Error deleting user from auth service' });
        //   return;
        // }
      } catch (error) {
        logger.error('Error deleting user', {
          method: req.method,
          url: req.originalUrl,
          error: error
        });
      }
    }
    
    // } else {
    //   logger.error('User is not an admin', {
    //     method: req.method,
    //     url: req.originalUrl
    //   });
    //   res.status(403).json({ message: 'Forbidden' });
    // }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}