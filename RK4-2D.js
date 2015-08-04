/*Runge-Kutta integration method applied for 2D motion (x,t)

The order is 4 so the last term (error) is order 5 (very small)

 yi+1 = yi + k1/6 + k2/3 + k3/3 + k4/6 + O(h^5)
 yi+1 = yi + (1/6) * (k1 + 2k2 + 2k3 + k4) + O(h^5)
 
*h = step of integration //the smaller, the more accurate
 
 k1 = h.f(xn,yn) //first increment is with Euler method
 k2 = h.f(xn + (1/2)h,yn + (1/2)h*k1)
 k3 = h.f(xn + (1/2)h,yn + (1/2)h*k2)
 k4 = h.f(xn + h, yn + k3)
 
https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods 

http://www.cinam.univ-mrs.fr/klein/teach/mip/numeriq/node46.html

http://www.math.iit.edu/~fass/478578_Chapter_3.pdf //hardcore

here:
The x and v take place of the ki
dt takes place of the h

*/

//init

var g = 9.81;   //gravity
var x;         //initial position
var v;         //initial velocity
var dt;        //timestep
var finalState = {}; //the final state

//init for test
mass = 1;      //kilogram
x = 10;         //meter
v = 3;         //meter per second
t = 0;         //init time
dt = 1/30;     //timestep 1/30


var a = [];   //acceleration array
 a[1] = {};   //acceleration step 1
 a[2] = {};   //acceleration step 2
 a[3] = {};   //acceleration step 3
 a[4] = {};   //acceleration step 4

//acceleration function return the acceleration for a timestep, position and velocity
function acceleration (x,v,i,dt) {
	a[i].x = -g * x - mass * v;        //randomly set for tests
	return dt;
}

//return final position and velocity after time dt
function rk(x,v,dt) {
	var x1,x2,x3,x4;        //the x position of the 4 steps 
	var v1,v2,v3,v4;        //the velocity of the 4 steps
	
	x1 = x;
	v1 = v;
	acceleration(x1,v1,1,0);    //init dt = 0 
	
	
	x2 = x + 0.5 * v1 * dt;
	v2 = v + 0.5 * a[1].x * dt;
	acceleration(x2,v2,2,dt/2);
	
	x3 = x + 0.5 * v2 * dt;
	v3 = v + 0.5 * a[2].x * dt;
    acceleration(x3,v3,3,dt/2);
	
	x4 = x + v3 * dt;
	v4 = v + a[3].x * dt;
	a4 = acceleration(x4,v4,4,dt);

	finalState.xf = x + (dt/6) * (v1 + 2 * v2 + 2 * v3 + v4 ); //final position xf, NB: x = dv/dt
    finalState.vf = v + (dt/6) * (a[1].x + 2 * a[2].x + 2 * a[3].x + a[4].x); //final velocity vf
}


//main-like function 
function test(x,v,dt) {
    //for 100 seconds
    while(t < 100) {
        t = t + dt;
        rk(x,v,dt);
    }
}

console.log('initial position', x);
console.log('initial velocity', v);

test(x,v,dt);

console.log('final x', finalState.xf);
console.log('final v', finalState.vf);
