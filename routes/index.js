/*
 * GET Home
 */
exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};

/*
 * GET Login
 */
exports.login = function(req, res) {
	res.render('login', { title: 'Login' });
};

/*
 * GET Feedübersicht
 */
exports.feedOverview = function(req, res) {
	res.render('feed_uebersicht', { title: 'Feedübersicht' });	
};

/*
 * GET Feed
 */
exports.articleOverview = function(req, res) {
	res.render('artikel_uebersicht', { title: 'Artikelübersicht' });
};

/*
 * GET Feed hinzufügen
 */
exports.addFeed = function(req, res) {
	res.render('feed_hinzufuegen', { title: 'Feed hinzufügen' });
};

/*
 * GET Artikel
 */
exports.article = function(req, res) {
	res.render('artikel', { title: 'Artikel' });
};