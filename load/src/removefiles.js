'use strict';
var os = require('os');
var path = require('path');
var fs = require('fs');

module.exports = function(arr, obj, done) {
	var folder = os.tmpDir();
	var osmfile = arr[1].pad(3) + ".osc";
	var fileSrc = path.join(folder, osmfile);
	if (!fs.exists(fileSrc)) {
		var tempFile = fs.openSync(fileSrc, 'r');
		fs.closeSync(tempFile);
		fs.unlinkSync(fileSrc);
		console.log('Remove file :' + fileSrc);
	} else {
		console.log('Error in remove file');
	}
};

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {
		s = "0" + s;
	}
	return s;
};