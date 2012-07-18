var crypto = require('crypto');
var url = require('url');

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
	db.bind('feeds', {
		findByUrl: function(feedUrl, callback) {
			this.findOne({feed_url: url.format(url.parse(feedUrl))}, callback);
		}
	});
	db.bind('articles');


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
			user: req.user
		};

		//Object.keys(req)
		//req.url

		if (req.isAuthenticated()) {
			db.feeds.find({subscribers: req.user._id}).toArray(function(err, feeds) {
				req.data.feeds = feeds;
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
		res.send('lol geht nicht');
	});

	/*
	 * GET /logout
	 */
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
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
		var params = req.body;
		// Add feed
		db.feeds.findByUrl(params.url, function(err, feed) {
			if (!feed) {
				// TODO: check if the URL is a valid feed
				// Create feed
				feed = {
					name: params.name,
					feed_url: url.format(url.parse(params.url)),
					subscribers: [req.user._id]
				};
				db.feeds.save(feed);

				// Create test articles
				var articles = [
					{
						title: 'Test 1',
						text: 'DSLR anim dreamcatcher sint dumpster incididunt. Yr chillwave DSLR street-art letterpress gentrify liberal. Farm-to-table bronson organic narwhal ethical clothesline. Frado authentic gastropub art frado kale brooklyn. Placeat authentic gluten fin liberal 8-bit.',
						published_at: new Date(2012, 2, 31),
						image: '/images/test.jpg',
						feed: feed._id
					}, {
						title: 'Test 2',
						text: 'Before 8-bit brooklyn frado trust-fund ut. Chillwave capitalism placeat vegan. Anderson moon fin totally chowder original. The sunt dumpster dumpster voluptate chowder.',
						published_at: new Date(2012, 5, 16),
						image: '/images/test.jpg',
						feed: feed._id
					}, {
						title: 'Test 3',
						text: 'Clothesline esse sriracha gluten-free farm-to-table Pinterest. Carles street-art anim anime wes. Capitalism vegan gluten-free farm-to-table wayfarers gluten-free. Sint organic chowder street-art 8-bit anim of party. Narwhal of fresh twee. Viral vegan Anderson pony Anderson.',
						published_at: new Date(2012, 3, 1),
						image: '/images/test.jpg',
						feed: feed._id
					}
				];
				db.articles.insert(articles);
			} else {
				// TODO: avoid subscribing the same user twice
				db.feeds.update({ _id: feed._id }, { '$push': { subscribers: req.user._id } });
			}
		});

		//TODO: AJAX
		res.redirect('/');
	});

	/*
	 * GET /feeds/:id
	 */
	app.get('/feeds/:id', prepareRendering, function(req, res) {
		var requestedFeed = new ObjectId(req.params.id);
		db.articles.find({feed: requestedFeed}).toArray(function(err, articles) {
			req.data.title = 'Feed';

			req.data.currentFeed = requestedFeed;
			req.data.articles = articles;
			res.render('all_articles', req.data);
		});
	});

	/*
	 * GET /articles/:id
	 */
	app.get('/articles/:id', prepareRendering, function(req, res) {
		req.data.title = 'Artikel';

		res.render('article', req.data);
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
				password: sha1('test')
			}, {
				email: 'fuhlig@stud.hs-bremen.de',
				name: 'Florian Uhlig',
				password: sha1('test')
			}, {
				email: 'magdalena.riecken@gmail.com',
				name: 'Magdalena Riecken',
				password: sha1('test')
			}]);
			res.end('Success');
		});
	});

	/* CommonJS exports
	return {
		func : function () {}
	}
	//module.func();
	*/
};