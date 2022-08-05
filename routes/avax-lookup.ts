import AVVY from '@avvy/client';
import { providers } from 'ethers';

import LookupObject from '../models/lookup-object.js';
import NotFoundError from '../models/not-found-error.js';
import LookupBase from '../modules/lookup-base.js';

// router.get("/", async (request: Request, response: Response) => {
//   const name = request.query.name;
//   const PROVIDER_URL = 'https://api.avax.network/ext/bc/C/rpc';
//   const provider = new providers.JsonRpcProvider(PROVIDER_URL);
//   const avvy = new AVVY(provider);
//   const address = await avvy.name(name).resolve(AVVY.RECORDS.EVM);
//   console.log(address);
// });

class AvaxLookup extends LookupBase {
  async doLookup(name: string): Promise<LookupObject> {
    const PROVIDER_URL = 'https://api.avax.network/ext/bc/C/rpc';
    const provider = new providers.JsonRpcProvider(PROVIDER_URL);
    const avvy = new AVVY(provider);
    const resp = await avvy.name(name);
    if (!resp) {
      throw new NotFoundError('Avvy name was not found', 'AvvyNotFound', null);
    }

    let address = await resp.resolve(AVVY.RECORDS.EVM);
    address ||= await resp.resolve(AVVY.RECORDS.P_CHAIN);
    address ||= await resp.resolve(AVVY.RECORDS.X_CHAIN);

    const phone = await resp.resolve(AVVY.RECORDS.PHONE);
    if (!phone) {
      throw new NotFoundError(
        'Avvy name did not have a phone number',
        'PhoneNotFound',
        address
      );
    }

    return { name, phone, address };
  }
}

export default AvaxLookup;
