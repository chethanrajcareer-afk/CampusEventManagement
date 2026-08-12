// Optional configuration file for local development.
// Rename to config.js and set your Atlas URI here if you do not want to use .env.

module.exports = {
  MONGO_URI: 'mongodb://<username>:<password>@host1:27017,host2:27017,host3:27017/<dbname>?replicaSet=<replicaSet>&authSource=admin&tls=true',
};
