const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.log("Redis client error", err));

async function init() {
    await client.connect();

    return client;
}

module.exports = {
    init
}