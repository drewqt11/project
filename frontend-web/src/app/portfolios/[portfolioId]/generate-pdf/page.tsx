"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, AlertTriangle, FileText, Settings, CheckCircle } from "lucide-react";

// Interface for basic portfolio details (can be expanded)
interface PortfolioDetails {
  portfolioId: string;
  title: string;
}

interface PdfStyleOptions {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  includeFooter: boolean;
  pageSize: string;
  customPdfName?: string;
}

const availableFonts = ["Arial", "Verdana", "Times New Roman", "Helvetica"];
const availablePageSizes = ["A4", "Letter"];

export default function GeneratePortfolioPdfPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const portfolioId = params.portfolioId as string;

  const [portfolio, setPortfolio] = React.useState<PortfolioDetails | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = React.useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [generationError, setGenerationError] = React.useState<string | null>(null);
  const [customPdfName, setCustomPdfName] = React.useState<string>("");

  // PDF Styling Options State
  const [pdfStyles, setPdfStyles] = React.useState<PdfStyleOptions>({
    primaryColor: "#2d5f9a",
    secondaryColor: "#4a7fb5",
    fontFamily: "Arial",
    includeFooter: true,
    pageSize: "A4",
  });

  const handleStyleChange = (field: keyof PdfStyleOptions, value: any) => {
    setPdfStyles(prev => ({ ...prev, [field]: value }));
  };

  // Consistent text colors from other pages
  const primaryTextColor = "text-slate-900 dark:text-slate-50";
  const secondaryTextColor = "text-slate-500 dark:text-slate-400";
  const accentColor = "text-[#C89B3C]"; // Gold accent

  // Fetch portfolio details (title)
  React.useEffect(() => {
    if (!portfolioId) {
      setIsLoadingPortfolio(false);
      setGenerationError("Portfolio ID is missing.");
      toast.error("Cannot load portfolio details: ID is missing.");
      return;
    }

    async function fetchPortfolioDetails() {
      setIsLoadingPortfolio(true);
      setGenerationError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          toast.error("Authentication required. Redirecting to sign in...");
          router.push("/auth/signin");
          return;
        }
        const response = await fetch(`/api/portfolios/${portfolioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 404) throw new Error("Portfolio not found.");
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch portfolio details (status: ${response.status})`);
        }
        const data: PortfolioDetails = await response.json();
        setPortfolio(data);
      } catch (err: any) {
        console.error("Error fetching portfolio details:", err);
        setGenerationError(err.message || "Could not load portfolio details.");
        toast.error(err.message || "Could not load portfolio details.");
      } finally {
        setIsLoadingPortfolio(false);
      }
    }
    fetchPortfolioDetails();
  }, [portfolioId, router]);

  const handleGeneratePdf = async () => {
    if (!portfolioId || !portfolio) {
      toast.error("Portfolio details are not loaded yet.");
      return;
    }

    // Check if custom PDF name is provided
    if (!customPdfName.trim()) {
      toast.error("Please provide a PDF Label / Version Name.");
      setGenerationError("PDF Label / Version Name is required."); // Optional: set a state error too
      return;
    }

    setIsGeneratingPdf(true);
    setGenerationError(null);
    toast.info("Generating PDF...", { id: "pdf-generation-toast" });

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required.");
        setIsGeneratingPdf(false);
        return;
      }

      // Prepare payload, including customPdfName
      const payload: PdfStyleOptions = {
        ...pdfStyles,
        customPdfName: customPdfName.trim() || undefined,
      };

      const generateResponse = await fetch(`/api/portfolios/${portfolioId}/generate-pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const generateData = await generateResponse.json();

      if (!generateResponse.ok) {
        throw new Error(generateData.message || `Failed to initiate PDF generation (status: ${generateResponse.status})`);
      }

      if (generateData.status === "success" && generateData.pdfUrl && generateData.filename) {
        toast.success(`PDF for "${portfolio.title}" generated successfully! Redirecting...`, { id: "pdf-generation-toast" });
        router.push("/portfolios/showcase?tab=generated-pdfs");
      } else {
        throw new Error(generateData.message || "Unexpected response from PDF generation service.");
      }

    } catch (err: any) {
      console.error("Error in PDF generation process:", err);
      setGenerationError(err.message || "An unexpected error occurred during the PDF process.");
      toast.error(err.message || "Could not process PDF request.", { id: "pdf-generation-toast" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container max-w-3xl mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${secondaryTextColor} hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={() => {
                const fromShowcase = searchParams.get("from") === "showcase-portfolios";
                if (fromShowcase) {
                  router.push("/portfolios/showcase?tab=my-portfolios");
                } else {
                  router.push(`/portfolios/select-for-pdf`);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
              <FileText className={`h-8 w-8 ${accentColor}`} />
              <div>
                <h1 className={`text-3xl font-bold tracking-tight ${primaryTextColor}`}>
                  Generate PDF
                </h1>
                <div className={`text-sm ${secondaryTextColor}`}>
                  {isLoadingPortfolio ? <Skeleton className="h-4 w-48 mt-1" /> : 
                   portfolio ? `Configure and create a PDF for: ${portfolio.title}` : "Loading portfolio details..."}
                </div>
              </div>
          </div>

          {generationError && !isGeneratingPdf && !isLoadingPortfolio && (
            <Alert variant="destructive" className="border-red-500/50 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-700 dark:text-red-300">Portfolio Loading Error</AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-400">
                {generationError}
              </AlertDescription>
            </Alert>
          )}
          
          {isLoadingPortfolio && (
             <Card className="shadow-xl rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                    <div className="flex items-center gap-3">
                        <Settings className={`h-6 w-6 ${accentColor}`} />
                        <CardTitle className={`text-xl font-semibold ${primaryTextColor}`}>Customization Options</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                     <Skeleton className="h-10 w-1/3" />
                </CardContent>
                <CardFooter className="border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 px-6 py-4">
                    <Skeleton className="h-10 w-full md:w-1/3" />
                </CardFooter>
            </Card>
          )}

          {!isLoadingPortfolio && portfolio && (
            <Card className="shadow-xl rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                    <Settings className={`h-6 w-6 ${accentColor}`} />
                    <CardTitle className={`text-xl font-semibold ${primaryTextColor}`}>Customization Options</CardTitle>
                </div>
                <CardDescription className={`${secondaryTextColor} pt-1`}>
                  Adjust the appearance of your generated PDF document.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <Label htmlFor="primaryColor" className={`${primaryTextColor} mb-1.5 block text-sm font-medium`}>Primary Color</Label>
                    <Input 
                        id="primaryColor" 
                        type="color" 
                        value={pdfStyles.primaryColor} 
                        onChange={(e) => handleStyleChange("primaryColor", e.target.value)}
                        className="h-10 p-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className={`${primaryTextColor} mb-1.5 block text-sm font-medium`}>Secondary Color</Label>
                    <Input 
                        id="secondaryColor" 
                        type="color" 
                        value={pdfStyles.secondaryColor} 
                        onChange={(e) => handleStyleChange("secondaryColor", e.target.value)}
                        className="h-10 p-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontFamily" className={`${primaryTextColor} mb-1.5 block text-sm font-medium`}>Font Family</Label>
                    <Select value={pdfStyles.fontFamily} onValueChange={(value) => handleStyleChange("fontFamily", value)}>
                      <SelectTrigger id="fontFamily" className="h-10">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pageSize" className={`${primaryTextColor} mb-1.5 block text-sm font-medium`}>Page Size</Label>
                    <Select value={pdfStyles.pageSize} onValueChange={(value) => handleStyleChange("pageSize", value)}>
                      <SelectTrigger id="pageSize" className="h-10">
                        <SelectValue placeholder="Select page size" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePageSizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="customPdfName" className={`${primaryTextColor} mb-1.5 block text-sm font-medium`}>
                    PDF Label / Version Name
                  </Label>
                  <Input
                    id="customPdfName"
                    type="text"
                    placeholder="e.g., Client Proposal, Q3 Report"
                    value={customPdfName}
                    onChange={(e) => setCustomPdfName(e.target.value)}
                    className="h-10"
                  />
                  <p className={`text-xs ${secondaryTextColor} mt-1.5`}>
                    Give this specific PDF version a unique name for easier identification.
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="includeFooter" 
                    checked={pdfStyles.includeFooter} 
                    onCheckedChange={(checked) => handleStyleChange("includeFooter", checked)}
                  />
                  <Label htmlFor="includeFooter" className={`${primaryTextColor} text-sm font-medium cursor-pointer`}>Include Footer in PDF</Label>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 px-6 py-4">
                <Button 
                  onClick={handleGeneratePdf} 
                  disabled={isGeneratingPdf || isLoadingPortfolio}
                  className="w-full md:w-auto bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all group"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                  Generate into PDF
                </Button>
              </CardFooter>
            </Card>
          )}

          {generationError && isGeneratingPdf && (
            <Alert variant="destructive" className="mt-6 border-red-500/50 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-700 dark:text-red-300">PDF Generation Failed</AlertTitle>
              <AlertDescription className="text-red-600 dark:text-red-400">
                {generationError}
              </AlertDescription>
            </Alert>
          )}
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