"use strict";

function getRandomHex(range) {
	return new Number(Math.round(Math.random() * range)).toString(16);
}

module.exports = {
	resizeCanvas: function resizeCanvas(canvas) {
		var w = window.innerWidth,
		    h = window.innerHeight;
		canvas.width = w;
		canvas.height = h;
		return [w, h];
	},
	getRandomColor: function getRandomColor(color) {
		var R = getRandomHex(255),
		    G = getRandomHex(255),
		    B = getRandomHex(255);
		return "#" + R + G + B;
	}
};