
//Init and constants 
var tid;                                 //timer id
var g = 9.81;                            //gravity
var mass = 4;
var x = 10;
var y = 0;
var vx = 0;
var vy = 0;
var dt = 0;
var score = 0;
var A = 0;                                 //angle    
var previous = getTime();
var MS_PER_UPDATE = 30;                   //Game time update(new frame) is 30 ms
var finalState = {};
var bounds;
var boundsX;
var boundsY;
var got = false;
    
var a = [];   //acceleration array
 a[1] = {};   //acceleration step 1
 a[2] = {};   //acceleration step 2
 a[3] = {};   //acceleration step 3
 a[4] = {};   //acceleration step 4
 
var el = document.getElementById('pixi');
var el2 = document.getElementById('catch');

 //Init debug
console.log('initial position', x);
console.log('initial velocity', vx);
console.log('initial position', y);
console.log('initial velocity', vy);

//Keyboard listeners interface
var keys = {};
keys.space  = 32;
keys.left   = 37;
keys.up     = 38;
keys.right  = 39;
keys.down   = 40;

var pressed = [];
pressed[keys.left]  = false;
pressed[keys.up]    = false;
pressed[keys.right] = false;
pressed[keys.down]  = false;
pressed[keys.space]  = false;

document.addEventListener('keydown', function (e) {
	pressed[e.which] = true;
});

document.addEventListener('keyup', function (e) {
	pressed[e.which] = false;
});

//USER INTERACTION

//Buttons settings, play and pause the code
function play () {
	if (!tid) loop();
}

function pause () {
	if (tid) clearTimeout(tid);
	tid = null;
}

//User movement with keyboard
function userInput() {
	if (pressed[keys.left] || pressed[keys.right]) {
	    vx = pressed[keys.left] ? - 400 : 400;
    }
	if (pressed[keys.up] || pressed[keys.down]) {
		vy = pressed[keys.down] ? -400 : 400;
	} 
	if (pressed[keys.space]) {
		vx = vx < 0 ? -100 : 100;
		vy = 100;
	} 	
}

//LOGIC OF THE GAME

//Get real new time
function getTime () {
	return +new Date;
}

//Set real new time elapsed : dt
function getDt () {
	var current = getTime();				
	dt = current - previous;
	dt /= 1000;
	previous = current;
}

//Start main loop
loop(); 

//Game loop
function loop() {
	userInput();
	update ();
	render(); 
	tid = setTimeout(loop,1000/MS_PER_UPDATE);
}

//Game goes one step further
function update () {
	getDt();
	rk(x,y,vx,vy,dt);
	setData();
	BoundDetector ();
	gotDetector ();
	manageLimits();
	if (bounds) {
	    updateVelocity();
		rk(x,y,finalState.vxf,finalState.vyf,dt);
	    bounds = false;
	    boundsX = false;
	    boundsY = false;	
	    setData();
	}
	if (got) {
		console.log('got', got);
	}
	console.log('got', got);
}

//PHYSICS ENGINE

//POSITIONAL LOGIC

//Accelerations engine 
//Returns global acceleration given time step, position and velocity
function acceleration (x,y,vx,vy,i,dt) {
	a[i].x = - mass * vx/10 ;        
	a[i].y = - mass * g;
	a[i].dt = dt;
	return a[i];
}

/*Runge-Kutta Integration engine: returns final position and velocity 
given initial state and elapsed time dt*/
function rk(x,y,vx,vy,dt) {
	var x1,x2,x3,x4;           //the x position of the 4 steps 
	var vx1,vx2,vx3,vx4;       //the vx velocity of the 4 steps
	var y1,y2,y3,y4;           //the y position of the 4 steps 
	var vy1,vy2,vy3,vy4;       //the vy velocity of the 4 steps
	
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
	y3 = y + 0.5 * vy2 * dt;
	vx3 = vx + 0.5 * a[2].x * dt;
	vy3 = vy + 0.5 * a[2].y * dt;
	acceleration(x3,y3,vx3,vy3,3,dt/2);
	
	x4 = x + vx3 * dt;
	y4 = y + vx3 * dt;
	vx4 = vx + a[3].x * dt;
	vy4 = vy + a[3].y * dt;
	acceleration(x4,y4,vx4,vy4,4,dt);
	
	finalState.xf = x + (dt/6) * (vx1 + 2 * vx2 + 2 * vx3 + vx4);                 //final position xf, NB: x = dvx/dt
	finalState.yf = y + (dt/6) * (vy1 + 2 * vy2 + 2 * vy3 + vy4);                 //final position yf, NB: y = dvy/dt
	
	finalState.vxf = vx + (dt/6) * (a[1].x + 2 * a[2].x + 2 * a[3].x + a[4].x);   //final velocity vxf
	finalState.vyf = vy + (dt/6) * (a[1].y + 2 * a[2].y + 2 * a[3].y + a[4].y);   //final velocity vyf
}

//Asset the new properties of the moving object
function setData () {
	x = finalState.xf;
	y = finalState.yf;
	vx = finalState.vxf;
	vy = finalState.vyf;
}

//Manage with the limits of the HTML/CSS area
function manageLimits () {
	x = Math.min(800,x);
	x = Math.max(10,x);
	y = Math.min(560,y);
	y = Math.max(70,y);
}

//COLLISION DETECTION

//Detection of collision against bounds
function BoundDetector () {
	if (finalState.xf >= 800 || finalState.xf <= 10) {
		bounds = boundsX = true;
	}
	if (finalState.yf >= 560 || finalState.yf <= 70) {
		bounds = boundsY =  true;
	}
}

//detect if collision with the objective
function gotDetector () {
	if (x === 600 && y === 200) {
		got = true;
	}
}


//COLLISION RESOLUTION
//Elastic collision Cr = v'/v0, Here Cr = 0,50
function restitution (v) {
	return v * (0.5) * (-1);
}

//Set new velocities after collision choc
function updateVelocity() {
	if (boundsY) {
	    finalState.vxf = finalState.vxf;
 	    finalState.vyf = restitution(finalState.vyf);
	}
	if (boundsX) {
 	    finalState.vxf = restitution(finalState.vxf);
	    finalState.vyf = finalState.vyf;
	}
}

//add score game
function score() {
	if (got) {
		got === false;
		score += 1;
	}
}

//Draws the game 
function render () {
	el.style.left = x + 'px';  
	el.style.bottom = y + 'px';
	if (got) {
		el2.style.display = 'none';
	}
}

//Final debug
console.log('final x', finalState.xf);
console.log('final v', finalState.vxf);
console.log('final x', finalState.yf);
console.log('final v', finalState.vyf);
