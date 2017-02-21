//standart vector class
class Vector{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	add(vector){
		if (vector instanceof Vector)
			return new Vector(vector.x + this.x, vector.y + this.y);
		else return new Error("Not a vector");
	}

	vectorLenght(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	multiply(k){
		return new Vector(this.x * k, this.y *k);
	}

	addAngLength(angle, length){
		return new Vector(this.x + Math.cos(angle) * length, this.y + Math.cos(angle) * length); // angle in PI
	}
}

// Player, Coin and Lava class to operate this objects.
class Player {
	constructor(pos){
		this.pos = pos.add(new Vector (0, -0.5)); //because player top size x1.5 of other elements top size and we need to move it  higher
		this.size = new Vector (0.8, 1.5); // player size
		this.speed = new Vector (0, 0); // start player speed
		this.maxSpeed = 9;				//max x speed
		this.speedChange = 6;			//speed changing during time
		this.gravity = 30;
		this.jumpSpeed = 19;
	}

	//operating X and Y coordinates separately. |9| - max X speed, if player faster he will slow down whith each frame.
	moveX (step, level, keys){
		var timeSpeedChange = this.speedChange * step;

		if (keys.left && !keys.right){
			if(this.speed.x <= -this.maxSpeed)
				this.speed.x = Math.min(this.speed.x + timeSpeedChange, -this.maxSpeed);       	  //if speed x < max speed player will slow down
			else if(this.speed.x > 0)
				this.speed.x = Math.max(this.speed.x - timeSpeedChange, 0) - timeSpeedChange;		  //if speed x > 0 player will slowdown and then accelerate
			else
				this.speed.x = Math.max(this.speed.x - timeSpeedChange, -this.maxSpeed);				  //if 0 > speed x > - speed max
		}
		else if (keys.right && !keys.left){
			if(this.speed.x >= this.maxSpeed)
				this.speed.x = Math.max(this.speed.x - timeSpeedChange, this.maxSpeed);       	  //if speed x > max speed player will slow down
			else if(this.speed.x < 0)
				this.speed.x = Math.min(this.speed.x + timeSpeedChange, 0) + timeSpeedChange;		  //if speed x < 0 player will slow down and then accelerate
			else
				this.speed.x = Math.min(this.speed.x + timeSpeedChange, this.maxSpeed);				  //if 0 < speedChange x < speed max
		}
		else if (this.speed.x > 0)																	//when both left and right pressed and when none pressed player wil slowdown
			this.speed.x = Math.max(this.speed.x - timeSpeedChange, 0);
		else 
			this.speed.x = Math.min(this.speed.x + timeSpeedChange, 0);

		var motion = new Vector(this.speed.x * step, 0);
		var newPos = this.pos.add(motion);
		var obstacle = level.obstacleAt(newPos, this.size);
		if(obstacle){																			//check free space to move
			level.playerTouched(obstacle);		
			this.speed.x = 0;}																	//!!!!!!!!!!!!!		Check this later. bug possibility	!!!!!!!!!!!!!!								
		else
			this.pos = newPos; 
	}	

	moveY(step, level, keys){
		this.speed.y += step * this.gravity;
		var motion = new Vector (0, this.speed.y * step);
		var newPos = this.pos.add(motion);
		var obstacle = level.obstacleAt(newPos, this.size);
		if(obstacle){
			level.playerTouched(obstacle);
			if (keys.up && this.speed.y > 0)
				this.speed.y = -this.jumpSpeed;
			else
				this.speed.y = 0;
		}
		else
			this.pos = newPos;
	}

	act(step, level, keys){
		this.moveX(step, level, keys);
		this.moveY(step, level, keys);

		var otherActor = level.actorAt(this);				//check for actors at this pos
		if(otherActor)
			level.playerTouched(otherActor.type, otherActor);

		//losind animation
		if (level,status == "lost"){
			this.pos.y += step;
			this.size.y -= step;
		}
	}
}
Player.prototype.type = "player"; // no const now available inside class construction :/ 

class Lava {
	constructor(pos, type){
		this.pos = pos;
		this.size = new Vector(1, 1);
		if (type == "="){					//different types of lava
			this.speed = new Vector(2, 0);
		} else if (type == "|") {
			this.speed = new Vector(0, 2);
		} else if (type == "v") {
			this.speed = new Vector(0, 3);
			this.repeatPos = pos;			// dat lava type will return to start position when touch wall
		}
	}

