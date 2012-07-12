// Modules
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var LessMiddleware = require('less-middleware');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;

// Start server
initializeDatabase();

// Authentication helpers
var users = [
		{ id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
	, { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

function findById(id, fn) {
	var idx = id - 1;
	if (users[idx]) {
		fn(null, users[idx]);
	} else {
		fn(new Error('User ' + id + ' does not exist'));
	}
}

function findByUsername(username, fn) {
	for (var i = 0, len = users.length; i < len; i++) {
		var user = users[i];
		if (user.username === username) {
			return fn(null, user);
		}
	}
	return fn(null, null);
}

function sha1(str) {
	var shasum = crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex');
}

// Create a MongoDB connection, if successful continue with
function initializeDatabase() {
	//var FeedProvider = require('./providers/feed_provider');

	// Persistence
	var client = new Db('reader', new Server('127.0.0.1', 27017, {}));
	client.open(function(err, db) {
		console.log('Connected to MongoDB');

		// Authentication
		db.collection('users', function(err, users) {
			if (err) {
				console.log('Couldn\'t find the users collection');
				return;
			}

			// Setup user object serialiation/deserialization
			passport.serializeUser(function(user, done) {
				done(null, user._id);
			});
			passport.deserializeUser(function(id, done) {
				users.findOne({_id: new ObjectID(id)}, function(err, user) {
					done(err, user);
				});
			});

			// Use the LocalStrategy within Passport
			function verifyLogin(username, password, done) {
				console.log('Trying to login as %s (password: %s)', username, password);

				// Find the user by username.  If there is no user with the given
				// username, or the password is not correct, set the user to `false` to
				// indicate failure and set a flash message.  Otherwise, return the
				// authenticated `user`.
				users.findOne({email: username}, function(err, user) {
					if (err) {
						// Database error
						return done(err);
					}
					if (!user) {
						// User not found
						return done(null, false, { message: 'Unknown user ' + username });
					}
					if (user.password != sha1(password)) {
						// Password incorrect
						return done(null, false, { message: 'Invalid password' });
					}
					// Success!
					return done(null, user);
				});
			}
			passport.use(new LocalStrategy(verifyLogin));

			// Initialize Express.js
			initializeHttpServer(db); // continue here
		});
	});
}

function initializeHttpServer(db) {
	// Create a server object
	var app = express.createServer();

	// Configure the Express.js server
	var publicDir = __dirname + '/public';
	app.configure(function() {
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.session({ secret: 'keyboard cat' }));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(app.router);
	});
	// Additional settings for development
	app.configure('development', function() {
		//app.use(express.logger());
		app.use(LessMiddleware({ src: publicDir, force: true }));
		app.use(express.static(publicDir));
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});
	// Additional settings for production
	app.configure('production', function() {
		app.use(LessMiddleware({ src: publicDir, compress: true }));
		var oneYear = 31557600000;
		app.use(express.static(publicDir, { maxAge: oneYear }));
		app.use(express.errorHandler());
	});

	// Setup routes
	require('./routes')(app, db, passport);

	// Start server
	app.listen(3000, function() {
		console.log("%s server on http://localhost:%d/", app.settings.env, app.address().port);
	});
}