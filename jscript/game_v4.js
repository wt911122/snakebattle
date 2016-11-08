var game = this.game || {};
var createjs = this.createjs || {};

;(function(game){
	game.PI2 = Math.PI*2;
	game.canvas = document.getElementById('stage');
	game.touchHandlerDom = document.getElementById('motionhandler');
	game.touchHandlerBtn = game.touchHandlerDom.querySelector("button.MotionControler");
	var	bt = game.touchHandlerBtn.getBoundingClientRect();
	game.touchHandlerCenter = {
		x: bt.left + bt.width/2,
		y: bt.top + bt.height/2
	}

	game.utility.resizeCanvas();

	game.setting = {
		FPS: 40,

		gameWidth: game.canvas.width,
		gameHeight: game.canvas.height,

		snakeRadius: 8,
		snakeSpinLength: 0.175, 
		snakeBodySpan: 16, 			// px
		initialSnakeVelocity: 0.2, // px/ms  
		initialSnakelength: 5,
		pointsToGrow: 1,

		playgroundWidth: 300,
		crumbsNum: 1,
		enemyNum: 10

	}
}).call(this, game);


;(function(game){
	game.snake = function(coords, ground, length){
		this._coords = coords;	
		this._tail = [];
		this._path = [];
		this.storage = 0;
		this.head = new game.sprite.snake_head();
		this.ground = ground;
		this.iddead = false;
		
		this.snakeLength = length || game.setting.initialSnakelength;
		this.setVelocity(game.setting.initialSnakeVelocity);

		this._direction = Math.random()*360;
		this._toDirection = this._direction;
		this._initBody();
	}
	var counter = 0;
	game.snake.prototype = {
		tick: function(deltamS){
			//console.log(deltamS)
			var	toRadian = game.utility.toRadian,
				span = this.velocity * deltamS,
				deltaX = span * Math.cos(toRadian(this._direction)),
				deltaY = span * Math.sin(toRadian(this._direction));
			if(counter === 0){
				this.fps = createjs.Ticker.getMeasuredFPS();
			}
			counter += deltamS;
			if(counter > 200){
				counter = 0;
			}
				
				//console.log(deltaX, deltaY);
			this._coords.x += deltaX;
			this._coords.y += deltaY;


			this._path.push({x:this._coords.x, y: this._coords.y, delta: deltamS});
			this._updateDirection(deltamS);
			this._update();
			this.eatCrumbs();
		},
		turnTo: function(degree){
			this._toDirection = degree;
			var span = degree - this._direction;
			if(span < -180 || span >= 180){
				this.clockwise = (span> 0?-1:1);
				this.anglespan = 360 - Math.abs(span);
			}
			if(span >= -180 && span < 180){
				this.clockwise = (span> 0?1:-1);
				this.anglespan = Math.abs(span);
			}

		},
		setVelocity: function(velocity){
			this.velocity = velocity;
			this.snakeSpinTime = game.setting.snakeSpinLength / this.velocity;
		},
		_updateDirection: function(deltaS){
			//console.log(game.utility.approximateCompare(this._direction, this._toDirection, 5))
			if(this.anglespan > 0){
				var step = this.clockwise * (deltaS/this.snakeSpinTime);
				this._direction += step
				this.anglespan -= Math.abs(step);
				//console.log(this._direction);
			}else{
				this._direction = this._toDirection;
			}
		},
		_update: function(){
			// 蛇头
			this.head.x = this._coords.x;
			this.head.y = this._coords.y;
			this.head.rotation = this._direction;
			var idx = 0,
				lag = Math.round(game.setting.snakeBodySpan/this.velocity/1000*this.fps),
				cacheIndex = 0;
				//console.log(lag, this.fps);
			while(idx < this.snakeLength){
				var index = (idx + 1)*lag + 1, 
					cacheIndex = Math.max(0, this._path.length - index);
					pos = this._path[cacheIndex]; 
					elem = this._tail[idx];
				if(pos){
					elem.x = pos.x;
					elem.y = pos.y;
				}
				idx++;
			}
			//console.log(cacheIndex);
			if(cacheIndex > 0){
				this._path.splice(0, cacheIndex-1);
			}
			//console.log(this._coords);
		},
		_initBody: function(){
			
			for(var i=this.snakeLength-1; i>-1  ;i--){
				var body = new game.sprite.snake_tail()
				this.ground.addChild(body);
				this._tail.push(body);
			}
			this.ground.addChild(this.head);
		},	
		_grow: function(){
			var body = new game.sprite.snake_tail();
			this.ground.addChild(body);
			this._tail.push(body);
			this.snakeLength ++;
			this.snakeCacheLength = this.snakeLength * this.snakeBodySpan;
			//this.ground.setChildIndex(this.head, this.ground.children.length-1);
			//this.setVelocity();
		},
		eatCrumbs: function(){
			var range = 14,
				inrange = 0;
			/*//扇形吃
			for(var r = 8; r < range; r++){
				for(var theta = this.head.rotation-60; theta<this.head.rotation+60; theta += 5){
					var idx = game.utility.encode(Math.round(r*Math.cos(theta) + this.head.x), Math.round(r*Math.sin(theta) + this.head.y));
					//console.log(idx)
					if(game.playground.crumbs[idx]){
						console.log(game.playground.ground.removeChild(game.playground.crumbs[idx]));
						game.playground.crumbs[idx] = undefined;
						console.log("eat: "+idx);
					}
				}	
			}*/
			//矩形吃
			for(var i = -range ;i <= range; i++){
				for(var j = -range ;j <= range; j++){
					//if((i < -inrange || i > inrange) && ((j < -inrange || j > inrange))){
						var idx = game.utility.encode(Math.round(this.head.x +i), Math.round(this.head.y + j));
						//console.log(idx)
						if(game.playground.crumbs[idx]){
							//console.log(game.playground.ground.removeChild(game.playground.crumbs[idx]));
							game.playground.crumbs[idx].visible = false; // TODO 优化性能
							game.playground.crumbs[idx] = undefined;
							//console.log("eat: "+idx);
							this.storage++;
							if(this.storage % game.setting.pointsToGrow == 0){
								this._grow();
							}
							game.playground.supply();
						}
					//}
				}
			}
		}
	}
}).call(this, game);

