var express = require('express');
var cors = require('cors');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../dbreport.sqlite');
var app = express();
app.use(cors());
console.log("http://localhost:3021/");
var objs = function() {
	return {
		values: [],
		key: null,
		color: null,
		id: null
	};
};
app.get('/:date', function(req, res) {
	var date = req.params.date;
	var array_objs = [];
	console.log(date);
	db.each("SELECT id_user, osm_user , color from osm_user", function(err, row) {
		var user = new objs();
		user.key = row.osm_user;
		user.color = '#'+row.color,
		user.id = row.id_user;
		array_objs.push(user);
	}, function() {
		var query = "SELECT  (high_vx+high_v1) as high_total, U.osm_user, U.id_user, substr( D.osm_date,0,11) as date ,substr(D.osm_date,12) as hour  FROM osm_highway   AS H   LEFT JOIN  osm_user AS U  ON   U.id_user=H.id_user  LEFT JOIN osm_date as D   ON H.id_date=D.id_date WHERE  date='" + date + "'";
		db.each(query, function(err, row) {
			array_objs[row.id_user - 1].values.push({
				x: parseInt(row.hour),
				y: parseInt(row.high_total)
			});
		}, function() {
			res.json(array_objs);
		});
	});
});

app.listen(process.env.PORT || 3021);