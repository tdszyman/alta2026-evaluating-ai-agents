# Part 1 outline (WIP)

**Part:** AI Agents and Evaluation Challenges  
**Deck (WIP):** [`../../presentations/01-agents-and-eval-challenges/index.qmd`](../../presentations/01-agents-and-eval-challenges/index.qmd)  
**Status:** Detailed outline WIP — deck placeholders follow this outline; not final slide content.

## Detailed outline (WIP)

1. **Intro and background**
    1. **Context:** How did we get here? “The year of the agent”. Timeline.
    2. **Definitions: What is an Agent?** What is Agentic? Theory vs practice. Practical definition: LLM + Tools + ReAct loop.
    3. **How are enterprises using agents?** Products vs Productivity. General vs specialist productivity.
    4. **Examples from SEEK.** Products: Ask SEEK. SEEK Assist, AI Interview. Productivity: Cursor, Copilot, Claude Code. STELA, Glean, and low-code/no-code/pro-code agents.
2. **Agent evals: motivation and problems**
    1. **AI agent risks.** Security risks. Financial risks (spend). Reputation risks (bad advice). Legal risks (illegal advice). Examples of real agent failures that have made the news. Possible examples from SEEK.
    2. **AI Agents are Complex Systems**. Complex vs Complicated. System is more than the sum of its parts.
    3. **Evals vs training.** They are separate but not 100% disjoint. An agent can improve its evals scores without retraining. But also, LLMs are trained on things that look very similar to evals (RLHF, RLVR, RLAIF). We are ignoring training in this tutorial.
    4. **Examples from SEEK.** Prompt injection attempts. Illegal job description advice. Employment as a high-risk, regulated category.
3. **Agent evals: solutions and frameworks**
    1. **Offline evals.** Pre-production. Fixed datasets. Defined metrics.
    2. **Online evals.** In production. Live data. Same defined metrics.
    3. **Multi-tier evals.** System-level vs component-level. Complex systems = you still always must evaluate the system as a whole. Agent GPA. Tool evals. “Unit tests” vs “Integration tests”.
    4. **Data.** Gold data, simulated data, live production data. Edge cases. Red-teaming. The data “feedback cycle” from observed issue towards curated datasets.
    5. **Simulation.** Agents are not input-output. Personas and trajectories.
    6. **Metrics.** Deterministic vs non-deterministic (LLM as judge). Verifiable tasks vs. unverifiable tasks. Samples and significance.
    7. **Observability.** Knowing what your agent is doing in production. Monitoring and alerting. Reporting. Kill switches.
    8. **Agent registries and gateways.** Every version of an agent, subagent, tool, etc. should be versioned and linked to an eval result. Agent access to tools is restricted, versioned, governed, and observed.
    9. **Examples from SEEK.** Agent platform — runtime, gateway, observability, offline evals, online evals, experimentation.

## Related

- Presenter notes: [`../decisions.md`](../decisions.md)
- LLM-as-judge concepts (feeds Part 2): [`../notes/llm-as-judge.md`](../notes/llm-as-judge.md)
