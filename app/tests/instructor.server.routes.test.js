'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Instructor = mongoose.model('Instructor'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, instructor;

/**
 * Instructor routes tests
 */
describe('Instructor CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Instructor
		user.save(function() {
			instructor = {
				name: 'Instructor Name'
			};

			done();
		});
	});

	it('should be able to save Instructor instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Instructor
				agent.post('/instructors')
					.send(instructor)
					.expect(200)
					.end(function(instructorSaveErr, instructorSaveRes) {
						// Handle Instructor save error
						if (instructorSaveErr) done(instructorSaveErr);

						// Get a list of Instructors
						agent.get('/instructors')
							.end(function(instructorsGetErr, instructorsGetRes) {
								// Handle Instructor save error
								if (instructorsGetErr) done(instructorsGetErr);

								// Get Instructors list
								var instructors = instructorsGetRes.body;

								// Set assertions
								(instructors[0].user._id).should.equal(userId);
								(instructors[0].name).should.match('Instructor Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Instructor instance if not logged in', function(done) {
		agent.post('/instructors')
			.send(instructor)
			.expect(401)
			.end(function(instructorSaveErr, instructorSaveRes) {
				// Call the assertion callback
				done(instructorSaveErr);
			});
	});

	it('should not be able to save Instructor instance if no name is provided', function(done) {
		// Invalidate name field
		instructor.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Instructor
				agent.post('/instructors')
					.send(instructor)
					.expect(400)
					.end(function(instructorSaveErr, instructorSaveRes) {
						// Set message assertion
						(instructorSaveRes.body.message).should.match('Please fill Instructor name');
						
						// Handle Instructor save error
						done(instructorSaveErr);
					});
			});
	});

	it('should be able to update Instructor instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Instructor
				agent.post('/instructors')
					.send(instructor)
					.expect(200)
					.end(function(instructorSaveErr, instructorSaveRes) {
						// Handle Instructor save error
						if (instructorSaveErr) done(instructorSaveErr);

						// Update Instructor name
						instructor.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Instructor
						agent.put('/instructors/' + instructorSaveRes.body._id)
							.send(instructor)
							.expect(200)
							.end(function(instructorUpdateErr, instructorUpdateRes) {
								// Handle Instructor update error
								if (instructorUpdateErr) done(instructorUpdateErr);

								// Set assertions
								(instructorUpdateRes.body._id).should.equal(instructorSaveRes.body._id);
								(instructorUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Instructors if not signed in', function(done) {
		// Create new Instructor model instance
		var instructorObj = new Instructor(instructor);

		// Save the Instructor
		instructorObj.save(function() {
			// Request Instructors
			request(app).get('/instructors')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Instructor if not signed in', function(done) {
		// Create new Instructor model instance
		var instructorObj = new Instructor(instructor);

		// Save the Instructor
		instructorObj.save(function() {
			request(app).get('/instructors/' + instructorObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', instructor.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Instructor instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Instructor
				agent.post('/instructors')
					.send(instructor)
					.expect(200)
					.end(function(instructorSaveErr, instructorSaveRes) {
						// Handle Instructor save error
						if (instructorSaveErr) done(instructorSaveErr);

						// Delete existing Instructor
						agent.delete('/instructors/' + instructorSaveRes.body._id)
							.send(instructor)
							.expect(200)
							.end(function(instructorDeleteErr, instructorDeleteRes) {
								// Handle Instructor error error
								if (instructorDeleteErr) done(instructorDeleteErr);

								// Set assertions
								(instructorDeleteRes.body._id).should.equal(instructorSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Instructor instance if not signed in', function(done) {
		// Set Instructor user 
		instructor.user = user;

		// Create new Instructor model instance
		var instructorObj = new Instructor(instructor);

		// Save the Instructor
		instructorObj.save(function() {
			// Try deleting Instructor
			request(app).delete('/instructors/' + instructorObj._id)
			.expect(401)
			.end(function(instructorDeleteErr, instructorDeleteRes) {
				// Set message assertion
				(instructorDeleteRes.body.message).should.match('User is not logged in');

				// Handle Instructor error error
				done(instructorDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Instructor.remove().exec();
		done();
	});
});