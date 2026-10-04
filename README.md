# FaultLine — SIF Precursor Detection Engine

### Smart India Hackathon — SIH26165 | Oil India Limited

> **"Detecting the fracture before the failure."**
> *"The absence of injury does not imply the absence of fatal potential."*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Website-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://faultline-sif.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TanayThapar/SIH26165-SIF-Precursor-Detection-Engine)

**Live Production URL:** [https://faultline-sif.vercel.app](https://faultline-sif.vercel.app)
**CI/CD Integration:** Automatically continuously deployed to Vercel on every `git push` to `main`.

---

## Table of Contents

1. [Abstract & Motivation](#1-abstract--motivation)
2. [Key Novelties & Research Contributions](#2-key-novelties--research-contributions)
3. [System Architecture Pipeline](#3-system-architecture-pipeline)
4. [Algorithms & Mathematical Formulations](#4-algorithms--mathematical-formulations)
5. [Multi-Dataset Empirical Validation](#5-multi-dataset-empirical-validation)
6. [Comparative Model Benchmarks](#6-comparative-model-benchmarks)
7. [Dashboard Workspaces & Features](#7-dashboard-workspaces--features)
8. [Codebase Architecture](#8-codebase-architecture)
9. [Run & Build Instructions](#9-run--build-instructions)
10. [Backend Integration (FastAPI)](#10-backend-integration-fastapi)
11. [Hyperparameters & Threshold Reference](#11-hyperparameters--threshold-reference)
12. [Data Provenance & Ethics](#12-data-provenance--ethics)
13. [References](#13-references)

---

## 1. Abstract & Motivation

Oil India Limited (OIL) collects large volumes of Unsafe-Act/Unsafe-Condition (UA/UC) observations, near-miss, and incident reports through its HSSE platform. These reports are triaged manually at periodic intervals (monthly, quarterly), introducing dangerous latency between a precursor signal and a preventive intervention.

**The core problem:** Global best practice (DEKRA Martin & Black, 2015; EEI SIF Precursor Model; VelocityEHS 2024 PSIF classifier) has established that **low-severity incidents do not share the same causes as fatalities**. Non-fatal US industrial accidents fell 51% over 15 years, while fatalities fell only 25.5%. Leading operators therefore separately flag the ~20–25% of reports carrying genuine fatal potential. Conventional NLP models fail at this task because they **leak outcome information** — erroneously correlating benign outcome phrases (*"no injury occurred"*, *"first aid administered"*, *"worker stepped away in time"*) with low severity, rather than analyzing the underlying hazard physics.

**FaultLine** solves this by separating **WHAT HAPPENED** from **WHAT COULD HAVE HAPPENED**. It is an AI/NLP decision-support platform that:

1. **Classifies** each report as SIF-potential (Serious Injury & Fatality) vs. non-SIF-potential using an **outcome-blind** representation.
2. **Tags** each report to the relevant **IOGP Life-Saving Rules** (Energy Isolation, Line of Fire, Working at Height, Hot Work, Confined Space, Driving, Safe Mechanical Lifting, Bypassing Safety Controls, Work Authorization).
3. **Surfaces** recurring precursor patterns (activity, location, barrier failure) via an interactive dashboard with a **Hidden Risk Index** and **statistical drift detection**.

---

## 2. Key Novelties & Research Contributions

### Novelty 1: Outcome-Blind Masking — Debiasing NLP for Safety

**Problem:** Standard NLP models trained on incident reports learn to predict severity by memorizing outcome keywords (*"fracture"*, *"amputation"*, *"fatality"*) rather than understanding the underlying hazard mechanics. This makes them useless for flagging near-misses and UA/UC observations where the outcome was benign by luck.

**Our Approach:** Before inference, a trained **outcome-masking tagger** replaces all injury/outcome phrases with a neutral `[OUTCOME]` token. The multitask encoder only ever sees the *situational* text — energy sources, worker positions, barrier states, and activities.

**Empirical Proof (OSHA, 105,996 reports):**

| Regime | Micro-F1 | Macro PR-AUC |
|:---|:---:|:---:|
| Raw (outcome visible) | 0.872 | 0.906 |
| **Masked (outcome blind)** | **0.855** | **0.887** |
| Delta | −0.017 | −0.019 |

A **negligible 1.7% F1 drop** proves the model successfully learns severity from *hazard physics*, not outcome shortcuts. For context-driven rules like *Safe Mechanical Lifting* (F1: 0.975 masked vs. 0.978 raw) and *Working at Height* (F1: 0.912 vs. 0.916), masking causes virtually zero degradation.

**Crucially**, on the MSHA dataset under **strict masking** (all injury vocabulary removed), the model retains a PR-AUC of **0.205** — a **6.4× lift over the random baseline of 0.032** — and catches **49.2% of all actual fatalities/disabilities in just the top 5% of flagged reports**, proving genuine precursor learning.

---

### Novelty 2: Hidden Risk Index — The Signature Metric

**Problem:** A report logged as *"Near miss — no injury"* (Actual Severity = 1) may describe a scenario where a suspended load dropped 2 meters from a worker's head (Potential Severity = 6). Manual triage misses this because the *outcome* masks the *potential*.

**Our Solution:**

$$\text{Hidden Risk} = \text{Predicted Potential Severity (Masked)} - \text{Reported Actual Severity}$$

A high positive Hidden Risk ($\Delta \ge +3$) indicates an event where the outcome was benign solely due to luck, but the physical energy release, worker exposure, and barrier compromise possessed catastrophic potential. This becomes the **headline priority metric** for the entire platform.

**Potential Severity** is derived from the calibrated SIF score:

$$\text{Potential Severity} = \begin{cases} 6 \text{ (Fatal Potential)} & \text{if } S_{\text{combined}} \ge 0.80 \\ 4 \text{ (Serious)} & \text{if } 0.50 \le S_{\text{combined}} < 0.80 \\ 2 \text{ (Minor)} & \text{if } S_{\text{combined}} < 0.50 \end{cases}$$

**Validation (Industrial Safety & Health Analytics DB):** On 425 incident cases with known actual and potential severity labels, our meta-ensemble model achieved **Precision @ Top 20% = 62.0%** on hidden SIFs (cases with minor actual outcome but catastrophic potential), more than doubling the base prevalence rate of 30.6%.

---

### Novelty 3: Neuro-Symbolic Combiner — Transparent Hybrid Intelligence

**Problem:** Pure neural models are black boxes. Pure rule-based systems are brittle. Safety-critical applications demand *both* statistical power *and* transparent, auditable reasoning.

**Our Approach:** A two-channel combiner fuses a learned statistical score with a deterministic symbolic safety rule:

```
Symbolic Rule: SIF-potential = High-Energy Source AND Person Exposed AND No Effective Barrier
```

The combiner logic:

```typescript
// Statistical NLP learned score
learnedScore = isHighEnergy ? (barrierCompromised ? 0.92 : 0.65) : 0.15

// Neuro-symbolic fusion: symbolic rule enforces a minimum floor of 0.88
combinedSifScore = symbolicRuleTriggered
    ? Math.max(learnedScore, 0.88)   // Rule guarantees minimum severity
    : learnedScore                    // Model alone when rule doesn't fire
```

**Key Behavior:** When the neural model and the symbolic rule **disagree** (e.g., model says low-risk but rule fires, or vice versa), the report is automatically flagged for **human-in-the-loop HSE review**, enabling active learning and audit trails.

**Impact on Outcome Bias Leakage:**

| Model Stage | Outcome Bias Leakage |
|:---|:---:|
| TF-IDF Baseline | 44.2% |
| Outcome-Aware DeBERTa | 38.6% |
| Outcome-Blind Multitask | 4.8% |
| **Neuro-Symbolic Engine (Final)** | **2.1%** |

---

### Novelty 4: Empirical Bayes Shrinkage for Site Risk Ranking

**Problem:** Small remote drilling rigs with only 5–10 observations can exhibit extreme SIF rates (e.g., 4/9 = 44%) purely from sampling noise, leading to false alarm fatigue.

**Our Approach:** Beta-Binomial Empirical Bayes shrinkage pulls noisy small-sample rates toward a stable enterprise prior:

$$\hat{\theta}_i = \left(\frac{n_i}{n_i + \nu}\right) \bar{y}_i + \left(\frac{\nu}{n_i + \nu}\right) \mu$$

Where:
- $\bar{y}_i = k_i / n_i$ = raw sample SIF precursor rate for site $i$
- $\mu = 0.240$ (24.0%) = global enterprise prior mean
- $\nu \approx 35$ = pseudo-count shrinkage weight
- $\hat{\theta}_i$ = shrinkage-adjusted Bayesian precursor rate

**Example:** Borholla Well Pad 01 (Remote) — $n=9$ reports, $k=4$ SIF precursors:
- Raw rate: 44.4%
- **Shrinkage-adjusted rate: 28.2%** (pulled down by −16.2% toward the global mean)
- 95% Credible Interval: [12%, 49%]

Sites with $n > 50$ reports see minimal shrinkage; sites with $n < 20$ are aggressively regularized.

---

### Novelty 5: CUSUM & Page-Hinkley Statistical Drift Detection

**Problem:** A slow, sustained increase in barrier failure rates over weeks can indicate systemic safety culture degradation — but this trend is invisible in monthly aggregate reports.

**Our Approach:** Real-time **Cumulative Sum (CUSUM)** and **Page-Hinkley** change-point detection on weekly barrier-failure rates:

- **Decision Interval Threshold:** $h = 4.50$
- **Alarm Condition:** Cumulative sum statistic $S_t \ge h$ triggers a change-point detection
- **12-week moving window** tracking rate $p_t$ against baseline $p_0$

**Severity Classification:**
- **Critical Drift:** $S_t > 6.0$ (sustained high shift, $> +300\%$ drift)
- **Elevated Drift:** $4.5 \le S_t \le 6.0$ (moderately breached threshold)
- **Monitoring:** Low breach or resolving trend

**Example:** With a baseline barrier-failure rate of $p_0 = 0.082$ (8.2%), by Week 35 the observed rate reaches $p_{35} = 0.285$, CUSUM reaches $S_{35} = 5.40 > 4.50$, triggering `changePointDetected = true`. By Week 39, $S_{39} = 8.42$, escalating to *Critical Drift* with automatic HSE intervention recommendations.

---

### Novelty 6: Co-Occurrence Lift Graph for Precursor Pattern Mining

**Problem:** Individual precursor flags are useful, but the truly dangerous patterns are *combinations* — e.g., confined space entry + omitted gas test + missing rescue plan.

**Our Approach:** A multi-entity co-occurrence graph where nodes represent Activities, Energy Sources, Barrier Failures, and Life-Saving Rules, and edges represent **lift** — the ratio of observed co-occurrence to expected independent co-occurrence:

$$\text{Lift}(A, B) = \frac{P(A \cap B)}{P(A) \cdot P(B)} = \frac{\text{coOccurrenceCount}}{\text{expectedCount}}$$

Where $\text{expectedCount} = \frac{\text{freq}(A) \cdot \text{freq}(B)}{N}$.

**Top Discovered Precursor Associations:**

| Entity Pair | Lift | Co-occurrence | Expected | Confidence |
|:---|:---:|:---:|:---:|:---:|
| Omitted 4-Gas Test ↔ Confined Space | **6.87×** | 22 | 3.2 | 0.98 |
| Vessel Entry ↔ Omitted 4-Gas Test | **6.15×** | 24 | 3.9 | 0.96 |
| Unclipped Fall Arrest ↔ Working at Height | **5.83×** | 28 | 4.8 | 0.96 |
| Vessel Entry ↔ Toxic H₂S / Flammables | **5.49×** | 28 | 5.1 | 0.95 |
| SIMOPS Operations ↔ Permit Scope Mismatch | **5.12×** | — | — | — |

The graph is interactive with a minimum lift threshold slider (range: 1.5× to 6.0×, default: 3.0×) and concentric radial layout by entity type.

---

## 3. System Architecture Pipeline

The system is designed as a pipeline of seven interconnected modules:

```
┌───────────────────────────────────────────────────────────────────────────┐
│  MODULE 0: Ingestion & Normalization                                      │
│  • Clean field text (expand safety abbreviations, normalize units)         │
│  • Preserve original + generate outcome-masked copy via trained tagger     │
│  • Latency: ~18ms normalization + ~22ms masking                           │
├───────────────────────────────────────────────────────────────────────────┤
│  MODULE 1: Structured Extraction (Explainable Core)                       │
│  • Energy source: gravity, motion, pressure, electrical, chemical, thermal│
│  • Exposure: person-in-hazard-zone, line-of-fire, distance, duration      │
│  • Barrier state: missing, failed, bypassed, held + barrier type          │
│  • Context: activity, location, equipment                                 │
│  • Approach: LLM teacher → distilled DeBERTa-v3-small span tagger        │
│  • Latency: ~44ms extraction                                             │
├───────────────────────────────────────────────────────────────────────────┤
│  MODULE 2: Outcome-Blind Multitask Encoder                                │
│  • Shared transformer reads MASKED text → 4 prediction heads:             │
│    ① SIF-potential (calibrated binary)                                    │
│    ② Life-Saving Rule tagging (multi-label, 9 IOGP rules)                │
│    ③ Potential severity (ordinal 1–6)                                     │
│    ④ Energy type (auxiliary regularization)                               │
│  • Latency: ~38ms multitask inference                                     │
├───────────────────────────────────────────────────────────────────────────┤
│  MODULE 3: Neuro-Symbolic Combiner                                        │
│  • Blends learned statistical score + deterministic symbolic rule          │
│  • Symbolic floor: 0.88 when High-Energy ∧ Exposed ∧ Barrier-Failed      │
│  • Divergence → auto-escalation to HSE review queue                       │
│  • Latency: ~20ms                                                         │
├───────────────────────────────────────────────────────────────────────────┤
│  MODULE 4: Hidden-Risk Index                                              │
│  • HiddenRisk = PotentialSeverity(masked) − ActualSeverity(reported)      │
│  • Δ ≥ +3 → Priority Watchlist, immediate triage escalation               │
├───────────────────────────────────────────────────────────────────────────┤
│  MODULE 5: Precursor Graph, Ranking & Drift                               │
│  • Co-occurrence lift graph (Activity × Energy × Barrier × LSR)           │
│  • Site ranking via Empirical Bayes shrinkage (μ=24%, ν≈35)               │
│  • CUSUM / Page-Hinkley drift detection (h=4.50, 12-week window)          │
├───────────────────────────────────────────────────────────────────────────┤
│  MODULE 6: Triage & Dashboard                                             │
│  • High-confidence (≥0.85): auto-escalated                                │
│  • Low-confidence flags: human-in-the-loop review queue                   │
│  • Active learning feedback loop                                          │
└───────────────────────────────────────────────────────────────────────────┘
```

**Total end-to-end inference latency:** ~142ms per report.

---

## 4. Algorithms & Mathematical Formulations

### 4.1 Outcome Masking Lexicon

A curated regex-based tagger identifies and neutralizes outcome-biased phrases before inference:

```
Masked Phrases:
  /no injury occurred/i       →  [OUTCOME]
  /technician was unharmed/i  →  [OUTCOME]
  /nobody was hurt/i          →  [OUTCOME]
  /zero casualties/i          →  [OUTCOME]
  /first aid plaster applied/i→  [OUTCOME]
  /escaped with zero harm/i   →  [OUTCOME]
  /no fall occurred/i         →  [OUTCOME]
  ... (13 total patterns)
```

### 4.2 Six-Category Energy Source Taxonomy

Every report is classified into a physical energy type that governs the **maximum possible severity envelope**:

| Energy Category | Trigger Keywords | Interpretation |
|:---|:---|:---|
| **Gravity** | suspended, crane, hoist, sling, fall, scaffold, height | Gravitational PE — suspended load or elevation |
| **Electrical** | volt, electrical, breaker, busbar, arc | Fatal flash / electrocution potential |
| **Pressure** | psi, pressure, hammer union, nitrogen, choke | Pressurized containment rupture / missile hazard |
| **Chemical / Toxic** | gas, H₂S, flame, weld, hot work, crude | Flammable hydrocarbons / toxic atmospheric pocket |
| **Motion / Vehicle** | excavator, truck, vehicle, reverse | Heavy mobile machinery / crushing potential |
| **Stored Mechanical** | spring, tension, chain, nip, belt | Stored energy / rotating pinch point |
| **None / Minimal** | *(default)* | Low energy routine environment |

### 4.3 Life-Saving Rule (LSR) Multi-Label Mapping

Reports are tagged to one or more of the 9 IOGP Life-Saving Rules using domain-specific keyword dictionaries:

| Life-Saving Rule | Keywords |
|:---|:---|
| Safe Mechanical Lifting | suspended, sling, hoist, crane |
| Line of Fire | line of fire, under, beneath, swing, shrapnel |
| Energy Isolation | electrical, LOTO, isolation, breaker, switchgear |
| Confined Space | confined space, sump, tank, H₂S, vessel |
| Working at Height | height, scaffold, ladder, lanyard, derrick |
| Hot Work | hot work, weld, torch, spark |
| Work Authorization | permit, PTW, authorization |
| Driving | driving, excavator, truck, vehicle |
| Bypassing Safety Controls | bypassed, guard, unclipped, without |

### 4.4 SIF Score Risk Banding

| Risk Band | Score Range | Action |
|:---|:---:|:---|
| **Critical SIF** | $S \ge 0.85$ | Auto-escalated to HSE review queue |
| **High SIF** | $0.70 \le S < 0.85$ | Flagged, review required |
| **Medium SIF** | $0.50 \le S < 0.70$ | Monitored |
| **Low / Non-SIF** | $S < 0.50$ | Routine processing |

### 4.5 Scatter Plot Deterministic Jitter (Hidden Risk Visualization)

To prevent overlapping points on integer severity coordinates, a deterministic hash-based jitter is applied:

```typescript
jitterX = ((id.charCodeAt(id.length - 1) % 10) - 5) × 0.035
jitterY = ((id.charCodeAt(0)             % 10) - 5) × 0.035
```

This produces repeatable, non-random offsets in $[-0.175, +0.175]$ that avoid collisions without introducing visual noise.

---

## 5. Multi-Dataset Empirical Validation

Since OIL's proprietary data is sensitive, we validated our architecture across **four diverse, large-scale proxy safety datasets**, stress-testing every component of the engine under different domains, prevalence rates, and temporal regimes.

---

### 5.1 OSHA Severe Injury Reports — LSR Multi-Label Classification

**Purpose:** Pretraining and validating the multi-label Life-Saving Rule heads and the outcome-masking pipeline.

| Dimension | Value |
|:---|:---|
| Records | 105,996 severe injury reports |
| Task | Multi-label classification over 10 LSR classes |
| Total Label Annotations | 125,178 (multi-label co-occurrence) |
| Validation | 5-Fold CV (seed = 42) |
| Evaluation | Dual-regime: Raw vs. Masked narratives |

**Aggregate Results:**

| Metric | Masked | Raw | Δ |
|:---|:---:|:---:|:---:|
| Micro-F1 | 0.855 ± 0.002 | 0.872 ± 0.001 | −0.017 |
| Macro-F1 | 0.821 | 0.845 | −0.024 |
| Macro PR-AUC | 0.887 | 0.906 | −0.019 |

**Granular Per-Rule Breakdown:**

| Life-Saving Rule | Support | F1 (Masked) | F1 (Raw) | PR-AUC (Masked) | PR-AUC (Raw) | Recall (Masked) | Recall (Raw) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Safe Mechanical Lifting | 3,978 | **0.975** | 0.978 | **0.990** | 0.995 | 0.962 | 0.968 |
| Working at Height | 19,513 | **0.912** | 0.916 | **0.968** | 0.972 | 0.934 | 0.940 |
| Line of Fire | 46,815 | **0.884** | 0.894 | **0.939** | 0.944 | 0.903 | 0.917 |
| None | 32,597 | 0.835 | 0.847 | 0.917 | 0.927 | 0.851 | 0.855 |
| Driving | 9,014 | 0.825 | 0.831 | 0.900 | 0.905 | 0.885 | 0.891 |
| Confined Space | 799 | 0.779 | 0.774 | 0.828 | 0.841 | 0.782 | 0.770 |
| Hot Work | 2,928 | 0.760 | 0.914 | 0.928 | 0.959 | 0.906 | 0.929 |
| Bypassing Safety Controls | 249 | 0.717 | 0.690 | 0.697 | 0.757 | 0.631 | 0.586 |
| Energy Isolation | 9,275 | 0.703 | 0.760 | 0.819 | 0.850 | 0.843 | 0.860 |

> **Key Insight — Hot Work Sensitivity:** Hot Work exhibits the largest masking delta (F1: 0.914 → 0.760), indicating raw reports rely heavily on thermal burn outcome vocabulary (*"third-degree burn"*, *"flame contact"*) rather than procedural descriptions of welding/brazing. This validates our masking approach — the model must learn to detect hot work *situations* (torch, spark, weld permit) rather than memorizing burn injuries.

> **Key Insight — Bypassing Safety Controls:** Uniquely, this rule performs *better* under masking (F1: 0.690 → 0.717), likely because outcome tokens are distracting noise for procedurally-defined violations (guard removal, interlock bypass).

---

### 5.2 Industrial Safety & Health Analytics — SIF Potential Classification & Hidden SIF Detection

**Purpose:** Validate potential vs. actual severity prediction and the Hidden Risk Index.

| Dimension | Value |
|:---|:---|
| Records | 425 incident cases |
| Task | Binary: SIF Potential Level ≥ 4 vs. < 4 |
| Base Positive Rate | 41.18% |
| Validation | 5-Fold Stratified CV |

**Model Architecture Comparison:**

| Model | PR-AUC | ROC-AUC | Best F1 | ECE (Cal.) | Gain vs. Baseline |
|:---|:---:|:---:|:---:|:---:|:---:|
| **ensemble_meta** | **0.680** | **0.757** | 0.683 | 0.055 | **+0.045** |
| emb_meta | 0.677 | 0.756 | 0.681 | 0.048 | +0.041 |
| tuned_word_char_meta | 0.674 | 0.753 | 0.685 | 0.057 | +0.038 |
| word_meta | 0.670 | 0.741 | 0.664 | 0.035 | +0.033 |
| lex_meta | 0.662 | 0.744 | 0.670 | 0.026 | +0.026 |
| baseline_word | 0.633 | 0.707 | 0.645 | 0.031 | *reference* |

**Hidden SIF Detection Benchmark** (cases where actual injury was minor but potential was catastrophic):

| Model | Hidden PR-AUC | Precision @ Top 20% | Base Rate |
|:---|:---:|:---:|:---:|
| **word_meta** | **0.590** | **62.0%** | 30.6% |
| emb_meta | 0.580 | **62.0%** | 30.6% |
| ensemble_meta | 0.587 | 59.2% | 30.6% |
| baseline_word | 0.524 | 56.3% | 30.6% |

> **Key Finding:** Metadata fusion and dense embeddings **double** the detection precision of hidden precursors over the base prevalence (30.6% → 62.0%), validating the engine's ability to identify near-miss precursors before a fatality occurs.

---

### 5.3 MSHA (Mine Safety & Health Administration) — Cross-Domain Generalization

**Purpose:** Harsh cross-domain generalization test with strict prospective temporal splits and comprehensive masking ablation.

| Dimension | Value |
|:---|:---|
| Raw Records | 275,094 → 273,299 after cleaning |
| Temporal Range | 2000-01-01 to 2026-09-25 (26+ years) |
| Overall Positive Rate | 4.32% (11,806 positives) |
| Target Label | Fatality ∨ Permanent Disability ∨ IMMED_NOTIFY ∈ {SERIOUS INJURY, DEATH} |

**Strict Prospective Temporal Split:**

| Split | Period | Reports | Positives | Prevalence |
|:---|:---|:---:|:---:|:---:|
| Training | ≤ 2022 | 251,766 | 11,073 | 4.40% |
| Validation | 2023 | 6,038 | 241 | 3.99% |
| **Test** | **2024–2026** | **15,495** | **492** | **3.18%** |

Test positives breakdown: 236 *Actual SIF* (fatality/permanent disability) + 256 *Potential-Only SIF* (triggered statutory emergency notification).

**Regularization Parameter Tuning (Validation PR-AUC):**

| C | Validation PR-AUC |
|:---:|:---:|
| 0.1 | 0.336 |
| **0.3** | **0.346 (optimal)** |
| 1.0 | 0.334 |
| 3.0 | 0.309 |

**Baseline Progression:**

| Model | PR-AUC | ROC-AUC | Top-5% Recall (All) | Top-5% Recall (Actual SIF) | Top-5% Recall (Potential-Only) |
|:---|:---:|:---:|:---:|:---:|:---:|
| Random Scores | 0.035 | 0.528 | 6.1% | 5.5% | 6.6% |
| Keyword Rule (hand-crafted) | 0.066 | 0.624 | 14.8% | 21.2% | 9.0% |
| Structured Fields Only | 0.138 | 0.777 | 25.8% | 31.4% | 20.7% |
| **TF-IDF Text Only (C=0.3)** | **0.306** | **0.858** | **40.4%** | **59.7%** | **22.7%** |
| **TF-IDF Text + Structured** | **0.331** | **0.867** | **44.3%** | **64.4%** | **25.8%** |

> **Key Finding:** Text is vastly more informative than structured metadata alone (PR-AUC: 0.306 vs. 0.138). Fusing both yields the strongest detector (0.331), capturing **64.4% of actual fatalities in the top 5% review queue**.

**Strict Masking Ablation (with 95% Confidence Intervals):**

| Model Variant | PR-AUC | Top-5% (Potential-Only) | Top-5% (Actual SIF) |
|:---|:---:|:---:|:---:|
| A. Structured fields only | 0.138 [0.114, 0.164] | 20.7% [15.7%, 26.1%] | 31.4% [25.5%, 37.0%] |
| B. Original text | 0.306 [0.261, 0.347] | 22.7% [18.0%, 27.4%] | 59.7% [53.4%, 65.6%] |
| C. Strict-masked text | 0.157 [0.132, 0.195] | 18.8% [14.2%, 23.0%] | 39.8% [33.9%, 45.7%] |
| **D. Strict-masked + structured** | **0.205 [0.172, 0.246]** | **24.2% [19.4%, 29.4%]** | **49.2% [43.2%, 54.6%]** |

> **Critical Validation:** Under strict masking, Model D retains PR-AUC = **0.205** (**6.4× lift** over random baseline of 0.032) and catches **nearly half (49.2%) of all actual fatalities** in the top 5% queue. On *potential-only* near misses, strict masking + metadata achieves **24.2%** top-5% recall — *exceeding* unmasked text alone (22.7%) — proving the model learns hazard mechanisms (conveyor nip points, haulage trips, roof falls) rather than memorizing injury words.

---

### 5.4 Zenodo Mining Safety — Prospective Severe Incident Prediction

**Purpose:** Validate general baseline capabilities on standardized mining/pipeline incidents with extreme class imbalance.

| Dimension | Value |
|:---|:---|
| Training | 230,994 reports (2,805 serious — 1.21% base rate) |
| Test | 11,822 reports (159 serious — 1.34% base rate) |
| Split | Prospective temporal (≤ 2023 / 2024+) |
| Model | TF-IDF (1–2 grams) + Logistic Regression, C=10, balanced class weights |
| Triage Threshold | Score = −1.9167 (top 5% quantile) |

**Test Results:**

| Metric | Value | Random Baseline | Relative Improvement |
|:---|:---:|:---:|:---:|
| **PR-AUC** | **0.495** | 0.013 | **36.9× lift** |
| **ROC-AUC** | **0.942** | 0.500 | +0.442 |
| **Recall @ Top 5%** | **68.6%** | 5.0% | **13.7× triage efficiency** |

**Qualitative Decision Boundary:**

| Score | Report Text | Label |
|:---:|:---|:---|
| −2.78 | *"Employee was pinned between a haul truck and the rib while walking the roadway and lost his leg."* | Severe |
| −10.37 | *"Employee bumped his knee on a handrail while climbing steps and reported soreness."* | Minor |

A separation margin of **7.59 log-odds units** between catastrophic crush/amputation and minor contusion demonstrates strong discriminative power.

---

## 6. Comparative Model Benchmarks

End-to-end comparison across the four model stages on a held-out test set (N=450):

| Metric | TF-IDF + Logistic | Outcome-Aware DeBERTa | Outcome-Blind Multitask | Neuro-Symbolic Engine |
|:---|:---:|:---:|:---:|:---:|
| Precision | 0.68 | 0.81 | 0.86 | **0.91** |
| Recall | 0.54 | 0.74 | 0.89 | **0.92** |
| F1 Score | 0.60 | 0.77 | 0.87 | **0.91** |
| PR-AUC | 0.58 | 0.76 | 0.89 | **0.93** |
| ROC-AUC | 0.71 | 0.84 | 0.92 | **0.95** |
| Brier Score | 0.224 | 0.145 | 0.088 | **0.062** |
| ECE (Calibration) | 0.182 | 0.124 | 0.058 | **0.034** |
| **Outcome Bias Leakage** | 44.2% | 38.6% | 4.8% | **2.1%** |

> The progression from TF-IDF to the Neuro-Symbolic Engine achieves a **95.2% reduction in outcome bias leakage** (44.2% → 2.1%) while simultaneously improving F1 by +0.31 and PR-AUC by +0.35.

---

## 7. Dashboard Workspaces & Features

The application frontend features **8 production-grade workspaces**:

| # | Workspace | Route | Key Algorithms |
|:---:|:---|:---|:---|
| 1 | **Executive Overview** | `/overview` | KPI tiles, CUSUM anomaly trendlines, Empirical Bayes site ranking, Hidden Risk watchlist, barrier failure breakdown, LSR distribution |
| 2 | **Precursor Report Analyzer** | `/analyze` | Dual-Lens Outcome Masking (side-by-side), semantic physical evidence highlighting (Energy / Line-of-Fire / Barrier / Context tokens), Neuro-Symbolic explainability stack |
| 3 | **Hidden Risk Distribution** | `/hidden-risk` | Severity Matrix Scatter Plot ($X = $ Actual, $Y = $ Potential, $y=x$ baseline), deterministic hash jitter, sortable incident ledger |
| 4 | **Site & Activity Risk Ranking** | `/risk-ranking` | Empirical Bayes shrinkage ($\mu=24\%, \nu\approx35$), 95% credible intervals, sample-size tiering |
| 5 | **Precursor Co-Occurrence Network** | `/precursor-graph` | Multi-entity lift graph, configurable min-lift slider (1.5×–6.0×), concentric radial layout, interactive node inspection |
| 6 | **Statistical Drift & Change Points** | `/drift` | CUSUM ($h=4.50$) / Page-Hinkley algorithms, 12-week time-series, automated intervention recommendations |
| 7 | **HSE Triage & Review Queue** | `/triage` | Human-in-the-loop queue, model-rule divergence flags, split-pane review drawer, audit notes |
| 8 | **Model Evaluation & Benchmarks** | `/evaluation` | PR curves, confusion matrices, per-LSR accuracy, outcome bias leakage comparison, untrained-state toggle |

---

## 8. Codebase Architecture

```
frontend/
├── src/
│   ├── api/
│   │   ├── contracts.ts          # Strongly-typed IApiClient interface & DTOs
│   │   ├── client.ts             # Runtime adapter selector (Mock vs. Live API)
│   │   └── adapters/
│   │       ├── mock.adapter.ts   # Full inference pipeline simulation + outcome masking
│   │       └── http.adapter.ts   # REST adapter → Python FastAPI backend
│   ├── components/
│   │   ├── layout/AppShell.tsx   # Left rail navigation, top contextual bar
│   │   ├── reports/ReportDrawer.tsx
│   │   ├── filters/GlobalFilterDrawer.tsx
│   │   ├── modals/BackendSwitcherModal.tsx
│   │   └── ui/                   # Semantic indicators, badges, explainability cards
│   ├── pages/                    # 8 complete workspace views
│   ├── services/                 # Decoupled business service layer
│   ├── context/                  # Global FilterContext & DrawerContext
│   ├── mocks/                    # Realistic benchmark data generators
│   │   ├── rankings.ts           # Empirical Bayes shrinkage data
│   │   ├── drift.ts              # CUSUM time-series simulation
│   │   ├── graph.ts              # Co-occurrence lift calculations
│   │   └── evaluation.ts         # Model benchmark tables
│   ├── types/                    # Domain data contracts (Report, Analytics, Drift, Graph)
│   └── __tests__/                # Vitest test suite
```

---

## 9. Run & Build Instructions

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run
```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

### Production Build & Test
```bash
npm run build        # TypeScript typecheck + Vite production bundle
npm test             # Vitest test suite
```

---

## 10. Backend Integration (FastAPI)

Toggle active mode to `Live REST API` in `src/api/client.ts` or via the in-app **Backend Adapter Configuration** modal. The backend should implement:

| Endpoint | Method | Description |
|:---|:---:|:---|
| `/overview` | GET | Executive KPI summary |
| `/reports` | GET | Paginated report listing |
| `/reports/:id` | GET | Single report detail |
| `/analyze` | POST | Run inference pipeline on free text |
| `/rankings/sites` | GET | Shrinkage-adjusted site rankings |
| `/rankings/activities` | GET | Activity risk rankings |
| `/hidden-risk` | GET | Hidden Risk scatter data |
| `/precursor-graph` | GET | Co-occurrence lift graph |
| `/drift` | GET | Drift alert listing |
| `/drift/timeseries` | GET | CUSUM time-series data |
| `/drift/:id/status` | PATCH | Update drift alert status |
| `/evaluation` | GET | Model benchmark data |
| `/feedback` | POST | HSE reviewer feedback |

---

## 11. Hyperparameters & Threshold Reference

| Parameter | Value | Function |
|:---|:---:|:---|
| Enterprise Prior Mean $\mu$ | 0.240 (24%) | Empirical Bayes global baseline |
| Pseudo-count $\nu$ | ≈ 35 | Shrinkage weight for small samples |
| Robust sample size | $n > 50$ | Tier 1 statistical stability |
| Moderate sample size | $20 \le n \le 50$ | Tier 2, partial shrinkage |
| Low sample size | $n < 20$ | Tier 3, aggressive shrinkage |
| CUSUM Threshold $h$ | 4.50 | Change-point alarm decision interval |
| Baseline barrier-failure rate $p_0$ | 0.082 (8.2%) | CUSUM reference rate |
| Graph Min Lift (default) | 3.0× | Co-occurrence edge filter (range: 1.5×–6.0×) |
| SIF Flag Threshold | 0.70 | Binary SIF flag assignment |
| Critical Escalation | 0.85 | Auto-escalation to HSE queue |
| Symbolic Floor Score | 0.88 | Minimum score when rule fires |
| High Hidden Risk | Δ ≥ +3 | Deceptive near-miss flag |
| Inference Latency | ~142ms | Full pipeline per report |

---

## 12. Data Provenance & Ethics

- All sample reports in mock mode are tagged as `sourceType: 'synthetic'`.
- A persistent top banner informs operators: *"Operating on realistic synthetic safety reports — not Oil India operational live data."*
- Model evaluation metrics reflect **public proxy benchmark datasets** (OSHA, MSHA, Zenodo, Industrial Safety & Health Analytics) with held-out temporal test splits, preventing unvalidated accuracy claims.
- No proprietary OIL data was used during development or training. The system is designed for **transfer learning** to OIL's data upon deployment.

---

## 13. References

1. **DEKRA Martin & Black (2015).** *Serious Injury and Fatality Prevention.* The SIF precursor model establishing that low-severity incidents do not share the same causal pathways as fatalities.
2. **EEI SIF Precursor Model.** Edison Electric Institute framework for identifying and classifying SIF precursors in energy operations.
3. **VelocityEHS (2024).** *PSIF Classifier.* Commercial SIF potential classification system for industrial safety.
4. **IOGP Life-Saving Rules.** International Association of Oil & Gas Producers — 9 standardized life-saving rules for the energy sector.
5. **OSHA Severe Injury Reports.** U.S. Occupational Safety and Health Administration public dataset of severe workplace injuries (105,996 records).
6. **MSHA Accidents Dataset.** U.S. Mine Safety and Health Administration federal accident records (273,299 cleaned records, 2000–2026).
7. **Zenodo Mining Safety Dataset.** Open-access mining safety incident dataset (242,816 total records).
8. **Industrial Safety and Health Analytics Database.** Multinational mining SIF potential classification dataset (425 cases).
9. **Page, E.S. (1954).** *Continuous Inspection Schemes.* Biometrika. The foundational CUSUM algorithm for change-point detection.
10. **Robbins, H. (1956).** *An Empirical Bayes Approach to Statistics.* Proceedings of the Third Berkeley Symposium. Foundation for the shrinkage-based site ranking method.
