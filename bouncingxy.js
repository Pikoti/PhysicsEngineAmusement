
//Init and constants 
var tid;                                 //timer id
var g = 9.81;                            //gravity

var isOnLimit = true;
var isOnLimitX = true;
var isOnLimitY = true;
var isCaught = false;

var bounds = {};
var finalState = {};

var pinkPixel = {};
pinkPixel.x = 10;
pinkPixel.y = 0;
pinkPixel.vx = 0;
pinkPixel.vy = 0;
pinkPixel.mass = 4;

var banana = {};
banana.x = 600;
banana.y = 330;

var game = {};
game.dt = 0;
game.score = 0;
game.previous = getTime();
game.MS_PER_UPDATE = 30;

 pinkPixel.a = [];   //acceleration array
 pinkPixel.a[1] = {};   //acceleration step 1
 pinkPixel.a[2] = {};   //acceleration step 2
 pinkPixel.a[3] = {};   //acceleration step 3
 pinkPixel.a[4] = {};   //acceleration step 4

 
//DOM part
var el = document.getElementById('pixi');

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
	    pinkPixel.vx = pressed[keys.left] ? - 100 : 100;
    }
	if (pressed[keys.up] || pressed[keys.down]) {
		pinkPixel.vy = pressed[keys.down] ? -100 : 100;
	} 
	if (pressed[keys.space]) {
		pinkPixel.vx = pinkPixel.vx < 0 ? -100 : 100;
		pinkPixel.vy = 100;
	} 	
}

//LOGIC OF THE GAME

//Get real new time
function getTime () {
	return +new Date;
}

//Set real new time elapsed : dt
function getDt () {
	game.current = getTime();				
	game.dt = game.current - game.previous;
	game.dt /= 1000;
	game.previous = game.current;
}

//Start main loop
loop(); 

//Game loop
function loop() {
	userInput();
	update ();
	render(); 
	tid = setTimeout(loop,1000/game.MS_PER_UPDATE);
}

//Game goes one step further
function update () {
	getDt();
	rk(pinkPixel.x,pinkPixel.y,pinkPixel.vx,pinkPixel.vy,game.dt);
	setData();
	BoundDetector ();
	bananaDetector ();
	manageLimits();
	if (isOnLimit) {
	    updateVelocity();
		rk(pinkPixel.x,pinkPixel.y,finalState.vx,finalState.vy,game.dt);
	    isOnLimit = false;
	    isOnLimitX = false;
	    isOnLimitY = false;	
	    setData();
	}
	if (isCaught) {
        scoregame();
	}
	console.log('x', pinkPixel.x, 'y', pinkPixel.y);
	console.log('xb',banana.x, 'yb',banana.y);
}

//PHYSICS ENGINE

//POSITIONAL LOGIC

//Accelerations engine 
//Returns global acceleration given time step, position and velocity
function acceleration (x,y,vx,vy,i,dt) {
	pinkPixel.a[i].x = - pinkPixel.mass * pinkPixel.vx/10 ;        
	pinkPixel.a[i].y = - pinkPixel.mass * g;
	pinkPixel.a[i].dt = game.dt;
	return pinkPixel.a[i];
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
	vx2 = vx + 0.5 * pinkPixel.a[1].x * dt;
	vy2 = vy + 0.5 * pinkPixel.a[1].y * dt;
	acceleration(x2,y2,vx2,vy2,2,dt/2);
	
	x3 = x + 0.5 * vx2 * dt;
	y3 = y + 0.5 * vy2 * dt;
	vx3 = vx + 0.5 * pinkPixel.a[2].x * dt;
	vy3 = vy + 0.5 * pinkPixel.a[2].y * dt;
	acceleration(x3,y3,vx3,vy3,3,dt/2);
	
	x4 = x + vx3 * dt;
	y4 = y + vx3 * dt;
	vx4 = vx + pinkPixel.a[3].x * dt;
	vy4 = vy + pinkPixel.a[3].y * dt;
	acceleration(x4,y4,vx4,vy4,4,dt);
	
	finalState.x = x + (dt/6) * (vx1 + 2 * vx2 + 2 * vx3 + vx4);                 //final position x, NB: x = dvx/dt
	finalState.y = y + (dt/6) * (vy1 + 2 * vy2 + 2 * vy3 + vy4);                 //final position y, NB: y = dvy/dt
	
	finalState.vx = vx + (dt/6) * (pinkPixel.a[1].x + 2 * pinkPixel.a[2].x + 2 * pinkPixel.a[3].x + pinkPixel.a[4].x);   //final velocity vx
	finalState.vy = vy + (dt/6) * (pinkPixel.a[1].y + 2 * pinkPixel.a[2].y + 2 * pinkPixel.a[3].y + pinkPixel.a[4].y);   //final velocity vy
}

//Asset the new properties of the moving object
function setData () {
	pinkPixel.x = finalState.x;
	pinkPixel.y = finalState.y;
	pinkPixel.vx = finalState.vx;
	pinkPixel.vy = finalState.vy;
}

//Manage with the limits of the HTML/CSS area
function manageLimits () {
	pinkPixel.x = Math.min(800,pinkPixel.x);
	pinkPixel.x = Math.max(10,pinkPixel.x);
	pinkPixel.y = Math.min(560,pinkPixel.y);
	pinkPixel.y = Math.max(70,pinkPixel.y);
}

//COLLISION DETECTION

//Detection of collision against bounds
function BoundDetector () {
	if (finalState.x >= 800 || finalState.x <= 10) {
		isOnLimit = isOnLimitX = true;
	}
	if (finalState.y >= 560 || finalState.y <= 70) {
		isOnLimit = isOnLimitY =  true;
	}
}

//detect if collision with the objective
function bananaDetector () {
	banana.top = banana.y;
	banana.bottom = banana.y - 30;
	banana.left = banana.x;
	banana.right = banana.y + 30;
	if (pinkPixel.y <= banana.top + 20 && pinkPixel.y >= banana.bottom - 20 &&
    	pinkPixel.x >= banana.left - 20 && pinkPixel.x <= banana.right + 20) {
		isCaught = true;
	}
}


//COLLISION RESOLUTION
//Elastic collision Cr = v'/v0, Here Cr = 0,50
function restitution (v) {
	return v * (0.5) * (-1);
}

//Set new velocities after collision choc
function updateVelocity() {
	if (isOnLimitX) {
 	    finalState.vx = restitution(finalState.vx);
	    finalState.vy = finalState.vy;
	}
	if (isOnLimitY) {
	    finalState.vx = finalState.vx;
 	    finalState.vy = restitution(finalState.vy);
	}
}

//add score game
function scoregame() {
	if (isCaught) {
		game.score += 1;
		console.log('scores',game.score);
	}
}

//Update banana state

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!

function myRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updatePositionBanana () {
	    isCaught = false;
        banana.x = myRandom(10,800);
        banana.y = myRandom(70,560);
}

//Draws the game 
function render () {
	var el2 = document.getElementById('banana');
	el.style.left = pinkPixel.x + 'px';  
	el.style.bottom = pinkPixel.y + 'px';
	if (isCaught) {
	    updateRendererBanana();
	    el2.style.left = banana.x  + 'px';
	    el2.style.bottom = banana.y + 'px';
	    console.log('scorer', game.score);
	}
}

//Final debug
console.log('final x', finalState.x);
console.log('final v', finalState.vx);
console.log('final x', finalState.y);
console.log('final v', finalState.vy);
