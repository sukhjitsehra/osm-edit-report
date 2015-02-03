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
		color: null
	};
};

console.log("http://localhost:3021/");
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
app.get('/:date', function(req, res) {
	try {
		var date = (req.params.date + '').split('&');
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
					user.color = '#' + result.rows[i].color.replace(/\s/g, '');;
					array_objs.push(user);
				}
			}
		});
		var query = '';
		switch (date[0]) {
			case 'h':
				query = "SELECT u.osmuser,  replace(substring(to_timestamp(o.osmdate)::text,0,14),' ','-') as osmd, (o.node_v1 + o.node_vx + o.way_v1 + o.way_vx + o.relation_v1+ o.relation_vx) as num_objs" +
					" FROM osm_obj as o " +
					" INNER JOIN osm_user as u on  u.iduser =  o.iduser" +
					" WHERE o.osmdate>=" + date[1] + " AND o.osmdate<" + date[2] + " AND u.estado=true";
				if ((parseInt(date[2]) - parseInt(date[1])) > 24 * 60 * 60 * 5) {
					return res.send('Error 404: No quote found');
				}
				break;
			case 'd':
				query = "SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,11) as osmd, sum(o.node_v1 + o.node_vx + o.way_v1 + o.way_vx + o.relation_v1+ o.relation_vx) as num_objs" +
					" FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser " +
					" WHERE osmdate>= " + date[1] + " AND osmdate<" + date[2] + " AND u.estado=true " +
					" GROUP BY osmd,u.osmuser ORDER BY osmd;";
				break;
			case 'm':
				query = " SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,8) as osmd, sum(o.node_v1 + o.node_vx + o.way_v1 + o.way_vx + o.relation_v1+ o.relation_vx) as num_objs" +
					" FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser " +
					" WHERE osmdate>= " + date[1] + " AND osmdate<" + date[2] + " AND u.estado=true " +
					" GROUP BY osmd,u.osmuser ORDER BY osmd;"

				break;
			case 'y':
				query = " SELECT u.osmuser, substring(to_timestamp(o.osmdate)::text,0,5) as osmd, sum(o.node_v1 + o.node_vx + o.way_v1 + o.way_vx + o.relation_v1+ o.relation_vx) as num_objs" +
					" FROM osm_obj as o  INNER JOIN osm_user as u on   u.iduser =  o.iduser " +
					" WHERE osmdate>= " + date[1] + " AND osmdate<" + date[2] + " AND u.estado=true " +
					" GROUP BY osmd,u.osmuser ORDER BY osmd";
				break;
		}
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
					});
					userss.values.push({
						x: result.rows[i].osmd,
						y: parseInt(result.rows[i].num_objs)
					});
				}
				res.json(array_objs);
			}
		});
	} catch (e) {
		res.statusCode = 404;
		return res.send('Error 404: No quote found');
	}
});
app.listen(process.env.PORT || 3021);