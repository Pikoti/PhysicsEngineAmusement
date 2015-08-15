
//Init and constants 
var tid;                                 //timer id
var g = 9.81;                            //gravity

var isOnBound = true;
var isOnBoundX = true;
var isOnBoundY = true;
var isCaught = false;

var bounds = {};
bounds.xMax = 800;
bounds.xMin = 0;
bounds.yMax = 560;
bounds.yMin = 0;

var finalState = {};

var pinkPixel = {};
pinkPixel.h = 30;
pinkPixel.w = 30;

pinkPixel.x = 0;
pinkPixel.y = 0;
pinkPixel.vx = 0;
pinkPixel.vy = 0;

pinkPixel.mass = 4;


var banana = {};
banana.x = 600;
banana.y = 330;

banana.h = 30;
banana.w = 30;

banana.top = banana.y + banana.h;
banana.bottom = banana.y;
banana.left = banana.x;
banana.right = banana.x + banana.w;

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
var el = document.getElementById('pinkPixel');
var el2 = document.getElementById('banana');

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
pressed[keys.space] = false;

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
	manageBounds();
	if (isOnBound) {
	    updateVelocity();
		rk(pinkPixel.x,pinkPixel.y,finalState.vx,finalState.vy,game.dt);
	    isOnBound = false;
	    isOnBoundX = false;
	    isOnBoundY = false;	
	    setData();
	}
	if (isCaught) {
        scoregame();
		updatePositionBanana();
	}
	
	    console.log("tb",banana.top,'bb',banana.bottom,'lb', banana.left,'rb', banana.right);
	    console.log("t",pinkPixel.top,'b',pinkPixel.bottom,'l', pinkPixel.left,'r', pinkPixel.right);
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
	
    pinkPixel.top = pinkPixel.y + pinkPixel.h;
    pinkPixel.bottom = pinkPixel.y;
    pinkPixel.left = pinkPixel.x;
    pinkPixel.right = pinkPixel.x + pinkPixel.w;
}

//Manage with the Bounds of the HTML/CSS area
function manageBounds () {
	pinkPixel.x = Math.min(bounds.xMax - pinkPixel.w, pinkPixel.x);
	pinkPixel.x = Math.max(bounds.xMin, pinkPixel.x);
	pinkPixel.y = Math.min(bounds.yMax - pinkPixel.h, pinkPixel.y);
	pinkPixel.y = Math.max(bounds.yMin, pinkPixel.y);
}

//COLLISION DETECTION

//Detection of collision against bounds
function BoundDetector () {
	if (pinkPixel.right >= bounds.xMax || pinkPixel.left <= bounds.xMin) {
		isOnBound = isOnBoundX = true;
	}
	if (pinkPixel.top >= bounds.yMax || pinkPixel.bottom <= bounds.yMin) {
		isOnBound = isOnBoundY =  true;
	}
}

//detect if collision with the objective
function bananaDetector () {
	
	console.log('caught', isCaught);
	if (pinkPixel.bottom < banana.top && pinkPixel.top > banana.bottom
     && pinkPixel.right > banana.left && pinkPixel.left < banana.right ) {
		isCaught = true;
	} else 	{
	    isCaught = false;
	}
	console.log('caught', isCaught);
}


//COLLISION RESOLUTION
//Elastic collision Cr = v'/v0, Here Cr = 0,50
function restitution (v) {
	return v * (0.5) * (-1);
}

//Set new velocities after collision choc
function updateVelocity() {
	if (isOnBoundX) {
 	    finalState.vx = restitution(finalState.vx);
	    finalState.vy = finalState.vy;
	}
	if (isOnBoundY) {
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

function myRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Update banana position
function updatePositionBanana () {
		if (isCaught) {
	        isCaught = false;
            banana.x = myRandom(bounds.xMin,bounds.xMax - banana.w);
            banana.y = myRandom(bounds.yMin,bounds.yMax - banana.h);
		}
		banana.top = banana.y + banana.h;
        banana.bottom = banana.y;
        banana.left = banana.x;
        banana.right = banana.x + banana.w;
}

//Draws the game 
function render () {
	el.style.left = pinkPixel.x + 'px';  
	el.style.bottom = pinkPixel.y + 'px';
	el2.style.left = banana.x  + 'px';
	el2.style.bottom = banana.y + 'px';
	console.log('scorer', game.score);
}

//Final debug
console.log('final x', finalState.x);
console.log('final v', finalState.vx);
console.log('final x', finalState.y);
console.log('final v', finalState.vy);