;(function(){
	game.keyHandler = {
		init: function(){
			window.addEventListener("keydown", function(event){
				if (event.defaultPrevented) {
					return; // Should do nothing if the key event was already consumed.
				}
				switch (event.key) {
					case "ArrowDown":
						//console.log("down")
						game.playground.player.turnTo(90);
						break;
					case "ArrowUp":
						//console.log("up")
						game.playground.player.turnTo(270);
						break;
					case "ArrowLeft":
						//console.log("left")
						game.playground.player.turnTo(180);
						break;
					case "ArrowRight":
						//console.log("right")
						game.playground.player.turnTo(0);
						break;

					default:
						return; // Quit when this doesn't handle the key event.
				}
			})
		}
	}
}).call(this, game);
;(function(){
	game.touchHandler = {
		init: function(){
			game.touchHandlerDom.addEventListener("mousedown", function(event){
				var x = event.pageX, 
					y = event.pageY;
				game.playground.player.turnTo(transCoord(x, y));
			});
			/*game.touchHandlerDom.addEventListener("mousemove", function(event){
				var x = event.pageX, 
					y = event.pageY;
				transCoord(x, y);
			});*/
			game.touchHandlerDom.addEventListener("mouseup", function(event){
				//backCoord();
			});
		},
	}
	function transCoord(x, y){
		var deltaX = x - game.touchHandlerCenter.x,
			deltaY = y - game.touchHandlerCenter.y,
			theta = Math.atan(deltaY/deltaX);
		theta = theta/Math.PI*180;
		if(deltaX < 0){
			theta += 180;
		}else{
			if(deltaY < 0){
				theta = 360 + theta;
			}
		}
		var left = 13 * Math.cos(theta/180*Math.PI),
			top =  13 * Math.sin(theta/180*Math.PI);
			//console.log(left, top);
		game.touchHandlerBtn.style.transform = "translate("+left+"px,"+top+"px)";
		return theta;
	}
	function backCoord(){
		game.touchHandlerBtn.style.transform = "translate(0px,0px)";
	}
}).call(this, game);