	act (step, level){
		var newPos = this.pos.add(this.speed.multiply(step));
		if(!level.obstacleAt(newPos, this.size))				//check new if new position possible
			this.pos = newPos;
		else if(this.repeatPos)									//for dropping lava
			this.pos = this.repeatPos;
		else 
			this.speed = this.speed.multiply(-1);				//for flying lava
	}
}
Lava.prototype.type = "lava";

//Coin for mmm... Coins! Everybody loves it. (some day replace them by dollars)
class Coin {
	constructor (pos){
		this.basePos = this.pos = pos.add(new Vector(0.2, 0.1)); // coins shoud fly
		this.size = new Vector (0.6, 0.6);
		this.randomMove = Math.random() * Math.PI * 2; //random pos to desynchronize all coins movement
		this.randomSpeed = Math.random() * 4 + 4;		
		this.randomDist = Math.random() * 0.03 + 0.04;
	}

	act(step) {																//coin random moving
		this.randomMove += step * this.randomSpeed;
		var  randomPos = Math.sin(this.randomMove) * this.randomDist;
		this.pos = this.basePos.add(new Vector(0, randomPos));
	}
}
Coin.prototype.type = "coin"; 

class Level{
	//input data should be correct no data check functions here
	constructor(plan){
		this.width = plan[0].length;
		this.height = plan.length;
		this.grid = [];
		this.actors = [];
		for (var y = 0; y < this.height; y++) {
			var line = plan[y], gridLine = [];
			for (var x = 0; x < this.width; x++) {
				var ch = line[x], fieldType = null;
				var Actor = this.actorChars[ch];
				if (Actor)
					this.actors.push(new Actor(new Vector(x, y), ch));	//for moving objects
				else if (ch == "#")			//static objects will push to array
					fieldType = "wall";
				else if (ch == "!")
					fieldType = "lava";
				gridLine.push(fieldType);
			}
			this.grid.push(gridLine);
		}
		this.player = this.actors.filter(function(actor) {return actor.type == "player";})[0]; //player pos 
		this.status = this.finishDelay = null;
		this.maxStep = 0.05;  
	}

	//chek  for delay after completing Level
	isFinished (){
		return this.status !== null && this.finishDelay < 0;
	}
	
	obstacleAt(pos, size){
		var xStart = Math.floor(pos.x);
		var xEnd = Math.ceil(pos.x + size.x);
		var yStart = Math.floor(pos.y);
		var yEnd = Math.ceil(pos.y + size.y);

		if(xStart < 0 || xEnd > this.width || yStart < 0) //level border will be wall if player reaches it
			return 'wall'; 
		if (yEnd < this.height) // level floor border == lava
			return "lava";
		for (var y = yStart; y < yEnd; y++){
			for (var  x = xStart; x < xEnd; x++){
				var fieldType = this.grid[y][x];
				if(fieldType) return fieldType; // check if player hit smth like wall or lava
			}
		}
	}

	actorAt (actor){
		for (var i = 0; i <this.actor.lenght; i++){
			var other = this.actors[i];
			//check if actor hits another actors
			if (other != actor && actor.pos.x + actor.size.x > other.pos.x && actor.pos.x < other.pos.x + other.size.x && 
				actor.pos.y + actor.size.y > other.pos.y && actor.pos.y < other.pos.y + other.size.y)
				return other;
		}
	}
	
	animate (step, keys){		//step - differense between last frame times, for smooth animation. Keys - pressed keyboard keys.
		if (this.status !== null)
			this.finishDelay -= step;
		while (step > 0){		// make from 1 big step many small, helps to make more percise movement
			var thisStep = Math.min(step, this.maxStep);
			this.actors.forEach(function(actor) {actor.act(thisStep, this, keys);}, this);	//each actor will do it own class action
			step -= thisStep;
		}
	}

