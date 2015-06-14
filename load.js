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
var filter = require('./src/filter');
// Initialize parameters
var db_conf = {
	pguser: argv.pguser,
	pgpassword: argv.pgpassword,
	pghost: argv.pghost,
	pgdatabase: argv.pgdatabase
};

var number_obj = {
	prev: [],
	current: [parseInt(argv.num_directory), parseInt(argv.num_file)],
	next: []
};

var runSpeed = 1000;

//inicio
function init() {
	download(number_obj.current, select_users);
}

//fecth users
function select_users(b) {
	if (b) {
		database.select_users(db_conf, process_files);
	} else {
		setTimeout(init, runSpeed);
	}
}

//count number of edition
function process_files(users) {
	count(number_obj.current, users, save);
}

//save on db
function save(obj) {
	database.insert(db_conf, obj);
	filter(number_obj.current, obj, finish)
	get_num(number_obj.next);
	init();
}


function finish() {
	console.log("fin")
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