;(function(game, cjs){
	game.playground = {
		crumbs: {},
		enemys: [],
		init: function(){
			var ground = this.ground = new game.sprite.playground({
				x: (game.setting.gameWidth-game.setting.playgroundWidth)/2 , 
				y: (game.setting.gameHeight-game.setting.playgroundWidth)/2, 
				width: game.setting.playgroundWidth,
				height: game.setting.playgroundWidth
			});
			this._spreadCrumbs();
			//console.log(this.crumbs);
			game.stage.addChild(ground);

			var player = this.player = new game.snake({
				x: game.setting.playgroundWidth/2, 
				y: game.setting.playgroundWidth/2
			}, ground);	
			
			//this._spreadEnemys();

		},

		_changePixel: function(){
			this.ground.x = game.setting.gameWidth/2 - this.player._coords.x;
			this.ground.y = game.setting.gameHeight/2 - this.player._coords.y;
		},

		_spreadCrumbs: function(){
			for(var i=0;i<game.setting.crumbsNum;i++){
				var x = Math.round(Math.random()*(game.setting.playgroundWidth-20)) + 10;
				var y = Math.round(Math.random()*(game.setting.playgroundWidth-20)) + 10;
				var code = game.utility.encode(x, y);
				if(!this.crumbs[code]){
					var sprite = new game.sprite.crumb();
					sprite.x = x;
					sprite.y = y;
					this.ground.addChild(sprite);
					this.crumbs[code] = sprite;
				}else{
					i--;
				}
			}
		},
		supply: function(){
			do{
				var x = Math.round(Math.random()*(game.setting.playgroundWidth-20)) + 10;
				var y = Math.round(Math.random()*(game.setting.playgroundWidth-20)) + 10;
				var code = game.utility.encode(x, y);
			}while(this.crumbs[code]);
			var sprite = new game.sprite.crumb();
			sprite.x = x;
			sprite.y = y;
			this.ground.addChild(sprite);
			this.crumbs[code] = sprite;
		},
		_spreadEnemys: function(){
			for(var i=0;i<game.setting.enemyNum;i++){
				var snake =  new game.snake({
					x: Math.random()*(game.setting.playgroundWidth-20) + 10, 
					y: Math.random()*(game.setting.playgroundWidth-20) + 10,
				}, this.ground, Math.round(Math.random() * 5) + 5);
				this.enemys.push(snake);
			}
		},
		_enemyTicks: function(deltaS){
			this.enemys.forEach(function(em){
				em.tick(deltaS);
			});
		},
		/*showCrumbs: function(){
			var dx = this.player.x + game.setting.gameWidth/2,
				tx = this.player.x - game.setting.gameWidth/2,
				dy = this.player.y + game.setting.gameHeight/2,
				ty = this.player.y - game.setting.gameHeight/2;
			for(var key in this.crumbs){
				var x = this._parseKey(key)[1],
				 	y = this._parseKey(key)[2];
				if(x>tx && x<dx && y>ty && y<dy){
					this.ground.addChild()//????
				}
			}
		},*/
		tick: function(event){
			if(!cjs.Ticker.paused){
				//console.log();
				this.player.tick(event.delta);
				this._enemyTicks(event.delta);
				this._changePixel();
			//	this.ground.updateCache();
			}
		}
	}
}).call(this, game, createjs);

;(function(game, cjs){
	game.gameView = {
		init: function(){
			cjs.Ticker.timingMode = createjs.Ticker.RAF;
		//	cjs.Ticker.useRAF = true;

			cjs.Ticker.addEventListener("tick", game.playground.tick.bind(game.playground));
			
			cjs.Ticker.addEventListener("tick", game.stage);
		}
	}
}).call(this, game, createjs);


;(function(game, cjs){
	game.start = function(){
		game.stage = new cjs.Stage(game.canvas);
		cjs.Touch.enable(game.stage);
		var initAll = function(){
			game.keyHandler.init();
			game.touchHandler.init();
			game.playground.init();
			game.gameView.init();
		}
		initAll();
	}
}).call(this, game, createjs);

;(function(game){
	if (game){
		game.start();
	}else{
		throw "No logic Found";
	}
}).call(this, game)