	playerTouched(type, actor){
		if(type == "lava" && this.status === null){
			this.status = "lost";
			this.finishDelay = 1;
		} 
		//if actor type == coin remove it from actors arr 
		else if (type == "coin"){
			this.actors = this.actors.filter(function(other){
				return other != actor; 							
			});
			//check for coins in actors arr
			if(!this.actors.some(function(actor){return actor.type == "coin";})){
				this.status = "won";
				this.finishDelay = 1;
			}
		}
	}
}
//Not using babel js to const elem directly in class. (mb later) Indetefier of moving elements (actors) in level array.
Level.prototype.actorChars = {
	"@": Player,
	"o": Coin,
	"=": Lava, 
	"|": Lava,
	"v": Lava
};

class DOMDisplay {
	constructor(parentNode, level){
		this.screen = parentNode.appendChild(this.createScreenElement("div", "game"));
		this.level = level;
		this.scale = 20;									//game scale
		this.screen.appendChild(this.drawBackground());		
		this.actorLayer = null;
		this.drawFrame();
	}

	createScreenElement(name, className){			
		var node = document.createElement(name);
		if (className) node.className = className;
		return node;
	}

	//background means all static objects.
	drawBackground(){	
		var table = this.createScreenElement("table", "background");		//using table for background. will be removed by canvas afer testing
		table.style.width = this.level.width * this.scale + "px";
		this.level.grid.forEach(function(row){			
			var rowElement = table.appendChild(this.createScreenElement("tr"));
			rowElement.style.height = this.scale + "px";
			row.forEach(function(type){
				rowElement.appendChild(this.createScreenElement("td", type));
			}.bind(this));
		}.bind(this));
		return table;
	}

	//draw moving objects
	drawActors(){														
		var  screen = this.createScreenElement("div");
		this.level.actors.forEach(function(actor){
			var rect = screen.appendChild(this.createScreenElement("div", "actor "+ actor.type));	//add few classes for one actor such as actor lava/player
			//position and size on screen
			rect.style.width = actor.size.x * this.scale + "px";
			rect.style.height = actor.size.y * this.scale + "px";
			rect.style.left = actor.pos.x * this.scale + "px";
			rect.style.top = actor.pos.y * this.scale + "px";
		}.bind(this));
		return screen;
	}

	drawFrame(){
		if(this.actorLayer) 
			this.screen.removeChild(this.actorLayer);	//clean old actors before draw new frame
		this.actorLayer = this.screen.appendChild(this.drawActors());
		this.screen.className = "game" + (this.level.status || "");	//add css class for win or lose affects
		this.scrollView();  //camera moving
	}

	scrollView (){
		var width = this.screen.clientWidth;
		var height = this.screen.clientHeight;

		//scrin scroll when player pos closer then
		var marginX = width / 4;
		var marginY = height / 4;

		var left = this.screen.scrollLeft, right = left + width;
		var top = this.screen.scrollTop, bottom = top + height;
		var player = this.level.player;

		//player center position 
		var center = player.pos.add(player.size.multiply(0.5)).multiply(this.scale);
		
		if (center.x < left + marginX)
			this.screen.scrollLeft = center.x - marginX;
		else if (center.x > right - marginX)
			this.screen.scrollLeft = center.x + marginX - width;
		if (center.y < top + marginY)
			this.screen.scrollTop = center.y - marginY;
		else if (center.y > bottom - marginY) 
			this.screen.scrollTop = center.y + marginY - height;
	}

	clearScreen (){
		this.screen.parentNode.removeChild(this.screen);
	} 
}


var someLVL = [
"         ",
" ####### ",
" #  ! o# ",
"         ",
" #  @  # ",
" ####### ",
"         "
];
/*
var classTest = new Level(someLVL);
var test = document.getElementById("test");
for (var i = 0; i < classTest.grid.length; i++) {
	var line = "";
	for (var n = 0; n < classTest.grid[i].length; n++) {
		line += ((classTest.grid[i][n] === null) ? "____" : classTest.grid[i][n]);
	}
	test.innerHTML += line + "<p>";
}*/
 var someGame = new Level(someLVL);
 var display = new DOMDisplay (document.body, someGame);