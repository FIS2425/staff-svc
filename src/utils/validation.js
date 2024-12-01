import Joi from 'joi';

export const registerValidator = () => {
  const specialties = ['family_medicine', 'nursing', 'physiotherapy', 'gynecology', 'pediatrics', 
    'dermatology', 'cardiology', 'neurology', 'orthopedics', 'psychiatry', 'endocrinology', 
    'oncology', 'radiology', 'surgery', 'ophthalmology', 'urology', 
    'anesthesiology', 'otolaryngology', 'gastroenterology', 'other'];

  const dniRegex = /^[0-9]{8}[A-Z]$/;

  const registerValidator = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    specialty: Joi.string().valid(...specialties).required(),
    dni: Joi.string().pattern(dniRegex).required().custom((value, helpers) => {
      const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      const number = value.slice(0, 8);
      const letter = value.slice(8, 9);
      if (letters[number % 23] !== letter) {
        return helpers.message(`${value} is not a valid DNI number!`);
      }
      return value;
    }),
    clinicId: Joi.string().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required()
  });

  return registerValidator;
};

