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
	constructor(plan){
		this.width = plan[0].length;
		this.height = plan.length;
		this.grid = [];
		this.actors = [];
	}



}