'use strict';
var pg = require('pg');
var _ = require('underscore');
var obj_user = require('./user');
var database = {};

database.select_users = function(client, done) {
	var users = {};
	var query_user = {
		text: 'SELECT iduser,osmuser FROM osm_user WHERE estado = $1;',
		values: [true]
	};
	var select_users = client.query(query_user, function(err, result) {
		if (err) return err;
		for (var i = 0; i < result.rows.length; i++) {
			users[result.rows[i].iduser] = new obj_user();
			users[result.rows[i].iduser].osm_user = result.rows[i].osmuser;
		}
	});
	select_users.on('end', function(result) {
		done(users);
	});
};

database.insert = function(client, obj) {
	var flag = true;
	var query_exists = {
		text: 'SELECT EXISTS(SELECT osmdate FROM osm_obj where osmdate = $1);',
		values: [obj.osmdate]
	};
	client.query(query_exists, function(err, result) {
		flag = result.rows[0].exists;
		_.each(obj.users, function(val, key) {
			var num_obj = (val.osm_node + val.osm_way + val.osm_relation);
			var query_insert = {
				text: "",
				values: []
			};
			if (flag) {
				query_insert.text = "UPDATE osm_obj SET uo_" + key + " = $1 , uc_" + key + " = $2 WHERE osmdate = $3";
				query_insert.values.push(num_obj, val.changeset, obj.osmdate);
			} else {
				query_insert.text = "INSERT INTO osm_obj(osmdate, uo_" + key + ", uc_" + key + ") VALUES ($1,$2,$3)";
				query_insert.values.push(obj.osmdate, num_obj, val.changeset);
				flag = true;
			}
			client.query(query_insert, function(err, result) {
				if (err) {
					console.log("error en insertar" + err);
				}
			});
		});
	});
};

module.exports = database;