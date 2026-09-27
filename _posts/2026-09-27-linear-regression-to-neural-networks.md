---
layout: interactive-post
title: "From a Line to a Neural Network"
description: "An interactive journey through machine learning: least squares, gradient descent, logistic regression, k-nearest neighbors, decision trees, feature engineering, and a neural network that trains in your browser."
date: 2026-09-27
tags: [Machine Learning, Linear Regression, Gradient Descent, Classification, Neural Networks]
stylesheet: /assets/css/ml-journey.css
script: /assets/js/ml-journey.js
---

<div class="mlj">

<section class="mlj-hero">
  <div class="mlj-hero-copy">
    <div class="mlj-kicker">A visual journey through model capacity</div>
    <h2>How does a machine go from fitting <span class="gradient-text">one line</span> to learning its own representation?</h2>
    <p>Machine learning can look like a bag of unrelated algorithms. It makes more sense as a sequence of ideas: define a function, measure its mistakes, optimize its parameters, introduce nonlinearity, and finally let the model learn the features themselves.</p>
  </div>
  <div class="mlj-hero-ladder" aria-label="Topics in this article">
    <span>01 · LINEAR REGRESSION <b>fit</b></span>
    <span>02 · GRADIENT DESCENT <b>optimize</b></span>
    <span>03 · LOGISTIC REGRESSION <b>classify</b></span>
    <span>04 · k-NN <b>remember</b></span>
    <span>05 · DECISION TREES <b>partition</b></span>
    <span>06 · FEATURES <b>represent</b></span>
    <span>07 · NEURAL NETWORKS <b>learn features</b></span>
  </div>
</section>

<nav class="mlj-rail" aria-label="Article sections">
  <a href="#linear">01 Linear</a>
  <a href="#gradient">02 Optimization</a>
  <a href="#logistic">03 Logistic</a>
  <a href="#knn">04 k-NN</a>
  <a href="#trees">05 Trees</a>
  <a href="#features">06 Features</a>
  <a href="#neural">07 Neural Nets</a>
  <a href="#summary">08 Summary</a>
</nav>

<section class="mlj-section" id="linear" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">01 / FIT A LINE</div>
    <div>
      <h2>Linear regression: the smallest useful learning machine.</h2>
      <p>Suppose we observe pairs of numbers — study hours and exam score, house size and price, temperature and energy use. We want a rule that predicts one from the other. The simplest useful assumption is that the relationship is approximately linear.</p>
    </div>
  </div>

  <div class="mlj-copy">
    <p>A linear model has only two learnable parameters: an <strong>intercept</strong> and a <strong>slope</strong>. Training means choosing those two numbers so that the line passes as close as possible to the observed data.</p>

    <div class="mlj-equation">ŷ = b₀ + b₁x<small>PREDICTION = INTERCEPT + SLOPE × INPUT</small></div>

    <p>For every observed point, the vertical gap between the prediction and the observation is a <strong>residual</strong>. Least-squares regression chooses the line that minimizes the sum of the squared residuals. Squaring matters: positive and negative errors cannot cancel, and large mistakes receive a larger penalty.</p>
  </div>

  <div class="mlj-lab">
    <div class="mlj-lab-head">
      <div><span class="mlj-led"></span><span class="mlj-lab-title">LEAST-SQUARES LAB</span></div>
      <span class="mlj-lab-hint">DRAG ANY WHITE POINT · THE FIT UPDATES IN REAL TIME</span>
    </div>
    <canvas id="linregCanvas" class="mlj-canvas" aria-label="Interactive least squares regression visualization"></canvas>
    <div class="mlj-metrics">
      <div class="mlj-metric"><span>Slope b₁</span><b id="linM">—</b></div>
      <div class="mlj-metric"><span>Intercept b₀</span><b id="linB">—</b></div>
      <div class="mlj-metric"><span>Mean squared error</span><b id="linMse">—</b></div>
      <div class="mlj-metric"><span>R²</span><b class="accent" id="linR2">—</b></div>
    </div>
    <div class="mlj-controls">
      <button class="mlj-btn" id="linNoise">ADD NOISE</button>
      <button class="mlj-btn" id="linReset">RESET DATA</button>
      <span class="mlj-lab-hint" id="linEquation">ŷ = …</span>
    </div>
  </div>

  <div class="mlj-copy">
    <h3>What the model is actually learning</h3>
    <p>Nothing inside linear regression “knows” what a house, temperature, or exam is. The model only sees numbers and searches for parameters that make a chosen loss function small. That separation — <strong>model + loss + optimization</strong> — becomes the template for almost everything that follows.</p>
    <div class="mlj-note"><strong>Important limitation</strong>A straight line can only express a straight-line relationship. If the true structure bends, branches, loops, or depends on interactions between features, the model is structurally incapable of representing it.</div>
  </div>
