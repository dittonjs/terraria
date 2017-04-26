const defaultCircleOptions = {
  shouldFill: true,
  fillStyle: "black",
  lineWidth: 1,
  strokeStyle: "black",
  shouldStroke: true,
}

const defaultRectOptions = {
  fillStyle: null,
  strokeStyle: 'black',
}

const defaultLineOptions = {
  strokeStyle: "black"
}
const defaultTextOptions = {
  fillStyle: 'black',
  font: '12px'
}

const defaultImgOptions = {};

class JdCanvasApi {
  constructor(context){
    this.context = context;
    this.camera = null;
  }
  setCamera(camera){
    this.camera = camera;
  }
  _handleResize(){
    this.context.canvas.width = window.innerWidth;
    this.context.canvas.height = window.innerHeight;
  }
  rotate(at){
    if(!at.rotation) return;
    this.context.translate(at.x, at.y);
    this.context.rotate(at.rotation * Math.PI/180);
    this.context.translate(-at.x, -at.y);
  }
  isOffScreen(at){
    return at.x < this.camera.transform.x - 50 ||
           at.x > this.camera.transform.x + this.context.canvas.width + 50 ||
           at.y < this.camera.transform.y - 50 ||
           at.y > this.camera.transform.y + this.context.canvas.height + 50;
  }

  drawRect(at, width, height, options = {}){
    // this._handleResize();
    const opts = _.assign({}, defaultRectOptions, options);
    this.context.save();
    this.rotate(at);
    _.merge(this.context, opts);
    this.context.fillRect(
      at.x - (width/2),
      at.y - (height/2),
      width,
      height
    );

    this.context.restore();
  }

  drawLine(from, to, options = {}){
    // this._handleResize();
    let cameraX = 0;
    let cameraY = 0;
    this.camera && (cameraX = this.camera.transform.x);
    this.camera && (cameraY = this.camera.transform.y);
    const opts = _.assign({}, defaultLineOptions, options);
    this.context.save();
    _.merge(this.context, opts);
    this.context.beginPath();
    this.context.moveTo(from.x - cameraX, from.y - cameraY);
    this.context.lineTo(to.x - cameraX, to.y - cameraY);
    this.context.stroke();
    this.context.restore();
  }

  drawCircle(at, radius, options = {}){
    // this._handleResize();
    const opts = _.assign({}, defaultCircleOptions, options);
    this.context.save();
    _.merge(this.context, opts);
    this.context.beginPath();
    this.context.arc(at.x, at.y, radius, 0, 2 * Math.PI, false);
    opts.shouldFill && this.context.fill();
    opts.shouldStroke && this.context.stroke();
    this.context.restore();
  }

  drawText(at, text, options = {}){
    // this._handleResize();
    const opts = _.assign({}, defaultTextOptions, options);
    this.context.save();
    _.merge(this.context, opts);
    this.context.fillText(text, at.x, at.y);
    this.context.restore();
  }

  drawImg(at, sprite, options = {}){
    // this._handleResize();
    const parallax = options.parallax || 1;
    if(!options.renderIfOffScreen && this.isOffScreen(at)) return;
    const opts = _.assign({}, defaultImgOptions, options);
    this.context.save();
    let cameraX = 0;
    let cameraY = 0;
    this.camera && (cameraX = this.camera.transform.x*parallax);
    this.camera && (cameraY = this.camera.transform.y*parallax);
    options.flipImage && this.context.translate(at.x, at.y)
    options.flipImage && this.context.scale(-1,1);
    options.flipImage && this.context.translate(-at.x, -at.y);
    // _.merge(this.context, opts);
    this.context.drawImage(
      sprite.img,
      options.flipImage ? sprite.sourceX + 64  : sprite.sourceX,
      sprite.sourceY,
      sprite.sourceWidth * (options.flipImage ? -1 : 1),
      sprite.sourceHeight,
      options.flipImage ? at.x - (sprite.dWidth / 2) + cameraX + 64 : at.x - (sprite.dWidth / 2) - cameraX,
      at.y - (sprite.dHeight / 2) - cameraY,
      sprite.dWidth * (options.flipImage ? -1 : 1),
      sprite.dHeight
    );
    this.context.restore();
  }
  moveCamera(to){
    this.context.save();
    this.context.translate(to.x, to.y);
    this.context.restore();
  }
}
