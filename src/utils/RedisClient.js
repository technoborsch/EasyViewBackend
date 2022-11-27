const redis = require("redis");

const redisHost = process.env['REDIS_HOST'];
const redisPort = process.env['REDIS_PORT'];

const refreshJWTExpiry = process.env['REFRESH_JWT_EXPIRY']; //in days

/**
 * Computes the time in seconds for expiration of redis key related to refresh tokens
 *
 * @returns {number} Time in seconds when token must expire
 */
const getExpiryForRedisKey = () => Date.now() * 1000 + Number.parseInt(refreshJWTExpiry) * 24 * 60 * 60;

/**
 * Client to communicate with redis
 */
const redisClient = redis.createClient({url: `redis://${redisHost}:${redisPort}`});
redisClient.on('error', (err) => {console.log('Redis error: ', err)});

/**
 * Method used to get token from blacklist. If value exist, that means that tins token is blacklisted
 *
 * @param {string} token Token that should be checked if it is blacklisted
 * @returns {Promise<string>} Promise with value of given key
 */
redisClient.getBlacklistedToken = async (token) => {
    return await redisClient.get(`bl_${token}`);
};

/**
 * Method that adds token to blacklist with expiration time that is equal to expiration time of a token
 *
 * @param {string} token Token that should be blacklisted
 * @returns {Promise<void>}
 */
redisClient.addTokenToBlackList = async (token) => {
    const key = `bl_${token}`;
    await redisClient.set(key, 1);
    await redisClient.expireAt(key, getExpiryForRedisKey());
};

/**
 * Method used to get current refresh token of a user
 *
 * @param {string} id ID of a user
 * @returns {Promise<string>} Promise with current token of a user if exists
 */
redisClient.getActualTokenOfUser = async (id) => {
    return await redisClient.get(`refresh_token_${id}`);
};

/**
 * Sets this token as current token to a user with expiration time that is equal to token expiration time
 *
 * @param {string} id ID of a user
 * @param {string} token Token that should be set as current
 * @returns {Promise<void>}
 */
redisClient.setTokenToUser = async (id, token) => {
    const key = `refresh_token_${id}`
    await redisClient.set(key, token);
    await redisClient.expireAt(key, getExpiryForRedisKey());
}

module.exports = redisClient;