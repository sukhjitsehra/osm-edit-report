var express = require('express');
var cors = require('cors');
var app = express();
var pg = require('pg');
var _ = require('underscore');
var argv = require('optimist').argv;
app.use(cors());
var obj = function() {
	return {
		values: [],
		key: null,
		color: null,
		iduser: 0
	};
};
var client = new pg.Client(
	"postgres://" + (argv.user || 'postgres') +
	":" + (argv.password || '1234') +
	"@" + (argv.dbhost || 'localhost') +
	"/" + (argv.database || 'dbstatistic')
);
console.log("http://" + argv.dbhost + ":3021/");

var type = {
	'h': 14,
	'd': 11,
	'm': 8,
	'y': 5
};
client.connect(function(err) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}
});
app.get('/:date', function(req, res) {
	try {
		var date = (req.params.date + '').split('&');
		var array_objs = [];
		var query_obj = "SELECT substring(to_timestamp(osmdate)::text,0," + type[date[0]] + ") as osm_date";
		var query_user = "SELECT iduser, osmuser, color, estado FROM osm_user WHERE estado=true;";

		var main_query = client.query(query_user, function(error, result) {
			if (error) {
				console.log(error);
				res.statusCode = 404;
				return res.send('Error 404: No quote found');
			} else {
				for (var i = 0; i < result.rows.length; i++) {
					user = new obj();
					var iduser = result.rows[i].iduser;
					query_obj += ", SUM(u_" + iduser + ") as u_" + iduser;
					user.iduser = iduser;
					user.key = result.rows[i].osmuser;
					user.color = '#' + result.rows[i].color;
					array_objs.push(user);
				}
			}
		});

		main_query.on('end', function(result) {
			query_obj += " FROM osm_obj WHERE osmdate>= " + date[1] + " AND osmdate<" + date[2] + " GROUP BY osm_date ORDER BY osm_date;";
			console.log(query_obj);

			client.query(query_obj, function(error, result) {
				if (error) {
					console.log(error);
					res.statusCode = 404;
					return res.send('Error 404: No quote found');
				} else {
					//console.log(array_objs);
					for (var i = 0; i < result.rows.length; i++) {
						_.each(array_objs, function(v, k) {
							array_objs[k].values.push({
									x: result.rows[i].osm_date.replace(' ', '-'),
									y: parseInt(result.rows[i]["u_" + v.iduser])
								}

							)
						});
					}
					res.json(array_objs);
				}
			});
		});
	} catch (e) {
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
});
app.listen(process.env.PORT || 3021);