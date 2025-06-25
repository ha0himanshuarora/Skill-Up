"use client";

import { useState } from "react";
import { generateAiAdvice } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon, Sparkles, Loader2, ListTodo, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CheckedState } from "@radix-ui/react-checkbox";
import type { RoadmapStep } from "@/lib/types";
import { iconMap } from "@/lib/iconMap";
import { Code } from "lucide-react";

interface RoadmapStepProps {
  step: RoadmapStep;
  index: number;
  userSkills: string;
  goal: string;
  checkedItems: Record<string, boolean>;
  onCheckboxChange: (id: string, isChecked: boolean) => void;
}

export default function RoadmapStepComponent({ step, index, userSkills, goal, checkedItems, onCheckboxChange }: RoadmapStepProps) {
  const [aiResult, setAiResult] = useState<{ advice: string; focusTechniques: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [accordionValue, setAccordionValue] = useState<string>("");

  const handleGetAdvice = async () => {
    if (aiResult) {
      setAccordionValue(accordionValue ? "" : "ai-advice");
      return;
    }

    setIsLoading(true);
    setError("");
    setAccordionValue("ai-advice");

    const result = await generateAiAdvice({
      roadmapStep: step.title,
      userSkills,
      goal,
    });

    if (result.success && result.data) {
      setAiResult(result.data);
    } else {
      setError(result.error || "An unknown error occurred.");
      setAccordionValue("");
    }
    setIsLoading(false);
  };

  const IconComponent = iconMap[step.icon] || Code;

  return (
    <div className="relative fade-in-step" style={{ animationDelay: `${index * 150}ms` }}>
      <div className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-background border-4 border-primary flex items-center justify-center">
        <IconComponent className="h-4 w-4 text-primary" />
      </div>

      <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="font-headline text-2xl">{step.title}</CardTitle>
            <Badge variant="secondary">{step.duration}</Badge>
          </div>
          <CardDescription className="pt-2 text-base">{step.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-3 font-headline flex items-center"><ListTodo className="mr-2 h-5 w-5" /> Detailed Topics</h4>
          <ul className="space-y-2 mb-6 pl-2">
            {step.subTasks.map((task, i) => {
                const id = `task-${index}-${i}`;
                return (
                    <li key={id} className="flex items-center">
                        <Checkbox id={id} className="mr-3" onCheckedChange={(checked: CheckedState) => onCheckboxChange(id, checked === true)} checked={!!checkedItems[id]} />
                        <Label htmlFor={id} className={`font-normal transition-colors ${checkedItems[id] ? 'line-through text-muted-foreground' : ''}`}>{task.title}</Label>
                    </li>
                );
            })}
        </ul>

          <h4 className="font-semibold mb-3 font-headline flex items-center"><LinkIcon className="mr-2 h-5 w-5" /> Recommended Resources</h4>
          <ul className="space-y-2 mb-6 pl-2">
            {step.resources.map((resource, i) => {
                const id = `resource-${index}-${i}`;
                return (
                  <li key={id} className="flex items-center">
                      <Checkbox id={id} className="mr-3" onCheckedChange={(checked: CheckedState) => onCheckboxChange(id, checked === true)} checked={!!checkedItems[id]}/>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 text-primary hover:underline transition-colors ${checkedItems[id] ? 'line-through !text-muted-foreground !no-underline' : ''}`}
                      >
                        <span>{resource.title}</span>
                      </a>
                  </li>
                );
            })}
          </ul>

          <h4 className="font-semibold mb-3 font-headline flex items-center"><Target className="mr-2 h-5 w-5" /> Focus Techniques</h4>
          <ul className="space-y-2 mb-6 list-disc list-inside text-muted-foreground">
              {step.focusTechniques.map((technique, i) => (
                  <li key={`technique-${index}-${i}`}>{technique}</li>
              ))}
          </ul>

          <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
            <AccordionItem value="ai-advice" className="border-t pt-6 mt-6">
                <Button onClick={handleGetAdvice} variant="outline" className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  )}
                  {aiResult ? "Show" : "Get"} AI Advice & Techniques
                </Button>
              <AccordionContent className="pt-4 mt-4 border-t">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <p className="text-destructive">{error}</p>
                ) : aiResult ? (
                  <div className="space-y-6">
                    <div>
                        <h5 className="font-semibold mb-2 font-headline">Personalized Advice</h5>
                        <p className="text-base text-muted-foreground leading-relaxed">{aiResult.advice}</p>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-2 font-headline flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary" /> AI-Powered Focus Techniques</h5>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {aiResult.focusTechniques.map((technique, i) => <li key={`ai-technique-${i}`}>{technique}</li>)}
                        </ul>
                    </div>
                </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </div>
  );
}
