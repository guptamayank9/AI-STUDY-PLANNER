const { createClient } = require("redis");

let client;

const connectRedis = async () => {
  client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();
  console.log("✅ Redis connected");
};

const getRedis = () => client;

module.exports = connectRedis;
module.exports.getRedis = getRedis;
