import express from 'express';
import { register, deleteDoctor, updateDoctorSpeciality } from '../controllers/doctorController.js';

const router = express.Router();

router.post('/register', register);
router.put('/:doctorId/update', updateDoctorSpeciality);
router.delete('/:id', deleteDoctor);

export default router;