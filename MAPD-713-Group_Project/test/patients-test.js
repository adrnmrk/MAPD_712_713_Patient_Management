const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);
const uri = "http://127.0.0.1:3000";

describe("GET method to /patients and /patients/critical", function () {
  // Test case for /patients and patients/critical endpoints
  it("should return HTTP 200 and a valid response body for /patients", function (done) {
    chai
      .request(uri)
      .get("/patients")
      .end(function (err, res) {
        if (err) {
          done(err);
          return;
        }

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  // Test case for /patients/critical endpoint
  it("should return HTTP 200 and a valid response body for /patients/critical", function (done) {
    chai
      .request(uri)
      .get("/patients/critical")
      .end(function (err, res) {
        if (err) {
          done(err);
          return;
        }

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });

  // Test case for adding a new patient, then immediately delete it after confirming it's been added
  describe("POST method to add a record in /patients + DELETE method to delete the created record", function () {
    let generatedId; // Variable to store the generated patient ID

    it("should create a new patient with HTTP 201 and non-empty fields", function (done) {
      // Define the patient data for the POST request
      const newPatientData = {
        firstName: "Thomas Neo",
        lastName: "Anderson",
        dateOfBirth: "1980-01-01",
        age: 43,
        gender: "Male",
        height: 180,
        weight: 80,
        address: "123 Main St",
        city: "Edmonton",
        province: "Alberta",
        postalCode: "12345",
        contactNumber: "123-456-7890",
        email: "john.doe@example.com",
        identification: "ID123456",
        identificationType: "Driver's License",
        purposeOfVisit: "Routine Checkup",
        primaryCarePhysician: "Dr. Agent Smith",
        physicianContactNumber: "987-654-3210",
        listOfAllergies: "Blue Pill",
        currentMedications: "Red Pill",
        medicalConditions: "Hypertension",
        insuranceProvider: "HealthInsure",
        insuranceIdNumber: "HI123456",
        insuranceContactNumber: "800-123-4567",
        emergencyContactPerson: "Trinity",
        emergencyContactNumber: "555-555-5555",
      };

      // POST Request to create a new patient
      chai
        .request(uri)
        .post("/patients")
        .send(newPatientData)
        .end(function (err, res) {
          if (err) {
            done(err);
            return;
          }

          // Confirm that the patient is successfully created
          expect(res.status).to.equal(201);
          expect(res.body).to.have.property("_id").that.is.a("string");

          // Store the generated patient ID for later use
          generatedId = res.body._id;
          console.log(`Generated Unique Patient ID: ${generatedId}`);

          done();
        });
    });
    // Step 2: Delete the recently created patient
    it("should delete the recently created patient with HTTP 200", function (done) {
      // Ensure that the patient ID is generated before attempting to delete
      if (!generatedId) {
        done(new Error("No generated ID found"));
        return;
      }

      // DELETE Request to delete the patient
      chai
        .request(uri)
        .delete(`/patients/${generatedId}`)
        .end(function (err, res) {
          if (err) {
            done(err);
            return;
          }

          // Confirm that the patient is successfully deleted
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.include({ _id: generatedId });

          console.log(`Patient ${generatedId} deleted successfully`);

          done();
        });
    });
    // Step 3: Confirm that the recently deleted patient no longer exists
    it("should return HTTP 404 when you search for the deleted record", function (done) {
      // Ensure that the patient ID is generated before attempting to confirm deletion
      if (!generatedId) {
        done(new Error("No generated ID found"));
        return;
      }

      // GET Request to confirm that the patient doesn't exist after deletion
      chai
        .request(uri)
        .get(`/patients/${generatedId}`)
        .end(function (err, res) {
          // Confirm that the patient returns HTTP 404 after deletion, to fail check for 200 instead
          expect(res.status).to.equal(404);
          //expect(res.status).to.equal(200);
          console.log(`Patient ${generatedId} is not found`);

          done();
        });
    });
  });
});
