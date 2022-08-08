import LookupObject from '../models/lookup-object.js';
import redis from './redis.js';
abstract class LookupBase {
  abstract doLookup(name: string): Promise<LookupObject>;

  async saveNameUrl(lookupObject: LookupObject, minutes = 5) {
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

  async getUrl(name: string) {
    const client = await redis.init(process.env.REDIS_URL);
    const memoryItem = await client.get(name);
    await client.quit();

    if (memoryItem) {
      return {
        name,
        ...JSON.parse(memoryItem),
      };
    }

    const lookupObject = await this.doLookup(name);
    if (lookupObject) {
      let minutes: string | number | undefined =
        process.env.REDIS_EXPIRATION_MINUTES;

      if (typeof minutes === 'string') minutes = parseInt(minutes);

      await this.saveNameUrl(lookupObject, minutes);
    }

    return lookupObject;
  }
}

export default LookupBase;
