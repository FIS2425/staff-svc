import mongoose from 'mongoose';
import { validate as uuidValidate, v4 as uuidv4 } from 'uuid';

const doctorSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
    validate: {
      validator: uuidValidate,
      message: (props) => `${props.value} is not a valid UUID!`,
    },
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true,
    enum: ['family_medicine', 'nursing', 'physiotherapy', 'gynecology', 'pediatrics', 
      'dermatology', 'cardiology', 'neurology', 'orthopedics', 'psychiatry', 'endocrinology', 
      'oncology', 'radiology', 'surgery', 'ophthalmology', 'urology', 
      'anesthesiology', 'otolaryngology', 'gastroenterology', 'other'],
  },
  dni: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        const dniRegex = /^[0-9]{8}[A-Z]$/;
        if (!dniRegex.test(v)) {
          return false;
        }
        const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const number = v.slice(0, 8);
        const letter = v.slice(8, 9);
        return letters[number % 23] === letter;
      },
      message: props => `${props.value} is not a valid DNI number!`
    }
  },
  clinicId: {
    type: String,
    default: () => uuidv4(),
    validate: {
      validator: uuidValidate,
      message: (props) => `${props.value} is not a valid UUID!`,
    },
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  userId: {
    type: String,
    default: () => uuidv4(),
    validate: {
      validator: uuidValidate,
      message: (props) => `${props.value} is not a valid UUID!`,
    },
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
export default Doctor;