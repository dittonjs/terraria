class GameNetwork {
  constructor(networkData){
    this.networkData = networkData;
    this.socket = io();
    this.playerId = null;
    this.playerIds = []
    this.isLeader = false;
    this.setupConnection();
  }

  setupConnection(){

    // this.socket.on('player id assigned', (data) => {
    //   console.log('playerId assigned', data);
    //   this.playerId = data.playerId
    //   this.isLeader = !!data.isLeader;
    // });
    //
    // this.socket.on('leader changed', (data)=>{
    //   this.isLeader = data.newLeaderId == this.playerId;
    // });
    //
    // this.socket.on('player connected', (data) => {
    //   this.playerIds = data.players;
    // });
    //
    // this.socket.on('player disconnected', (data) => {
    //   this.playerIds = data.players;
    // });
  }

  on(message, callback){
    this.socket.on(message, callback)
  }

  emit(message, data){
    this.socket.emit(message, data);
  }

  instantiate(obj){
    obj.gameName = this.networkData.gameName;
    obj.creatorId = this.networkData.playerId;
    this.socket.emit('instantiate', obj);
  }

  destroy(id, attributes){
    this.socket.emit('destroy', {id, attributes, gameName: this.networkData.gameName});
  }

  update(id, attributes){
    this.socket.emit('update', {id, attributes, gameName: this.networkData.gameName});
  }
}
