var fs = require('fs');
var zlib = require('zlib');
var request = require('request');
var osmium = require('osmium');
var sqlite = require('sqlite3').verbose();
var step = require('step');
var async = require('async');

download('355', function() {
	console.log('descarga completa');
});

function download(localFile, callback) {
	console.log('inicia descarga');

	var localStream = fs.createWriteStream(localFile + '.osc');

	var out = request({
		uri: 'http://planet.openstreetmap.org/replication/hour/000/018/' + localFile + '.osc.gz'
	});
	out.on('response', function(resp) {
		if (resp.statusCode === 200) {
			out.pipe(zlib.createGunzip()).pipe(localStream);

			localStream.on('close', function() {
				callback(null, localFile);
			});
		} else
			callback(new Error("No file found at given url."), null);
	});

};