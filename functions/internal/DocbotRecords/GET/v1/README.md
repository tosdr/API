# DocbotRecords GET V1

Private API for Docbot.

In order to avoid re-running models on the same documents, we store previous runs in the Phoenix DB.
Retrieves a list of all (document ID, text version) pairs for a specific case and model version.

*Example input:*

```json
{
    "case_id": CASE_ID_AS_INTEGER,
    "docbot_version": DOCBOT_VERSION_AS_STRING
}
```

*Example output:*

```json
{
    "documents": [[100, "1"], [450, "1"], [2000, "3"]] 
}
```
