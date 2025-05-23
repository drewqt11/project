"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, PlusCircle, Edit3, Trash2, Eye, FolderOpen, Briefcase, ArrowLeft, FileDown, Clock, FilePlus2 } from "lucide-react";

// Define interfaces
interface UserProfile {
  id: string;
  // Add other fields if needed, e.g., for display
}

interface PortfolioSummary {
  portfolioId: string;
  title: string;
  lastUpdatedAt?: string; // From your previous dashboard, might be useful
  createdAt: string; // Added for creation date
}

interface GeneratedPdfSummary {
  id: string;
  portfolioId: string;
  customDisplayName?: string;
  originalPortfolioTitle: string;
  filename: string;
  downloadUrl: string;
  generatedAt: string;
  fileSize?: number;
  styleOptions?: PdfStyleOptionsSummary; // Added style options
}

// Interface for PDF style options (mirroring backend DTO)
interface PdfStyleOptionsSummary {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  includeFooter?: boolean;
  pageSize?: string;
}

export default function PortfolioShowcasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  
  // State for active tab
  const initialTab = searchParams.get("tab") === "generated-pdfs" ? "generated-pdfs" : "my-portfolios";
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // State for editable portfolios
  const [portfolios, setPortfolios] = React.useState<PortfolioSummary[]>([]);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = React.useState(true);
  const [portfoliosError, setPortfoliosError] = React.useState<string | null>(null);
  const [portfolioToDelete, setPortfolioToDelete] = React.useState<string | null>(null);

  // State for generated PDF portfolios
  const [generatedPdfs, setGeneratedPdfs] = React.useState<GeneratedPdfSummary[]>([]);
  const [isLoadingGeneratedPdfs, setIsLoadingGeneratedPdfs] = React.useState(true);
  const [generatedPdfsError, setGeneratedPdfsError] = React.useState<string | null>(null);
  const [pdfToDelete, setPdfToDelete] = React.useState<{portfolioId: string; filename: string; displayName: string;} | null>(null);

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
      toast.error("User data not found. Please sign in again.");
      router.push("/auth/signin");
      return;
    }
  }, [router]);

  // Fetch editable portfolios
  React.useEffect(() => {
    if (!user?.id) {
      if(!isLoadingPortfolios && !portfoliosError) setIsLoadingPortfolios(true);
      return;
    }

    async function fetchEditablePortfolios() {
      setIsLoadingPortfolios(true);
      setPortfoliosError(null);
      try {
        const token = Cookies.get("token");
        const response = await fetch(`/api/users/${user!.id}/portfolios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404) setPortfolios([]);
          else throw new Error(errorData.message || `Failed to fetch portfolios (status: ${response.status})`);
        } else {
          const data: PortfolioSummary[] = await response.json();
          setPortfolios(data);
        }
      } catch (err: any) {
        console.error("Error fetching portfolios:", err);
        setPortfoliosError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Could not load portfolios.");
      } finally {
        setIsLoadingPortfolios(false);
      }
    }
    fetchEditablePortfolios();
  }, [user]);

  // Fetch generated PDF portfolios
  React.useEffect(() => {
    if (!user?.id) {
      if(!isLoadingGeneratedPdfs && !generatedPdfsError) setIsLoadingGeneratedPdfs(true);
      return;
    }

    async function fetchGeneratedPdfs() {
      setIsLoadingGeneratedPdfs(true);
      setGeneratedPdfsError(null);
      try {
        const token = Cookies.get("token");
        const response = await fetch(`/api/users/${user!.id}/generated-pdfs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404) setGeneratedPdfs([]);
          else throw new Error(errorData.message || `Failed to fetch generated PDFs (status: ${response.status})`);
        } else {
          const data: GeneratedPdfSummary[] = await response.json();
          setGeneratedPdfs(data);
        }
      } catch (err: any) {
        console.error("Error fetching generated PDFs:", err);
        setGeneratedPdfsError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Could not load generated PDF list.");
      } finally {
        setIsLoadingGeneratedPdfs(false);
      }
    }
    fetchGeneratedPdfs();
  }, [user]);
  
  const handleDeletePortfolio = async () => {
    if (!portfolioToDelete) return;

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required.");
        setPortfolioToDelete(null);
        return;
      }
      
      const response = await fetch(`/api/portfolios/${portfolioToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete portfolio.");
      }

      toast.success("Portfolio deleted successfully!");
      setPortfolios(prev => prev.filter(p => p.portfolioId !== portfolioToDelete));
      setPortfolioToDelete(null);
    } catch (err: any) {
      console.error("Error deleting portfolio:", err);
      toast.error(err.message || "Could not delete portfolio.");
      setPortfolioToDelete(null);
    }
  };

  // Function to format date string (optional, for better display)
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Function to download a generated PDF (similar to generate-pdf page)
  const handleDownloadGeneratedPdf = async (downloadUrl: string, filename: string) => {
    toast.info("Preparing download...", { id: `pdf-download-${filename}` });
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required.", { id: `pdf-download-${filename}` });
        return;
      }
      const response = await fetch(downloadUrl, { // Assuming downloadUrl is the full path
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download PDF (status: ${response.status})`);
      }
      const blob = await response.blob();
      if (blob.type === "application/pdf") {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("PDF download started!", { id: `pdf-download-${filename}` });
      } else {
        throw new Error("Downloaded file is not a PDF.");
      }
    } catch (err: any) {
      console.error("Error downloading generated PDF:", err);
      toast.error(err.message || "Could not download PDF.", { id: `pdf-download-${filename}` });
    }
  };

  const handleDeleteGeneratedPdf = async () => {
    if (!pdfToDelete) return;

    const { portfolioId, filename, displayName } = pdfToDelete;
    const toastId = `pdf-delete-${filename}`;
    toast.loading("Deleting PDF...", { id: toastId });

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required.", { id: toastId });
        setPdfToDelete(null);
        return;
      }

      const response = await fetch(`/api/portfolios/${portfolioId}/generated-pdfs/${filename}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete PDF (status: ${response.status})`);
      }

      toast.success(`PDF "${displayName || filename}" deleted successfully!`, { id: toastId });
      setGeneratedPdfs(prevPdfs => prevPdfs.filter(pdf => pdf.filename !== filename || pdf.portfolioId !== portfolioId));
      setPdfToDelete(null);
    } catch (err: any) {
      console.error("Error deleting generated PDF:", err);
      toast.error(err.message || "Could not delete PDF.", { id: toastId });
      setPdfToDelete(null);
    }
  };

  // Main content rendering
  let portfoliosContent;
  if (isLoadingPortfolios) {
    portfoliosContent = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700/50 px-6 py-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  } else if (portfoliosError) {
    portfoliosContent = (
      <div className="flex flex-col items-center justify-center text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className={`text-2xl font-semibold ${primaryTextColor} mb-2`}>Could not load portfolios</h2>
        <p className={`${secondaryTextColor} mb-6`}>{portfoliosError}</p>
        <Button 
          onClick={() => {
            if(user?.id) {
                const currentUser = user;
                setUser(null); 
                setTimeout(() => setUser(currentUser), 0);
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
    portfoliosContent = (
      <div className="text-center py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/80">
        <FolderOpen className={`h-24 w-24 ${accentColor} mb-6`} />
        <h2 className={`text-2xl font-semibold ${primaryTextColor} mb-3`}>No Portfolios Yet</h2>
        <p className={`${secondaryTextColor} max-w-md mb-8`}>
          It looks like you haven't created any portfolios. Get started by creating your first one!
        </p>
        <Link href="/portfolios/create" passHref>
          <Button className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all min-w-[200px] py-3 text-base group">
            <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Create New Portfolio
          </Button>
        </Link>
      </div>
    );
  } else {
    portfoliosContent = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.portfolioId} className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800 flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 bg-gradient-to-br from-[#4a0001]/20 to-[#c89b3c]/20 dark:from-[#4a0001]/30 dark:to-[#c89b3c]/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Briefcase className={`h-5 w-5 ${accentColor}`} />
                    </div>
                    <CardTitle className={`text-lg font-semibold ${primaryTextColor} group-hover:${accentColor} transition-colors`}>{portfolio.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`flex-grow pt-0 pb-4 text-xs ${secondaryTextColor}`}>
              <p className={`text-sm line-clamp-2 mb-2`}>
                Manage and showcase your professional achievements.
              </p>
              {portfolio.createdAt && (
                <div className={`flex items-center gap-1.5`}>
                  <Clock className="h-3.5 w-3.5" />
                  Created: {formatDate(portfolio.createdAt)}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 px-4 py-3 bg-slate-50 dark:bg-slate-800/30">
              <Link href={`/portfolios/${portfolio.portfolioId}/generate-pdf?from=showcase-portfolios`} passHref>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-xs h-8 border-amber-500 text-amber-600 hover:bg-amber-100 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-700/30">
                  <FilePlus2 className="h-3.5 w-3.5" /> Generate PDF
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link href={`/portfolios/${portfolio.portfolioId}/edit2`} passHref>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1.5 text-xs h-8 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 hover:text-red-700 dark:hover:text-red-400"
                  onClick={() => setPortfolioToDelete(portfolio.portfolioId)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Content rendering for Generated PDFs tab
  let generatedPdfsContent;
  if (isLoadingGeneratedPdfs) {
    generatedPdfsContent = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <Skeleton className="h-4 w-full mb-1.5" />
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 px-4 py-3 bg-slate-50 dark:bg-slate-800/30">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-8 w-8" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  } else if (generatedPdfsError) {
    generatedPdfsContent = (
      <div className="flex flex-col items-center justify-center text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className={`text-2xl font-semibold ${primaryTextColor} mb-2`}>Could not load PDF list</h2>
        <p className={`${secondaryTextColor} mb-6`}>{generatedPdfsError}</p>
        <Button onClick={() => { /* Implement refetch for generated PDFs */ 
            if(user?.id) {
                const currentUser = user; setUser(null); setTimeout(() => setUser(currentUser), 10); // Basic refetch trigger
            }
        }} className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] text-white">Try Again</Button>
      </div>
    );
  } else if (generatedPdfs.length === 0) {
    generatedPdfsContent = (
      <div className="text-center py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/80">
        <FileDown className={`h-24 w-24 ${accentColor} mb-6`} />
        <h2 className={`text-2xl font-semibold ${primaryTextColor} mb-3`}>No Generated PDFs Found</h2>
        <p className={`${secondaryTextColor} max-w-md mb-8`}>
          You haven't generated any PDFs yet. Go to "My Portfolios", select one, and generate a PDF.
        </p>
        {/* Optional: Link to portfolio selection page or dashboard */}
      </div>
    );
  } else {
    generatedPdfsContent = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedPdfs.map((pdf) => (
          <Card key={pdf.id || pdf.filename} className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800 flex flex-col overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 bg-gradient-to-br from-sky-500/20 to-blue-600/20 dark:from-sky-500/30 dark:to-blue-600/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FileDown className={`h-5 w-5 text-sky-600 dark:text-sky-400`} />
                    </div>
                    <CardTitle className={`text-lg font-semibold ${primaryTextColor} group-hover:${accentColor} transition-colors line-clamp-1`} title={pdf.customDisplayName || pdf.originalPortfolioTitle}>
                        {pdf.customDisplayName || pdf.originalPortfolioTitle}
                    </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`flex-grow pt-0 pb-4 text-xs ${secondaryTextColor}`}>
              <p className={`text-sm line-clamp-2 mb-2`}>
                {pdf.customDisplayName ? `Original: ${pdf.originalPortfolioTitle} | File: ${pdf.filename}` : `File: ${pdf.filename}`}
              </p>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> 
                Generated: {formatDate(pdf.generatedAt)}
              </div>
              {pdf.styleOptions && (
                <div className="mt-1.5 space-y-0.5">
                  {pdf.styleOptions.primaryColor && (
                    <div className="flex items-center gap-1.5">
                      <div style={{ backgroundColor: pdf.styleOptions.primaryColor }} className="h-2.5 w-2.5 rounded-full border border-slate-400 dark:border-slate-500"></div>
                      <span>Primary: {pdf.styleOptions.primaryColor}</span>
                    </div>
                  )}
                  {pdf.styleOptions.fontFamily && (
                    <p>Font: {pdf.styleOptions.fontFamily}</p>
                  )}
                   {/* You can add more style options here if needed */}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 px-4 py-3 bg-slate-50 dark:bg-slate-800/30">
              <Button 
                variant="outline"
                size="sm" 
                className="gap-1.5 text-xs h-8 border-sky-500 text-sky-600 hover:bg-sky-100 dark:border-sky-500 dark:text-sky-400 dark:hover:bg-sky-700/30"
                onClick={() => handleDownloadGeneratedPdf(pdf.downloadUrl, pdf.filename)}
              >
                <FileDown className="h-3.5 w-3.5" /> Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-8 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-700/20 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => setPdfToDelete({ portfolioId: pdf.portfolioId, filename: pdf.filename, displayName: pdf.customDisplayName || pdf.originalPortfolioTitle })}
                title="Delete PDF"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container max-w-6xl mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => router.push("/dashboard")}> 
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <h1 className={`text-3xl font-bold tracking-tight ${primaryTextColor}`}>My Portfolios</h1>
                <p className={`text-sm ${secondaryTextColor}`}>
                Manage your editable portfolios or view your generated PDF documents.
                </p>
            </div>
            {portfolios.length > 0 && (
                 <Link href="/portfolios/create" passHref>
                    <Button className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all group">
                        <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                        Create New Portfolio
                    </Button>
                </Link>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full">
              <TabsTrigger 
                value="my-portfolios" 
                className="gap-2 px-8 py-3 text-lg rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]">
                <Briefcase className="h-6 w-6" />
                My Portfolios
              </TabsTrigger>
              <TabsTrigger 
                value="generated-pdfs" 
                className="gap-2 px-8 py-3 text-lg rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]">
                <FileDown className="h-6 w-6" />
                Generated PDFs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-portfolios">
              {portfoliosContent}
            </TabsContent>

            <TabsContent value="generated-pdfs">
              {generatedPdfsContent}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="py-8 bg-gray-50 dark:bg-gray-900 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
        <div className="container mx-auto px-4 md:px-6 flex justify-center">
          <p className={`text-sm ${secondaryTextColor}`}>
            &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!portfolioToDelete} onOpenChange={(isOpen) => !isOpen && setPortfolioToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className={primaryTextColor}>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className={secondaryTextColor}>
              Are you sure you want to delete this portfolio? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setPortfolioToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              onClick={handleDeletePortfolio}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Generated PDF Confirmation Dialog */}
      <AlertDialog open={!!pdfToDelete} onOpenChange={(isOpen) => !isOpen && setPdfToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className={primaryTextColor}>Confirm PDF Deletion</AlertDialogTitle>
            <AlertDialogDescription className={secondaryTextColor}>
              Are you sure you want to delete the PDF "{pdfToDelete?.displayName || pdfToDelete?.filename}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setPdfToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              onClick={handleDeleteGeneratedPdf}
            >
              Yes, Delete PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 