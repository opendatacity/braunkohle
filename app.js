var express = require('express')
	, http = require('http')
	, path = require('path')
	, url = require('url');

var app = express();
var server = http.createServer(app);

app.set('port', process.env.PORT || 80);
app.use(express.logger('dev'));

//app.use(express.favicon(__dirname + '/static/images/favicon.ico'));
app.use('/static', express.static(__dirname + '/static'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/static/iframe.htm');
});

app.get('/braunkohle', function (req, res) {
	res.sendfile(__dirname + '/static/braunkohle.htm');
});

server.listen(app.get('port'), function () {
	console.log('Server listening on port ' + app.get('port'));
});
