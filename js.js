
var sdim = 3;
var dim = sdim*sdim;
var interactive = true;


var preset = newEmptyArray();
var permutedSolution = newEmptyArray();
var nonces = newEmptyArray();
var hashes = newEmptyArray();

function newEmptyArray() {
	ret = new Array(9);
	for(i=0;i<ret.length;i++) {
		ret[i] = new Array(9);
	}
	return ret;
}
function genTable(name) {
	document.write("<table class=sudoku>");
			for (let i =0; i<9; i++) {
			document.write("<tr>");
			for (let j=0; j<9;j++) {
				document.write("<td><input size='1%' id='"+name+"-"+i+""+j+"'/></td>")
			}
			document.write("</tr>");
		}
	document.write("</table>")
}

function foreach(name, f) {
	for(let i=0;i<dim;i++) {
		for(let j=0; j<dim; j++) {
			f(document.getElementById(name+'-'+i+""+j),i,j);
		}
	}
}
function reset() {
	for(grid of ["preset","reveal-val", "reveal-nonce", "reveal-sha", "in-val", "in-nonce", "in-sha"]) {
		foreach(grid, (g) => g.value="");
	}
	preset = newEmptyArray();
	permutedSolution = newEmptyArray();
	nonces = newEmptyArray();
	hashes = newEmptyArray();
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
}


function init(){

}

function hash(x, y){
	var shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.update(x + '-' + y)
	return shaObj.getHash("HEX");
}

function generateRandomNonces(){
	foreach("in-nonce",(g, i, j)=> nonces[i][j] = g.value = Math.random().toString(32).substring(7));
}

function generateHashes(){
	foreach("in-sha", (g,i,j) => {
		hashes[i][j] = g.value = hash(nonces[i][j], permutedSolution[i][j])
	})
}

function permute(){
	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			d[i][j] = '0';
			document.getElementById('d' + i + j).value = d[i][j];
		}
	}
}

function showHashes(){
	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			c[i][j] = f[i][j];
			document.getElementById("c"+i+j).value = c[i][j];
		}
	}
}

function clear(){
	init();
	revealed = false;
	hashGenerated = false;
	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			if(preset[i][j] != '')
				d[i][j] = preset[i][j];
			else d[i][j] = '';

			document.getElementById('a'+i+j).value = '';
			document.getElementById('b'+i+j).value = '';
			document.getElementById('c'+i+j).value = '';
			document.getElementById('d'+i+j).value = d[i][j];
			document.getElementById('e'+i+j).value = '';
			document.getElementById('f'+i+j).value = '';
		}
	}
}

function reveal(){
	if(revealed){
		clear()
		revealed = false;
	}
	var x = document.getElementById('g0').value;
	var y = parseInt(document.getElementById('g1').value);

	if(x == '0'){
		for(let j=0;j<dim;++j){
			document.getElementById('a'+y+j).value = d[y][j];
			document.getElementById('b'+y+j).value = e[y][j];
			a[y][j] = d[y][j];
			b[y][j] = e[y][j];
			revealpos[y][j] = true;
		}
	}
	else if(x == '1'){
		for(let i=0;i<dim;++i){
			document.getElementById('a'+i+y).value = d[i][y];
			document.getElementById('b'+i+y).value = e[i][y];
			a[i][y] = d[i][y];
			b[i][y] = e[i][y];
			revealpos[i][y] = true;
		}
	}
	else{
		let p = parseInt(y/sdim)*sdim;
		let q = (y%sdim)*sdim;
		for(let i=p;i<p+sdim;++i){
			for(let j=q;j<q+sdim;++j){
				document.getElementById('a'+i+j).value = d[i][j];
				document.getElementById('b'+i+j).value = e[i][j];
				a[i][j] = d[i][j];
				b[i][j] = e[i][j];
				revealpos[i][j] = true;
			}
		}
	}

	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			if(preset[i][j] != ''){
				document.getElementById('a'+i+j).value = d[i][j];
				document.getElementById('b'+i+j).value = e[i][j];
				revealpos[i][j] = true;
			}
		}
	}
	revealed = true;
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
