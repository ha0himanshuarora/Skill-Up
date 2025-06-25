"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RoadmapStep from "./RoadmapStep";
import { ChevronsLeft, Save, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { UserMenu } from "./UserMenu";
import type { Roadmap } from "@/lib/types";


interface RoadmapDisplayProps {
  roadmap: Roadmap;
  userSkills: string;
  goal: string;
  onReset: () => void;
  initialCheckedItems?: Record<string, boolean> | null;
}

export default function RoadmapDisplay({
  roadmap,
  userSkills,
  goal,
  onReset,
  initialCheckedItems
}: RoadmapDisplayProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(initialCheckedItems || {});

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: isChecked }));
  };

  const handleSaveProgress = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Signed In",
            description: "Please sign in to save your progress.",
        });
        return;
    }

    const progressData = {
        goal: goal,
        currentSkills: userSkills,
        checkedItems: checkedItems,
        roadmap: roadmap,
    };
    
    try {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { roadmapProgress: progressData });
        toast({ title: "Progress Saved!", description: "Your roadmap progress has been saved to your account." });
    } catch (e) {
        console.error("Error saving to firestore: ", e);
        toast({ variant: "destructive", title: "Save Error", description: "Could not save your progress to the cloud." });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
        <header className="absolute top-0 right-0 p-4 z-20">
            <UserMenu />
        </header>
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="hidden dark:block">
                <div className="absolute top-[-10rem] left-[-20rem] w-[60rem] h-[60rem] bg-primary/15 rounded-full filter blur-3xl opacity-40 animate-aurora-1"></div>
                <div style={{animationDelay: '3s'}} className="absolute bottom-[-15rem] right-[-15rem] w-[60rem] h-[60rem] bg-violet-500/15 rounded-full filter blur-3xl opacity-40 animate-aurora-2"></div>
                <div style={{animationDelay: '6s'}} className="absolute bottom-[5rem] left-[10rem] w-[50rem] h-[50rem] bg-fuchsia-500/10 rounded-full filter blur-3xl opacity-40 animate-aurora-3"></div>
            </div>
        </div>
        
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-24">
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
              Your Roadmap to Achieve:
            </h1>
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 text-transparent bg-clip-text mt-1">
              {goal}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button onClick={onReset} variant="outline">
              <ChevronsLeft className="mr-2 h-4 w-4" /> Start Over
            </Button>
            <Button onClick={handleSaveProgress} disabled={!user}>
              {!user ? <UserX className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Progress
            </Button>
          </div>

          <div id="roadmap-container" className="relative pl-8">
            <div
              className="absolute left-8 top-0 bottom-0 w-1.5 bg-primary/10 rounded"
              aria-hidden="true"
            ></div>
            <div className="space-y-12">
              {roadmap.map((step, index) => (
                <RoadmapStep
                  key={index}
                  step={step}
                  index={index}
                  userSkills={userSkills}
                  goal={goal}
                  checkedItems={checkedItems}
                  onCheckboxChange={handleCheckboxChange}
                />
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
