#!/usr/bin/env node
var osmium = require('osmium');
var request = require('request');
var fs = require('fs');
var zlib = require('zlib');
var _ = require('underscore');
var argv = require('optimist').argv;
var pg = require('pg');
var osm_file = '';
var obj = function() {
	return {
		osm_user: {
			osmuser: null,
			color: null
		},
		osm_date: 0,
		osm_node: 0,
		osm_way: 0,
		osm_relation: 0
	};
};
var client = new pg.Client(
	"postgres://" + (argv.user || 'postgres') +
	":" + (argv.password || '1234') +
	"@" + (argv.dbhost || 'localhost') +
	"/" + (argv.database || 'dbstatistic')
);
client.connect(function(err) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}
});

function download_file(url, localFile, callback) {
	var localStream = fs.createWriteStream(localFile);
	var out = request({
		uri: url
	});
	out.on('response', function(resp) {
		if (resp.statusCode === 200) {
			console.log('Start download : ' + url);
			out.pipe(zlib.createGunzip()).pipe(localStream);
			localStream.on('close', function() {
				callback(true, localFile);
			});
		} else {
			console.log('No file found url:' + url);
			if (num_file === 1) {
				num_file = 999;
				name_directory = name_directory - 1;
			} else {
				num_file = num_file - 1;
			}
			flag = false;
			callback(false, null);
		}
	});
};

function proces_file_save(value) {
	if (!value) {
		init();
	} else {
		//proces file
		console.log('Process file :' + name_file);
		var osmfile = osm_file;
		var count = {};
		var query_user = {
      		text: 'SELECT iduser, osmuser, color, estado FROM osm_user WHERE estado = $1;',
      		values: [true]
    	};
		var main_query = client.query(query_user, function(error, result) {
			if (error) {
				console.log(error);
				res.statusCode = 404;
				return res.send('Error 404: No quote found');
			} else {
				try {
					for (var i = 0; i < result.rows.length; i++) {
						user = new obj();
						count[result.rows[i].iduser] = user;
					}
					//Procesamiento de datos
					var file = new osmium.File(osmfile);
					var reader = new osmium.Reader(file);
					var handler = new osmium.Handler();
					//WAY
					handler.on('way', function(way) {
						osmdate = way.timestamp;
						osmdate = osmdate - osmdate % 1000;
						if (count.hasOwnProperty(way.uid) && _.size(way.tags()) > 0) {
							++count[way.uid].osm_way;
						}
					});
					//NODE
					handler.on('node', function(node) {
						if (count.hasOwnProperty(node.uid) && _.size(node.tags()) > 0) {
							++count[node.uid].osm_node;
						}
					});
					//RELATION
					handler.on('relation', function(relation) {
						if (count.hasOwnProperty(relation.uid) && _.size(relation.tags()) > 0) {
							++count[relation.uid].osm_relation;
						}
					});
					reader.apply(handler);
					var flag = true;
					var query_exists = {
      					text: 'SELECT EXISTS(SELECT osmdate FROM osm_obj where osmdate = $1);',
      					values: [osmdate]
    				};
					client.query(query_exists, function(err, result) {
						flag = result.rows[0].exists;
						_.each(count, function(val, key) {
							var num_obj = (val.osm_node + val.osm_way + val.osm_relation);
							var query_insert = {text:"", values:[]};
							if (flag) {
								query_insert.text= "UPDATE osm_obj SET u_" + key + " = $1 WHERE osmdate = $2",
								query_insert.values.push(num_obj,osmdate);
							} else {
								query_insert.text= "INSERT INTO osm_obj(osmdate, u_" + key + ") VALUES ($1,$2)",
								query_insert.values.push(osmdate,num_obj);
								flag = true;
							}
							client.query(query_insert, function(err, result) {
								if (err) {
									console.log("error en insertar" + err);
								}
							});
						});
					});
				} catch (e) {
					console.log("entering catch block");
				}
			}
		});

		main_query.on('end', function(result) {
			//remove file
			if (!fs.exists(osm_file)) {
				var tempFile = fs.openSync(osm_file, 'r');
				fs.closeSync(tempFile);
				fs.unlinkSync(osm_file);
				console.log('Remove file :' + osm_file);
			} else {
				console.log('Error in remove file');
			}
			init();
		});
	}
}

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
		name_file = '00' + num_file;
		num_file++;
		if (num_directory < 10) {
			num_directory++;
			name_directory = '00' + num_directory;
		} else if (num_directory >= 10 && num_directory < 100) {
			num_directory++;
			name_directory = '0' + num_directory;
		}
	}
	return 'http://planet.openstreetmap.org/replication/hour/000' + '/' + name_directory + '/' + name_file + '.osc.gz';
}

function init() {
	if (flag) {
		url_file = get_url_file();
		osm_file = name_file + '.osc';
		download_file(url_file, osm_file, proces_file_save);
	} else {
		console.log('Wait 10 minutes');
		setTimeout(function() {
			url_file = get_url_file();
			osm_file = name_file + '.osc'
			request(url_file, function(err, resp, body) {
				if (!err && resp.statusCode == 200) {
					download_file(url_file, osm_file, proces_file_save);
				} else {
					console.log('URL is not available yet: '+ url_file);					
					if (num_file === 1) {
						num_file = 999;
						name_directory = name_directory - 1;
					} else {
						num_file = num_file - 1;
					}
					init();
				}
			}).end();
		}, 10 * 60 * 1000);
	}
}

// Initialize parameters
var name_file = '';
var name_directory = '';
var num_file = argv.num_file;
var num_directory = argv.num_directory;
var url_file = '';
var osmdate = 0;
var flag = true;
name_directory = '0' + num_directory;
if (num_directory < 10) {
	name_directory = '00' + num_directory;
}
init();