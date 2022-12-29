const path = require("path");
const micro = require("micro");
const { json, send } = require("micro");

const USER_CODE_PATH = process.env.GITPOD_REPO_ROOT;

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
        let userFunction = require(USER_CODE_PATH + '/functions/' + process.env.API_SCRIPT);

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
        send(res, 500, {stdout: logs.join('\n'), stderr: errors.join('\n') + "\n" + e.code === 'MODULE_NOT_FOUND' ? "Code file not found." : e.stack || e});
    }
    logs = [];
    errors = [];
});

server.listen(3000);