class Laser extends GameObject {
  constructor(to, ...args){
    super(...args);
    this.name = 'laser';
    this.to = to;
    this.duration = 500;
    this.life = 0;
    this.from = {};
  }

  update(elapsedTime){
    const from = this.parent ? {x: this.parent.transform.x, y: this.parent.transform.y - 15} : this.from;
    this.from = from;
    this.life += elapsedTime;
    // this.game.network.update(
    //   this.serverId,
    //   {to: {x: this.to.x, y:this.to.y}, from: {x: from.x, y: from.y}, life: this.life}
    // );
    if(this.life > this.duration){
      this.parent && (this.parent.shooting = false);
      // this.game.network.destroy(this.serverId);
      this.scene.destroy(this);
    }
  }

  render(){
    this.game.graphics.drawLine(
      this.from,
      this.to,
      {
        lineWidth: 10 - (10 * this.life / this.duration),
        strokeStyle: 'blue'
      }
    );
  }

}
