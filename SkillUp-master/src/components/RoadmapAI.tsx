"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RoadmapDisplay from "./RoadmapDisplay";
import { Rocket, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserMenu } from "./UserMenu";
import type { Roadmap, RoadmapProgressData } from "@/lib/types";
import { generateDynamicRoadmap } from "@/lib/actions";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";


const formSchema = z.object({
  currentSkills: z.string(),
  goal: z.string({ required_error: "Please enter a goal." }).min(2, "Please enter a valid goal."),
});

type FormValues = z.infer<typeof formSchema>;

export default function RoadmapAI() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [loadedCheckedItems, setLoadedCheckedItems] = useState<Record<string, boolean> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRoadmapProgress, setSavedRoadmapProgress] = useState<RoadmapProgressData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentSkills: "",
      goal: "",
    },
  });

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        setLoadingProgress(true);
        const userDocRef = doc(firestore, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const savedProgress = docSnap.data().roadmapProgress;
            if (savedProgress && savedProgress.roadmap) {
              setSavedRoadmapProgress(savedProgress);
            }
          }
        } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: "Error", description: "Could not retrieve your saved progress." });
        } finally {
          setLoadingProgress(false);
        }
      } else {
        setLoadingProgress(false);
        setSavedRoadmapProgress(null);
      }
    };
    if (!authLoading) {
      loadProgress();
    }
  }, [user, authLoading, toast]);


  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setLoadedCheckedItems(null);
    setSavedRoadmapProgress(null);
    
    const result = await generateDynamicRoadmap({
      currentSkills: data.currentSkills,
      goal: data.goal,
    });
    
    if (result.success && result.data) {
        setRoadmap(result.data.roadmap);
        setSubmittedData(data);
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: result.error || "An unexpected error occurred while generating the roadmap.",
        });
    }
    
    setIsLoading(false);
  }

  const calculateProgress = (progress: RoadmapProgressData | null): { total: number, completed: number, percentage: number } => {
    if (!progress || !progress.roadmap) {
        return { total: 0, completed: 0, percentage: 0 };
    }
    const totalTasks = progress.roadmap.reduce((acc, step) => acc + step.subTasks.length + step.resources.length, 0);
    const completedTasks = Object.values(progress.checkedItems || {}).filter(Boolean).length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { total: totalTasks, completed: completedTasks, percentage };
  };

  function handleViewSavedRoadmap() {
    if (savedRoadmapProgress) {
        setRoadmap(savedRoadmapProgress.roadmap);
        setSubmittedData({
            currentSkills: savedRoadmapProgress.currentSkills,
            goal: savedRoadmapProgress.goal,
        });
        setLoadedCheckedItems(savedRoadmapProgress.checkedItems || {});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleReset() {
    setRoadmap(null);
    setSubmittedData(null);
    setLoadedCheckedItems(null);
    form.reset();
  }

  if (roadmap && submittedData) {
    return (
      <RoadmapDisplay
        roadmap={roadmap}
        userSkills={submittedData.currentSkills}
        goal={submittedData.goal}
        onReset={handleReset}
        initialCheckedItems={loadedCheckedItems}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
        <header className="absolute top-0 right-0 p-4 z-10">
          <UserMenu />
        </header>
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="hidden dark:block">
                <div className="absolute top-[-10rem] left-[-20rem] w-[60rem] h-[60rem] bg-primary/15 rounded-full filter blur-3xl opacity-40 animate-aurora-1"></div>
                <div style={{animationDelay: '3s'}} className="absolute bottom-[-15rem] right-[-15rem] w-[60rem] h-[60rem] bg-violet-500/15 rounded-full filter blur-3xl opacity-40 animate-aurora-2"></div>
                <div style={{animationDelay: '6s'}} className="absolute bottom-[5rem] left-[10rem] w-[50rem] h-[50rem] bg-fuchsia-500/10 rounded-full filter blur-3xl opacity-40 animate-aurora-3"></div>
            </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-24">
          <div className="text-center mb-12">
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
              RoadmapAI
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Chart your course to anywhere. Define your ultimate goal, and our AI will forge the path for you.
            </p>
          </div>

          {user && (
            <div className="mb-12">
                {loadingProgress ? (
                    <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ) : savedRoadmapProgress ? (
                    <Card className="shadow-2xl shadow-primary/20 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
                            <CardDescription>Your journey to become a <span className="font-semibold text-primary">{savedRoadmapProgress.goal}</span> is underway.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-4">
                           <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-muted-foreground">Overall Progress</p>
                                        <p className="text-sm font-bold">{calculateProgress(savedRoadmapProgress).percentage}%</p>
                                    </div>
                                    <Progress value={calculateProgress(savedRoadmapProgress).percentage} className="h-3" />
                                </div>
                                <Button onClick={handleViewSavedRoadmap} className="w-full">
                                    Continue Your Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
          )}


          <Card id="generate-new-roadmap" className="shadow-2xl shadow-primary/20 bg-card/80 backdrop-blur-sm scroll-mt-24">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">
                    {savedRoadmapProgress ? "Start a New Journey" : "Create Your Roadmap"}
                </CardTitle>
                <CardDescription>
                    Tell us your goal and background, and our AI will forge a personalized path for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg">
                          Your Current Skills & Background
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'I have 3 years of experience in marketing and I'm familiar with basic graphic design tools.'"
                            className="min-h-[120px] text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List any relevant skills or experience. The more detail, the better the roadmap.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg">Define Your Ultimate Goal</FormLabel>
                        <FormControl>
                           <Input placeholder="e.g., 'Become a freelance web developer', 'Open a coffee shop', 'Learn to play the guitar'" className="text-base" {...field} />
                        </FormControl>
                        <FormDescription>
                          What do you want to achieve? Be specific!
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading || authLoading}>
                      {isLoading || authLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Rocket className="mr-2 h-5 w-5" />
                      )}
                      {isLoading ? 'Generating...' : 'Generate My Roadmap'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
