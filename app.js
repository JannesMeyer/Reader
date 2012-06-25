// Module dependencies
var express = require('express');
var routes = require('./routes');

// Create server object
var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});
app.configure('production', function() {
	app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/feeds', routes.feedOverview);
app.get('/feed/:id', routes.articleOverview);
app.get('/add-feed', routes.addFeed);
app.get('/article/:id', routes.article);

// Start server
app.listen(3000, function() {
	//console.log("Server listening on port %d in %s mode", app.address().port, app.settings.env);
});