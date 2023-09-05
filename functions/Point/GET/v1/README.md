# Point V1

Welcome to the documentation of this function 👋 We strongly recommend keeping this file in sync with your function's logic to make sure anyone can easily understand your function in the future. If you don't need documentation, you can remove this file.

## 🤖 Documentation (TBD)

Retrieves a list of all points that belong to a specific case, or all points if no parameters are given.

<!-- If input is expected, add example -->

To retrieve points belonging to specific case:

<!-- Update with your description, for example 'Create Stripe payment and return payment URL' -->

*Example input:*

This function expects the following JSON Input:

```json
{"id": CASE_ID_AS_INTEGER}
```

Providing no id parameter will list all points

<!-- If input is expected, add example

*Example output:*

<!-- Update with your expected output -->

## 📝 Environment Variables

List of environment variables used by this cloud function:

- **PGUSER** - Postgres User of the Phoenix Database
- **PGHOST** - Hostname of the Phoenix Database
- **PGPASSWORD** - Password of the Phoenix Database
- **PGDATABASE** - Database Name of Phoenix
- **PGPORT** - Port of the Phoenix Database
- **FLAGSMITH_KEY** - Environment Key of your Flagsmith Installation
- **FLAGMSMITH_HOSTNAME** - Hostname of your Flagsmith Installation

<!-- Add your custom environment variables -->

## 🚀 Deployment

There are two ways of deploying the Appwrite function, both having the same results, but each using a different process. We highly recommend using CLI deployment to achieve the best experience.

### Using CLI

Make sure you have [Appwrite CLI](https://appwrite.io/docs/command-line#installation) installed, and you have successfully logged into your Appwrite server. To make sure Appwrite CLI is ready, you can use the command `appwrite client --debug` and it should respond with green text `✓ Success`.

Make sure you are in the same folder as your `appwrite.json` file and run `appwrite deploy function` to deploy your function. You will be prompted to select which functions you want to deploy.

### Manual using tar.gz

Manual deployment has no requirements and uses Appwrite Console to deploy the tag. First, enter the folder of your function. Then, create a tarball of the whole folder and gzip it. After creating `.tar.gz` file, visit Appwrite Console, click on the `Deploy Tag` button and switch to the `Manual` tab. There, set the `entrypoint` to `src/index.js`, and upload the file we just generated.
