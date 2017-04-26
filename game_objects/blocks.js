class BlockParticle extends Particle {
  constructor(...args){
    super(...args);
    this.transform = new Transform(
      this.parent.transform.x + _.random(-16, 16),
      this.parent.transform.y + _.random(-5, 5)
    );
    this.transform.rotation = (this.transform.x - this.parent.transform.x);
    this.xVelocity = 10 * (this.transform.x - this.parent.transform.x);
    this.yVelocity = 10 * (this.transform.y - this.parent.transform.y);
    this.gravity = 0;
    this.sprite = new JSprite(this.game.assets.sprites, 0, 0, 14 * 32, 32,32,8+_.random(1,4),8+_.random(1,4));
    this.timePlaying = 0;

  }
  update(elapsedTime){
    this.gravity += (1.5 * 100 * (elapsedTime/1000)*(elapsedTime/1000));
    const modifier = this.xVelocity < 0 ? -1 : 1;
    // this.xVelocity -= Math.abs(this.transform.x - this.parent.transform.x) * modifier;
    this.transform.translate(
      this.xVelocity * (elapsedTime/1000),
      (this.yVelocity * (elapsedTime/1000)) + this.gravity
    );

    this.timePlaying += elapsedTime;
    // console.log(this.opts.lifetime);
    if(this.opts.lifetime && this.timePlaying > this.opts.lifetime){
      this.parent.disable();
      return;
    }
  }
  awake(){
    this.timePlaying = 0;
    this.gravity = 0;
    this.transform = new Transform(
      this.parent.transform.x + _.random(-16, 16),
      this.parent.transform.y + _.random(-16, 16)
    );
    this.xVelocity = 2 * (this.transform.x - this.parent.transform.x);
    this.yVelocity = 2 * (this.transform.y - this.parent.transform.y);
  }
  render(){
    this.game.graphics.drawImg(
      this.transform,
      this.sprite
    );
  }
}

class BlockParticleEffect extends ParticleEffect {
  constructor(...args){
    super(...args);
    this.transform = new Transform(this.parent.transform.x, this.parent.transform.y);
  }
}

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
  onDestroy(){
    setTimeout(() => {
      this.game.assets.deadBrick.volume = .03;
      this.game.assets.deadBrick.play()
    }, 100);
    const particleEffectOpts = {
      particleCount: 600,
      atATime: 40,
      particleClass: BlockParticle,
      particleOpts: {
        lifetime: 1000,
      }
    }
    this.particleEffect = this.scene.instantiate(BlockParticleEffect, false, [particleEffectOpts], this);
    this.particleEffect.play();
    // I know the better way to do this, however my game is setup so that no change
    // can occur outside of the render loop, so the destroy wont happen until the next update.
    setTimeout(() => {
       this.scene.destroy(this.particleEffect)
    }, 1000);
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

class StoneBlock extends Block {
  constructor(...args){
    super(...args);
    this.health = 200;
    this.gives = {name: 'dirt', count: 3};
    this.sprite = new JSprite(this.game.assets.sprites, 0, 16*32, 16 * 32);
  }
}

class BrickBlock extends Block {
  constructor(...args){
    super(...args);
    this.health = 500
    this.gives = {name: 'dirt', count: 3};
    this.sprite = new JSprite(this.game.assets.sprites, 0, 8 * 32, 16 * 32);
  }
}

class CementBlock extends Block {
  constructor(...args){
    super(...args);
    this.health = 1000;
    this.gives = {name: 'dirt', count: 3};
    this.sprite = new JSprite(this.game.assets.sprites, 0, 4*32, 18 * 32);
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
  Dirt: DirtBlock,
  "Stone Block": StoneBlock,
  "Brick Block": BrickBlock,
  "Cement Block": CementBlock
}
