
import type { StudySet } from './types';

// Fix: The mock data objects below did not match the `StudySet` type.
// The extraneous `isUploaded` property has been removed from each object, and the
// missing required properties (`user_id`, `article_title`, `article_author`, `created_at`)
// have been added to resolve the type errors.
export const STUDY_SETS: StudySet[] = [
  {
    id: '1',
    user_id: 'mock-user-1',
    article_title: 'Habitat Fragmentation and Landscape Connectivity',
    article_author: 'Fahrig, L.',
    created_at: '2024-01-01T00:00:00Z',
    article: {
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
    assignment: {
        content: `
            Assignment Questions for Fahrig (2003):
            1. Based on the abstract, what are the two main components of habitat fragmentation?
            2. What does the author argue is the primary threat to biodiversity: habitat loss or fragmentation per se? Where in the text do you find the strongest evidence for this?
            3. According to the 'Discussion' section, how might the focus on fragmentation be misdirecting conservation resources?
            4. In your own words, explain the difference between a conservation strategy focused on corridors versus one focused on protecting large habitat blocks.
        `,
        questions: [
            "What are the two main components of habitat fragmentation?",
            "What is the primary threat to biodiversity: habitat loss or fragmentation per se?",
            "How might the focus on fragmentation be misdirecting conservation resources?",
            "Explain the difference between a conservation strategy focused on corridors versus one focused on protecting large habitat blocks."
        ]
    }
  },
  {
    id: '2',
    user_id: 'mock-user-1',
    article_title: 'Scale Concepts in Landscape Ecology',
    article_author: 'Wiens, J. A.',
    created_at: '2024-01-02T00:00:00Z',
    article: {
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
          
-         Conclusion: Explicitly addressing scale is not just a methodological nicety; it is essential for advancing ecological understanding and for applying that understanding to real-world problems. Researchers must justify their choice of scale and be cautious when extrapolating findings from one scale to another. A multi-scale approach is often necessary to gain a comprehensive understanding of complex ecological phenomena.
        `,
    },
    assignment: {
        content: `
            Assignment Questions for Wiens (1989):
            1. Define 'grain' and 'extent' in your own words, based on the 'Components of Scale' section.
            2. Why is there no single 'correct' scale for ecological research?
            3. Provide an example of a research question where the appropriate scale would be very small (e.g., meters) and one where it would be very large (e.g., hundreds of kilometers).
        `,
        questions: [
            "Define 'grain' and 'extent' in your own words.",
            "Why is there no single 'correct' scale for ecological research?",
            "Provide an example of a research question for a small scale and a large scale."
        ]
    }
  },
];

export const SYSTEM_PROMPT = `
You are 'Eco', an AI Teaching Assistant for a university-level landscape ecology course.
Your purpose is to guide a student through their reading assignment. You have been given two documents: the ARTICLE (the primary source text) and the ASSIGNMENT (a list of questions to answer).

Your Core Method (Assignment-Focused Socratic Tutor):
1.  **Goal is Assignment Completion:** Your entire purpose is to help the student formulate high-quality answers to the questions in the ASSIGNMENT, using evidence from the ARTICLE.
2.  **Follow the Assignment Structure:** Address the questions from the ASSIGNMENT one by one, in order. Start the conversation by focusing on the first question.
3.  **Question, Don't Tell:** Your primary mode of interaction is asking probing questions. Your goal is to make the student find the answer in the text themselves.
    -   Instead of: "The author says the answer is X."
    -   Ask: "Let's look at question 1: '...'. Based on the abstract, which sentence do you think directly addresses this question?"
4.  **Guide to the Text:** Constantly refer the student back to the provided ARTICLE. Be specific.
    -   "That's a good start. Can you find a specific quote in the 'Discussion' section that backs up your point?"
    -   "To answer the next part of that question, I'd recommend re-reading the first paragraph of the 'Methods' section. What key information do you see there?"
5.  **Confirm Understanding Before Moving On:** Once you believe the student has a solid grasp of a question, confirm it and transition to the next one.
    -   "Excellent, that's a very clear explanation for question 2. Are you ready to move on to question 3, which asks '...'?"
6.  **Maintain a Supportive Tone:** Be encouraging and patient. Use phrases like "That's an interesting perspective...", "You're on the right track...", "Let's break that down further."
7.  **Use External Knowledge Sparingly:** Use your web search ability only if the assignment explicitly requires it or to provide a brief, relevant real-world example to clarify a concept from the article. Always tie it back to the core texts. Cite your sources if you use them.
`;

export const LANDSCAPE_ECOLOGY_CONCEPTS: string[] = [
  'Patch', 'Corridor', 'Matrix', 'Scale (Grain & Extent)',
  'Edge Effect', 'Habitat Fragmentation', 'Connectivity (Structural vs. Functional)',
  'Metapopulation', 'Source-Sink Dynamics', 'Island Biogeography Theory',
  'Landscape Heterogeneity', 'Disturbance Regime', 'Hierarchy Theory'
];