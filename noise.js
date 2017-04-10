const seedrandom = require('seedrandom');
class NoiseGenerator {
  constructor(seed = 'hello', amplitude = 1, scale = 1){
    this.rng = seedrandom(seed);
    this.maxVertices = 256;
    this.maxVerticesMask = 255;
    this.amplitude = amplitude;
    this.scale = scale;
    this.rVals = [];
    this._loadRVals();
  }

  _loadRVals(){
    for(let i = 0; i < this.maxVertices; i++){
      this.rVals.push(this.rng());
    }
  }

  _lerp(a, b, t){
    return a * (1 - t) + b * t;
  }

  getVal(x){
    const scaledX = x * this.scale;
    const flooredX = Math.floor(scaledX);
    const t = scaledX - flooredX;
    const tRemapSmoothstep = t * t * (3 - 2 * t);

    const xMin = flooredX & this.maxVerticesMask;
    const xMax = (xMin + 1) & this.maxVerticesMask;
    const y = this._lerp(this.rVals[xMin], this.rVals[xMax], tRemapSmoothstep);
    return y * this.amplitude;
  }
}

module.exports = NoiseGenerator;
