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

/*
 * GET Login
 */
exports.login = function(req, res) {
	res.render('login', { title: 'Login' });
};

/*
 * GET Register
 */
exports.register = function(req, res) {
	res.render('register', { title: 'Registrieren' });
};

/*
 * GET Registrieren/Login
 */
exports.login_register = function(req, res) {
	res.render('login_register', { title: 'Login oder Registrieren' });
};
/*
 * Menubar
 */
exports.menubar = function(req, res) {
	res.render('lmenubar', { title: 'Menue' });
};