let SERVER_NAME = "patient-api";
let PORT = 3000;
let HOST = "127.0.0.1";

// get PATIENT_SCHEMA from ./Patient.js file
const { PATIENT_SCHEMA } = require("./Patient");
// get CLINICAL_DATA_SCHEMA from ./ClinicalData.js file
const { CLINICAL_DATA_SCHEMA } = require("./ClinicalData");

const mongoose = require("mongoose");

let uristring = "mongodb://127.0.0.1:27017/data";

// Makes db connection asynchronously
mongoose.connect(uristring, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  // we're connected!
  console.log("!!!! Connected to db: " + uristring);
});

/******
 * Creating a new model
 ******/
// Instead of defining schema here like "{firstname: String, age: number}", use constant PATIENT_SCHEMA from ./Patient.js
const patientSchema = new mongoose.Schema(PATIENT_SCHEMA);
const clinicalDataSchema = new mongoose.Schema(CLINICAL_DATA_SCHEMA);

// Compiles the schema into a model, 
//opening (or creating, if nonexistent) the 'Patients' collection in the MongoDB database
let PatientsModel = mongoose.model("Patients", patientSchema);
let ClinicalDataModel = mongoose.model("Patients/:id/ClinicalData", clinicalDataSchema);
/******
 * END Creating an new model
 ******/

let restify = require("restify"),
  // Create the restify server
  server = restify.createServer({ name: SERVER_NAME });

server.listen(PORT, HOST, function () {
  console.log("Server %s listening at %s", server.name, server.url);
  console.log("**** Resources: ****");
  console.log("********************");
  console.log(" /patients");
  console.log(" /patients/:id");
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

  PatientsModel.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
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

// Endpoint to add clinical data for a specific patient
server.post("/patients/:id/clinicaldata", function (req, res, next) {
  console.log("POST /patients/:id/clinicaldata params=>" + JSON.stringify(req.params));
  console.log("POST /patients/:id/clinicaldata body=>" + JSON.stringify(req.body));

      let newClinicalData = new ClinicalDataModel(req.body);
      newClinicalData.patientId = req.params.id
      
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
  // ClinicalDataModel.findBy(req.params.id)
  //   .then((patient) => {
  //     if (!patient) {
  //       res.send(404, "Patient not found");
  //       return next();
  //     }

  //   })
  //   .then((updatedPatient) => {
  //     res.send(201, "Clinical data added to patient: " + updatedPatient._id);
  //     return next();
  //   })
  //   .catch((error) => {
  //     console.log("error: " + error);
  //     return next(new Error(JSON.stringify(error.errors)));
  //   });
});

// Retrieve all clinical data for a specific patient
server.get("/patients/:id/clinicaldata", function (req, res, next) {
  console.log("GET /patients/:id/clinicaldata params=>" + JSON.stringify(req.params));

  ClinicalDataModel.find({patientId: req.params.id})
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
server.del("/patients/:id/clinicaldata/:clinicalDataId", function (req, res, next) {
  console.log("DELETE /patients/:id/clinicaldata/:clinicalDataId params=>" + JSON.stringify(req.params));

  PatientsModel.findById(req.params.id)
    .then((patient) => {
      if (!patient) {
        res.send(404, "Patient not found");
        return next();
      }

      // Remove the specified clinical data from the patient's records by its index
      const index = patient.clinicalData.findIndex(data => data._id == req.params.clinicalDataId);
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
      res.send(200, "Clinical data deleted from patient: " + updatedPatient._id);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});

