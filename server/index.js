var express = require('express');
var cors = require('cors');
var fs = require('fs');
var readline = require('readline');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../dbreport.sqlite');


var app = express();
app.use(cors());
console.log("http://localhost:3021/");
var objs = function() {
	return {
		values: [],
		key: null,
		color: null
	};
};

var color_users = {
	'Rub21': '#0171C5',
	'ediyes': '#FF0',
	'Luis36995': '#0F0',
	'RichRico': '#e34',
	'dannykath': '#662289'
};

app.get('/:date', function(req, res) {
	var date = req.params.date;
	var array_json = [];
	var users = [];
	console.log(date);

	db.each("SELECT id_user, osm_user from osm_user", function(err, row) {
		console.log("SELECT substr(osm_date, 0, 11) as date, substr(osm_date, 12) as hour, (high_vx + high_v1) as high_total from osm_highway WHERE id_user ='" + row.id_user + "'");

		db.each("SELECT substr(osm_date, 0, 11) as date, substr(osm_date, 12) as hour, (high_vx + high_v1) as high_total from osm_highway WHERE id_user ='" + row.id_user + "'", function(err2, row2) {
			console.log(row.osm_user + " : " + row2.hour + " : " + row2.high_total);
		});
	});
});
app.listen(process.env.PORT || 3021);