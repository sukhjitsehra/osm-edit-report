var osmium = require('osmium');
var numeral = require('numeral');
var request = require('request');
var fs = require('fs');
var zlib = require('zlib');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('dbreport.sqlite');
var sleep = require('sleep');

var osm_users = ['Rub21', 'ediyes', 'Luis36995', 'RichRico', 'dannykath'];

var osm_file = '';

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

function download_file(url, localFile, callback) {
	console.log('Start download : ' + url);
	var localStream = fs.createWriteStream(localFile);
	var out = request({
		uri: url
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

function proces_file_save() {
	console.log('Process file :' + name_file);
	var osmfile = osm_file;
	var users = osm_users;
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
			//console.log(way.timestamp);
			var date = new Date(parseFloat(way.timestamp) * 1000);
			//console.log(date);
			hour = date.getHours();
			//console.log('hour:' + hour);
			//day = moment.unix(way.timestamp).format('YYYY-MM-DD');
			day = date.getUTCFullYear() + '-' + complete_date(parseInt(date.getUTCMonth()) + 1) + '-' + complete_date(date.getUTCDate()) + '-' + complete_date(date.getHours());
			//console.log(day);
			check_hour = false;
		}
		if (typeof way.tags().highway !== 'undefined' && users.indexOf(way.user) !== -1) { //evalua las calles	
			if (way.version === 1) {
				++count[way.user].way.highways.v1;
			} else {
				++count[way.user].way.highways.vx;
			}
		}
	});


	reader.apply(handler);
	db.serialize(function() {
		var stmt = db.prepare("INSERT INTO osm_highway VALUES (?,?,?,?,?)");
		for (var i = 0; i < users.length; i++) {
			stmt.run(name_directory + '-' + name_file, i + 1, day, count[users[i]].way.highways.v1, count[users[i]].way.highways.vx);
		};
		stmt.finalize();
	});
	//db.close();
	//remove file

	var tempFile = fs.openSync(osm_file, 'r');
	fs.closeSync(tempFile);
	fs.unlinkSync(osm_file);
	console.log('Remove file :' + osm_file);
}

//intitializar parameters
var url = 'http://planet.openstreetmap.org/replication/hour/000';
var name_file = '';
var num_file = 102;
var num_directory = 18;
var name_directory = ''
name_directory = '0' + num_directory;

setInterval(function() {

	var url_file = get_url_file();
	osm_file = name_file + '.osc'
	download_file(url_file, osm_file, proces_file_save);

}, 1* 60 * 1000);


function get_url_file() {
	if (num_file < 10) {
		name_file = '00' + num_file;
		num_file++;
	} else if (num_file >= 10 && num_file < 100) {
		name_file = '0' + num_file;
		num_file++;
	} else if (num_file >= 100 && num_file < 1000) {
		name_file = '' + num_file;
		num_file++;
	} else {
		num_file = 0;
		num_directory++;
		name_directory = '0' + num_directory;
	}
	return url + '/' + name_directory + '/' + name_file + '.osc.gz';
}

function complete_date(str) {
	str = str + '';
	if (str.length === 1) {
		return '0' + str;
	} else {
		return str;
	}

}