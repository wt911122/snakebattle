"use strict";
const list = document.getElementById("snake_list");



function createLI(data, i){
	return `<li><span>${i}</span><span>${data.name}</span><span>${data.score}</span></li>`;
}

module.exports = function(data){
	while (list.firstChild) {
	    list.removeChild(list.firstChild);
	}
	let html = "";
	for(let i = 0, len = data.length; i<len; i++){
		html += createLI(data[i], i+1);
	}
	list.innerHTML = html;
}