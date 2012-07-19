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
	app.get('/', prepareRendering, function(req, res) {
		req.data.title = 'Feeds';

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
	app.post('/register', function(req, res) {
		res.send('geht nicht');
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
			req.data.title = 'Feed';
			req.data.currentFeed = {_id: requestedFeed};
			req.data.articles = articles;

			res.render('all_articles', req.data);
		});
	});

	/*
	 * GET /articles/:id
	 */
	app.get('/articles/:id', prepareRendering, function(req, res) {
		db.articles.findById(req.params.id, function(err, article) {
			if (err) return;
			
			db.feeds.findById(article.feed, function(err, feed) {
				if (err) return;



				req.data.title = article.title;
				req.data.currentFeed = feed;
				req.data.article = article;

				res.render('article', req.data);
			})
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