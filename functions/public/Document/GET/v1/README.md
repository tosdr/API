# Document GET V1

Retrieves a list of all document IDs or specific documents by supplying the "document" parameter.

*Example input:*

To retrieve a single Document by ID:

```json
{"document": DOCUMENT_ID_AS_INTEGER}
```

*Example output:*

```json
{
  "id": 8000,
  "name": "Privacy Policy",
  "url": "some URL",
  "text": "<p>This is an example document</p>",
  "updated_at": "2021-07-06T10:33:37.127Z",
  "created_at": "2021-07-06T12:33:14.275Z",
  "text_version": "1"
}
```

Providing no document parameter will list all document IDs and their text versions

*Example output:*

```json
{
    documents: [[1, "1"], [2, "1"], [3, "2"]]
}
```
