const { createClient } = require("redis");

async function init(url) {
    const client = createClient(url ? {url} : undefined);
    await client.connect();
    return client;
}

module.exports = {
    init
}