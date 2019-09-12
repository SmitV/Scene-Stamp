var express = require('express');
const bodyParser = require('body-parser');

var action = require('./action.js')
var taskScript = require('./taskScript.js')


var url = require('url');
var Arena = require('bull-arena');
var queue = require('./queue')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

function getRedisConfig(redisUrl) {
  const redisConfig = url.parse(redisUrl);
  return {
    host: redisConfig.hostname || 'localhost',
    port: Number(redisConfig.port || 6379),
    database: (redisConfig.pathname || '/0').substr(1) || '0',
    password: redisConfig.auth ? redisConfig.auth.split(':')[1] : undefined
  };
}

app.use('/', Arena({
	queues: [
	{
		name: 'video',
		hostId: queue.REDIS_CRED.host,
		redis: getRedisConfig(queue.REDIS_URL)
	}]
}, {
	basePath: '/arena',
	disableListen: true
}));

app.use('/add', function(req, res) {
	queue.add({
		id : Math.random()
	})
	res.json('done')
})

app.use('/clean', function(req, res) {
	queue.clean(res)
})

app.use('/status', function(req, res){

	queue.status(res)
})


var endpoints = [{
		//will rename episode to new  
		url: 'linkToEpisode',
		action: function(req, res) {
			action.get_linkVideoToEpisode(req.query, res);
		}
	}, {
		url: 'getUnlinkedVideos',
		action: function(req, res) {
			action.get_allUnlinkedVideos(res);
		}
	}, {
		url: 'getLinkedVideos',
		action: function(req, res) {
			action.get_allLinkedVides(res);
		}
	}, {
		url: 'getLogos',
		action: function(req, res) {
			action.get_allLogos(res);
		}
	}, {
		url: 'createCompilation',
		action: function(req, res) {
			action.get_CreateCompilation(req.body, res);
		},
		post: true
	}, {
		//gets al list of all of the compilation video names 
		url: 'getCompilationVideos',
		action: function(req, res) {
			action.get_allCompilationVideos(res);
		}
	}, {
		//gets status of a compilation video 
		url: 'getCompilationStatus',
		action: function(req, res) {
			action.get_CompilationVideoStatus(req.query, res);
		}
	}, {
		//will call res.download to the compilation video file 
		url: 'downloadCompilation',
		action: function(req, res) {
			action.get_downloadCompilation(req.query, res);
		}
	}, {
		url: 'downloadYoutubeVideo',
		action: function(req, res) {
			action.get_downloadYoutbeVideo(req.query, res)
		}
	}

]

app.all('*', function(req, res, next) {
	var origin = req.get('origin');
	res.header('Access-Control-Allow-Origin', origin);
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


endpoints.forEach(function(endpoint) {
	if (endpoint.post) {
		app.post('/' + endpoint.url, function(req, res) {
			endpoint.action(req, res);
		});
		return
	}
	app.get('/' + endpoint.url, function(req, res) {
		endpoint.action(req, res);
	});

})

var server = app.listen(process.env.PORT || 8081, function() {
	console.log("Scene Stamp Video Server Running @ port ", this.address().port)

	function taskLoop() {
		var loop;
		action.removeInProgressVideos(function() {
			loop = setInterval(function() {
				taskScript.updateTasks()
				taskScript.updateDownloadTask()
			}, 2000);
		})

	}

	taskScript.initialTests(err => {
		if (err) {
			console.log('Did not start server')
			server.close()
			return
		}
		taskLoop();
	})
})

module.exports = {
	server: server
}