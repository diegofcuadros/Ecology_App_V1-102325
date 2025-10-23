
import type { Article, LearningStage } from './types';

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Habitat Fragmentation and Landscape Connectivity',
    author: 'Fahrig, L.',
    year: 2003,
    learningObjectives: [
      'Define habitat fragmentation and its components.',
      'Explain the difference between structural and functional connectivity.',
      'Analyze the effects of fragmentation on species persistence.',
    ],
    keyConcepts: ['Habitat loss', 'Patch size', 'Edge effects', 'Corridors', 'Matrix quality'],
    content: `
      Abstract: Habitat fragmentation is the process by which large and continuous habitats get divided into smaller, more isolated patches. This process has two main components: a reduction in the total amount of habitat, and a change in the spatial configuration of the remaining habitat. Historically, research has often confounded these two effects. This review clarifies the distinction and emphasizes that habitat loss has large, consistently negative effects on biodiversity. Fragmentation per se (i.e., the breaking apart of habitat, independent of habitat loss) has much weaker, less consistent effects, which can be positive or negative. The primary threat to biodiversity is habitat loss, and conservation efforts should prioritize its prevention.
      
      Introduction: Landscape ecology provides the theoretical framework for understanding the ecological consequences of spatial heterogeneity. As human activities increasingly alter natural landscapes, understanding the impacts of habitat fragmentation becomes crucial for effective conservation planning. The debate over the relative importance of habitat loss versus fragmentation has significant implications for how we manage landscapes. For example, if fragmentation per se is the main problem, strategies like creating habitat corridors might be prioritized. If habitat loss is the dominant driver, then protecting and restoring large blocks of habitat is paramount.
      
      Methods: This review synthesizes findings from over 100 empirical studies that have attempted to separate the effects of habitat loss from those of a habitat fragmentation. Studies were included if they measured species richness, abundance, or persistence in landscapes with varying levels of habitat amount and fragmentation. A meta-analytical approach was used to identify general patterns across different taxa and ecosystems.
      
      Results: The meta-analysis revealed that habitat amount was the single most important predictor of species response. In over 90% of the studies, a reduction in habitat area had a significant negative impact. The effects of patch size and isolation were generally weaker and more variable. Some species, particularly edge-specialists, even benefited from a certain degree of fragmentation.
      
      Discussion: The persistent focus on fragmentation as a primary driver of biodiversity loss may be misdirecting conservation resources. While connectivity is important, its benefits are often context-dependent and are secondary to the overwhelming need to preserve as much habitat as possible. Future research should focus on identifying the specific landscape contexts and species traits for which fragmentation effects are most pronounced. Conservation strategies should be evidence-based, focusing on stopping habitat loss and initiating large-scale habitat restoration.
    `,
  },
  {
    id: '2',
    title: 'Scale Concepts in Landscape Ecology',
    author: 'Wiens, J. A.',
    year: 1989,
    learningObjectives: [
      'Define scale, grain, and extent.',
      'Explain why ecological patterns are scale-dependent.',
      'Apply scale concepts to a research question.',
    ],
    keyConcepts: ['Scale', 'Grain', 'Extent', 'Hierarchy Theory', 'Extrapolation'],
    content: `
      Abstract: Scale is a fundamental concept in ecology, yet its treatment is often implicit or inconsistent. In landscape ecology, spatial and temporal scales are central to understanding pattern and process. This paper explores the components of scale—grain and extent—and discusses how the perception of ecological patterns is contingent on the scale of observation. Failure to explicitly consider scale can lead to misinterpretation of data and flawed management decisions.
      
      Introduction: The world is not homogenous. Ecological systems exhibit patterns across a vast range of spatial and temporal scales. A pattern that is apparent at one scale may disappear or be reversed at another. For example, the distribution of a plant species may appear clumped when observed within a 1-hectare plot but random when viewed across a 1000-square-kilometer landscape. Landscape ecologists must therefore be explicit about the scale at which they are working.
      
      Components of Scale: Scale has two primary components: grain and extent. Grain refers to the finest spatial or temporal resolution of the data (e.g., the pixel size in a satellite image or the duration of a single observation). Extent refers to the overall size of the study area or the total duration of the study. The combination of grain and extent defines the "window" through which we observe an ecological system.
      
      Implications for Research: The choice of scale determines the questions that can be asked and the patterns that can be detected. There is no single "correct" scale for ecological research. The appropriate scale is dictated by the organism or process being studied. This is known as the "organism-centered" view of scale. For example, the scale relevant to a foraging beetle is vastly different from the scale relevant to a migrating caribou.
      
      Conclusion: Explicitly addressing scale is not just a methodological nicety; it is essential for advancing ecological understanding and for applying that understanding to real-world problems. Researchers must justify their choice of scale and be cautious when extrapolating findings from one scale to another. A multi-scale approach is often necessary to gain a comprehensive understanding of complex ecological phenomena.
    `,
  },
];