</section>

<section class="mlj-section" id="gradient" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">02 / OPTIMIZE</div>
    <div>
      <h2>Gradient descent: learning by walking downhill.</h2>
      <p>For ordinary least squares, we can solve for the best line directly. But many machine-learning models have millions or billions of parameters and no practical closed-form solution. We need an iterative way to improve them.</p>
    </div>
  </div>

  <div class="mlj-copy">
    <p>Imagine every possible parameter setting as a point on a landscape. The height of the landscape is the loss. A gradient tells us the direction of steepest increase, so we move in the opposite direction.</p>
    <div class="mlj-equation">θ ← θ − η ∇L(θ)<small>PARAMETERS ← PARAMETERS − LEARNING RATE × LOSS GRADIENT</small></div>
    <p>The learning rate <code>η</code> controls the step size. Too small and learning crawls. Too large and the optimizer can overshoot or diverge. This same basic idea later trains neural networks.</p>
  </div>

  <div class="mlj-lab">
    <div class="mlj-lab-head">
      <div><span class="mlj-led"></span><span class="mlj-lab-title">GRADIENT-DESCENT TRAINER</span></div>
      <span class="mlj-lab-hint">START FROM A BAD LINE · WATCH OPTIMIZATION REPAIR IT</span>
    </div>
    <canvas id="gdCanvas" class="mlj-canvas" aria-label="Gradient descent learning a regression line"></canvas>
    <div class="mlj-metrics">
      <div class="mlj-metric"><span>Slope</span><b id="gdSlope">—</b></div>
      <div class="mlj-metric"><span>Intercept</span><b id="gdIntercept">—</b></div>
      <div class="mlj-metric"><span>Loss</span><b class="accent" id="gdLoss">—</b></div>
      <div class="mlj-metric"><span>Iteration</span><b id="gdIter">0</b></div>
    </div>
    <div class="mlj-controls">
      <button class="mlj-btn primary" id="gdRun">RUN</button>
      <button class="mlj-btn" id="gdStep">ONE STEP</button>
      <button class="mlj-btn" id="gdReset">RESET</button>
      <div class="mlj-range"><label for="gdLr">LEARNING RATE</label><input id="gdLr" type="range" min="0.005" max="0.3" value="0.08" step="0.005"><output id="gdLrValue">0.080</output></div>
    </div>
  </div>

  <div class="mlj-two-col">
    <div class="mlj-concept"><div class="mlj-kicker">Batch gradient descent</div><h3>Use all examples.</h3><p>Compute one gradient from the full dataset. The update is stable but can be expensive when the dataset is huge.</p></div>
    <div class="mlj-concept"><div class="mlj-kicker">Stochastic / mini-batch</div><h3>Use a small sample.</h3><p>Estimate the gradient from a subset. Updates become noisy, but training becomes scalable — the standard recipe for deep learning.</p></div>
  </div>
</section>

