class GameObject {

  constructor(game, scene, parent){
    this.transform = new Transform(0,0);
    this.game = game;
    this.parent = parent;
    this.scene = scene;
  }

  awake(){}

  onDestroy(){}

  update(elapsedTime){}

  render(context){};
}
