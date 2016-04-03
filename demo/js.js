"use strict"
var sdim = 3;
var dim = sdim*sdim;
var interactive = true;


var preset = newEmptyArray();
var permutedSolution = newEmptyArray();
var nonces = newEmptyArray();
var hashes = newEmptyArray();

var state = "idle";
/// http://stackoverflow.com/a/10142256/1198729
Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

function newEmptyArray() {
	let ret = new Array(9);
	for(let i=0;i<ret.length;i++) {
		ret[i] = ["","","","","","","","",""];
	}
	return ret;
}
function genTable(name, disabled) {
	let disattr="";
	if(disabled) {
		disattr = "disabled";
	}
	document.write("<table class=sudoku>");
			for (let i =0; i<9; i++) {
			document.write("<tr>");
			for (let j=0; j<9;j++) {
				document.write("<td><input class=mini size='1%' "+disattr+" id='"+name+"-"+i+""+j+"'/></td>")
			}
			document.write("</tr>");
		}
	document.write("</table>")
}

function updateState(newState) {
	state = newState;
	for(let button of ["permute", "nonce", "hash", "send", "verify", "start", "reveal", "type", "segment"]) {
		document.getElementById(button).disabled = true;
	}

	switch (state) {
		case "idle":
			document.getElementById("start").disabled=false;
			break;
		case "started":
			document.getElementById("permute").disabled=false;
			break;
		case "permuted":
			document.getElementById("nonce").disabled=false;
			foreach("in-nonce", (g,i,j) => nonces[i][j] = g.value="");
			foreach("in-sha", (g,i,j) => hashes[i][j] = g.value="");
			break;
		case "nonced":
			document.getElementById("hash").disabled=false;
			foreach("in-sha", (g,i,j) => hashes[i][j] = g.value="");
			break;
		case "hashed":
			document.getElementById("send").disabled=false;
			break;
		case "sent":
			document.getElementById("reveal").disabled=false;
			document.getElementById("type").disabled=false;
			document.getElementById("segment").disabled=false;
			break;
		case "revealed":
			document.getElementById("verify").disabled=false;
			break;
		case "verified":
			document.getElementById("permute").disabled=false;
			rounds++;
			break;
	}
}

function foreach(name, f) {
	for(let i=0;i<dim;i++) {
		for(let j=0; j<dim; j++) {
			f(access(name,i,j),i,j);
		}
	}
}

function foreachA(arr, f) {
	for(let i=0;i<dim;i++) {
		for(let j=0; j<dim; j++) {
			f(arr[i][j],i,j);
		}
	}
}
function access(name, i, j) {
	return document.getElementById(name+'-'+i+""+j);
}

let rounds = 0;
let probability = 1;
function reset() {
	rounds = 0;
	for(let grid of ["preset","reveal-val", "reveal-nonce", "reveal-sha", "in-val", "in-nonce", "in-sha"]) {
		foreach(grid, (g) => g.value="");
	}
	preset = newEmptyArray();
	permutedSolution = newEmptyArray();
	nonces = newEmptyArray();
	hashes = newEmptyArray();

	updateState("idle");
}

function prefill() {
	reset();
	let table = exampleTables[Math.floor(Math.random()*exampleTables.length)];
	foreach("in-val", (g, i, j) => permutedSolution[i][j] = g.value = table.item[i][j].value)
	foreach("preset", (g, i, j) => {
		if(table.item[i][j].isPreset) {
			g.value = table.item[i][j].value
		} else {
			g.value = "";
		}
		preset[i][j] = g.value;
	});

	updateState("started");
}


function init(){
	updateState("started");

}

function hash(x, y){
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.update(x + '-' + y)
	return shaObj.getHash("HEX");
}

function generateRandomNonces(){
	foreach("in-nonce",(g, i, j)=> nonces[i][j] = g.value = Math.random().toString(32).substring(7));
	updateState("nonced");
}

function generateHashes(){
	foreach("in-sha", (g,i,j) => {
		hashes[i][j] = g.value = hash(nonces[i][j], permutedSolution[i][j])
	})
	updateState("hashed");
}

function permute(){
	let a = [1,2,3,4,5,6,7,8,9];
	a.shuffle();
	foreach("in-val", (g, i, j) => permutedSolution[i][j] = g.value = a[g.value - 1])
	updateState("permuted");
}

