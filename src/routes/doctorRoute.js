import express from 'express';
import { register, deleteDoctor,updateDoctorSpeciality, getDoctorsBySpeciality} from '../controllers/doctorController.js';

const router = express.Router();

router.post('/register', register);
router.get('/clinic/:clinic/speciality/:speciality?', getDoctorsBySpeciality);
router.put('/:doctorId', updateDoctorSpeciality);
router.delete('/:doctorId', deleteDoctor);

export default router;