# ToS;DR APIs

## Testing locally
In production our APIs run via [open-runtimes](https://github.com/open-runtimes/open-runtimes) on self-hosted AppWrite functions.

Locally, you can test by running `server.js`

First, build whatever API Functions you wish to test. `cd` into the function's directory within `functions` containing 
`package.json`, and run `npm install && npm run build`.

Then to start the server:
- `cd function_server && npm install`
- Set the following environment variables
  - **PGUSER** - Postgres User of the Phoenix DB
  - **PGHOST** - Hostname of the Phoenix DB
  - **PGPASSWORD** - Password of the Phoenix DB
  - **PGDATABASE** - Database Name
  - **PGPORT** - Port of the Phoenix DB
- `npm run start`

The server will listen on localhost port 3000. Test an API by adding its path within `functions` to the end of the URL. 
For example, the following tests Case GET:

`curl -d '{"payload": {"id": 120}}' localhost:3000/Case/GET/v2`

Or to get all cases:
`curl -d '{}' localhost:3000/Case/GET/v2`

## Model changes

Some REST objects are defined in `models`, which needs to be built and deployed separately [here](https://www.npmjs.com/package/api-microservices).

## Deploying

(Copied from the AppWrite documentation)

There are two ways of deploying the Appwrite function, both having the same results, but each using a different process. We highly recommend using CLI deployment to achieve the best experience.

### Using CLI

Make sure you have [Appwrite CLI](https://appwrite.io/docs/command-line#installation) installed, and you have successfully logged into your Appwrite server. To make sure Appwrite CLI is ready, you can use the command `appwrite client --debug` and it should respond with green text `✓ Success`.

Make sure you are in the same folder as your `appwrite.json` file and run `appwrite deploy function` to deploy your function. You will be prompted to select which functions you want to deploy.

### Manual using tar.gz

Manual deployment has no requirements and uses Appwrite Console to deploy the tag. First, enter the folder of your function. Then, create a tarball of the whole folder and gzip it. After creating `.tar.gz` file, visit Appwrite Console, click on the `Deploy Tag` button and switch to the `Manual` tab. There, set the `entrypoint` to `src/index.js`, and upload the file we just generated.
