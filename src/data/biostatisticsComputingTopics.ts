// computational-life-sciences-topics.ts
// A comprehensive topic catalogue for Computational Life Sciences
// Covering the full spectrum from foundational to advanced topics
// with balanced software distribution across R, Python, STATA, MATLAB, and Julia

export type LearningLevel = "Basic" | "Intermediate" | "Advanced";

export type TopicDomain =
  // Core Life Sciences
  | "Biostatistics"
  | "Epidemiology"
  | "Infectious Disease Modeling"
  | "Genomic Epidemiology"
  | "Computational Genomics"
  | "Bioinformatics"
  | "Systems Biology"
  | "Computational Biology"
  | "Structural Biology"
  | "Molecular Dynamics"
  // Data Science & Computation
  | "Data Science"
  | "Machine Learning"
  | "Deep Learning"
  | "Computational Methods"
  | "High-Performance Computing"
  | "Cloud Computing"
  | "Data Engineering"
  // Mathematical & Statistical
  | "Mathematical Modeling"
  | "Statistical Genetics"
  | "Causal Inference"
  | "Bayesian Methods"
  | "Time Series Analysis"
  // Spatial & Environmental
  | "Spatial Epidemiology"
  | "Environmental Health"
  | "Geospatial Analysis"
  // Clinical & Translational
  | "Clinical Informatics"
  | "Health Informatics"
  | "Drug Discovery"
  | "Pharmacogenomics"
  // Specialized
  | "Lab Practice"
  | "Research Computing"
  | "Reproducible Research"
  | "Data Visualization";

export interface TopicDetail {
  title: string;
  level: LearningLevel;
  domain: TopicDomain;
  description: string;
  keywords: string[];
  complexity: "Low" | "Medium" | "High" | "Very High";
  software?: ("R" | "Python" | "STATA" | "MATLAB" | "Julia" | "SQL" | "Bash")[];
  prerequisites?: string[];
  estimatedTime?: string; // Hours or weeks to master
  applications?: string[]; // Real-world applications
}

