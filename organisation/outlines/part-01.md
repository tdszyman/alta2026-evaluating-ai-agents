# Part 1 outline (WIP)

**Part:** AI Agents and Evaluation Challenges  
**Deck (WIP):** [`../../presentations/presentation/01-agents-and-eval-challenges/index.qmd`](../../presentations/presentation/01-agents-and-eval-challenges/index.qmd)  
**Status:** Detailed outline WIP — deck placeholders follow this outline; not final slide content.

## Deck order (4 Nov 2026, Terrence’s structure; section 1 updated 5 Nov 2026)

The deck now follows this order. The detailed outline below is the earlier plan and is kept for its content.

0. **Opening (5 Nov 2026).** Two slides before section 1:
    1. “Would you use an AI agent to…”: a hands-up vote on four job-search questions, one at a time, then two surveys with their own wording and population: Indeed with YouGov (Australians, via HRD Australia) and Greenhouse (US job seekers). None asks Terrence’s questions. The Harris Poll / Ruth AI panel was removed at Terrence’s request (5 Nov 2026); its bibliography record stays.
    2. “About me, and SEEK”: Terrence’s path, academic first, then SEEK from its About page (Melbourne, 1997, eight markets, its map, more than 60 million candidate profiles and more than 360,000 hirer relationships) and Terrence’s numbers (250+ people in AI and Analytics, 17 in the Generative AI team, a secondary hub in Kuala Lumpur, four official languages). The ANZ and first SEEK roles name their teams: Institutional Banking and Candidate Quality (6 Nov 2026).
1. **Why AI agents, and why evaluate them.** Terrence’s seven-slide order (5 Nov 2026), plus the platforms overview he asked for on 6 Nov 2026. The deck opens on a full-colour Part 1 title slide (6 Nov 2026, Terrence’s request: part number, title and presenter, in the section-divider style), then this section. The old title slide, the work-in-progress notice, the agenda and the section 1 header sit in the separate Part 1.G: Graveyard deck (`presentations/presentation/01g-graveyard/`), which also holds every other cut slide. Part 1 ends on the hand-off to Part 2.
    1. “2026 is the year of the AI Agent”: hype and investment in 2026, as stats and quotes (9 Nov 2026, Terrence’s request: flashy, not deep). A hero stat (Deloitte: 69% of Australian organisations surveyed use agentic AI, alongside three-quarters of global respondents), then Australia and New Zealand, then the rest of the world under Gartner’s “Peak of Inflated Expectations” line. Since 10 Nov 2026 (Terrence’s request) every tile carries a Productivity or Products badge in that pillar’s colour from the next slide, so the presenter can point back to them: Productivity is Westpac, Atlassian and OpenAI (Sam Altman); Products is Genesys’s customer-service agents in Australia and New Zealand, Future Secure AI and Gartner’s 40% of enterprise apps. CBA, the NZ Herald’s 55% and Big Tech’s capex moved to the speaker notes. Sources come from the research report on AI agent hype, or were checked against the live page. The Google Trends chart that was here is kept at the end of Part 1.G.
    2. “Agents can create value, but introduce risk”: the two value pillars, Productivity (“Do the same work faster and cheaper”) and Products (“New and better things for customers”), renamed from Efficiency and Growth on 10 Nov 2026 at Terrence’s request, beside a short version of the six risks (financial, reputational, regulatory, cybersecurity, operational, competitive; Terrence named the last two on 5 Nov 2026), labelled “Illustrative, not definitive”. Value shows first; the Risk side comes on one click. The fuller wording is in the slide notes and on the full risk slide in Part 1.G.
    3. The headline collage, one headline per incident.
    4. “Agent platforms layer protections to mitigate these risks”: four example platforms with their logos (Amazon Bedrock AgentCore, Gemini Enterprise Agent Platform, Arize AX, LangSmith); then, revealed in two steps, the protections: complicated systems need deterministic checks, and complex systems need non-deterministic checks, the most common being LLM-as-a-judge, with its definition. This is where the term is first introduced.
    5. “Building well-governed agents”: Google Cloud’s Gemini Enterprise Agent Platform view of agent architecture (identity, runtime, registry, gateway, policies and AI protection, observability). Three clicks highlight where an LLM judge can work in it: input and output guardrails (Policies and AI protection), the two Agent Gateways, and observability metrics.
    6. The SEEK job-ad mock-up.
    7. The SEEK multi-turn attack mock-up.

    Kept in Part 1.G, after the news-story cases: why organisations adopt AI agents, the public’s view of AI, “Using AI to evaluate AI”, the full six-risk slide, and the layers-of-control slide. The single-case slides (Air Canada, DPD, MyCity, Bunnings, EchoLeak, the Lego order, the gym booking agent, Woolworths’ Olive) are the first group in Part 1.G.
