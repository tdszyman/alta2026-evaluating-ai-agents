# LLM-as-a-judge — working notes

Scratch notes for Session 1 Part 2 and related discussion. Not final slide copy.

## Links

- https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge
- https://deepeval.com/blog/llm-as-a-judge
- https://arize.com/guides/llm-as-a-judge/

Related reading: [`../literature/primary-references.md`](../literature/primary-references.md), platforms: [`../literature/platforms.md`](../literature/platforms.md).

## Concepts

- Simulation
- Conversation
- Persona
- Trajectory
- LLM-as-judge
- Judge calibration

## Principles

- LLM judges tend to favour their own output, or output from “related” models vs unrelated models. Claude as a judge prefers Claude-generated output, etc.
- Typically you want to use the strongest LLM you can afford as your judge. The judge should be stronger than the LLM used to generate the output.
- Even when using a rubric, different LLMs can be “uncalibrated”. Using the same judge prompt on another model even in the same family (e.g. Sonnet 3.5 vs Sonnet 4.5) can lead to very different judge output scores.
