// Module dependencies
var express = require('express');
var routes = require('./routes');

// Create server object
var app = module.exports = express.createServer();

// Configuration
var public_dir = __dirname + '/public';
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	
	app.use(app.router);
	app.use(require('less-middleware')({ src: public_dir, compress: true, force: true }));
	app.use(express.static(public_dir));
});
app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
	app.use(express.errorHandler());
});

// Persistence
//var feedProvider = new FeedProvider();

// Routes
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/login_register', routes.login_register);
app.get('/feeds', routes.feedOverview);
app.get('/feeds/:id', routes.articleOverview);
app.get('/add-feed', routes.addFeed);
app.get('/articles/:id', routes.article);

// Start server
app.listen(3000, function() {
	console.log("%s server on http://localhost:%d/", app.settings.env, app.address().port);
});