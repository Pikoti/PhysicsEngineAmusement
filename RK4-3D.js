/*Runge-Kutta integration method applied for 3D motion (x,y,t)

http://www.astro.umass.edu/~schloerb/ph281/Lectures/DEQ4/DEQ4.pdf

#see RK4.js for more RK4 doc

*/


//init variables, constants and forces
//y Forces: gravity (*-1)
//no x Forces

var g = 9.81;   //gravity is on y axe
var x;         //initial position x
var y;         //initial position y
var vx;        //initial x velocity
var vy;        //initial y velocity
var dt;        //timestep


//init objects finals state and acceleration steps
var finalState = {}; //the final state

var a = [];   //acceleration array
 a[1] = {};   //acceleration step 1
 a[2] = {};   //acceleration step 2
 a[3] = {};   //acceleration step 3
 a[4] = {};   //acceleration step 4


//init for test (set conveniently by me)
mass = 1;      //kilogram
x = 0;         //meter (->horizontal left)
y = 0          //meter (|^ vertical up)
vx = 3;        //meter per second
vy = 2;        //meter per second
t = 0;         //init time
dt = 1/30;     //timestep 1/30


//acceleration function returns the acceleration for a timestep, position and velocity
function acceleration (x,y,vx,vy,i,dt) {
	a[i].x = 0;
	a[i].y = -g * y; 	//just gravity, no air friction for the moment
}

//return final position and velocity after time dt
function rk(x,y,vx,vy,dt) {
	var x1,x2,x3,x4;           //the x position of the 4 steps 
	var vx1,vx2,vx3,vx4;       //the x velocity of the 4 steps
	var y1,y2,y3,y4;           //the y position of the 4 steps 
	var vy1,vy2,vy3,vy4;       //the y velocity of the 4 steps
	
	dt = 1/30;
	
	x1 = x;
	y1 = y;
	vx1 = vx;
	vy1 = vy;
	acceleration(x1,y1,vx1,vy1,1,0);    //init dt =0
	
	x2 = x + 0.5 * vx1 * dt;
	y2 = x + 0.5 * vy1 * dt;
	vx2 = vx + 0.5 * a[1].x * dt;
	vy2 = vy + 0.5 * a[1].y * dt;
	acceleration(x2,y2,vx2,vy2,2,dt/2);
	
	x3 = x + 0.5 * vx2 * dt;
	y3 = x + 0.5 * vy2 * dt;
	vx3 = v + 0.5 * a[2].x * dt;
	vy3 = v + 0.5 * a[2].y * dt;
	acceleration(x3,y3,vx3,vy3,3,dt/2);
	
	x4 = x + vx3 * dt;
	y4 = x + vx3 * dt;
	vx4 = v + a[3].x * dt;
	vy4 = v + a[3].y * dt;
	acceleration(x4,y4,vx4,vy4,4,dt);
	
	finalState.xf = x + (dt/6) * (vx1 + 2 * vx2 + 2 * vx3 + vx4); //final position xf, NB: x = dvx/dt
	finalState.yf = y + (dt/6) * (vy1 + 2 * vy2 + 2 * vy3 + vy4); //final position yf, NB: y = dvy/dt
	
	finalState.vxf = vx + (dt/6) * (a[1].x + 2 * a[2].x + 2 * a[3].x + a[4].x); //final velocity vxf
	finalState.vyf = vy + (dt/6) * (a[1].y + 2 * a[2].y + 2 * a[3].y + a[4].y); //final velocity vyf
}

//main-like function 
function test(x,y,vx,vy,dt) {
    //for 100 seconds
    while(t < 100) {
        t = t + dt;
        rk(x,y,vx,vy,dt);
    }
}

console.log('initial x position', x);
console.log('initial y position', y);
console.log('initial velocity x', vx);
console.log('initial velocity y', vy);

test(x,y,vx,vy,dt);

console.log('final x', finalState.xf);
console.log('final y', finalState.yf);
console.log('final vx', finalState.vxf);
console.log('final vy', finalState.vyf);

