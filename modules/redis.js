const { createClient } = require("redis");

async function init(url) {
    const client = createClient(url ? {url} : undefined);
    client.on("error", (error) => console.error(error));
    await client.connect();
    return client;
}

module.exports = {
    init
}