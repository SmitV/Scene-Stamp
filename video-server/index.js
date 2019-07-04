var express = require('express');
var testing_action = require('./testing_action.js');
var production_action = require('./production/production_actions.js');
var app = express();


app.all('*', function(req, res, next) {
     var origin = req.get('origin'); 
     res.header('Access-Control-Allow-Origin', origin);
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     res.header('Access-Control-Allow-Headers', 'Content-Type');
     next();
});


var endpoints = [
	{
		//will rename episode to new  
		url : 'renameEpisode', 
		action : function(req, res){
					actions.getVideoForEpisode(function(data){
						res.json(data);
					});
				}
	},


endpoints.forEach(function(endpoint){
	app.get('/'+ endpoint.url, function(req, res){
		endpoint.action(req,res);
	});
})


var server = app.listen(process.env.PORT || 8081, function () {   
   console.log("Scene Stamp Server Running @ port ",this.address().port )
})
