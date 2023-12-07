# Point GET V1

Can retrieve a single Point by `id`, or a list of all Points for a given `case_id`

To retrieve a single Point:

*Example input:*

```json
{"id": POINT_ID_AS_INTEGER}
```

*Example output:*
```json
{"response":{"error":256,"message":"OK","parameters":{"id":17769,"title":"The court of law governing the terms is in location X","source":"https://www.1800mattress.com/terms-of-use.html","status":"approved","analysis":"Generated through the annotate view","case":{"id":163,"weight":0,"title":"The court of law governing the terms is in location X","description":"The Terms are governed by the applicable laws of a jurisdiction (specified in the title of each point by replacing the \"X\").","updated_at":"2021-02-25T09:38:43.370Z","created_at":"2018-01-16T12:26:09.179Z","topic_id":44,"classification":"neutral"},"document_id":1310,"updated_at":"2023-07-03T09:23:27.263Z","created_at":"2021-03-26T16:56:18.992Z"}},"stdout":"","stderr":""}
```

To retrieve all points for a particular case:

*Example input:*

```json
{"case_id": CASE_ID_AS_INTEGER}
```

*Example output:*
```json
{"response":{"error":256,"message":"Case points below","parameters":{"_page":{"total":26864,"current":1,"start":1,"end":269},"points":[{"id":5297,"title":"sign away moral rights","source":"https://www.nexon.com/main/en/legal/tou","status":"declined","analysis":"Generated through the annotate view","case":{"id":118,"weight":50,"title":"You waive your moral rights","description":"Moral rights are rights to creators of literary, dramatic, musical and artistic works, as well as directors of films.\r\n\r\n\"The moral rights include the right of attribution, the right to have a work published anonymously or pseudonymously, and the right to the integrity of the work. The preserving of the integrity of the work allows the author to object to alteration, distortion, or mutilation of the work that is \"prejudicial to the author's honor or reputation\". Anything else that may detract from the artist's relationship with the work even after it leaves the artist's possession or ownership may bring these moral rights into play. Moral rights are distinct from any economic rights tied to copyrights. Even if an artist has assigned his or her copyright rights to a work to a third party, he or she still maintains the moral rights to the work.\" -Wikipedia\r\n\r\nIn general, any terms that use the exact words \"moral rights\" as rights that are waived will fall under this Case.","updated_at":"2021-05-24T05:17:03.838Z","created_at":"2018-01-16T12:26:08.131Z","topic_id":27,"classification":"blocker"},"document_id":869,"updated_at":"2021-02-06T01:16:11.053Z","created_at":"2019-01-01T22:42:32.332Z"},...]}}
```
