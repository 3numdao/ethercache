var express = require('express');
var router = express.Router();
const { providers } = require("ethers");

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

class NotFoundError extends Error {
  constructor(message) {
    super(message);

    this.name = 'NotFoundError';
    this.code = 404;
  }
}

async function doLookup(name) {
  const provider = new providers.JsonRpcProvider(ETH_API_SERVER);
  const resolver = await provider.getResolver(name);
  if (!resolver) {
    throw new NotFoundError("Name provided was not found");
  }

  const url = await resolver.getText('phone');

  if (!url) {
    throw new NotFoundError("User did not have a phone number");
  }
  return url;
}

function saveNameUrl(name, url) {
  const minutes = 5;
  memoryCache[name] = {
    url,
    goodTill: Date.now() + MILLIS_PER_MINUTE * minutes
  }
}

async function getUrl(name) {
  const nameFromCache = memoryCache[name];
  if (nameFromCache && nameFromCache.goodTill > Date.now()) {
    return nameFromCache.url;
  }

  const url = await doLookup(name);
  if (url) 
    saveNameUrl(name, url);

  return url;
}

router.get("/", async (request, response) => {
  try {
    const name = request.query.name;

    if (name && name != '') {
        const url = await getUrl(name);
        response.setHeader("Content-Type", "text/plain")
        return response.status(200).send(url);
    }

    return response.status(400).send({message: "Name was not provided. Name is a required query param."});
  } catch(e) {
    if (e instanceof NotFoundError) {
      return response.status(e.code).send(e.message)
    }
  }

  return response.status(500).send("Unexpected error occurred");
});

module.exports = router;