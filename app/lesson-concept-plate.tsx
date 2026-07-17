import type { CSSProperties, ReactElement } from "react";
import type { CourseId } from "./course-catalog";
import type { Lesson } from "./course-data";
import { MathText } from "./math-text";
import { publicPath } from "./public-path";
import { lessonVisualFor, type LessonVisual } from "./lesson-visuals";

function stageClass(index: number) {
  return `lesson-visual-glyph lesson-visual-glyph-${index + 1}`;
}

function CoordinatesGlyph({ index }: { index: number }) {
  const x = 24 + index * 12;
  const y = 58 - index * 9;
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M15 8V60H86" /><path d="M20 48L44 39L68 20" /><circle cx={x} cy={y} r="5" /><path d={`M${x} ${y}L${Math.min(82, x + 22)} ${Math.max(12, y - 18)}`} /></svg>;
}

function DistributionGlyph({ index }: { index: number }) {
  const heights = [18 + index * 5, 34 + index * 4, 52 - index * 3, 26 + index * 2];
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M10 62H88" />{heights.map((height, bar) => <rect key={bar} x={16 + bar * 18} y={62 - height} width="11" height={height} rx="2" />)}</svg>;
}

function OptimizationGlyph({ index }: { index: number }) {
  const points = [[22,18],[40,30],[58,43],[76,54]];
  const [x, y] = points[index];
  return <svg viewBox="0 0 96 72" aria-hidden="true"><ellipse cx="56" cy="43" rx="35" ry="20"/><ellipse cx="61" cy="47" rx="21" ry="12"/><path d="M18 14C33 20 34 32 50 37S62 50 78 55"/><circle cx={x} cy={y} r="6"/></svg>;
}

function TrainingGlyph({ index }: { index: number }) {
  const nodes = [[48,10],[82,36],[48,62],[14,36]];
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M48 10C73 10 84 22 82 36C84 54 67 62 48 62C26 62 12 50 14 36C12 20 27 10 48 10"/>{nodes.map(([x,y], node) => <circle key={node} cx={x} cy={y} r={node === index ? 7 : 4}/>)}</svg>;
}

function SystemsGlyph({ index }: { index: number }) {
  const active = Math.min(4, index + 1);
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M20 18L48 10L76 18L80 50L48 62L16 50Z M20 18L80 50M76 18L16 50"/>{[[20,18],[48,10],[76,18],[80,50],[48,62],[16,50]].map(([x,y], node) => <rect key={node} x={x-5} y={y-5} width="10" height="10" rx="2" className={node < active ? "is-active" : ""}/>)}</svg>;
}

function EvaluationGlyph({ index }: { index: number }) {
  const values = [68, 51, 34, 60];
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M12 8V64H90"/>{values.map((value,row)=><rect key={row} x="17" y={12+row*13} width={value - (row === index ? 0 : 13)} height="8" rx="2" className={row === index ? "is-active" : ""}/>)}</svg>;
}

function PreferenceGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true"><rect x="8" y="28" width="22" height="16" rx="3"/><path d="M30 36H43M43 36L58 17M43 36L58 55"/><rect x="58" y="8" width={24+index*2} height="18" rx="3" className="is-active"/><rect x="58" y="46" width={24-index*2} height="18" rx="3"/><path d="M88 26V46"/></svg>;
}

function DecodingGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M12 36L34 15M12 36H34M12 36L34 57M34 15L59 10M34 15L59 25M34 36L59 36M34 57L59 48M34 57L59 62M59 10L84 16M59 36L84 36M59 62L84 56"/>{[[12,36],[34,15],[34,36],[34,57],[59,10],[59,25],[59,36],[59,48],[59,62],[84,16],[84,36],[84,56]].map(([x,y],node)=><circle key={node} cx={x} cy={y} r={node === Math.min(11,index*3) ? 5 : 3} className={node > index*3+3 ? "is-muted" : ""}/>)}</svg>;
}

function MemoryGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true">{Array.from({length:18},(_,cell)=>{const column=cell%6;const row=Math.floor(cell/6);return <rect key={cell} x={11+column*13} y={13+row*16} width="9" height="11" rx="2" className={column <= index+1 ? "is-active" : ""}/>})}<path d={`M${17+(index+1)*13} 62V52`}/></svg>;
}

function CompressionGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M10 18H86M10 54H86"/>{[16,26,37,49,61,73,82].map((x,node)=><g key={x}><circle cx={x} cy={18+(node%2)*5} r="3"/><path d={`M${x} ${21+(node%2)*5}L${18+Math.round((x-18)/21)*21} 54`}/></g>)}{[18,39,60,81].map((x,node)=><circle key={x} cx={x} cy="54" r={node === index ? 6 : 4} className={node===index?"is-active":""}/>)}</svg>;
}

function PipelineGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M11 36H85"/>{[16,38,60,82].map((x,node)=><g key={x}><circle cx={x} cy="36" r={node===index?8:5} className={node<=index?"is-active":""}/>{node<3?<path d={`M${x+7} 36H${x+15}`}/>:null}</g>)}</svg>;
}

function SegmentationGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true">{[8,29,51,73].map((x,node)=><rect key={x} x={x} y="25" width={node===1?20:16} height="24" rx="3" className={node<=index?"is-active":""}/>)}<path d={`M${10+index*21} 18V56`}/></svg>;
}

function AgentGlyph({ index }: { index: number }) {
  const nodes = [[48,9],[82,29],[70,61],[26,61],[14,29]];
  return <svg viewBox="0 0 96 72" aria-hidden="true"><path d="M48 9L82 29L70 61H26L14 29Z"/>{nodes.map(([x,y],node)=><rect key={node} x={x-6} y={y-5} width="12" height="10" rx="5" className={node===index?"is-active":""}/>)}</svg>;
}

function RoutingGlyph({ index }: { index: number }) {
  return <svg viewBox="0 0 96 72" aria-hidden="true"><rect x="7" y="29" width="18" height="14" rx="3"/><path d="M25 36H42M42 36L61 10M42 36L61 27M42 36L61 45M42 36L61 62"/>{[10,27,45,62].map((y,node)=><rect key={y} x="62" y={y-6} width="25" height="12" rx="3" className={node === index || node === (index+1)%4 ? "is-active" : ""}/>)}</svg>;
}

function StageGlyph({ concept, index }: { concept: LessonVisual["concept"]; index: number }): ReactElement {
  const props = { index };
  if (concept === "coordinates" || concept === "position" || concept === "attention") return <CoordinatesGlyph {...props}/>;
  if (concept === "distribution") return <DistributionGlyph {...props}/>;
  if (concept === "optimization") return <OptimizationGlyph {...props}/>;
  if (concept === "training") return <TrainingGlyph {...props}/>;
  if (concept === "systems") return <SystemsGlyph {...props}/>;
  if (concept === "evaluation" || concept === "interpretability") return <EvaluationGlyph {...props}/>;
  if (concept === "preference") return <PreferenceGlyph {...props}/>;
  if (concept === "decoding") return <DecodingGlyph {...props}/>;
  if (concept === "memory") return <MemoryGlyph {...props}/>;
  if (concept === "compression" || concept === "adapter" || concept === "layers") return <CompressionGlyph {...props}/>;
  if (concept === "segmentation") return <SegmentationGlyph {...props}/>;
  if (concept === "agent" || concept === "security") return <AgentGlyph {...props}/>;
  if (concept === "routing") return <RoutingGlyph {...props}/>;
  return <PipelineGlyph {...props}/>;
}

function DeterministicVisual({ visual }: { visual: LessonVisual }) {
  return <div className={`lesson-visual-exact lesson-visual-exact-${visual.concept}`} aria-label="Four-stage mechanism diagram">
    {visual.labels.map((label, index) => <div className="lesson-visual-stage" key={label}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <div className={stageClass(index)}><StageGlyph concept={visual.concept} index={index}/></div>
      <strong>{label}</strong>
      <p><MathText>{visual.stageDescriptions[index]}</MathText></p>
    </div>)}
  </div>;
}

export function LessonConceptPlate({ courseId, lesson }: { courseId: CourseId; lesson: Lesson }) {
  const visual = lessonVisualFor(courseId, lesson.id);
  const titleId = `lesson-visual-title-${courseId}-${lesson.id}`;
  const style = { "--visual-accent": "var(--track)" } as CSSProperties;
  const asset = visual.assetBase;

  return <figure className={`lesson-concept-plate is-${visual.kind}`} style={style} aria-labelledby={titleId}>
    <header>
      <span className="eyebrow">Concept in one view</span>
      <h2 id={titleId}><MathText>{lesson.simple}</MathText></h2>
      <p><MathText>{lesson.mentalModel}</MathText></p>
    </header>

    {visual.kind === "raster" && asset ? <div className="lesson-visual-raster-frame">
      <picture>
        <source media="(max-width: 780px)" srcSet={publicPath(`${asset}-768.webp`)} type="image/webp"/>
        <img src={publicPath(`${asset}-1536.webp`)} width="1536" height="1024" loading="lazy" decoding="async" alt={`Concept illustration for ${lesson.title}. ${lesson.simple}`}/>
      </picture>
      <ol aria-label="Causal stages shown in the illustration">{visual.labels.map((label, index) => <li key={label}><span>{index + 1}</span><strong>{label}</strong></li>)}</ol>
    </div> : <DeterministicVisual visual={visual}/>} 

    <figcaption>
      <div><strong>Trace the mechanism</strong><p><MathText>{visual.stageDescriptions.join(" → ")}</MathText></p></div>
      <div><strong>Important limit</strong><p><MathText>{lesson.misconception}</MathText></p></div>
    </figcaption>
    <details className="lesson-visual-description">
      <summary>Read a text-only explanation</summary>
      <p><MathText>{`${lesson.mentalModel} The mechanism progresses through ${visual.labels.join(" → ")}. ${lesson.example}`}</MathText></p>
    </details>
    <small className="lesson-visual-evidence">{visual.kind === "raster" ? "Generated concept illustration · exact labels are code-rendered · not a measurement" : "Deterministic SVG/HTML diagram · exact labels, illustrative layout"}</small>
  </figure>;
}
