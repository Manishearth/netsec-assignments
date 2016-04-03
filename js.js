
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
	ret = new Array(9);
	for(i=0;i<ret.length;i++) {
		ret[i] = ["","","","","","","","",""];
	}
	return ret;
}
function genTable(name, disabled) {
	disattr="";
	if(disabled) {
		disattr = "disabled";
	}
	document.write("<table class=sudoku>");
			for (let i =0; i<9; i++) {
			document.write("<tr>");
			for (let j=0; j<9;j++) {
				document.write("<td><input size='1%' "+disattr+" id='"+name+"-"+i+""+j+"'/></td>")
			}
			document.write("</tr>");
		}
	document.write("</table>")
}

function updateState(newState) {
	state = newState;
	for(button of ["permute", "nonce", "hash", "send", "verify", "start"]) {
		document.getElementById(button).disabled = true;
	}

	switch (state) {
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
			break;
		case "revealed":
			document.getElementById("verify").disabled=false;
			break;
		case "verified":
			document.getElementById("permute").disabled=false;
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

function reset() {
	for(grid of ["preset","reveal-val", "reveal-nonce", "reveal-sha", "in-val", "in-nonce", "in-sha"]) {
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
	updateState("sent");
}

function reveal(){
	var type = document.getElementById('type').value;
	var segment = parseInt(document.getElementById('segment').value);
	let revealedPresets = new Set();
	if(type == '0'){
		for(let j=0;j<dim;++j){
			let i = segment;
			access('reveal-val',i, j).value = permutedSolution[i][j];
			access('reveal-nonce',i, j).value = nonces[i][j];
			if(preset[i][j] != "") {
				revealedPresets.add(preset[i][j]);
			}
		}
	}
	else if(type == '1'){
		for(let i=0;i<dim;++i){
			let j = segment;
			access('reveal-val',i, j).value = permutedSolution[i][j];
			access('reveal-nonce',i, j).value = nonces[i][j];
			if(preset[i][j] != "") {
				revealedPresets.add(preset[i][j]);
			}
		}
	}
	else{
		let p = parseInt(y/sdim)*sdim;
		let q = (y%sdim)*sdim;
		for(let i=p;i<p+sdim;++i){
			for(let j=q;j<q+sdim;++j){
				let j = segment;
				access('reveal-val',i, j).value = permutedSolution[i][j];
				access('reveal-nonce',i, j).value = nonces[i][j];
				if(preset[i][j] != "") {
					revealedPresets.add(preset[i][j]);
				}
			}
		}
	}
	console.log(revealedPresets);
	foreachA(preset, (g, i, j) => {
		if(revealedPresets.has(g)) {
			access('reveal-val',i, j).value = permutedSolution[i][j];
			access('reveal-nonce',i, j).value = nonces[i][j];
		}
	})
}

function error(){
	alert("Inconsistent values!");
}

function verify(){
	for(let i=0;i<dim;++i){
		
		// row check
		let t = new Array(dim);

		for(let j=0;j<dim;++j){
			if(revealpos[i][j]){
				let x = document.getElementById('a'+i+j).value;
				let y = document.getElementById('b'+i+j).value;
				let z = document.getElementById('c'+i+j).value;

				if(z != hash(x, y)){
					error();
					return;
				}

				if(preset[i][j] != '' && x != preset[i][j]){
					error();
					return;
				}

				if(t[a[i][j]]){
					error();
					return;
				}
				else{
					t[a[i][j]] = 'not-empty';
				}
			}
		}
	}

	// sub-block check
	for(let y=0;y<dim;++y){
		let t = new Array(dim);

		let p = parseInt(y/sdim)*sdim;
		let q = (y%sdim)*sdim;

		for(let i=p;i<p+sdim;++i){
			for(let j=q;j<q+sdim;++j){
				if(revealpos[i][j]){
					if(t[a[i][j]]){
						error();
						return;
					}
					else{
						t[a[i][j]] = 'not-empty';
					}
				}
			}
		}
	}

	// column check
	for(let j=0;j<dim;++j){
		let t = new Array(dim);

		for(let i=0;i<dim;++i){
			if(revealpos[i][j]){
				
				if(t[a[i][j]]){
					error();
					return;
				}
				else{
					t[a[i][j]] = 'not-empty';
				}
			}
		}
	}

	alert("All Cool :)");
}
