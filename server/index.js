var express = require('express');
var cors = require('cors');
var app = express();
var pg = require('pg');
var _ = require('underscore');
var moment = require('moment');
app.use(cors());

var obj = function() {
	return {
		values: [],
		key: null,
		color: null
			//id: null
	};
};

var conString = "postgres://postgres:1234@localhost/dbstatistic";
console.log("http://localhost:3021/");
//connect data base
var client = new pg.Client(conString);
client.connect(function(err) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}
});


app.get('/:date', function(req, res) {

	var date = (req.params.date + '').split('&');
	console.log(date);

	var array_objs = [];
	var query_user = "SELECT iduser, osmuser, color, estado FROM osm_user";
	var main_query = client.query(query_user, function(error, result) {
		if (error) {
			console.log(error);
			res.statusCode = 404;
			return res.send('Error 404: No quote found');
		} else {
			for (var i = 0; i < result.rows.length; i++) {
				user = new obj();
				user.key = result.rows[i].osmuser;
				user.color = '#' + result.rows[i].color;
				array_objs.push(user);
			}
		}
	});

	var query = "SELECT u.osmuser, substring(to_timestamp(d.osmdate)::text,0,14) as osmdate , (w.way_v1 + w.way_vx) as way" +
		" FROM osm_way as w" +
		" INNER JOIN osm_user as u on   u.iduser =  w.iduser" +
		" INNER JOIN osm_date as d on   d.idfile =  w.idfile" +
		" WHERE d.osmdate> " + date[1] + " AND d.osmdate<" + date[2];


		console.log(query);

	client.query(query, function(error, result) {
		if (error) {
			console.log(error);
			res.statusCode = 404;
			return res.send('Error 404: No quote found');
		} else {
			for (var i = 0; i < result.rows.length; i++) {
				var userss = _.find(array_objs, function(obj) {
					return obj.key === result.rows[i].osmuser
				}).values.push({
					x: result.rows[i].osmdate,
					y: parseInt(result.rows[i].way)
				});
			}
			res.json(array_objs);
		}
	});
});

app.listen(process.env.PORT || 3021);