"use strict";

var createjs = require("easeljs");require("tweenjs");

var Setting = require("./scripts/Setting");
var Sprite = require("./scripts/Sprite");
var CrumbManager = require("./scripts/CrumbManager");
var SnakeManager = require("./scripts/SnakeManager");
var MapManager = require("./scripts/MapManager");
console.log(SnakeManager);

var Ticker = createjs.Ticker;
var Point = createjs.Point;

var canvas = document.getElementById("stage"),
    fpsRate = document.getElementById("fps-rate"),
    motionRegion = document.getElementById("motionhandler"),
    motionBtn = motionRegion.querySelector("button.MotionControler"),
    velocityRegion = document.getElementById("velocityHandler"),
    gameEndScene = document.getElementById("game-end-scene"),
    repeatBtn = document.getElementById("repeat-btn"),
    backwardBtn = document.getElementById("backward-btn"),
    snakeLengthResult = document.getElementById("snake-length"),
    snakeKillResult = document.getElementById("snake-kill"),
    timeremain = document.getElementById("time-remain"),
    stage = void 0,
    mapLayer = void 0,
    player = void 0,
    mode = void 0,
    timeall = 0;

var motionbounds = motionBtn.getBoundingClientRect(),
    motionCenter = {
	x: motionbounds.left + motionbounds.width / 2,
	y: motionbounds.top + motionbounds.height / 2
};

function init() {
	var ctx = canvas.getContext('2d');

	// polyfill 提供了这个方法用来获取设备的 pixel ratio
	var getPixelRatio = function getPixelRatio(context) {
		var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

		return (window.devicePixelRatio || 1) / backingStore;
	};

	var ratio = getPixelRatio(ctx);

	console.log(ratio);
	var actualBounds = document.body.getBoundingClientRect();
	Setting.SCREEN_WIDTH = canvas.getBoundingClientRect().width * ratio;
	Setting.SCREEN_HEIGHT = canvas.getBoundingClientRect().height * ratio;
	canvas.style.width = actualBounds.width + "px";
	canvas.style.height = actualBounds.height + "px";
	canvas.width = Setting.SCREEN_WIDTH;
	canvas.height = Setting.SCREEN_HEIGHT;
	stage = new createjs.Stage(canvas);

	initMap();
	initCrumb();
	initSnake();
}

function initMap() {
	mapLayer = new Sprite.map({
		x: (Setting.SCREEN_WIDTH - Setting.PLAYGROUND_WIDTH) / 2,
		y: (Setting.SCREEN_HEIGHT - Setting.PLAYGROUND_HEIGHT) / 2,
		width: Setting.PLAYGROUND_WIDTH,
		height: Setting.PLAYGROUND_HEIGHT
	});
	stage.addChild(mapLayer);
}

function initCrumb() {
	CrumbManager.init(mapLayer);
}

function initSnake() {
	player = SnakeManager.init(mapLayer);
}

function updateManager(event) {
	var dt = event.delta;
	SnakeManager.update(dt, function (score, kill) {
		gameEndScene.style.display = "flex";
		snakeLengthResult.innerText = score;
		snakeKillResult.innerText = kill;
		if (mode === 'time') {
			Ticker.removeEventListener("tick", timerHandler);
		}
	}, this);
	CrumbManager.update(dt);
	mapLayer.setTransform(Setting.SCREEN_WIDTH / 2 - player.Pos.x, Setting.SCREEN_HEIGHT / 2 - player.Pos.y);
}

function update() {
	Ticker.timingMode = Ticker.RAF;
	Ticker.framerate = 60;
	Ticker.addEventListener("tick", stage);
	Ticker.addEventListener("tick", function () {
		fpsRate.innerText = Ticker.getMeasuredFPS().toFixed(2);
	});
	Ticker.addEventListener("tick", updateManager);
}

function addPCEventListener() {
	document.addEventListener("keydown", function (event) {
		if (event.defaultPrevented) {
			return; // Should do nothing if the key event was already consumed.
		}
		console.log(event.key + " down");
		switch (event.key) {
			case "a":
				player.setAccelarate(true);
				velocityRegion.classList.add("active");
				break;
			default:
				return; // Quit when this doesn't handle the key event.
		}
	}, false);
	document.addEventListener("keyup", function (event) {
		if (event.defaultPrevented) {
			return; // Should do nothing if the key event was already consumed.
		}
		console.log(event.key + " up");
		switch (event.key) {
			case "a":
				player.setAccelarate(false);
				velocityRegion.classList.remove("active");
				break;
			default:
				return; // Quit when this doesn't handle the key event.
		}
	}, false);

	//var t = null;
	var down = false;
	document.body.addEventListener("mousedown", function (event) {
		down = true;
	});
	document.body.addEventListener("mousemove", function (event) {
		if (down) {
			transCoordPC(event.clientX, event.clientY);
		}
	});
	document.body.addEventListener("mouseup", function () {
		backCoord();
	});
	repeatBtn.addEventListener("click", refresh);
	backwardBtn.addEventListener("click", function () {
		window.location.href = "./preload.html";
	});
}

