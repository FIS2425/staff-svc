# Staff Service

> Version 1.0.0

API to manage doctors in a clinic.

## Path Table

| Method | Path | Description |
| --- | --- | --- |
| GET | [/staff/clinic/{clinic}/speciality/{speciality}](#getstaffclinicclinicspecialityspeciality) | Get doctors by speciality in a clinic |

## Path Details

***

### [GET]/staff/clinic/{clinic}/speciality/{speciality}

- Summary  
Get doctors by speciality in a clinic

- Parameters  
  - `clinic` (string, required): Clinic name
  - `speciality` (string, required): Speciality name

- Responses
  - `200 OK`: List of doctors
  - `404 Not Found`: No doctors found

***

### [POST]/staff/register

- Summary  
Register a new doctor

- Request Body
  - `name` (string): Doctor's first name
  - `surname` (string): Doctor's last name
  - `specialty` (string): Doctor's specialty
  - `dni` (string): Doctor's DNI
  - `clinic` (string): Clinic name
  - `password` (string): Doctor's password
  - `email` (string): Doctor's email

- Responses
  - `201 Created`: Doctor created successfully
  - `400 Bad Request`: Bad request

***

### [PUT]/staff/{doctorId}

- Summary  
Update doctor speciality

- Parameters  
  - `doctorId` (string, required): Doctor ID

- Request Body
  - `specialty` (string): New specialty

- Responses
  - `200 OK`: Speciality updated successfully
  - `404 Not Found`: Doctor not found

***

### [DELETE]/staff/{doctorId}

- Summary  
Delete a doctor

- Parameters  
  - `doctorId` (string, required): Doctor ID

- Responses
  - `204 No Content`: Doctor deleted successfully
  - `404 Not Found`: Doctor not found