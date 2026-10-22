import { TARGETS } from "./core.mjs";

export function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of [children].flat(Infinity)) {
    if (child != null) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const fmt = value => value == null ? "—" : String(Math.round(value * 100) / 100);
export const newId = () => crypto.randomUUID();
export const statusLabel = state => ({
  passed: "Pass", failed: "Below threshold", error: "Evaluation error", cancelled: "Cancelled",
  queued: "Queued", running: "Judging", not_applicable: "Not applicable", done: "Scored",
})[state] || state;
export const badge = state => h("span", { class: `badge badge-${state}` }, statusLabel(state));

export function showError(element, error = "") {
  element.textContent = error?.message || error;
  element.hidden = !element.textContent;
}

export function toolDefinitions(tools) {
  const details = h("details", { class: "tool-definitions" });
  details.append(h("summary", {}, `Available tools (${tools.length})`));
  for (const tool of tools) details.append(
    h("h3", {}, tool.name), h("p", {}, tool.description),
    h("pre", {}, JSON.stringify(tool.parameters, null, 2)),
  );
  return details;
}

export function transcript(item, prefix) {
  const panel = h("section", { class: "transcript-panel", "aria-label": `${item.label} transcript` });
  panel.append(h("h3", { class: "panel-title" }, "Transcript"));
  const list = h("div", { class: "transcript" });
  for (const message of item.messages) {
    if (message.role === "tool") continue;
    const article = h("article", { id: `${prefix}-${message.id}`, class: `message message-${message.role}`, tabindex: "-1" });
    if (message.toolCall) {
      const call = message.toolCall;
      article.classList.add("tool-message");
      article.append(h("h4", {}, `Tool call: ${call.name}`),
        h("p", { class: "kicker" }, "Input"), h("pre", {}, JSON.stringify(call.arguments, null, 2)));
      const result = item.messages.find(part => part.role === "tool" && part.callId === call.id);
      if (result) {
        const output = h("div", { id: `${prefix}-${result.id}`, class: "tool-output", tabindex: "-1" });
        output.append(h("p", { class: "kicker" }, "Output"), h("pre", {}, typeof result.content === "string" ? result.content : JSON.stringify(result.content, null, 2)));
        article.append(output);
      } else article.append(h("p", { class: "hint" }, "No recorded result."));
    } else {
      const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2);
      article.append(h("h4", {}, message.role === "user" ? "Job seeker" : message.role === "system" ? "Agent instructions" : "Agent answer"), h("p", {}, content));
    }
    list.append(article);
  }
  panel.append(list);
  return panel;
}

export function metricRow(criterion, target, result, prefix) {
  const details = h("details", { class: "metric-row" });
  const state = result ? result.score >= criterion.threshold ? "passed" : "failed" : "not_applicable";
  const label = target?.label || criterion.name;
  const summary = h("summary");
  summary.append(h("span", { class: "metric-name" }, label), badge(state));
  if (result) {
    const meter = h("span", { class: "score-meter", "aria-hidden": "true" });
    for (let index = 1; index <= 5; index++) meter.append(h("i", { class: index <= result.score ? `filled ${state}` : "" }));
    summary.append(meter, h("strong", { class: "metric-score" }, `${result.score}/5`));
  }
  details.append(summary);
  const content = h("div", { class: "metric-content" });
  content.append(h("p", { class: "metric-verdict" }, result ? `${result.score}/5 · ${statusLabel(state)}` : "Not applicable to this trace"));
  if (result) content.append(h("h4", {}, "Why this score?"), h("p", {}, result.explanation));
  content.append(h("h4", {}, "What this measures"), h("p", {}, criterion.rubric),
    h("p", { class: "hint" }, `${TARGETS[criterion.target]} · Pass at ${criterion.threshold}/5 or higher`));
  if (result) {
    content.append(h("h4", {}, "Evidence"));
    const links = h("div", { class: "evidence-links" });
    for (const id of result.evidence) {
      const link = h("a", { href: `#${prefix}-${id}` }, id);
      link.addEventListener("click", event => {
        const evidence = document.getElementById(`${prefix}-${id}`);
        if (evidence) {
          event.preventDefault(); evidence.focus();
          evidence.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }
      });
      links.append(link);
    }
    content.append(links);
  }
  details.append(content);
  return details;
}
