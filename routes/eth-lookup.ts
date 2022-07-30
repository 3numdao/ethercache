import express from 'express';
import { providers } from 'ethers';
import redis from '../modules/redis';
const router = express.Router();

const ETH_API_SERVER = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ether_token}`;

interface LookupObject {
  name: string;
  phone: string;
  address: string;
}

interface NotFoundError {
  name: string;
  code: number;
  address: string | null;
}

class NotFoundError extends Error {
  constructor(message: string, name: string, address: string | null) {
    super(message);

    this.name = name;
    this.code = 404;
    this.address = address;
  }

  toInformativeObject() {
    return { name: this.name, address: this.address, message: this.message };
  }
}

async function doLookup(name: string) {
  const provider = new providers.JsonRpcProvider(ETH_API_SERVER);
  const resolver = await provider.getResolver(name);
  if (!resolver) {
    throw new NotFoundError('ENS name was not found', 'ENSNotFound', null);
  }

  const [address, phone] = await Promise.all([
    resolver.getAddress(),
    resolver.getText('phone'),
  ]);

  if (!phone) {
    throw new NotFoundError(
      'ENS name did not have a phone number',
      'PhoneNotFound',
      address
    );
  }

  return { name, phone, address };
}

async function saveNameUrl(lookupObject: LookupObject, minutes = 5) {
  const secondsPerMinute = 60;

  const client = await redis.init(process.env.REDIS_URL);
  await client.set(
    lookupObject.name,
    JSON.stringify({
      phone: lookupObject.phone,
      address: lookupObject.address,
    })
  );
  await client.expire(lookupObject.name, minutes * secondsPerMinute);
  await client.quit();
}

async function getUrl(name: string) {
  const client = await redis.init(process.env.REDIS_URL);
  const memoryItem = await client.get(name);
  await client.quit();

  if (memoryItem) {
    return {
      name,
      ...JSON.parse(memoryItem),
    };
  }

  const lookupObject = await doLookup(name);
  if (lookupObject) {
    let minutes: string | number | undefined =
      process.env.REDIS_EXPIRATION_MINUTES;

    if (typeof minutes === 'string') minutes = parseInt(minutes);

    await saveNameUrl(lookupObject, minutes);
  }

  return lookupObject;
}

router.get('/', async (request, response) => {
  try {
    const name: string = request.query.name as string;

    if (name && name !== '') {
      const lookupObject = await getUrl(name);
      response.setHeader('Content-Type', 'application/json');
      return response.status(200).send(lookupObject);
    }

    return response.status(400).send({
      message: 'Name was not provided. Name is a required query param.',
      name: 'BadRequest',
    });
  } catch (e) {
    if (e instanceof NotFoundError) {
      return response.status(e.code).send(e.toInformativeObject());
    }

    console.error('Unexpected error:', e);
  }

  return response
    .status(500)
    .send({ message: 'Unexpected error occurred', name: 'UnexpectedError' });
});

export default router;
