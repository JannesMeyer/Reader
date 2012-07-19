var url = require('url');
var FeedParser = require('feedparser');
var parser = new FeedParser();

// Log output
function debugLog(message) {
	console.log('FeedService: ' + message);
}


/*
 * FeedService
 *
 * This is a service class that help you with feed management
 */
var FeedService = function(db) {
	this.db = db;
	this.ObjectId = db.ObjectID;

	// Bind 
	this.db.bind('feeds', {
		findByUrl: function(feedUrl, callback) {
			this.findOne({feed_url: url.format(url.parse(feedUrl))}, callback);
		},
		findById: function(feedId, callback) {
			this.findOne({_id: new this.ObjectId(feedId)}, callback);
		}
	});
};

// Subscribe a user to a feed
FeedService.prototype.subscribe = function(feedUrl, title, color, user, callback) {
	var db = this.db;
	var _this = this;
	// Normalize the url
	var feedUrl = url.format(url.parse(feedUrl));
	debugLog('Subscribing to ' + feedUrl);

	// Subscribe to an existing feed
	var subscribe = function(err, feed) {
		if (err) {
			callback(err);
			return;
		}

		// TODO: avoid subscribing the same user twice (non-critical)
		// TODO: custom title, color for each user (non-critical)
		db.feeds.update({ _id: feed._id }, { '$push': { subscribers: user._id } });

		debugLog('Subscribed to ' + feed.title);

		// Success
		callback(null, feed);
	}

	// Check if the url already exists in the database
	db.feeds.findByUrl(feedUrl, function(err, feed) {
		if (!feed) {
			debugLog('Feed doesn\'t exist yet, have to create a new one');
			// Create feed before subscribing
			_this.add(feedUrl, subscribe);
		} else {
			debugLog('Subscribing to an existing feed');
			// Subscribe
			subscribe(null, feed);
		}
	});
};

// Create a new feed object without subscribers
FeedService.prototype.add = function(feedUrl, callback) {
	var _this = this;
	debugLog('Trying to get the feed');

	// Load articles
	parser.parseUrl(feedUrl, function(err, meta, articles) {
		// TODO: Error handling in a better manner
		if (err) {
			// Invalid feed URL
			callback(err);
			return;
		}
		// Create feed
		var feed = {
			title: meta.title,
			link: meta.link,
			feed_url: feedUrl,
			xml_url: meta.xmlUrl,
			image_path: meta.image.url,
			subscribers: []
		};
		_this.db.feeds.save(feed);

		articles.forEach(function (article) {
			// Add one article
			debugLog('Saving article');
			_this.addArticle(feed, {
				title: article.title,
				text: article.summary,
				link: article.link,
				published_at: article.pubdate,
				image: '/images/test.jpg'
			});
		});

		// Done
		callback(null, feed);
	});
};

/*
 * Adds some sample articles to a feed
 */
FeedService.prototype.addSampleData = function(feed) {
	// Just load sample data
	this.addArticle(feed, {
		title: 'Test 1',
		text: 'DSLR anim dreamcatcher sint dumpster incididunt. Yr chillwave DSLR street-art letterpress gentrify liberal. Farm-to-table bronson organic narwhal ethical clothesline. Frado authentic gastropub art frado kale brooklyn. Placeat authentic gluten fin liberal 8-bit.',
		published_at: new Date(2012, 2, 31),
		image: '/images/test.jpg'
	});
	this.addArticle(feed, {
		title: 'Test 2',
		text: 'Before 8-bit brooklyn frado trust-fund ut. Chillwave capitalism placeat vegan. Anderson moon fin totally chowder original. The sunt dumpster dumpster voluptate chowder.',
		published_at: new Date(2012, 5, 16),
		image: '/images/test.jpg'
	});
	this.addArticle(feed, {
		title: 'Test 3',
		text: 'Clothesline esse sriracha gluten-free farm-to-table Pinterest. Carles street-art anim anime wes. Capitalism vegan gluten-free farm-to-table wayfarers gluten-free. Sint organic chowder street-art 8-bit anim of party. Narwhal of fresh twee. Viral vegan Anderson pony Anderson.',
		published_at: new Date(2012, 3, 1),
		image: '/images/test.jpg'
	});
};


/*
 * Adds an article to a feed
 */
FeedService.prototype.addArticle = function(feed, article) {
	article.feed = feed._id;
	this.db.articles.save(article);
	return article;
};

// Export a function, expect an instance to be created
module.exports = FeedService;