'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, LogOut, Trash2, Home, Loader2, ArrowRight } from 'lucide-react';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';
import { Progress } from '@/components/ui/progress';
import type { RoadmapProgressData } from '@/lib/types';


export default function ProfilePage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgressData | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchProgress = async () => {
            if (user) {
                setLoadingProgress(true);
                const userDocRef = doc(firestore, 'users', user.uid);
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists() && docSnap.data().roadmapProgress) {
                        setRoadmapProgress(docSnap.data().roadmapProgress);
                    }
                } catch (error) {
                    console.error("Error fetching progress:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Loading Error',
                        description: 'Could not load your roadmap progress.',
                    });
                } finally {
                    setLoadingProgress(false);
                }
            }
        };

        if (!authLoading) {
            fetchProgress();
        }
    }, [user, authLoading, toast]);

    const handleDeleteProgress = async () => {
        if (!user) return;
        setIsDeleting(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            await updateDoc(userDocRef, {
                roadmapProgress: deleteField()
            });
            setRoadmapProgress(null);
            toast({
                title: 'Progress Deleted',
                description: 'Your saved roadmap progress has been successfully deleted.',
            });
        } catch (error) {
            console.error('Error deleting progress:', error);
            toast({
                variant: 'destructive',
                title: 'Deletion Error',
                description: 'Could not delete your progress. Please try again.',
            });
        } finally {
            setIsDeleting(false);
        }
    };
    
    const calculateProgress = (progress: RoadmapProgressData | null): { total: number, completed: number, percentage: number } => {
        if (!progress || !progress.roadmap) {
            return { total: 0, completed: 0, percentage: 0 };
        }
        const totalTasks = progress.roadmap.reduce((acc, step) => acc + step.subTasks.length + step.resources.length, 0);
        const completedTasks = Object.values(progress.checkedItems || {}).filter(Boolean).length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { total: totalTasks, completed: completedTasks, percentage };
    };

    const progressStats = calculateProgress(roadmapProgress);

    if (authLoading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <header className="absolute top-0 left-0 p-4 z-20">
                 <Button variant="outline" asChild>
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </header>
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

            <main className="container mx-auto max-w-2xl px-4 py-24 sm:py-32">
                <Card className="shadow-2xl shadow-primary/20 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-6">
                             <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                <AvatarFallback className="text-3xl">
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="font-headline text-4xl">{user.displayName}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-2 pt-2 text-base">
                           <Mail className="h-4 w-4" /> {user.email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-6">
                        
                        <div className="mb-12">
                            <h3 className="text-2xl font-headline mb-4 text-center">My Roadmap</h3>
                            {loadingProgress ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : roadmapProgress ? (
                                <Card className="bg-background/50">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl">{roadmapProgress.goal}</CardTitle>
                                        <CardDescription>Your personalized learning journey.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                                                    <p className="text-sm font-bold">{progressStats.percentage}%</p>
                                                </div>
                                                <Progress value={progressStats.percentage} className="h-3" />
                                                <p className="text-xs text-muted-foreground mt-1 text-right">{progressStats.completed} of {progressStats.total} items completed</p>
                                            </div>
                                            <Button asChild className="w-full">
                                                <Link href="/">
                                                    View Full Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="text-center p-8 border-dashed bg-background/50">
                                    <CardDescription>
                                        You haven't generated a roadmap yet.
                                    </CardDescription>
                                    <Button asChild className="mt-4">
                                        <Link href="/">Create Your First Roadmap</Link>
                                    </Button>
                                </Card>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="font-headline text-lg text-center text-muted-foreground">Account Management</h3>
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={!roadmapProgress}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete My Progress
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your saved roadmap progress from our servers.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteProgress} disabled={isDeleting}>
                                            {isDeleting ? 
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : 
                                                'Continue'
                                            }
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <Button onClick={signOut} variant="outline">
                                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
