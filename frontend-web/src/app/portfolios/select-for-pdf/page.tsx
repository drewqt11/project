"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Keep if you plan confirmation, otherwise remove
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FolderOpen, Briefcase, ChevronRight, FileOutput, AlertTriangle } from "lucide-react";

// Define interfaces (can be shared if you have a common types file)
interface UserProfile {
  id: string;
  // Add other fields if needed
}

interface PortfolioSummary {
  portfolioId: string;
  title: string;
  // lastUpdatedAt?: string; 
  // summarySnippet?: string; 
}

export default function SelectPortfolioForPdfPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [portfolios, setPortfolios] = React.useState<PortfolioSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Consistent text colors
  const primaryTextColor = "text-slate-900 dark:text-slate-50";
  const secondaryTextColor = "text-slate-500 dark:text-slate-400";
  const accentColor = "text-[#C89B3C]";

  // Fetch user
  React.useEffect(() => {
    const storedUserCookie = Cookies.get("user");
    const token = Cookies.get("token");

    if (!token) {
      toast.error("Authentication required. Redirecting to sign in...");
      router.push("/auth/signin");
      return;
    }

    if (storedUserCookie) {
      try {
        const parsedUser = JSON.parse(storedUserCookie) as UserProfile;
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser);
        } else {
          throw new Error("User ID not found in stored data.");
        }
      } catch (e) {
        console.error("Failed to parse user data from cookie:", e);
        toast.error("Session error. Please sign in again.");
        Cookies.remove("token");
        Cookies.remove("user");
        router.push("/auth/signin");
        return;
      }
    } else {
      // This case might be redundant if the token check already redirects,
      // but good as a fallback.
      toast.error("User data not found. Please sign in again.");
      router.push("/auth/signin");
      return;
    }
  }, [router]);

  // Fetch portfolios once user is available
  React.useEffect(() => {
    if (!user?.id) {
      if(!isLoading && !error) setIsLoading(true); 
      return;
    }

    async function fetchPortfolios() {
      setIsLoading(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        // No need to re-check token here as the first useEffect does it.

        const response = await fetch(`/api/users/${user!.id}/portfolios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404) {
             setPortfolios([]); 
          } else {
            throw new Error(errorData.message || `Failed to fetch portfolios (status: ${response.status})`);
          }
        } else {
            const data: PortfolioSummary[] = await response.json();
            setPortfolios(data);
        }
      } catch (err: any) {
        console.error("Error fetching portfolios:", err);
        setError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Could not load portfolios.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPortfolios();
  }, [user]); // Rerun when user changes

  const handlePortfolioSelect = (portfolioId: string) => {
    router.push(`/portfolios/${portfolioId}/generate-pdf`);
  };

  // Main content rendering
  let content;
  if (isLoading) {
    content = (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-700 shadow-lg rounded-xl bg-white dark:bg-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex flex-col items-center justify-center text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg border border-red-200 dark:border-red-700/50">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className={`text-2xl font-semibold ${primaryTextColor} mb-2`}>Could not load portfolios</h2>
        <p className={`${secondaryTextColor} mb-6`}>{error}</p>
        <Button 
          onClick={() => {
            if(user?.id) {
                const currentUser = user;
                setUser(null); 
                setTimeout(() => setUser(currentUser), 0); // Re-trigger fetch
            }
          }} 
          className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] text-white"
          disabled={!user?.id}
        >
          Try Again
        </Button>
      </div>
    );
  } else if (portfolios.length === 0) {
    content = (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <FolderOpen className={`h-24 w-24 ${accentColor} mb-6`} />
        <h2 className={`text-2xl font-semibold ${primaryTextColor} mb-3`}>No Portfolios Found</h2>
        <p className={`${secondaryTextColor} max-w-md mb-8`}>
          You haven\'t created any portfolios yet. Create one from your dashboard to generate a PDF.
        </p>
        <Link href="/portfolios/create" passHref>
          <Button className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all group">
            Create a Portfolio NOW!
          </Button>
        </Link>
      </div>
    );
  } else {
    content = (
      <div className="space-y-3">
        {portfolios.map((portfolio) => (
          <Card 
            key={portfolio.portfolioId} 
            className="border-slate-200 dark:border-slate-700 shadow-lg rounded-xl bg-white dark:bg-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group"
            onClick={() => handlePortfolioSelect(portfolio.portfolioId)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 bg-gradient-to-br from-[#4a0001]/20 to-[#c89b3c]/20 dark:from-[#4a0001]/30 dark:to-[#c89b3c]/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Briefcase className={`h-5 w-5 ${accentColor}`} />
                </div>
                <div>
                  <CardTitle className={`text-lg font-semibold ${primaryTextColor} group-hover:${accentColor} transition-colors`}>{portfolio.title}</CardTitle>
                  {/* <p className={`text-xs ${secondaryTextColor} mt-0.5`}>Portfolio ID: {portfolio.portfolioId}</p> */}
                </div>
              </div>
              <ChevronRight className={`h-6 w-6 ${secondaryTextColor} group-hover:translate-x-1 transition-transform`} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container max-w-3xl mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-6">
          {/* Back Button and Page Title */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 ${secondaryTextColor} hover:bg-slate-100 dark:hover:bg-slate-800`}
                  onClick={() => router.push('/dashboard')} // Go back to dashboard
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
            </div>
             <div className="flex items-center gap-3 pt-2">
                <FileOutput className={`h-8 w-8 ${accentColor}`} />
                <div>
                    <h1 className={`text-3xl font-bold tracking-tight ${primaryTextColor}`}>Select Portfolio for PDF</h1>
                    <p className={`text-sm ${secondaryTextColor}`}>
                    Choose which of your portfolios you\'d like to generate a PDF for.
                    </p>
                </div>
            </div>
          </div>
          
          {content}
        </div>
      </main>
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