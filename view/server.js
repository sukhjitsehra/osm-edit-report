var express = require('express');
var swig = require('swig');
var server = express();

//configuracion para rendear vistas
server.engine('html', swig.renderFile);
server.set('view engine', 'html');
server.set('views', './app/views');

// agregamos post cookie y sessiones
server.set(function() {
	server.use(express.logger());
	server.use(express.cookieParser());
	server.use(express.bodyParser());
	server.use(express.session({
		secret: "rub21",
		store: new RedisStore({})
			// store  : new RedisStore({
			//	host : conf.redis.host,
			//	port : conf.redis.port,
			//	user : conf.redis.user,
			//	pass : conf.redis.pass
			// });	
	}));
});

var isntLoggedIn = function (req, res, next) {
	if(!req.session.user){
		res.redirect('/');
		return;
	}

	next();
};

server.get('/', function(req, res) {
	res.render('home');
});

server.get('/app', function(req, res) {
	res.render('app', {
		user: req.session.user
	});
});


server.post('/log-in', function(req, res) {
	res.redirect('/app');
});

server.listen(3000);