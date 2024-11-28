import express from 'express';
import { register,getDoctorById, deleteDoctor,updateDoctorSpeciality, getDoctorsBySpeciality} from '../controllers/doctorController.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.post('/register', verifyAuth, verifyAdmin, register);
router.get('/clinic/:clinicId/speciality/:speciality?', getDoctorsBySpeciality);
router.get('/:doctorId', getDoctorById);
router.put('/:doctorId', verifyAuth, verifyAdmin, updateDoctorSpeciality);
router.delete('/:doctorId', verifyAuth, verifyAdmin, deleteDoctor);

export default router;