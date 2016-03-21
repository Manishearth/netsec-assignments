#include <iostream>
#include <vector>
#include <map>
#include <set>
#include <queue>
using namespace std;

// _n = 2**(n-1)

const int _n = 16;
unsigned char s_box[_n] = {0x0E, 0x04, 0x0D, 0x01, 0x02, 0x0F, 0x0B, 0x08, 0x03, 0x0A, 0x06, 0x0C, 0x05, 0x09, 0x00, 0x07};
unsigned char p_box[_n] = {0x00, 0x04, 0x08, 0x0C, 0x01, 0x05, 0x09, 0x0D, 0x02, 0x06, 0x0A, 0x0E, 0x03, 0x07, 0x0B, 0x0F};

int lat[_n][_n];

bool parity(int x){
	bool p = 0;
	while(x){
		p ^= (x&1);
		x = x>>1;
	}
	return p;
}

void generateLAT(){
	for(int i=0;i<_n;++i){
		for(int j=0;j<_n;++j){
			int c = 0;
			for(int x=0;x<_n;++x){
				int y = s_box[x];

				int z1 = i&x, z2 = j&y;
				bool p = parity(z1) ^ parity(z2);
				if(!p) c++;
			}
			lat[i][j] = c - _n/2;
			// cout<<lat[i][j]<<"|\t|";
		}
		cout<<endl;
	}
}

int s = 4, b = 16, n = b/s;

map<int, int> whichSBox(int x, int i){
	map<int, set<int> > m;
	int last = n*(i+1)-1;

	while(x){
		bool f = x&1;
		if(f){
			int a = p_box[last]/n;
			int b = p_box[last]%n;
			m[a].insert(b);
		}
		x = x>>1;
		--last;
	}

	map<int, int> ret;
	for(map<int, set<int> >::iterator it = m.begin(); it!=m.end();++it){
		set<int> s = it->second;
		int val=0;
		for(set<int>::iterator it1 = s.begin(); it1 != s.end();++it1){
			val += 1<<(n-*it1-1);
		}
		ret[it->first] = val;
	}
	return ret;
}

set<int> possibleLATOutputs(int x){
	int row[_n] = lat[x];

	int mx = -1e9;
	for(int i=0;i<_n;++i){
		if(abs(row[i] > mx)){
			mx = abs(row[i]);
		}
	}

	set<int> ret;
	for(int i=0;i<_n;++i){
		if(abs(row[i]) == mx)
			ret.insert(i);
	}

	return ret;
}

// we have s s-boxes, each has n inputs and n outputs
// void findMaxBias(){

// 	for()

// }

int main(){
	generateLAT();

}
