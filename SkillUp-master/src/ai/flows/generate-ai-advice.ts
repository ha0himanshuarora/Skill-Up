'use server';

/**
 * @fileOverview AI-powered advice generation for roadmap steps.
 *
 * - generateAiAdvice - A function that generates personalized advice for a given roadmap step.
 * - GenerateAiAdviceInput - The input type for the generateAiAdvice function.
 * - GenerateAiAdviceOutput - The return type for the generateAiAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiAdviceInputSchema = z.object({
  roadmapStep: z.string().describe('The specific step in the roadmap for which advice is needed.'),
  userSkills: z.string().describe('The current skills of the user.'),
  goal: z.string().describe('The ultimate goal the user is aiming for.'),
});
export type GenerateAiAdviceInput = z.infer<typeof GenerateAiAdviceInputSchema>;

const GenerateAiAdviceOutputSchema = z.object({
  advice: z.string().describe('AI-generated personalized advice for the roadmap step.'),
  focusTechniques: z.array(z.string()).describe('A list of 2-3 actionable focus techniques tailored to the learning step, like "Use the Pomodoro Technique for focused sessions" or "Timebox your research on new topics to 1 hour".'),
});
export type GenerateAiAdviceOutput = z.infer<typeof GenerateAiAdviceOutputSchema>;

export async function generateAiAdvice(input: GenerateAiAdviceInput): Promise<GenerateAiAdviceOutput> {
  return generateAiAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiAdvicePrompt',
  input: {schema: GenerateAiAdviceInputSchema},
  output: {schema: GenerateAiAdviceOutputSchema},
  prompt: `You are an expert mentor and strategist providing personalized advice to a user on their learning roadmap.

  The user is currently at the following step in their roadmap: {{{roadmapStep}}}
  The user's current skills are: {{{userSkills}}}
  The user's ultimate goal is: {{{goal}}}

  Provide concise and actionable advice to help the user succeed in this step. Also, intelligently and naturally weave in some words of encouragement to keep the user motivated; focus on the psychological aspects of learning, not just the technical aspects.
  Ensure that the advice is tailored to their current skills and ultimate goal.
  Keep the advice succinct and easy to follow.
  Format the output as a single paragraph of text.

  In addition to the advice, provide a list of 2-3 specific and actionable focus techniques that would be particularly helpful for this learning stage. These should be short, practical tips.
  `,
});

const generateAiAdviceFlow = ai.defineFlow(
  {
    name: 'generateAiAdviceFlow',
    inputSchema: GenerateAiAdviceInputSchema,
    outputSchema: GenerateAiAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