function touchHandler(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	//console.log(evt.touches.length)
	if (evt.touches.length > 2 || evt.type == "touchend" && evt.touches.length > 0) return;
	if (evt.touches.length == 1) {
		var touch = evt.changedTouches[0];
		var x = touch.clientX,
		    y = touch.clientY;
	} else {
		var touch1 = evt.changedTouches[0],
		    touch2 = evt.changedTouches[0];
		var x1 = touch1.clientX,
		    y1 = touch1.clientY,
		    x2 = touch2.clientX,
		    y2 = touch2.clientY;
		var x = x1 > x2 ? x2 : x1,
		    y = x1 > x2 ? y2 : y1;
	}
	transCoord(x, y);
}
function transCoordPC(x, y) {
	var deltaX = x - window.innerWidth / 2,
	    deltaY = y - window.innerHeight / 2,
	    mod = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	deltaX /= mod, deltaY /= mod;
	player.RotateTo(new Point(deltaX, deltaY));
	motionBtn.style.transform = "translate(" + deltaX * motionbounds.width / 2 + "px," + deltaY * motionbounds.height / 2 + "px)";
}
function transCoord(x, y) {
	var deltaX = x - motionCenter.x,
	    deltaY = y - motionCenter.y,
	    mod = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	deltaX /= mod, deltaY /= mod;
	player.RotateTo(new Point(deltaX, deltaY));
	motionBtn.style.transform = "translate(" + deltaX * motionbounds.width / 2 + "px," + deltaY * motionbounds.height / 2 + "px)";
}
function backCoord() {
	motionBtn.style.transform = "translate(0px,0px)";
}
function addEventListener() {
	var type = browserRedirect();
	if (type == "mobile") {
		motionRegion.addEventListener("touchstart", touchHandler);
		motionRegion.addEventListener("touchmove", touchHandler);
		motionRegion.addEventListener("touchend", function () {
			backCoord();
		});

		velocityRegion.addEventListener("touchstart", velocityHandler);
		velocityRegion.addEventListener("touchend", function () {
			player.setAccelarate(false);
			velocityRegion.classList.remove("active");
		});
		repeatBtn.addEventListener("touchend", refresh);
		backwardBtn.addEventListener("touchend", function () {
			window.location.href = "./preload.html";
		});
		window.addEventListener("orientationchange", function () {
			var temp = Setting.SCREEN_WIDTH;
			Setting.SCREEN_WIDTH = Setting.SCREEN_HEIGHT;
			Setting.SCREEN_HEIGHT = temp;
			canvas.width = Setting.SCREEN_WIDTH;
			canvas.height = Setting.SCREEN_HEIGHT;
			canvas.style.left = 0 + "px";
		});
	}

	if (type == "pc") {
		addPCEventListener();
	}
}
function velocityHandler(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	//console.log(evt.touches.length)
	if (evt.touches.length > 2 || evt.type == "touchend" && evt.touches.length > 0) return;
	velocityRegion.classList.add("active");
	player.setAccelarate(true);
}

function refresh() {
	stage.removeAllChildren();
	stage.clear();
	MapManager.clear();
	CrumbManager.clear();
	SnakeManager.clear();
	gameEndScene.style.display = "none";

	if (mode === 'time') {
		initTimer();
	}
	initMap();
	initCrumb();
	initSnake();
}

function browserRedirect() {
	var sUserAgent = navigator.userAgent.toLowerCase();
	var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
	var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
	var bIsMidp = sUserAgent.match(/midp/i) == "midp";
	var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
	var bIsAndroid = sUserAgent.match(/android/i) == "android";
	var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
	var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
	if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
		return "mobile";
	} else {
		return "pc";
	}
}

function timerHandler(evt) {
	var dt = evt.delta;
	timeall -= dt;
	if (timeall <= 0) {
		timeall = 0;
		gameEndScene.style.display = "flex";
		snakeLengthResult.innerText = player.Score;
		snakeKillResult.innerText = player.Kill;
		player.sentenceDie();
		Ticker.removeEventListener("tick", this);
	}
	var now = new Date(timeall),
	    nowSecond = now.getSeconds(),
	    nowMillionSecond = (now.getMilliseconds() / 10).toFixed(0);
	var str = "TIME: ";
	str += nowSecond / 10 > 1 ? nowSecond + '' : '0' + nowSecond;
	str += ':';
	str += nowMillionSecond / 10 > 1 ? nowMillionSecond + '' : '0' + nowMillionSecond;
	timeremain.innerText = str;
}
function initTimer() {
	timeall = 60 * 1000, Ticker.addEventListener("tick", timerHandler);
}

window.onload = function () {
	/*requestAnimationFrame = window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame;
 	if(!requestAnimationFrame) { alert('你的浏览器不支持requestAnimationFrame！'); return }*/

	init();
	mode = window.location.search.split('=')[1];
	if (mode === 'time') {
		initTimer();
	}
	//var audio = new Audio('./audio/snakebgm.mp3');
	//audio.play();

	update();
	addEventListener();
};

