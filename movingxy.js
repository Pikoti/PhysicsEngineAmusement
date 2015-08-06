
//init 
var tid;
var g = 9.81;
var mass = 4;
var x = 10;
var y = 0;
var vx = 0;
var vy = 0;
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
console.log('initial velocity', vx);
console.log('initial position', y);
console.log('initial velocity', vy);

// keyboard

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
	// ex: if "left" is pressed, e.which === 37
	pressed[e.which] = true;
});

document.addEventListener('keyup', function (e) {
	pressed[e.which] = false;
});
			
//RK4 integration for 2D (x,t)
			
			
//acceleration function return the acceleration for a timestep, position and velocity
function acceleration (x,y,vx,vy,i,dt) {
	a[i].x = 0;        //randomly set for tests
	a[i].y = - mass * g;        //gravity
	a[i].dt = dt;
	
	return a[i];
}

//return final position and velocity after time dt
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

/* game loop
http://gameprogrammingpatterns.com/game-loop.html
*/

var previous = getTime();
var MS_PER_UPDATE = 30;                 //init game time update(new frame) each 60 ms


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
	rk(x,y,vx,vy,dt);
	x = finalState.xf;
	vx = finalState.vxf;
	y = finalState.yf;
	vy = finalState.vyf;
	console.log("x",x,"vx",vx);
	console.log("y",y,"vy",vy);
	
	x = Math.min(800, x);
	x = Math.max(10, x);
	y = Math.min(560, y);
	y = Math.max(70, y);
	if (pressed[keys.left] || pressed[keys.right]) {
		vx = pressed[keys.left] ? - 200 : 200;
		console.log('v',vx);
	}
	if (pressed[keys.up] || pressed[keys.down]) {
		vy = pressed[keys.down] ? -70 : 70;
		console.log('v',vy);
	} 
	
	if (pressed[keys.space]) {
			vx = 70;
			vy = 70;
	} 
}


/* render: draws the game so the player can see what happened
interpolation included
*/
function render () {
	el.style.left = x + 'px';  
	el.style.bottom = y + 'px';                 //with interpolation, ratio = 0 if not needed
}

console.log('final x', finalState.xf);
console.log('final v', finalState.vxf);
console.log('final x', finalState.yf);
console.log('final v', finalState.vyf);
