import { h } from "./advanced/ui.mjs";
import { ROUNDS, STEPS, stepHref } from "./workflow.mjs";

export function exerciseNavigation(round, step, latestRun) {
  const roundNumber = ROUNDS.findIndex(item => item.id === round.id) + 1;
  const wrapper = h("div", { class: "exercise-navigation" });
  wrapper.append(h("p", { class: "round-label" }, `Round ${roundNumber} of ${ROUNDS.length} · ${round.title} · ${round.tools} tool call${round.tools === 1 ? "" : "s"}`));
  wrapper.append(h("nav", { "aria-label": "Exercise rounds" },
    h("ol", { class: "round-list" }, ROUNDS.map((item, index) => h("li", {},
      h("a", { href: stepHref("cases", item.id), "aria-current": item.id === round.id ? "true" : null },
        `Round ${index + 1}: ${item.title}`))))));
  const nav = h("nav", { "aria-label": "Exercise steps" });
  nav.append(h("ol", { class: "step-list" }, STEPS.map((item, index) => h("li", {},
    h("a", { href: stepHref(item.id, round.id, latestRun), "aria-current": item.id === step ? "step" : null }, [
      h("span", { class: "step-number", "aria-hidden": "true" }, index + 1), item.title,
    ])))));
  wrapper.append(nav);
  return wrapper;
}

export function roundPicker(round) {
  const select = h("select", { id: "round-select" }, ROUNDS.map((item, index) =>
    h("option", { value: item.id }, `Round ${index + 1}: ${item.title}`)));
  select.value = round.id;
  return h("label", { class: "round-picker" }, [h("span", { class: "field-label" }, "Exercise round"), select]);
}
