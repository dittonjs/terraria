const socketIO        = require('socket.io');
const express         = require('express');
const http            = require('http');
const UUID            = require('node-uuid');
const _               = require('lodash');
const bodyParser      = require('body-parser');
const database        = new (require('./database/database'));
const verbose         = false;
const port            = 9000;
const app             = express();
const server          = http.Server(app);
const io              = socketIO(server);
const NoiseGenerator  = require('./noise');

/* Express server set up. */

//The express server handles passing our content to the browser,
//As well as routing users where they need to go. This example is bare bones
//and will serve any file the user requests from the root of your web server (where you launch the script from)
//so keep this in mind - this is not a production script but a development teaching tool.

    //Tell the server to listen for incoming connections
server.listen( port );

    //Log something so we know that it succeeded.
console.log('\t :: Express :: Listening on port ' + port );
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

    //By default, we forward the / path to index.html automatically.
app.get( '/', function( req, res ){
    res.sendfile( __dirname + '/index.html' );
});

app.get('/users', (req, res) => {
  database.getUser(req.query.email, (err, doc)=>{
    res.send(JSON.stringify(doc));
  });
});
// app.get('/*', (req, res) => {
//   res.sendFile(`${__dirname}/${req.params[0]}`);
// });


const defaultKeyMap = {
  left: 65,
  right: 68,
  jump: 32,
  toggleMenu: 9,
  sprint: 16
}

app.post('/users', (req, res) => {
  console.log(req.body);
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


class Game {
  constructor(name){
    this.gameObjects = {};
    this.blocks = [];
    this.players = [];
    this.name = name;
  }
}
const currentGames = {};
const players = [];
const readyPlayers = [];
let incrementalId = 0;
const gameObjects = {};
io.on("connection", (socket)=>{
  players.push(socket.id);
  let payload = {
    playerId: socket.id
  }

  socket.emit('player id assigned', payload);
  io.emit('player connected', { players });
  console.log('a user connected');
  socket.on('disconnect', function(){
    _.remove(players, (player) => player == socket.id);
    io.emit('player disconnected', { players });
    console.log('user disconnected');
  });

  socket.on('ready', () => {
    readyPlayers.push(socket.id);
    io.emit('player ready', {readyPlayers});
  });

  socket.on('game started', () => {
    database.getWorldNames((err, docs) => {
      socket.emit('world names loaded', docs);
    });
  });

  socket.on('instantiate', (gameObject)=>{
    console.log(`${gameObject.name} OBJECT INSTANTIATED`)
    if(gameObject.name == 'laser'){
      gameObject.creatorId = socket.id;
      io.emit(`${gameObject.name} instantiated`, gameObject);
      return;
    }
    gameObject.serverId = incrementalId;
    gameObject.creatorId = socket.id;
    currentGames['hello world'].gameObjects[incrementalId] = gameObject;
    incrementalId+=1;
    io.emit(`${gameObject.name} instantiated`, gameObject);
  });

  socket.on('destroy', (data) => {
    const obj = currentGames['hello world'].gameObjects[data.id];
    if(!obj) return;
    console.log(obj.name + ' OBJECT DESTROY');
    _.merge(obj, data.attributes)
    delete currentGames['hello world'].gameObjects[data.id];
    io.emit(`${obj.name} destroyed`, obj);
  });

  socket.on('update', (data) => {
    if(!currentGames['hello world']) return;
    _.merge(currentGames['hello world'].gameObjects[data.id], data.attributes);
    io.emit(
      `${currentGames['hello world'].gameObjects[data.id].name} updated`,
      currentGames['hello world'].gameObjects[data.id]
    );
  });

  socket.on('new game', (data)=>{
    currentGames[data.name] = new Game(data.name);
    const blocks = buildBlocks(data.name, currentGames[data.name]);
    socket.emit('blocks created', blocks);
    socket.emit('enemies spawned', []);
    const player = buildPlayer(currentGames[data.name], socket.id);
    socket.emit('leader changed', {newLeaderId: socket.id});
    socket.emit('players ready', currentGames[data.name].players);
    socket.emit('server ready', currentGames[data.name].name);
    io.emit('game ready', data.name);
  });

  socket.on('join game', (data)=>{
    const game = currentGames[data.name];
    const player = buildPlayer(game, socket.id);
    socket.emit('game joined', {gameObjects: game.gameObjects, player});
    socket.broadcast.emit('player joined', player);
  });
});

function buildPlayer(game, playerId){
  const player = {
    name: 'player',
    serverId: incrementalId++,
    creatorId: playerId,
    transform: {
      x:800,
      y:0,
    },
    health: 100,
    damage: 100
  }
  game.gameObjects[player.serverId] = player;
  game.players.push(player);
  return player;
}

function buildBlocks(seed, game){
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
      serverId: incrementalId++,
      creatorId: 'server'
    }
    game.gameObjects[newBlock.serverId] = newBlock;
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
        serverId: incrementalId++,
        creatorId: 'server'
      }
      game.gameObjects[childBlock.serverId] = childBlock;
      blocks.push(childBlock);
    }
  }
  return blocks;
}
