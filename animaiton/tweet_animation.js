/*
			For any animation function , we pass in the duration
				1) animation check
					-if Date.now() - startTime(global) is greater than the passed in duration , call callback
				2)calculate step
					-[(Date.now() - startTime) / animation time(passed)] * the desired length
		*/

		const reducer = (accumulator, currentValue) => accumulator + currentValue;

		var ctx;
		var startTime;
		var currentTime;
		var rectangle;
		var textBoxes;
		var drawBoxes;

		var DONE_ANIMATION ;

		var fontSize = 20;
		var margin = 30
		var breakMargin = 20
		var iconSize = 25;
		var usernameMargin = 30;

		let SCREEN_WIDTH=1000;
		let SCREEN_HEIGHT=400;

		let TWEET_WIDTH = 800;
		let TWEET_HEIGHT;

		let STYLE_OPTIONS = {
			dark :{
				font_color:"#fff",
				background_color:"transparent",
				border_color:"#fff",
			},
			light :{
				font_color:"#000",
				background_color:"#fff",
				border_color:"#000"
			}
		}

		let STYLE = STYLE_OPTIONS.light;

		
		/*window.onload = function(){

			SCREEN_WIDTH = screen.width - 50;
			SCREEN_HEIGHT = screen.height - 100;
			var canvas = document.getElementById('canvas');
			//canvas.style.width = SCREEN_WIDTH+"px"
			//canvas.style.height = SCREEN_HEIGHT+"px"
		}*/



		
		let text_tweet = "the city just comes together.  the 9 million residents become 9 million roommates.  people look out for one another.  everyone in the street is stuck together, dealing with the same shit, working to get through it.everyone in the street in."

		function reset(){
			DONE_ANIMATION =false;
			rectangle = {
			x : 0,
			y : 0,
			width : 0,
			height:0,
			completedAnimationDuration:[],
			render:
				function(ctx){
					ctx.save(); 
					ctx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT) 
					ctx.fillStyle = STYLE.background_color;  
					ctx.strokeStyle = STYLE.border_color;
					ctx.lineWidth = 3;
					roundRect(ctx, this.x,this.y , this.width, this.height);
					ctx.restore(ctx);
				}
			}

			textBoxes = {}
			drawBoxes = {}
		}

		function createTextBox(){
			return{
				x:0,
				y:0,
				maxWidth:0,
				lineHeight:0,
				alpha:0,
				text:'',
				render:function(){
					ctx.save();
					ctx.font = fontSize+"px Arial";
					ctx.globalAlpha = this.alpha
					ctx.fillStyle = STYLE.font_color;
					wrapText(ctx, this.text,this.x, this.y, this.maxWidth, this.lineHeight)
					ctx.restore(ctx);
				}
			}
				 
		}

		function createImgBox(){
			return{
				x:0,
				y:0,
				width:0,
				height:0,
				alpha:0,
				src:'',
				render:function(ctx){
					ctx.save();
				 	var image = new Image();
				 	image.src = this.src
				 	var t = this;
				 	image.onload = function(){
				    	ctx.drawImage(image,t.x, t.y,t.width, t.height);
				  	}
				  	ctx.restore()
				}
			}	
		}

		function setUpTextBoxes(callback){
			textBoxes.username = createTextBox()
			textBoxes.username.x = rectangle.x+margin+iconSize+usernameMargin
			textBoxes.username.y = rectangle.y+margin +iconSize/2
			textBoxes.username.maxWidth = TWEET_WIDTH - (margin * 2)
			textBoxes.username.lineHeight = fontSize
			textBoxes.username.text = '@username'
			
			textBoxes.text = createTextBox()
			textBoxes.text.x = rectangle.x+margin
			textBoxes.text.y = rectangle.y + margin+iconSize+breakMargin 
			textBoxes.text.maxWidth = TWEET_WIDTH - (margin * 2)
			textBoxes.text.lineHeight = fontSize
			textBoxes.text.text = text_tweet

			drawBoxes.twitterIcon = createImgBox();
			drawBoxes.twitterIcon.x = rectangle.x+margin + usernameMargin/2
			drawBoxes.twitterIcon.y = textBoxes.username.y -fontSize
			drawBoxes.twitterIcon.width = iconSize;
			drawBoxes.twitterIcon.height = iconSize; 
			drawBoxes.twitterIcon.src = 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c8/Twitter_Bird.svg/1259px-Twitter_Bird.svg.png';
				
			callback()

		}

		function shouldFinishAnimation(duration){
			return Date.now() - startTime-rectangle.completedAnimationDuration.reduce((a,b) => a+b, 0) > duration

		}

		function updateTweetHeight(callback){
			var totalHeight = 0;

			Object.keys(textBoxes).forEach(function(a){ 

				totalHeight += getWrapTextHeight(ctx,textBoxes[a].text,textBoxes[a].maxWidth, textBoxes[a].lineHeight)
			})
			TWEET_HEIGHT = totalHeight + (margin * 2) + breakMargin;
			callback()
		}

		function getWrapTextHeight(ctx, text, maxWidth, lineHeight){
			ctx.font = fontSize+"px Arial";
			var totalHeight = 0;
			var words = text.split(' ');
	        var line = '';

	        for(var n = 0; n < words.length; n++) {
	          var testLine = line + words[n] + ' ';
	          var metrics = ctx.measureText(testLine);
	          var testWidth = metrics.width;
	          if (testWidth > maxWidth && n > 0) {
	            totalHeight += lineHeight;
	            line = words[n] + ' ';
	          }
	          else {
	            line = testLine;
	          }
	        }
	        return totalHeight + lineHeight;
		}

		function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
			ctx.font = fontSize+"px Arial";
	    	var words = text.split(' ');
	        var line = '';

	        for(var n = 0; n < words.length; n++) {
	          var testLine = line + words[n] + ' ';
	          var metrics = ctx.measureText(testLine);
	          var testWidth = metrics.width;
	          if (testWidth > maxWidth && n > 0) {
	            ctx.fillText(line, x, y);
	            line = words[n] + ' ';
	            y += lineHeight;
	          }
	          else {
	            line = testLine;
	          }
	        }
	        ctx.fillText(line, x, y);
	      }

		function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
		  if (typeof stroke == "undefined" ) {
		    stroke = true;
		  }
		  if(typeof radius === "undefined"){
		  	fill = true;
		  }
		  if (typeof radius === "undefined") {
		    radius = 5;
		  }
		  ctx.beginPath();
		  ctx.moveTo(x + radius, y);
		  ctx.lineTo(x + width - radius, y);
		  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		  ctx.lineTo(x + width, y + height - radius);
		  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		  ctx.lineTo(x + radius, y + height);
		  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		  ctx.lineTo(x, y + radius);
		  ctx.quadraticCurveTo(x, y, x + radius, y);
		  ctx.closePath();
		  if (stroke) {
		    ctx.stroke();
		  }
		  if (fill) {
		    ctx.fill();
		  }        
		}

		function getStep(duration, maxValue){
			return Math.min(((Date.now() - startTime-rectangle.completedAnimationDuration.reduce((a,b) => a+b, 0) )/ duration) * maxValue,maxValue)
		}

		function panWidth(duration, callback){

			if(shouldFinishAnimation(duration)){
				callback()
				return
			}

			rectangle.width = getStep(duration,TWEET_WIDTH);
			rectangle.render(ctx);
		}

		function panHeight(duration, callback){

			if(shouldFinishAnimation(duration)){
				callback()
				return
			}

			rectangle.height = getStep(duration,TWEET_HEIGHT);
			rectangle.render(ctx);
		}


		function littleBoxUp(duration,callback) {
			
			if(shouldFinishAnimation(duration)){
				callback()
				return
			}
			console.log(rectangle)
			var squareWidth = 10;
			rectangle.y = SCREEN_HEIGHT - getStep(duration, (SCREEN_HEIGHT)/2 + TWEET_HEIGHT/2);
			rectangle.width = getStep(duration,squareWidth);
			rectangle.height = getStep(duration,squareWidth);
			rectangle.render(ctx);
		}

		function addText(duration, callback){

			rectangle.render(ctx);

			Object.keys(textBoxes).forEach(function(key){textBoxes[key].alpha = getStep(duration, 1)})
			Object.keys(drawBoxes).forEach(function(key){drawBoxes[key].alpha = getStep(duration, 1)})
			Object.keys(drawBoxes).forEach(function(key){drawBoxes[key].render(ctx)})
			Object.keys(textBoxes).forEach(function(key){textBoxes[key].render(ctx)})

			if(shouldFinishAnimation(duration)){
				callback()
				return
			}
	
		}


	    function fadeInAnimation(callback){
	    	reset();

	    	STYLE = STYLE_OPTIONS[document.getElementById('styleOption').value]

			startTime = Date.now()
			currentTime = 0

			var canvas = document.getElementById('canvas');
			ctx = canvas.getContext('2d')
			canvas.style.background = "#000000"
			requestAnimationFrame(function(){
				renderLoop(callback)
			});
		}

		function renderLoop(callback) {
			if (DONE_ANIMATION) {
				console.log("ANIMATION DONE");
				callback()
				return
			}
			ctx.clearRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
			rectangle.completedAnimationDuration = []


				//setup for little box
				rectangle.x = (SCREEN_WIDTH - TWEET_WIDTH)/2

				var ANIMATION_TIMES = {
					boxUp:300,
					increaseWidth:500,
					inceaseHeight:300,
					fadeInText:200
				}

				setUpTextBoxes(function(){
					updateTweetHeight(function() {
						littleBoxUp(ANIMATION_TIMES.boxUp,function(){
							rectangle.completedAnimationDuration.push(ANIMATION_TIMES.boxUp)
							panWidth(ANIMATION_TIMES.increaseWidth,function(){
								rectangle.completedAnimationDuration.push(ANIMATION_TIMES.increaseWidth)
								panHeight(ANIMATION_TIMES.inceaseHeight, function(){
									rectangle.completedAnimationDuration.push(ANIMATION_TIMES.inceaseHeight)
									setUpTextBoxes(function() {
										addText(ANIMATION_TIMES.fadeInText, function(){
											DONE_ANIMATION = true;
										})	
									})
								})
							});
						})

					})
				})

				

			requestAnimationFrame(function(){
				renderLoop(callback)
			});
			
		}