<section class="mlj-section" id="logistic" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">03 / CLASSIFY</div>
    <div>
      <h2>Logistic regression: turn a score into a probability.</h2>
      <p>Regression predicts a continuous value. Classification asks a different question: which class does this example belong to? Logistic regression keeps the linear score, then squeezes it through a sigmoid function so the output lies between 0 and 1.</p>
    </div>
  </div>

  <div class="mlj-copy">
    <div class="mlj-equation">p(y=1|x) = 1 / (1 + e<sup>−(wᵀx+b)</sup>)<small>A LINEAR SCORE BECOMES A PROBABILITY</small></div>
    <p>A probability is not yet a decision. We still choose a <strong>threshold</strong>. Moving that threshold changes the trade-off between false positives and false negatives. That is why “accuracy” alone rarely tells the whole story.</p>
  </div>

  <div class="mlj-lab">
    <div class="mlj-lab-head">
      <div><span class="mlj-led"></span><span class="mlj-lab-title">CLASSIFICATION THRESHOLD LAB</span></div>
      <span class="mlj-lab-hint">MOVE THE THRESHOLD · WATCH THE DECISION BOUNDARY AND ERRORS CHANGE</span>
    </div>
    <canvas id="logCanvas" class="mlj-canvas" aria-label="Interactive logistic regression classification threshold"></canvas>
    <div class="mlj-controls" style="justify-content:space-between">
      <div class="mlj-range"><label for="logThreshold">THRESHOLD</label><input id="logThreshold" type="range" min="0.08" max="0.92" value="0.50" step="0.01"><output id="logThresholdValue">0.50</output></div>
      <div class="cm-grid">
        <div class="cm-cell good">TRUE +<b id="cmTP">—</b></div><div class="cm-cell bad">FALSE +<b id="cmFP">—</b></div>
        <div class="cm-cell bad">FALSE −<b id="cmFN">—</b></div><div class="cm-cell good">TRUE −<b id="cmTN">—</b></div>
      </div>
    </div>
    <div class="mlj-metrics" style="grid-template-columns:1fr 1fr">
      <div class="mlj-metric"><span>Precision</span><b id="logPrecision">—</b></div>
      <div class="mlj-metric"><span>Recall</span><b class="accent" id="logRecall">—</b></div>
    </div>
  </div>

  <div class="mlj-copy">
    <h3>The first important boundary</h3>
    <p>Despite the sigmoid, logistic regression still creates a <strong>linear decision boundary</strong> in the original feature space. It can separate two groups with a line, plane, or hyperplane — but it cannot naturally carve out complicated regions.</p>
  </div>
</section>

<div class="mlj-bridge">
  <div class="mlj-bridge-inner">
    <div class="mlj-kicker">At this point we have a pattern</div>
    <h2>Choose a function. Define a loss. Optimize parameters.</h2>
    <p>Different algorithms now disagree mainly about <strong>what function family to use</strong> and <strong>how much structure to assume</strong>.</p>
  </div>
</div>

<section class="mlj-section" id="knn" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">04 / REMEMBER</div>
    <div>
      <h2>k-nearest neighbors: what if we barely train at all?</h2>
      <p>k-NN takes a radically different approach. It stores the training examples. When a new point arrives, it asks which stored examples are closest and lets those neighbors vote.</p>
    </div>
  </div>

  <div class="mlj-copy">
    <p>There is almost no conventional training step. The inductive bias is local: <strong>nearby points should have similar labels</strong>. The hyperparameter <code>k</code> controls how local the decision is.</p>
  </div>

  <div class="mlj-lab">
    <div class="mlj-lab-head">
      <div><span class="mlj-led"></span><span class="mlj-lab-title">k-NN PROBE</span></div>
      <span class="mlj-lab-hint">MOVE YOUR CURSOR THROUGH THE FIELD · LINES SHOW THE k NEAREST TRAINING POINTS</span>
    </div>
    <canvas id="knnCanvas" class="mlj-canvas" aria-label="Interactive k-nearest neighbors visualization"></canvas>
    <div class="mlj-controls">
      <div class="mlj-range"><label for="knnK">NEIGHBORS k</label><input id="knnK" type="range" min="1" max="11" step="2" value="5"><output id="knnKValue">5</output></div>
      <span class="mlj-lab-hint">PREDICTION: <strong id="knnPred" style="color:var(--text)">—</strong></span>
      <span class="mlj-lab-hint" id="knnVotes">—</span>
    </div>
  </div>

  <div class="mlj-two-col">
    <div class="mlj-concept"><div class="mlj-kicker">Small k</div><h3>Flexible, but noisy.</h3><p>A tiny neighborhood can follow intricate boundaries but is sensitive to outliers and mislabeled examples.</p></div>
    <div class="mlj-concept"><div class="mlj-kicker">Large k</div><h3>Smooth, but biased.</h3><p>A large neighborhood averages away noise, but can erase small local structures. This is the bias–variance trade-off in visible form.</p></div>
  </div>
