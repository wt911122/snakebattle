"use strict";

var id = 0;
module.exports = {
	get ID() {
		return id++;
	}
};