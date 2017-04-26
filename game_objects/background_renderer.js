
class BackgroundRenderer extends GameObject {
  constructor(...args){
    super(...args);
    this.hillsFront = new JSprite(this.game.assets.hillsFront, 4096, 0, 0, 4096, 1800);
    this.hillsBack = new JSprite(this.game.assets.hillsBack, 4096, 0, 0, 4096, 1800);
    this.starBackground = new JSprite(this.game.assets.starsBackground, 2560, 0, 0, 2560, 1600);
  }
  render(){
    this.game.graphics.drawImg(
      {x: 0, y: 500},
      this.starBackground,
      {renderIfOffScreen: true, parallax: 0.01}
    );
    this.game.graphics.drawImg(
      {x: 1500, y: 700},
      this.hillsBack,
      {renderIfOffScreen: true, parallax:0.3}
    );
    this.game.graphics.drawImg(
      {x: 1500, y: 900},
      this.hillsFront,
      {renderIfOffScreen: true, parallax:0.6}
    );
  }
}
