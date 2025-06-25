"use server";

import {
  generateAiAdvice as genAdvice,
  type GenerateAiAdviceInput,
  type GenerateAiAdviceOutput,
} from "@/ai/flows/generate-ai-advice";

import {
  generateDynamicRoadmap as genRoadmap,
  type GenerateDynamicRoadmapInput,
  type GenerateDynamicRoadmapOutput,
} from "@/ai/flows/generate-dynamic-roadmap";

export async function generateAiAdvice(input: GenerateAiAdviceInput): Promise<{ success: true, data: GenerateAiAdviceOutput } | { success: false, error: string }> {
  try {
    const result = await genAdvice(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("AI Advice Generation Error:", error);
    return {
      success: false,
      error: "Failed to generate AI advice. Please try again later.",
    };
  }
}

export async function generateDynamicRoadmap(input: GenerateDynamicRoadmapInput): Promise<{ success: true, data: GenerateDynamicRoadmapOutput } | { success: false, error: string }> {
  try {
    const result = await genRoadmap(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Dynamic Roadmap Generation Error:", error);
    // Check for specific error messages if the AI returns a structured error.
    const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to generate the roadmap. ${errorMessage}`,
    };
  }
}
