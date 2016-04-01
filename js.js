a = [];
b = [];
c = [];
d = [];
e = [];
f = [];
revealpos = [];

preset = [];
var hashGenerated = false;
var revealed = false;
var dim = 9;
var sdim = 3;

function init(){
	for(let i=0;i<dim;++i){
		preset.push([]);
		revealpos.push([]);
		a.push([]);
		b.push([]);
		c.push([]);
		d.push([]);
		e.push([]);
		f.push([]);
		for(let j=0;j<dim;++j){
			preset[i][j] = '';
			revealpos[i][j] = false;
		}
	}

	preset[0][0] = '1';

	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			document.getElementById('d'+i+j).value = preset[i][j];
		}
	}	
}

function hash(x, y){
	return x + '-' + y;
}

function generateRandomNonces(){
	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			let x = Math.random().toString(32).substring(7);
			document.getElementById('e' + i + j).value = x;
			e[i][j] = x;
		}
	}
}

function generateHashes(){
	for(let i=0;i<dim;++i){
		for(let j=0;j<dim;++j){
			f[i][j] = hash(d[i][j], e[i][j]);
			document.getElementById('f' + i + j).value = f[i][j];
		}
	}
	hashGenerated = true;
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

document.getElementById("b0").addEventListener("click", function(){
	permute();
});

document.getElementById("b1").addEventListener("click", function(){
	generateRandomNonces();
});

document.getElementById("b2").addEventListener("click", function(){
	generateHashes();
});

document.getElementById("b3").addEventListener("click", function(){
	if(hashGenerated)
		showHashes();
	else
		alert("Generate hashes first");
});

document.getElementById("b4").addEventListener("click", function(){
	clear();
});

document.getElementById("b5").addEventListener("click", function(){
	reveal();
});

document.getElementById("b6").addEventListener("click", function(){
	verify();
});

init();