import express from 'express';
import { register, updateDoctorSpeciality } from '../controllers/doctorController.js';

const router = express.Router();

router.post('/register', register);

router.put('/:doctorId/update', updateDoctorSpeciality);

export default router;