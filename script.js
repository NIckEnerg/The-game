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

// don't think using one parent class for three children will save me any time. Player, Coin and Lava class to operate this objects.
class Player {
	constructor(pos){
		this.pos = pos.add(new Vector (0, -0.5)); //because player top size x1.5 of other elements top size and we need to move it  higher
		this.size = new Vector (0.8, 1.5); // player size
		this.speed = new Vector (0, 0); // start player speed
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
}
Lava.prototype.type = "lava";// sadness...

//Coin for mmm... Coins! Everybody loves it. (some day replace them by dollars)
class Coin {
	constructor (pos){
		this.basePos = this.pos = pos.add(new Vector(0.2, 0.1)); // coins shoud fly
		this.size = new Vector (0.6, 0.6);
		this.randomMove = Math.random() * Math.PI * 2; //random pos to desynchronize all coins movement
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
	}

	//chek  for delay after completing Level
	isFinished (){
		return this.status !== null && this.finishDelay < 0;
	}
}
//Not using babel js to const elem directly in class. (mb later) Indetefier of moving elements in level array.
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