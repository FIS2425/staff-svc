import express from 'express';
import { register, getDoctorsBySpeciality} from '../controllers/doctorController.js';

const router = express.Router();

router.post('/register', register);
router.get('/clinic/:clinic/speciality/:speciality?', getDoctorsBySpeciality);

export default router;