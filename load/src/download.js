'use strict';
var os = require('os');
var request = require('request');
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');

module.exports = function(arr, done) {
	var folder = os.tmpDir();
	var url = "http://planet.openstreetmap.org/replication/hour/000/" + arr[0].pad(3) + "/" + arr[1].pad(3) + ".osc.gz";
	var baseName = arr[1].pad(3) + ".osc";
	var fileSrc = path.join(folder, baseName);

	var out = request({
		uri: url
	});

	out.on('response', function(resp) {
		if (resp.statusCode === 200) {
			console.log('Start download : ' + url + ' ---> ' + fileSrc);
			var localStream = fs.createWriteStream(fileSrc);
			out.pipe(zlib.createGunzip()).pipe(localStream);
			localStream.on('close', function() {
				done(true);
			});
		} else {
			console.log('No file found url:' + url);
			done(false);
		}
	});
};

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {
		s = "0" + s;
	}
	return s;
};