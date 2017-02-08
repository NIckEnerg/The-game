class Vector{
	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	add(vector){
		if (vector instanceof Vector)
			return new Vector(vector.x + this.x, vector.u + this.y);
		else return new Error("Not a vector");
	}

	vectorLenght(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	multiply(k){
		return new Vector(this.x * k, this.y *k);
	}

	addAngLength(angle, length){
		return new Vector(this.x + Math.cos(angle) * length, this.y + Math.cos(angle) * length);
	}
}

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
					this.actors.push(new Actor(new Vector(x, y), ch));
				else if (ch == "x")
					fieldType = "wall";
				else if (ch == "!")
					fieldType = "lava";
				gridLine.push(fieldType);
			}
			this.grid.push(gridLine);
		}
		this.player = this.actors.filter(function(actor) {return actor.type == "player";})[0];
		this.status = this.finishDelay = null;
	}

	//chek  for delay after completing Level
	isFinished (){
		return this.status !== null && this.finishDelay < 0;
	}
}
//Not using babel js to const elem directly in class. (mb later) Indetefier of elements in level array.
Level.prototype.actorChars = {
	"@": Player,
	"o": Coin,
	"!": Lava, 
};