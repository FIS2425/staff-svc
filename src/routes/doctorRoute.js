import express from 'express';
import { register, deleteDoctor, getDoctorsBySpeciality} from '../controllers/doctorController.js';

const router = express.Router();

router.post('/register', register);
router.get('/clinic/:clinic/speciality/:speciality?', getDoctorsBySpeciality);
router.delete('/:id', deleteDoctor);

export default router;