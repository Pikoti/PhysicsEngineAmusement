  var pixi = {
                x: 10, y: 10, 
                direction: 1,
                el: document.getElementById('pixi')
            };

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
                    case keys.left: pixi.direction = -1; break;
                    case keys.right: pixi.direction = 1; break;
                }
            });

            document.addEventListener('keyup', function (e) {
                pressed[e.which] = false;
            });

            // game loop

            loop(); // start

            function loop () {
                update();
                draw();
                // recursive call each 1/30 sec
                setTimeout(loop, 1000 / 30);
            }

            // javascript part

            function update () {
                if (pressed[keys.left] || pressed[keys.right]) {
                    pixi.x += 5 * pixi.direction;
                    pixi.x = Math.min(1000, pixi.x);
                    pixi.x = Math.max(10, pixi.x);
                }
            }

            // dom part

            function draw () {
                pixi.el.style.top = pixi.y + 'px';
                pixi.el.style.left = pixi.x + 'px';
            }