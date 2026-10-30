# Workshop data

`scenarios.json` is the canonical set of ten draft synthetic career-assistant traces: four advice replies, three one-call job searches, and three two-call job/course searches. Tool definitions include argument schemas. Calls and results are paired by call ID; messages have stable IDs used by judge evidence references.

There are no preset scores or answer keys. Job/course IDs refer to fictional records. Scenario variants are neutral-labelled for participants. The staging helper copies these assets into the guided app's `advanced/data/` directory. All three rounds, including the four original advice cases, read this canonical fixture file.

Keep files small and anonymised. Link large datasets from [`../datasets.md`](../datasets.md).
