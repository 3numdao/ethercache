var express = require('express');
var router = express.Router();

const MILLIS_PER_MINUTE = 60000;
const ETH_API_SERVER =
    `https://eth-mainnet.alchemyapi.io/v2/${process.env.ether_token}`;

/*
 * {
 *  [key: string]: {
 *    url: string,
 *    goodTill: number
 *  }
 * }
 */
const memoryCache = {};

async function doLookup(name) {
  const provider = new etherProviders.JsonRpcProvider(ETH_API_SERVER);
  const resolver = await provider.getResolver(name);
  const url = await resolver.getText('phone');
  return url;
}

function saveNameUrl(name, url) {
  const minutes = 5;
  memoryCache[name] = {
    url,
    goodTill: Date.now() + MILLIS_PER_MINUTE * minutes
  }
}

/** */
async function getUrl(name) {
  const nameFromCache = memoryCache[name];
  if (nameFromCache && nameFromCache.goodTill > Date.now()) {
    return nameFromCache.url;
  }

  const url = await doLookup(name);
  saveNameUrl(name, url);

  return url;
}

router.get("/", async (request, response) => {
    const name = request.query.name;

    if (name && name != '') {
        const url = await getUrl(name);
        response.setHeader("Content-Type", "text/plain")
        response.status(200).send(url);
    }

    res.status(404).send("Name was not found");
});

module.exports = router;