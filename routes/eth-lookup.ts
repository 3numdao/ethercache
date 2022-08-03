import { providers } from 'ethers';
import redis from '../modules/redis';
import LookupObject from '../models/lookup-object';
import NotFoundError from '../models/not-found-error';
import LookupBase from '../modules/lookup-base';

const ETH_API_SERVER = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ether_token}`;

class EthLookup extends LookupBase {
  async doLookup(name: string): Promise<LookupObject> {
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
}

export default EthLookup;
