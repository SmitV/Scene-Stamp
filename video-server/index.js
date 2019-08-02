var express = require('express');
const bodyParser = require('body-parser');

var action = require('./action.js')
var taskScript = require('./taskScript.js')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.all('*', function(req, res, next) {
	var origin = req.get('origin');
	res.header('Access-Control-Allow-Origin', origin);
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


var endpoints = [{
		//will rename episode to new  
		url: 'linkToEpisode',
		action: function(req, res) {
			action.get_linkVideoToEpisode(req.query, function(data) {
				res.json(data);
			});
		}
	}, {
		url: 'getUnlinkedVideos',
		action: function(req, res) {
			action.get_allUnlinkedVideos(function(data) {
				res.json(data);
			});
		}
	}, {
		url: 'getLinkedVideos',
		action: function(req, res) {
			action.get_allLinkedVides(function(data) {
				res.json(data);
			});
		}
	}, {
		url: 'createCompilation',
		action: function(req, res) {
			action.get_CreateCompilation(req.body, function(data) {
				res.json(data);
			});
		},
		post: true
	}, {
		//gets al list of all of the compilation video names 
		url: 'getCompilationVideos',
		action: function(req, res) {
			action.get_allCompilationVideos(function(data) {
				res.json(data);
			});
		}
	}, {
		//gets status of a compilation video 
		url: 'getCompilationStatus',
		action: function(req, res) {
			action.get_CompilationVideoStatus(req.query, function(data) {
				res.json(data);
			});
		}
	}, {
		//will call res.download to the compilation video file 
		url: 'downloadCompilation',
		action: function(req, res) {
			action.get_downloadCompilation(req.query, res, function(data) {
				//this is to handle error responses, pass in res to function to call download
				res.json(data);
			});
		}
	}

]


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