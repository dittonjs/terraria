class Player extends multiple([Collider, AnimationMachine]) {
  constructor(...args){
    super(...args);
    this.transform = new Transform(500, 0);
    this.sprite = new JSprite(this.game.assets.player, 64*4, 0, 0, 64, 64);
    this.setColliderType(
      'box',
      {
        width: 20,
        height: 32
      }
    );
    this.groundChecker = this.scene.instantiate(GroundChecker, false, [], this);
    this.builder = this.scene.instantiate(Builder, false, [], this);
    this.speed = 150;
    this.inAir = true;
    this.gravity = 0;
    this.yVelocity = 0;
    this.animationMachine = null;
    this.conditions = {};
    this.shooting = false;
    this.healt = 100;
    this.damage = 50;
    this.inventory = new Inventory({
      fiber: 0,
      dirt: 0,
      stone: 0,
      wood: 0,
      electical: 0,
      sand: 0,
    });

    this.craftingMenu = new CraftingMenu(this, '', this.game);
    // this.craftingMenu.toggleMenu(true);
    this.craftingMenu.awake();
    window.inventory = this.inventory;
    this.setupAnimation();
    this.firstUpdate = true;
    this.terminalVelocity = 15;
  }

  setupAnimation(){
    const idle = [new JSprite(this.game.assets.player, 64*4, 0, 0, 64, 64)];
    const walk = [
      new JSprite(this.game.assets.player, 64*4, 64, 0, 64, 64),
      new JSprite(this.game.assets.player, 64*4, 64*2, 0, 64, 64),
      new JSprite(this.game.assets.player, 64*4, 64*3, 0, 64, 64),
      new JSprite(this.game.assets.player, 64*4, 0, 0, 64, 64)
    ]
    const run = [
      new JSprite(this.game.assets.player, 64*4, 64, 64, 64, 64),
      new JSprite(this.game.assets.player, 64*4, 64*2, 64, 64, 64),
      new JSprite(this.game.assets.player, 64*4, 64*3, 64, 64, 64),
      new JSprite(this.game.assets.player, 64*4, 0, 0, 64, 64)
    ];
    const jump = [
      new JSprite(this.game.assets.player, 64*4, 64*3, 64*2 + 16, 64, 64),
    ];

    this.addAnimation(new Animation(idle, 10000, true), 'idle');
    this.addAnimation(new Animation(walk, 100, true), 'walk');
    this.addAnimation(new Animation(run, 100, true), 'run');
    this.addAnimation(new Animation(jump, 10000, true), 'jump');
    this.setCurrentAnimation('idle');
    this.setConditionMap({
      idle: ()=>(true),
      walk: ()=>(this.game.input.getAxis('x') != 0),
      run: ()=>(this.game.input.getAxis('x') != 0 && this.game.input.getAxis('sprint') != 0),
      jump: ()=>(this.inAir)
    });
  }
  onCollision(other, dir){
    if(dir == 'right'){
      this.transform.x = other.transform.x - 16 - 11;
    }
    if(dir == 'left'){
      this.transform.x = other.transform.x + 16 + 11;
    }
    if(dir == 'bottom'){
      this.transform.y = other.transform.y - 16 - 17;
      this.inAir = false;
      this.gravity = 0;
      this.yVelocity = 0;
    }
    if(dir == 'top'){
      this.transform.y = other.transform.y + 16 + 17;
    }
  }

  layBlock(type, click){
    const isOccupied = this.builder.checkSquare();
    if(isOccupied){
      //probably play a sound
      return;
    }
    const {x, y} = this.builder.normalize({x:click.transform.x, y: click.transform.y});
    this.scene.instantiate(BLOCKS[type], true, [{x, y}]);
    this.game.network.instantiate({name: 'block', type, transform: {x,y}});
  }

  update(deltaTime){
    if(this.firstUpdate){
      this.firstUpdate = false;
      return;
    }
    const conditions = this.updateAnimations(deltaTime);
    _.each(this.game.readyInput, input => {
      if(input.key == this.game.input.keyMap.toggleMenu){
        this.craftingMenu.toggleMenu(!this.craftingMenu.open);
      }
    });
    this.craftingMenu.update();
    if(this === this.scene.player){
      if(!this.shooting && !this.craftingMenu.open && this.craftingMenu.currentSelection == 'Mining Laser'){
        _.each(this.game.readyInput, input => {
          if(input.key == 'click'){
            const raycastHit = this.scene.castRay(
              {x: this.transform.x, y: this.transform.y -15},
              {x: input.transform.x, y: input.transform.y}
            )

            this.shooting = true;
            const at = raycastHit? raycastHit : {x: input.transform.x, y: input.transform.y}
            const laser = this.scene.instantiate(Laser, false, [at], this);
            laser.creatorId = this.game.network.networkData.playerId;
            this.game.network.instantiate({name: 'laser', to: {x: at.x, y: at.y}, from: this.transform});
            if(raycastHit && raycastHit.obj.name == "block"){

              raycastHit.obj.health -= this.damage;
              if(raycastHit.obj.health <= 0){
                const get = raycastHit.obj.gives;
                this.inventory.addItem(get.name, get.count);
                this.scene.destroy(raycastHit.obj);
                this.game.network.destroy(raycastHit.obj.serverId);
              }
            }
          }
        });
      }
      if(!this.craftingMenu.open && this.craftingMenu.currentSelection != 'Mining Laser'){

        _.each(this.game.readyInput, input => {
          if(input.key == 'click'){
            // instantiate brick
            this.layBlock(this.craftingMenu.currentSelection, input);
          }
        });
      }
      if(!this.groundChecker.isOnGround || this.inAir){
        this.inAir = true;
        this.gravity += (9.8 * 70 * (deltaTime/1000)*(deltaTime/1000));
        this.gravity > this.terminalVelocity && (this.gravity = this.terminalVelocity);
      }
      if(!this.inAir && this.game.input.getAxis('fire') != 0){
        this.yVelocity = -300;
        this.inAir = true;
      }
      if(this.game.input.getAxis('x') > 0){
        this.facingDir = 'right';
      } else if(this.game.input.getAxis('x') < 0){
        this.facingDir = 'left';
      }
      let speed = this.speed + (100*this.game.input.getAxis('sprint'));
      this.transform.translate(
        deltaTime / 1000 * speed * this.game.input.getAxis('x'),
        0
      );
      if(this.inAir){
        this.transform.translate(
          0,
          this.yVelocity * (deltaTime/1000) + this.gravity
        )
      }
      conditions.dir = this.facingDir;
      this.game.network.update(this.serverId, {transform: this.transform, conditions});
    }
    this.groundChecker._update();
  }
  render(){
    this.craftingMenu.render();
    this.game.graphics.drawImg(
      this.transform,
      this.sprite,
      {flipImage: this.facingDir == 'left' || (!this.facingDir && this.conditions.dir == 'left')}
    );
  }
}
