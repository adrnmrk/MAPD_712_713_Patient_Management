const mongoose = require("mongoose");
const { PATIENT_SCHEMA } = require("./Patient");
const { CLINICAL_DATA_SCHEMA } = require("./ClinicalData");

// Database configuration
const dbConfig = {
  connectDB: async () => {
    try {
      const uristring = "mongodb://127.0.0.1:27017/data";
      await mongoose.connect(uristring, { useNewUrlParser: true });
      console.log("Connected to the database");
    } catch (error) {
      console.error("Database connection error:", error);
    }
  },

  createModels: () => {
    const patientSchema = new mongoose.Schema(PATIENT_SCHEMA, { timestamps: true });
    const clinicalDataSchema = new mongoose.Schema(CLINICAL_DATA_SCHEMA, {
      timestamps: true,
    });

    const PatientsModel = mongoose.model("Patients", patientSchema);
    const ClinicalDataModel = mongoose.model("Patients/:id/ClinicalData", clinicalDataSchema);

    return { PatientsModel, ClinicalDataModel };
  },
};

module.exports = dbConfig;
