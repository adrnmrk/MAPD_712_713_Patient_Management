// Defines CLINICAL_DATA data

const CLINICAL_DATA_SCHEMA = {
    patientId: String,
    bp_systolic: Number,
    bp_diastolic: Number,
    respiratory_rate: Number,
    blood_oxygen_level: Number,
    pulse_rate: Number,
    is_critical_condition: Boolean
    
};

// Makes the CLINICAL_DATA visible to other files
module.exports.CLINICAL_DATA_SCHEMA = CLINICAL_DATA_SCHEMA