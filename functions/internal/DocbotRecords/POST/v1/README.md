# DocbotRecords POST V1

Private API for Docbot.

In order to avoid re-running models on the same documents, we store previous runs in the Phoenix DB.
Adds a new record for a specific case and model version.

*Example input:*

```json
{
    "case_id": CASE_ID_AS_INTEGER,
    "document_id": DOCUMENT_ID_AS_INTEGER,
    "docbot_version": DOCBOT_VERSION_AS_STRING,
    "text_version": TEXT_VERSION_AS_STRING,
    "char_start": CHAR_START_AS_INTEGER (optional),
    "char_end": CHAR_END_AS_INTEGER (optional),
    "ml_score": ML_SCORE_AS_INTEGER (optional)
}
```

A 201 status code will be returned upon success