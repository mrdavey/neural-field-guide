export type TrackId = "architecture" | "pretraining" | "posttraining" | "advanced";

export type Quiz = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  track: TrackId;
  title: string;
  number: number;
  duration: number;
  simple: string;
  deep: string;
  mentalModel: string;
  keyIdeas: string[];
  example: string;
  misconception: string;
  quiz: Quiz;
  lab?: "tokens" | "vectors" | "positions" | "attention" | "prediction" | "scaling" | "optimizer" | "preference" | "lora" | "moe" | "distillation" | "rl";
  prerequisites?: string[];
};

export const tracks = [
  { id: "architecture" as const, title: "Architecture", short: "Inside the machine", description: "Turn text into predictions, one transparent mechanism at a time.", color: "#ff6b35" },
  { id: "pretraining" as const, title: "Pre-Training", short: "Build the base model", description: "Learn how data, objectives, compute, and evaluation create capability.", color: "#ffd166" },
  { id: "posttraining" as const, title: "Post-Training", short: "Shape useful behavior", description: "Transform a text predictor into a helpful, safer assistant.", color: "#57d6c7" },
  { id: "advanced" as const, title: "Advanced", short: "Make models efficient", description: "Compress, adapt, route, and align modern language models.", color: "#a78bfa" },
];

