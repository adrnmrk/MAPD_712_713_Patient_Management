let SERVER_NAME = "patient-api";
let PORT = 3000;
let HOST = "127.0.0.1";

// get PATIENT_SCHEMA from ./Patient.js file
const { PATIENT_SCHEMA } = require("./Patient");
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
 * Creating an new model
 ******/
// Instead of defining schema here like "{firstname: String, age: number}", use constant PATIENT_SCHEMA from ./Patient.js
const patientSchema = new mongoose.Schema(PATIENT_SCHEMA);

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patients' collection in the MongoDB database
let PatientsModel = mongoose.model("Patients", patientSchema);
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

// Get all users in the system
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

// Create a new user
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

// Delete user with the given id
server.del("/patients/:id", function (req, res, next) {
  console.log("POST /patients params=>" + JSON.stringify(req.params));
  // Delete the user in db
  PatientsModel.findOneAndDelete({ _id: req.params.id })
    .then((deletedUser) => {
      console.log("deleted patient: " + deletedUser);
      if (deletedUser) {
        res.send(200, deletedUser);
      } else {
        res.send(404, "Patient not found");
      }
      return next();
    })
    .catch(() => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
});
