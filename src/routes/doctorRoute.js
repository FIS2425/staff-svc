import express from 'express';
import { register, deleteDoctor } from '../controllers/doctorController.js';

const router = express.Router();

router.post('/register', register);

router.delete('/:id', deleteDoctor);

export default router;