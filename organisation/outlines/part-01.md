# Part 1 outline (WIP)

**Part:** AI Agents and Evaluation Challenges  
**Deck (WIP):** [`../../presentations/presentation/01-agents-and-eval-challenges/index.qmd`](../../presentations/presentation/01-agents-and-eval-challenges/index.qmd)  
**Status:** Detailed outline WIP — deck placeholders follow this outline; not final slide content.

## Deck order (4 Nov 2026, Terrence’s structure)

The deck now follows this order. The detailed outline below is the earlier plan and is kept for its content.

1. **Why AI agents, and why evaluate them.** Motivation for the whole tutorial, mostly non-technical. LLM-as-a-judge introduced early, in plain terms. Terrence’s narrative, in three beats:
    1. Organisations are racing to adopt AI agents for their potential and promise, even while the public grows more wary of AI (trends, efficiency and growth, public perception).
    2. Major risks anyone working with agents needs to know: the six-risk slide, a headline collage of all the real cases (one to two minutes), then the cases in risk order (Air Canada; DPD; MyCity, Bunnings and the job-ad mock-up; EchoLeak, the Lego order, the gym booking agent and the multi-turn mock-up; Woolworths’ Olive).
    3. So organisations put layers of control around agents (identities, runtimes, gateways, RBAC, observability); evals, guardrails and judges are one layer, and the one this tutorial covers.

    The beats are internal and informal. The deck refers to them only in notes, so they can be dropped without changing the slides.
2. **Technical foundations.** What an LLM is, generative AI, AI agents; the building-block terminology.
3. **Why agents need LLM judges.** Why other methods fall short, building on step 2.
4. **Hand-off to Part 2** (LLM-as-a-judge methods in depth).

Open questions for Terrence:

- [ ] The program lists the industry evaluation lifecycle (prompts, test cases, datasets, rubrics, code; versioning; offline vs production monitoring) under Part 1. The new order has no place for it, so those stubs sit on the section 3 follow-up slide. Keep it in Part 1, move it to another part, or ask to change the program text?
- [ ] Step 3 (why other methods fall short) overlaps Part 2’s program topics: deterministic vs non-deterministic evaluation, and when teams choose rules vs judges vs humans. Where is the line between Part 1 and Part 2?
- [ ] Section 1 now has one slide on why organisations adopt agents (Terrence’s efficiency and growth framing), with a light note for students and researchers. Is that enough, or does it need examples, and which ones speak to students and researchers as well as businesses?
- [ ] Risk slide labels. The slide lists six risks: financial, reputational, regulatory, cybersecurity, then “Running cost” and “Quality risk”. The last two were added later and their labels are tentative. Keep, rename, or merge?
- [ ] Regulatory has two candidate cases: NYC’s MyCity chatbot (wrong legal answers) and the Bunnings AI Assistant (Queensland electrical advice, Inside Retail, 8 December 2025). Keep one or both?
- [ ] Cybersecurity has three candidate cases: EchoLeak (Microsoft 365 Copilot), Musk’s Lego order (Lego’s Sophia support assistant, October 2026) and the gym booking agent (ABC News, 10 August 2026). The Lego order changes are claims from screenshots on X; WIRED and Tech Times report that Lego did not confirm them. The gym case also raises the regulatory question of who is liable when an agent acts on its own; no law or charge is reported. Keep which?
- [ ] Woolworths’ Olive (Sydney Morning Herald, 26 February 2026) is placed as quality risk first, reputational second. Terrence read the mother stories as hallucination; Woolworths says they came from a persona prompt written years ago. How should the slide describe them?
- [ ] The headline collage after the risk slide makes the point that the risks are real in one to two minutes. Do the individual case slides stay as they are, move after the collage as backup or detail, or get cut to one or two kept examples? None has been deleted yet.
- [ ] The layers-of-control slide at the end of section 1 lists identity and registry, runtime, gateway, access control (RBAC), observability, and evals, guardrails and judges. Confirm the layers, names and order.
- [ ] “Using AI to evaluate AI” (Terrence’s opening line) still sits between the first beat and the risk slide, because the risk slide and mock-ups use the term “LLM judge”. Keep it there, or move it after the layers-of-control slide?
- [ ] Most real cases (Air Canada, DPD, NYC MyCity, Bunnings, Woolworths) are AI chatbot or assistant failures. EchoLeak is described by its finders as an attack on an AI agent, and the gym case is an agent taking actions for its user. Is that balance close enough?

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
