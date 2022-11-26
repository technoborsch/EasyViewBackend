const redis = require("redis");

const redisHost = process.env['REDIS_HOST'];
const redisPort = process.env['REDIS_PORT'];

const redisClient = redis.createClient({url: `redis://${redisHost}:${redisPort}`});
redisClient.on('error', (err) => {console.log('Redis error: ', err)});

module.exports = redisClient;