var osmium = require('osmium');
var numeral = require('numeral');
var argv = require('optimist').argv;
var _ = require('underscore');
var fs = require('fs');
var moment = require('moment');

var obj_way = function() {
	return {
		highways: {
			v1: 0,
			vx: 0,
			oneways: 0,
			bridges: 0
		},
		buildings: {
			v1: 0,
			vx: 0
		}
	};
};

function format_num(n) {
	return numeral(n).format('0,0');
}
var osmfile = argv.osmfile;
var users = argv.users.split(",");
var count = {};
for (var k = 0; k < users.length; k++) {
	var way = {
		way: new obj_way()
	};
	count[users[k]] = way;
};

var file = new osmium.File(osmfile);
var reader = new osmium.Reader(file);
var handler = new osmium.Handler();
var day, hour = '';
var check_hour = true;
handler.on('way', function(way) {
	if (check_hour) {
		console.log(way.timestamp);
		hour = moment.unix(way.timestamp).format('HH');
		day = moment.unix(way.timestamp).format('YYYY-MM-DD');
		console.log(day);
		check_hour = false;
	}
	if (typeof way.tags().highway !== 'undefined' && users.indexOf(way.user) !== -1) { //evalua las calles			
		if (way.version === 1) {
			++count[way.user].way.highways.v1;
		} else {
			++count[way.user].way.highways.vx;
		}
		if (typeof way.tags().bridge !== 'undefined') {
			++count[way.user].way.highways.bridges;
		}
		if (typeof way.tags().oneway !== 'undefined') {
			++count[way.user].way.highways.oneways;
		}
	}
	if (typeof way.tags().building !== 'undefined' && users.indexOf(way.user) !== -1) { //evalua las buildings			
		if (way.version === 1) {
			++count[way.user].way.buildings.v1;
		} else {
			++count[way.user].way.buildings.vx;
		}
	}
});

reader.apply(handler);

var array_total = [];
for (var i = 0; i < users.length; i++) {
	array_total.push(count[users[i]].way.highways.v1 + count[users[i]].way.highways.vx);
};

var file = day + '.csv'; //name of day
fs.exists(file, function(exists) {
	if (!exists) {
		var wstream = fs.createWriteStream(file);
		wstream.write('hour,' + users.toString() + '\n');
		wstream.write(hour + ',' + array_total.toString() + '\n');
		wstream.end();
	} else {
		fs.appendFile(file, hour + ',' + array_total.toString() + '\n');
	}
});