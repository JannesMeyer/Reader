// Modules
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var LessMiddleware = require('less-middleware');
var mongo = require('mongoskin');
var ObjectID = require('mongodb').ObjectID;

// Start server
initializeDatabase();

// Create a MongoDB connection, if successful continue with
function initializeDatabase() {
	//var FeedProvider = require('./providers/feed_provider');

	// Persistence
	var db = mongo.db('127.0.0.1:27017/reader?auto_reconnect');
	db.bind('users');

	// Setup user object serialiation/deserialization
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});
	passport.deserializeUser(function(id, done) {
		db.users.findById(id, function(err, user) {
			done(err, user);
		});
		/*db.users.findOne({_id: new ObjectID(id)}, function(err, user) {
			done(err, user);
		});*/
	});

	// Authentication helper
	function checkPassword(user, password) {
		var shasum = crypto.createHash('sha1');
		shasum.update(password);
		var hashedPassword = shasum.digest('hex');
		return user.password === hashedPassword;
	}

	// Use the LocalStrategy within Passport
	function verifyLogin(username, password, done) {
		console.log('Trying to login as %s (password: %s)', username, password);

		// Find the user by username.  If there is no user with the given
		// username, or the password is not correct, set the user to `false` to
		// indicate failure and set a flash message.  Otherwise, return the
		// authenticated `user`.
		db.users.findOne({email: username}, function(err, user) {
			if (err) {
				// Database error
				return done(err);
			}
			if (!user) {
				// User not found
				return done(null, false, { message: 'Unknown user ' + username });
			}
			if (!checkPassword(user, password)) {
				// Password incorrect
				return done(null, false, { message: 'Invalid password' });
			}
			// Success!
			return done(null, user);
		});
	}
	passport.use(new LocalStrategy(verifyLogin));

	initializeHttpServer(db); // continue here
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