export const SYSTEM_PROMPT = `
You are 'Eco', an AI Teaching Assistant for GEOG/EVST 5015C/6015C, a university-level landscape ecology course.
Your purpose is to be a helpful and encouraging guide, helping students critically analyze academic research articles.

Your Core Persona:
1.  **Explanatory & Helpful:** Your primary goal is to help students learn. Explain complex concepts clearly, provide direct answers when needed, and use analogies and real-world examples to make ideas accessible.
2.  **Encouraging & Patient:** Maintain a supportive and positive tone. Use phrases like "That's a great question," "Excellent point, let's explore that," or "That's a key concept, here's how to think about it."
3.  **Context-Aware:** Base your discussion on the provided academic article, but enrich it with external knowledge.
4.  **Web-Enabled:** You have the ability to search the web (via the googleSearch tool) to find current information, diverse examples, and relevant case studies. Use this to connect the article's concepts to the real world.
5.  **Cite Your Sources:** When you use information from your web search, you MUST cite your sources.
6.  **Interactive:** While you should explain things, don't just lecture. After explaining a concept, ask a follow-up question to check for understanding or to prompt the student to apply the new knowledge (e.g., "Does that make sense? How might you see this concept apply in the article's methods?").
`;

export const STAGE_PROMPTS: Record<LearningStage, string> = {
  Comprehension: "The student is in the 'Comprehension Building' stage. Focus on explaining the article's core arguments and defining key terms. Use simple analogies and check for understanding frequently.",
  Evidence: "The student is now in the 'Evidence Gathering' stage. Help them locate key data in the text. Explain the significance of the evidence and what it implies. If applicable, search for a real-world example that illustrates the author's findings.",
  Analysis: "The student has moved to the 'Analysis Ready' stage. Guide them in evaluating the author's methodology and assumptions. Explain different analytical viewpoints and ask them to consider the strengths and weaknesses of the author's approach.",
  Advanced: "The student is in the 'Advanced Synthesis' stage. Help them connect the article's findings to broader landscape ecology concepts. Use web search to find contemporary research or conservation projects that build upon the article's ideas, and discuss the real-world implications.",
};

export const STAGE_DESCRIPTIONS: Record<LearningStage, {title: string, description: string, prompt: string}> = {
    Comprehension: {
        title: "Comprehension Building",
        description: "Focus on understanding the article's main points, purpose, and key definitions.",
        prompt: "Let's start by focusing on the core arguments. I can help clarify anything in the 'Discussion' section. What stands out to you as the most important message?"
    },
    Evidence: {
        title: "Evidence Gathering",
        description: "Locate specific evidence in the text and understand its importance.",
        prompt: "Now, let's dig into the evidence. Let me know if you want to explore any specific data points in the 'Results' section and what they mean."
    },
    Analysis: {
        title: "Analysis & Evaluation",
        description: "Critically evaluate the author's methods, assumptions, and conclusions.",
        prompt: "Let's analyze the author's approach. We can discuss the strengths or potential limitations in the 'Methods' section and how they might influence the conclusions."
    },
    Advanced: {
        title: "Advanced Synthesis",
        description: "Connect the article to broader concepts and real-world applications.",
        prompt: "Let's think about the bigger picture. We can now explore how this study's findings apply to real-world conservation problems. I can look up some current examples."
    }
};

export const LANDSCAPE_ECOLOGY_CONCEPTS: string[] = [
  'Patch', 'Corridor', 'Matrix', 'Scale (Grain & Extent)',
  'Edge Effect', 'Habitat Fragmentation', 'Connectivity (Structural vs. Functional)',
  'Metapopulation', 'Source-Sink Dynamics', 'Island Biogeography Theory',
  'Landscape Heterogeneity', 'Disturbance Regime', 'Hierarchy Theory'
];