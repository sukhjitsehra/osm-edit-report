var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, '../data')));
app.listen(3022);
