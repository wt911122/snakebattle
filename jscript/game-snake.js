var game = this.game || {};
var createjs = this.createjs || {};

;(function(game, undefined){
	var encode = game.utility.encode;
	var ticker = createjs.Ticker;
	game.snake = function(coords, ground, length, auto){
		this._coords = coords;	
		this._tail = [];
		this._path = [];
		var R = game.utility.getRandomHex(255),
			G = game.utility.getRandomHex(255),
			B = game.utility.getRandomHex(255);
		this.color = "#" + R + G + B;
		this.score = 0;
		this._head = new game.sprite.snake_head(this.color);
		this.ground = ground;
		this.isDead = false;
		this._checkInterval = Math.round(Math.random(3));

		

		this.snakeLength = length || game.setting.initialSnakelength;
		this.initialSnakelength = this.snakeLength;
		this.setVelocity(game.setting.initialSnakeVelocity);

		this._direction = Math.random()*360;
		this._toDirection = this._direction;
		this._initBody();

		// crumbs consequence configuration
		this.timer = undefined;

		if(auto){
			this.auto = true;
			this.autoChangeTime = Math.random(200) + 500;
		}
	}

	game.snake.prototype = {
		tick: function(deltamS){
			if(this.isDead) return
			//console.log(deltamS)
			var	toRadian = game.utility.toRadian,
				span = this.velocity * deltamS,
				deltaX = span * Math.cos(toRadian(this._direction)),
				deltaY = span * Math.sin(toRadian(this._direction)),
				tickers = ticker.getTicks();
			if(tickers % 10 === 0 ){
				this.fps = ticker.getMeasuredFPS();
			}
				
				//console.log(deltaX, deltaY);
			this._coords.x += deltaX;
			this._coords.y += deltaY;


			this._path.push({x:this._coords.x, y: this._coords.y, delta: deltamS});
			this._updateDirection(deltamS);
			this._update();

			if((tickers + this._checkInterval) % 4 === 0){
				this._checkCrash();
				this._checkEdge();
				this._eat();
			}

			
			//console.log(this.auto);
			if(this.auto){
				this._detectEdge();
				this._autoTurn(deltamS);
			}
		},
		turnTo: function(degree){
			var dir = (degree + 360)%360;
			if(Math.abs(dir - this._direction) < 15) return;
			this._toDirection = (degree + 360)%360;
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
		_checkEdge: function(){
			if(this._coords.x < 6 || this._coords.x > game.setting.playgroundWidth-6 
				|| this._coords.y < 6 || this._coords.y > game.setting.playgroundWidth-6 ){
				console.log("this one is dead!");
				this.isDead = true;
				this._desolve();
				return
			}
		},
		_autoTurn: function(deltamS){
			if(ticker.getTicks() %  100 === 0){
				this.turnTo(Math.random()*60 - 30 + this._toDirection);
			}
		},
		_detectEdge: function(){
			//console.log("ai")
			var edge = game.setting.AIDangerBounding;
			this._toDirection = (this._toDirection + 360) % 360
			if((this._coords.x < edge && this._toDirection > 90 && this._toDirection < 270) ||
				(this._coords.x > game.setting.playgroundWidth - edge && (this._toDirection < 90 || this._toDirection > 270))) {
				//console.log("left or right")
				this.turnTo(180 - this._direction);
			}
			else if((this._coords.y < edge && this._toDirection > 180) || 
				(this._coords.y > game.setting.playgroundWidth - edge && this._toDirection < 180)){
				//console.log("top or bottom")
				this.turnTo( -this._direction);
			}
		},
		setVelocity: function(velocity){
			this.velocity = velocity;
			this.snakeSpinTime = game.setting.snakeSpinLength / this.velocity;
		},
		_updateDirection: function(deltaS){
			//console.log(game.utility.approximateCompare(this._direction, this._toDirection, 5))
			if(this.anglespan > 0){
				var step = Math.round(this.clockwise * (deltaS/this.snakeSpinTime));
				//console.log(step);
				this._direction += step
				this.anglespan -= Math.abs(step);
				//console.log(this._direction);
			}else{
				this._direction = this._toDirection;
			}
		},
		_checkCrash: function(){
			var snakes = game.playground.snakes;
			for(var one in snakes){
				if(snakes[one] !== this && !snakes[one].isDead){
					var tail = snakes[one]._tail;
					for(var idx in tail){
						//console.log(Math.pow(this.head.x - part.x, 2))
						var part = tail[idx];
						var d_x = part.x - this._head.x;
						var d_y = part.y - this._head.y;
						//var distance = Math.pow(d_x, 2) + Math.pow(d_y, 2);
						if(Math.abs(d_x) < 16 && Math.abs(d_y)< 16){
							console.log("this one is dead!");
							this.isDead = true;
							this._desolve();
							return
						}
						if(this.auto){
							var bound = game.setting.AIComfortBounding;
							if(Math.abs(d_x) < bound && Math.abs(d_y) < bound){
								var angle;
								if (d_x == 0) {
									if(d_y > 0) 
										angle = 90;
									else
										angle = 270;
								}else{
									angle = Math.atan(d_y/d_x)/Math.PI*180;
									if (d_x < 0)
                   					 	angle += 180;
                   					angle = (angle + 360) % 360;
                   				}
                   			//	console.log(angle, this._toDirection);
               					if (Math.abs(angle - this._toDirection) < 15){
               						console.log("turn");
            						this._toDirection += (Math.random()*180+90)
               					}
               						

							}
						}
					}
				}
			}
		},
		_desolve: function(){
			var crumbs = game.playground.crumbs,
				pieces = game.playground.crashedSnakePieces;
			this._head.visible = false;
			//var code = game.utility.encode(Math.round(this.head.x), Math.round(this.head.y));
			this._tail.forEach(function(item, idx){
				item.scaleX = item.scaleY = 0.6;
				item.score = 3;
				pieces.push(item);
				//crumbs[code] = item;
				//console.log(code)
			});
			
		},
		_eat: function(){
			var net = game.playground.network,
				refreshCrumb = game.playground.refreshCrumb,
				pieces = game.playground.crashedSnakePieces,
				coords = this._coords,
				netLoc = game.playground.getNetCoords(coords),
				t = net[netLoc.r][netLoc.c],
				idx, c;
			//console.log(t);
			if(t.sprite && !t.sprite.eaten){
				// 替换为 this._tryCrumb(t);
				t.eaten = true;
				t.sprite.visible = false;
				this.score += t.score;
				refreshCrumb(t);
				this._grow();
				// 
			}
			for(idx in t.neighbours){
				c = t.neighbours[idx];
				if(c.sprite && !c.eaten){
					//
					c.eaten = true;
					c.sprite.visible = false;
					this.score += c.score;
					refreshCrumb(c);
					this._grow();
					//
				}
			}

			idx = 0; 
			while(pieces[idx]){
				c = pieces[idx];
				if(Math.abs(c.x - coords.x) < 10 && Math.abs(c.y - coords.y) < 10){
					c.visible = false;
					this.score += c.score;
					pieces.splice(idx, 1);
					idx--;
				}
				idx++;
			}
		},
		_update: function(){
			// 蛇头
			this._head.x = this._coords.x;
			this._head.y = this._coords.y;
			this._head.rotation = this._direction;
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
				if(!elem.visible) elem.visible = true;
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
				var body = new game.sprite.snake_tail(this.color);
				this.ground.addChild(body);
				this._tail.push(body);
			}
			this.ground.addChild(this._head);
		},	
		_grow: function(){
			//console.log(this.score , game.setting.pointsToGrow, this.initialSnakelength)
			//console.log(Math.floor(this.score / game.setting.pointsToGrow) + this.initialSnakelength, this.snakeLength)
			if(Math.floor(this.score / game.setting.pointsToGrow) + this.initialSnakelength > this.snakeLength){
				var body = new game.sprite.snake_tail(this.color);
				body.visible = false;
				this.ground.addChild(body);
				this._tail.push(body);
				this.snakeLength ++;
				this.snakeCacheLength = this.snakeLength * this.snakeBodySpan;
			}
			//this.ground.setChildIndex(this.head, this.ground.children.length-1);
			//this.setVelocity();
		},
	}
}).call(this, game);