function send() {
	foreach("reveal-sha", (g,i,j) =>g.value=hashes[i][j])
	foreach("reveal-nonce", (g,i,j) =>g.value="")
	foreach("reveal-val", (g,i,j) =>g.value="")
	updateState("sent");
}


function getCellsForReveal(type, segment) {
	let revealedPresets = new Set();
	let ret = [];
	if(type == '0'){
		for(let j=0;j<dim;++j){
			let i = segment;
			if(preset[i][j] != "") {
            	revealedPresets.add(preset[i][j]);
            }
			ret.push({"i": i, "j": j});
		}
	}
	else if(type == '1'){
		for(let i=0;i<dim;++i){
			let j = segment;
			if(preset[i][j] != "") {
            	revealedPresets.add(preset[i][j]);
            }
			ret.push({"i": i, "j": j});
		}
	}
	else if(type == '2'){
		let p = parseInt(segment/sdim)*sdim;
		let q = (segment%sdim)*sdim;
		for(let i=p;i<p+sdim;++i){
			for(let j=q;j<q+sdim;++j){
				if(preset[i][j] != "") {
	            	revealedPresets.add(preset[i][j]);
	            }
				ret.push({"i": i, "j": j});
			}
		}
	}
	let mainOnly = ret.slice(); // clone the array
	foreachA(preset, (g, i, j) => {
		if(revealedPresets.has(g)) {
			ret.push({"i": i, "j": j});
		}
	})
	return {"all" : ret, "mainOnly": mainOnly, revealedPresets: revealedPresets};
	
}
function reveal(){
	var type = document.getElementById('type').value;
	var segment = parseInt(document.getElementById('segment').value);

	let cells = getCellsForReveal(type,segment).all;
	for (let cell of cells) {
		access('reveal-val',cell.i, cell.j).value = permutedSolution[cell.i][cell.j];
		access('reveal-nonce',cell.i, cell.j).value = nonces[cell.i][cell.j];
	}
	updateState("revealed");
}

let errored = false;
function error(str){
	errored = true;
	alert(str);
}

function verify(){
	var type = document.getElementById('type').value;
	var segment = parseInt(document.getElementById('segment').value);

	let cells = getCellsForReveal(type, segment);
	for(let cell of cells.all) {
		let i = cell.i;
		let j = cell.j;
		let val = access('reveal-val', i, j).value;
		let nonce = access('reveal-nonce', i,j).value;
		if (val == "") {
			error("Value at ("+i+","+j+") should have been revealed");
			return
		}
		if (nonce == "") {
			error("Nonce at "+i+","+j+") should have been revealed");
			return
		}
		let fhash = hash(nonce, val);
		let expectedhash = access('reveal-sha', i, j).value;
		if(fhash != expectedhash) {
			debugger;
			error("Expected hash "+expectedhash+ " found hash "+fhash)
			return
		}
	}
	let digits = new Set();
	for(let i =1;i<10;i++) {
		digits.add(i+"");
	}
	for(let cell of cells.mainOnly) {
		digits.delete(access('reveal-val', cell.i, cell.j).value);
	}

	if (digits.size != 0) {
		alert("Digit(s) "+ Array.from(digits.values()).toString()+ " not found");
	}

	let presetMap = new Map();

	for(let cell of cells.mainOnly) {
		let i = cell.i;
		let j = cell.j;

		if(preset[i][j] != 0 && cells.revealedPresets.has(preset[i][j])) {
			presetMap.set(preset[i][j], access('reveal-val',i,j).value);
		}
	}

	for(let cell of cells.all) {
		let i = cell.i;
		let j = cell.j;

		if(preset[i][j] != 0 && cells.revealedPresets.has(preset[i][j])) {
			let found = access('reveal-val', i, j).value; 
			let expected = presetMap.get(preset[i][j]);
			if (expected != found) {
				error("Expected "+expected+" at ("+i+","+j+"), found "+found+"");
				return;
			}
		}
	}

	updateState("verified");

	probability = probability*( 1 - (cells.all.length/81));
	document.getElementById("probability").innerHTML = 1 - probability;
}


