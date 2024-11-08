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