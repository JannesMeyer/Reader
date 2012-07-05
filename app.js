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
});
app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

	app.use(express.static(public_dir));
	app.use(express.compiler({ src: public_dir, enable: ['less'] }));
});
app.configure('production', function() {
	app.use(express.errorHandler());
	
	app.use(express.static(public_dir));
	app.use(require('less-middleware')({ src: public_dir, compress: true }));
});

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
	//console.log("Server listening on port %d in %s mode", app.address().port, app.settings.env);
});