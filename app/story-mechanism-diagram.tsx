import { threeConceptSemantics, type ThreeStoryConcept } from "./three-story-math";
import type { ReactElement, ReactNode } from "react";

type StoryMechanismDiagramProps = {
  concept: ThreeStoryConcept;
  active: number;
};

const stageClass = (active: number, stage: number, extra = "") => `${active >= stage ? "is-on" : ""} ${active === stage ? "is-current" : ""} ${extra}`.trim();

function Label({ x, y, children, anchor = "middle" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end" }) {
  return <text className="mechanism-label" x={x} y={y} textAnchor={anchor}>{children}</text>;
}

function PipelineDiagram({ active }: { active: number }) {
  const labels = ["INPUT", "REPRESENT", "TRANSFORM", "OUTPUT"];
  return <>{labels.map((label, index) => <g key={label} className={stageClass(active, index, "mechanism-step")}><rect x={42 + index * 138} y={132} width="106" height="72" rx="8" /><Label x={95 + index * 138} y={174}>{label}</Label>{index < 3 && <path className="mechanism-route" d={`M148 ${168} H${180 + index * 138}`} />}</g>)}</>;
}

function VectorDiagram({ active }: { active: number }) {
  return <><path className="mechanism-axis" d="M98 286V64M62 246H538"/><path className={stageClass(active, 1, "mechanism-vector")} d="M98 246L414 92"/><path className={stageClass(active, 2, "mechanism-component")} d="M98 246H414V92"/><circle className={stageClass(active, 3, "mechanism-marker")} cx="414" cy="92" r="12"/><Label x={426} y={82} anchor="start">x = [3, 2]</Label><Label x={258} y={270}>3 units</Label><Label x={438} y={176} anchor="start">2 units</Label></>;
}

function DistributionDiagram({ active }: { active: number }) {
  const raw = [54, 108, 178, 132, 78, 38];
  const focused = [22, 64, 210, 112, 34, 12];
  const values = active >= 2 ? focused : raw;
  return <><path className="mechanism-axis" d="M78 280H542"/>{values.map((height, index) => <g key={index} className={stageClass(active, index === 2 ? 1 : 0, `mechanism-bar ${index === 2 ? "is-selected" : ""}`)}><rect x={94 + index * 72} y={280 - height} width="44" height={height} rx="4"/><Label x={116 + index * 72} y={304}>{["A","B","C","D","E","F"][index]}</Label></g>)}<Label x={310} y={44}>probability mass = 1</Label><path className={stageClass(active, 3, "mechanism-brace")} d="M95 326H498"/></>;
}

function LandscapeDiagram({ active }: { active: number }) {
  const points = [[112,86],[190,126],[276,174],[352,222],[414,250]];
  return <><ellipse className="mechanism-contour" cx="330" cy="210" rx="220" ry="126"/><ellipse className="mechanism-contour" cx="350" cy="220" rx="146" ry="82"/><ellipse className="mechanism-contour" cx="378" cy="232" rx="72" ry="40"/><path className="mechanism-descent" d="M112 86C186 98 188 144 276 174S326 232 414 250"/>{points.map(([x,y], index) => <circle key={index} className={stageClass(active, Math.min(index, 3), "mechanism-marker")} cx={x} cy={y} r={index === Math.min(active + 1, 4) ? 12 : 6}/>) }<Label x={112} y={60}>high loss</Label><Label x={414} y={286}>lower loss</Label></>;
}

function TokenDiagram({ active }: { active: number }) {
  const tokens = [{text:"un",x:74,w:72},{text:"believ",x:154,w:126},{text:"able",x:288,w:92},{text:"!",x:388,w:42}];
  return <><Label x={300} y={82}>{'"unbelievable!"'}</Label><path className="mechanism-route" d="M300 100V130"/>{tokens.map((token,index)=><g key={token.text} className={stageClass(active, Math.min(index,3), "mechanism-token")}><rect x={token.x} y="142" width={token.w} height="72" rx="6"/><Label x={token.x+token.w/2} y={174}>{token.text}</Label><text className="mechanism-id" x={token.x+token.w/2} y="199" textAnchor="middle">ID {310+index*47}</text></g>)}<path className={stageClass(active,3,"mechanism-brace")} d="M74 244H430"/><Label x={252} y={274}>four discrete units</Label></>;
}

function LookupDiagram({ active }: { active: number }) {
  return <><g className={stageClass(active,0,"mechanism-token")}><rect x="52" y="138" width="96" height="64" rx="7"/><Label x={100} y={176}>ID 417</Label></g><path className={stageClass(active,1,"mechanism-route")} d="M148 170H202"/><g className={stageClass(active,1,"mechanism-table")}>{Array.from({length:5},(_,row)=>Array.from({length:4},(_,column)=><rect key={`${row}-${column}`} className={row===2?"is-selected":""} x={206+column*38} y={82+row*38} width="30" height="28" rx="3"/>))}</g><path className={stageClass(active,2,"mechanism-route")} d="M364 170H406"/><g className={stageClass(active,2,"mechanism-vector-stack")}>{[52,84,34,102].map((width,index)=><rect key={index} x="410" y={108+index*34} width={width} height="20" rx="3"/>)}</g><g className={stageClass(active,3,"mechanism-cluster")}><circle cx="516" cy="112" r="9"/><circle cx="544" cy="132" r="8"/><circle cx="522" cy="154" r="7"/><circle className="is-selected" cx="500" cy="204" r="12"/><circle cx="544" cy="230" r="8"/></g><Label x={100} y={226}>token</Label><Label x={284} y={298}>embedding table</Label><Label x={454} y={276}>vector → geometry</Label></>;
}

function WavesDiagram({ active }: { active: number }) {
  const sin = Array.from({length:25},(_,index)=>`${64+index*20},${170-Math.sin(index*.72)*62}`).join(" ");
  const cos = Array.from({length:25},(_,index)=>`${64+index*20},${170-Math.cos(index*.72)*62}`).join(" ");
  const markerX = 104 + active * 120;
  return <><path className="mechanism-axis" d="M54 170H548"/><polyline className={stageClass(active,0,"mechanism-wave wave-a")} points={sin}/><polyline className={stageClass(active,1,"mechanism-wave wave-b")} points={cos}/><path className={stageClass(active,2,"mechanism-position-marker")} d={`M${markerX} 72V268`}/><circle className={stageClass(active,3,"mechanism-marker")} cx={markerX} cy="170" r="11"/><Label x={markerX} y={292}>position {active + 1}</Label></>;
}

function AttentionDiagram({ active }: { active: number }) {
  const weights = [.12,.24,.9,.36,.16];
  return <><Label x={70} y={54} anchor="start">QUERY</Label><g className={stageClass(active,0,"mechanism-token")}><rect x="52" y="76" width="96" height="54" rx="6"/><Label x={100} y={109}>{'"it"'}</Label></g><Label x={250} y={54} anchor="start">KEYS / SCORES</Label>{weights.map((weight,index)=><g key={index} className={stageClass(active,index===2?2:1,"mechanism-attention-cell")}><rect x={216+index*66} y="82" width="48" height={42+weight*92} rx="4" style={{opacity:.22+weight*.78}}/><text className="mechanism-id" x={240+index*66} y="236" textAnchor="middle">{weight.toFixed(2)}</text><path className="mechanism-attention-line" d={`M148 104L${240+index*66} 82`}/></g>)}<g className={stageClass(active,3,"mechanism-output")}><path className="mechanism-route" d="M216 274H430"/><circle cx="466" cy="274" r="34"/><Label x={466} y={279}>Σ wV</Label></g></>;
}

function LayersDiagram({ active }: { active: number }) {
  return <><path className="mechanism-bypass" d="M116 286V62H490V286"/><Label x={300} y={46}>residual path</Label>{["NORM","ATTENTION","NORM","MLP"].map((label,index)=><g key={label+index} className={stageClass(active,index,"mechanism-layer")}><rect x="190" y={68+index*58} width="220" height="42" rx="5"/><Label x={300} y={94+index*58}>{label}</Label><path className="mechanism-route" d={`M300 ${110+index*58}V${126+index*58}`}/></g>)}<circle className={stageClass(active,3,"mechanism-marker")} cx="490" cy="286" r="10"/><Label x={300} y={322}>add + preserve</Label></>;
}

function TrainingDiagram({ active }: { active: number }) {
  const items = [{x:300,y:62,label:"PREDICT"},{x:486,y:170,label:"LOSS"},{x:300,y:282,label:"GRADIENT"},{x:114,y:170,label:"UPDATE"}];
  return <>{items.map((item,index)=><g key={item.label} className={stageClass(active,index,"mechanism-loop-node")}><circle cx={item.x} cy={item.y} r="48"/><Label x={item.x} y={item.y+5}>{item.label}</Label></g>)}<path className="mechanism-loop-route" d="M344 82C420 90 458 112 476 132M474 210C448 254 406 274 350 282M250 282C192 270 146 246 126 210M126 132C148 96 202 72 252 66"/><Label x={300} y={174}>parameters</Label></>;
}

function DataDiagram({ active }: { active: number }) {
  return <><g className={stageClass(active,0,"mechanism-sources")}>{[96,168,240].map((y,index)=><g key={y}><rect x="46" y={y-24} width="112" height="48" rx="5"/><Label x={102} y={y+5}>{["WEB","BOOKS","CODE"][index]}</Label><path className="mechanism-route" d={`M158 ${y}L246 170`}/></g>)}</g><g className={stageClass(active,1,"mechanism-filter")}><path d="M236 112H360L326 184V250H270V184Z"/><Label x={298} y={152}>FILTER</Label></g><path className={stageClass(active,2,"mechanism-reject")} d="M270 218L198 278"/><Label x={174} y={306}>reject + log</Label><g className={stageClass(active,3,"mechanism-output")}><path className="mechanism-route" d="M326 218L422 218"/><rect x="426" y="178" width="126" height="82" rx="7"/><Label x={489} y={216}>MIXTURE</Label><text className="mechanism-id" x="489" y="238" textAnchor="middle">weights + provenance</text></g></>;
}

function SystemsDiagram({ active }: { active: number }) {
  const devices = [[160,100],[300,70],[440,100],[476,230],[300,282],[124,230]];
  return <><path className={stageClass(active,1,"mechanism-mesh-route")} d="M160 100L300 70L440 100L476 230L300 282L124 230Z M160 100L476 230M440 100L124 230M300 70V282"/>{devices.map(([x,y],index)=><g key={index} className={stageClass(active,Math.min(index%4,3),"mechanism-device")}><rect x={x-38} y={y-25} width="76" height="50" rx="7"/><Label x={x} y={y+4}>GPU {index}</Label></g>)}<circle className={stageClass(active,3,"mechanism-marker")} cx="300" cy="176" r="24"/><Label x={300} y={181}>Σ</Label></>;
}

function PreferenceDiagram({ active }: { active: number }) {
  return <><g className={stageClass(active,0,"mechanism-token")}><rect x="44" y="144" width="116" height="64" rx="7"/><Label x={102} y={181}>PROMPT</Label></g><path className="mechanism-route" d="M160 176H222M222 176L308 102M222 176L308 250"/><g className={stageClass(active,1,"mechanism-choice chosen")}><rect x="310" y="66" width="204" height="72" rx="7"/><Label x={412} y={105}>CHOSEN</Label></g><g className={stageClass(active,1,"mechanism-choice rejected")}><rect x="310" y="214" width="204" height="72" rx="7"/><Label x={412} y={253}>REJECTED</Label></g><path className={stageClass(active,2,"mechanism-margin")} d="M536 138V214M522 150L536 136L550 150M522 202L536 216L550 202"/><Label x={560} y={181} anchor="start">margin</Label><path className={stageClass(active,3,"mechanism-tether")} d="M412 138V214"/></>;
}

function DecodingDiagram({ active }: { active: number }) {
  const nodes = [[72,176],[214,88],[214,176],[214,264],[372,62],[372,130],[372,198],[372,272],[522,88],[522,176],[522,264]];
  return <><path className="mechanism-tree-route" d="M72 176L214 88M72 176H214M72 176L214 264M214 88L372 62M214 88L372 130M214 176L372 198M214 264L372 272M372 62L522 88M372 198L522 176M372 272L522 264"/>{nodes.map(([x,y],index)=><circle key={index} className={stageClass(active,index===0?0:index<4?1:index<8?2:3,`mechanism-tree-node ${[0,1,4,8].includes(index)?"is-selected":""} ${[2,3,6,7,9,10].includes(index)&&active>=2?"is-pruned":""}`)} cx={x} cy={y} r={index===0?18:11}/>)}<Label x={72} y={210}>logits</Label><Label x={214} y={318}>truncate</Label><Label x={372} y={318}>sample</Label><Label x={522} y={318}>continue</Label></>;
}

function MemoryDiagram({ active }: { active: number }) {
  const columns = 3 + active * 2;
  return <><Label x={76} y={58} anchor="start">LAYERS</Label>{Array.from({length:4},(_,row)=>Array.from({length:9},(_,column)=><rect key={`${row}-${column}`} className={`${column<columns?"is-on":""} ${column===columns-1?"is-current":""} mechanism-cache-cell`} x={84+column*48} y={78+row*52} width="38" height="38" rx="4"/>))}<path className={stageClass(active,2,"mechanism-query")} d={`M${84+(columns-1)*48+19} 306V286`}/><Label x={300} y={330}>past K/V remain · one position appends</Label></>;
}

function RetrievalDiagram({ active }: { active: number }) {
  const docs = [[126,88],[166,126],[110,152],[426,82],[474,118],[438,154],[154,260],[208,282],[408,264],[464,286]];
  return <><g className={stageClass(active,0,"mechanism-query-node")}><circle cx="300" cy="178" r="42"/><Label x={300} y={183}>QUERY</Label></g>{docs.map(([x,y],index)=><g key={index}><circle className={stageClass(active,index>=3&&index<=5?2:1,`mechanism-doc ${index>=3&&index<=5?"is-selected":""}`)} cx={x} cy={y} r="12"/><path className={stageClass(active,2,"mechanism-retrieval-ray")} d={`M300 178L${x} ${y}`}/></g>)}<g className={stageClass(active,3,"mechanism-context")}><rect x="396" y="190" width="154" height="54" rx="6"/><Label x={473} y={222}>TOP-K CONTEXT</Label></g></>;
}

function AgentDiagram({ active }: { active: number }) {
  const states = [{x:300,y:58,l:"PLAN"},{x:486,y:150,l:"ACT"},{x:410,y:286,l:"OBSERVE"},{x:190,y:286,l:"VERIFY"},{x:114,y:150,l:"RETRY"}];
  return <><path className="mechanism-loop-route" d="M336 76L454 132M474 190L428 252M368 286H232M172 252L126 190M146 132L264 76"/>{states.map((state,index)=><g key={state.l} className={stageClass(active,Math.min(index,3),"mechanism-state")}><rect x={state.x-45} y={state.y-25} width="90" height="50" rx="25"/><Label x={state.x} y={state.y+4}>{state.l}</Label></g>)}<path className={stageClass(active,3,"mechanism-stop-route")} d="M410 286L520 320"/><Label x={548} y={324} anchor="end">STOP</Label></>;
}

function EvaluationDiagram({ active }: { active: number }) {
  const bars = [{l:"average",v:82},{l:"long input",v:54},{l:"high risk",v:38},{l:"minority",v:46}];
  return <><path className="mechanism-axis" d="M172 58V300H548"/>{bars.map((bar,index)=><g key={bar.l} className={stageClass(active,Math.min(index,3),`mechanism-score ${index>0?"is-slice":""}`)}><Label x={156} y={100+index*54} anchor="end">{bar.l}</Label><rect x="176" y={80+index*54} width={bar.v*3.7} height="32" rx="4"/><text className="mechanism-id" x={188+bar.v*3.7} y={101+index*54}>{bar.v}</text>{index>0&&<path className="mechanism-errorbar" d={`M${176+bar.v*3.7-18} ${96+index*54}H${176+bar.v*3.7+18}`}/>}</g>)}</>;
}

function SecurityDiagram({ active }: { active: number }) {
  return <><circle className="mechanism-boundary outer" cx="320" cy="176" r="142"/><circle className="mechanism-boundary inner" cx="320" cy="176" r="82"/><Label x={320} y={172}>CAPABILITY</Label><Label x={320} y={194}>CHECK</Label><g className={stageClass(active,0,"mechanism-untrusted")}><rect x="30" y="74" width="128" height="54" rx="6"/><Label x={94} y={105}>WEB TEXT</Label></g><path className={stageClass(active,1,"mechanism-blocked-route")} d="M158 102L224 138"/><path className={stageClass(active,1,"mechanism-block")} d="M210 116L238 152M238 116L210 152"/><g className={stageClass(active,2,"mechanism-authorized")}><rect x="30" y="244" width="128" height="54" rx="6"/><Label x={94} y={275}>USER + SCOPE</Label></g><path className={stageClass(active,3,"mechanism-allowed-route")} d="M158 270C228 270 244 226 270 212"/></>;
}

function CompressionDiagram({ active }: { active: number }) {
  const floats = [86,122,158,204,246,294,338,382,430,474];
  const levels = [96,190,284,378,472];
  return <><Label x={52} y={60} anchor="start">FLOAT VALUES</Label>{floats.map((x,index)=>{const level=levels.reduce((best,value)=>Math.abs(value-x)<Math.abs(best-x)?value:best,levels[0]);return <g key={x}><circle className={stageClass(active,0,"mechanism-float")} cx={x} cy={112+(index%3)*22} r="7"/><path className={stageClass(active,2,"mechanism-quantize-route")} d={`M${x} ${112+(index%3)*22}L${level} 246`}/><circle className={stageClass(active,3,"mechanism-quantized")} cx={level} cy="246" r="9"/></g>})}<path className="mechanism-axis" d="M64 246H520"/>{levels.map(level=><path key={level} className="mechanism-level" d={`M${level} 226V266`}/>) }<Label x={300} y={306}>five representable levels</Label></>;
}

function AdapterDiagram({ active }: { active: number }) {
  return <><g className="mechanism-frozen"><rect x="58" y="126" width="168" height="100" rx="7"/><Label x={142} y={174}>FROZEN W</Label><text className="mechanism-id" x="142" y="198" textAnchor="middle">d × d</text></g><path className="mechanism-route" d="M226 176H536"/><g className={stageClass(active,1,"mechanism-adapter")}><rect x="270" y="58" width="94" height="58" rx="6"/><Label x={317} y={92}>A: d × r</Label><rect x="406" y="58" width="94" height="58" rx="6"/><Label x={453} y={92}>B: r × d</Label><path className="mechanism-route" d="M226 154L270 88M364 88H406M500 88L536 154"/></g><circle className={stageClass(active,3,"mechanism-marker")} cx="536" cy="176" r="12"/><Label x={398} y={254}>W x + B(Ax)</Label></>;
}

function RoutingDiagram({ active }: { active: number }) {
  const experts = [78,134,190,246,302];
  return <><g className={stageClass(active,0,"mechanism-token")}><rect x="42" y="144" width="104" height="62" rx="7"/><Label x={94} y={180}>TOKEN</Label></g><g className={stageClass(active,1,"mechanism-router")}><polygon points="202,112 310,176 202,240"/><Label x={228} y={180}>GATE</Label></g>{experts.map((y,index)=><g key={index} className={stageClass(active,index===1||index===3?2:1,`mechanism-expert ${index===1||index===3?"is-selected":""}`)}><path className="mechanism-route" d={`M310 176L412 ${y}`}/><rect x="416" y={y-20} width="130" height="40" rx="5"/><Label x={481} y={y+4}>EXPERT {index+1}</Label></g>)}<Label x={480} y={338}>top-2 execute</Label></>;
}

function MultimodalDiagram({ active }: { active: number }) {
  return <><g className={stageClass(active,0,"mechanism-patches")}>{Array.from({length:9},(_,index)=><rect key={index} className={index===4?"is-selected":""} x={46+(index%3)*38} y={92+Math.floor(index/3)*38} width="30" height="30" rx="3"/>)}<Label x={92} y={238}>image patches</Label></g><g className={stageClass(active,0,"mechanism-text-tokens")}>{["THE","RED","SIGN"].map((label,index)=><g key={label}><rect x="46" y={260+index*28} width="92" height="22" rx="3"/><text className="mechanism-id" x="92" y={275+index*28} textAnchor="middle">{label}</text></g>)}</g><path className={stageClass(active,1,"mechanism-route")} d="M166 160L276 160M166 294L276 210"/><g className={stageClass(active,2,"mechanism-projector")}><rect x="278" y="136" width="112" height="100" rx="7"/><Label x={334} y={178}>PROJECT</Label><Label x={334} y={202}>+ ALIGN</Label></g><path className={stageClass(active,3,"mechanism-route")} d="M390 186H448"/><g className={stageClass(active,3,"mechanism-output")}><circle cx="500" cy="186" r="48"/><Label x={500} y={182}>SHARED</Label><Label x={500} y={204}>SEQUENCE</Label></g></>;
}

function InterpretabilityDiagram({ active }: { active: number }) {
  return <><g className={stageClass(active,0,"mechanism-model")}><rect x="214" y="110" width="172" height="132" rx="10"/><Label x={300} y={172}>MODEL</Label><circle cx="300" cy="204" r="13"/></g><g className={stageClass(active,1,"mechanism-probe")}><path className="mechanism-route" d="M300 204L126 100"/><rect x="42" y="64" width="124" height="70" rx="6"/><Label x={104} y={94}>PROBE</Label><Label x={104} y={116}>can decode?</Label></g><g className={stageClass(active,2,"mechanism-ablation")}><path className="mechanism-route" d="M300 204L126 286"/><rect x="42" y="250" width="124" height="70" rx="6"/><Label x={104} y={280}>ABLATE</Label><Label x={104} y={302}>does output move?</Label></g><g className={stageClass(active,3,"mechanism-output")}><path className="mechanism-route" d="M386 176H456"/><circle cx="508" cy="176" r="42"/><Label x={508} y={172}>Δ</Label><Label x={508} y={194}>behavior</Label></g></>;
}

export function StoryMechanismDiagram({ concept, active }: StoryMechanismDiagramProps) {
  const diagrams: Record<ThreeStoryConcept, ReactElement> = {
    pipeline: <PipelineDiagram active={active} />,
    coordinates: <VectorDiagram active={active} />,
    distribution: <DistributionDiagram active={active} />,
    optimization: <LandscapeDiagram active={active} />,
    segmentation: <TokenDiagram active={active} />,
    embedding: <LookupDiagram active={active} />,
    position: <WavesDiagram active={active} />,
    attention: <AttentionDiagram active={active} />,
    layers: <LayersDiagram active={active} />,
    training: <TrainingDiagram active={active} />,
    data: <DataDiagram active={active} />,
    systems: <SystemsDiagram active={active} />,
    preference: <PreferenceDiagram active={active} />,
    decoding: <DecodingDiagram active={active} />,
    memory: <MemoryDiagram active={active} />,
    retrieval: <RetrievalDiagram active={active} />,
    agent: <AgentDiagram active={active} />,
    evaluation: <EvaluationDiagram active={active} />,
    security: <SecurityDiagram active={active} />,
    compression: <CompressionDiagram active={active} />,
    adapter: <AdapterDiagram active={active} />,
    routing: <RoutingDiagram active={active} />,
    multimodal: <MultimodalDiagram active={active} />,
    interpretability: <InterpretabilityDiagram active={active} />,
  };

  return <svg className="story-mechanism-diagram" data-grammar={threeConceptSemantics[concept].grammar} viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <defs>
      <marker id={`story-arrow-${concept}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
    </defs>
    {diagrams[concept]}
  </svg>;
}