export const lessons: Lesson[] = [
  {
    id: "introduction", track: "architecture", title: "Introduction", number: 1, duration: 8,
    simple: "A large language model is a system that repeatedly predicts a useful next piece of text. Surprisingly rich behavior emerges when that prediction skill is learned from enormous, varied datasets.",
    deep: "An autoregressive LLM parameterizes a conditional probability distribution: p(x₁…xₙ) = ∏ p(xₜ | x<ₜ). A tokenizer turns text into discrete IDs; a Transformer maps the prior IDs to logits; softmax converts logits into probabilities; a decoding rule chooses the next token. Training adjusts billions of parameters to reduce prediction error. The model does not retrieve a stored sentence in the ordinary case—it computes a new probability distribution from the current context.",
    mentalModel: "Picture an impossibly well-read autocomplete. It has compressed patterns from its reading into numerical knobs, then reconstructs an answer one token at a time.",
    keyIdeas: ["LLMs model conditional token probabilities", "Training learns parameters; inference uses them", "Fluency is not a guarantee of truth or understanding"],
    example: "Given “The capital of France is”, a trained model assigns far more probability to “ Paris” than to “ banana”. It then feeds the chosen token back in and predicts again.",
    misconception: "An LLM is not a searchable database of exact passages. Memorization can occur, but generation is primarily a learned computation over context.",
    quiz: { question: "What does a standard autoregressive LLM directly produce at each step?", options: ["A verified fact", "A probability distribution over the next token", "A complete paragraph", "A database query"], answer: 1, explanation: "The model outputs logits that become next-token probabilities. Decoding selects one token, and the cycle repeats." },
    lab: "prediction"
  },
  {
    id: "tokenization", track: "architecture", title: "Tokenization", number: 2, duration: 14,
    simple: "Tokenization cuts text into reusable pieces and gives each piece a number the model can process.",
    deep: "Modern tokenizers usually learn a subword vocabulary with algorithms such as BPE, WordPiece, or Unigram. Common strings may become one token while rare words split into pieces. A deterministic encoder maps text to IDs; a decoder reverses the mapping. Vocabulary size trades sequence length against embedding-table size and rare-word coverage. Token boundaries affect cost, multilingual fairness, arithmetic, spelling, and the effective context length—but tokens are not necessarily words.",
    mentalModel: "It is a box of magnetic word fragments: common phrases get large pieces; unfamiliar terms are assembled from smaller pieces.",
    keyIdeas: ["Tokens can be words, subwords, bytes, or punctuation", "Vocabulary and sequence length trade off", "Tokenization happens before neural computation"],
    example: "A toy tokenizer might encode “unbelievable!” as [“un”, “believ”, “able”, “!”]. The model sees four IDs, not the original characters.",
    misconception: "One token is not one word. Spaces, punctuation, casing, and language can all change token count.",
    quiz: { question: "Why not give every possible word its own vocabulary entry?", options: ["Words cannot be numbered", "It creates a huge vocabulary and still fails on unseen words", "Transformers only accept characters", "Spaces would disappear"], answer: 1, explanation: "Subwords keep the vocabulary manageable while composing rare and unseen strings from reusable pieces." },
    lab: "tokens", prerequisites: ["introduction"]
  },
  {
    id: "embedding-layer", track: "architecture", title: "The Embedding Layer", number: 3, duration: 16,
    simple: "An embedding replaces each token ID with a learnable list of numbers—a location in the model’s internal meaning space.",
    deep: "The token embedding matrix E ∈ ℝ^(V×d) is a learned lookup table with one d-dimensional row per vocabulary item. During backpropagation, rows move so tokens useful in similar predictive contexts often acquire related geometry. Embeddings are context-free at lookup time: the row for “bank” is initially identical in “river bank” and “central bank.” Transformer layers then contextualize it. Many decoder models tie the input embedding matrix to the output projection, reducing parameters and aligning input/output geometry.",
    mentalModel: "A token ID is a library card number; its embedding is the rich profile pulled from the catalogue. Later layers update that profile using the surrounding sentence.",
    keyIdeas: ["Embeddings are learned, dense vectors", "Initial token embeddings are not yet contextual", "Distance and direction can encode useful relationships"],
    example: "In a 2-D toy space, animal words may cluster while action words occupy another region. Real models use hundreds or thousands of dimensions, not two.",
    misconception: "Each embedding dimension does not reliably correspond to one human-named feature. Meaning is distributed across many coordinates.",
    quiz: { question: "When does the embedding for “bank” become different in river and finance sentences?", options: ["Inside the tokenizer", "At the raw lookup", "As Transformer layers mix in context", "It never differs"], answer: 2, explanation: "The lookup vector is the same token row; contextual layers transform it according to surrounding tokens." },
    lab: "vectors", prerequisites: ["tokenization"]
  },
  {
    id: "positional-encoding", track: "architecture", title: "Positional Encoding", number: 4, duration: 16,
    simple: "Position information tells a Transformer which token came first, second, and so on—because attention alone has no built-in word order.",
    deep: "Self-attention without positional signals is permutation-equivariant: reordering inputs merely reorders outputs. Models therefore inject order through learned absolute embeddings, sinusoidal features, relative position biases, or rotary position embeddings (RoPE). RoPE rotates query and key pairs by position-dependent angles, making attention scores depend on relative displacement. Position methods influence length extrapolation, recency behavior, and context-window extension; they encode order, not a perfect counter of absolute location.",
    mentalModel: "Tokens are actors wearing numbered stage marks. Attention knows who is present; positions tell it where everyone stands.",
    keyIdeas: ["Attention needs an order signal", "Absolute, relative, and rotary methods differ", "Position design affects long-context behavior"],
    example: "“Dog bites person” and “Person bites dog” contain the same token set but mean different things. Position signals let attention distinguish them.",
    misconception: "Positional encoding is not a second tokenizer and does not by itself understand grammar; it supplies geometry that layers can learn to use.",
    quiz: { question: "What would self-attention lack without positional information?", options: ["A vocabulary", "A reliable representation of token order", "Floating-point numbers", "Multiple heads"], answer: 1, explanation: "Plain attention compares content but is otherwise indifferent to permutation, so order must be injected." },
    lab: "positions", prerequisites: ["embedding-layer"]
  },
  {
    id: "attention", track: "architecture", title: "Attention", number: 5, duration: 24,
    simple: "Attention lets every token decide which earlier tokens matter for interpreting and predicting what comes next.",
    deep: "Each hidden state is projected into a query Q, key K, and value V. Scaled dot-product attention computes softmax(QKᵀ/√dₖ + mask)V. Similar queries and keys receive larger weights, creating a content-dependent weighted sum of values. A causal mask blocks future positions during next-token training. Multiple heads learn distinct projections and can capture different relationships. Attention routes information; the MLP transforms it. Its standard time and memory cost grows quadratically with sequence length.",
    mentalModel: "At a crowded workshop, a token asks a question (query), compares it with everyone’s label (keys), then collects information (values) in proportion to relevance.",
    keyIdeas: ["Q asks, K matches, V carries", "Softmax makes a normalized weighted mixture", "Causal masks prevent looking ahead"],
    example: "In “The trophy did not fit in the suitcase because it was too big,” the representation of “it” can attend strongly to “trophy” to carry the relevant referent forward.",
    misconception: "Attention weights are useful diagnostics but are not a complete, causal explanation of a model’s reasoning.",
    quiz: { question: "Why divide QKᵀ by √dₖ?", options: ["To add positions", "To keep dot-product magnitudes from making softmax overly saturated", "To remove the causal mask", "To create token IDs"], answer: 1, explanation: "Dot products tend to grow with dimension; scaling stabilizes softmax and its gradients." },
    lab: "attention", prerequisites: ["positional-encoding"]
  },
  {
    id: "layers-of-understanding", track: "architecture", title: "Layers of Understanding", number: 6, duration: 15,
    simple: "A Transformer refines each token’s representation repeatedly: early layers often capture local form, while later layers combine broader and more task-relevant information.",
    deep: "A decoder block typically applies normalized self-attention and an MLP with residual connections. The residual stream accumulates updates rather than replacing the whole representation. LayerNorm or RMSNorm stabilizes activation scale; attention moves information between positions; the MLP applies position-wise nonlinear feature transformations. Probing often finds an early-to-late progression, but capabilities are distributed and reused—not stored as a neat stack of syntax, facts, then reasoning.",
    mentalModel: "It is a drafting table: each layer adds annotations to the same page, with residual paths preserving earlier marks.",
    keyIdeas: ["Attention communicates; MLPs transform", "Residual streams preserve and accumulate", "Representations become contextual across depth"],
    example: "A lower layer may detect quotation marks; a middle layer connects a pronoun to a noun; a later layer makes that relation useful for the next-token decision.",
    misconception: "There is no single “knowledge layer” or “reasoning neuron.” Functions overlap across components and can be redundant.",
    quiz: { question: "What is the main benefit of a residual connection?", options: ["It tokenizes text", "It lets a block add an update while preserving an information path", "It masks future tokens", "It chooses the next token"], answer: 1, explanation: "Residual paths support information and gradient flow by adding learned updates to the existing stream." }, prerequisites: ["attention"]
  },
  {
    id: "learning-to-predict", track: "architecture", title: "Learning to Predict", number: 7, duration: 18,
    simple: "The model learns by predicting a hidden next token, measuring how wrong it was, and nudging its parameters toward the right answer—billions of times.",
    deep: "Teacher forcing supplies the true prefix and computes a distribution for every next position in parallel. Cross-entropy loss −log p(xₜ|x<ₜ) penalizes low probability on the observed token. Backpropagation applies the chain rule to calculate each parameter’s contribution to loss; an optimizer uses those gradients to update weights. Minimizing average next-token loss learns syntax, facts, styles, and latent procedures insofar as they improve prediction, but it does not directly optimize truthfulness or user intent.",
    mentalModel: "Like practicing with answer sheets: attempt every blank, compare confidence with the real answer, then adjust the habits responsible for mistakes.",
    keyIdeas: ["Cross-entropy rewards probability on the target", "Backprop assigns credit through the network", "Teacher forcing trains many positions in parallel"],
    example: "If the target is “blue” and the model gives it probability 0.1, loss is −ln(0.1)≈2.30. At 0.8 probability, loss falls to ≈0.22.",
    misconception: "The model does not receive a simple wrong/right signal only at the final word; training uses a differentiable loss at nearly every token position.",
    quiz: { question: "What happens to cross-entropy loss when target-token probability rises?", options: ["It rises", "It falls", "It stays fixed", "It becomes accuracy"], answer: 1, explanation: "Because loss is −log(probability of the target), assigning the target more probability lowers loss." },
    lab: "prediction", prerequisites: ["layers-of-understanding"]
  },
  {
    id: "instruction-tuning-rlhf", track: "architecture", title: "Instruction Tuning and RLHF", number: 8, duration: 18,
    simple: "Pre-training teaches completion; instruction tuning and human feedback teach the model to respond helpfully to requests.",
    deep: "Supervised fine-tuning trains on prompt–response demonstrations. RLHF traditionally gathers ranked responses, fits a reward model to human preferences, and optimizes a policy—often with PPO—while constraining divergence from a reference model. Modern alternatives such as DPO learn directly from preferred/rejected pairs. These stages reshape behavior rather than reliably add all underlying knowledge. Preference data contains annotator assumptions, and optimizing a proxy can produce reward hacking or style over substance.",
    mentalModel: "Pre-training creates a talented improviser; post-training gives it rehearsals, audience feedback, and rules for performing as an assistant.",
    keyIdeas: ["SFT demonstrates desired responses", "Preference learning compares outputs", "Alignment optimizes proxies with trade-offs"],
    example: "A base model may continue “Explain gravity:” like a web page. An instruction-tuned model recognizes the request and gives a direct, structured explanation.",
    misconception: "RLHF does not make a model objectively aligned with every human value; it aligns behavior to a particular feedback process.",
    quiz: { question: "What is SFT primarily trained on?", options: ["Prompt–response demonstrations", "Only reward scores", "Unlabeled web pages", "Hardware traces"], answer: 0, explanation: "SFT uses curated examples of desired responses; preference optimization adds comparative feedback later." },
    lab: "preference", prerequisites: ["learning-to-predict"]
  },
  {
    id: "gpt2-from-scratch", track: "architecture", title: "GPT-2 from Scratch", number: 9, duration: 30,
    simple: "Building a tiny GPT-2 connects the full pipeline: tokenize text, look up embeddings, add positions, repeat masked Transformer blocks, predict tokens, and train by cross-entropy.",
    deep: "GPT-2 is a decoder-only, pre-LayerNorm Transformer using learned absolute positional embeddings, masked multi-head self-attention, GELU MLPs, residual connections, and a vocabulary projection. A minimal implementation needs careful tensor shapes: token IDs [B,T], hidden states [B,T,d], attention scores [B,h,T,T], and logits [B,T,V]. Weight initialization, batching, optimizer settings, and train/eval separation matter as much as the block equations. Sampling temperature and top-k change generation without changing learned weights.",
    mentalModel: "This is the exploded-view assembly lesson: every previously studied part snaps into one executable loop.",
    keyIdeas: ["Decoder blocks combine masked attention and MLPs", "Training and generation are different loops", "Tensor shapes are the architecture’s practical blueprint"],
    example: "For B=4, T=128, V=50,257, logits have shape [4,128,50,257]. Cross-entropy compares each position’s logits with the next token ID.",
    misconception: "Reproducing the architecture is not reproducing GPT-2’s capability; data scale, compute, optimization, and training time are essential.",
    quiz: { question: "During generation, what happens after sampling one token?", options: ["All weights reset", "The token is appended and the model runs on the enlarged context", "Training restarts", "The tokenizer vocabulary grows"], answer: 1, explanation: "Autoregressive decoding feeds the sampled token back as context, then predicts the following one." },
    prerequisites: ["attention", "learning-to-predict"]
  },
  {
    id: "pretraining-overview", track: "pretraining", title: "Overview", number: 10, duration: 10,
    simple: "Pre-training turns a randomly initialized network into a base model by exposing it to vast token sequences and optimizing next-token prediction.",
    deep: "A pre-training program co-designs model architecture, data mixture, tokenizer, objective, optimizer, distributed system, and evaluation. Tokens flow through repeated forward/backward/update steps across many accelerators. Teams monitor loss, gradient norms, throughput, hardware faults, and evaluation suites. The result is a general conditional model, not yet necessarily a cooperative assistant. Because a full run is expensive and hard to restart, small proxy experiments and scaling predictions reduce risk.",
    mentalModel: "Pre-training is less like one algorithm and more like operating a refinery: raw data, machinery, quality controls, and logistics must work together continuously.",
    keyIdeas: ["Pre-training is a whole system", "Base-model capability comes from scale and data", "Small design errors compound over long runs"],
    example: "A 1T-token run with global batch 4M tokens requires roughly 250,000 optimizer steps; every step must coordinate data and accelerators reliably.",
    misconception: "More compute alone does not guarantee a better model; data quality, optimization stability, and architecture determine how productively compute is used.",
    quiz: { question: "What is the direct artifact of pre-training?", options: ["A base model optimized for its training objective", "A guaranteed safe chatbot", "A tokenizer only", "A reward model"], answer: 0, explanation: "Pre-training produces base weights; assistant behavior is usually shaped in later post-training stages." }, prerequisites: ["gpt2-from-scratch"]
  },
  {
    id: "objectives-details", track: "pretraining", title: "Training Objectives and Architectural Details", number: 11, duration: 20,
    simple: "The objective defines the prediction game; the architecture defines what computations the model can use to win it.",
    deep: "Decoder-only models use causal language modeling; encoder models often use masked-token reconstruction; encoder–decoders can use denoising or span corruption. Causal objectives naturally support open-ended generation and provide a training target at every position. Architecture choices—depth, width, head count, MLP expansion, normalization, activation, context length, and positional scheme—allocate capacity and shape optimization. FLOPs, memory bandwidth, and communication constraints mean mathematically similar designs can train at very different speeds.",
    mentalModel: "The objective writes the exam; the architecture determines the student’s workspace and tools.",
    keyIdeas: ["Objectives shape learned behavior", "Architecture allocates capacity", "Useful design balances quality and hardware efficiency"],
    example: "A masked encoder can use words on both sides to recover a blank; a causal decoder must predict using only the left context, matching generation time.",
    misconception: "Architecture and objective are not interchangeable: a powerful network trained on a mismatched objective can be poor at the desired task.",
    quiz: { question: "Why is causal language modeling a natural fit for generation?", options: ["It sees future answers", "Training conditions on the same left-context pattern used during decoding", "It requires no tokenizer", "It eliminates softmax"], answer: 1, explanation: "Both training and generation predict a next token from prior tokens, though training can parallelize positions with a mask." }, prerequisites: ["pretraining-overview"]
  },
  {
    id: "scaling-laws", track: "pretraining", title: "Scaling Laws and Optimization", number: 12, duration: 22,
    simple: "Scaling laws estimate how model quality improves as parameters, data, and compute grow—and help decide how to spend a fixed compute budget.",
    deep: "Empirical loss often follows approximate power laws plus an irreducible floor as model size N, data D, or compute C increase. Compute-optimal training balances parameter count and training tokens; an oversized, under-trained model wastes capacity, while a tiny model can saturate on too much data. Chinchilla-style results shifted practice toward more tokens per parameter, though inference cost and data limits change the optimal choice. Scaling fits extrapolate trends, not emergent capability guarantees, and depend on dataset and regime.",
    mentalModel: "You have a fixed construction budget: scaling laws estimate the best split between a bigger engine and more fuel for training it.",
    keyIdeas: ["Loss trends predictably within regimes", "Parameters and tokens must be balanced", "Training-optimal and deployment-optimal can differ"],
    example: "With fixed FLOPs, doubling parameters may require fewer training tokens. A scaling study compares candidate sizes on smaller runs before committing the full budget.",
    misconception: "Scaling laws do not prove that every capability appears smoothly or that data quality can be ignored.",
    quiz: { question: "What does compute-optimal scaling try to balance?", options: ["Only model depth", "Model capacity and training data under a compute budget", "Prompt and response length", "SFT and RLHF annotators"], answer: 1, explanation: "The goal is to allocate finite training compute between parameters and tokens efficiently." },
    lab: "scaling", prerequisites: ["objectives-details"]
  },
  {
    id: "data-engineering", track: "pretraining", title: "Training Data Engineering", number: 13, duration: 22,
    simple: "Data engineering turns messy text into a deliberate training diet: collected, filtered, deduplicated, mixed, tokenized, and documented.",
    deep: "Pipelines acquire licensed, public, or generated sources; parse formats; detect language; remove low-quality or unsafe material; redact personal data; deduplicate within and across sources; and mix domains with chosen weights. Near-duplicate removal reduces memorization and benchmark contamination. Quality classifiers and heuristics introduce biases, so audits must examine who and what is removed. Data lineage, consent, copyright, privacy, and evaluation decontamination are governance concerns as well as technical ones.",
    mentalModel: "The dataset is the model’s diet. Calories matter, but ingredients, balance, contamination, and provenance determine health.",
    keyIdeas: ["Filtering and mixing define the learning distribution", "Deduplication improves efficiency and reduces leakage", "Provenance and rights are first-class constraints"],
    example: "If code is 5% of raw tokens but intentionally sampled at 20%, the model receives four times its natural mixture weight—potentially improving code skill while shifting other trade-offs.",
    misconception: "“Publicly accessible” does not automatically mean high quality, private-data-free, licensed, representative, or appropriate to train on.",
    quiz: { question: "Why deduplicate data before training?", options: ["To increase vocabulary size", "To avoid repeatedly spending compute on copies and reduce memorization/leakage", "To create attention masks", "To choose optimizer betas"], answer: 1, explanation: "Duplicates distort the intended mixture and can promote memorization or contaminate evaluation." }, prerequisites: ["scaling-laws"]
  },
  {
    id: "infrastructure", track: "pretraining", title: "Training Infrastructure and Systems", number: 14, duration: 24,
    simple: "Training a large model is a distributed-systems job: many accelerators must behave like one reliable computer for weeks or months.",
    deep: "Data parallelism replicates computation across batches; tensor parallelism splits large matrix operations; pipeline parallelism divides layers; sequence/context parallelism partitions long sequences. ZeRO/FSDP shard optimizer states, gradients, and parameters to control memory. Communication collectives such as all-reduce can bottleneck training, so topology-aware placement and overlapping communication with compute matter. Checkpointing must recover model, optimizer, scheduler, RNG, and data position after failures without corrupting the run.",
    mentalModel: "It is an orchestra across buildings: every section has different notes, but timing and communication determine whether the piece works.",
    keyIdeas: ["Parallelism splits different resource dimensions", "Communication and memory often bottleneck", "Observability and recovery protect expensive runs"],
    example: "Mixed-precision training stores many tensors in BF16 while keeping numerically sensitive operations in higher precision, reducing memory and increasing accelerator throughput.",
    misconception: "Adding twice as many GPUs rarely halves training time; synchronization, input, imbalance, and failures reduce scaling efficiency.",
    quiz: { question: "Which technique splits individual matrix operations across devices?", options: ["Data deduplication", "Tensor parallelism", "Instruction tuning", "Top-p decoding"], answer: 1, explanation: "Tensor parallelism partitions a layer’s large tensor operations; data parallelism instead partitions batches." }, prerequisites: ["data-engineering"]
  },
  {
    id: "advanced-objectives", track: "pretraining", title: "Advanced Pretraining Objectives", number: 15, duration: 18,
    simple: "Beyond plain next-token prediction, models can learn from reconstructed spans, multiple documents, code execution signals, or teacher-generated targets.",
    deep: "Denoising objectives corrupt input and train reconstruction; span corruption teaches multi-token recovery; fill-in-the-middle changes code ordering so models learn to generate inside existing context; retrieval-augmented or multi-document objectives train source use; auxiliary losses can balance MoE routing or predict longer horizons. Each objective changes data construction and may improve one capability while weakening the clean train–inference match of causal modeling. Mixtures therefore need ablations, not intuition alone.",
    mentalModel: "Once basic practice works, vary the drills: complete from the left, repair missing spans, insert code in the middle, and compare documents.",
    keyIdeas: ["Objectives are inductive biases", "Specialized objectives need matching data", "Benefits must be measured against trade-offs"],
    example: "For fill-in-the-middle, code surrounding a removed function body is reordered into prefix, suffix, then missing middle, teaching useful code-editing behavior.",
    misconception: "Adding more objectives is not automatically better; incompatible or poorly weighted losses can dilute learning.",
    quiz: { question: "What capability does fill-in-the-middle directly practice?", options: ["Generating only from an empty prompt", "Inserting content between known prefix and suffix", "Ranking human preferences", "Routing MoE experts"], answer: 1, explanation: "FIM restructures examples so the missing middle is generated using both surrounding regions." }, prerequisites: ["objectives-details"]
  },
  {
    id: "pretraining-evaluation", track: "pretraining", title: "Evaluation During Pretraining", number: 16, duration: 20,
    simple: "Evaluation is the dashboard for a training run: it detects whether the model is learning, generalizing, staying stable, and improving on capabilities that matter.",
    deep: "Validation loss and perplexity provide dense, comparable signals on held-out distributions. Capability benchmarks test code, reasoning, language, and knowledge, but can be noisy, contaminated, or prompt-sensitive. Training health metrics—loss spikes, gradient norms, update ratios, activation statistics, throughput, and data batches—diagnose failures. Good programs use fixed evaluation harnesses, multiple seeds or confidence intervals where feasible, and contamination checks; they distinguish checkpoint selection from final test reporting.",
    mentalModel: "A cockpit needs altitude, fuel, engine temperature, and navigation—not one giant “good model” light.",
    keyIdeas: ["Loss measures objective fit; benchmarks sample capabilities", "Trends and uncertainty matter", "Evaluation can itself be contaminated"],
    example: "Perplexity is exp(average cross-entropy). Lower is better on the same tokenization and distribution, but values across different tokenizers are not directly comparable.",
    misconception: "A benchmark score is not a property of the model alone; prompting, decoding, dataset version, and evaluator all influence it.",
    quiz: { question: "When is perplexity comparison most meaningful?", options: ["Across any two models", "On the same data and compatible tokenization/objective", "Only after RLHF", "Only for MoE models"], answer: 1, explanation: "Per-token loss depends on tokenization and evaluation distribution, so controlled comparisons are essential." }, prerequisites: ["infrastructure"]
  },
  {
    id: "llama3-case-study", track: "pretraining", title: "Case Study — LLaMA 3", number: 17, duration: 24,
    simple: "Llama 3 shows how a familiar decoder-only Transformer can become much stronger through careful data, scale, tokenizer, context, and training-system choices.",
    deep: "Meta reported Llama 3 models using a 128K-token vocabulary, grouped-query attention, a 15T+ token training corpus, and extensive filtering and deduplication. The 8B and 70B base models illustrate data-rich training; later Llama 3.1 extended context and model scale. The lesson is systems co-design: architecture changes were evolutionary, while data quality, scale, parallel training, and evaluations carried much of the gain. Exact recipes should be read from the relevant model card and paper because the family evolved across releases.",
    mentalModel: "A race team can gain more from fuel, telemetry, practice mileage, and execution than from reinventing the engine layout.",
    keyIdeas: ["Strong results can come from disciplined co-design", "Tokenizer and data choices have system-wide effects", "Model-family versions must not be conflated"],
    example: "Grouped-query attention shares key/value heads across multiple query heads, reducing KV-cache memory during inference while retaining multiple query perspectives.",
    misconception: "“Open weights” does not mean every training datum, pipeline detail, or unrestricted usage right is open.",
    quiz: { question: "What broad lesson does Llama 3 best illustrate?", options: ["Architecture is the only lever", "Data, scale, evaluation, and systems can amplify an established architecture", "Post-training replaces pre-training", "A larger vocabulary removes tokenization"], answer: 1, explanation: "Its gains reflect coordinated improvements across the training stack, not one isolated novelty." }, prerequisites: ["pretraining-evaluation"]
  },
  {
    id: "posttraining-overview", track: "posttraining", title: "Overview", number: 18, duration: 10,
    simple: "Post-training takes a capable base model and shapes how it follows instructions, uses tools, handles risk, and communicates with people.",
    deep: "The pipeline commonly combines supervised fine-tuning, preference optimization, safety data, tool-use trajectories, rejection sampling, and targeted evaluation. Data volume is much smaller than pre-training but more behaviorally concentrated. Training must preserve base capabilities while changing response policy; excessive narrow tuning can cause forgetting or brittle style. Iterative evaluation and data collection create a flywheel: discover a failure, design examples, train, and re-evaluate without overfitting the benchmark.",
    mentalModel: "A graduate knows a great deal; post-training is the professional residency that turns knowledge into dependable bedside behavior.",
    keyIdeas: ["Post-training shapes policy and interface behavior", "High-quality examples have high leverage", "Capability, helpfulness, and safety can trade off"],
    example: "A base model can know Python yet fail to return only valid JSON. Focused demonstrations and preference pairs can make formatting far more reliable.",
    misconception: "Post-training cannot reliably manufacture deep missing knowledge from a tiny alignment dataset; it mostly elicits and redirects existing capability.",
    quiz: { question: "Why can a smaller post-training dataset matter so much?", options: ["It changes the tokenizer", "It is concentrated on high-leverage behaviors and response policy", "It retrains every fact", "It removes pre-training"], answer: 1, explanation: "Curated examples directly target how existing capabilities should be expressed." }, prerequisites: ["llama3-case-study"]
  },
  {
    id: "sft", track: "posttraining", title: "Supervised Fine-Tuning", number: 19, duration: 18,
    simple: "SFT teaches by example: given a prompt, the model learns to imitate a high-quality response.",
    deep: "SFT continues language-model training on structured conversations, typically masking user tokens so loss emphasizes assistant outputs. Data may be human-written, model-generated and filtered, or transformed from tasks. Diversity, correctness, and formatting consistency often matter more than raw volume. Learning rates are lower than pre-training; mixtures or replay can reduce forgetting. SFT establishes the policy region from which later preference optimization works—poor demonstrations constrain what preferences can recover.",
    mentalModel: "It is apprenticeship: watch excellent demonstrations, imitate them, then receive more nuanced preference coaching.",
    keyIdeas: ["Demonstrations define desired behavior", "Loss masking chooses what to imitate", "Data quality and diversity dominate"],
    example: "A conversation template marks system, user, and assistant turns. Training loss can be zeroed on prompt tokens and computed only across the chosen assistant answer.",
    misconception: "SFT is not just a dataset format conversion; response quality, task coverage, and loss construction decide what behavior is learned.",
    quiz: { question: "Why mask user tokens in many SFT recipes?", options: ["To hide prompts from the model", "To focus optimization on producing the assistant response", "To reduce vocabulary", "To add positional encoding"], answer: 1, explanation: "The prompt remains input context, while loss is concentrated on the output behavior being demonstrated." }, prerequisites: ["posttraining-overview"]
  },
  {
    id: "preference-optimization", track: "posttraining", title: "Preference Optimization", number: 20, duration: 22,
    simple: "Preference optimization learns from comparisons: for the same prompt, response A is preferred over response B.",
    deep: "RLHF can fit a Bradley–Terry-style reward model where P(A≻B)=σ(r(A)−r(B)), then optimize the policy with PPO under a KL penalty to a reference. DPO algebraically links a preference objective to the policy/reference log-probability ratio, avoiding an explicit reward-model-and-RL loop. Variants differ in reference use, margins, online sampling, and robustness. All inherit preference-data bias; if comparisons reward length, confidence, or pleasing tone, the policy may optimize those proxies.",
    mentalModel: "A coach does not write every ideal performance; they repeatedly point to the better of two attempts until taste becomes behavior.",
    keyIdeas: ["Comparisons can be easier than demonstrations", "KL/reference terms limit destructive drift", "The preference source defines the target"],
    example: "For one question, annotators prefer a concise, sourced response over a confident fabrication. Training raises the relative likelihood of the chosen response.",
    misconception: "A “preferred” answer is not necessarily universally correct or safe; it reflects criteria, raters, sampling, and context.",
    quiz: { question: "What does DPO remove from the classic RLHF pipeline?", options: ["Preference pairs", "The need for an explicit reward-model-plus-PPO stage", "A reference concept", "Token probabilities"], answer: 1, explanation: "DPO directly optimizes a preference loss from chosen and rejected responses, simplifying the pipeline." },
    lab: "preference", prerequisites: ["sft"]
  },
  {
    id: "tools-safety", track: "posttraining", title: "Tools and Safety Tuning", number: 21, duration: 22,
    simple: "Tool tuning teaches a model when and how to call external functions; safety tuning teaches it to handle risky requests without becoming useless.",
    deep: "Tool-use data represents schemas, arguments, observations, and multi-step trajectories. Training must distinguish when to call, which tool to choose, how to validate arguments, and how to use returned evidence. Safety tuning combines policies, adversarial examples, refusals, safe-completion demonstrations, classifiers, and evaluations across over-refusal and under-refusal. Tools introduce prompt injection, excessive agency, data exfiltration, and side effects, so runtime permissions and sandboxing remain necessary—weights alone are not a security boundary.",
    mentalModel: "Giving a model tools is like giving an apprentice keys: teach the procedure, but still install locks, scopes, logs, and supervision.",
    keyIdeas: ["Tool use is a structured action policy", "Safety needs layered defenses", "Helpful refusal should preserve safe assistance"],
    example: "A weather question may require a typed location argument, a tool result, and a grounded summary. A destructive action should require narrower authorization than a read-only lookup.",
    misconception: "A model that usually refuses harmful prompts is not a secure system; adversarial inputs and tool permissions demand external controls.",
    quiz: { question: "Why are runtime permissions still needed after safety tuning?", options: ["Tuning removes tool schemas", "Model behavior is probabilistic and can be manipulated or mistaken", "Permissions improve tokenization", "They increase parameter count"], answer: 1, explanation: "Defense in depth limits consequences when learned behavior fails or is attacked." }, prerequisites: ["preference-optimization"]
  },
  {
    id: "tulu3-case-study", track: "posttraining", title: "Case Study on Tulu 3", number: 22, duration: 22,
    simple: "Tülu 3 is an open post-training recipe showing how curated instruction data, preference learning, reinforcement learning, and rigorous evaluation combine into a strong assistant.",
    deep: "AI2’s Tülu 3 work emphasizes open recipes and artifacts across supervised finetuning, preference optimization, reinforcement learning with verifiable rewards, data curation, and evaluation. It demonstrates that post-training is a staged system: each stage changes the sampling distribution and creates candidates or failure modes for the next. Verifiable domains such as math can use correctness checkers, while open-ended helpfulness still needs human or model judgments. The case also highlights contamination control and reproducible evaluation.",
    mentalModel: "It is a transparent teaching lab: not just the final student, but the lesson plans, grading rubrics, and intermediate checkpoints are available for study.",
    keyIdeas: ["Open recipes improve reproducibility", "Stages must be evaluated jointly", "Verifiable rewards work best where answers can be checked"],
    example: "A math response can receive outcome reward from an exact-answer verifier, then be filtered or optimized without asking a rater to judge every derivation.",
    misconception: "One successful open recipe is not universal; base model, data rights, compute, target domains, and evaluator design change the result.",
    quiz: { question: "Where are verifiable rewards most straightforward?", options: ["Any subjective conversation", "Tasks with machine-checkable outcomes such as some math or code problems", "Tokenization", "Writing style only"], answer: 1, explanation: "A reliable checker supplies a less subjective training signal when the outcome has a testable answer." }, prerequisites: ["tools-safety"]
  },
  {
    id: "distillation", track: "advanced", title: "Distillation", number: 23, duration: 18,
    simple: "Distillation trains a smaller student model to imitate useful behavior or probability patterns from a larger teacher.",
    deep: "Knowledge distillation can match teacher logits with temperature-scaled KL divergence, imitate generated sequences, learn hidden representations, or combine teacher and ground-truth losses. Soft targets expose relationships among alternatives that a one-hot label hides. Sequence-level distillation is practical for black-box teachers but inherits their errors and sampling biases. The student’s limited capacity creates a compression frontier: quality, latency, memory, and data-generation cost must be measured together.",
    mentalModel: "A master writes a compact field guide for an apprentice—preserving the most useful judgments without copying the master’s entire brain.",
    keyIdeas: ["Teachers provide richer targets", "Students trade capacity for efficiency", "Distillation can transfer both skill and error"],
    example: "At higher temperature, a teacher’s 0.90/0.08/0.02 distribution becomes softer, revealing that the second answer is more plausible than the third.",
    misconception: "Distillation does not simply shrink weights; it trains a separate model to reproduce selected teacher behavior.",
    quiz: { question: "What extra information can soft teacher targets provide?", options: ["Only the winning class", "Relative plausibility among non-target alternatives", "A larger tokenizer", "Hardware topology"], answer: 1, explanation: "The full probability distribution encodes similarity and uncertainty absent from a one-hot label." },
    lab: "distillation", prerequisites: ["tulu3-case-study"]
  },
  {
    id: "lora", track: "advanced", title: "LoRA", number: 24, duration: 18,
    simple: "LoRA adapts a frozen model by learning two small low-rank matrices instead of changing every large weight matrix.",
    deep: "For a frozen weight W∈ℝ^(dout×din), LoRA learns ΔW=BA where B∈ℝ^(dout×r), A∈ℝ^(r×din), and r is small. The layer computes Wx + (α/r)BAx. This drastically reduces trainable parameters and optimizer memory; adapters can be swapped or merged into W for inference. Rank, target modules, scaling, dropout, and quantization affect quality. QLoRA combines low-bit frozen weights with higher-precision adapters and memory-saving techniques.",
    mentalModel: "Instead of rewriting a huge encyclopedia, attach a thin set of transparent correction pages that redirect how it is used.",
    keyIdeas: ["The base weights stay frozen", "Low rank constrains the update", "Adapters are cheap to train and portable"],
    example: "A 4096×4096 update has 16.8M values; rank-8 factors need about 65K—roughly 256× fewer trainable values for that matrix.",
    misconception: "LoRA reduces trainable-state memory, but the base model still has to be stored and used unless it is also quantized or otherwise compressed.",
    quiz: { question: "What does LoRA’s rank r control?", options: ["Vocabulary size", "The dimensional bottleneck and capacity of the learned update", "Context length", "Number of training examples"], answer: 1, explanation: "A higher rank gives ΔW more degrees of freedom but uses more trainable parameters and memory." },
    lab: "lora", prerequisites: ["distillation"]
  },
  {
    id: "moe", track: "advanced", title: "Mixture of Experts (MoE)", number: 25, duration: 20,
    simple: "An MoE layer contains many specialist networks, but a router sends each token to only a few—growing parameters without using all of them every time.",
    deep: "Sparse MoE Transformers replace some dense MLPs with E experts and a learned router. Top-k routing selects experts per token, weights their outputs, and keeps active FLOPs below total parameter scale. Auxiliary load-balancing losses, capacity factors, and token dropping prevent hot experts from overflowing. MoE improves training compute efficiency but increases communication, memory footprint, serving complexity, and routing instability. Experts may specialize statistically, though human-interpretable specialization is not guaranteed.",
    mentalModel: "A hospital has many specialists; triage routes each case to two relevant doctors instead of convening the whole staff.",
    keyIdeas: ["Sparse activation separates total from active parameters", "Routing must balance expert load", "Communication and memory remain real costs"],
    example: "A model with 8 experts may route each token to top-2. Only two expert MLPs compute that token, but all expert weights must be stored across the system.",
    misconception: "MoE is not eight independent complete models voting; experts are usually sublayers inside one shared Transformer.",
    quiz: { question: "What is the core efficiency idea of sparse MoE?", options: ["Remove attention", "Activate only a subset of expert parameters per token", "Use no gradients", "Make every token visit every expert"], answer: 1, explanation: "Conditional computation increases parameter capacity while keeping per-token active compute bounded." },
    lab: "moe", prerequisites: ["lora"]
  },
  {
    id: "optimizers", track: "advanced", title: "Optimizers", number: 26, duration: 22,
    simple: "An optimizer converts noisy gradients into controlled parameter updates that make the training loss fall.",
    deep: "SGD updates θ←θ−ηg; momentum averages direction over time. Adam tracks exponential first and second moments, bias-corrects them, and scales each coordinate adaptively. AdamW decouples weight decay from the adaptive gradient update. In LLM training, learning-rate warmup avoids unstable early steps, decay schedules refine late training, gradient clipping limits spikes, and BF16/FP32 state choices affect stability. Optimizer memory can exceed parameter memory, motivating sharding, 8-bit states, or alternative methods.",
    mentalModel: "The gradient points downhill through fog; the optimizer is the vehicle’s steering, suspension, and speed control.",
    keyIdeas: ["Learning rate sets update scale", "Momentum smooths noisy directions", "AdamW adapts per coordinate and decouples decay"],
    example: "If successive gradients alternate +1 and −0.8, raw SGD zigzags; momentum preserves the consistent component and damps oscillation.",
    misconception: "The optimizer does not know the globally best path. It uses local, noisy information and can still diverge or settle poorly.",
    quiz: { question: "Why use learning-rate warmup?", options: ["To expand vocabulary", "To avoid large unstable updates before activation and moment statistics settle", "To add experts", "To mask prompts"], answer: 1, explanation: "Early training statistics are poorly calibrated; gradually raising the step size improves stability." },
    lab: "optimizer", prerequisites: ["learning-to-predict"]
  },
  {
    id: "rl-fundamentals", track: "advanced", title: "RL Fundamentals", number: 27, duration: 22,
    simple: "Reinforcement learning improves a policy using rewards from the outcomes of its actions rather than a correct action label at every step.",
    deep: "An agent observes state s, samples action a from policy πθ(a|s), receives reward, and seeks expected discounted return. Value functions estimate future return; advantages compare an action with a baseline; policy gradients increase log-probability of actions with positive advantage. In language modeling, the state is the prompt plus generated tokens, actions are tokens, and reward often arrives after the response. Credit assignment, exploration, variance, and reward specification are central difficulties.",
    mentalModel: "Supervised learning gives a worked answer key; RL gives a score after the attempt and asks the learner to infer which choices earned it.",
    keyIdeas: ["Policies map states to action distributions", "Return values outcomes; advantage assigns relative credit", "Rewards define what behavior is optimized"],
    example: "REINFORCE uses an estimate like ∇θ log πθ(a|s)·(R−b): sampled actions above the baseline become more likely; below-baseline actions become less likely.",
    misconception: "RL is not inherently more intelligent or aligned than supervised learning; a flawed reward can produce highly effective unwanted behavior.",
    quiz: { question: "What does an advantage estimate express?", options: ["Vocabulary coverage", "How much better an action was than a baseline expectation", "The number of experts", "Tokenizer compression"], answer: 1, explanation: "Advantage provides a relative credit signal that can reduce variance in policy-gradient updates." },
    lab: "rl", prerequisites: ["optimizers"]
  },
  {
    id: "rlhf", track: "advanced", title: "RLHF", number: 28, duration: 24,
    simple: "RLHF uses human comparisons to learn a reward signal, then improves the language-model policy toward that signal while limiting harmful drift.",
    deep: "A classic pipeline starts with SFT, samples multiple responses, gathers preference rankings, fits a reward model, and runs PPO. PPO uses clipped probability ratios or related constraints to prevent one batch from changing the policy too far; a KL penalty to the SFT/reference policy preserves language quality and discourages reward exploitation. Online sampling keeps training data near the current policy but is costly. Reward overoptimization, annotator disagreement, distribution shift, and evaluator gaming make held-out human and safety evaluation essential.",
    mentalModel: "Human judges train a scoring assistant; the writer practices against that score, while a tether stops it from contorting solely to impress the scorer.",
    keyIdeas: ["Preference labels train a reward proxy", "PPO updates the policy conservatively", "KL control and independent evaluation constrain gaming"],
    example: "If a response earns high reward but becomes much more likely than under the reference model, the KL penalty subtracts value, balancing preference gain against policy drift.",
    misconception: "The H in RLHF does not mean humans inspect every final action; humans usually label a dataset that trains a fallible proxy.",
    quiz: { question: "What is the reference-policy KL penalty for?", options: ["Increasing vocabulary", "Discouraging the optimized policy from drifting too far while chasing reward", "Choosing human annotators", "Computing embeddings"], answer: 1, explanation: "The penalty regularizes the policy toward a known baseline and reduces destructive reward overoptimization." },
    lab: "preference", prerequisites: ["rl-fundamentals", "preference-optimization"]
  }
];

export const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson])) as Record<string, Lesson>;

export const curriculumMinutes = lessons.reduce((total, lesson) => total + lesson.duration, 0);
