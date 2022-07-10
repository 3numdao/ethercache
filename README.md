# ethercache

This project is a work-in-progress to provide more responsive times when clients
are trying to resolve Web3 names.

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
