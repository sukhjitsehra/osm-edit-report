'use strict'
var os = require('os');
var path = require('path');
var exec = require('child_process').exec;
var _ = require('underscore');
var fs = require('fs');

module.exports = function(arr, obj, done) {
	var folder = os.tmpDir();
	var osmfile = arr[1].pad(3) + ".osc"; //completa el nombre a 006
	var fileSrc = path.join(folder, osmfile);
	var date_hours = todate(obj.osmdate);
	var dir_output_osm = path.join('../data/', date_hours + '.osm');
	//sudo cp osmfilter /usr/bin/osmfilter
	var users_filter = [];
	_.each(obj.users, function(val, key) {
		users_filter.push('@user=' + val.osm_user);
	});
	var exe_user = ' --keep="' + users_filter.join(" or ") + '"';
	var osmfilter = 'osmfilter ' + fileSrc + exe_user + ' -o=' + dir_output_osm;

	exec(osmfilter, function(err, stdout, stderr) {
		var p7zip = 'p7zip ' + dir_output_osm;
		exec(p7zip, function(err, stdout, stderr) {});		
		//remove file
		if (!fs.exists(fileSrc)) {
			var tempFile = fs.openSync(fileSrc, 'r');
			fs.closeSync(tempFile);
			fs.unlinkSync(fileSrc);
			console.log('Remove file :' + fileSrc);
		} else {
			console.log('Error in remove file');
		}
	});
}

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {
		s = "0" + s;
	}
	return s;
}

function todate(timestamp) {
	var date = new Date(timestamp * 1000);
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	return year + '-' + month + '-' + day + ':' + hour;
}