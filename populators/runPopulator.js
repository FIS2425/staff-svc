import mongoose from 'mongoose';
import Doctor from '../src/schemas/Doctor.js';

const MONGO_URI = process.env.MONGOURL;

const connectToDatabase = async () => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connection successful');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
    });
};

// Sample user data
const sampleStaff = [
  {
    _id: '6a86e820-e108-4a71-8f10-57c3e0ccd0ac',
    name: 'clinic',
    surname: 'admin',
    specialty: 'cardiology',
    dni: '10000004H',
    userId: '27163ac7-4f4d-4669-a0c1-4b8538405475',
    clinicId: '27163ac7-4f4d-4669-a0c1-4b8538405475'
  },
  {
    _id: 'fea82b90-c146-4ea6-91b3-85a73c82e259',
    name: 'Doctor',
    surname: 'First',
    specialty: 'neurology',
    dni: '64781738F',
    userId: 'af1520a8-2d04-441e-ba19-aef5faf45dc8',
    clinicId: '27163ac7-4f4d-4669-a0c1-4b8538405475'
  },
  {
    _id: 'a1ac971e-7188-4eaa-859c-7b2249e3c46b',
    name: 'Doctor',
    surname: 'Second',
    specialty: 'neurology',
    dni: '20060493P',
    userId: '679f55e3-a3cd-4a47-aebd-13038c1528a0',
    clinicId: '5b431574-d2ab-41d3-b1dd-84b06f2bd1a0'
  }
];

async function populateStaff() {
  try {
    // Delete all doctors
    await Doctor.deleteMany({});

    // Save each user with plain-text passwords (they will be hashed by the schema's pre-save hook)
    for (const userData of sampleStaff) {
      const doctor = new Doctor(userData);
      await doctor.save();
      console.log(`Doctor ${doctor.dni} created successfully`);
    }

    console.log('All sample staff have been created');
  } catch (error) {
    console.error('Error populating users:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
(async () => {
  await connectToDatabase();
  await populateStaff();
})();