2. **Technical foundations.** What an LLM is, generative AI, AI agents; the building-block terminology.
    1. “Terms this section defines” (6 Nov 2026, Terrence’s request): the first slide after the section 2 header. It now also carries the roadmap: four cards, one per idea (LLM text generation, conversations, agent traces, LLM-as-judge), each with the roadmap’s one-line description and the terms its slide defines, in order: input tokens, output tokens, LLM call; messages, system, user and assistant messages, chat template, turn, multi-turn; thought, action, observation, ReAct loop, step, multi-step, trace; LLM judge, input guardrail, call-level eval, output guardrail, multi-step eval, multi-turn eval, trace-level eval, meta-evaluation. No definitions on the slide; each heading links to its slide.

    “Four ideas, each built on the last” was merged into it, and “Definitions: What is an Agent?” was deleted (6 Nov 2026, Terrence’s request). Its material came back as its own slide, “What is an agent?” (6 Nov 2026, Terrence’s request), between “Conversations: messages and turns” and “Agent traces: think, act, observe”. It asks what “agent” and “agentic” mean, notes theory vs practice, and shows the working definition, LLM + tools + ReAct loop (Yao et al. 2023, `yao-2023-react`), as tiles. The terms slide lists “Agent” first on card 3, whose heading now links to this slide.
3. **Why agents need LLM judges.** Why other methods fall short, building on step 2. “Why AI agents need simulation” moved to the end of Part 1.G on 6 Nov 2026 (Terrence’s request), unchanged, so it can be restored; “Why generative AI needs LLM-as-a-judge” now leads straight into the complex-systems slides. Ends with three complex-systems slides (6 Nov 2026, Terrence’s request):
    1. “Complex system”: definition (feedback loops; same input, a distribution of outputs), the keywords unpredictable, self-organising and emergent, the weather as the lead example, as the jet engine is on the next slide, then the economy, ant colonies and human brains, a short history (Weaver 1948, “organized complexity”; Ladyman et al. 2013, no agreed definition) and the complex-system figure.
    2. “Complicated system”: definition (designed, traceable; same input, same output), the keywords predictable, controllable and designable, the jet engine example plus mechanical watches, traditional software, ETL pipelines and workflows, and the complicated-system figure.
    3. “AI Agents are complicated *and* complex systems”: both figures small; why agents are evaluated with a mix of deterministic checks and LLM-as-judge; test the components and the whole system, because the whole is more than the sum of its parts.

    The three slides they replaced (the two-figure slide, the complicated-vs-complex spectrum, and “The whole is more than the sum of its parts” with its parts-vs-whole figure) are kept unchanged at the end of Part 1.G.
4. **“Notes to follow up”** (10 Nov 2026, Terrence’s request): one organiser-only slide for all of Part 1, just before the hand-off, replacing the section 1 and section 3 follow-up slides. It has a subheading per section and keeps every box: section 1’s planned material and what the seven-slide section 1 cut; section 2’s “Evals vs training”, removed from the talk on 10 Nov 2026; and section 3’s planned material and evaluation-lifecycle stubs.
5. **Hand-off to Part 2** (LLM-as-a-judge methods in depth).

Open questions for Terrence:

