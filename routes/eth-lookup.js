var express = require('express');
var router = express.Router();
const { providers } = require("ethers");
const redis = require("../modules/redis");

const clientPromise = redis.init();

const MILLIS_PER_MINUTE = 60000;
const ETH_API_SERVER =
    `https://eth-mainnet.alchemyapi.io/v2/${process.env.ether_token}`;

/*
 * {
 *  [key: string]: {
 *    phone: string,
 *    address: string,
 *    goodTill: number
 *  }
 * }
 */
const memoryCache = {};

class NotFoundError extends Error {
  constructor(message, name, address) {
    super(message);

    this.name = name;
    this.code = 404;
    this.address = address;
  }

  toInformativeObject() {
    return {name: this.name, address: this.address, message: this.message};
  }
}

async function doLookup(name) {
  const provider = new providers.JsonRpcProvider(ETH_API_SERVER);
  const resolver = await provider.getResolver(name);
  if (!resolver) {
    throw new NotFoundError("ENS name was not found", "ENSNotFound", null);
  }

  const [address, phone] = await Promise.all([resolver.getAddress(), resolver.getText("phone")]);

  if (!phone) {
    throw new NotFoundError("ENS name did not have a phone number", "PhoneNotFound", address);
  }

  return {name, phone, address};
}

async function saveNameUrl(lookupObject) {
  const minutes = 5;
  const secondsPerMinute = 60;

  const client = await clientPromise;
  await client.set(lookupObject.name, JSON.stringify({
    phone: lookupObject.phone,
    address: lookupObject.address
  }));
  await client.expire(lookupObject.name, minutes * secondsPerMinute);
}

async function getUrl(name) {
  const client = await clientPromise;
  const memoryItem = await client.get(name);
  if (memoryItem) {
    return JSON.parse(memoryItem);
  }

  const lookupObject = await doLookup(name);
  if (lookupObject) 
    await saveNameUrl(lookupObject);

  return lookupObject;
}

router.get("/", async (request, response) => {
  try {
    const name = request.query.name;

    if (name && name != '') {
        const lookupObject = await getUrl(name);
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Cache-Control", "No-Store");
        return response.status(200).send(lookupObject);
    }

    return response.status(400).send({message: "Name was not provided. Name is a required query param.", name: "BadRequest"});
  } catch(e) {
    if (e instanceof NotFoundError) {
      return response.status(e.code).send(e.toInformativeObject());
    }
  }

  return response.status(500).send({message: "Unexpected error occurred", name: "UnexpectedError"});
});

module.exports = router;