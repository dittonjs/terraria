class Block extends multiple([Collider]) {
  constructor(at, ...args){
    super(...args);
    this.transform = new Transform(at.x, at.y);
    this.health = 100;
    this.damage = 0;
    this.gives = {}
    this.width = 32;
    this.height = 32;
    this.name = 'block';
    this.setColliderType(
      'box',
      {
        width: 32,
        height: 32,
      }
    );
  }

  render(){
    this.game.graphics.drawImg(
      this.transform,
      this.sprite
    );
  }
}

class GrassBlock extends Block {
  constructor(...args){
    super(...args);
    this.gives = {name: 'fiber', count: 5};
    this.sprite = new JSprite(this.game.assets.sprites, 0, 0, 15 * 32);
  }
}

class DirtBlock extends Block {
  constructor(...args){
    super(...args);
    this.gives = {name: 'dirt', count: 3};
    this.sprite = new JSprite(this.game.assets.sprites, 0, 0, 14 * 32);
  }
}

class DebugCamera extends GameObject{
  constructor(...args){
    super(...args);
    this.game.graphics.setCamera(this);
    this.transform = new Transform(0,0);
    this.speed = 300;
  }
  update(deltaTime){
    this.transform.x = this.scene.player.transform.x - (this.game.canvas.width/2);
    this.transform.y = this.scene.player.transform.y - (this.game.canvas.height/2);
  }

}

const BLOCKS = {
  Grass: GrassBlock,
  Dirt: DirtBlock
}