- [ ] The program lists the industry evaluation lifecycle (prompts, test cases, datasets, rubrics, code; versioning; offline vs production monitoring) under Part 1. The new order has no place for it, so those stubs sit under section 3 on the “Notes to follow up” slide. Keep it in Part 1, move it to another part, or ask to change the program text?
- [ ] Step 3 (why other methods fall short) overlaps Part 2’s program topics: deterministic vs non-deterministic evaluation, and when teams choose rules vs judges vs humans. Where is the line between Part 1 and Part 2?
- [ ] Section 1 now covers why organisations adopt agents in half a slide (productivity and products, beside the risks), with a light note for students and researchers. Is that enough, or does it need examples, and which ones speak to students and researchers as well as businesses?
- [ ] Regulatory has two candidate cases: NYC’s MyCity chatbot (wrong legal answers) and the Bunnings AI Assistant (Queensland electrical advice, Inside Retail, 8 December 2025). Keep one or both?
- [ ] Cybersecurity has three candidate cases: EchoLeak (Microsoft 365 Copilot), Musk’s Lego order (Lego’s Sophia support assistant, October 2026) and the gym booking agent (ABC News, 10 August 2026). The Lego order changes are claims from screenshots on X; WIRED and Tech Times report that Lego did not confirm them. The gym case also raises the regulatory question of who is liable when an agent acts on its own; no law or charge is reported. Keep which?
- [ ] Woolworths’ Olive (Sydney Morning Herald, 26 February 2026) is placed as competitive risk first, reputational second. Terrence read the mother stories as hallucination; Woolworths says they came from a persona prompt written years ago. How should the slide describe them?
- [ ] The headline collage after the value-and-risk slide makes the point that the risks are real in one to two minutes. The individual case slides are now in Part 1.G while Terrence tests the flow without them. Do any come back into the talk, do they stay as backup, or are they cut to one or two kept examples? None has been deleted.
- [ ] The opening vote’s surveys come from press coverage. Should we get the full Indeed report (Australian, March 2026) for its exact questions, or an Australian poll on letting an agent apply for you?
- [ ] “About me, and SEEK” now shows official icons for Michigan, UCD and ANZ beside their names (Terrence’s request, 5 Nov 2026). Their brand guidelines restrict outside use; ask for permission before the deck is published?
- [ ] The headline collage stays in the main flow (coordinator decision). Terrence can move it to Part 1.G too.
- [ ] Part 1.G is a working deck for organisers (5 Nov 2026). Delete it, or move anything worth keeping back into Part 1, before the tutorial on 30 November 2026.
- [ ] The collage now shows one headline per incident. The two Woolworths’ Olive social-media screenshots it dropped are kept under section 1 on the “Notes to follow up” slide; DPD’s haiku, Lego’s Sophia reply and the gym agent’s apology are on their case slides. Bring any back?
- [ ] “Building well-governed agents” is Google’s view, with Google’s component names, until Terrence reworks it into a SEEK view. Which components should a SEEK view keep? The older layers-of-control slide (identity and registry, runtime, gateway, access control, observability, and evals, guardrails and judges) is in Part 1.G.
- [ ] “Agent platforms layer protections” lists four platforms (AWS, Google, Arize, LangChain), as Terrence named them. Add others, such as Microsoft’s, or keep it to four?
- [ ] Check permission to use the AWS, Google Cloud, Arize and LangChain logos on that slide. Sources are in its speaker notes.
- [ ] “Using AI to evaluate AI” (Terrence’s opening line) is now in Part 1.G, and LLM-as-a-judge is first defined on “Agent platforms layer protections”, just before “Building well-governed agents”. Does the opening line come back, on that slide or only in the talk?
- [ ] “Agentic”: the “What is an agent?” slide asks what it means but has no sourced definition. Terrence to add one with a source, or drop the word.
- [ ] “Why AI agents need simulation” is in Part 1.G (6 Nov 2026). Does it come back into Part 1, move to another part, or stay cut? The “Notes to follow up” slide still lists simulation as planned material under section 3.
- [ ] “The whole is more than the sum of its parts” had a placeholder for a Tim Sullivan quotation, never filled. The slide is in Part 1.G. Which quotation, and should it come back on “AI Agents are complicated *and* complex systems”?
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
