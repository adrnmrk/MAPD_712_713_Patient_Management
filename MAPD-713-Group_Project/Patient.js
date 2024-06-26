const mongoose = require('mongoose');

// Defines Patient data
const PATIENT_SCHEMA = {
    firstName: String,
    lastName: String,
    dateOfBirth: Date, //YYYY-MM-DD format
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    address: String,
    city: String,
    province: String,
    postalCode: String,
    contactNumber: String,
    email: String,
    identification: String,
    identificationType: String,
    purposeOfVisit: String,
    primaryCarePhysician: String,
    physicianContactNumber: String,
    listOfAllergies: String,
    currentMedications: String,
    medicalConditions: String,
    insuranceProvider: String,
    insuranceIdNumber: String,
    insuranceContactNumber: String,
    emergencyContactPerson: String,
    emergencyContactNumber: String,
    is_patient_critical: Boolean

};

// Makes the PATIENT_SCHEMA visible to other files
module.exports.PATIENT_SCHEMA = PATIENT_SCHEMA