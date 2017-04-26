const socketIO        = require('socket.io');
const express         = require('express');
const http            = require('http');
const uid             = require('uid');
const _               = require('lodash');
const bodyParser      = require('body-parser');
const database        = new (require('./database/database'));
const verbose         = false;
const port            = 9000;
const app             = express();
const server          = http.Server(app);
const io              = socketIO(server);
const NoiseGenerator  = require('./noise');

server.listen( port );

console.log(':: Express :: Listening on port ' + port );

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get( '/', function( req, res ){
    res.sendfile( __dirname + '/game.html' );
});

app.get('/users', (req, res) => {
  req.query.email && database.getUser(req.query.email, (err, doc)=>{
    res.send(JSON.stringify(doc));
  });
  req.query.player_id && database.getUser(req.query.player_id, (err, doc)=>{
    res.send(JSON.stringify(doc));
  }, 'userName');
});

app.get('/world_names', (req, res) => {
  database.getWorldNames(req.query.creator_email, (err, doc)=>{
    res.send(JSON.stringify(doc));
  });
});

app.post('/create_world', (req, res) => {
  const blocks = buildBlocks(req.query.world_name);
  const player = buildPlayer(req.query.user_name);
  database.createWorld(req.query.world_name, req.query.email, blocks, [player], (err)=>{
    res.send(JSON.stringify({err}));
  });
});

app.get('/delete_world', (req, res) => {
  database.deleteWorld(req.query.world_name, (err)=>{
    res.send(JSON.stringify({err}));
  });
});


// the game uses these
app.get('/game_engine/*', (req, res) => {
  res.sendFile(`${__dirname}/game_engine/${req.params[0]}`);
});

app.get('/game_objects/*', (req, res) => {
  res.sendFile(`${__dirname}/game_objects/${req.params[0]}`);
});

app.get('/scenes/*', (req, res) => {
  res.sendFile(`${__dirname}/scenes/${req.params[0]}`);
});

app.get('/game/*', (req, res) => {
  res.sendFile(`${__dirname}/game/${req.params[0]}`);
});

app.get('/styles/*', (req, res) => {
  res.sendFile(`${__dirname}/styles/${req.params[0]}`);
});

app.get('/sounds/*', (req, res) => {
  res.sendFile(`${__dirname}/sounds/${req.params[0]}`);
});

app.get('/spritesheets/*', (req, res) => {
  res.sendFile(`${__dirname}/spritesheets/${req.params[0]}`);
});

app.get('/node_modules/superagent/*', (req, res) => {
  res.sendFile(`${__dirname}/node_modules/superagent/${req.params[0]}`);
});


const defaultKeyMap = {
  left: 65,
  right: 68,
  jump: 32,
  toggleMenu: 9,
  sprint: 16
}

app.post('/users', (req, res) => {
  const user = req.body;
  user.keyMap = defaultKeyMap;
  database.createUser(user, (err) => {
    if(err){
      res.send(JSON.stringify({err}))
    } else {
      res.send(JSON.stringify({status: 'ok'}));
    }
  });
});

app.post('/update_keymap', (req, res) => {
  const userEmail = req.body.userEmail;
  const keyMap = req.body.keyMap;
  database.updateKeyMap(userEmail, keyMap);
  res.send(JSON.stringify({status: 'ok'}));
});


class Game {
  constructor(name){
    this.gameObjects = {};
    this.name = name;
  }
}
const currentGames = {};

app.get('/current_games', (req, res) =>{
  const keys = _.map(currentGames, game => game.name);
  res.send(JSON.stringify(keys));
});

