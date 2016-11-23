var game = this.game || {};
var createjs = this.createjs || {};

;(function(game, cjs){
	var encode = game.utility.encode;
	var ticker = createjs.Ticker;

	game.snake = function(config){
		    // sprites
		var	_head,
			_tail = [],

			// static values
			_GROUND,
			_INITIAL_SNAKE_LENGTH,
			_CHECK_INTERVAL =  Math.round(Math.random(3)),
			_AUTO,
			_SNAKE_BODY_SPAN = game.setting.snakeBodySpan,
			_GAME_WIDTH =      game.setting.playgroundWidth,
			_POINTS_TO_GROW =  game.setting.pointsToGrow,
			_SPIN_LENGTH =     game.setting.snakeSpinLength,

			// path Cache
			_path = [],

			// mode Lib
			_MODE_LIB = {},
			_MODE = undefined,
			_timer = undefined,
			_lastQuiekCrumb = undefined,
			// function can override


			// snake State
			_coords,
			_snakeLength,
			_color =          game.utility.getRandomColor(),
			_isDead =         false,
			_direction =      Math.random()*360,
			_toDirection =    _direction,
			_anglespan =      0,  
			_snakeSpinTime =  undefined,
			_clockwise =      undefined,
			_velocity =       game.setting.initialSnakeVelocity,
			_fps =            undefined,
			_checkCrashBoudary = 16,

			// snake AI
			_AIDangerBounding = game.setting.AIDangerBounding, 
			_AIComfortBounding = game.setting.AIComfortBounding;
			// score
			_score = 0,

			// borrowed functions or object
			toRadian =     game.utility.toRadian,
			Ticker =       createjs.Ticker,
			Snakes =       game.playground.snakes,
			net =          game.playground.network,
			refreshCrumb = game.playground.refreshCrumb,
			pieces =       game.playground.crashedSnakePieces,
			quirkCrumbs =  game.playground.quirkCrumbs,
			getNetCoords = game.playground.getNetCoords,
			spriteFactory= game.sprite;
		

		function _checkEdge(){
			if(_coords.x < 6 || _coords.x > _GAME_WIDTH-6 
				|| _coords.y < 6 || _coords.y > _GAME_WIDTH-6 ){
				console.log("this one is killed by edge!");
				_isDead = true;
				_desolve();
				return
			}
		}


		function _checkCrashBoundary(d_x, d_y){
			return Math.abs(d_x) < _checkCrashBoudary && Math.abs(d_y) < _checkCrashBoudary
		}

		function _checkCrash(){
			for(var one in Snakes){
				if(Snakes[one] !== this && !Snakes[one].isDead){
					var itr = Snakes[one].TAIL()
					while(itr.hasNext()){
						var part = itr.next(),
							d_x = part.x - _head.x,
							d_y = part.y - _head.y;
						if(this._checkCrashBoundary(d_x, d_y)){
							console.log("this one is killed by crash!");
							_isDead = true;
							_desolve();
							return;
						}
						if(_AUTO){
							var bound = _AIComfortBounding;
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
               					if (Math.abs(angle - _toDirection) < 15){
            						_toDirection += (Math.random()*180+90)
               					}
							}
						}
					}
				}
			}
		}

		function _desolve(){
			_head.visible = false;
			//var code = game.utility.encode(Math.round(this.head.x), Math.round(this.head.y));
			_tail.forEach(function(item, idx){
				item.scaleX = item.scaleY = 0.6;
				item.score = 3;
				pieces.push(item);
				//crumbs[code] = item;
				//console.log(code)
			});
		}

		function _updateDirection(deltamS){
			if(_anglespan > 0){

				var step = Math.round(_clockwise * (deltamS/_snakeSpinTime));
				//console.log(step);
				_direction += step
				_anglespan -= Math.abs(step);
			}else{
				_direction = _toDirection;
			}
		}

		function _update(){
			_head.x = _coords.x;
			_head.y = _coords.y;
			_head.rotation = _direction;
			var idx = 0,
				lag = Math.round(_SNAKE_BODY_SPAN / _velocity / 1000 * _fps),
				cacheIndex = 0;
			//console.log(_snakeLength)
			while(idx < _snakeLength){
				var index = (idx + 1)*lag + 1, 
					cacheIndex = Math.max(0, _path.length - index);
					pos = _path[cacheIndex]; 
					elem = _tail[idx];
				if(pos){
					elem.x = pos.x;
					elem.y = pos.y;
				}
				if(!elem.visible) elem.visible = true;
				idx++;
			}
			if(cacheIndex > 0){
				_path.splice(0, cacheIndex-1);
			}
		}

		function _initBody(){
			_head = new spriteFactory.snake_head(_color);
			for(var i= _snakeLength-1; i>-1  ;i--){
				var body = new spriteFactory.snake_tail(_color);
				_GROUND.addChild(body);
				_tail.push(body);
			}
			_GROUND.addChild(_head);
		}

		function _generateBody(){
			return new spriteFactory.snake_tail(_color);
		}

		function _grow(){
			if(Math.floor(_score / _POINTS_TO_GROW) + _INITIAL_SNAKE_LENGTH > _snakeLength){
				var body = this._generateBody();
				body.visible = false;
				_GROUND.addChild(body);
				_tail.push(body);
				_snakeLength ++;
			}
		}

		function _setVelocity(V){
			_velocity = V;
			_snakeSpinTime = _SPIN_LENGTH / V;
		}

		function _turnTo(degree){
			var dir = (degree + 360)%360;
			if(Math.abs(dir - _direction) < 15) return;
			_toDirection = dir
			var span = _toDirection - _direction;
			if(span < -180 || span >= 180){
				_clockwise = (span> 0?-1:1);
				_anglespan = 360 - Math.abs(span);
			}
			if(span >= -180 && span < 180){
				_clockwise = (span> 0?1:-1);
				_anglespan = Math.abs(span);
			}
			//console.log(_clockwise, _anglespan)
		}

		function _eatchecker(center, callback){
			var neighbours = center.neighbours, 
				c;
			for(var len = neighbours.length, idx = len-1; idx>=0;idx--){
				c = neighbours[idx];
				if(c.sprite && !c.eaten){
					callback(c);
				}
			}
		}

		function _eat(){
			//console.log(_coords);
			var netLoc = getNetCoords(_coords),
				t = net[netLoc.r][netLoc.c],
				idx, c,
				self = this;
			if(t.sprite && !t.sprite.eaten){
				// 替换为 this._tryCrumb(t);
				t.eaten = true;
				t.sprite.visible = false;
				_score += t.score;
				refreshCrumb(t);
				this._grow();
				// 
			}

			this._eatchecker(t, function(c){
					c.eaten = true;
					c.sprite.visible = false;
					_score += c.score;
					refreshCrumb(c);
					self._grow();
			});

			/*for(idx in t.neighbours){
				c = t.neighbours[idx];
				if(c.sprite && !c.eaten){
					//
					c.eaten = true;
					c.sprite.visible = false;
					_score += c.score;
					refreshCrumb(c);
					this._grow();
					//
				}
			}*/
			idx = 0; 
			while(c = pieces[idx]){
				if(Math.abs(c.x - _coords.x) < 20 && Math.abs(c.y - _coords.y) < 20){
					c.visible = false;
					_score += c.score;
					pieces.splice(idx, 1);
					idx--;
				}
				idx++;
			}
			idx = 0;
			while(c = quirkCrumbs[idx]){
				if(Math.abs(c.x - _coords.x) < 20 && Math.abs(c.y - _coords.y) < 20 && !_timer){
					console.log("eat quirk")
					c.sprite.visible = false;
					c.consequence.call(this);

					_timer = setTimeout((function(t){
						return function(){
							if(!_isDead){
								t.deconsequence.call(self);
							}
							_timer = undefined
						}
					}(c)), 3000)
					quirkCrumbs.splice(idx, 1);
					idx--;
					_lastQuiekCrumb = c;
				}
				idx++;
			}
		}


		function _detectEdge(){
			var edge = _AIDangerBounding;
			_toDirection = (_toDirection + 360) % 360
			if((_coords.x < edge && _toDirection > 90 && _toDirection < 270) ||
				(_coords.x > _GAME_WIDTH - edge && (_toDirection < 90 || _toDirection > 270))) {
				//console.log("left or right")
				_turnTo(180 - _direction);
			}
			else if((_coords.y < edge && _toDirection > 180) || 
				(_coords.y > _GAME_WIDTH - edge && _toDirection < 180)){
				//console.log("top or bottom")
				_turnTo( -_direction);
			}
		}
		function _autoTurn(){
			if(Ticker.getTicks() % _AUTO.autoChangeTime === 0){
				_turnTo(Math.random()*60 - 30 + _toDirection);
			}
		}

		// 构造器
		function constructor(){
			_MODE = config.mode;
			_coords = config.coords;
			_GROUND = config.ground;
			_INITIAL_SNAKE_LENGTH = config.length || game.setting.initialSnakelength;
			_snakeLength = _INITIAL_SNAKE_LENGTH;
			_AUTO = config.auto;
			_initBody();
			_setVelocity(game.setting.initialSnakeVelocity);
		}
		constructor.prototype = {
			constructor: constructor,
			tick: function(deltams){
				if(_isDead) return;
			
					//console.log(_direction)
					var span = _velocity * deltams,
						deltaX = span * Math.cos(toRadian(_direction)),
						deltaY = span * Math.sin(toRadian(_direction)),
						ts = Ticker.getTicks();

					_coords.x += deltaX;
					_coords.y += deltaY;

					_path.push({
						x: _coords.x, 
						y: _coords.y, 
						delta: deltams
					});
					_updateDirection(deltams);
					_update();

					if(ts % 10 === 0 ){
						_fps = ticker.getMeasuredFPS();
					}

					if((ts + _CHECK_INTERVAL) % 4 === 0){
						//try{
							this._checkCrash();
							_checkEdge();
							this._eat();
						//}catch(e){
					//		console.error(e);
						//	cjs.Ticker.paused = true;
						//}
					}

					if(_AUTO){
						_detectEdge();
						_autoTurn();
					}
				
			},
			TAIL: function(){
				var length = _tail.length;  
        		index = 0; 
				return {
					hasNext:function(){  
		                return index < length;  
		            },
		            next: function(){
		            	var data = _tail[index];  
		                index = index+1;  
		                return data;  
		            },
		            reset: function(){
		            	index = 0;
		            }
				}
			},
			get HEAD(){
				return _head;
			},
			set DIRECTION(value){
				_turnTo(value);
			},
			set VELOCITY(value){
				_setVelocity(value);
			},
			get coords(){
				return _coords;
			},
			get isDead(){
				return _isDead;
			},
			set MODE(value){
				console.log("set MODE");
				var obj = _MODE_LIB[value];
				if(obj){
					console.log("mode changed to "+value);
					if(obj.checkCrashBoundary) this._checkCrashBoundary = obj.checkCrashBoundary;
					if(obj.generateBody) this._generateBody = obj.generateBody;
					if(obj.eatchecker) this._eatchecker = obj.eatchecker;
				}
			}
		}
		constructor.prototype._eat = _eat;
		constructor.prototype._checkCrash = _checkCrash;
		constructor.prototype._checkCrashBoundary = _checkCrashBoundary;
		constructor.prototype._grow = _grow;
		constructor.prototype._generateBody = _generateBody;
		constructor.prototype._eatchecker = _eatchecker;


		_MODE_LIB = {
			normal: {
				checkCrashBoundary: _checkCrashBoundary,
				generateBody: _generateBody,
				eatchecker: _eatchecker,
			},
			enlarge: {
				generateBody: function(){
					var sp = new spriteFactory.snake_tail(_color);
					sp.scaleX = sp.scaleY = 1.5;
					return sp;
				}
			},
			broadRange: {
				eatchecker: function(center, callback){
					var neighbours = center.neighbours;

					for(var len = neighbours.length, idx = len-1; idx>=0;idx--){
						var c = neighbours[idx];
						if(c.sprite && !c.eaten){
							callback(c);
						}
						q = c.neighbours;
						for(var len2 = q.length, idx2 = len2-1; idx2 >=0; idx2--){
							var cc = q[idx2];
							if(cc.sprite && !cc.eaten){
								callback(cc);
							}
						}
						
					}
				}
			}
		}

		return new constructor();

	};
}).call(this, game, createjs)



