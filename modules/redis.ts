import { createClient } from 'redis';

async function init(url: string | undefined) {
  const client = createClient(url ? { url } : undefined);
  client.on('error', (error) => console.error(error));
  await client.connect();
  return client;
}

export default { init };
