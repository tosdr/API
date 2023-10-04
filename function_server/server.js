const path = require("path");
const micro = require("micro");
const { json, send } = require("micro");

const USER_CODE_PATH = process.env.GITPOD_REPO_ROOT ??= '..';

const server = micro(async (req, res) => {
    const body = await json(req);

    const request = {
        variables: body.variables ?? {},
        headers: body.headers ?? {},
        payload: body.payload ?? '',
    };

    logs = [];
    errors = [];
    const response = {
        send: (text, status = 200) => send(res, status, {response: text, stdout: logs.join('\n'), stderr: errors.join('\n')}),
        json: (json, status = 200) => send(res, status, {response: json, stdout: logs.join('\n'), stderr: errors.join('\n')}),
    };
    try {
        let userFunctionName;
        if (process.env.API_SCRIPT) {
            userFunctionName = process.env.API_SCRIPT;
        } else if (req.url !== "/" && req.url.startsWith("/")) {
            // Allows testing with a path, for example:
            // curl -d '{"payload": {"id": 120}}' localhost:3000/Case/GET/v2
            userFunctionName = req.url.slice(1);
        } else {
            throw new Error("Function not specified. Either set API_SCRIPT env variable, or use a path")
        }

        let userFunction = require(USER_CODE_PATH + '/functions/' + userFunctionName);

        if (!(userFunction || userFunction.constructor || userFunction.call || userFunction.apply)) {
            throw new Error("User function is not valid.")
        }

        if(userFunction.default) {
            if (!(userFunction.default.constructor || userFunction.default.call || userFunction.default.apply)) {
                throw new Error("User function is not valid.")
            }

            await userFunction.default(request, response);
        } else {
            await userFunction(request, response);
        }
    } catch (e) {
        console.error(logs.join('\n'));
        console.error(errors.join('\n') + "\n" + e.code === 'MODULE_NOT_FOUND' ? "Code file not found." : e.stack || e)
        send(res, 500);
    }
    logs = [];
    errors = [];
});

server.listen(3000);