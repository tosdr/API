# Cases V1

Retrieves a list of all Cases or specific cases by supplying the "case" parameter.

*Example input:*

This function expects the following JSON Input:

```json
{"case": CASE_ID_AS_INTEGER}
```

Providing no case ID will list all cases in a pagination style, supported parameters for the pagination are:

```json
{"page": PAGE_NUMBER_AS_INTEGER}
```

*Example output:*

```json
{
    "id": 157,
    "weight": 30,
    "title": "Your use is throttled",
    "description": "The service may impose limits or restrictions to the use of the service, thus negatively impacting users experience. They may do so without reason or prior notice.",
    "updated_at": {
        "timezone": "Europe/Berlin",
        "pgsql": "2021-05-06T08:15:47.671Z",
        "unix": 1620288947
    },
    "created_at": {
        "timezone": "Europe/Berlin",
        "pgsql": "2018-01-16T15:26:09.092Z",
        "unix": 1516116369
    },
    "topic": 32,
    "classification": {
        "hex": "bad",
        "human": "bad"
    },
    "links": {
        "phoenix": {
            "case": "https://edit.tosdr.org/case/157",
            "new_comment": "https://edit.tosdr.org/case/157/case_comments/new",
            "edit": "https://edit.tosdr.org/case/157/edit"
        },
        "crisp": {
            "api": "https://api.tosdr.org/case/v1/?case=157"
        }
    }
}
```
