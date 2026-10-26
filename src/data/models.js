export const models = [
  {
    id: "descriptive-stats",
    title: "Descriptive Statistics",
    description: "Summarize and visualize epidemiological data distributions",
    icon: "mdi-chart-bell-curve",
    color: "teal",
    component: "DescriptiveStatsVisualizer",
    route: "/modelling/descriptive-stats",
    category: "Biostatistics",
    availableModels: ["Summary Stats", "Frequency Tables", "Cross-tabulation"],
    modelInfo: {
      description:
        "Descriptive statistics provide simple summaries about the sample and measures in epidemiological studies.",
      outputs: [
        "Mean/Median/Mode",
        "Standard Deviation",
        "Percentiles",
        "Frequency Distribution",
      ],
    },
  },
  {
    id: "distribution-explorer",
    title: "Distribution Explorer",
    description: "Explore probability distributions common in epidemiology",
    icon: "mdi-chart-histogram",
    color: "cyan",
    component: "DistributionExplorer",
    route: "/modelling/distributions",
    category: "Biostatistics",
    availableModels: [
      "Normal",
      "Poisson",
      "Binomial",
      "Negative Binomial",
      "Exponential",
    ],
    modelInfo: {
      description:
        "Probability distributions used in disease modeling, count data analysis, and survival analysis.",
      outputs: [
        "PDF/CDF Plots",
        "Quantiles",
        "Random Samples",
        "Goodness-of-Fit Tests",
      ],
    },
  },
  {
    id: "hypothesis-testing",
    title: "Hypothesis Testing",
    description:
      "Statistical tests for comparing groups and assessing significance",
    icon: "mdi-alert-decagram",
    color: "purple",
    component: "HypothesisTestWorkbench",
    route: "/modelling/hypothesis-tests",
    category: "Biostatistics",
    availableModels: [
      "t-test",
      "Chi-square",
      "ANOVA",
      "Mann-Whitney",
      "Wilcoxon",
    ],
    modelInfo: {
      description:
        "Formal statistical procedures for testing hypotheses about population parameters using sample data.",
      outputs: [
        "P-values",
        "Confidence Intervals",
        "Test Statistics",
        "Effect Sizes",
      ],
    },
  },
  {
    id: "stat-approaches",
    title: "Statistical Approaches",
    description: "Regression and advanced statistical modeling techniques",
    icon: "mdi-chart-box",
    color: "deep-purple",
    component: "RegressionModeler",
    route: "/modelling/statapproaches",
    category: "Biostatistics",
    availableModels: ["Regression", "GLM", "Mixed Models"],
    modelInfo: {
      description:
        "Advanced statistical methods for analyzing epidemiological data including regression models and mixed effects.",
      outputs: [
        "Odds Ratios",
        "Confidence Intervals",
        "ROC Curve",
        "Model Diagnostics",
      ],
    },
  },
  {
    id: "study-designs",
    title: "Study Designs",
    description:
      "Experimental and observational study frameworks used to test hypothesis",
    icon: "mdi-flask",
    color: "info",
    component: "StudyDesignComparator",
    route: "/modelling/studydesigns",
    category: "Epidemiology",
    availableModels: ["RCT", "Cohort", "Case-Control"],
    modelInfo: {
      description:
        "Various study designs for epidemiological research including randomized controlled trials and observational studies.",
      outputs: [
        "Study Protocol",
        "Sample Size",
        "Bias Assessment",
        "Power Analysis",
      ],
    },
  },
  {
    id: "causal-inference",
    title: "Causal Inference",
    description:
      "Methods for establishing causal relationships in observational data",
    icon: "mdi-arrow-decision",
    color: "orange",
    component: "CausalInferenceBuilder",
    route: "/modelling/causal-inference",
    category: "Epidemiology",
    availableModels: [
      "DAG",
      "Randomization",
      "Instr Variables",
      "Diff-in-Diff",
    ],
    modelInfo: {
      description:
        "Causal inference methods help determine whether a treatment or exposure actually causes an outcome, going beyond mere association.",
      outputs: [
        "Causal DAG",
        "Treatment Effect",
        "Sensitivity",
        "Counterfactual",
      ],
    },
  },
  {
    id: "sir-seir",
    title: "SIR / SEIR Models",
    description:
      "Compartmental infectious disease models for epidemic simulation",
    icon: "mdi-biohazard",
    color: "error",
    component: "OutbreakResponseSimulator",
    route: "/modelling/infectious-disease-modeler",
    category: "Infectious Disease",
    availableModels: ["SIR", "SEIR", "Agent-Based", "Vaccination"],
    modelInfo: {
      description:
        "The SEIR model extends SIR by adding an Exposed compartment for individuals who have been exposed but are not yet infectious. Useful for diseases with an incubation period.",
      outputs: ["Epidemic Curve", "R0 Value", "Peak Infection", "Final Size"],
    },
  },
  {
    id: "econometrics",
    title: "Econometrics",
    description: "Statistical and economic modeling for healthcare decisions",
    icon: "mdi-chart-line",
    color: "success",
    component: "EconometricsSimulator",
    route: "/modelling/econometrics",
    category: "Health Economics",
    availableModels: ["ICER", "Cost-Benefit", "Cost-Utility"],
    modelInfo: {
      description:
        "Incremental Cost-Effectiveness Ratio (ICER) compares the cost and health outcomes of two interventions.",
      outputs: [
        "Cost-Effectiveness",
        "ICER Value",
        "DALYs Averted",
        "Budget Impact",
      ],
    },
  },
];
