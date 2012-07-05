var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var client = new Db('reader', new Server('127.0.0.1', 27017, {}));

client.open(function(err, db) {
	console.log('Connected');

	db.collection('users', function(err, users) {
		if (err) {
			console.log('Couldn\'t find the collection');
			return;
		}
		users.insert({
			name: 'test',
			password: 'test',
			feeds: []
		});
	});
});