'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var instructors = require('../../app/controllers/instructors.server.controller');

	// Instructors Routes
	app.route('/instructors')
		.get(instructors.list)
		.post(users.requiresLogin, instructors.create);

	app.route('/instructors/:instructorId')
		.get(instructors.read)
		.put(users.requiresLogin, instructors.hasAuthorization, instructors.update)
		.delete(users.requiresLogin, instructors.hasAuthorization, instructors.delete);

	// Finish by binding the Instructor middleware
	app.param('instructorId', instructors.instructorByID);
};