io.on("connection", (socket)=>{

  socket.on('disconnect', function(){
    io.emit('player disconnected');
    console.log('user disconnected');
  });

  socket.on('instantiate', (gameObject)=>{
    console.log(`${gameObject.name} OBJECT INSTANTIATED`)
    if(gameObject.name == 'laser'){
      // gameObject.creatorId = socket.id;
      socket.broadcast.emit(`${gameObject.name} instantiated`, gameObject);
      return;
    }
    gameObject.serverId = uid(10);
    // gameObject.creatorId = socket.id;
    currentGames[gameObject.gameName].gameObjects[gameObject.serverId] = gameObject;
    io.emit(`${gameObject.name} instantiated`, gameObject);
  });

  socket.on('destroy', (data) => {
    const obj = currentGames[data.gameName].gameObjects[data.id];
    if(!obj) return;
    console.log(obj.name + ' OBJECT DESTROY');
    _.merge(obj, data.attributes)
    delete currentGames[data.gameName].gameObjects[data.id];
    io.emit(`${obj.name} destroyed`, obj);
  });

  socket.on('update', (data) => {
    if(!currentGames[data.gameName] || !currentGames[data.gameName].gameObjects[data.id]) return;
    _.merge(currentGames[data.gameName].gameObjects[data.id], data.attributes);
    io.emit(
      `${currentGames[data.gameName].gameObjects[data.id].name} updated`,
      currentGames[data.gameName].gameObjects[data.id]
    );
  });

  socket.on('damage enemy', (data) => {
    io.emit('damage enemy', data)
  });

  socket.on('continue game', (data) => {
    database.loadWorld(data.name, (err, doc)=>{
      currentGames[data.name] = new Game(data.name);
      _.each(doc.blocks, (block)=>{ currentGames[data.name].gameObjects[block.serverId] = block; });
      _.each(doc.players, (player)=>{ currentGames[data.name].gameObjects[player.serverId] = player; });
      socket.emit('game loaded', {blocks: doc.blocks, players: doc.players});
    });
  });

  socket.on('join game', (data) => {
    const game = currentGames[data.name];
    const player = _.find(game.gameObjects, obj => obj.name == 'player' && obj.creatorId == data.playerId);
    if(!player){
      const newPlayer = buildPlayer(data.playerId);
      game.gameObjects[newPlayer.serverId] = newPlayer;
      io.emit('player joined', newPlayer);
    }
    // TODO what if the player joined game but isnt there next time
    socket.emit('game joined', {gameObjects: game.gameObjects});
  });

  socket.on('player died', data => {
    database.updateUserHighestScore(data.playerId, data.time);
    io.emit('player died');
  });

  socket.on('save game', (gameName) => {
    const game = currentGames[gameName];
    const blocks = _.filter(game.gameObjects, obj => obj.name == 'block');
    const players = _.filter(game.gameObjects, obj => obj.name == 'player');
    database.saveWorld(gameName, blocks, players);
  });
});

function buildPlayer(playerId){
  const player = {
    name: 'player',
    serverId: uid(10),
    creatorId: playerId,
    transform: {
      x:800,
      y:0,
    },
    health: 100,
    damage: 100,
  }
  return player;
}

function buildBlocks(seed){
  const noise = new NoiseGenerator(seed, 200, 1000);
  const blocks = [];
  for(let i=0; i < 100; i++){
    const y = noise.getVal(i);
    const normalY = Math.ceil(y / 32.0) * 32;
    let newBlock = {
      name: 'block',
      transform: {
        x: 16 + (i*32),
        y: normalY
      },
      health: 100,
      type: 'grass',
      damage: 0,
      serverId: uid(10),
      creatorId: 'server'
    }
    // game.gameObjects[newBlock.serverId] = newBlock;
    blocks.push(newBlock);
    for(let j = normalY + 32; j < 1024; j+=32){
      let childBlock = {
        name: 'block',
        transform: {
          x: 16 + (i*32),
          y: j,
        },
        health: 100,
        type: 'dirt',
        damage: 0,
        serverId: uid(10),
        creatorId: 'server'
      }
      // game.gameObjects[childBlock.serverId] = childBlock;
      blocks.push(childBlock);
    }
  }
  return blocks;
}
