'use server';

/**
 * @fileOverview Dynamically generates a personalized roadmap using AI.
 *
 * - generateDynamicRoadmap - A function that creates a personalized roadmap based on user input.
 * - GenerateDynamicRoadmapInput - The input type for the roadmap generation.
 * - GenerateDynamicRoadmapOutput - The return type for the roadmap generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDynamicRoadmapInputSchema = z.object({
  currentSkills: z.string().describe('The current skills and background of the user.'),
  goal: z.string().describe('The goal the user wants to achieve.'),
});
export type GenerateDynamicRoadmapInput = z.infer<typeof GenerateDynamicRoadmapInputSchema>;

const RoadmapStepSchema = z.object({
    title: z.string().describe("The title of this step in the roadmap."),
    duration: z.string().describe("An estimated duration for this step (e.g., '2-3 Weeks')."),
    description: z.string().describe("A concise, one-sentence description of this roadmap step."),
    icon: z.enum(["BookOpen", "Target", "ListTodo", "BrainCircuit", "Layers", "Palette", "PenTool", "Milestone", "Flag", "ClipboardCheck", "TrendingUp", "Rocket"]).describe("An icon name that best represents this step from the provided list."),
    subTasks: z.array(z.object({ title: z.string() })).describe("A list of 4-6 specific, actionable sub-tasks for this step."),
    focusTechniques: z.array(z.string()).describe("A list of 2-3 practical focus techniques relevant to this step."),
    resources: z.array(z.object({
        title: z.string().describe("The title of the resource."),
        url: z.string().describe("The URL for the resource."),
    })).describe("A list of 2-3 high-quality online resources (articles, tutorials, docs, videos) for this step."),
});

const GenerateDynamicRoadmapOutputSchema = z.object({
    roadmap: z.array(RoadmapStepSchema).describe("The generated roadmap, consisting of 3 to 5 distinct steps."),
});
export type GenerateDynamicRoadmapOutput = z.infer<typeof GenerateDynamicRoadmapOutputSchema>;

export async function generateDynamicRoadmap(input: GenerateDynamicRoadmapInput): Promise<GenerateDynamicRoadmapOutput> {
  return generateDynamicRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDynamicRoadmapPrompt',
  input: { schema: GenerateDynamicRoadmapInputSchema },
  output: { schema: GenerateDynamicRoadmapOutputSchema },
  prompt: `You are an expert strategist and mentor. Your task is to generate a structured, actionable, and personalized roadmap for a user who wants to achieve a specific goal.

The user's goal is: **{{{goal}}}**
The user's current skills and background are: **{{{currentSkills}}}**

Based on this, create a realistic roadmap with 3 to 5 distinct steps. Each step must be a JSON object with the following fields:
- title: A clear and concise title for the step (e.g., "Mastering Foundational Skills").
- duration: A realistic time estimate (e.g., "4-6 Weeks").
- description: A short, encouraging one-sentence overview of the step's goal.
- icon: Choose the most fitting icon name from this list: BookOpen, Target, ListTodo, BrainCircuit, Layers, Palette, PenTool, Milestone, Flag, ClipboardCheck, TrendingUp, Rocket.
- subTasks: A list of 4-6 specific sub-tasks. These should be concrete actions (e.g., "Learn about core principles," "Build a simple prototype").
- focusTechniques: A list of 2-3 actionable focus techniques tailored to the learning content of the step (e.g., "Use the Pomodoro Technique for focused work sessions," "Timebox research on new topics to 1 hour").
- resources: A list of 2-3 real, high-quality, and publicly accessible online resources (e.g., articles, tutorials, documentation, videos). Each resource must have a title and a valid URL.

Generate the output as a single JSON object with a "roadmap" key, which contains the array of steps.
`,
});

const generateDynamicRoadmapFlow = ai.defineFlow(
  {
    name: 'generateDynamicRoadmapFlow',
    inputSchema: GenerateDynamicRoadmapInputSchema,
    outputSchema: GenerateDynamicRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate a roadmap. The AI model did not return a valid output.");
    }
    return output;
  }
);
