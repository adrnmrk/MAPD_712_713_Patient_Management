let SERVER_NAME = "patient-api";
let PORT = 3000;
let HOST = "127.0.0.1";
const dbConfig = require("./dbConfig");

// Connect to the database
dbConfig.connectDB();

// Create models after the database connection is established
const { PatientsModel, ClinicalDataModel } = dbConfig.createModels();

let restify = require("restify"),
  // Create the restify server
  server = restify.createServer({ name: SERVER_NAME });

server.listen(PORT, HOST, function () {
  console.log("Server %s listening at %s", server.name, server.url);
  console.log("**** Resources: ****");
  console.log("********************");
  console.log(" /patients");
  console.log(" /patients/:id");
  console.log(" /patients/:id/clinicaldata");
  console.log(" /patients/critical");
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all patients in the system
server.get("/patients", function (req, res, next) {
  console.log("GET /patients params=>" + JSON.stringify(req.params));

  // Find every entity in db
  PatientsModel.find({})
    .then((patients) => {
      // Return all of the users in the system
      res.send(patients);
      return next();
    })
    .catch((error) => {
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Get a single patient by their patient id
server.get("/patients/:id", function (req, res, next) {
  console.log("GET /patients/:id params=>" + JSON.stringify(req.params));

  // Find a single user by their id in db
  PatientsModel.findOne({ _id: req.params.id })
    .then((patient) => {
      console.log("found user: " + patient);
      if (patient) {
        // Send the user if no issues
        res.send(patient);
      } else {
        // Send 404 header if the user doesn't exist
        res.send(404);
      }
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Create a new patient
server.post("/patients", function (req, res, next) {
  console.log("POST /patients params=>" + JSON.stringify(req.params));
  console.log("POST /patients body=>" + JSON.stringify(req.body));

  // Assuming the request body contains all the fields defined in the schema
  // BEFORE: new PatientsModel({first: req.body.name, age: req.body.age})

  let newPatient = new PatientsModel(req.body); // Assuming all fields are in the body

  // Create the patient and save to db
  newPatient
    .save()
    .then((patient) => {
      console.log("saved user: " + patient);
      // Send the user if no issues
      res.send(201, patient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});
// Update user with the given id
server.put("/patients/:id", function (req, res, next) {
  console.log("PUT /patients params=>" + JSON.stringify(req.params));
  console.log("PUT /patients body=>" + JSON.stringify(req.body));

  PatientsModel.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
  })
    .then((updatedPatient) => {
      if (updatedPatient) {
        res.send(200, updatedPatient);
        console.log("updated patient: " + updatedPatient);
      } else {
        res.send(404, "Patient not found");
      }
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});
//function to update patient record
async function updatePatient(patientId, updateFields) {
  try {
    const patient = await PatientsModel.findByIdAndUpdate(
      patientId,
      updateFields,
      { new: true }
    );
    return patient;
  } catch (error) {
    console.error(`Error while updating ${updateFields} for patient:`, error);
    throw error;
  }
}

// Delete user with the given id
server.del("/patients/:id", function (req, res, next) {
  console.log("DELETE /patients params=>" + JSON.stringify(req.params));
  // Delete the user in db
  PatientsModel.findOneAndDelete({ _id: req.params.id })
    .then((deletedUser) => {
      if (deletedUser) {
        res.send(200, deletedUser);
        console.log("deleted patient: " + deletedUser);
      } else {
        res.send(404, "Patient not found");
      }
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Add clinical data for a specific patient and update the is_patient_critical for both clinical data and patient record
server.post("/patients/:id/clinicaldata", function (req, res, next) {
  console.log(
    "POST /patients/:id/clinicaldata params=>" + JSON.stringify(req.params)
  );
  console.log(
    "POST /patients/:id/clinicaldata body=>" + JSON.stringify(req.body)
  );

  //create new record for a specific patient
  let newClinicalData = new ClinicalDataModel(req.body);
  newClinicalData.patientId = req.params.id;

  // Extract measurements from the request body
  const {
    bp_systolic,
    bp_diastolic,
    respiratory_rate,
    blood_oxygen_level,
    pulse_rate,
  } = req.body;

  // Determine critical condition based on measurements
  if (
    bp_systolic > 180 ||
    bp_diastolic > 120 ||
    respiratory_rate > 30 ||
    blood_oxygen_level < 90 ||
    pulse_rate > 120
  ) {
    newClinicalData.is_critical_condition = true;
  } else {
    newClinicalData.is_critical_condition = false;
  }
  //update is_critical based on latest measurement
  updatePatient(newClinicalData.patientId, {
    is_patient_critical: newClinicalData.is_critical_condition,
  });
  newClinicalData
    .save()
    .then((patient) => {
      console.log("saved clinical data: " + patient);
      // Send the user if no issues
      res.send(201, patient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Retrieve all clinical data for a specific patient
server.get("/patients/:id/clinicaldata", function (req, res, next) {
  console.log(
    "GET /patients/:id/clinicaldata params=>" + JSON.stringify(req.params)
  );

  ClinicalDataModel.find({ patientId: req.params.id })
    .then((clinicalData) => {
      if (!clinicalData) {
        res.send(404, "Patient not found");
        return next();
      }

      res.send(clinicalData); // Send the clinical data for the patient
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

// Delete specific clinical data for a patient by ID
server.del(
  "/patients/:id/clinicaldata/:clinicalDataId",
  function (req, res, next) {
    console.log(
      "DELETE /patients/:id/clinicaldata/:clinicalDataId params=>" +
        JSON.stringify(req.params)
    );

    PatientsModel.findById(req.params.id)
      .then((patient) => {
        if (!patient) {
          res.send(404, "Patient not found");
          return next();
        }

        // Remove the specified clinical data from the patient's records by its index
        const index = patient.clinicalData.findIndex(
          (data) => data._id == req.params.clinicalDataId
        );
        if (index !== -1) {
          patient.clinicalData.splice(index, 1);
        } else {
          res.send(404, "Clinical data not found");
          return next();
        }

        // Save the updated patient document
        return patient.save();
      })
      .then((updatedPatient) => {
        res.send(
          200,
          "Clinical data deleted from patient: " + updatedPatient._id
        );
        return next();
      })
      .catch((error) => {
        console.log("error: " + error);
        return next(new Error(JSON.stringify(error.errors)));
      });
  }
);

// Retrieve patients in critical condition based on their latest clinical data
server.get("/patients/critical", async function (req, res) {
  try {
    const latestRecords = await ClinicalDataModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$patientId",
          latestRecord: { $first: "$$ROOT" },
        },
      },
    ]);

    const criticalPatients = [];

    for (const record of latestRecords) {
      const { patientId, is_critical_condition } = record.latestRecord;

      if (is_critical_condition) {
        const patient = await PatientsModel.findOne({ _id: patientId });
        criticalPatients.push(patient);
      }
    }

    res.send(criticalPatients); // Send the list of patients in critical condition
  } catch (error) {
    console.log("error: " + error);
    res.send(500, "Internal Server Error");
  }
});
