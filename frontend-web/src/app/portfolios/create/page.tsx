"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

// Define the schema for the form
const portfolioFormSchema = z.object({
  title: z.string().min(1, "Portfolio title is required.").max(100, "Title must be 100 characters or less."),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

// UserProfile interface (simplified for this context)
interface UserProfile {
  id: string; // This should match the type of userId expected by the backend (e.g., string or number)
  // Add other fields if needed, e.g., for display
}

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = React.useState(true);
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = React.useState(false);

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      title: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const {formState: {isSubmitting}, watch} = form;
  const portfolioTitle = watch("title"); // Watch the title field

  // Consistent text colors with dashboard/profile page
  const primaryTextColor = "text-slate-900 dark:text-slate-50";
  const secondaryTextColor = "text-slate-500 dark:text-slate-400";

  // Authentication and user data fetching
  React.useEffect(() => {
    const token = Cookies.get("token");
    const storedUserCookie = Cookies.get("user");

    if (!token) {
      toast.error("Authentication required. Redirecting to sign in...");
      router.push("/auth/signin");
      return;
    }

    if (storedUserCookie) {
      try {
        const parsedUser = JSON.parse(storedUserCookie) as UserProfile;
        // Ensure the user object from cookie has the 'id' field that matches 'userId'
        // The backend uses 'userId' but the cookie might store it as 'id'.
        // Adjust here if your cookie stores it differently, e.g. parsedUser.userId
        if (parsedUser && parsedUser.id) {
          setUser({ id: parsedUser.id }); // Assuming your cookie user object has an 'id' field for userId
        } else {
          throw new Error("User ID not found in stored data.");
        }
      } catch (error) {
        console.error("Failed to parse user data from cookie:", error);
        toast.error("Session error. Please sign in again.");
        Cookies.remove("token");
        Cookies.remove("user");
        router.push("/auth/signin");
        return;
      }
    } else {
      toast.error("User data not found. Please sign in again.");
      router.push("/auth/signin");
      return;
    }
    setIsLoadingAuth(false);
  }, [router]);
  
  async function onSubmit(data: PortfolioFormValues) {
    if (!user || !user.id) {
      toast.error("User ID not found. Cannot create portfolio.");
      setIsConfirmAlertOpen(false); // Close dialog on error
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication token not found. Please sign in again.");
        router.push("/auth/signin");
        setIsConfirmAlertOpen(false); // Close dialog on error
        return;
      }

      const response = await fetch(`/api/users/${user.id}/portfolios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: data.title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An unknown error occurred." }));
        throw new Error(errorData.message || `Failed to create portfolio (status: ${response.status})`);
      }

      // Assuming the response contains the created portfolio data
      const newPortfolio = await response.json(); 
      toast.success(`Portfolio "${newPortfolio.title}" created successfully!`);
      
      // Redirect to the edit page for the new portfolio
      router.push(`/portfolios/${newPortfolio.portfolioId}/edit`);

    } catch (error: any) {
      console.error("Error creating portfolio:", error);
      toast.error(error.message || "Could not create portfolio. Please try again.");
    } finally {
      setIsConfirmAlertOpen(false); // Ensure dialog is closed
    }
  }

  if (isLoadingAuth || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container max-w-2xl mx-auto py-8 md:py-12 flex items-center justify-center">
          <div className="w-full space-y-6">
            <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-5 w-3/4" />
            </div>
            <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Skeleton className="h-5 w-20 mb-1" /><Skeleton className="h-10 w-full" /></div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container max-w-2xl mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-8">
          {/* Page header */}
          <div className="flex flex-col space-y-2">
            <h1 className={`text-3xl font-bold tracking-tight ${primaryTextColor}`}>
              Create New Portfolio
            </h1>
            <p className={`text-sm ${secondaryTextColor}`}>
              Give your new portfolio a unique title to get started.
            </p>
          </div>

          {/* Create Portfolio Form Card */}
          <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle className={`text-xl ${primaryTextColor}`}>Portfolio Details</CardTitle>
                  <CardDescription className={secondaryTextColor}>
                    What would you like to name your portfolio?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`${primaryTextColor} text-sm font-medium`}>Portfolio Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder='e.g. "My Awesome Work" or "Project Showcase"'
                            {...field} 
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription className={`text-xs ${secondaryTextColor}`}>
                          This will be the main title for your portfolio (1-100 characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()} 
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" // Changed from submit to button
                    onClick={() => setIsConfirmAlertOpen(true)} // Open dialog
                    className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all min-w-[150px]"
                    disabled={isSubmitting || !portfolioTitle || portfolioTitle.trim() === ""} // Disable if no title or submitting
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      // Using a generic icon or none, as PlusCircle might imply direct creation
                      // For now, let's remove the icon or use a more neutral one if desired later
                      <>
                      </>
                    )}
                    {isSubmitting ? "Creating..." : "Next"} 
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Confirmation Alert Dialog */}
          <AlertDialog open={isConfirmAlertOpen} onOpenChange={setIsConfirmAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Portfolio Title</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to create a portfolio with the title: <strong className="text-slate-900 dark:text-slate-100">"{portfolioTitle}"</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>No</AlertDialogCancel>
                <AlertDialogAction onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, Create"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </main>
       {/* Footer consistent with dashboard */}
      <footer className="py-8 bg-gray-50 dark:bg-gray-900 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
        <div className="container mx-auto px-4 md:px-6 flex justify-center">
          <p className={`text-sm ${secondaryTextColor}`}>
            &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 