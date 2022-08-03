// import * as AVVY from '@avvy/client';
import { providers } from 'ethers';
import LookupObject from '../models/lookup-object';
import LookupBase from '../modules/lookup-base';

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
    // const avvyHack = AVVY as any;
    // const PROVIDER_URL = 'https://api.avax.network/ext/bc/C/rpc';
    // const provider = new providers.JsonRpcProvider(PROVIDER_URL);
    // const avvy = new avvyHack(provider);
    // const address = await avvy.name(name).resolve(avvyHack.RECORDS.EVM);
    // console.log(JSON.stringify(address));

    return { name: 'asdf', phone: 'fdsa', address: 'zxcv' };
  }
}

export default AvaxLookup;
