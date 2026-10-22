# Prompts

`judges.json` contains two editable draft examples: a career-agent judge covering answers and tool use, and an answer-only career-advice judge. The browser also offers a blank starting point. These examples are proposed teaching materials, not an agreed rubric or answer key.

Each criterion has a stable ID, a name, rubric, target, and passing threshold. The response contract is generated from the active judge and applicable trace targets, rather than fixed to these example criterion names. Participants can add/remove criteria in the builder.

The staging helper copies these assets into the advanced app's `advanced/prompts/` directory. The original starter keeps its existing prompt editor and three fixed criteria. Preserve draft labels until organisers confirm the teaching content.
