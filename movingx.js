
//init 
var tid;
var g = 9.81;
var mass = 1;
var x = 10;
var v = 0;
var xdirection = 1;
var dt = 0;                   

var el = document.getElementById('pixi');
var finalState = {};

    
var a = [];   //acceleration array
 a[1] = {};   //acceleration step 1
 a[2] = {};   //acceleration step 2
 a[3] = {};   //acceleration step 3
 a[4] = {};   //acceleration step 4

console.log('initial position', x);
console.log('initial velocity', v);

// keyboard

var keys = {};
keys.left   = 37;
keys.up     = 38;
keys.right  = 39;
keys.down   = 40;

var pressed = [];
pressed[keys.left]  = false;
pressed[keys.up]    = false;
pressed[keys.right] = false;
pressed[keys.down]  = false;

document.addEventListener('keydown', function (e) {
	// ex: if "left" is pressed, e.which === 37
	pressed[e.which] = true;
	switch (e.which) {
		case keys.left: xdirection = -1; break;
		case keys.right: xdirection = 1; break;
	}
});

document.addEventListener('keyup', function (e) {
	pressed[e.which] = false;
});
			
//RK4 integration for 2D (x,t)
			
			
//acceleration function return the acceleration for a timestep, position and velocity
function acceleration (x,v,i,dt) {
	a[i].x = - mass * v;        //randomly set for tests
	a[i].dt = dt;
	
	return a[i];
}

//return final position and velocity after time dt
function rk(x,v,a,dt) {
	var x1,x2,x3,x4;        //the x position of the 4 steps 
	var v1,v2,v3,v4;        //the velocity of the 4 steps
	
    x1 = x;
	v1 = v;
	acceleration(x1,v1,1,dt);    //init dt = 0 
	
	x2 = x + 0.5 * v1 * dt;
	v2 = v + 0.5 * a[1].x * dt;
	acceleration(x2,v2,2,dt/2);
	console.log('dt rk', dt, 'a[1]',a[1].x);
	x3 = x + 0.5 * v2 * dt;
	v3 = v + 0.5 * a[2].x * dt;
    acceleration(x3,v3,3,dt/2);
	
	x4 = x + v3 * dt;
	v4 = v + a[3].x * dt;
	acceleration(x4,v4,4,dt);
	console.log('v1',v1,'v2',v2,'v3',v3,'v4',v4);
	finalState.xf = x + (dt/6) * (v1 + 2 * v2 + 2 * v3 + v4 ); //final position xf, NB: x = dv/dt
    finalState.vf = v + (dt/6) * (a[1].x + 2 * a[2].x + 2 * a[3].x + a[4].x); //final velocity vf
}
			

/* game loop
http://gameprogrammingpatterns.com/game-loop.html
*/

var previous = getTime();

var lag = 0;                            //accumulator to catchup physics and game time
var MS_PER_UPDATE = 30;                 //init game time update(new frame) each 60 ms
var ratio;                              //ratio for the interpolation of the rendering

/*js and the browser impose the using of setTimeout (or set interval)
a while(true) is here impossible
*/

loop();

function getTime () {
	return +new Date;
}

function loop() {
	update ();
	render(); 
	tid = setTimeout(loop,1000/MS_PER_UPDATE);
}

function play () {
	if (!tid) loop();
}

function pause () {
	if (tid) clearTimeout(tid);
	tid = null;
}


/* Update: advances the game simulation one step,
runs AI and physics ??cosmetic??
*/
function update () {
	var current = getTime();				
	dt = current - previous;
	dt /= 1000;
	previous = current;
	rk(x,v,a,dt);
	x = finalState.xf;
	v = finalState.vf;
	console.log("x",x,"v",v);
	
	x = Math.min(800, x);
	x = Math.max(10, x);
	if (pressed[keys.left] || pressed[keys.right]) {
		v = pressed[keys.left] ? - 200 : 200;
		console.log('v',v);
	}
}


/* render: draws the game so the player can see what happened
interpolation included
*/
function render () {
	el.style.left = x + 'px';                 //with interpolation, ratio = 0 if not needed
}

console.log('final x', finalState.xf);
console.log('final v', finalState.vf);
