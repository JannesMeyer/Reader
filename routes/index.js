var crypto = require('crypto');
var url = require('url');

function sha1(str) {
	var shasum = crypto.createHash('sha1');
	shasum.update(str);
	return shasum.digest('hex');
}

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

// Export a function that defines our routes
module.exports = function(app, db, passport) {
	var ObjectId = db.ObjectID;
	db.bind('users');
	db.bind('feeds', {
		findByUrl: function(feedUrl, callback) {
			this.findOne({feed_url: url.format(url.parse(feedUrl))}, callback);
		}
	});
	db.bind('articles');
	

	/*
	 * GET /
	 */
	app.get('/', function(req, res) {
		var data = {
			title: 'Feeds',
			user: req.user
		};
		if (req.user) {
		// Logged in; get all feeds
		db.feeds.find({subscribers: req.user._id}).toArray(function(err, feeds) {
			data.feeds = feeds;
			res.render('all_feeds', data);
		});
		} else {
		// Not logged in; show different page
		res.render('index', data);
		}
	});

	/*
	 * GET /login
	 */
	app.get('/login', function(req, res) {
		var data = {
			title: 'Einloggen',
			user: req.user,
			message: req.flash('error')
		};
		res.render('login', data);
	});

	/*
	 * POST /login
	 */
	var loginAuth = passport.authenticate('local', { failureRedirect: '/login', failureFlash: true });
	app.post('/login', loginAuth, function(req, res) {
		res.redirect('/');
	});

	/*
	 * GET /register
	 */
	app.get('/register', function(req, res) {
		var data = {
			title: 'Registrieren',
			user: req.user,
			message: req.flash('error')
		};
		res.render('register', data);
	});

	/*
	 * GET /register
	 */
	app.get('/register', function(req, res) {
		console.log('register');
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
	 */
	app.get('/add-feed', ensureAuthenticated, function(req, res) {
		var data = {
			title: 'Feed hinzufügen',
			user: req.user
		};
		res.render('add_feed', data);
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
	app.get('/feeds/:id', function(req, res) {
		var data = {
			title: 'Artikel',
			user: req.user
		};
		db.articles.find({feed: req.params.id}).toArray(function(err, articles) {
			data.articles = articles;
			console.log(articles);
			// Render the template
			res.render('all_articles', data);
		});
	});

	/*
	 * GET /articles/:id
	 */
	app.get('/articles/:id', function(req, res) {
		var data = {
			title: 'Artikel',
			user: req.user
		};
		res.render('article', data);
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