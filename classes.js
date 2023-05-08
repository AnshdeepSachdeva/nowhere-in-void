import * as THREE from 'https://cdn.skypack.dev/three@0.136';

class Cell {
    constructor(i,j){
        this.i = i;
        this.j = j;
        this.walls = [true, true, true, true];
        this.visited = false;
    this.visited = false;
    }
    checkNeighbors(grid,cols,rows,sleep) {
      let i = this.i
      let j = this.j
      let neighbours = [];
  
      let top = grid[this.index(i, j - 1,cols,rows,sleep)];
      let right = grid[this.index(i + 1, j,cols,rows,sleep)];
      let bottom = grid[this.index(i, j + 1,cols,rows,sleep)];
      let left = grid[this.index(i - 1, j,cols,rows,sleep)];
  
      if (top && !top.visited) {
        neighbours.push(top);
      }
      if (right && !right.visited) {
        neighbours.push(right);
      }
      if (bottom && !bottom.visited) {
        neighbours.push(bottom);
      }
      if (left && !left.visited) {
        neighbours.push(left);
      }
  
      if (neighbours.length > 0) {
        let r = Math.floor(Math.random() * neighbours.length);
        return neighbours[r];
      } else {
        return undefined;
      }
    };
    index(i, j,cols,rows,sleep) {
        if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
            return -1;
        }
        return i + j * sleep;
    }
}

class Wall {
    constructor (x,y,aO,w) {
        this.x = x
        this.y = y
        this.w = w
        this.p1 = this.twoPointsAcross(this.x,this.y,this.w)[0]
        this.p2 = this.twoPointsAcross(this.x,this.y,this.w)[1]
        this.eq = this.getLineEquation(this.p1,this.p2)
        this.slope = this.eq[0]
        this.yIntercept = this.eq[1]
        this.perpDist = 0;
        this.atRange = false;
        this.distance = 0;
        this.wn = aO;
        
    }
  
    twoPointsAcross (x,y,w) {
      return [
          [  x-w/2,  y ],
          [  x+w/2,  y ]
      ];
      
  }
    getLineEquation(a, c) {
        // Calculate slope
        let m = (c[1] - a[1]) / (c[0] - a[0]);
        
        // Calculate y-intercept
        let b = a[1] - m * a[1];
        // Return equation in slope-intercept form
        return [m,b];
    }
    getPerpendicularDistance(point) {
        let x = point[0];
        let y = point[1];
        let distance = Math.abs(y - this.slope * x - this.yIntercept) / Math.sqrt(1 + this.slope**2);
        //console.log(1 + this.slope**2,y - this.slope * x - this.yIntercept)
        return distance;
    }
  
    setup (point){
        this.perpDist = this.getPerpendicularDistance(point)
        this.distance = this.findDistance(point)
        this.atRange = this.inRangeFinder()
    }
  
    inRangeFinder(){
        let fy = Math.sqrt(Math.pow(this.distance,2)-Math.pow(this.perpDist,2))
        //console.log("hypotenuse",this.distance,"side1",this.perpDist,"side2",fy,fy<w/2)
  
        if(fy<=this.w/2){
            return true
        }
        else {
            return false
        }
    }
    findDistance(point){
        let d = Math.sqrt(Math.pow(point[0]-this.x,2)+Math.pow(point[1]-this.y,2))
        return d;
    }
    preventMovement(mV,point){
      let x = point[0]
      let y = point[1]
      
      if(y<this.y){
          if(mV.z>0) { 
              mV.z = 0
          }
      }
      else{
          if(mV.z<0) { 
              mV.z = 0
          }
      }
      return mV
    }
}
  
class WallSC {
    constructor (x,y,aO,w) {
        this.x = x
        this.y = y
        this.p1 = this.twoPointsAcross(this.x,this.y)[0]
        this.p2 = this.twoPointsAcross(this.x,this.y)[1]
        this.eq = this.getLineEquation(this.p1,this.p2)
        this.perpDist = 0;
        this.atRange = false;
        this.wn = aO
        this.w = w
    }
  
    twoPointsAcross (x,y) {
        return [
            [  x,  y - this.w/2 ],
            [  x,  y + this.w/2 ]
        ];
    }
    getLineEquation(a, c) {
        if (a[0] == c[0])
            return a[0]
    }
    getPerpendicularDistance(point) {
        let x = point[0];
        let y = point[1];
        let distance = Math.abs(x-this.eq);
        return distance;
    }
  
    setup (point){
        this.perpDist = this.getPerpendicularDistance(point)
        this.distance = this.findDistance(point)
        this.atRange = this.inRangeFinder()
    }
  
    inRangeFinder(){
        let fy = Math.sqrt(Math.pow(this.distance,2)-Math.pow(this.perpDist,2))
        //console.log("hypotenuse",this.distance,"side1",this.perpDist,"side2",fy,fy<w/2)
  
        if(fy<=this.w/2){
            return true
        }
        else {
            return false
        }
    }
    findDistance(point){
        let d = Math.sqrt(Math.pow(point[0]-this.x,2)+Math.pow(point[1]-this.y,2))
        return d;
    }
    preventMovement(mV,point){
      let x = point[0]
      let y = point[1]
      if(x<this.x){
          if(mV.x>0) { 
              mV.x = 0
          }
      }
      else{
          if(mV.x<0) { 
              mV.x = 0
          }
      }
      return mV
    }
    
}
 
class Player{
    constructor(camera){
        this.x = camera.position.x
        this.y = camera.position.z
        
        // badges
        this.bSpeed = {level:0,u:0}
        this.bThrough = {level:0,u:0}
        this.bMap = {level:0,u:0}
        this.bDisarm = {level:0,u:0}
        
        // upgrades
        this.uSpeed = false
        this.uThrough = false
        this.uMap = false
        this.uDisarm = false
        
        this.level = 1
        
        this.keysCount = 0
        this.coinsCount = 0
        this.tokensCount = 0;
    }
}

class ItemCell {
    constructor (x,y,sleep){
        this.x = x
        this.y = y
        this.n = x*sleep+y
        this.boostType = 0
        this.comp
    }
}

class CustomFCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 2 - 1;
		const ty = 0;
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}

class CustomSCurve extends THREE.Curve {
	constructor(scale = 1) {
		super();
		this.scale = scale;
	}
	getPoint(t, optionalTarget = new THREE.Vector3()) {
		const tx = 0;
		const ty = t * 2 - 1;
		const tz = 0;

		return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
	}
}

export {Cell , Wall, WallSC, Player, CustomFCurve, CustomSCurve, ItemCell };