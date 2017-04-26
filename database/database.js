const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/terraria_game';

class Database {
  createUser(user, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('users').insertOne(user, callback);
    });
  }

  getUser(data, callback = ()=>{}, key = 'email'){
    MongoClient.connect(url, (err, db) => {
      console.log(err, 'huh');
      db.collection('users').find({
        [key]: data
      }).next(callback);
    });
  }
  updateUserHighestScore(userName, data, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('users').find({
        userName,
      }).next((err, doc)=>{
        if(!doc.highScore || doc.highScore < data){
          db.collection('users').update({userName}, { $set: {highScore: data}});
        }
      });
    });
  }
  updateKeyMap(email, keyMap, callback){
    MongoClient.connect(url, (err, db) => {
      db.collection('users').update({email}, { $set: {
        keyMap
      }});
    });
  }

  createWorld(name, email, blocks, players, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').insertOne({
        name, email, blocks, players
      }, callback);
    });
  }

  saveWorld(name, blocks, players, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').update({name}, {
        $set: {
          blocks,
          players
        }
      });
    });
  }

  getWorldNames(email, callback){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').find({email}, {name: 1}).toArray(callback);
    });
  }
  deleteWorld(name, callback){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').remove({name}, callback);
    });
  }
  loadWorld(name, callback = () => {}){
    MongoClient.connect(url, (err, db) => {
      if(err){
        return;
      }
      db.collection('worlds').find({
        name
      }).next(callback);
    });
  }
}


module.exports = Database;