</section>

<section class="mlj-section" id="trees" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">05 / PARTITION</div>
    <div>
      <h2>Decision trees: learn rules by slicing feature space.</h2>
      <p>A tree repeatedly asks simple questions such as “is feature 1 smaller than 0.42?” Each question divides the data, and the recursive sequence of splits creates a piecewise decision surface.</p>
    </div>
  </div>

  <div class="mlj-copy">
    <p>A classification tree searches for splits that make the child groups purer. A common impurity measure is <strong>Gini impurity</strong>. Deep trees can model surprisingly complicated patterns, but they can also memorize noise.</p>
    <div class="mlj-equation">Gini = 1 − Σ p<sub>k</sub>²<small>ZERO MEANS A NODE CONTAINS ONLY ONE CLASS</small></div>
  </div>

  <div class="mlj-lab">
    <div class="mlj-lab-head">
      <div><span class="mlj-led"></span><span class="mlj-lab-title">LIVE CART PARTITIONER</span></div>
      <span class="mlj-lab-hint">THIS MINI TREE SEARCHES REAL SPLITS IN JAVASCRIPT</span>
    </div>
    <canvas id="treeCanvas" class="mlj-canvas" aria-label="Interactive decision tree partitions"></canvas>
    <div class="mlj-metrics" style="grid-template-columns:1fr 1fr">
      <div class="mlj-metric"><span>Leaf regions</span><b id="treeLeaves">—</b></div>
      <div class="mlj-metric"><span>Training accuracy</span><b class="accent" id="treeAcc">—</b></div>
    </div>
    <div class="mlj-controls">
      <div class="mlj-range"><label for="treeDepth">MAX DEPTH</label><input id="treeDepth" type="range" min="1" max="7" value="3" step="1"><output id="treeDepthValue">3</output></div>
      <button class="mlj-btn" id="treeRegenerate">NEW DATASET</button>
    </div>
  </div>

  <div class="mlj-copy">
    <h3>From one tree to a forest</h3>
    <p>Single trees are unstable: a small change in data can produce a different structure. Random forests reduce that variance by averaging many decorrelated trees. Gradient-boosted trees take another route: add weak trees sequentially, with each new tree focusing on the current residual errors.</p>
  </div>
</section>

<section class="mlj-section" id="features" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">06 / REPRESENT</div>
    <div>
      <h2>The hidden bottleneck: the model can only use the representation you give it.</h2>
      <p>Classical machine learning often depends heavily on feature engineering. A linear classifier may fail not because the optimizer is weak, but because the useful structure is invisible in the original coordinates.</p>
    </div>
  </div>

  <div class="mlj-feature-callout">
    <div>
      <div class="mlj-kicker">The XOR problem</div>
      <h3>A simple pattern that defeats a straight boundary.</h3>
      <p>In raw coordinates, opposite corners share a class. No single straight line can separate them. Add the interaction feature <code>x₁×x₂</code>, however, and the classes become linearly separable in the transformed representation.</p>
      <span class="feature-state" id="featureState">RAW FEATURES</span>
      <div style="margin-top:18px"><button class="mlj-btn primary" id="featureToggle">APPLY x₁ × x₂ FEATURE</button></div>
    </div>
    <div class="mlj-lab" style="margin:0">
      <canvas id="featureCanvas" class="mlj-canvas" aria-label="Feature engineering transforms XOR data"></canvas>
    </div>
  </div>

  <div class="mlj-copy">
    <p>This is the conceptual bridge to neural networks. Instead of asking a human to invent every useful interaction, can the model <strong>learn a sequence of useful transformations</strong> directly from data?</p>
  </div>
