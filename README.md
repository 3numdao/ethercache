# ethercache

This project is a work-in-progress to provide more responsive times when clients
are trying to resolve Web3 names.

This is achieved by providing a short lived Redis cache.

## Development Setup

This project is set up to work with VScode "devcontainers".

1. Create your own private environment variables:
   ```shell
   $ cp .devcontainer/private-sample.env .devcontainer/private.env
   ```
2. Modify the contents with appropriate values.
3. Open the project with VScode's "Remote-Containers" function.
4. Open a terminal in the container.
   1. Install dependencies:
      ```shell
      $ yarn
      ```
   2. Start service in "watch" mode to restart on code changes:
      ```shell
      $ yarn watch
      ```

## Obtaining Ethers Token
Placeholder: Needs link to Ethers.

## Private.env
The current supported env vars that change the application in some way are described below:
<ul>
   <li>`ether_token`: # (Required) This value is used to identify the client as per their requirements.</li>
   <li>`REDIS_EXPIRATION_MINUTES`: # (Optional) Allows configuration on the amount of time (in minutes) Redis will store the value. This value defaults to 5 in the code.</li>
   <li>`REDIS_URL`: # (Optional -- locally) Configures the url for the Redis cache. When running locally with VSCode "devcontainers" this value is optional.</li>
   <li>`PORT`: # (Optional) Configures the port the local Express server runs on, defaults to 3000.</li>
<ul>

## Redis
As noted above this application uses Redis to stores the phone and address from Web3 responses received from both ethers and @avvy/client. By default the data is stored for 5 minutes but this can be configured using the REDIS_EXPIRATION_MINUTES value in one's `private.env`. Under the hood the key for this value is the name given in the request. That way if the name is searched again we can simply just check for that name.

## First Request
After starting the server using steps in the `Development Setup` step sending a get request to `http://localhost:3000/lookup/<name-to-lookup>`. The first request will take a little while to complete but the next one will complete much faster.