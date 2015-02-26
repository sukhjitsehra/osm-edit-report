#!/usr/bin/env node
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
	"postgres://" + (argv.pguser || 'postgres') +
	":" + (argv.pgpassword || '1234') +
	"@" + (argv.pghost || 'localhost') +
	"/" + (argv.pgdatabase || 'dbstatistic')
);
var url = "http://" + (argv.dbhost || 'localhost') + ":3021/";
console.log('Running on ' + url);
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
		value_parameters(req.params.date);
		var date = (req.params.date + '').split('&');
		var array_objs = [];
		var query_obj = {
      		text: 'SELECT substring(to_timestamp(osmdate)::text,0,$1) as osm_date',
      		values: [type[date[0]]]
    	};
		var query_user = {
      		text: 'SELECT iduser, osmuser, color, estado FROM osm_user WHERE estado = $1',
      		values: [true]
    	};
		var main_query = client.query(query_user, function(error, result) {
			if (error) {
				console.log('Error on list users');
				res.statusCode = 404;
				return res.send('Error 404: No quote found');
			} else {
				for (var i = 0; i < result.rows.length; i++) {
					user = new obj();
					var iduser = result.rows[i].iduser;
					query_obj.text += ", SUM(u_" + iduser + ") as u_" + iduser;
					user.iduser = iduser;
					user.key = result.rows[i].osmuser;
					user.color = '#' + result.rows[i].color;
					array_objs.push(user);
				}
			}
		});
		main_query.on('end', function(result) {
			query_obj.text += " FROM osm_obj WHERE osmdate >= $2 AND osmdate < $3 GROUP BY osm_date ORDER BY osm_date";
			query_obj.values.push(parseInt(date[1]),parseInt(date[2]));			
			client.query(query_obj, function(error, result) {
				if (error) {
					console.log('Error on request parameter: '+ date[1] +', '+date[2]);
					res.statusCode = 404;
					return res.send('Error 404: No quote found');
				} else {
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
					console.log('Successful');				
				}
			});
		});
	} catch (e) {
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
});
app.listen(process.env.PORT || 3021);

function value_parameters(date) {
	console.log('Request Date : ' + new Date() + ' url: ' + url + date);
	date = (date + '').split('&');
	if (date.length !== 3) {
		console.log('error');
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
	if (Number(date[1]) === NaN || Number(date[2]) === NaN || type[date[0]] === undefined) {
		console.log('error');
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
	if (parseInt(date[2]) - parseInt(date[1]) < 0) {
		console.log('error');
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
	//we can do a consult per hour less two months
	if (parseInt(date[2]) - parseInt(date[1]) > 60 * 24 * 3600 && date[0] === 'h') {
		console.log('High petición of data per hour ');
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
}