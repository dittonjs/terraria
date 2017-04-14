class GameInput {
  constructor(keyMap){
    this.keyMap = keyMap;
    this.axis = {
      x: 0,
      y: 0,
      fire: 0,
      sprint: 0,
    }
    this.axisListener = this.axisListener.bind(this);
    window.addEventListener("keydown", this.axisListener);
    window.addEventListener("keyup", this.axisListener);
  }

  setAxis(axis, value){
    this.axis[axis] = value;
  }

  getAxis(axis){
    return this.axis[axis];
  }

  axisListener(e){
    e.preventDefault();
    switch(e.keyCode){
      case 38:
      case 87:
      case 73: {
        let val;
        if(e.type == "keydown"){
          val = -1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('y') == -1){
            val = 0;
          } else {
            val = this.getAxis('y');
          }
        }
        this.setAxis('y', val);
        break;
      }
      case 40:
      case 83:
      case 75:{
        let val;
        if(e.type == "keydown"){
          val = 1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('y') == 1){
            val = 0;
          } else {
            val = this.getAxis('y');
          }
        }
        this.setAxis('y', val);
        break;
      }
      case this.keyMap.left:{
        let val;
        if(e.type == "keydown"){
          val = -1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('x') == -1){
            val = 0;
          } else {
            val = this.getAxis('x');
          }
        }
        this.setAxis('x', val);
        break;
      }
      case this.keyMap.right: {
        let val;
        if(e.type == "keydown"){
          val = 1;
        }
        if(e.type == "keyup"){
          if(this.getAxis('x') == 1){
            val = 0;
          } else {
            val = this.getAxis('x');
          }
        }
        this.setAxis('x', val);
        break;

      }
      case this.keyMap.jump: {
        console.log(this.keyMap.jump);
        this.setAxis('fire', e.type == 'keydown' ? 1 : 0);
        break;
      }
      case this.keyMap.sprint: {
        this.setAxis('sprint', e.type == 'keydown' ? 1 : 0);
        break
      }
      default:
        break;
    }
  }
}
