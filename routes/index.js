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
 * GET Feed list
 */
exports.feedOverview = function(req, res) {
	res.render('feed_uebersicht', { title: 'Feedübersicht' });	
};

/*
 * GET Article list
 */
exports.articleOverview = function(req, res) {
	var data = {
		title: 'Artikelliste',
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
	res.render('artikel_uebersicht', data);
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

/*
 * Footer
 */
exports.footer = function(req, res) {
	res.render('footer', { title: 'Footer' });
};