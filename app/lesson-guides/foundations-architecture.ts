import type { LessonGuide } from "./types";

export const foundationsArchitectureGuides: Record<string, LessonGuide> = {
  introduction: {
    objectives: ["Explain in everyday language what an LLM can help with and why it is worth understanding", "Trace how a prompt becomes a response without assuming human-like understanding", "Choose when an LLM response can be used directly and when outside evidence or authority is required"],
    vocabulary: [
      { term: "Large language model (LLM)", meaning: "A program that uses learned patterns to continue and transform language." },
      { term: "Prompt", meaning: "The instruction and information a person or system gives the model." },
      { term: "Response", meaning: "The text or other structured output the model produces from a prompt." },
      { term: "Evidence", meaning: "Information that can be checked and that supports a claim, such as supplied records or a current trusted source." },
    ],
    sections: [
      { title: "Why this technology is worth opening up", paragraphs: [
        "An LLM can turn rough notes into a clear email, explain an unfamiliar idea at several levels, compare two drafts, translate a paragraph, or help sketch code. One system appears across all of these tasks because language carries instructions, examples, questions, and many forms of knowledge. That range is exciting: instead of learning a separate interface for every text task, you can often describe the job in ordinary language.",
        "The same flexibility makes the system easy to overestimate. A polished response may be based on the prompt, on patterns learned long ago, or on an incorrect but plausible continuation. The useful beginner question is therefore not ‘Is the model intelligent?’ It is ‘What did I give it, what did it produce, and what would I need to check before relying on that output?’",
      ] },
      { title: "A response is built, not looked up whole", paragraphs: [
        "Start with a prompt such as ‘Turn these meeting notes into a friendly three-sentence update.’ The model reads the instruction together with the notes, uses learned language patterns to begin a fitting response, then extends that response piece by piece. The exact representation and mathematics are deliberately deferred: Lesson 6 shows how text is split into pieces, and the architecture lessons show how those pieces influence one another.",
        "This mechanism can create a new response rather than retrieve one fixed answer, but it does not supply every guarantee a useful product needs. Supplied notes can ground a rewrite. A live train status needs a current source. A medical recommendation needs qualified evidence and judgment. Sending a refund needs permission and a confirmed action. The surrounding system and the human user decide which checks belong around the model.",
      ] },
    ],
    walkthrough: [
      { title: "Name the job", body: "The prompt combines a request with any material the response should use: notes to rewrite, a passage to explain, or examples to follow.", checkpoint: "Could another reader tell what output you want and which supplied information it should use?" },
      { title: "Build the response", body: "The model uses learned language patterns and the text available in the prompt to construct a continuation in small pieces.", checkpoint: "The response is newly assembled; that does not make every statement newly verified." },
      { title: "Match the check to the stakes", body: "Inspect whether the task is a transformation of supplied text, a claim about the changing world, expert advice, or an action with consequences.", checkpoint: "The more the answer depends on current facts, specialist judgment, or authority, the stronger the outside check must be." },
    ],
    guidedExample: { title: "One set of notes, three useful jobs", setup: "The supplied note says: ‘Launch moved to Friday. Mira owns the checklist. The accessibility review is still open.’", steps: [
      "Prompt A asks for a friendly team update. A fitting response preserves Friday, Mira, and the open review while changing the tone and structure.",
      "Prompt B asks for unanswered questions. A fitting response asks who will complete the accessibility review and whether the changed launch date affects anything else.",
      "Prompt C asks whether the launch has already happened. The note does not contain today’s date or a live project status, so the model should not pretend the supplied evidence settles that question.",
    ], result: "The model can transform what it is given and expose missing information. Its usefulness grows when the prompt is clear and the required evidence boundary is explicit." },
    practice: { prompt: "You have a two-month-old restaurant list. Which request is safer from the list alone: rewrite it as a compact table, or name which restaurants are open tonight? Explain the extra evidence the second request needs.", hint: "Separate transforming supplied text from making a claim about a changing condition.", answer: "Reformatting the old list can use the supplied text alone, while claiming a restaurant is open tonight requires a current, trustworthy source such as the restaurant’s live listing or direct confirmation. A fluent answer cannot make the old list current." },
    resources: [
      { title: "What are LLMs?", url: "https://huggingface.co/learn/agents-course/en/unit1/what-are-llms", kind: "Course", note: "A beginner-friendly explanation with an interactive decoding example." },
      { title: "But what is a GPT?", url: "https://www.3blue1brown.com/lessons/gpt", kind: "Video", note: "A visual account of tokens, embeddings, and repeated next-token prediction." },
      { title: "Intro to Large Language Models", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", kind: "Video", note: "Andrej Karpathy’s broad technical orientation to the full LLM stack." },
    ],
  },

  "tensors-shapes": {
    objectives: ["Explain why LLMs represent many text positions with tensors and read their common shapes", "Predict the output of a matrix multiplication", "Explain broadcasting and why silent shape errors are dangerous"],
    vocabulary: [
      { term: "Tensor", meaning: "A multidimensional array of numbers with a data type and shape." },
      { term: "Axis", meaning: "One dimension of a tensor, such as batch, token position, or feature." },
      { term: "Text position", meaning: "One numbered slot in an already-divided prompt; Lesson 6 explains how tokenization creates those slots." },
      { term: "Feature", meaning: "One numerical coordinate carried for a text position. A single coordinate usually has no simple human-readable meaning." },
      { term: "Dot product", meaning: "A sum of elementwise products that measures how two equal-length vectors align." },
      { term: "Broadcasting", meaning: "Applying a smaller tensor across compatible dimensions without manually copying it." },
    ],
    sections: [
      { title: "Why a language model needs tensors at all", paragraphs: [
        "The introduction said that an LLM builds a response one piece at a time. That simple description hides the numerical work: before the model can choose a next piece, it must hold numerical descriptions of the text positions it can currently see and pass those descriptions through learned transformations. A tensor is the container that lets the program process many positions—and many prompts—in one consistent operation.",
        "Suppose two prompts have already been divided into three text positions each. Their integer IDs can be arranged as $[B,T]=[2,3]$: batch $B$ counts prompts and time $T$ counts positions within each prompt. After a later embedding lookup gives every position $d=4$ numerical features, the hidden state is $X[B,T,d]=X[2,3,4]$. Naming the axes matters more than memorizing the number of dimensions: $[2,3,4]$ means something different if 2 counts attention heads rather than prompts.",
        "This numerical lesson comes before the architecture so later diagrams are readable instead of magical. Lesson 6 explains how text becomes position IDs; Lesson 7 turns each ID into a feature vector; attention and MLP layers repeatedly project $[B,T,d]$ states; and the output head produces one score per possible next piece. The remaining Foundations lessons then explain how those scores become a loss, how the loss produces gradients, and how an optimizer updates the learned matrices. Tensors are the shared language connecting that whole path, not a detached mathematics detour.",
      ] },
      { title: "Matrix multiplication applies one learned transformation everywhere", paragraphs: [
        "Most Transformer operations keep the prompt and position axes while changing the features carried at each position. A linear layer stores a learned weight $W[d,d_{out}]$ and computes $$[B,T,d] \\times [d,d_{out}] \\to [B,T,d_{out}].$$ The matching $d$ labels identify the feature axis that is combined; $B$ and $T$ are not combined, so they survive. The new $d_{out}$ axis names the output feature width.",
        "Each output feature is a dot product between one position's input vector and one learned column of the weight matrix. If a position has four input features and the matrix produces six outputs, the layer performs six four-term dot products for that position. The same matrix is reused at every position: attention uses projections to form queries, keys, and values; an MLP uses projections to expand and contract features; and the output head projects features into vocabulary scores. The arithmetic is the same, while the learned weights and purpose differ.",
      ] },
      { title: "A runnable shape can still encode the wrong idea", paragraphs: [
        "Broadcasting often adds a bias $[d_{out}]$ to every $[B,T,d_{out}]$ position or reuses one scale per position across its features. It is convenient precisely because no explicit copies are needed. It is also easy to misuse: a technically compatible axis can broadcast while representing the wrong concept. Good practice is to annotate axes, assert shapes at boundaries, and test with unequal dimensions so accidental swaps cannot hide.",
      ] },
    ],
    walkthrough: [
      { title: "Start from the response-building job", body: "Treat the prompt as already divided into positions. The model needs one changing numerical state for every visible position before it can score what comes next.", checkpoint: "This lesson takes the text division as an input; Lesson 6 explains how a tokenizer chooses it." },
      { title: "Name every axis", body: "Translate $X[2,3,4]$ into words: two prompts, three text positions per prompt, and four features per position.", checkpoint: "Changing $B$ groups more prompts; it does not add positions to a prompt or enlarge each feature vector." },
      { title: "Match the learned transformation", body: "For $X[B,T,d]$ and $W[d,m]$, the shared $d$ feature axis is summed over in every dot product. Batch and position survive, while output width $m$ replaces input width $d$.", checkpoint: "Predict $Y[B,T,m]$ before code runs; $XW$ is invalid for a written weight $W[m,d]$ unless that weight is transposed." },
      { title: "Locate the same pattern in an LLM", body: "Carry the shape contract into attention projections, MLP layers, and the vocabulary output head. Each uses different learned weights but applies them across all current text positions.", checkpoint: "Matrix multiplication explains how representations change; it does not by itself explain what a feature means or whether an output is true." },
    ],
    guidedExample: { title: "Project two text positions by hand", setup: "A toy prompt has already been divided into the two positions ‘red’ and ‘fox’. Their made-up hidden vectors are $X=[[1,2],[3,1]]$. The displayed shape is $[T,d]=[2,2]$; treating it as one batched prompt gives $[B,T,d]=[1,2,2]$. Let $W=[[2,0,1],[1,1,-1]]$ with shape $[d,m]=[2,3]$. These numbers are a deterministic arithmetic fixture, not measured features from a trained model.", steps: [
      "For the ‘red’ position $[1,2]$, output feature 1 is $1\\times2+2\\times1=4$; feature 2 is $1\\times0+2\\times1=2$; feature 3 is $1\\times1+2\\times(-1)=-1$.",
      "For the ‘fox’ position $[3,1]$, the same three learned columns produce dot products 7, 1, and 2. The matrix is reused rather than replaced with a different transform for the second position.",
      "The displayed output is $[[4,2,-1],[7,1,2]]$ with shape $[T,m]=[2,3]$. Restoring the batch axis gives $[B,T,m]=[1,2,3]$: the prompt still has two positions, while each position's numerical description changes from two features to three.",
    ], result: "This is the recurring LLM pattern: keep the prompt and position axes, then use learned matrices to change the features carried at every position. Later lessons assign distinct jobs to those projections inside attention, MLPs, and next-piece scoring." },
    practice: { prompt: "An LLM hidden state $X$ has shape $[2,3,4]$. Compare adding feature bias $[4]$ with adding position offsets $[3,1]$. What output shape does each produce, and what different meaning does each broadcast encode?", hint: "Both can expand to $[2,3,4]$. Track whether the reused values belong to features or text positions.", answer: "Both operations produce $[2,3,4]$. Bias $[4]$ supplies one offset per feature and reuses those four values at every prompt-position location. Offsets $[3,1]$ supply one value per text position and repeat that value across all four features and both prompts. Both shapes run, but substituting one for the other changes the computation's meaning." },
    resources: [
      { title: "Tensors", url: "https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html", kind: "Documentation", note: "PyTorch’s hands-on introduction to shapes, indexing, devices, and operations." },
      { title: "Matrices as transformations", url: "https://www.3blue1brown.com/lessons/linear-transformations", kind: "Video", note: "Build geometric intuition for what a learned matrix does to vectors." },
      { title: "CS336 resource accounting", url: "https://github.com/stanford-cs336/lectures/blob/main/lecture_02.py", kind: "Course", note: "A deeper bridge from tensor shapes to memory and compute accounting." },
    ],
  },

  "probability-softmax": {
    objectives: ["Convert logits into probabilities conceptually and numerically", "Interpret cross-entropy as surprise assigned to the target", "Distinguish entropy, cross-entropy, perplexity, and calibration"],
    vocabulary: [
      { term: "Logit", meaning: "An unrestricted model score before normalization." },
      { term: "Softmax", meaning: "A function that exponentiates relative scores and normalizes them to sum to one." },
      { term: "Cross-entropy", meaning: "For one target token, the negative logarithm of the probability assigned to that target." },
      { term: "Perplexity", meaning: "The exponential of average token cross-entropy on a specified dataset and tokenization." },
    ],
    sections: [
      { title: "Scores first, probabilities second", paragraphs: [
        "A language model does not directly output percentages. Its final layer produces one logit for each vocabulary token. Logits can be negative, positive, large, or small; only their differences matter. Softmax exponentiates those differences so high-scoring tokens receive more mass, then divides by the total so every probability is non-negative and the whole distribution sums to one.",
        "Subtracting the maximum logit before exponentiation is a numerical trick with no mathematical effect on the probabilities. Softmax is invariant to adding the same constant to every score. Multiplying all logits changes their gaps and therefore the sharpness, which is why temperature works by scaling logits before softmax. Sharpness is not the same as correctness or calibrated confidence.",
      ] },
      { title: "Loss turns a distribution into a learning signal", paragraphs: [
        "Training knows the actual next token from the text. Cross-entropy asks how much probability the model gave that token. If p_target is 0.8, the loss -ln(0.8) is small; if it is 0.01, the loss is large. The logarithm strongly penalizes confidently neglecting the target while still giving a smooth gradient for every possible probability.",
        "Entropy describes how spread out one distribution is; cross-entropy compares predictions with targets. Perplexity exponentiates average cross-entropy, but comparisons are meaningful only on compatible data and tokenization. Calibration asks a different question: among predictions labelled 80% confident, are roughly 80% correct? Softmax normalization alone does not guarantee that relationship.",
      ] },
    ],
    walkthrough: [
      { title: "Compare relative logits", body: "A token at logit 4 outranks one at logit 2 by two units. Adding 100 to both changes neither ordering nor probability ratio.", checkpoint: "Softmax cares about gaps, not an absolute zero point." },
      { title: "Normalize the candidates", body: "Exponentiation turns score differences into positive ratios; division by their sum makes a distribution.", checkpoint: "Raising one logit steals probability mass from the others because the total remains one." },
      { title: "Score the observed target", body: "Cross-entropy selects the observed target’s probability and computes its negative logarithm. Raising that probability lowers surprise; assigning it almost no probability makes the penalty large.", checkpoint: "This lesson defines the penalty. The next lesson explains how parameter sensitivities turn that penalty into learning updates." },
    ],
    guidedExample: { title: "Why confident mistakes hurt more", setup: "Compare two predictions for the correct token ‘Paris’. Model A assigns 0.6; Model B assigns 0.06.", steps: [
      "Model A’s token loss is $-\\ln(0.6)\\approx0.51$.",
      "Model B’s token loss is $-\\ln(0.06)\\approx2.81$, more than five times larger.",
      "If both examples appear in a batch, Model B’s error contributes a much stronger correction because it treated the observed target as very unlikely.",
    ], result: "Cross-entropy measures probability assigned to the actual token, not whether the top guess alone was right. It preserves information about degrees of confidence." },
    practice: { prompt: "The logits [2,1,0] and [12,11,10] produce what relationship between their softmax probabilities? What changes if they become [4,2,0]?", hint: "First compare adding a constant; then compare multiplying score gaps.", answer: "[2,1,0] and [12,11,10] give identical probabilities because every score increased by 10. [4,2,0] is sharper because the differences doubled, concentrating more probability on the first token." },
    resources: [
      { title: "Softmax regression", url: "https://d2l.ai/chapter_linear-classification/softmax-regression.html", kind: "Course", note: "A careful derivation of logits, softmax, likelihood, and cross-entropy." },
      { title: "CrossEntropyLoss", url: "https://pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html", kind: "Documentation", note: "The exact API semantics used in most PyTorch language-model training loops." },
      { title: "Attention in transformers", url: "https://www.3blue1brown.com/lessons/attention/", kind: "Video", note: "Visualizes softmax as the normalization step inside attention." },
    ],
  },

  "gradients-backprop": {
    objectives: ["Trace a forward and backward computation graph", "Apply the chain rule to a simple parameter", "Explain why backpropagation and optimization are separate"],
    vocabulary: [
      { term: "Gradient", meaning: "A collection of partial derivatives describing local loss sensitivity to parameters." },
      { term: "Computation graph", meaning: "Operations and intermediate values linking inputs and parameters to a final output or loss." },
      { term: "Backpropagation", meaning: "Reverse-mode differentiation that propagates an upstream derivative through local operations." },
      { term: "Activation", meaning: "An intermediate value produced during the forward pass, often saved for backward computation." },
    ],
    sections: [
      { title: "Learning begins with sensitivity", paragraphs: [
        "A model parameter matters only through the operations connecting it to the loss. The forward pass records those operations: multiply an input by a weight, add a bias, apply a nonlinearity, compare the prediction with a target. A derivative answers a local counterfactual: if this value increased by a tiny amount, approximately how would the final loss change? The sign gives direction and the magnitude gives local sensitivity.",
        "With billions of parameters, computing each derivative by perturbing one weight would be impossibly expensive. Reverse-mode automatic differentiation reuses the computation graph. Starting from $dL/dL=1$, it moves backward and combines upstream sensitivity with each operation’s local derivative. This is efficient because one scalar loss sends credit information to every parameter in roughly the cost of another forward pass.",
      ] },
      { title: "The chain rule is credit assignment", paragraphs: [
        "Suppose $w$ affects $y$, and $y$ affects $L$. The chain rule says $$\\frac{dL}{dw}=\\frac{dL}{dy}\\frac{dy}{dw}.$$ The first factor describes how the loss responds to $y$; the second describes how $y$ responds to $w$. Multiplying them connects the responsibility through both links. In a deep model the same principle repeats through long paths, while branches add gradient contributions when a value influences the loss in multiple ways.",
        "Backpropagation only computes gradients. It does not decide the learning rate, maintain momentum, clip the update, or guarantee that loss will fall after a large step. Those are optimizer and training-system responsibilities. Gradient checks, activation statistics, and finite-value monitoring help diagnose saturated activations, exploding paths, precision underflow, and implementation mistakes.",
      ] },
    ],
    walkthrough: [
      { title: "Run the forward graph", body: "Compute each intermediate value and the loss, saving what backward formulas will need.", checkpoint: "No parameter changes during the forward pass." },
      { title: "Seed and propagate", body: "Begin at the scalar loss with derivative 1, then multiply by local derivatives as you move toward parameters.", checkpoint: "At a branch, gradient contributions add because both paths affected the loss." },
      { title: "Inspect before updating", body: "The resulting gradients can contain NaN, extreme values, or zeros. The optimizer consumes them only after validation or clipping.", checkpoint: "A correct gradient is a local slope, not a safe step size." },
    ],
    guidedExample: { title: "Two links of the chain rule", setup: "Let $a=wx$, $y=a^2$, and $L=(y-t)^2$ with $x=2$, $w=1$, $t=1$.", steps: [
      "Forward: $a=2$, $y=4$, $L=9$.",
      "Backward: $dL/dy=2(y-t)=6$; $dy/da=2a=4$; $da/dw=x=2$.",
      "Multiply the path: $dL/dw=6\\times4\\times2=48$. A tiny increase in $w$ would sharply increase loss at this point, so descent moves $w$ downward.",
    ], result: "Backpropagation decomposes a complicated derivative into small local rules. Every saved intermediate has a concrete role in calculating credit." },
    practice: { prompt: "For $y=wx+b$ and $L=(y-t)^2$, derive $dL/db$ and $dL/dw$. Why are they different even though $w$ and $b$ both affect $y$?", hint: "Both share $dL/dy$. Compare $dy/db$ with $dy/dw$.", answer: "$dL/dy=2(y-t)$. Because $dy/db=1$, $dL/db=2(y-t)$. Because $dy/dw=x$, $dL/dw=2(y-t)x$. The weight’s influence is scaled by the input; the bias always shifts $y$ one-for-one." },
    resources: [
      { title: "The spelled-out intro to neural networks and backpropagation", url: "https://www.youtube.com/watch?v=VMj-3S1tku0", kind: "Video", note: "Builds a tiny autograd engine from scalar operations so every chain-rule step is visible." },
      { title: "Automatic differentiation with torch.autograd", url: "https://pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html", kind: "Documentation", note: "Connects computation graphs and gradients to practical PyTorch code." },
      { title: "Neural networks", url: "https://www.3blue1brown.com/topics/neural-networks", kind: "Video", note: "Visual intuition for activations, gradient descent, and backpropagation." },
    ],
  },

  optimizers: {
    objectives: ["Turn a gradient into an explicit parameter update", "Compare SGD, momentum, Adam, and AdamW conceptually", "Diagnose learning-rate and optimizer-state problems"],
    vocabulary: [
      { term: "Learning rate", meaning: "The main scale applied to an update." },
      { term: "Momentum", meaning: "A moving average of past gradients that smooths direction over steps." },
      { term: "Adaptive update", meaning: "An update scaled separately for different parameter coordinates using gradient statistics." },
      { term: "Weight decay", meaning: "A regularizing shrinkage of parameters, decoupled from Adam’s gradient scaling in AdamW." },
    ],
    sections: [
      { title: "A gradient is advice, not motion", paragraphs: [
        "After backpropagation, every trainable parameter has a local slope. Plain stochastic gradient descent applies $$\\theta \\leftarrow \\theta-\\eta g.$$ The negative sign moves opposite the direction of increasing loss, and $\\eta$ controls how far. Mini-batch gradients are noisy estimates of the full-data direction, which can help exploration but also makes raw updates zigzag and occasionally spike.",
        "A learning rate that is too small wastes compute and may stall before reaching a useful region. One that is too large can bounce across a valley, destroy previously useful features, or produce numerical overflow. Warmup gradually raises the rate while activations and optimizer statistics settle; decay lowers it later so training can refine rather than continue making coarse moves.",
      ] },
      { title: "State turns slopes into a policy", paragraphs: [
        "Momentum averages recent gradients, preserving consistent direction while damping alternating noise. Adam maintains a first moment resembling momentum and a second moment of squared gradients. Dividing by the square-root second moment gives coordinates with different historical scales different effective step sizes. Bias correction matters early because moving averages begin at zero.",
        "AdamW separates weight decay from the adaptive gradient calculation, avoiding an interaction that makes ordinary L2 regularization behave differently across coordinates. Optimizer state consumes substantial memory—often multiple full-precision values per parameter—so distributed sharding or low-bit states may be required. Changing an optimizer changes both learning dynamics and system cost.",
      ] },
    ],
    walkthrough: [
      { title: "Read the gradient", body: "Check its sign, norm, and finite values. A positive gradient means increasing that parameter locally raises loss.", checkpoint: "Descent subtracts the gradient; it does not follow it uphill." },
      { title: "Combine optimizer state", body: "Momentum or Adam mixes the current gradient with stored history, producing an update direction and coordinate-wise scale.", checkpoint: "Two equal current gradients can yield different updates if their histories differ." },
      { title: "Apply the scheduled step", body: "Learning-rate schedule, clipping, decay, precision, and distributed synchronization shape the final parameter change.", checkpoint: "The logged gradient norm and parameter-update norm answer different questions." },
    ],
    guidedExample: { title: "Why momentum calms a ravine", setup: "Imagine gradients over three steps: (4,1), (-3,1), (4,1). The first coordinate oscillates while the second consistently points upward.", steps: [
      "Raw SGD alternates strongly left and right in coordinate one, wasting distance.",
      "A moving average cancels part of +4,-3,+4 while accumulating the repeated +1 signal in coordinate two.",
      "The resulting path moves more steadily along the valley and less aggressively across it.",
    ], result: "Optimizer state can distinguish persistent signal from oscillation. It cannot know the global optimum; it only summarizes local history." },
    practice: { prompt: "Training loss is stable during warmup, then becomes NaN immediately after the learning rate peaks. Name three checks and one likely intervention.", hint: "Separate gradient scale, activation/precision health, and update scale.", answer: "Check gradient norms for spikes, activations/loss-scale for overflow, and update-to-parameter ratios. Verify data and distributed synchronization too. A likely intervention is lowering the peak rate or extending warmup; gradient clipping or higher-precision sensitive operations may address the observed mechanism, but should not replace diagnosis." },
    resources: [
      { title: "Optimization algorithms", url: "https://d2l.ai/chapter_optimization/index.html", kind: "Course", note: "Visual and mathematical treatments of SGD, momentum, adaptive methods, and schedules." },
      { title: "Adam: A Method for Stochastic Optimization", url: "https://arxiv.org/abs/1412.6980", kind: "Paper", note: "The original Adam algorithm, including moment estimates and bias correction." },
      { title: "Optimization loop", url: "https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html", kind: "Documentation", note: "Shows loss, zeroing gradients, backward, and optimizer step in code." },
    ],
  },

  tokenization: {
    objectives: ["Explain why models use tokens instead of raw words", "Trace encode and decode through a subword vocabulary", "Predict how tokenization affects cost, languages, and model behavior"],
    vocabulary: [
      { term: "Vocabulary", meaning: "The finite set of token pieces assigned integer IDs." },
      { term: "Subword", meaning: "A reusable fragment smaller than a word or spanning common character sequences." },
      { term: "BPE", meaning: "A family of tokenization algorithms that repeatedly merges frequent adjacent pieces." },
      { term: "Special token", meaning: "A reserved marker for roles, boundaries, padding, or control rather than ordinary visible text." },
    ],
    sections: [
      { title: "Text must become a finite alphabet", paragraphs: [
        "Neural networks operate on numbers, but assigning one ID to every possible word fails immediately: languages create new words, spelling varies, code contains arbitrary names, and no vocabulary can enumerate every string. Character or byte tokens cover everything but make sequences long. Subword tokenization compromises by giving common strings larger pieces and composing rare strings from smaller pieces.",
        "A tokenizer is trained before the language model. BPE-like methods begin with small units and merge frequent neighbors; Unigram methods start with candidates and prune them probabilistically. The finished encoder deterministically maps text to IDs, and the decoder reconstructs text. The language model never sees the original characters directly unless the token scheme exposes them.",
      ] },
      { title: "Token boundaries shape the task", paragraphs: [
        "Context windows, API prices, and training compute are measured in tokens. A phrase represented by twice as many tokens consumes twice as many positions and requires more prediction steps. Rare scripts, whitespace conventions, casing, source code, and numbers can tokenize unevenly. This creates practical disparities across languages and makes operations such as spelling and arithmetic harder when meaningful units are fragmented unpredictably.",
        "Vocabulary size trades sequence length against the embedding and output tables. A larger vocabulary can shorten frequent text but adds parameters and leaves rare entries poorly trained. Special tokens serialize system, user, assistant, tool, and end-of-sequence boundaries; changing the chat template changes the actual token sequence. Tokenizer and model are therefore a matched pair, not interchangeable accessories.",
      ] },
    ],
    walkthrough: [
      { title: "Normalize and pre-tokenize", body: "Depending on the tokenizer, Unicode normalization, spaces, and coarse word boundaries are handled before learned pieces are selected.", checkpoint: "Changing case or a leading space can change IDs even when a human reads the same word." },
      { title: "Choose vocabulary pieces", body: "The encoder finds a valid segmentation according to BPE merges, Unigram probabilities, WordPiece scores, or byte rules.", checkpoint: "The chosen pieces must come from a finite stored vocabulary." },
      { title: "Map pieces to IDs", body: "Each piece becomes an integer used to look up an embedding. Decoding reverses IDs to pieces and joins them according to tokenizer rules.", checkpoint: "ID 42 has no universal meaning; it belongs to one specific tokenizer vocabulary." },
    ],
    guidedExample: { title: "A rare word versus a common phrase", setup: "Imagine the vocabulary contains ‘play’, ‘ing’, ‘ player’, and ‘un’, but not ‘unplayable’.", steps: [
      "‘ player’ may be one token because the leading-space phrase is common in training text.",
      "‘playing’ can become ‘play’ + ‘ing’, reusing two familiar pieces.",
      "‘unplayable’ might become ‘un’ + ‘play’ + smaller byte or character pieces for ‘able’. The model must combine more positions to interpret it.",
    ], result: "Token count reflects learned string frequency, not word count or conceptual complexity. The same meaning can have very different computational representation across spellings and languages." },
    practice: { prompt: "Two tokenizers encode the same 2,000-word document as 2,600 versus 4,100 tokens. Give three downstream consequences.", hint: "Think context capacity, compute/price, and the number of prediction decisions.", answer: "The second encoding consumes more of the context window, costs more attention/serving work and often more API tokens, and creates more autoregressive steps to generate comparable text. Its smaller pieces may improve coverage of rare strings but can make long-range composition and evaluation comparisons different." },
    resources: [
      { title: "The tokenization pipeline", url: "https://huggingface.co/learn/llm-course/en/chapter6/4", kind: "Course", note: "Walks through normalization, pre-tokenization, models, and post-processing." },
      { title: "SentencePiece", url: "https://arxiv.org/abs/1808.06226", kind: "Paper", note: "A primary source for language-independent subword tokenization from raw sentences." },
      { title: "Let’s build the GPT Tokenizer", url: "https://www.youtube.com/watch?v=zduSFxRajkE", kind: "Video", note: "A code-first explanation of Unicode, bytes, BPE training, encoding, and decoding." },
    ],
  },

  "embedding-layer": {
    objectives: ["Explain an embedding lookup as a learned table row", "Distinguish static token embeddings from contextual hidden states", "Interpret similarity cautiously in a high-dimensional space"],
    vocabulary: [
      { term: "Embedding", meaning: "A learned dense vector representing a discrete item such as a token." },
      { term: "Embedding matrix", meaning: "A table [vocabulary size, model width] with one row per token ID." },
      { term: "Cosine similarity", meaning: "A normalized measure of directional alignment between two vectors." },
      { term: "Weight tying", meaning: "Reusing the input embedding matrix for the output vocabulary projection." },
    ],
    sections: [
      { title: "From arbitrary ID to useful coordinates", paragraphs: [
        "Token IDs are arbitrary labels: ID 900 is not more meaningful than ID 12. The embedding matrix converts each ID into d learned numbers. Looking up token i simply selects row i; it is equivalent to multiplying a one-hot vocabulary vector by the table, but far cheaper. For a sequence [B,T], the lookup returns [B,T,d].",
        "During training, gradients update rows involved in the batch. Tokens that need similar predictive behavior often develop related directions because the same downstream layers must process them usefully. This is distributional learning: ‘doctor’ and ‘nurse’ may become related because they occur in overlapping contexts, not because a human assigned a medical category.",
      ] },
      { title: "A lookup is only the starting state", paragraphs: [
        "The raw embedding for ‘bank’ is identical in ‘river bank’ and ‘bank loan’. Position information and later context-mixing layers then read surrounding token positions and compute an updated state for each position, producing different hidden states for the two uses. Later lessons split that mixing into attention, which moves information between positions, and an MLP, which transforms combined features at one position. Calling every value an embedding can cause confusion, so it helps to say token embedding for the table row and contextual representation for a later layer’s state.",
        "Similarity is useful but not a complete explanation. Meaning can be distributed across directions, distance metrics can disagree, and high-dimensional neighborhoods inherit biases from data. Weight tying reuses the table as the output projection: hidden states are compared with vocabulary directions to produce logits. Tying saves parameters and links the spaces, but is a design choice rather than a law.",
      ] },
    ],
    walkthrough: [
      { title: "Select a row", body: "Each integer token ID indexes exactly one vector in E[V,d]. A repeated ID begins with the same vector every time.", checkpoint: "No surrounding words are consulted during the raw lookup." },
      { title: "Add order and context", body: "Position information marks where the token occurs. Later context-mixing layers read surrounding positions and transform their combined features, writing a context-dependent update for each token; later lessons name those two operations attention and the MLP.", checkpoint: "Polysemy is resolved after lookup, not by storing a separate row for every meaning." },
      { title: "Project back to vocabulary", body: "The final hidden vector is multiplied by an output matrix—sometimes the same embedding table transposed—to score candidate tokens.", checkpoint: "A high dot product means alignment with an output direction, not independently verified semantic truth." },
    ],
    guidedExample: { title: "One token, two contexts", setup: "Trace ‘bat’ in ‘the bat flew at dusk’ and ‘swing the bat hard’.", steps: [
      "Both occurrences select the same raw row E[bat].",
      "In the first sentence, attention can import features from ‘flew’ and ‘dusk’; in the second, from ‘swing’ and ‘hard’.",
      "After several layers, the two positions occupy different contextual states even though they share the same starting vector.",
    ], result: "The embedding table stores reusable lexical starting points. Contextual meaning is computed dynamically by the network that follows." },
    practice: { prompt: "Why would nearest neighbors in the raw embedding table differ from nearest neighbors among final hidden states for one sentence?", hint: "Ask what information each representation has seen.", answer: "Raw embeddings only encode the learned type-level token row. Final states include position and surrounding tokens, so their geometry reflects the current use. A contextual ‘bank’ near ‘river’ can align with geographical concepts even if its raw row also reflects finance." },
    resources: [
      { title: "Behind the pipeline", url: "https://huggingface.co/learn/llm-course/en/chapter2/2", kind: "Course", note: "Explains token embeddings, hidden states, model width, and task heads." },
      { title: "Efficient Estimation of Word Representations", url: "https://arxiv.org/abs/1301.3781", kind: "Paper", note: "The word2vec paper that popularized learned distributional vector geometry." },
      { title: "But what is a GPT?", url: "https://www.3blue1brown.com/lessons/gpt", kind: "Video", note: "Visually follows tokens into a high-dimensional embedding space." },
    ],
  },

  "positional-encoding": {
    objectives: ["Explain why content-only attention cannot determine order", "Compare absolute, relative, and rotary position signals", "Describe how position design affects long-context behavior"],
    vocabulary: [
      { term: "Permutation equivariance", meaning: "For unmasked, content-only self-attention, reordering inputs produces the same reordering of outputs when no position signal is present." },
      { term: "Absolute position", meaning: "A signal attached to a specific index such as position 37." },
      { term: "Relative position", meaning: "A signal based on the displacement between two token positions." },
      { term: "RoPE", meaning: "Rotary position embedding, which rotates query/key coordinate pairs by position-dependent angles." },
    ],
    sections: [
      { title: "Content-only attention has a permutation symmetry", paragraphs: [
        "Unmasked, content-only self-attention compares token-derived queries and keys. If the same token vectors are rearranged and no position signal exists, the calculation rearranges in exactly the same way; it has no basis for recovering the original index. A decoder's causal mask is different: it breaks this symmetry because a query may read only itself and earlier positions. That supplies an earlier-versus-later access direction, but it is not a reusable absolute-index or pairwise-distance geometry. ‘Dog bites person’ and ‘Person bites dog’ contain the same items but require different interpretations, so richer order information still enters through the representation or attention scores.",
        "Learned absolute embeddings add a table row for position 0, 1, 2, and so on. Sinusoidal features compute smooth waves at different frequencies. Relative biases directly modify attention according to distance. Each choice tells the model about order in a different geometry and carries different assumptions about positions beyond those seen in training.",
      ] },
      { title: "RoPE writes relative displacement into a dot product", paragraphs: [
        "RoPE groups query and key coordinates into pairs and rotates each pair by an angle determined by position and frequency. When a rotated query is dotted with a rotated key, the score depends on their angle difference, which corresponds to relative displacement. Many frequency pairs let the model represent both short and long patterns. Values are usually not rotated because the position effect is introduced when deciding where to attend.",
        "No positional method guarantees unlimited context. Training length, frequency scaling, attention patterns, data, cache memory, and evaluation all matter. Extending a context window can preserve syntax while losing retrieval accuracy in the middle or overemphasizing recent tokens. Position design creates an opportunity to generalize; it does not certify useful use of every advertised position.",
      ] },
    ],
    walkthrough: [
      { title: "Start with token content", body: "The lookup vector says which token is present but not where this occurrence sits in the sequence.", checkpoint: "Two copies of the same token begin with identical lookup vectors." },
      { title: "Inject position geometry", body: "Add an absolute vector, relative bias, or rotation so position can change representations or attention scores.", checkpoint: "Position information is numerical structure the layers must learn to use—not grammar by itself." },
      { title: "Evaluate beyond training length", body: "Test retrieval, ordering, and generation across positions and lengths rather than assuming the formula extrapolates behavior.", checkpoint: "A model accepting 128k tokens can still neglect evidence inside that window." },
    ],
    guidedExample: { title: "Reorder the same content", setup: "Compare the same three token vectors in two orders: [dog, chased, cat] and [cat, chased, dog]. No token is added, removed, or replaced.", steps: [
      "With unmasked, content-only attention and no varying position signal, the output states merely follow the input permutation. The calculation cannot identify which ordering was the original one.",
      "A causal mask changes that result: the token at position 0 may read only itself, while the final token may read the whole prefix. The mask therefore adds directional access, so masked decoder attention is not covered by the unmasked permutation-equivariance claim.",
      "A varying absolute, relative, or rotary signal adds index or distance geometry. Layers can then distinguish who appeared before whom and learn that swapping dog and cat changes subject/object roles.",
    ], result: "The comparison changes order and nothing else. Unmasked content attention preserves the permutation symmetry; a causal mask adds legal earlier-to-later flow; positional signals add richer index or distance structure." },
    practice: { prompt: "If every token receives the same position vector, what order information remains available to unmasked, content-only self-attention, and what separate information would a causal mask add?", hint: "Separate permutation-equivariant content matching from the decoder's legal-access pattern.", answer: "The shared vector adds no index or distance information: reordering token embeddings merely reorders the outputs. A causal mask separately tells each query which positions are not in its future, adding directional access but not a reusable absolute-index or pairwise-distance signal. A varying position method supplies that richer geometry." },
    resources: [
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", kind: "Paper", note: "Introduces sinusoidal positional encoding in the original Transformer." },
      { title: "RoFormer", url: "https://arxiv.org/abs/2104.09864", kind: "Paper", note: "The primary paper for rotary position embeddings and their relative-position property." },
      { title: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", kind: "Article", note: "A visual explanation of how position joins token representations." },
    ],
  },

  attention: {
    objectives: ["Trace query-key-value attention from shapes to weighted output", "Explain causal masking and multi-head specialization", "Avoid treating attention weights as complete explanations"],
    vocabulary: [
      { term: "Query", meaning: "A vector representing what the current token position is looking for." },
      { term: "Key", meaning: "A vector representing what information a position offers for matching." },
      { term: "Value", meaning: "The information vector retrieved when a key receives attention weight." },
      { term: "Causal mask", meaning: "A mask that prevents a position from attending to future tokens during autoregressive modeling." },
    ],
    sections: [
      { title: "Attention is content-addressed communication", paragraphs: [
        "Every token position is projected into queries, keys, and values. A query asks a learned question; keys advertise learned properties; their dot products produce compatibility scores. Dividing by $\\sqrt{d_{head}}$ keeps score variance manageable as dimension grows. A causal mask replaces future-position scores with negative infinity, and softmax converts the remaining scores into weights that sum to one.",
        "The weighted sum of value vectors is an information update for the querying position. Notice the separation: query-key scores decide where to read, while values decide what content is read. A position can attend strongly to another token yet retrieve a transformed feature that is not obvious from the visible word. Attention operates on learned vectors, not human-readable labels.",
      ] },
      { title: "Many heads, residual destinations", paragraphs: [
        "Multi-head attention splits or projects the model width into several subspaces. Each head has its own query, key, and value projections, allowing different learned routing patterns in parallel. Head outputs are concatenated and projected back to model width before being added to the residual stream. Heads are not guaranteed to have clean roles, but some can exhibit patterns such as recent-token copying, delimiter matching, or long-range reference.",
        "Attention weights show one part of the routing calculation, not a complete causal explanation. Values, output projections, residual additions, later MLPs, and interactions between heads all affect behavior. To claim a mechanism, researchers need interventions such as ablation or activation patching, not a colorful heatmap alone.",
      ] },
    ],
    walkthrough: [
      { title: "Project Q, K, and V", body: "Learned matrices transform each residual vector into matching coordinates and information coordinates for each head.", checkpoint: "Q and K need compatible head dimensions; V can encode different content." },
      { title: "Score, scale, mask, normalize", body: "Compute $QK^{\\mathsf{T}}$, divide every score by $\\sqrt{d_{head}}$, hide illegal future positions, and apply softmax across visible keys.", checkpoint: "Division controls score magnitude; masking must occur before softmax so visible weights renormalize to one." },
      { title: "Retrieve and write", body: "Multiply weights by V, combine heads, apply the output projection, and add the update to the residual stream.", checkpoint: "The original residual is preserved by addition, allowing attention to contribute rather than replace it." },
    ],
    guidedExample: { title: "Route referent evidence without looking ahead", setup: "In ‘Maya put the book on the table because it was sturdy’, consider the query at the later token ‘sturdy’ and visible keys at Maya, book, table, and it.", steps: [
      "A learned query at ‘sturdy’ may seek an earlier entity compatible with that property. Every candidate key is at or before the query, so the causal access is legal.",
      "Keys at ‘book’ and ‘table’ advertise different syntactic and semantic features; the table key receives the larger compatible score in this context.",
      "The weighted value sum imports table-related features into the adjective-position state, which later layers can use to predict following tokens.",
    ], result: "Attention does not replace symbolic reference resolution with one transparent rule. It provides differentiable routing that can assemble context-dependent evidence across layers." },
    practice: { prompt: "A query has visible pre-softmax scores [2,1,0] and one future position with score 5. What must happen before softmax in a causal decoder, and why?", hint: "The future score is numerically largest but legally unavailable.", answer: "Replace the future score with negative infinity (or an equivalent very negative mask value), then softmax only the three visible scores. Otherwise the model could use the answer token during training, leaking future information and invalidating autoregressive generation." },
    resources: [
      { title: "Attention in transformers, step-by-step", url: "https://www.3blue1brown.com/lessons/attention/", kind: "Video", note: "A detailed visual derivation of queries, keys, softmax weights, and values." },
      { title: "The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/", kind: "Article", note: "A widely used visual explanation of self-attention and multi-head processing." },
      { title: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762", kind: "Paper", note: "The original Transformer equations and architecture." },
    ],
  },

  "layers-of-understanding": {
    objectives: ["Trace data through a pre-norm Transformer block", "Explain residual streams and MLP contributions", "Describe why capabilities emerge across layers rather than one location"],
    vocabulary: [
      { term: "Residual stream", meaning: "The shared sequence of width-d vectors to which sublayers add updates." },
      { term: "Layer normalization", meaning: "A normalization over features used to stabilize sublayer inputs or outputs." },
      { term: "MLP / feed-forward network", meaning: "A position-wise nonlinear feature transformation inside each block." },
      { term: "Residual connection", meaning: "An addition that preserves the incoming representation while incorporating a sublayer update." },
    ],
    sections: [
      { title: "A block edits a shared workspace", paragraphs: [
        "Think of the residual stream as one evolving notebook page for every token position. In a common pre-norm block, LayerNorm prepares the current page for attention; attention reads across positions and writes an update; that update is added to the original page. A second normalization prepares the result for the MLP; the MLP transforms features independently at each position; its update is added again.",
        "Every sublayer returns [B,T,d], which makes residual addition possible and gives blocks a stable interface. The normalization does not carry the main content; it controls scale and geometry for the next transformation. Pre-norm and post-norm place normalization differently and produce different optimization behavior, but both combine attention, nonlinear feature processing, and skip paths.",
        "That placement matters from the first update. In pre-norm, the skip path gives gradients a direct identity route through many blocks. In a deep post-norm stack, each residual result is normalized immediately, so gradients to an early block pass through more normalization operations and can be more sensitive to residual-branch scale and learning-rate warm-up. One concrete control is to initialize residual output projections with a depth-dependent smaller scale, such as $1/\\sqrt{2L}$ for $L$ blocks, then inspect activation and gradient norms. This is a stability heuristic to verify, not a guarantee that every pre-norm run is stable or every post-norm run is fragile.",
      ] },
      { title: "Depth supports iterative computation", paragraphs: [
        "Attention moves information between positions, while MLPs can detect and transform feature combinations at one position. Repeating blocks lets later computations operate on relationships created earlier. A first layer may identify delimiters, a middle layer may assemble a subject relation, and a later layer may turn that relation into output-relevant features. This is an illustrative decomposition, not a guaranteed clean hierarchy.",
        "Parameters are distributed and representations are often polysemantic: one component can participate in many behaviors, and one behavior can depend on many components. Residual connections allow features to persist across blocks, but additions can also reinforce, cancel, or rotate them. Understanding a model requires tracking information flow and interventions, not assigning each layer a single human job title.",
      ] },
    ],
    walkthrough: [
      { title: "Normalize and route", body: "LayerNorm stabilizes the current residual vectors; masked attention then gathers information from allowed token positions.", checkpoint: "Attention changes information across positions but returns the same outer shape." },
      { title: "Add without erasing", body: "The attention update is added to the incoming stream, preserving a direct path for earlier features and gradients.", checkpoint: "Residual addition requires matching [B,T,d] shapes." },
      { title: "Transform features locally", body: "The normalized stream enters an expanded MLP, nonlinearity, and projection back to d before another residual addition.", checkpoint: "The same MLP weights apply independently at every token position." },
    ],
    guidedExample: { title: "Follow a name through two blocks", setup: "In ‘Ada wrote the program. She tested it.’, imagine tracing the representation at ‘She’.", steps: [
      "An attention update can route features from ‘Ada’ into the ‘She’ position based on learned compatibility and grammar.",
      "The residual addition keeps the original pronoun features while adding candidate-reference information.",
      "An MLP can transform that combined state into features useful for later predictions, while subsequent blocks refine or reject the relation using more context.",
    ], result: "A block is not one monolithic reasoning step. It alternates communication and feature transformation while maintaining a shared residual workspace." },
    practice: { prompt: "Why can’t a standard residual addition combine an attention output [B,T,2d] directly with a stream [B,T,d]? What architectural operation fixes this?", hint: "Addition is elementwise and therefore needs matching axes.", answer: "The feature widths differ, so the vectors cannot be added coordinate by coordinate. Multi-head outputs are concatenated and passed through an output projection back to d; only then can the [B,T,d] update be added to the residual stream." },
    resources: [
      { title: "The Annotated Transformer", url: "https://nlp.seas.harvard.edu/annotated-transformer/", kind: "Article", note: "A line-by-line implementation of normalization, residual connections, attention, and feed-forward blocks." },
      { title: "A Mathematical Framework for Transformer Circuits", url: "https://transformer-circuits.pub/2021/framework/index.html", kind: "Article", note: "A deeper residual-stream view of how attention and MLP components compose." },
      { title: "Visualizing transformers and attention", url: "https://www.3blue1brown.com/lessons/transformers-talk/", kind: "Video", note: "A visual bridge from vectors and attention to whole Transformer blocks." },
    ],
  },

  "learning-to-predict": {
    objectives: ["Construct shifted input-target pairs for causal language modeling", "Explain teacher forcing and parallel token loss", "Connect token loss to gradients without confusing prediction with truth"],
    vocabulary: [
      { term: "Causal language modeling", meaning: "Training each position to predict its next token using only earlier context." },
      { term: "Teacher forcing", meaning: "Using the actual prior training tokens as context instead of the model’s sampled mistakes." },
      { term: "Shifted labels", meaning: "Targets offset one position to the right of input tokens." },
      { term: "Exposure mismatch", meaning: "The difference between training on correct prefixes and generation on the model’s own prefixes." },
    ],
    sections: [
      { title: "One sequence supplies many supervised examples", paragraphs: [
        "For tokens [The, cat, sat, .], the model can learn The→cat, The cat→sat, and The cat sat→. in one forward pass. Inputs exclude the last token; labels exclude the first. A causal mask ensures the hidden state at position t cannot see label t+1 even though all positions are computed in parallel on hardware.",
        "Teacher forcing supplies the true prefix at every training position. This makes optimization efficient and stable: one early sampled error does not corrupt every later training target. During generation, however, the model conditions on its own selected tokens. An unlikely mistake can move the context off the training distribution, which is one reason errors can compound.",
        "When documents are packed together, each document ends with an explicit EOS token and its final content token must predict that EOS. Segment IDs plus a block-diagonal causal mask—or an equivalent per-sequence reset—prevent a token in document 2 from reading document 1. Resetting position IDs alone is not isolation because attention could still cross the boundary. Loss should omit padding and the artificial EOS→BOS cross-document transition, while retaining the within-document EOS target.",
      ] },
      { title: "Averaged loss compresses millions of decisions", paragraphs: [
        "The output head produces logits [B,T,V]. Cross-entropy is calculated for each non-masked target position, then reduced—often averaged over valid tokens and across devices. Backpropagation assigns credit to the output projection, every Transformer block, embeddings, and any other parameter that influenced those logits. Padding, document boundaries, and prompt masks determine which token positions count.",
        "Low next-token loss rewards accurate distributional prediction, not factuality under every prompt. Training data can contain false statements, contradictory styles, and shortcuts. A model may reduce average loss by becoming fluent and broadly knowledgeable while remaining unreliable on rare facts or adversarial questions. Later evaluations must test the behavior we actually care about.",
      ] },
    ],
    walkthrough: [
      { title: "Create shifted pairs", body: "Use tokens 0…T-2 as inputs and 1…T-1 as targets. At packed boundaries, keep final-content→EOS, omit the artificial EOS→BOS target, and use segment-aware attention isolation.", checkpoint: "Every scored target belongs to the same document as its input; the final content token still predicts EOS, and no query reads a different document." },
      { title: "Predict every legal position", body: "Masked self-attention creates contextual states in parallel; the vocabulary head turns each state into V logits.", checkpoint: "Parallel training does not permit future leakage because the mask removes those attention paths." },
      { title: "Reduce and backpropagate", body: "Compute cross-entropy only at valid positions, aggregate it consistently, then differentiate the scalar loss.", checkpoint: "Changing which tokens are masked changes the actual learning objective." },
    ],
    guidedExample: { title: "Count the training decisions", setup: "A batch contains 4 sequences of 128 tokens with no padding. Inputs and labels are shifted by one.", steps: [
      "Each sequence has 127 next-token targets, because the first token has no preceding position in this slice and the last input predicts the last label.",
      "The batch therefore supplies $4\\times127=508$ token-level prediction losses.",
      "The model outputs logits shaped [4,127,V] for the aligned prediction positions; the reduction turns those 508 losses into the scalar used for backward.",
    ], result: "One optimizer step is trained by hundreds or millions of token decisions. Batch size alone does not state how much supervision the step contains; valid token count does." },
    practice: { prompt: "A padded batch has two length-5 sequences stored at T=8. How many real next-token targets exist if padding loss is masked and each sequence is trained within its own boundary?", hint: "A sequence of n tokens supplies n-1 adjacent next-token pairs.", answer: "Each length-5 sequence supplies 4 targets, so there are 8 valid targets total—not 14 or 16. Padding positions and transitions into padding must contribute zero loss." },
    resources: [
      { title: "The unreasonable effectiveness of RNNs", url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/", kind: "Article", note: "An accessible illustration of character-level next-token modeling and sampling." },
      { title: "Language models and the dataset", url: "https://d2l.ai/chapter_recurrent-neural-networks/language-model.html", kind: "Course", note: "Explains sequence probabilities, perplexity, and how text becomes training examples." },
      { title: "makemore: bigram language model", url: "https://www.youtube.com/watch?v=PaCmpygFfXo", kind: "Video", note: "Builds next-character prediction, loss, sampling, and gradients from first principles." },
    ],
  },

  "gpt2-from-scratch": {
    objectives: ["Trace every major tensor through a decoder-only Transformer", "Separate enduring GPT design ideas from implementation-era choices", "Design and debug a tiny end-to-end training run"],
    vocabulary: [
      { term: "Decoder-only Transformer", meaning: "A causal Transformer stack that predicts continuations from a left context." },
      { term: "Vocabulary head", meaning: "The final projection from hidden width d to one logit per vocabulary item V." },
      { term: "Parameter sharing", meaning: "Reusing weights, such as tied input embeddings and output projection." },
      { term: "Training loop", meaning: "Repeated sampling, forward loss, backward gradients, optimizer update, evaluation, and checkpointing." },
    ],
    sections: [
      { title: "Assemble the pieces into one executable contract", paragraphs: [
        "A tiny GPT receives integer IDs [B,T]. Token and position representations create [B,T,d]. Each causal Transformer block preserves that shape while attention routes earlier information and the MLP transforms features. Final normalization prepares the stream, and the vocabulary projection produces [B,T,V]. Shifted cross-entropy compares those logits with the next IDs. That shape contract is the spine of both GPT-2 and many modern descendants.",
        "GPT-2 used learned absolute position embeddings, pre-normalized blocks, multi-head attention, GELU MLPs, and commonly tied token/output weights. Newer small training stacks may use RoPE, RMSNorm, grouped-query attention, QK normalization, different activations, and untied weights. Those changes affect stability and efficiency, but the causal residual stack and next-token interface remain recognizable.",
      ] },
      { title: "From correct model to credible experiment", paragraphs: [
        "A model that compiles may still train incorrectly. Verify data boundaries, tokenizer pairing, causal masking, shifted targets, initialization scale, parameter counts, optimizer groups, and train/eval modes. Overfit a tiny batch first: if loss cannot approach zero, investigate correctness before renting more compute. Inspect samples only after checking numerical metrics, because fluent output can hide leakage or memorization.",
        "A reproducible run records code, data version and mixture, tokenizer, configuration, random seeds, precision, hardware, throughput, validation data, and checkpoint state. nanochat demonstrates that the model is one part of a larger recipe: data acquisition, tokenization, base training, mid-training, supervised fine-tuning, evaluation, and inference all have explicit interfaces. Its README at revision `92d63d4` records a 1.65-hour DCLM CORE threshold entry for training commit `a825e63` on 8×H100 GPUs; that pinned leaderboard claim is not a generic tiny-GPT runtime or a supplied course measurement.",
      ] },
    ],
    walkthrough: [
      { title: "Trace the forward shapes", body: "IDs [B,T] become residual states [B,T,d], stay width d through N blocks, and become logits [B,T,V].", checkpoint: "Only the vocabulary head must expose V; internal residual additions require d." },
      { title: "Construct the learning step", body: "Zero gradients, run the forward pass, compute shifted masked cross-entropy, backpropagate, clip if needed, and update.", checkpoint: "Calling optimizer.step before backward would have no current gradients to apply." },
      { title: "Validate the system", body: "Overfit a micro-batch, compare train/validation loss, inspect generation, save complete state, and test resume determinism.", checkpoint: "A checkpoint without optimizer, RNG, and data position may not reproduce the same continuation of training." },
    ],
    guidedExample: { title: "Debug a suspiciously perfect GPT", setup: "Your tiny GPT reaches near-zero validation loss in minutes and reproduces validation passages exactly.", steps: [
      "Check whether documents were duplicated or split into train and validation after chunking, allowing near-identical windows in both sets.",
      "Verify the causal mask and target shift so each position cannot see the token it is asked to predict.",
      "Compare on a clean, document-level held-out set and search for exact overlaps before crediting architecture quality.",
    ], result: "End-to-end understanding includes ways the experiment can lie. Exceptional metrics demand stronger checks, not immediate celebration." },
    practice: { prompt: "You double context length $T$ while keeping $B$, $d$, layers, and ordinary full attention fixed. Which major costs grow linearly and which attention work grows roughly quadratically?", hint: "Count stored token states versus query-key position pairs.", answer: "Hidden activations and token-count-dependent MLP work grow roughly linearly with $T$. The attention score table contains $T\\times T$ pairs per head, so its prefill score/mixing work and score-memory grow roughly quadratically unless an optimized or sparse method changes the calculation." },
    resources: [
      { title: "Let’s build GPT: from scratch", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", kind: "Video", note: "A complete code-along from bigram modeling to a GPT-style Transformer." },
      { title: "nanoGPT", url: "https://github.com/karpathy/nanoGPT", kind: "Documentation", note: "A compact, readable GPT training implementation suited to mapping concepts to code." },
      { title: "nanochat", url: "https://github.com/karpathy/nanochat", kind: "Documentation", note: "A modern full-stack recipe spanning tokenizer, base training, post-training, evaluation, and chat." },
    ],
  },
};
