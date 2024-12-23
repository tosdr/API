A package to hold our public and internal APIs, built on self-hosted [Appwrite functions](https://appwrite.io/products/functions)

## Dev guide

### Add a new function with the UI
- Disable both suggested permissions -- we manage permissions with API keys
- For deployment choose "connect later"
- In Settings, for Node.js functions make the entrypoint `build/index.js` and build settings `npm install && npm run build`
- Add any ENV variables in Settings, e.g. DB creds

### Deploy
There are a few ways to deploy: the CLI, uploading a zip, or CI through gitlab.

For manual deployment, [install the CLI](https://appwrite.io/docs/tooling/command-line/installation) and make sure you're logged in and have the project set up:
- `appwrite login`
- `appwrite client --project-id api-staging --endpoint https://console.tosdr.org/v1`
    - or for production, `--project-id api-production`

To get CI deployments working, add a `.gitlab-ci.yml` to the function dir and add it to the root level `.gitlab-ci.yml`.

### Test
Depending on permissions there is a way to directly hit the URL it's deployed to, but you can always test with any of the [client SDKs](https://appwrite.io/docs/sdks).

For example, here's some python to run a function (replace the API keys)

```python
def test_appwrite(is_prod: bool, function_id: str, path='/', method='GET', body: str=None):
    from appwrite.client import Client
    from appwrite.services.functions import Functions
    client = Client()
    project = 'api-production' if is_prod else 'api-staging'
    api_key = "API key from project Overview -> integration" if is_prod else "API key for staging"
    client.set_endpoint('https://console.tosdr.org/v1').set_project(project).set_key(api_key)
    kwargs = dict(function_id=function_id, path=path, method=method)
    if body is not None:
        kwargs['body'] = body
    return Functions(client).create_execution(**kwargs)

# Test GET Case
test_appwrite(False, '6759c3a20007b0c52461', '/?id=121')
```
