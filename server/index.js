var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
app.use(cors());

console.log("http://localhost:3021/data");

app.get('/data/:date', function(req, res) {
	var date = req.params.date;
	var json = {
		"type": "FeatureCollection",
		"features": []
	};
	console.log(date);
	var filePath = path.join(__dirname, '2014-10-15.csv');
	fs.readFile(filePath, {
		encoding: 'utf-8'
	}, function(err, data) {
		if (!err) {
			console.log('received data: ' + data);

			/*response.writeHead(200, {
				'Content-Type': 'text/html'
			});
			response.write(data);
			response.end();*/


		} else {
			console.log(err);
		}

	});



	res.json(json);


});

app.listen(process.env.PORT || 3021);