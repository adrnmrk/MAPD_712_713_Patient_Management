const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);
const uri = "http://127.0.0.1:3000";

describe("Successful 'GET' Requests to /patients and /patients/critical", function () {
  // Test case for /patients endpoint
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
  describe("POST Requests to add a record in /patients, then delete it after", function () {
    it("should create a new patient with HTTP 201 and non-empty and valid fields, then delete with HTTP 200", function (done) {
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

    chai
      .request(uri)
      .post("/patients")
      .send(newPatientData)
      .end(function (err, res) {
        if (err) {
          done(err);
          return;
        }

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("_id").that.is.a("string");

        const generatedId = res.body._id;

        // DELETE Request to /patients/:id
        chai
          .request(uri)
          .delete(`/patients/${generatedId}`)
          .end(function (err, res) {
            if (err) {
              done(err);
              return;
            }

            expect(res.status).to.equal(200);
            expect(res.body).to.deep.include({ _id: generatedId });
            
            console.log(`Generated Unique Patient ID: ${generatedId}`);
            console.log(`Patient ${generatedId} deleted successfully`);

            // POST Request to /patients
            chai
              .request(uri)
              .post("/patients")
              .send(newPatientData)
              .end(function (err, res) {
                if (err) {
                  done(err);
                  return;
                }

                // Confirm that the recently deleted patient ID is not present in the new POST response
                expect(res.status).to.equal(201);
                expect(res.body).to.have.property("_id").that.is.a("string");
                const newGeneratedId = res.body._id;

                expect(newGeneratedId).to.not.equal(generatedId);

                done();
              });
          });
      });
  });
});
});