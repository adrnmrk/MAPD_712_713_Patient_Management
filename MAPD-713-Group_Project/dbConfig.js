const mongoose = require("mongoose");
const { PATIENT_SCHEMA } = require("./Patient");
const { CLINICAL_DATA_SCHEMA } = require("./ClinicalData");

const username = "admin-01";
const password = "abcd1234";
const dbname = "Cluster09255";
const uristring = `mongodb+srv://${username}:${password}@cluster09255.ediwzjm.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const dbConfig = {
  connectDB: async () => {
    try {
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