</section>

<div class="mlj-bridge">
  <div class="mlj-bridge-inner">
    <div class="mlj-kicker">The deep-learning move</div>
    <h2>Stop hand-designing every feature. Learn the representation.</h2>
    <p>A neural network stacks parameterized transformations. Training adjusts not just the final decision rule, but the intermediate representation itself.</p>
  </div>
</div>

<section class="mlj-section" id="neural" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">07 / LEARN FEATURES</div>
    <div>
      <h2>Neural networks: linear layers become powerful when we insert nonlinearity.</h2>
      <p>A single neuron looks familiar: weighted inputs plus a bias, followed by an activation. The power comes from composing many such units into layers.</p>
    </div>
  </div>

  <div class="mlj-copy">
    <div class="mlj-equation">h = φ(Wx + b) &nbsp;&nbsp;→&nbsp;&nbsp; ŷ = σ(Vh + c)<small>LINEAR TRANSFORM → NONLINEAR ACTIVATION → ANOTHER TRANSFORM</small></div>
    <p>If we stacked only linear layers, the entire stack would collapse into one linear transformation. Nonlinear activations are what allow the network to bend, fold, and reorganize feature space.</p>
  </div>

  <div class="mlj-network-diagram">
    <canvas id="networkDiagram" aria-label="Animated neural network activation flow"></canvas>
  </div>

  <div class="mlj-copy">
    <h3>Backpropagation is gradient descent with efficient bookkeeping</h3>
    <p>We compute the prediction, evaluate the loss, then use the chain rule to propagate how each parameter contributed to the error. The gradient flows backward through the computational graph; the parameter update still looks like the gradient-descent rule we used for the simple line.</p>
  </div>

  <div class="mlj-lab">
    <div class="mlj-lab-head">
      <div><span class="mlj-led"></span><span class="mlj-lab-title">2 → 6 → 1 NEURAL NETWORK · XOR</span></div>
      <span class="mlj-lab-hint">THE NETWORK BELOW REALLY TRAINS IN YOUR BROWSER — NO PRECOMPUTED ANIMATION</span>
    </div>
    <canvas id="nnCanvas" class="mlj-canvas" aria-label="Neural network training on XOR data"></canvas>
    <div class="mlj-metrics">
      <div class="mlj-metric"><span>Epoch</span><b id="nnEpoch">0</b></div>
      <div class="mlj-metric"><span>Cross-entropy loss</span><b id="nnLoss">—</b></div>
      <div class="mlj-metric"><span>Training accuracy</span><b class="accent" id="nnAcc">—</b></div>
      <div class="mlj-metric"><span>Architecture</span><b>2·6·1</b></div>
    </div>
    <div class="mlj-controls">
      <button class="mlj-btn primary" id="nnTrain">TRAIN</button>
      <button class="mlj-btn" id="nnStep">+20 STEPS</button>
      <button class="mlj-btn" id="nnReset">RANDOMIZE WEIGHTS</button>
      <div class="mlj-range"><label for="nnLr">LEARNING RATE</label><input id="nnLr" type="range" min="0.05" max="1.0" value="0.35" step="0.05"><output id="nnLrValue">0.35</output></div>
    </div>
  </div>

  <div class="mlj-copy">
    <p>Press <strong>TRAIN</strong>. At initialization the colored probability field is essentially random. As backpropagation updates the weights, the hidden layer discovers a representation that makes the XOR classes separable. The final output unit can then solve a problem that logistic regression could not solve in the raw coordinates.</p>

    <h3>The surprising continuity</h3>
    <p>A modern neural network is vastly more expressive than linear regression, but the conceptual skeleton is remarkably similar:</p>
    <ul>
      <li>There is still a parameterized function.</li>
      <li>There is still a prediction.</li>
      <li>There is still a loss that measures error.</li>
      <li>There is still gradient-based optimization.</li>
      <li>The major upgrade is that intermediate features are learned jointly with the predictor.</li>
    </ul>
  </div>

  <div class="mlj-code">
    <div class="mlj-code-head">THE CORE IDEA · PSEUDOCODE</div>
    <pre><span class="cm"># forward pass</span>
