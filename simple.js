var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var client = new Db('node-mongo-examples', new Server(host, port, {}), {native_parser: false});
client.open(function(err, db) {
	db.dropDatabase(function(err, result) {
		db.collection('test', function(err, collection) {      
			// Erase all records from the collection, if any
			collection.remove({}, function(err, result) {
				// Insert 3 records
				for(var i = 0; i < 3; i++) {
					collection.insert({'a':i});
				}
				
				collection.count(function(err, count) {
					console.log("There are " + count + " records in the test collection. Here they are:");

					collection.find(function(err, cursor) {
						cursor.each(function(err, item) {
							if(item != null) {
								console.dir(item);
								console.log("created at " + new Date(item._id.generationTime) + "\n")
							}
							// Null signifies end of iterator
							if(item == null) {                
								// Destory the collection
								collection.drop(function(err, collection) {
									db.close();
								});
							}
						});
					});          
				});
			});      
		});
	});
});