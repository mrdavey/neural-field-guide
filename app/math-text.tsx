import { createElement, Fragment, type ReactNode } from "react";

const symbols: Record<string, ["mi" | "mo", string]> = {
  alpha: ["mi", "α"], beta: ["mi", "β"], gamma: ["mi", "γ"], delta: ["mi", "δ"],
  Delta: ["mi", "Δ"], epsilon: ["mi", "ε"], eta: ["mi", "η"], theta: ["mi", "θ"],
  lambda: ["mi", "λ"], mu: ["mi", "μ"], pi: ["mi", "π"], rho: ["mi", "ρ"],
  sigma: ["mi", "σ"], tau: ["mi", "τ"], phi: ["mi", "φ"], omega: ["mi", "ω"],
  nabla: ["mo", "∇"], partial: ["mo", "∂"], sum: ["mo", "∑"], prod: ["mo", "∏"],
  times: ["mo", "×"], div: ["mo", "÷"], cdot: ["mo", "⋅"], pm: ["mo", "±"], approx: ["mo", "≈"],
  le: ["mo", "≤"], leq: ["mo", "≤"], ge: ["mo", "≥"], geq: ["mo", "≥"],
  ne: ["mo", "≠"], infty: ["mo", "∞"], to: ["mo", "→"], rightarrow: ["mo", "→"],
  leftarrow: ["mo", "←"], leftrightarrow: ["mo", "↔"], Rightarrow: ["mo", "⇒"],
  in: ["mo", "∈"], succ: ["mo", "≻"], log: ["mi", "log"], ln: ["mi", "ln"], exp: ["mi", "exp"],
  max: ["mi", "max"], min: ["mi", "min"], ldots: ["mo", "…"], mid: ["mo", "|"],
};

class LatexToMathML {
  private position = 0;
  private key = 0;

  constructor(private readonly source: string) {}

  render() {
    return this.node("mrow", {}, ...this.sequence());
  }

  private node(tag: string, props: Record<string, unknown> = {}, ...children: ReactNode[]) {
    return createElement(tag, { ...props, key: `math-${this.key++}` }, ...children);
  }

  private sequence(stop?: string): ReactNode[] {
    const output: ReactNode[] = [];
    while (this.position < this.source.length && this.source[this.position] !== stop) {
      let base = this.atom();
      if (base === null) continue;
      let subscript: ReactNode | undefined;
      let superscript: ReactNode | undefined;
      while (this.source[this.position] === "_" || this.source[this.position] === "^") {
        const marker = this.source[this.position++];
        const argument = this.argument();
        if (marker === "_") subscript = argument;
        else superscript = argument;
      }
      if (subscript && superscript) base = this.node("msubsup", {}, base, subscript, superscript);
      else if (subscript) base = this.node("msub", {}, base, subscript);
      else if (superscript) base = this.node("msup", {}, base, superscript);
      output.push(base);
    }
    if (stop && this.source[this.position] === stop) this.position++;
    return output;
  }

  private argument(): ReactNode {
    while (this.source[this.position] === " ") this.position++;
    if (this.source[this.position] === "{") {
      this.position++;
      return this.node("mrow", {}, ...this.sequence("}"));
    }
    return this.atom() ?? this.node("mrow");
  }

  private rawGroup() {
    while (this.source[this.position] === " ") this.position++;
    if (this.source[this.position] !== "{") return "";
    this.position++;
    const start = this.position;
    let depth = 1;
    while (this.position < this.source.length && depth > 0) {
      if (this.source[this.position] === "{") depth++;
      if (this.source[this.position] === "}") depth--;
      this.position++;
    }
    return this.source.slice(start, Math.max(start, this.position - 1));
  }

  private atom(): ReactNode | null {
    const character = this.source[this.position];
    if (!character) return null;
    if (/\s/.test(character)) {
      while (/\s/.test(this.source[this.position] ?? "")) this.position++;
      return this.node("mspace", { width: "0.25em" });
    }
    if (character === "{") {
      this.position++;
      return this.node("mrow", {}, ...this.sequence("}"));
    }
    if (character === "\\") return this.command();
    if (/[0-9.]/.test(character)) {
      const start = this.position++;
      while (/[0-9.]/.test(this.source[this.position] ?? "")) this.position++;
      return this.node("mn", {}, this.source.slice(start, this.position));
    }
    if (/[A-Za-zΑ-Ωα-ω]/.test(character)) {
      this.position++;
      return this.node("mi", {}, character);
    }
    if (character === "ℝ") {
      this.position++;
      return this.node("mi", { mathvariant: "double-struck" }, "R");
    }
    this.position++;
    if ("+-=<>/|:;,()[]".includes(character) || "×·≈≤≥→←↔⇒−±∑∂∇√∈≻".includes(character)) return this.node("mo", {}, character);
    return this.node("mtext", {}, character);
  }