h = <span class="fn">tanh</span>(W1 @ x + b1)
ŷ = <span class="fn">sigmoid</span>(W2 @ h + b2)

<span class="cm"># measure error</span>
loss = <span class="fn">binary_cross_entropy</span>(ŷ, y)

<span class="cm"># backward pass: chain rule gives gradients</span>
gradients = <span class="fn">backpropagate</span>(loss)

<span class="cm"># same optimization idea as before</span>
parameters = parameters - learning_rate * gradients</pre>
  </div>
</section>

<section class="mlj-section" id="summary" data-ml-step>
  <div class="mlj-section-head">
    <div class="mlj-step">08 / CONNECT IT</div>
    <div>
      <h2>One field, many inductive biases.</h2>
      <p>These models are not a simple ladder where newer always means better. Each algorithm encodes assumptions about the shape of the problem, the amount of data, interpretability, compute, and the representation available.</p>
    </div>
  </div>

  <table class="mlj-table">
    <thead><tr><th>MODEL</th><th>CORE IDEA</th><th>STRENGTH</th><th>LIMITATION</th></tr></thead>
    <tbody>
      <tr><td>Linear regression</td><td>Fit a weighted sum</td><td>Simple, interpretable, data-efficient</td><td>Only linear relationships unless features are engineered</td></tr>
      <tr><td>Logistic regression</td><td>Linear score → probability</td><td>Strong baseline for classification</td><td>Linear decision boundary in input space</td></tr>
      <tr><td>k-NN</td><td>Let nearby examples vote</td><td>Very flexible local behavior</td><td>Prediction cost and distance sensitivity</td></tr>
      <tr><td>Decision tree</td><td>Recursive feature-space splits</td><td>Readable nonlinear rules</td><td>Single trees can overfit and be unstable</td></tr>
      <tr><td>Neural network</td><td>Learn stacked nonlinear representations</td><td>Expressive feature learning</td><td>More data, compute, tuning, and analysis</td></tr>
    </tbody>
  </table>

  <div class="mlj-copy">
    <h3>The mental model I keep</h3>
    <p>When I encounter a new machine-learning architecture, I ask four questions: <strong>What family of functions can it represent? What loss gives it a learning signal? How are the parameters optimized? What representation makes the task easy?</strong> Those questions connect classical machine learning to deep learning far better than memorizing an isolated list of algorithms.</p>
  </div>
</section>

<section class="mlj-final">
  <div class="mlj-kicker">The whole journey in one sentence</div>
  <h2>Machine learning is the art of choosing — or learning — a useful function space.</h2>
  <p>Linear models choose a tiny function family. Trees build piecewise rules. Nearest-neighbor methods borrow structure from local examples. Neural networks go further: they learn the representation and the predictor together.</p>
  <div class="mlj-final-grid">
    <div><b>01</b>MODEL<br>what can it express?</div>
    <div><b>02</b>LOSS<br>what counts as wrong?</div>
    <div><b>03</b>OPTIMIZER<br>how do parameters improve?</div>
    <div><b>04</b>REPRESENTATION<br>what makes the task easy?</div>
  </div>
</section>

</div>
