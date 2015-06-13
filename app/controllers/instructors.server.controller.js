'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Instructor = mongoose.model('Instructor'),
	_ = require('lodash');

/**
 * Create a Instructor
 */
exports.create = function(req, res) {
	var instructor = new Instructor(req.body);
	instructor.user = req.user;

	instructor.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(instructor);
		}
	});
};

/**
 * Show the current Instructor
 */
exports.read = function(req, res) {
	res.jsonp(req.instructor);
};

/**
 * Update a Instructor
 */
exports.update = function(req, res) {
	var instructor = req.instructor ;

	instructor = _.extend(instructor , req.body);

	instructor.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(instructor);
		}
	});
};

/**
 * Delete an Instructor
 */
exports.delete = function(req, res) {
	var instructor = req.instructor ;

	instructor.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(instructor);
		}
	});
};

/**
 * List of Instructors
 */
exports.list = function(req, res) { 
	Instructor.find().sort('-created').populate('user', 'displayName').exec(function(err, instructors) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(instructors);
		}
	});
};

/**
 * Instructor middleware
 */
exports.instructorByID = function(req, res, next, id) { 
	Instructor.findById(id).populate('user', 'displayName').exec(function(err, instructor) {
		if (err) return next(err);
		if (! instructor) return next(new Error('Failed to load Instructor ' + id));
		req.instructor = instructor ;
		next();
	});
};

/**
 * Instructor authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.instructor.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
