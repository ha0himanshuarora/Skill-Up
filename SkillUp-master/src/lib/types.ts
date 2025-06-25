export type RoadmapStep = {
  title: string;
  duration: string;
  description: string;
  icon: string; // Icon name as a string
  subTasks: { title: string }[];
  focusTechniques: string[];
  resources: {
    title: string;
    url: string;
  }[];
};

export type Roadmap = RoadmapStep[];

export type RoadmapProgressData = {
    roadmap: Roadmap;
    checkedItems: Record<string, boolean>;
    goal: string;
    currentSkills: string;
}
