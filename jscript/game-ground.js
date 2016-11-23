var createjs = this.createjs || {};
var game = this.game || {};

;(function(game, cjs){
	var quirkrefresher = game.setting.quirkModeRefresher;
	game.playground = {
		snakes: [],
		network: [],
		crashedSnakePieces: [],
		quirkCrumbs: [],
		init: function(){
			this.initGround();
			this.initNetWork();
			this.initCrumbs();
			this.initPlayer();
			this.initEnemies();
		},
		initGround: function(){
			this.ground = new game.sprite.playground({
				x: (game.setting.gameWidth-game.setting.playgroundWidth)/2 , 
				y: (game.setting.gameHeight-game.setting.playgroundWidth)/2, 
				width: game.setting.playgroundWidth,
				height: game.setting.playgroundWidth
			});
			game.stage.addChild(this.ground);
		},
		initNetWork: function(){
			var row = this.row = Math.floor(game.setting.playgroundWidth / game.setting.netWidth),
				col = this.col = Math.floor(game.setting.playgroundWidth / game.setting.netWidth),
				i;
			for(i=0;i<row;i++){
				this.network[i] = [];
			}
		},
		initCrumbs: function(){
			var n = game.setting.crumbsNum,
				net = this.network,
				nw = game.setting.netWidth,
				e = game.setting.detectRange,
				i, j, k, r, c, t;
			
			r = this.row;
			c = this.col;
			for(i=0;i<r;i++){
				net[i] = [];
				for(j=0;j<c;j++){
					net[i][j] = {neighbours:[]};
				}
			}

			for(var i=0;i<n;i++){
				r = Math.round(Math.random() * (this.row - 2)) + 1;
				c = Math.round(Math.random() * (this.col - 2)) + 1;
				if(!net[r][c].sprite){
					// 替换为 factory.generateACrumb();
					var sprite = new game.sprite.crumb();
					sprite.x = nw*c;
					sprite.y = nw*r;
					this.ground.addChild(sprite);
					//
					// 替换为 this.addToNet();
					console.log("added")
					net[r][c].sprite = sprite;
					net[r][c].eaten  = false;
					net[r][c].score  = 1;
					/*net[r][c] = game.crumbsFactory.generate();
					net[r][c].sprite.x = nw*c;
					net[r][c].sprite.y = nw*r;
					this.ground.addChild(net[r][c].sprite);*/
				}
			}

			r = this.row;
			c = this.col;
			for(i=0;i<r;i++){
				for(j=0;j<c;j++){
					for(k=1;k<=e;k++){
						t = net[i][j];
						if(net[i+k] && net[i+k][j].sprite)t.neighbours.push(net[i+k][j]);
						if(net[i+k] && net[i+k][j+k] && net[i+k][j+k].sprite)t.neighbours.push(net[i+k][j+k]);
						if(net[i+k] && net[i+k][j-k] && net[i+k][j-k].sprite)t.neighbours.push(net[i+k][j-k]);

						if(net[i][j-k] && net[i][j-k].sprite)t.neighbours.push(net[i][j-k]);
						if(net[i][j+k] && net[i][j+k].sprite)t.neighbours.push(net[i][j+k]);

						if(net[i-k] && net[i-k][j].sprite)t.neighbours.push(net[i-k][j]);
						if(net[i-k] && net[i-k][j+k] && net[i-k][j+k].sprite)t.neighbours.push(net[i-k][j+k]);
						if(net[i-k] && net[i-k][j-k] && net[i-k][j-k].sprite)t.neighbours.push(net[i-k][j-k]);
					}
				}
			}
		},
		initPlayer: function(){
			this.player = game.snake({
				coords:{
					x: game.setting.playgroundWidth/2, 
					y: game.setting.playgroundWidth/2
				},
				ground: this.ground
			});
			this.snakes.push(this.player);
		},
		initEnemies: function(){
			console.log("initEnemies")
			for(var i=0, len=game.setting.enemyNum;i<len;i++){
				var snake = game.snake({
					coords:{
						x: Math.random()*(game.setting.playgroundWidth-20) + 10, 
						y: Math.random()*(game.setting.playgroundWidth-20) + 10,
					},
					ground: this.ground,
					length: Math.round(Math.random() * 5) + 5,
					auto: {
						autoChangeTime: Math.round(Math.random(50)) + 50
					}
				});
				this.snakes.push(snake);
			}
		},
		getNetCoords: function(coords){
			var nw = game.setting.netWidth;
			return {
				c: Math.round(coords.x / nw),
				r: Math.round(coords.y / nw)
			}
		},
		refreshCrumb: function(crumb){
			setTimeout(function(){
				crumb.eaten = false;
				crumb.sprite.visible = true;
			}, game.setting.crumbRefresh);
		},
		_changePixel: function(){
			this.ground.x = game.setting.gameWidth/2 - this.player.coords.x;
			this.ground.y = game.setting.gameHeight/2 - this.player.coords.y;
		},

		_snakeTicks: function(deltaS){
			this.snakes.forEach(function(em){
				em.tick(deltaS);
			});
		},
		_quirkCrumbsTicks: function(){

			var ts = cjs.Ticker.getTicks(), crumb;
			if(ts % quirkrefresher == 0){
				console.log("quirkCrumbs");
				crumb = game.quirkCrumbsFactory.generate();
				crumb.x = crumb.sprite.x = Math.random()*(game.setting.playgroundWidth-20) + 10; 
				crumb.y = crumb.sprite.y = Math.random()*(game.setting.playgroundWidth-20) + 10;
				this.ground.addChild(crumb.sprite);
				this.quirkCrumbs.push(crumb);
			}
		},
		tick: function(event){
			if(!cjs.Ticker.paused){
				//console.log();
				//this.player.tick(event.delta);
				//this.ticker = cjs.Ticker.getTicks();
				this._snakeTicks(event.delta);
				this._changePixel();
				this._quirkCrumbsTicks();
			//	this.ground.updateCache();
			}
		}
	}
}).call(this, game, createjs);