  private command(): ReactNode | null {
    this.position++;
    if (this.source[this.position] === "\\") {
      this.position++;
      return this.node("mspace", { linebreak: "newline" });
    }
    const start = this.position;
    while (/[A-Za-z]/.test(this.source[this.position] ?? "")) this.position++;
    const name = this.source.slice(start, this.position) || this.source[this.position++];
    if (name === "frac") return this.node("mfrac", {}, this.argument(), this.argument());
    if (name === "sqrt") return this.node("msqrt", {}, this.argument());
    if (name === "operatorname" || name === "text") return this.node(name === "text" ? "mtext" : "mi", { mathvariant: "normal" }, this.rawGroup());
    if (name === "mathrm" || name === "mathbf" || name === "mathcal" || name === "mathbb" || name === "mathsf") {
      const variant = name === "mathrm" ? "normal" : name === "mathbf" ? "bold" : name === "mathcal" ? "script" : name === "mathsf" ? "sans-serif" : "double-struck";
      return this.node("mstyle", { mathvariant: variant }, this.argument());
    }
    if (["left", "right", "big", "Big", "bigl", "bigr"].includes(name)) return null;
    if (name === "," || name === ";" || name === "quad" || name === "qquad") return this.node("mspace", { width: name === "qquad" ? "2em" : name === "quad" ? "1em" : "0.2em" });
    const mapped = symbols[name];
    if (mapped) return this.node(mapped[0], mapped[0] === "mi" && ["log", "ln", "exp", "max", "min"].includes(name) ? { mathvariant: "normal" } : {}, mapped[1]);
    return this.node("mtext", { className: "math-unknown-command" }, `\\${name}`);
  }
}

function balanced(expression: string) {
  let depth = 0;
  for (const character of expression) {
    if (character === "{") depth++;
    if (character === "}") depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

export function MathExpression({ latex, display = false }: { latex: string; display?: boolean }) {
  const source = latex.trim()
    .replace(/([A-Za-z0-9)\]])²/g, "$1^2")
    .replace(/([A-Za-z0-9)\]])³/g, "$1^3");
  if (!source || !balanced(source)) return <span className="math-fallback">{source}</span>;
  const content = new LatexToMathML(source).render();
  return <span className={display ? "math-display" : "math-inline"}>
    {createElement("math", { display: display ? "block" : "inline", "aria-label": source }, content)}
  </span>;
}

type TextPart = { type: "text" | "math"; value: string; display?: boolean };

const implicitNotation = /(?:[A-Z]\s*)?\[[^\]\n]{0,48},[^\]\n]{0,48}\]|\bd[A-Z][A-Za-z]*\/d[A-Za-z]+\b|\bO\([^)\n]{1,40}\)|\b[A-Za-z](?:_[A-Za-z0-9]+)?=[A-Za-z0-9()[\]_^²³+\-−×·*/.]+|[Α-Ωα-ω](?:_[A-Za-z0-9]+)?|[A-Za-z0-9,.)\]]+[²³]/g;

function splitImplicitMath(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(implicitNotation)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ type: "text", value: text.slice(cursor, start) });
    parts.push({ type: "math", value: match[0] });
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push({ type: "text", value: text.slice(cursor) });
  return parts.length ? parts : [{ type: "text", value: text }];
}

export function splitMathText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const opening = text.indexOf("$", cursor);
    if (opening < 0) {
      parts.push(...splitImplicitMath(text.slice(cursor)));
      break;
    }
    if (opening > cursor) parts.push(...splitImplicitMath(text.slice(cursor, opening)));
    const display = text[opening + 1] === "$";
    const delimiter = display ? "$$" : "$";
    const contentStart = opening + delimiter.length;
    const closing = text.indexOf(delimiter, contentStart);
    if (closing < 0) {
      parts.push(...splitImplicitMath(text.slice(opening)));
      break;
    }
    parts.push({ type: "math", value: text.slice(contentStart, closing), display });
    cursor = closing + delimiter.length;
  }
  return parts.length ? parts : [{ type: "text", value: text }];
}

export function MathText({ children }: { children: string }) {
  return <>{splitMathText(children).map((part, index) => part.type === "math"
    ? <MathExpression key={`${part.value}-${index}`} latex={part.value} display={part.display} />
    : <Fragment key={`${part.value}-${index}`}>{part.value}</Fragment>)}</>;
}
