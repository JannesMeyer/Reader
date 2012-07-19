var crypto = require('crypto');
var check = require('validator').check;
var sanitize = require('validator').sanitize;

var FeedService = require('../FeedService');

function sha1(str) {
	var shasum = crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex');
}

// Export a function that defines our routes
module.exports = function(app, db, passport) {
	// Setup the database
	var ObjectId = db.ObjectID;
	db.bind('users');
	db.bind('articles');

	// Initialize services
	var feedService = new FeedService(db);


	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	}

	// Simple middle to do some setup
	function prepareRendering(req, res, next) {
		// Create the data object
		req.data = {
			title: 'inForm',
			user: req.user,
			settings: {
				dark: false
			}
		};

		//Object.keys(req)
		//req.url

		if (req.isAuthenticated()) {
			db.feeds.find({subscribers: req.user._id}).toArray(function(err, feeds) {
				req.data.feeds = feeds;
				req.data.settings.dark = req.user.settings.dark;
				// Continue to the regular routes
				next();
			});
		} else {
			// Continue to the regular routes
			next();
		}
	}

	/*
	 * GET /
	 */
	app.get('/', ensureAuthenticated, prepareRendering, function(req, res) {
		req.data.title = 'Feeds';
		req.data.noimages = sanitize(req.query.noimages).toBoolean();

		if (req.user) {
			// Logged in; we already have all feeds in the data object
			res.render('all_feeds', req.data);
		} else {
			// Not logged in; show different page
			res.render('start', req.data);
		}
	});

	/*
	 * GET /login
	 * (auch als modaler Dialog eingebunden)
	 */
	app.get('/login', prepareRendering, function(req, res) {
		req.data.title = 'Einloggen';
		req.data.message = req.flash('error');

		res.render('login', req.data);
	});

	/*
	 * POST /login
	 */
	var passportAuth = passport.authenticate('local', { failureRedirect: '/login', failureFlash: true });
	app.post('/login', passportAuth, function(req, res) {
		res.redirect('/');
	});

	/*
	 * GET /register
	 * (auch als modaler Dialog eingebunden)
	 */
	app.get('/register', prepareRendering, function(req, res) {
		req.data.title = 'Registrieren';
		req.data.message = req.flash('error');

		res.render('register', req.data);
	});

	/*
	 * POST /register
	 */
	app.post('/register', prepareRendering, function(req, res) {
		req.data.title = 'Registrieren';
		req.data.message = req.flash('error');

		// Full name
		var name = sanitize(req.body.fullname).trim();
		var name = sanitize(name).xss();
		// Username
		var username = sanitize(req.body.username).trim();
		var username = sanitize(username).xss();
		// Password
		var password = sanitize(req.body.password).trim();
		var password = sanitize(password).xss();
		// Password repetition
		var password2 = sanitize(req.body.confirm_password).trim();
		var password2 = sanitize(password2).xss();

		// Check username
		try {
			check(username).len(5, 100).isEmail();
		} catch (e) {
			req.flash('error', 'Invalid email address');
			res.render('register', req.data);
			return;
		}

		// Check if the user already exists
		db.users.findOne({email: username}, function(err, user) {
			if (user) {
				req.flash('error', 'User already exists');
				res.render('register', req.data);
				return;
			}
			// User doesn't exist yet, check for passwords to be equal
			if (password !== password2) {
				req.flash('error', 'Passwords don\'t match');
				res.render('register', req.data);
				return;
			}

			// Create a new user
			db.users.save({
				email: username,
				name: name,
				password: sha1(password),
				favorites: [],
				settings: {
					dark: false
				}
			});

			console.log('Registered ' + username);
			res.redirect('/login');
		});
	});

	/*
	 * GET /logout
	 */
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/*
	 * POST /settings
	 */
	app.post('/settings', function(req, res) {
		db.users.findById(req.user._id, function(err, user) {
			user.settings.dark = sanitize(req.body.dark).toBoolean();
			db.users.save(user);
		});
		res.send('Success');
	});

	/*
	 * GET /add-feed
	 * (auch als modaler Dialog eingebunden)
	 */
	app.get('/add-feed', ensureAuthenticated, prepareRendering, function(req, res) {
		req.data.title = 'Feed hinzufügen';

		res.render('add_feed', req.data);
	});

	/*
	 * POST /add-feed
	 */
	app.post('/add-feed', ensureAuthenticated, function(req, res) {
		var success = function(feed) {
			//TODO: AJAX
			res.redirect('/');
		};
		// Subscribe to the feed
		feedService.subscribe(req.body.url, req.body.name, req.body.color, req.user, success);
	});

	/*
	 * GET /feeds
	 */
	app.get('/feeds', function(req, res) {
		res.redirect('/');
	});

	/*
	 * GET /feeds/:id
	 */
	app.get('/feeds/:id', prepareRendering, function(req, res) {
		var requestedFeed = new ObjectId(req.params.id);
		db.articles.find({feed: requestedFeed}).toArray(function(err, articles) {
			db.feeds.findById(requestedFeed, function(err, feed) {
				req.data.title = feed.title;
				req.data.currentFeed = feed;
				req.data.articles = articles;

				res.render('all_articles', req.data);
			});
		});
	});

	/*
	 * GET /articles/:id
	 */
	app.get('/articles/:id', prepareRendering, function(req, res) {
		// Find article
		db.articles.findById(req.params.id, function(err, article) {
			if (err) return;

			// Find all articles in that feed
			db.articles.find({feed: article.feed}).toArray(function(err, articles) {
				if (err) return;

				// Find feed
				db.feeds.findById(article.feed, function(err, feed) {
					if (err) return;

					req.data.title = article.title;
					req.data.currentFeed = feed;
					req.data.articles = articles;
					req.data.article = article;

					res.render('article', req.data);
				});
			});
		});
	});


	/*
	 * GET /reset_db
	 */
	app.get('/reset_db', function(req, res) {
		db.dropDatabase(function(err, result) {
			// Create users
			db.users.insert([{
				email: 'jannes.meyer@gmail.com',
				name: 'Jannes Meyer',
				password: sha1('test'),
				favorites: [],
				settings: {
					dark: false
				}
			}, {
				email: 'fuhlig@stud.hs-bremen.de',
				name: 'Florian Uhlig',
				password: sha1('test'),
				favorites: [],
				settings: {
					dark: false
				}
			}, {
				email: 'magdalena.riecken@gmail.com',
				name: 'Magdalena Riecken',
				password: sha1('test'),
				favorites: [],
				settings: {
					dark: false
				}
			}]);
			res.end('Success');
		});
	});

};