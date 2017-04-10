const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/terraria';

class Database {
  createUser(user, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('users').insertOne(user, callback);
    });
  }

  getUser(email, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('users').find({
        email
      }).next(callback);
    });
  }

  createWorld(name, blocks, playerIds, callback = ()=>{}){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').insertOne({
        name, blocks, playerIds
      }, callback);
    });
  }

  getWorldNames(callback){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').find({}, {name: 1}).toArray(callback);
    });
  }

  loadWorld(name, callback = () => {}){
    MongoClient.connect(url, (err, db) => {
      db.collection('worlds').find({
        name
      }).next(callback);
    });
  }
}


module.exports = Database;
