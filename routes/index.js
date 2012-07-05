module.exports = function(app, db) {
	/*
	 * Index
	 */
	app.get('/', function(req, res) {
		res.render('index', { title: 'Test' });
	});

	/*
	 * All feeds
	 */
	app.get('/feeds', function(req, res) {
		feeds = [
			{
				id: '1',
				name: 'Smashing Magazine',
				image_path: undefined
			}
		];

		// {
		// 	name: 'Smashing Magazine',
		// 	image_path: '',
		// 	url: 'http://rss1.smashingmagazine.com/feed/'
		// }

		res.render('all_feeds', { title: 'Feeds' });
	});

	/*
	 * Add feed
	 */
	app.get('/add-feed', function(req, res) {
		res.render('add_feed', { title: 'Feed hinzufügen' });
	});

	/*
	 * All articles
	 */
	app.get('/feeds/:id', function(req, res) {
		var data = {
			title: 'Artikel',
			articles: []
		};
		data.articles[0] = {
			id: 1,
			title: "Test 1",
			text: "DSLR anim dreamcatcher sint dumpster incididunt. Yr chillwave DSLR street-art letterpress gentrify liberal. Farm-to-table bronson organic narwhal ethical clothesline. Frado authentic gastropub art frado kale brooklyn. Placeat authentic gluten fin liberal 8-bit.",
			time: "1234",
			image: "/images/test.jpg"
		};
		data.articles[1] = {
			id: 2,
			title: "Test 2",
			text: "Before 8-bit brooklyn frado trust-fund ut. Chillwave capitalism placeat vegan. Anderson moon fin totally chowder original. The sunt dumpster dumpster voluptate chowder.",
			time: "1234",
			image: "/images/test.jpg"
		};
		data.articles[2] = {
			id: 3,
			title: "Test 3",
			text: "Clothesline esse sriracha gluten-free farm-to-table Pinterest. Carles street-art anim anime wes. Capitalism vegan gluten-free farm-to-table wayfarers gluten-free. Sint organic chowder street-art 8-bit anim of party. Narwhal of fresh twee. Viral vegan Anderson pony Anderson.",
			time: "1234",
			image: "/images/test.jpg"
		};

		// Render the template
		res.render('all_articles', data);
	});

	/*
	 * Article
	 */
	app.get('/articles/:id', function(req, res) {
		res.render('article', { title: 'Artikel' });
	});


	// Reset db
	app.get('/reset_db', function(req, res) {
		db.dropDatabase(function(err, result) {
			db.collection('users', function(err, userCollection) {
				//userCollection.insert([]);
				userCollection.save({
					email: 'jannes.meyer@gmail.com',
					name: 'Jannes Meyer',
					password: 'test',
					feeds: []
				});
				userCollection.save({
					email: 'fuhlig@gmail.com',
					name: 'Florian Uhlig',
					password: 'test',
					feeds: []
				});
				userCollection.save({
					email: 'fuhlig@gmail.com',
					name: 'Florian Uhlig',
					password: 'test',
					feeds: []
				});
				res.end('Success');
			});
		});
	});

	/*return {
		func : function () {}
	}*/
	//module.func();
};