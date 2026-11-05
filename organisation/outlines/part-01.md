# Part 1 outline (WIP)

**Part:** AI Agents and Evaluation Challenges  
**Deck (WIP):** [`../../presentations/presentation/01-agents-and-eval-challenges/index.qmd`](../../presentations/presentation/01-agents-and-eval-challenges/index.qmd)  
**Status:** Detailed outline WIP — deck placeholders follow this outline; not final slide content.

## Deck order (4 Nov 2026, Terrence’s structure; section 1 updated 5 Nov 2026)

The deck now follows this order. The detailed outline below is the earlier plan and is kept for its content.

0. **Opening (5 Nov 2026).** Two slides before section 1:
    1. “Would you use an AI agent to…”: a hands-up vote on four job-search questions, one at a time, then two surveys with their own wording and population: Indeed with YouGov (Australians, via HRD Australia) and Greenhouse (US job seekers). None asks Terrence’s questions. The Harris Poll / Ruth AI panel was removed at Terrence’s request (5 Nov 2026); its bibliography record stays.
    2. “About me, and SEEK”: Terrence’s path, academic first, then SEEK from its About page (Melbourne, 1997, eight markets, its map, more than 60 million candidate profiles and more than 360,000 hirer relationships) and Terrence’s numbers (250+ in AI and Analytics, 17 in his team, at least four major languages).
1. **Why AI agents, and why evaluate them.** Terrence’s seven-slide order (5 Nov 2026). The deck now opens on this section: the title slide, the work-in-progress notice, the agenda and the section 1 header sit in the separate Part 1.G: Graveyard deck (`presentations/presentation/01g-graveyard/`), which also holds every other cut slide. Part 1 ends on the hand-off to Part 2.
    1. “2026 is the year of the AI Agent”: the Google Trends chart for now. Terrence may replace it.
    2. “Agents can create value, but introduce risk”: efficiency and growth beside a short version of the six risks (financial, reputational, regulatory, cybersecurity, operational, competitive; Terrence named the last two on 5 Nov 2026). The fuller wording is in the slide notes and on the full risk slide in Part 1.G.
    3. The headline collage, one headline per incident.
    4. “Building well-governed agents”: Google Cloud’s Gemini Enterprise Agent Platform view of agent architecture (identity, runtime, registry, gateway, policies and AI protection, observability), with one point defining LLM-as-a-judge. This is where the term is first introduced.
    5. The SEEK job-ad mock-up.
    6. The SEEK multi-turn attack mock-up.
    7. “Notes to follow up”, which keeps the section 1 material that would otherwise have been deleted.

    Kept in Part 1.G, after the news-story cases: why organisations adopt AI agents, the public’s view of AI, “Using AI to evaluate AI”, the full six-risk slide, and the layers-of-control slide. The single-case slides (Air Canada, DPD, MyCity, Bunnings, EchoLeak, the Lego order, the gym booking agent, Woolworths’ Olive) are the first group in Part 1.G.
2. **Technical foundations.** What an LLM is, generative AI, AI agents; the building-block terminology.
3. **Why agents need LLM judges.** Why other methods fall short, building on step 2.
4. **Hand-off to Part 2** (LLM-as-a-judge methods in depth).

Open questions for Terrence:

- [ ] The program lists the industry evaluation lifecycle (prompts, test cases, datasets, rubrics, code; versioning; offline vs production monitoring) under Part 1. The new order has no place for it, so those stubs sit on the section 3 follow-up slide. Keep it in Part 1, move it to another part, or ask to change the program text?
- [ ] Step 3 (why other methods fall short) overlaps Part 2’s program topics: deterministic vs non-deterministic evaluation, and when teams choose rules vs judges vs humans. Where is the line between Part 1 and Part 2?
- [ ] Section 1 now covers why organisations adopt agents in half a slide (efficiency and growth, beside the risks), with a light note for students and researchers. Is that enough, or does it need examples, and which ones speak to students and researchers as well as businesses?
- [ ] Regulatory has two candidate cases: NYC’s MyCity chatbot (wrong legal answers) and the Bunnings AI Assistant (Queensland electrical advice, Inside Retail, 8 December 2025). Keep one or both?
- [ ] Cybersecurity has three candidate cases: EchoLeak (Microsoft 365 Copilot), Musk’s Lego order (Lego’s Sophia support assistant, October 2026) and the gym booking agent (ABC News, 10 August 2026). The Lego order changes are claims from screenshots on X; WIRED and Tech Times report that Lego did not confirm them. The gym case also raises the regulatory question of who is liable when an agent acts on its own; no law or charge is reported. Keep which?
- [ ] Woolworths’ Olive (Sydney Morning Herald, 26 February 2026) is placed as competitive risk first, reputational second. Terrence read the mother stories as hallucination; Woolworths says they came from a persona prompt written years ago. How should the slide describe them?
- [ ] The headline collage after the value-and-risk slide makes the point that the risks are real in one to two minutes. The individual case slides are now in Part 1.G while Terrence tests the flow without them. Do any come back into the talk, do they stay as backup, or are they cut to one or two kept examples? None has been deleted.
- [ ] The opening vote’s surveys come from press coverage. Should we get the full Indeed report (Australian, March 2026) for its exact questions, or an Australian poll on letting an agent apply for you?
- [ ] “About me, and SEEK” now shows official icons for Michigan, UCD and ANZ beside their names (Terrence’s request, 5 Nov 2026). Their brand guidelines restrict outside use; ask for permission before the deck is published?
- [ ] The headline collage stays in the main flow (coordinator decision). Terrence can move it to Part 1.G too.
- [ ] Part 1.G is a working deck for organisers (5 Nov 2026). Delete it, or move anything worth keeping back into Part 1, before the tutorial on 30 November 2026.
- [ ] The collage now shows one headline per incident. The two Woolworths’ Olive social-media screenshots it dropped are kept on the section 1 “Notes to follow up” slide; DPD’s haiku, Lego’s Sophia reply and the gym agent’s apology are on their case slides. Bring any back?
- [ ] “Building well-governed agents” is Google’s view, with Google’s component names, until Terrence reworks it into a SEEK view. Which components should a SEEK view keep? The older layers-of-control slide (identity and registry, runtime, gateway, access control, observability, and evals, guardrails and judges) is in Part 1.G.
- [ ] “Using AI to evaluate AI” (Terrence’s opening line) is now in Part 1.G, and LLM-as-a-judge is first defined on “Building well-governed agents”. Does the opening line come back, on that slide or only in the talk?
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