export const computationalLifeSciencesTopics: TopicDetail[] = [
  // ============================================================
  // SECTION 1: BASIC LEVEL (55 topics)
  // ============================================================

  // ──────────────────────────────────────────────
  // 1.1 Programming & Data Science Fundamentals (20)
  // ──────────────────────────────────────────────
  {
    title: "Introduction to Unix/Linux for Life Sciences",
    level: "Basic",
    domain: "Computational Methods",
    description:
      "Command-line essentials for life scientists: navigating filesystems, managing files, permissions, and basic shell scripting for bioinformatics workflows.",
    keywords: [
      "Unix",
      "Linux",
      "Bash",
      "command-line",
      "shell scripting",
      "filesystem",
    ],
    complexity: "Low",
    software: ["Bash"],
    prerequisites: [],
    estimatedTime: "20 hours",
    applications: [
      "HPC cluster access",
      "bioinformatics pipeline development",
      "data management",
    ],
  },
  {
    title: "Version Control with Git and GitHub",
    level: "Basic",
    domain: "Reproducible Research",
    description:
      "Essential version control for collaborative computational research: Git workflows, branching strategies, GitHub/GitLab integration, and reproducible science practices.",
    keywords: [
      "Git",
      "GitHub",
      "version control",
      "collaboration",
      "reproducible",
    ],
    complexity: "Low",
    software: ["Bash"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "15 hours",
    applications: [
      "Collaborative code development",
      "scientific reproducibility",
      "project management",
    ],
  },
  {
    title: "Python Fundamentals for Life Sciences",
    level: "Basic",
    domain: "Data Science",
    description:
      "Core Python programming: data types, control structures, functions, modules, and OOP principles applied to biological data processing.",
    keywords: ["Python", "variables", "loops", "functions", "OOP", "modules"],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: [],
    estimatedTime: "40 hours",
    applications: ["Data processing", "automation", "scientific computing"],
  },
  {
    title: "R Fundamentals for Life Sciences",
    level: "Basic",
    domain: "Data Science",
    description:
      "Core R programming: vectors, data frames, functions, and basic statistical computing for biological data analysis.",
    keywords: ["R", "vectors", "data frames", "functions", "statistics"],
    complexity: "Medium",
    software: ["R"],
    prerequisites: [],
    estimatedTime: "40 hours",
    applications: [
      "Statistical analysis",
      "data visualization",
      "biostatistics",
    ],
  },
  {
    title: "Julia Fundamentals for Scientific Computing",
    level: "Basic",
    domain: "Computational Methods",
    description:
      "Introduction to Julia for high-performance scientific computing: syntax, multiple dispatch, and scientific libraries for life sciences.",
    keywords: [
      "Julia",
      "multiple dispatch",
      "performance",
      "scientific computing",
    ],
    complexity: "Medium",
    software: ["Julia"],
    prerequisites: [],
    estimatedTime: "30 hours",
    applications: [
      "High-performance computing",
      "simulation",
      "scientific modeling",
    ],
  },
  {
    title: "Working with Biological Data Formats",
    level: "Basic",
    domain: "Computational Methods",
    description:
      "Understanding and processing common biological data formats: FASTA, FASTQ, GFF, VCF, BED, and SAM/BAM. Format conversion and validation.",
    keywords: ["FASTA", "FASTQ", "GFF", "VCF", "BED", "SAM", "BAM"],
    complexity: "Medium",
    software: ["Python", "Bash"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "25 hours",
    applications: [
      "Genomics",
      "NGS data processing",
      "bioinformatics pipelines",
    ],
  },
  {
    title: "Data Wrangling with Python (Pandas)",
    level: "Basic",
    domain: "Data Science",
    description:
      "Data manipulation and cleaning with Pandas: DataFrames, filtering, grouping, merging, reshaping, and handling missing data in biological datasets.",
    keywords: [
      "pandas",
      "DataFrame",
      "data cleaning",
      "groupby",
      "merge",
      "reshape",
    ],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: ["Python fundamentals"],
    estimatedTime: "30 hours",
    applications: [
      "Epidemiological data analysis",
      "genomic data processing",
      "research data management",
    ],
  },
  {
    title: "Data Wrangling with R (dplyr/tidyr)",
    level: "Basic",
    domain: "Data Science",
    description:
      "Data manipulation with tidyverse: dplyr verbs, tidyr functions, and the pipe operator for efficient biological data analysis.",
    keywords: [
      "dplyr",
      "tidyr",
      "tidyverse",
      "data wrangling",
      "pipe operator",
    ],
    complexity: "Medium",
    software: ["R"],
    prerequisites: ["R fundamentals"],
    estimatedTime: "25 hours",
    applications: [
      "Biostatistics",
      "data cleaning",
      "research data management",
    ],
  },
  {
    title: "Data Visualization with Python (Matplotlib/Seaborn)",
    level: "Basic",
    domain: "Data Visualization",
    description:
      "Creating publication-quality plots: Matplotlib fundamentals, Seaborn for statistical visualizations, and interactive plots with Plotly.",
    keywords: ["matplotlib", "seaborn", "visualization", "plots", "figures"],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: ["Python fundamentals"],
    estimatedTime: "25 hours",
    applications: [
      "Scientific figures",
      "exploratory data analysis",
      "publication-ready plots",
    ],
  },
  {
    title: "Data Visualization with R (ggplot2)",
    level: "Basic",
    domain: "Data Visualization",
    description:
      "Grammar of graphics with ggplot2: layers, aesthetics, themes, and extensions for sophisticated biological data visualization.",
    keywords: [
      "ggplot2",
      "grammar of graphics",
      "layers",
      "themes",
      "visualization",
    ],
    complexity: "Medium",
    software: ["R"],
    prerequisites: ["R fundamentals"],
    estimatedTime: "25 hours",
    applications: [
      "Scientific figures",
      "publication-ready plots",
      "exploratory data analysis",
    ],
  },
  {
    title: "Introduction to SQL for Life Sciences",
    level: "Basic",
    domain: "Data Engineering",
    description:
      "Relational database fundamentals: SQL queries, joins, subqueries, and data aggregation for biological databases like GenBank, ClinVar, and dbSNP.",
    keywords: ["SQL", "queries", "joins", "databases", "GenBank", "ClinVar"],
    complexity: "Medium",
    software: ["SQL"],
    prerequisites: [],
    estimatedTime: "20 hours",
    applications: [
      "Biomedical databases",
      "clinical data management",
      "research data repositories",
    ],
  },
  {
    title: "Statistical Thinking for Life Scientists",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Core statistical concepts: descriptive statistics, probability distributions, hypothesis testing, confidence intervals, and p-values in biological context.",
    keywords: [
      "statistics",
      "probability",
      "hypothesis testing",
      "confidence intervals",
      "p-values",
    ],
    complexity: "Medium",
    software: ["R", "Python"],
    prerequisites: [],
    estimatedTime: "30 hours",
    applications: [
      "Clinical trials",
      "epidemiological studies",
      "experimental design",
    ],
  },
  {
    title: "Experimental Design and Power Analysis",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Designing biological experiments: sample size calculation, power analysis, randomization, blocking, and factorial designs for life sciences.",
    keywords: [
      "experimental design",
      "power analysis",
      "sample size",
      "randomization",
      "blocking",
    ],
    complexity: "Medium",
    software: ["R", "STATA"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "20 hours",
    applications: [
      "Clinical trials",
      "lab experiments",
      "pre-clinical studies",
    ],
  },
  {
    title: "Reproducible Research with Jupyter Notebooks",
    level: "Basic",
    domain: "Reproducible Research",
    description:
      "Creating reproducible research workflows: Jupyter notebooks, markdown, code cells, and integrating narrative with analysis for life sciences.",
    keywords: [
      "Jupyter",
      "notebooks",
      "reproducible",
      "markdown",
      "computational narratives",
    ],
    complexity: "Low",
    software: ["Python"],
    prerequisites: ["Python fundamentals"],
    estimatedTime: "15 hours",
    applications: [
      "Scientific publications",
      "research notebooks",
      "teaching materials",
    ],
  },
  {
    title: "Reproducible Research with R Markdown/Quarto",
    level: "Basic",
    domain: "Reproducible Research",
    description:
      "Creating reproducible reports: R Markdown, Quarto, literate programming, and dynamic document generation for life sciences publications.",
    keywords: [
      "R Markdown",
      "Quarto",
      "literate programming",
      "reproducible",
      "dynamic documents",
    ],
    complexity: "Medium",
    software: ["R"],
    prerequisites: ["R fundamentals"],
    estimatedTime: "15 hours",
    applications: [
      "Scientific manuscripts",
      "reports",
      "presentations",
      "thesis writing",
    ],
  },
  {
    title: "Introduction to MATLAB for Life Sciences",
    level: "Basic",
    domain: "Computational Methods",
    description:
      "MATLAB for life sciences: matrices, vectorized operations, visualization, and specialized toolboxes for bioinformatics and image processing.",
    keywords: [
      "MATLAB",
      "matrix",
      "vectorized",
      "toolboxes",
      "image processing",
    ],
    complexity: "Medium",
    software: ["MATLAB"],
    prerequisites: [],
    estimatedTime: "25 hours",
    applications: ["Medical image analysis", "signal processing", "modeling"],
  },
  {
    title: "Introduction to Julia for Bioinformatics",
    level: "Basic",
    domain: "Computational Methods",
    description:
      "Julia for bioinformatics: high-performance computing, BioJulia ecosystem, and efficient processing of large biological datasets.",
    keywords: ["Julia", "BioJulia", "high-performance", "biological data"],
    complexity: "Medium",
    software: ["Julia"],
    prerequisites: ["Julia fundamentals"],
    estimatedTime: "25 hours",
    applications: [
      "Genomics",
      "large-scale biological computing",
      "HPC workflows",
    ],
  },
  {
    title: "Introduction to Python for Biologists",
    level: "Basic",
    domain: "Computational Biology",
    description:
      "Python tailored for biology: Biopython for sequence analysis, PyMOL for structure, and specialized libraries for biological data processing.",
    keywords: ["Biopython", "PyMOL", "biological data", "bioinformatics"],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: ["Python fundamentals"],
    estimatedTime: "30 hours",
    applications: ["Genomics", "proteomics", "structural biology"],
  },
  {
    title: "Introduction to R for Biologists",
    level: "Basic",
    domain: "Computational Biology",
    description:
      "R for biological data analysis: Bioconductor framework, specialized packages for genomics, transcriptomics, and high-throughput data.",
    keywords: [
      "Bioconductor",
      "R",
      "genomics",
      "transcriptomics",
      "high-throughput",
    ],
    complexity: "Medium",
    software: ["R"],
    prerequisites: ["R fundamentals"],
    estimatedTime: "30 hours",
    applications: ["Genomics", "transcriptomics", "bioinformatics"],
  },
  {
    title: "Introduction to Bioinformatics Databases",
    level: "Basic",
    domain: "Bioinformatics",
    description:
      "Accessing and retrieving biological data from major databases: GenBank, EMBL, DDBJ, UniProt, PDB, and RefSeq using APIs and web interfaces.",
    keywords: ["GenBank", "UniProt", "PDB", "RefSeq", "database retrieval"],
    complexity: "Medium",
    software: ["Python", "Bash"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "25 hours",
    applications: [
      "Genomic data retrieval",
      "protein structure",
      "annotation pipelines",
    ],
  },

  // ──────────────────────────────────────────────
  // 1.2 Basic Biostatistics & Epidemiology (20)
  // ──────────────────────────────────────────────
  {
    title: "Descriptive Epidemiology and Measures of Disease Frequency",
    level: "Basic",
    domain: "Epidemiology",
    description:
      "Fundamental epidemiological measures: prevalence, incidence, attack rates, morbidity, and mortality. Age-adjusted rates and standardization techniques.",
    keywords: [
      "prevalence",
      "incidence",
      "morbidity",
      "mortality",
      "age-adjustment",
    ],
    complexity: "Medium",
    software: ["R", "STATA"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "20 hours",
    applications: [
      "Disease surveillance",
      "public health monitoring",
      "clinical epidemiology",
    ],
  },
  {
    title: "Measures of Association in Epidemiology",
    level: "Basic",
    domain: "Epidemiology",
    description:
      "Core measures of association: risk ratios, rate ratios, odds ratios, and attributable fractions. Interpretation and confidence intervals.",
    keywords: [
      "risk ratio",
      "rate ratio",
      "odds ratio",
      "attributable fraction",
      "CI",
    ],
    complexity: "Medium",
    software: ["R", "STATA"],
    prerequisites: ["Descriptive epidemiology"],
    estimatedTime: "20 hours",
    applications: [
      "Epidemiological studies",
      "clinical research",
      "risk assessment",
    ],
  },
  {
    title: "Epidemiological Study Designs",
    level: "Basic",
    domain: "Epidemiology",
    description:
      "Understanding and applying study designs: cohort studies, case-control studies, cross-sectional studies, and ecological studies in life sciences.",
    keywords: [
      "cohort",
      "case-control",
      "cross-sectional",
      "ecological",
      "study design",
    ],
    complexity: "Medium",
    software: [],
    prerequisites: ["Measures of association"],
    estimatedTime: "25 hours",
    applications: [
      "Research design",
      "clinical trials",
      "observational studies",
    ],
  },
  {
    title: "Linear Regression in R",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Fitting and interpreting linear regression models: simple and multiple regression, categorical predictors, interactions, model diagnostics, and assumptions.",
    keywords: [
      "linear regression",
      "lm",
      "coefficients",
      "diagnostics",
      "assumptions",
    ],
    complexity: "Medium",
    software: ["R"],
    prerequisites: ["R fundamentals", "Statistical thinking"],
    estimatedTime: "25 hours",
    applications: [
      "Predictive modeling",
      "confounding adjustment",
      "research analysis",
    ],
  },
  {
    title: "Linear Regression in Python (StatsModels/sklearn)",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Regression modeling in Python: StatsModels for inferential statistics and scikit-learn for predictive modeling, with diagnostic validation.",
    keywords: [
      "statsmodels",
      "sklearn",
      "linear regression",
      "inference",
      "prediction",
    ],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: ["Python fundamentals", "Statistical thinking"],
    estimatedTime: "20 hours",
    applications: [
      "Predictive modeling",
      "statistical inference",
      "research analysis",
    ],
  },
  {
    title: "Logistic Regression in R",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Binary logistic regression: modeling binary outcomes, odds ratios, model fit, variable selection, and ROC analysis for diagnostic tests.",
    keywords: ["logistic regression", "glm", "odds ratios", "ROC", "model fit"],
    complexity: "Medium",
    software: ["R"],
    prerequisites: ["Linear regression", "R fundamentals"],
    estimatedTime: "25 hours",
    applications: [
      "Disease prediction",
      "risk modeling",
      "diagnostic test evaluation",
    ],
  },
  {
    title: "Logistic Regression in Python (StatsModels/sklearn)",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Binary classification with Python: logistic regression, odds ratios, classification metrics, and cross-validation for health outcomes.",
    keywords: [
      "logistic regression",
      "classification",
      "sklearn",
      "metrics",
      "cross-validation",
    ],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: ["Python fundamentals", "Statistical thinking"],
    estimatedTime: "20 hours",
    applications: ["Disease prediction", "classification", "risk assessment"],
  },
  {
    title: "Poisson and Negative Binomial Regression",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Modeling count data: Poisson regression, overdispersion, negative binomial models, and rate regression for incidence data.",
    keywords: [
      "Poisson",
      "negative binomial",
      "count data",
      "rate regression",
      "overdispersion",
    ],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Logistic regression"],
    estimatedTime: "30 hours",
    applications: [
      "Incidence rate modeling",
      "disease counts",
      "healthcare utilization",
    ],
  },
  {
    title: "Introduction to Survival Analysis",
    level: "Basic",
    domain: "Biostatistics",
    description:
      "Foundation of survival analysis: Kaplan-Meier curves, log-rank tests, and Cox proportional hazards models for time-to-event data.",
    keywords: ["survival", "Kaplan-Meier", "log-rank", "Cox", "time-to-event"],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "30 hours",
    applications: [
      "Clinical trials",
      "survival studies",
      "time-to-event analysis",
    ],
  },
  {
    title: "Introduction to Bayesian Analysis for Life Sciences",
    level: "Basic",
    domain: "Bayesian Methods",
    description:
      "Foundations of Bayesian thinking: Bayes' theorem, prior and posterior distributions, conjugate priors, and simple Bayesian models for biological data.",
    keywords: ["Bayesian", "priors", "posterior", "conjugate", "MCMC"],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Statistical thinking", "Linear regression"],
    estimatedTime: "35 hours",
    applications: [
      "Clinical trials",
      "diagnostic testing",
      "disease progression",
    ],
  },
  {
    title: "Missing Data Methods",
    level: "Basic",
    domain: "Data Science",
    description:
      "Handling missing data: types of missing data, complete case analysis, single imputation, multiple imputation with mice and similar packages.",
    keywords: [
      "missing data",
      "imputation",
      "mice",
      "multiple imputation",
      "MNAR",
    ],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "25 hours",
    applications: [
      "Clinical studies",
      "epidemiological surveys",
      "research data management",
    ],
  },
  {
    title: "Multiple Imputation with R (mice)",
    level: "Basic",
    domain: "Data Science",
    description:
      "Practical multiple imputation: creating imputation models, pooling results, and diagnostics using the mice package in R.",
    keywords: [
      "mice",
      "multiple imputation",
      "pooling",
      "diagnostics",
      "missing data",
    ],
    complexity: "High",
    software: ["R"],
    prerequisites: ["Missing data methods", "R fundamentals"],
    estimatedTime: "20 hours",
    applications: [
      "Clinical studies",
      "epidemiological surveys",
      "research data analysis",
    ],
  },
  {
    title: "Introduction to Genomic Epidemiology",
    level: "Basic",
    domain: "Genomic Epidemiology",
    description:
      "Combining genomics and epidemiology: studying how genetic variation affects disease distribution, susceptibility, and response to treatment.",
    keywords: [
      "genomic epidemiology",
      "GWAS",
      "genetic variation",
      "disease susceptibility",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Epidemiology basics", "Genetics fundamentals"],
    estimatedTime: "30 hours",
    applications: [
      "Outbreak investigation",
      "disease surveillance",
      "pharmacogenomics",
    ],
  },
  {
    title: "Introduction to Infectious Disease Modeling",
    level: "Basic",
    domain: "Infectious Disease Modeling",
    description:
      "Fundamentals of compartmental models: SIR, SEIR models, basic reproduction number (R₀), and understanding epidemic dynamics.",
    keywords: [
      "SIR",
      "SEIR",
      "R0",
      "compartmental models",
      "epidemic dynamics",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: [
      "Differential equations basics",
      "Epidemiology fundamentals",
    ],
    estimatedTime: "35 hours",
    applications: [
      "Pandemic preparedness",
      "vaccine policy",
      "outbreak prediction",
    ],
  },
  {
    title: "Introduction to Drug Discovery Informatics",
    level: "Basic",
    domain: "Drug Discovery",
    description:
      "Informatics in drug discovery: target identification, molecular databases, lead optimization, and FDA approval pathways.",
    keywords: [
      "drug discovery",
      "target identification",
      "lead optimization",
      "FDA",
      "clinical trials",
    ],
    complexity: "Medium",
    software: ["Python"],
    prerequisites: [],
    estimatedTime: "25 hours",
    applications: [
      "Pharmaceutical R&D",
      "biotech research",
      "drug repurposing",
    ],
  },

  // ──────────────────────────────────────────────
  // 1.3 Basic Bioinformatics (15)
  // ──────────────────────────────────────────────
  {
    title: "Sequence Alignment Algorithms",
    level: "Basic",
    domain: "Bioinformatics",
    description:
      "Fundamental sequence alignment: Needleman-Wunsch, Smith-Waterman, BLAST, FASTA, and alignment visualization for DNA and protein sequences.",
    keywords: [
      "sequence alignment",
      "BLAST",
      "Needleman-Wunsch",
      "Smith-Waterman",
      "FASTA",
    ],
    complexity: "High",
    software: ["Python", "Bash"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "30 hours",
    applications: [
      "Sequence similarity search",
      "phylogenetics",
      "genomic annotation",
    ],
  },
  {
    title: "Introduction to Phylogenetics",
    level: "Basic",
    domain: "Bioinformatics",
    description:
      "Phylogenetic tree reconstruction: distance methods (UPGMA, Neighbor-Joining), character-based methods (Parsimony, Maximum Likelihood), and tree visualization.",
    keywords: ["phylogenetics", "UPGMA", "NJ", "parsimony", "ML"],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Sequence alignment"],
    estimatedTime: "35 hours",
    applications: [
      "Evolutionary biology",
      "pathogen tracking",
      "species classification",
    ],
  },
  {
    title: "Introduction to NGS Data Analysis",
    level: "Basic",
    domain: "Computational Genomics",
    description:
      "Overview of next-generation sequencing data processing: quality control, read alignment, variant calling, and counting for differential expression.",
    keywords: ["NGS", "RNA-seq", "ChIP-seq", "alignment", "variant calling"],
    complexity: "High",
    software: ["Python", "Bash"],
    prerequisites: ["Unix/Linux basics", "Biological data formats"],
    estimatedTime: "40 hours",
    applications: ["Genomics", "transcriptomics", "epigenomics"],
  },
  {
    title: "Quality Control and Preprocessing of NGS Data",
    level: "Basic",
    domain: "Computational Genomics",
    description:
      "NGS data QC: FastQC, adapter trimming (Trimmomatic, Cutadapt), quality filtering, and preprocessing for alignment and assembly.",
    keywords: [
      "FastQC",
      "Trimmomatic",
      "Cutadapt",
      "quality control",
      "preprocessing",
    ],
    complexity: "Medium",
    software: ["Bash", "Python"],
    prerequisites: ["Unix/Linux basics", "Biological data formats"],
    estimatedTime: "20 hours",
    applications: ["RNA-seq", "ChIP-seq", "whole genome sequencing"],
  },
  {
    title: "Read Alignment and Mapping",
    level: "Basic",
    domain: "Computational Genomics",
    description:
      "Aligning NGS reads to reference genomes: BWA, Bowtie, HISAT2, STAR, SAMtools, and alignment post-processing for various NGS applications.",
    keywords: ["BWA", "Bowtie", "HISAT2", "STAR", "SAMtools"],
    complexity: "High",
    software: ["Bash"],
    prerequisites: ["NGS data analysis", "Unix/Linux basics"],
    estimatedTime: "30 hours",
    applications: ["RNA-seq", "DNA-seq", "ChIP-seq"],
  },
  {
    title: "Variant Calling and Annotation",
    level: "Basic",
    domain: "Computational Genomics",
    description:
      "Identifying genomic variants: GATK, FreeBayes, SAMtools, variant filtering, and functional annotation using databases like dbSNP, ClinVar, and CADD.",
    keywords: [
      "GATK",
      "FreeBayes",
      "variant calling",
      "annotation",
      "dbSNP",
      "ClinVar",
    ],
    complexity: "High",
    software: ["Bash", "Python"],
    prerequisites: ["Read alignment", "Unix/Linux basics"],
    estimatedTime: "35 hours",
    applications: ["Clinical genomics", "GWAS", "disease genetics"],
  },
  {
    title: "RNA-Seq Analysis Pipeline",
    level: "Basic",
    domain: "Computational Genomics",
    description:
      "Complete RNA-Seq analysis pipeline: QC, alignment, quantification, differential expression, and functional enrichment analysis using tools like DESeq2, edgeR.",
    keywords: [
      "RNA-seq",
      "DESeq2",
      "edgeR",
      "differential expression",
      "functional enrichment",
    ],
    complexity: "High",
    software: ["R", "Bash"],
    prerequisites: ["NGS data analysis", "R fundamentals"],
    estimatedTime: "40 hours",
    applications: [
      "Gene expression studies",
      "disease transcriptomics",
      "drug response",
    ],
  },
  {
    title: "Proteomics Data Analysis",
    level: "Basic",
    domain: "Bioinformatics",
    description:
      "Proteomics data analysis: mass spectrometry, protein identification, quantification, and differential abundance analysis using tools like MaxQuant, MSFragger.",
    keywords: [
      "proteomics",
      "mass spectrometry",
      "MaxQuant",
      "protein identification",
      "quantification",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "35 hours",
    applications: [
      "Protein expression",
      "biomarker discovery",
      "drug target identification",
    ],
  },
  {
    title: "Introduction to Structural Bioinformatics",
    level: "Basic",
    domain: "Structural Biology",
    description:
      "Fundamentals of protein structure: PDB, structural visualization (PyMOL, Chimera), secondary structure prediction, and structure alignment.",
    keywords: [
      "PDB",
      "PyMOL",
      "Chimera",
      "structure prediction",
      "structure alignment",
    ],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Bioinformatics databases"],
    estimatedTime: "30 hours",
    applications: [
      "Protein engineering",
      "drug design",
      "structural biology research",
    ],
  },
  {
    title: "Introduction to Cheminformatics",
    level: "Basic",
    domain: "Drug Discovery",
    description:
      "Cheminformatics fundamentals: molecular representations (SMILES, InChI), molecular databases (PubChem, ChEMBL), and basic compound property predictions.",
    keywords: ["cheminformatics", "SMILES", "InChI", "PubChem", "ChEMBL"],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Python fundamentals", "Organic chemistry basics"],
    estimatedTime: "30 hours",
    applications: [
      "Drug discovery",
      "compound libraries",
      "toxicity prediction",
    ],
  },
  {
    title: "Single-Cell Analysis and Spatial Transcriptomics",
    level: "Basic",
    domain: "Computational Genomics",
    description:
      "Introduction to single-cell and spatial transcriptomics: analysis of scRNA-seq, scATAC-seq, spatial transcriptomics data, cell type identification.",
    keywords: [
      "single-cell",
      "scRNA-seq",
      "spatial transcriptomics",
      "cell type",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Transcriptomics basics"],
    estimatedTime: "35 hours",
    applications: [
      "Developmental biology",
      "cancer heterogeneity",
      "tissue architecture",
    ],
  },
  {
    title: "Metabolomics Data Analysis",
    level: "Basic",
    domain: "Computational Biology",
    description:
      "Metabolomics: mass spectrometry data processing, metabolite identification, pathway mapping, and integrative analysis with other omics data.",
    keywords: [
      "metabolomics",
      "mass spectrometry",
      "metabolite",
      "pathway mapping",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "35 hours",
    applications: [
      "Disease biomarker discovery",
      "pharmacokinetics",
      "nutrition studies",
    ],
  },
  {
    title: "Microbiome Data Analysis",
    level: "Basic",
    domain: "Computational Biology",
    description:
      "Microbiome data analysis: 16S rRNA sequencing, amplicon processing, OTU/ASV analysis, alpha/beta diversity, and differential abundance testing.",
    keywords: [
      "microbiome",
      "16S rRNA",
      "OTU",
      "diversity",
      "differential abundance",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "35 hours",
    applications: [
      "Gut microbiome research",
      "disease studies",
      "environmental microbiology",
    ],
  },
  {
    title: "Medical Imaging Analysis",
    level: "Basic",
    domain: "Clinical Informatics",
    description:
      "Medical image processing: CT, MRI, PET, image segmentation, feature extraction, and statistical analysis for clinical research.",
    keywords: [
      "medical imaging",
      "CT",
      "MRI",
      "segmentation",
      "feature extraction",
    ],
    complexity: "High",
    software: ["Python", "MATLAB"],
    prerequisites: ["Programming proficiency", "Linear algebra"],
    estimatedTime: "40 hours",
    applications: ["Radiology research", "neuroimaging", "oncology imaging"],
  },
  {
    title: "Introduction to Bioinformatics Workflows",
    level: "Basic",
    domain: "Computational Methods",
    description:
      "Building and running bioinformatics workflows: understanding pipeline structure, using workflow managers, and best practices for reproducible analysis.",
    keywords: [
      "workflows",
      "pipelines",
      "Nextflow",
      "Snakemake",
      "reproducible",
    ],
    complexity: "Medium",
    software: ["Bash", "Python"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "25 hours",
    applications: [
      "Reproducible pipelines",
      "large-scale genomics",
      "automated analysis",
    ],
  },

  // ============================================================
  // SECTION 2: INTERMEDIATE LEVEL (50 topics)
  // ============================================================

  // ──────────────────────────────────────────────
  // 2.1 Advanced Biostatistics & Epidemiology (18)
  // ──────────────────────────────────────────────
  {
    title: "Longitudinal Data Analysis with Mixed Models",
    level: "Intermediate",
    domain: "Biostatistics",
    description:
      "Analyzing repeated measures: linear and generalized linear mixed models (LMM, GLMM), random effects, and longitudinal data structures in clinical studies.",
    keywords: [
      "mixed models",
      "random effects",
      "longitudinal",
      "repeated measures",
    ],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Linear regression", "Statistical thinking"],
    estimatedTime: "35 hours",
    applications: ["Clinical trials", "cohort studies", "growth modeling"],
  },
  {
    title: "Survival Analysis and Cox Models",
    level: "Intermediate",
    domain: "Biostatistics",
    description:
      "Advanced survival analysis: Cox proportional hazards, stratified models, time-varying covariates, competing risks, and survival prediction.",
    keywords: [
      "Cox",
      "proportional hazards",
      "competing risks",
      "survival prediction",
    ],
    complexity: "High",
    software: ["R", "STATA", "Python"],
    prerequisites: ["Survival analysis basics"],
    estimatedTime: "35 hours",
    applications: [
      "Clinical research",
      "biomedical studies",
      "risk prediction",
    ],
  },
  {
    title: "Multivariate Regression Methods",
    level: "Intermediate",
    domain: "Biostatistics",
    description:
      "Multivariate regression: multiple outcomes, MANOVA, multivariate GLM, and canonical correlation for complex life sciences data.",
    keywords: [
      "multivariate",
      "MANOVA",
      "canonical correlation",
      "multivariate GLM",
    ],
    complexity: "High",
    software: ["R"],
    prerequisites: ["Statistical thinking", "Linear algebra basics"],
    estimatedTime: "30 hours",
    applications: [
      "Multi-omics integration",
      "bivariate analysis",
      "complex study designs",
    ],
  },
  {
    title: "Generalized Estimating Equations (GEE)",
    level: "Intermediate",
    domain: "Biostatistics",
    description:
      "Population-averaged models for correlated data: GEE for clustered and longitudinal data with various link functions.",
    keywords: ["GEE", "correlated data", "clustered", "population-averaged"],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Longitudinal data analysis"],
    estimatedTime: "30 hours",
    applications: [
      "Clustered studies",
      "longitudinal analysis",
      "clinical research",
    ],
  },
  {
    title: "Meta-Analysis Methods",
    level: "Intermediate",
    domain: "Biostatistics",
    description:
      "Systematic review and meta-analysis: fixed and random-effects models, heterogeneity, publication bias, subgroup analysis, and meta-regression.",
    keywords: [
      "meta-analysis",
      "heterogeneity",
      "publication bias",
      "meta-regression",
    ],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "30 hours",
    applications: [
      "Evidence synthesis",
      "systematic reviews",
      "clinical guidelines",
    ],
  },
  {
    title: "Intermediate Bayesian Analysis",
    level: "Intermediate",
    domain: "Bayesian Methods",
    description:
      "Bayesian modeling: MCMC implementation, hierarchical models, model selection, convergence diagnostics, and sensitivity analysis.",
    keywords: [
      "MCMC",
      "hierarchical models",
      "convergence",
      "sensitivity analysis",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Bayesian basics", "Programming proficiency"],
    estimatedTime: "45 hours",
    applications: [
      "Complex clinical models",
      "spatial epidemiology",
      "genetic modeling",
    ],
  },
  {
    title: "Statistical Genetics and GWAS",
    level: "Intermediate",
    domain: "Statistical Genetics",
    description:
      "Genome-wide association studies: quality control, association testing, population stratification, and interpretation of GWAS results.",
    keywords: [
      "GWAS",
      "association testing",
      "population stratification",
      "QC",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Genomics basics"],
    estimatedTime: "40 hours",
    applications: [
      "Disease genetics",
      "pharmacogenetics",
      "genetic risk prediction",
    ],
  },
  {
    title: "Transcriptomics Data Analysis",
    level: "Intermediate",
    domain: "Computational Genomics",
    description:
      "Advanced transcriptomics: differential expression, isoform analysis, alternative splicing, pathway analysis, and network construction.",
    keywords: [
      "transcriptomics",
      "differential expression",
      "splicing",
      "pathway analysis",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["RNA-Seq analysis", "R fundamentals"],
    estimatedTime: "35 hours",
    applications: [
      "Gene expression research",
      "biomarker discovery",
      "pathway analysis",
    ],
  },
  {
    title: "Epigenomics Data Analysis",
    level: "Intermediate",
    domain: "Computational Genomics",
    description:
      "Epigenomics: ChIP-seq, ATAC-seq, DNA methylation, histone modifications, and integrative epigenomic analysis.",
    keywords: ["ChIP-seq", "ATAC-seq", "methylation", "histone", "epigenomics"],
    complexity: "High",
    software: ["R", "Python", "Bash"],
    prerequisites: ["NGS data analysis"],
    estimatedTime: "40 hours",
    applications: [
      "Epigenetic regulation",
      "cell differentiation",
      "disease epigenetics",
    ],
  },
  {
    title: "Machine Learning Fundamentals for Life Sciences",
    level: "Intermediate",
    domain: "Machine Learning",
    description:
      "Core machine learning for biomedical data: supervised and unsupervised learning, classification, regression, clustering, and evaluation metrics.",
    keywords: [
      "ML",
      "supervised",
      "unsupervised",
      "classification",
      "clustering",
    ],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Python fundamentals", "Statistical thinking"],
    estimatedTime: "40 hours",
    applications: [
      "Disease classification",
      "biomarker discovery",
      "drug response prediction",
    ],
  },
  {
    title: "Supervised Learning: Tree-Based Methods",
    level: "Intermediate",
    domain: "Machine Learning",
    description:
      "Tree-based models: decision trees, random forests, gradient boosting (XGBoost, LightGBM), and ensemble methods for biomedical prediction.",
    keywords: [
      "random forest",
      "gradient boosting",
      "XGBoost",
      "LightGBM",
      "ensemble",
    ],
    complexity: "High",
    software: ["Python", "R"],
    prerequisites: ["ML fundamentals"],
    estimatedTime: "30 hours",
    applications: [
      "Clinical prediction",
      "drug response prediction",
      "risk stratification",
    ],
  },
  {
    title: "Support Vector Machines and Kernel Methods",
    level: "Intermediate",
    domain: "Machine Learning",
    description:
      "SVM and kernel methods for biological data: classification, regression, kernel selection, and applications in biomedicine.",
    keywords: [
      "SVM",
      "kernel",
      "classification",
      "regression",
      "biological data",
    ],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["ML fundamentals"],
    estimatedTime: "25 hours",
    applications: [
      "Cancer classification",
      "biomarker discovery",
      "drug-target prediction",
    ],
  },
  {
    title: "Neural Networks and Deep Learning for Biology",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "Introduction to deep learning: neural network architectures, training, regularization, and applications in genomics and proteomics.",
    keywords: ["neural networks", "deep learning", "architectures", "training"],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["ML fundamentals", "Python proficiency"],
    estimatedTime: "45 hours",
    applications: [
      "Genomic prediction",
      "protein structure prediction",
      "drug discovery",
    ],
  },
  {
    title: "Natural Language Processing for Biomedical Literature",
    level: "Intermediate",
    domain: "Data Science",
    description:
      "NLP techniques for biomedical texts: text preprocessing, named entity recognition, relation extraction, and literature mining for drug discovery.",
    keywords: [
      "NLP",
      "NER",
      "literature mining",
      "biomedical texts",
      "entity recognition",
    ],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Python fundamentals"],
    estimatedTime: "35 hours",
    applications: [
      "Drug repurposing",
      "clinical trial matching",
      "knowledge graph building",
    ],
  },
  {
    title: "Protein Structure Prediction and Analysis",
    level: "Intermediate",
    domain: "Structural Biology",
    description:
      "Protein structure prediction and analysis: AlphaFold, homology modeling, structure refinement, and structure-function relationship analysis.",
    keywords: [
      "AlphaFold",
      "homology modeling",
      "structure prediction",
      "structure-function",
    ],
    complexity: "High",
    software: ["Python", "R"],
    prerequisites: ["Structural biology basics"],
    estimatedTime: "35 hours",
    applications: [
      "Drug discovery",
      "protein engineering",
      "disease mutations",
    ],
  },
  {
    title: "Molecular Docking and Virtual Screening",
    level: "Intermediate",
    domain: "Drug Discovery",
    description:
      "Computational drug discovery: molecular docking (AutoDock, GLIDE), virtual screening, binding site analysis, and hit identification.",
    keywords: [
      "docking",
      "virtual screening",
      "AutoDock",
      "binding site",
      "hit identification",
    ],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Structural biology basics"],
    estimatedTime: "35 hours",
    applications: ["Drug discovery", "lead optimization", "drug repurposing"],
  },
  {
    title: "Network Biology and Pathway Analysis",
    level: "Intermediate",
    domain: "Systems Biology",
    description:
      "Biological network analysis: graph theory, protein-protein interaction networks, gene regulatory networks, and pathway enrichment methods.",
    keywords: [
      "network biology",
      "pathway analysis",
      "PPI",
      "gene networks",
      "graph theory",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Computational biology basics"],
    estimatedTime: "35 hours",
    applications: [
      "Disease network analysis",
      "drug target identification",
      "systems medicine",
    ],
  },
  {
    title: "Genomic Prediction and Risk Modeling",
    level: "Intermediate",
    domain: "Statistical Genetics",
    description:
      "Polygenic risk scores, genomic prediction models, and risk stratification using genomic and clinical data.",
    keywords: [
      "polygenic risk",
      "genomic prediction",
      "risk stratification",
      "PRS",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Statistical genetics", "Machine learning"],
    estimatedTime: "40 hours",
    applications: [
      "Personalized medicine",
      "disease prevention",
      "clinical risk assessment",
    ],
  },

  // ──────────────────────────────────────────────
  // 2.2 Intermediate Computational Methods (16)
  // ──────────────────────────────────────────────
  {
    title: "Multi-Omics Data Integration",
    level: "Intermediate",
    domain: "Computational Biology",
    description:
      "Integrating genomics, transcriptomics, proteomics, and metabolomics data using computational methods for systems biology insights.",
    keywords: ["multi-omics", "integration", "systems biology", "data fusion"],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Omics analysis", "Statistical methods"],
    estimatedTime: "45 hours",
    applications: [
      "Cancer research",
      "disease mechanisms",
      "biomarker discovery",
    ],
  },
  {
    title: "Large Language Models for Biomedical Research",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "Using LLMs (BERT, BioBERT, GPT) for biomedical NLP tasks: text classification, question answering, and knowledge extraction.",
    keywords: [
      "LLMs",
      "BERT",
      "BioBERT",
      "biomedical NLP",
      "knowledge extraction",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["NLP basics", "Deep learning"],
    estimatedTime: "45 hours",
    applications: [
      "Clinical NLP",
      "drug discovery",
      "biomedical literature mining",
    ],
  },
  {
    title: "Time Series Analysis in Life Sciences",
    level: "Intermediate",
    domain: "Time Series Analysis",
    description:
      "Modeling temporal data: ARIMA, state-space models, dynamic regression for epidemiology, patient monitoring, and disease surveillance.",
    keywords: [
      "time series",
      "ARIMA",
      "state-space",
      "surveillance",
      "epidemiology",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "35 hours",
    applications: [
      "Epidemiological forecasting",
      "patient monitoring",
      "disease surveillance",
    ],
  },
  {
    title: "Spatial Epidemiology and Disease Mapping",
    level: "Intermediate",
    domain: "Spatial Epidemiology",
    description:
      "Spatial analysis of health data: disease mapping, spatial autocorrelation, cluster detection, and Bayesian spatial modeling for disease patterns.",
    keywords: [
      "spatial",
      "disease mapping",
      "autocorrelation",
      "cluster detection",
      "Bayesian spatial",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Epidemiology basics", "Statistical methods"],
    estimatedTime: "40 hours",
    applications: [
      "Disease surveillance",
      "environmental health",
      "public health planning",
    ],
  },
  {
    title: "Ecological and Environmental Epidemiology",
    level: "Intermediate",
    domain: "Environmental Health",
    description:
      "Analyzing environmental factors in disease: environmental exposure assessment, geographic information systems, and spatial analysis of health outcomes.",
    keywords: [
      "environmental",
      "exposure assessment",
      "GIS",
      "spatial",
      "air quality",
    ],
    complexity: "High",
    software: ["R", "Python"],
    prerequisites: ["Epidemiology basics"],
    estimatedTime: "35 hours",
    applications: [
      "Environmental health studies",
      "climate change health impacts",
      "policy making",
    ],
  },
  {
    title: "High-Performance Computing for Life Sciences",
    level: "Intermediate",
    domain: "High-Performance Computing",
    description:
      "HPC for life sciences: parallel computing, MPI, cluster computing, job scheduling (SLURM), and optimizing bioinformatics workflows.",
    keywords: [
      "HPC",
      "parallel computing",
      "MPI",
      "SLURM",
      "workflow optimization",
    ],
    complexity: "High",
    software: ["Bash", "Python"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "35 hours",
    applications: [
      "Large-scale genomics",
      "simulations",
      "big data processing",
    ],
  },
  {
    title: "Cloud Computing for Life Sciences",
    level: "Intermediate",
    domain: "Cloud Computing",
    description:
      "Cloud platforms for life sciences: AWS, GCP, Azure, cloud-based genomics (GA4GH), and scalable bioinformatics workflows.",
    keywords: [
      "cloud computing",
      "AWS",
      "GCP",
      "Azure",
      "GA4GH",
      "scalable workflows",
    ],
    complexity: "Medium",
    software: ["Bash", "Python"],
    prerequisites: ["Unix/Linux basics"],
    estimatedTime: "30 hours",
    applications: [
      "Scalable genomics",
      "data sharing",
      "collaborative research",
    ],
  },
  {
    title: "Data Engineering for Life Sciences",
    level: "Intermediate",
    domain: "Data Engineering",
    description:
      "Building data pipelines for biological data: ETL workflows, data warehouses, database design, and streaming data processing for biomedical applications.",
    keywords: [
      "data engineering",
      "ETL",
      "data pipeline",
      "warehouse",
      "streaming",
    ],
    complexity: "High",
    software: ["Python", "SQL"],
    prerequisites: ["Python fundamentals", "SQL basics"],
    estimatedTime: "40 hours",
    applications: [
      "Clinical data lakes",
      "real-time surveillance",
      "data integration platforms",
    ],
  },
  {
    title: "Computational Genomics and Systems Biology",
    level: "Intermediate",
    domain: "Computational Genomics",
    description:
      "Advanced computational genomics: genome assembly, annotation, comparative genomics, and systems biology integration.",
    keywords: [
      "genome assembly",
      "annotation",
      "comparative genomics",
      "systems biology",
    ],
    complexity: "Very High",
    software: ["Python", "R", "Bash"],
    prerequisites: ["Genomics basics", "Computational methods"],
    estimatedTime: "45 hours",
    applications: [
      "Reference genome building",
      "evolutionary genomics",
      "pan-genome studies",
    ],
  },
  {
    title: "Causal Inference in Life Sciences",
    level: "Intermediate",
    domain: "Causal Inference",
    description:
      "Causal methods: directed acyclic graphs, potential outcomes framework, instrumental variables, and causal mediation analysis for biomedical research.",
    keywords: [
      "causal inference",
      "DAGs",
      "instrumental variables",
      "mediation",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Statistical thinking", "Epidemiology basics"],
    estimatedTime: "40 hours",
    applications: [
      "Epidemiological studies",
      "causal effects",
      "policy evaluation",
    ],
  },
  {
    title: "Responsible AI in Healthcare",
    level: "Intermediate",
    domain: "Health Informatics",
    description:
      "AI fairness, explainability, interpretability, and bias mitigation in healthcare applications. Clinical validation and regulatory considerations.",
    keywords: [
      "AI fairness",
      "explainable AI",
      "bias",
      "clinical validation",
      "regulatory",
    ],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Machine learning"],
    estimatedTime: "30 hours",
    applications: [
      "Clinical decision support",
      "AI safety",
      "regulatory compliance",
    ],
  },
  {
    title: "Clinical Trial Design and Analysis",
    level: "Intermediate",
    domain: "Clinical Informatics",
    description:
      "Clinical trial design: phase I-IV designs, randomization, adaptive designs, safety monitoring, and regulatory reporting for biomedical research.",
    keywords: [
      "clinical trial",
      "randomization",
      "adaptive",
      "safety",
      "regulatory",
    ],
    complexity: "High",
    software: ["R", "STATA"],
    prerequisites: ["Statistical thinking"],
    estimatedTime: "40 hours",
    applications: ["Clinical research", "drug development", "medical devices"],
  },
  {
    title: "Structural Bioinformatics and Drug Design",
    level: "Intermediate",
    domain: "Structural Biology",
    description:
      "Advanced structural bioinformatics: protein-ligand docking, structure-based drug design, molecular dynamics simulations, and binding free energy calculations.",
    keywords: [
      "structural bioinformatics",
      "drug design",
      "molecular dynamics",
      "free energy",
    ],
    complexity: "Very High",
    software: ["Python", "R"],
    prerequisites: ["Structural biology", "Computational methods"],
    estimatedTime: "50 hours",
    applications: [
      "Drug discovery",
      "protein engineering",
      "molecular pharmacology",
    ],
  },
  {
    title: "Single-Cell and Spatial Transcriptomics",
    level: "Intermediate",
    domain: "Computational Genomics",
    description:
      "Advanced single-cell and spatial transcriptomics: analysis of scRNA-seq, scATAC-seq, spatial transcriptomics data, cell type identification, trajectory inference.",
    keywords: [
      "single-cell",
      "scRNA-seq",
      "spatial transcriptomics",
      "trajectory inference",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Transcriptomics analysis"],
    estimatedTime: "50 hours",
    applications: [
      "Developmental biology",
      "cancer heterogeneity",
      "tissue architecture",
    ],
  },
  {
    title: "Machine Learning for Drug Discovery",
    level: "Intermediate",
    domain: "Drug Discovery",
    description:
      "Applying ML to drug discovery: binding affinity prediction, ADMET prediction, de novo drug design, and hit-to-lead optimization.",
    keywords: [
      "ML",
      "drug discovery",
      "ADMET",
      "de novo design",
      "hit-to-lead",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Machine learning", "Chemistry basics"],
    estimatedTime: "45 hours",
    applications: [
      "Pharmaceutical R&D",
      "drug repurposing",
      "AI in drug discovery",
    ],
  },
  {
    title: "Multi-Agent Systems for Epidemiology",
    level: "Intermediate",
    domain: "Infectious Disease Modeling",
    description:
      "Agent-based modeling for disease spread: behavioral dynamics, social networks, and public health policy evaluation.",
    keywords: [
      "agent-based",
      "ABM",
      "disease spread",
      "social networks",
      "policy evaluation",
    ],
    complexity: "High",
    software: ["Python", "R"],
    prerequisites: ["Epidemiology basics", "Programming proficiency"],
    estimatedTime: "40 hours",
    applications: [
      "Pandemic response",
      "intervention evaluation",
      "behavioral epidemiology",
    ],
  },

  // ──────────────────────────────────────────────
  // 2.3 Advanced Topics moved from Expert (16)
  // ──────────────────────────────────────────────
  {
    title: "Advanced Machine Learning and Deep Learning for Genomics",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "Advanced neural network architectures (CNNs, RNNs, Transformers) for genomic data: variant interpretation, gene expression prediction, and regulatory genomics.",
    keywords: ["CNN", "RNN", "Transformer", "genomics", "regulatory genomics"],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Deep learning", "Genomics basics"],
    estimatedTime: "50 hours",
    applications: [
      "Genomic prediction",
      "variant interpretation",
      "regulatory annotation",
    ],
  },
  {
    title: "Computational Systems Biology and Network Medicine",
    level: "Intermediate",
    domain: "Systems Biology",
    description:
      "Systems biology approaches: dynamic modeling, Boolean networks, logical modeling, and network medicine for understanding complex diseases.",
    keywords: [
      "systems biology",
      "dynamic modeling",
      "boolean networks",
      "network medicine",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Network biology", "Mathematical modeling"],
    estimatedTime: "50 hours",
    applications: [
      "Disease mechanisms",
      "drug target identification",
      "personalized medicine",
    ],
  },
  {
    title: "Genomic Epidemiology and Pathogen Genomics",
    level: "Intermediate",
    domain: "Genomic Epidemiology",
    description:
      "Applying genomics to pathogen surveillance: pathogen genomics, outbreak detection, phylogenetic analysis, and genomic epidemiology of infectious diseases.",
    keywords: [
      "pathogen genomics",
      "outbreak",
      "phylogenetics",
      "genomic epidemiology",
    ],
    complexity: "Very High",
    software: ["R", "Python", "Bash"],
    prerequisites: ["Genomics basics", "Epidemiology", "Phylogenetics"],
    estimatedTime: "45 hours",
    applications: [
      "Outbreak investigation",
      "disease surveillance",
      "public health genomics",
    ],
  },
  {
    title: "Bayesian Hierarchical Models in Life Sciences",
    level: "Intermediate",
    domain: "Bayesian Methods",
    description:
      "Hierarchical Bayesian modeling: multilevel models, spatial models, and temporal models for complex biomedical data with nested structures.",
    keywords: ["hierarchical models", "multilevel", "spatial", "temporal"],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Bayesian methods", "Statistical modeling"],
    estimatedTime: "50 hours",
    applications: ["Meta-analysis", "spatial epidemiology", "clinical trials"],
  },
  {
    title: "Causal Inference with Observational Data",
    level: "Intermediate",
    domain: "Causal Inference",
    description:
      "Advanced causal methods: propensity score methods, g-computation, target trial emulation, and quasi-experimental designs for biomedical research.",
    keywords: [
      "propensity score",
      "g-computation",
      "target trial",
      "quasi-experimental",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Causal inference basics"],
    estimatedTime: "45 hours",
    applications: [
      "Observational studies",
      "policy evaluation",
      "comparative effectiveness",
    ],
  },
  {
    title: "Statistical Methods for Clinical Trials",
    level: "Intermediate",
    domain: "Biostatistics",
    description:
      "Advanced clinical trial methodologies: adaptive designs, Bayesian designs, response-adaptive randomization, and robust statistical methods.",
    keywords: [
      "adaptive designs",
      "Bayesian designs",
      "response-adaptive",
      "robust methods",
    ],
    complexity: "Very High",
    software: ["R"],
    prerequisites: ["Clinical trial design", "Statistical methods"],
    estimatedTime: "45 hours",
    applications: [
      "Drug development",
      "medical device trials",
      "biologics approval",
    ],
  },
  {
    title: "Computational Drug Discovery and Development",
    level: "Intermediate",
    domain: "Drug Discovery",
    description:
      "Computational drug discovery pipeline: target validation, virtual screening, ADMET modeling, bioavailability prediction, and clinical trial simulation.",
    keywords: [
      "drug discovery",
      "ADMET",
      "bioavailability",
      "clinical trial simulation",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Drug discovery basics", "Machine learning"],
    estimatedTime: "50 hours",
    applications: [
      "Pharmaceutical R&D",
      "drug repurposing",
      "preclinical trials",
    ],
  },
  {
    title: "Mathematical Modeling in Biomedicine",
    level: "Intermediate",
    domain: "Mathematical Modeling",
    description:
      "Advanced mathematical modeling: ordinary and partial differential equations, stochastic models, sensitivity analysis, and model calibration.",
    keywords: ["ODE", "PDE", "stochastic", "sensitivity", "calibration"],
    complexity: "Very High",
    software: ["R", "Python", "MATLAB"],
    prerequisites: ["Calculus", "Linear algebra", "Programming"],
    estimatedTime: "50 hours",
    applications: ["Disease dynamics", "pharmacokinetics", "tumor growth"],
  },
  {
    title: "Multi-Omics Integration and Systems Medicine",
    level: "Intermediate",
    domain: "Systems Biology",
    description:
      "Integrating multi-omics for disease understanding: computational methods for integrating genomics, transcriptomics, proteomics, and metabolomics for precision medicine.",
    keywords: [
      "multi-omics",
      "integration",
      "systems medicine",
      "precision medicine",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Omics analysis", "Statistical methods"],
    estimatedTime: "50 hours",
    applications: [
      "Precision medicine",
      "disease diagnosis",
      "biomarker discovery",
    ],
  },
  {
    title: "Spatial Statistics and Disease Mapping",
    level: "Intermediate",
    domain: "Spatial Epidemiology",
    description:
      "Advanced spatial analysis: areal data, point patterns, spatial regression, Bayesian spatial models, and disease hotspot detection.",
    keywords: [
      "areal data",
      "point patterns",
      "spatial regression",
      "Bayesian spatial",
      "hotspots",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Spatial analysis basics", "Bayesian methods"],
    estimatedTime: "45 hours",
    applications: [
      "Disease surveillance",
      "environmental health",
      "public health policy",
    ],
  },
  {
    title: "Algorithmic and Computational Biology",
    level: "Intermediate",
    domain: "Computational Biology",
    description:
      "Algorithms for biological data: sequence algorithms, graph algorithms for genomics, string matching for sequence alignment, and algorithmic complexity.",
    keywords: [
      "algorithms",
      "sequence alignment",
      "graph algorithms",
      "string matching",
      "complexity",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Algorithms and data structures", "Computational biology"],
    estimatedTime: "50 hours",
    applications: [
      "Genome assembly",
      "sequence analysis",
      "computational genomics",
    ],
  },
  {
    title: "Biomedical Image Analysis and Machine Learning",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "Advanced medical image analysis: deep learning for radiology, pathology, ophthalmology, and dermatology images, with deployment considerations.",
    keywords: ["medical imaging", "deep learning", "radiology", "pathology"],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Deep learning", "Image processing basics"],
    estimatedTime: "50 hours",
    applications: ["Radiology diagnostics", "pathology", "ophthalmology"],
  },
  {
    title: "Advanced Deep Learning for Biomedical Data",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "Advanced deep learning architectures (GANs, VAEs, Transformers, Graph Neural Networks) for biomedical applications including drug discovery and genomics.",
    keywords: [
      "GAN",
      "VAE",
      "Transformer",
      "GNN",
      "biomedical",
      "drug discovery",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Deep learning", "Programming proficiency"],
    estimatedTime: "60 hours",
    applications: ["Drug discovery", "clinical prediction", "genomic analysis"],
  },
  {
    title: "Graph Neural Networks for Molecular Data",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "GNNs for molecular graphs: chemical property prediction, drug-target interaction, molecular generation, and graph-based drug discovery.",
    keywords: [
      "GNN",
      "molecular graphs",
      "property prediction",
      "drug-target",
      "molecular generation",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Deep learning", "Cheminformatics basics"],
    estimatedTime: "55 hours",
    applications: [
      "Drug discovery",
      "molecular design",
      "chemical property prediction",
    ],
  },
  {
    title: "Transformers for Biomedical NLP",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "Advanced biomedical NLP: BioBERT, SciBERT, fine-tuning transformers for clinical texts, drug labels, and biomedical literature.",
    keywords: [
      "BioBERT",
      "SciBERT",
      "transformers",
      "clinical NLP",
      "biomedical NLP",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["NLP", "Deep learning"],
    estimatedTime: "50 hours",
    applications: [
      "Clinical text analysis",
      "drug safety monitoring",
      "biomedical literature mining",
    ],
  },
  {
    title: "Reinforcement Learning for Health and Biology",
    level: "Intermediate",
    domain: "Deep Learning",
    description:
      "RL for healthcare applications: treatment optimization, clinical trial design, personalized dosing, and drug discovery applications.",
    keywords: [
      "RL",
      "treatment optimization",
      "clinical trial",
      "personalized dosing",
      "drug discovery",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Machine learning", "Deep learning"],
    estimatedTime: "50 hours",
    applications: [
      "Treatment personalization",
      "clinical trial optimization",
      "dose finding",
    ],
  },

  // ============================================================
  // SECTION 3: ADVANCED LEVEL (35 topics)
  // ============================================================

  // ──────────────────────────────────────────────
  // 3.1 Advanced Machine Learning & AI (15)
  // ──────────────────────────────────────────────
  {
    title: "Generative Models for Drug Discovery",
    level: "Advanced",
    domain: "Deep Learning",
    description:
      "Generative models for drug discovery: VAEs, GANs, flow-based models for molecular generation, de novo design, and synthetic data generation.",
    keywords: [
      "VAE",
      "GAN",
      "molecular generation",
      "de novo design",
      "synthetic data",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Deep learning", "Generative models"],
    estimatedTime: "55 hours",
    applications: [
      "Drug design",
      "molecular optimization",
      "data augmentation",
    ],
  },
  {
    title: "Federated Learning for Healthcare",
    level: "Advanced",
    domain: "Machine Learning",
    description:
      "Federated learning for healthcare: privacy-preserving ML, differential privacy, secure aggregation, and multi-institutional collaboration in healthcare.",
    keywords: [
      "federated learning",
      "privacy-preserving",
      "differential privacy",
      "collaboration",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Machine learning", "Security basics"],
    estimatedTime: "45 hours",
    applications: [
      "Collaborative clinical research",
      "multi-site trials",
      "privacy-preserving ML",
    ],
  },
  {
    title: "Explainable AI in Medicine",
    level: "Advanced",
    domain: "Machine Learning",
    description:
      "Explainability methods for clinical AI: SHAP, LIME, integrated gradients, counterfactual explanations, and clinical deployment considerations.",
    keywords: ["XAI", "SHAP", "LIME", "counterfactual", "clinical deployment"],
    complexity: "High",
    software: ["Python"],
    prerequisites: ["Machine learning", "Deep learning"],
    estimatedTime: "40 hours",
    applications: [
      "Clinical decision support",
      "AI safety",
      "regulatory submissions",
    ],
  },
  {
    title: "AI for Digital Pathology",
    level: "Advanced",
    domain: "Deep Learning",
    description:
      "AI applications in digital pathology: whole-slide image analysis, histopathology classification, biomarker quantification, and diagnostic assistance.",
    keywords: [
      "digital pathology",
      "histopathology",
      "whole-slide",
      "biomarker",
      "diagnostics",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Deep learning", "Image analysis"],
    estimatedTime: "50 hours",
    applications: [
      "Cancer diagnosis",
      "biomarker detection",
      "pathology research",
    ],
  },
  {
    title: "AI for Drug Repurposing",
    level: "Advanced",
    domain: "Drug Discovery",
    description:
      "Machine learning for drug repurposing: drug-target interaction prediction, side effect prediction, and computational methods for existing drugs.",
    keywords: [
      "drug repurposing",
      "DTI",
      "side effect prediction",
      "drug repositioning",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Drug discovery", "Machine learning"],
    estimatedTime: "45 hours",
    applications: [
      "Drug repurposing",
      "rare diseases",
      "rapid response to health crises",
    ],
  },
  {
    title: "Computational Modeling of Infectious Disease Dynamics",
    level: "Advanced",
    domain: "Infectious Disease Modeling",
    description:
      "Advanced epidemiological modeling: age-structured models, spatial models, within-host dynamics, and phylodynamics for understanding and controlling infectious diseases.",
    keywords: [
      "age-structured",
      "spatial models",
      "within-host",
      "phylodynamics",
      "R0",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Epidemiology", "Mathematical modeling"],
    estimatedTime: "50 hours",
    applications: [
      "Pandemic modeling",
      "vaccine strategies",
      "policy evaluation",
    ],
  },
  {
    title: "High-Dimensional Data Analysis in Genomics",
    level: "Advanced",
    domain: "Statistical Genetics",
    description:
      "Methods for high-dimensional genomic data: PCA, LASSO, ridge regression, elastic net, and dimension reduction for genomic studies.",
    keywords: ["PCA", "LASSO", "ridge", "elastic net", "dimension reduction"],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Statistical methods", "Genomics basics"],
    estimatedTime: "45 hours",
    applications: [
      "Genomic risk prediction",
      "biomarker discovery",
      "disease genetics",
    ],
  },
  {
    title: "Quantum Computing for Drug Discovery",
    level: "Advanced",
    domain: "Computational Methods",
    description:
      "Quantum computing applications in life sciences: quantum chemistry, molecular simulations, drug-target docking, and quantum algorithms for biological problems.",
    keywords: [
      "quantum computing",
      "quantum chemistry",
      "molecular simulation",
      "docking",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Quantum mechanics", "Linear algebra"],
    estimatedTime: "55 hours",
    applications: [
      "Drug discovery",
      "molecular modeling",
      "computational chemistry",
    ],
  },
  {
    title: "Advanced Structural Bioinformatics",
    level: "Advanced",
    domain: "Structural Biology",
    description:
      "Advanced structural bioinformatics: protein folding, protein design, docking, molecular dynamics simulations, and integrative structural biology.",
    keywords: [
      "protein folding",
      "protein design",
      "docking",
      "molecular dynamics",
      "integrative",
    ],
    complexity: "Very High",
    software: ["Python", "R"],
    prerequisites: ["Structural biology", "Computational methods"],
    estimatedTime: "55 hours",
    applications: ["Protein engineering", "drug design", "structural genomics"],
  },
  {
    title: "Computational Immunomics",
    level: "Advanced",
    domain: "Computational Biology",
    description:
      "Immunomics methods: B-cell epitope prediction, T-cell epitope prediction, immune repertoire analysis, and vaccine design informatics.",
    keywords: [
      "immunomics",
      "epitope prediction",
      "immune repertoire",
      "vaccine design",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Immunology basics", "Bioinformatics"],
    estimatedTime: "50 hours",
    applications: [
      "Vaccine development",
      "autoimmune disease research",
      "immunotherapies",
    ],
  },
  {
    title: "Advanced Single-Cell and Spatial Omics",
    level: "Advanced",
    domain: "Computational Genomics",
    description:
      "Advanced single-cell and spatial omics: multi-modal integration, trajectory inference, cell-cell communication, and spatial tissue architecture analysis.",
    keywords: [
      "single-cell",
      "spatial omics",
      "integration",
      "trajectory",
      "cell-cell communication",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Single-cell analysis", "Computational methods"],
    estimatedTime: "55 hours",
    applications: [
      "Tissue biology",
      "cancer research",
      "developmental biology",
    ],
  },
  {
    title: "Computational Methods for Precision Medicine",
    level: "Advanced",
    domain: "Health Informatics",
    description:
      "Computational approaches for precision medicine: patient stratification, drug response prediction, biomarker discovery, and clinical implementation.",
    keywords: [
      "precision medicine",
      "patient stratification",
      "drug response",
      "biomarker",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Machine learning", "Clinical informatics"],
    estimatedTime: "50 hours",
    applications: [
      "Personalized treatment",
      "clinical genomics",
      "precision oncology",
    ],
  },
  {
    title: "Genomic Risk Prediction and Polygenic Scores",
    level: "Advanced",
    domain: "Statistical Genetics",
    description:
      "Advanced methods for genomic risk prediction: polygenic risk scores, Bayesian methods, machine learning approaches, and clinical implementation.",
    keywords: [
      "polygenic risk",
      "genomic prediction",
      "risk stratification",
      "clinical implementation",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Statistical genetics", "Machine learning"],
    estimatedTime: "50 hours",
    applications: [
      "Personalized medicine",
      "disease prevention",
      "clinical risk assessment",
    ],
  },
  {
    title: "Machine Learning for Clinical Data",
    level: "Advanced",
    domain: "Health Informatics",
    description:
      "Machine learning for clinical data: EHR analysis, clinical prediction models, longitudinal patient data, and deployment in healthcare settings.",
    keywords: [
      "EHR",
      "clinical prediction",
      "longitudinal",
      "deployment",
      "healthcare",
    ],
    complexity: "Very High",
    software: ["Python", "R"],
    prerequisites: ["Machine learning", "Clinical informatics"],
    estimatedTime: "50 hours",
    applications: [
      "Clinical prediction",
      "patient monitoring",
      "healthcare analytics",
    ],
  },
  {
    title: "Clinical Natural Language Processing",
    level: "Advanced",
    domain: "Health Informatics",
    description:
      "Advanced clinical NLP: de-identification, clinical named entity recognition, relation extraction, and large language models for clinical texts.",
    keywords: [
      "clinical NLP",
      "de-identification",
      "NER",
      "relation extraction",
      "LLM",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["NLP", "Deep learning", "Clinical informatics"],
    estimatedTime: "50 hours",
    applications: [
      "Clinical research",
      "EHR analysis",
      "clinical decision support",
    ],
  },

  // ──────────────────────────────────────────────
  // 3.2 Advanced Bioinformatics & Genomics (12)
  // ──────────────────────────────────────────────
  {
    title: "Advanced Phylogenetics and Phylodynamics",
    level: "Advanced",
    domain: "Bioinformatics",
    description:
      "Advanced phylogenetic methods: Bayesian phylogenetics, molecular clock models, phylogeography, and phylodynamics for pathogen evolution.",
    keywords: [
      "phylodynamics",
      "molecular clock",
      "phylogeography",
      "Bayesian phylogenetics",
      "pathogen evolution",
    ],
    complexity: "Very High",
    software: ["R", "Python", "Bash"],
    prerequisites: ["Phylogenetics", "Evolutionary biology"],
    estimatedTime: "55 hours",
    applications: [
      "Pathogen tracking",
      "viral evolution",
      "epidemiological modeling",
    ],
  },
  {
    title: "Comparative Genomics and Pangenomics",
    level: "Advanced",
    domain: "Computational Genomics",
    description:
      "Comparative genomics and pangenomics: genome comparison, structural variation detection, pangenome graphs, and evolutionary genomics.",
    keywords: [
      "comparative genomics",
      "pangenomics",
      "structural variation",
      "genome graphs",
    ],
    complexity: "Very High",
    software: ["Python", "Bash"],
    prerequisites: ["Genomics basics", "Computational methods"],
    estimatedTime: "50 hours",
    applications: [
      "Evolutionary biology",
      "microbiome research",
      "disease genetics",
    ],
  },
  {
    title: "Advanced Proteomics and Mass Spectrometry",
    level: "Advanced",
    domain: "Bioinformatics",
    description:
      "Advanced proteomics methods: mass spectrometry data analysis, protein identification, quantification, post-translational modifications, and integrative proteomics.",
    keywords: [
      "proteomics",
      "mass spectrometry",
      "PTM",
      "quantification",
      "integrative",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Proteomics basics", "Statistical methods"],
    estimatedTime: "50 hours",
    applications: [
      "Protein research",
      "biomarker discovery",
      "drug development",
    ],
  },
  {
    title: "Advanced Metabolomics and Lipidomics",
    level: "Advanced",
    domain: "Computational Biology",
    description:
      "Advanced metabolomics and lipidomics: MS data processing, pathway mapping, lipid identification, and integrative metabolomics for disease research.",
    keywords: [
      "metabolomics",
      "lipidomics",
      "pathway mapping",
      "integration",
      "biomarker",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Metabolomics basics", "Statistical methods"],
    estimatedTime: "50 hours",
    applications: ["Disease research", "nutrition studies", "drug development"],
  },
  {
    title: "Computational Biology of Aging",
    level: "Advanced",
    domain: "Computational Biology",
    description:
      "Computational approaches in aging research: epigenetic clocks, aging biomarkers, transcriptomic aging, and drug repurposing for aging-related diseases.",
    keywords: [
      "aging",
      "epigenetic clocks",
      "biomarkers",
      "transcriptomic aging",
      "drug repurposing",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Molecular biology", "Computational methods"],
    estimatedTime: "45 hours",
    applications: [
      "Longevity research",
      "age-related disease",
      "drug discovery",
    ],
  },
  {
    title: "Computational Methods for Infectious Disease Surveillance",
    level: "Advanced",
    domain: "Infectious Disease Modeling",
    description:
      "Advanced computational methods for disease surveillance: pathogen genomics, real-time epidemic tracking, digital epidemiology, and early warning systems.",
    keywords: [
      "disease surveillance",
      "pathogen genomics",
      "digital epidemiology",
      "early warning",
    ],
    complexity: "Very High",
    software: ["Python", "R", "Bash"],
    prerequisites: ["Epidemiology", "Genomics", "Computational methods"],
    estimatedTime: "50 hours",
    applications: [
      "Public health surveillance",
      "pandemic preparedness",
      "outbreak detection",
    ],
  },
  {
    title: "Environmental and Spatial Health Informatics",
    level: "Advanced",
    domain: "Environmental Health",
    description:
      "Advanced environmental health informatics: exposure assessment, geospatial modeling, climate health impacts, and environmental justice analysis.",
    keywords: [
      "environmental",
      "exposure assessment",
      "geospatial",
      "climate health",
      "environmental justice",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Environmental health", "Spatial analysis"],
    estimatedTime: "50 hours",
    applications: [
      "Environmental health research",
      "climate change health impacts",
      "policy making",
    ],
  },
  {
    title: "AI for Drug Development",
    level: "Advanced",
    domain: "Drug Discovery",
    description:
      "AI applications in drug development: target discovery, lead optimization, clinical trial design, and regulatory science for AI-driven drug development.",
    keywords: [
      "drug development",
      "AI",
      "lead optimization",
      "clinical trials",
      "regulatory",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Drug discovery", "Machine learning"],
    estimatedTime: "50 hours",
    applications: [
      "Pharmaceutical R&D",
      "drug repurposing",
      "clinical trial design",
    ],
  },
  {
    title: "Computational Modeling of Biological Systems",
    level: "Advanced",
    domain: "Systems Biology",
    description:
      "Advanced modeling of biological systems: multi-scale modeling, hybrid models, parameter estimation, and model validation for complex biological systems.",
    keywords: [
      "multi-scale modeling",
      "hybrid models",
      "parameter estimation",
      "validation",
    ],
    complexity: "Very High",
    software: ["R", "Python", "MATLAB"],
    prerequisites: ["Systems biology", "Mathematical modeling"],
    estimatedTime: "55 hours",
    applications: ["Drug discovery", "systems medicine", "biological research"],
  },
  {
    title: "Cancer Genomics and Precision Oncology",
    level: "Advanced",
    domain: "Genomic Epidemiology",
    description:
      "Computational approaches in cancer research: somatic variant calling, tumor heterogeneity, mutation signatures, and precision oncology informatics.",
    keywords: [
      "cancer genomics",
      "somatic variants",
      "tumor heterogeneity",
      "mutation signatures",
      "precision oncology",
    ],
    complexity: "Very High",
    software: ["R", "Python", "Bash"],
    prerequisites: ["Genomics basics", "Molecular biology"],
    estimatedTime: "50 hours",
    applications: [
      "Cancer research",
      "clinical genomics",
      "personalized cancer care",
    ],
  },
  {
    title: "Pharmacogenomics and Personalized Medicine",
    level: "Advanced",
    domain: "Pharmacogenomics",
    description:
      "Pharmacogenomics methods: drug metabolism genetics, pharmacogenetic variants, clinical implementation, and personalized dosing algorithms.",
    keywords: [
      "pharmacogenomics",
      "drug metabolism",
      "pharmacogenetic variants",
      "personalized dosing",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Genetics", "Pharmacology basics"],
    estimatedTime: "45 hours",
    applications: [
      "Personalized medicine",
      "clinical pharmacogenetics",
      "drug safety",
    ],
  },
  {
    title: "Population Genetics and Evolutionary Genomics",
    level: "Advanced",
    domain: "Computational Genomics",
    description:
      "Population genetics methods: coalescent theory, demographic inference, natural selection detection, and genome-wide evolutionary analysis.",
    keywords: [
      "population genetics",
      "coalescent",
      "demographic inference",
      "selection",
      "evolutionary genomics",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Genetics basics", "Evolutionary biology"],
    estimatedTime: "50 hours",
    applications: [
      "Human population genetics",
      "disease evolution",
      "conservation genomics",
    ],
  },

  // ──────────────────────────────────────────────
  // 3.3 Advanced Clinical & Health Informatics (8)
  // ──────────────────────────────────────────────
  {
    title: "Ethical and Legal Issues in Biomedical Data Science",
    level: "Advanced",
    domain: "Health Informatics",
    description:
      "Advanced ethical and legal considerations: HIPAA, GDPR, data privacy, consent, biobanking, and responsible conduct in biomedical data science.",
    keywords: ["HIPAA", "GDPR", "data privacy", "consent", "ethics"],
    complexity: "Medium",
    software: [],
    prerequisites: [],
    estimatedTime: "15 hours",
    applications: [
      "Clinical research",
      "data stewardship",
      "regulatory compliance",
    ],
  },
  {
    title: "Scientific Writing and Communication for Life Sciences",
    level: "Advanced",
    domain: "Reproducible Research",
    description:
      "Advanced scientific communication: manuscript preparation, data presentation, visualization best practices, and outreach in computational life sciences.",
    keywords: [
      "scientific writing",
      "manuscripts",
      "data presentation",
      "communication",
    ],
    complexity: "Medium",
    software: [],
    prerequisites: [],
    estimatedTime: "20 hours",
    applications: ["Publication", "grant writing", "science communication"],
  },
  {
    title: "Epigenomics and Regulatory Genomics",
    level: "Advanced",
    domain: "Computational Genomics",
    description:
      "Advanced epigenomics: chromatin analysis, 3D genome organization, enhancer-promoter interactions, and regulatory network modeling.",
    keywords: [
      "epigenomics",
      "chromatin",
      "3D genome",
      "regulatory networks",
      "enhancer-promoter",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Epigenomics basics", "NGS analysis"],
    estimatedTime: "50 hours",
    applications: [
      "Gene regulation research",
      "developmental biology",
      "disease epigenetics",
    ],
  },
  {
    title: "Microbiome and Metagenomics Analysis",
    level: "Advanced",
    domain: "Computational Biology",
    description:
      "Advanced microbiome and metagenomics: shotgun metagenomics, functional analysis, strain-level analysis, and metagenome-assembled genomes.",
    keywords: [
      "metagenomics",
      "shotgun",
      "functional analysis",
      "MAGs",
      "strain-level",
    ],
    complexity: "Very High",
    software: ["Python", "R", "Bash"],
    prerequisites: ["Microbiome basics", "Bioinformatics"],
    estimatedTime: "50 hours",
    applications: [
      "Human microbiome",
      "environmental microbiology",
      "disease studies",
    ],
  },
  {
    title: "Longitudinal and Spatiotemporal Modeling",
    level: "Advanced",
    domain: "Mathematical Modeling",
    description:
      "Advanced longitudinal modeling: mixed-effects, latent growth, trajectory analysis, and spatiotemporal methods for epidemiological data.",
    keywords: [
      "longitudinal",
      "mixed-effects",
      "latent growth",
      "trajectory",
      "spatiotemporal",
    ],
    complexity: "Very High",
    software: ["R", "Python"],
    prerequisites: ["Statistical modeling", "Time series"],
    estimatedTime: "50 hours",
    applications: [
      "Epidemiological surveillance",
      "patient trajectories",
      "disease progression",
    ],
  },
  {
    title: "Computational Neuroscience and Brain Imaging",
    level: "Advanced",
    domain: "Computational Biology",
    description:
      "Computational neuroscience methods: brain imaging analysis, connectomics, modeling neural circuits, and neural data processing.",
    keywords: [
      "computational neuroscience",
      "brain imaging",
      "connectomics",
      "neural circuits",
    ],
    complexity: "Very High",
    software: ["Python", "MATLAB"],
    prerequisites: ["Neuroscience basics", "Image analysis"],
    estimatedTime: "50 hours",
    applications: ["Brain research", "neurological disorders", "neuroscience"],
  },
  {
    title: "Clinical Decision Support Systems",
    level: "Advanced",
    domain: "Clinical Informatics",
    description:
      "Advanced CDSS design and implementation: clinical guidelines, knowledge bases, data integration, CDSS validation, and clinical workflow integration.",
    keywords: [
      "CDSS",
      "clinical guidelines",
      "knowledge bases",
      "integration",
      "validation",
    ],
    complexity: "Very High",
    software: ["Python"],
    prerequisites: ["Health informatics", "Clinical knowledge"],
    estimatedTime: "45 hours",
    applications: [
      "Clinical decision support",
      "clinical workflow",
      "CDSS deployment",
    ],
  },
  {
    title: "Healthcare AI Ethics and Policy",
    level: "Advanced",
    domain: "Health Informatics",
    description:
      "Advanced AI in healthcare: ethics, bias, fairness, explainability, regulatory frameworks, and policy considerations for AI in clinical practice.",
    keywords: ["AI ethics", "bias", "fairness", "regulatory", "policy"],
    complexity: "High",
    software: [],
    prerequisites: ["AI basics", "Healthcare systems"],
    estimatedTime: "30 hours",
    applications: [
      "AI policy",
      "clinical AI implementation",
      "regulatory affairs",
    ],
  },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const lifeSciencesCurriculum = {
  Basic: computationalLifeSciencesTopics.filter((t) => t.level === "Basic"),
  Intermediate: computationalLifeSciencesTopics.filter(
    (t) => t.level === "Intermediate",
  ),
  Advanced: computationalLifeSciencesTopics.filter(
    (t) => t.level === "Advanced",
  ),
} as const;

export function getTopicsByLevel(level: LearningLevel): TopicDetail[] {
  return lifeSciencesCurriculum[level] || [];
}

export function getTopicsByDomain(domain: TopicDomain): TopicDetail[] {
  return computationalLifeSciencesTopics.filter((t) => t.domain === domain);
}

export function getTopicsBySoftware(
  software: "R" | "Python" | "STATA" | "MATLAB" | "Julia" | "SQL" | "Bash",
): TopicDetail[] {
  return computationalLifeSciencesTopics.filter(
    (t) => t.software && t.software.includes(software),
  );
}

export function getAllTopics(): TopicDetail[] {
  return [...computationalLifeSciencesTopics];
}

export function searchTopics(query: string): TopicDetail[] {
  const lowerQuery = query.toLowerCase();
  return computationalLifeSciencesTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(lowerQuery) ||
      topic.description.toLowerCase().includes(lowerQuery) ||
      topic.keywords.some((k) => k.toLowerCase().includes(lowerQuery)) ||
      (topic.software &&
        topic.software.some((s) => s.toLowerCase().includes(lowerQuery))) ||
      topic.domain.toLowerCase().includes(lowerQuery),
  );
}

export function getSoftwareDistribution() {
  const softwareCounts: Record<string, number> = {};
  computationalLifeSciencesTopics.forEach((topic) => {
    if (topic.software) {
      topic.software.forEach((sw) => {
        softwareCounts[sw] = (softwareCounts[sw] || 0) + 1;
      });
    }
  });
  const total = Object.values(softwareCounts).reduce((a, b) => a + b, 0);
  const percentages: Record<string, number> = {};
  Object.entries(softwareCounts).forEach(([sw, count]) => {
    percentages[sw] = Math.round((count / total) * 100);
  });
  return { softwareCounts, percentages, total };
}

export function getLevelDistribution() {
  const levels: Record<LearningLevel, number> = {
    Basic: 0,
    Intermediate: 0,
    Advanced: 0,
  };
  computationalLifeSciencesTopics.forEach((topic) => {
    levels[topic.level] = (levels[topic.level] || 0) + 1;
  });
  const total = computationalLifeSciencesTopics.length;
  const percentages: Record<LearningLevel, number> = {} as any;
  Object.entries(levels).forEach(([level, count]) => {
    percentages[level as LearningLevel] = Math.round((count / total) * 100);
  });
  return { levels, percentages, total };
}

export function getDomainDistribution() {
  const domains: Record<string, number> = {};
  computationalLifeSciencesTopics.forEach((topic) => {
    domains[topic.domain] = (domains[topic.domain] || 0) + 1;
  });
  return domains;
}
// ============================================================
// TOPIC KEY — stable identifier for routing & article lookup
// ============================================================

/**
 * Stable identifier for a topic — used to key `fetchArticlesByTopic`
 * and to populate the `?topic=` query in the viewer URL.
 *
 * `TopicDetail` has no `id` field, so we slugify the title.
 * Deterministic across sessions.
 */
export function getTopicKey(topic: Pick<TopicDetail, "title">): string {
  return topic.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
/* ================================================================== */
/* SAFE PUBLIC ACCESSORS                                             */
/* Every consumer (topic browser, viewers, drawers) should get a      */
/* guaranteed-iterable result. Fixes "not iterable" at the source.    */
/* ================================================================== */

/** Always returns an array, never undefined. */
export function getAllTopicsSafe(): TopicDetail[] {
  try {
    const list = getAllTopics();
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn("[biostatisticsComputingTopics] getAllTopics failed:", err);
    return [];
  }
}

/** Always returns an array, never undefined. */
export function searchTopicsSafe(query: string): TopicDetail[] {
  try {
    const list = searchTopics(query);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn("[biostatisticsComputingTopics] searchTopics failed:", err);
    return [];
  }
}

/** Always returns `{ counts, percentages }` with plain objects. */
export function getSoftwareDistributionSafe(): {
  counts: Record<string, number>;
  percentages: Record<string, number>;
} {
  const empty = { counts: {}, percentages: {} };
  try {
    const dist: any = getSoftwareDistribution?.();
    if (!dist || typeof dist !== "object") return empty;

    const counts =
      dist.counts &&
      typeof dist.counts === "object" &&
      !Array.isArray(dist.counts)
        ? dist.counts
        : {};

    const percentages =
      dist.percentages &&
      typeof dist.percentages === "object" &&
      !Array.isArray(dist.percentages)
        ? dist.percentages
        : {};

    return { counts, percentages };
  } catch (err) {
    console.warn(
      "[biostatisticsComputingTopics] getSoftwareDistribution failed:",
      err,
    );
    return empty;
  }
}
/** Reverse lookup: find a topic by its slugified key. */
export function getTopicByKey(key: string): TopicDetail | undefined {
  return computationalLifeSciencesTopics.find((t) => getTopicKey(t) === key);
}
export default {
  topics: computationalLifeSciencesTopics,
  curriculum: lifeSciencesCurriculum,
  getTopicsByLevel,
  getTopicsByDomain,
  getTopicsBySoftware,
  getAllTopics,
  searchTopics,
  getSoftwareDistribution,
  getLevelDistribution,
  getDomainDistribution,
  getTopicKey,
  getTopicByKey,
};
