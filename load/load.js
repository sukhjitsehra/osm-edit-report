'use strict'

var osmium = require('osmium');
var fs = require('fs');
var zlib = require('zlib');
var _ = require('underscore');
var argv = require('optimist').argv;
var pg = require('pg');
var download = require('./src/download');
var database = require('./src/database');
var count = require('./src/count');
var removefiles = require('./src/removefiles');
//var delayed = require('delayed');
var crontab = require('node-crontab');
// Initialize parameters
var flag = true;


var db_conf = {
	pguser: argv.pguser,
	pgpassword: argv.pgpassword,
	pghost: argv.pghost,
	pgdatabase: argv.pgdatabase
};


var client = new pg.Client(
	"postgres://" + (db_conf.pguser || 'postgres') +
	":" + (db_conf.pgpassword || '1234') +
	"@" + (db_conf.pghost || 'localhost') +
	"/" + (db_conf.pgdatabase || 'dbstatistic')
);
client.connect(function(err) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}
});


var number_obj = {
	prev: [],
	current: [parseInt(argv.num_directory), parseInt(argv.num_file)],
	next: []
};

var runSpeed = 10 * 1000;

//inicio
function init() {
	download(number_obj.current, select_users);
}

//fecth users
function select_users(b) {
	if (b) {
		database.select_users(client, process_files);
	} else {
		if (flag) {
			flag = false;
			crontab.scheduleJob("*/5 * * * *", function() { //This will call this function every 2 minutes 
				init();
			});
		}
		//delayed(init, runSpeed);

	}
}

//count number of edition
function process_files(users) {
	count(number_obj.current, users, save);
}

//save on db
function save(obj) {
	database.insert(client, obj);
	//filter(number_obj.current, obj, finish)
	//remove files 
	removefiles(number_obj.current);
	console.log("fin");
	get_num(number_obj.next);
	init();

}

function get_num(arr) {
	number_obj = {
		prev: [],
		current: arr,
		next: []
	};
	if (arr[1] === 0) {
		number_obj.prev.push(arr[0] - 1);
		number_obj.prev.push(999);
	} else {
		number_obj.prev.push(arr[0]);
		number_obj.prev.push(arr[1] - 1);
	}
	if (arr[1] === 999) {
		number_obj.next.push(arr[0] + 1);
		number_obj.next.push(0);
	} else {
		number_obj.next.push(arr[0]);
		number_obj.next.push(arr[1] + 1);
	}
}

get_num(number_obj.current);
init();