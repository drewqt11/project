"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { ArrowLeft, Save, PlusCircle, Trash2, Loader2, AlertCircle } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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

// --- Zod Schemas for Portfolio Sections ---

// Personal Information
const personalInformationSchema = z.object({
  fullName: z.string().min(1, "Full name is required.").max(100),
  email: z.string().email("Invalid email address.").max(100),
  phone: z.string().min(1, "Phone number is required.").max(20),
  address: z.string().min(1, "Address is required.").max(255),
  summary: z.string().min(1, "Professional summary is required.").max(1000),
  linkedinUrl: z.string().url("Invalid URL").max(255).optional().or(z.literal('')),
  githubUrl: z.string().url("Invalid URL").max(255).optional().or(z.literal('')),
  websiteUrl: z.string().url("Invalid URL").max(255).optional().or(z.literal('')),
});

// Employment History Item
const employmentHistoryItemSchema = z.object({
  id: z.string().optional(), // For existing items during update
  company: z.string().min(1, "Company name is required.").max(100),
  position: z.string().min(1, "Position is required.").max(100),
  startDate: z.string().min(1, "Start date is required.").max(7), // YYYY-MM
  endDate: z.string().max(7).optional().or(z.literal('')), // YYYY-MM or "Present"
  description: z.string().max(2000).optional().or(z.literal('')),
});

// Educational Background Item
const educationalBackgroundItemSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution name is required.").max(100),
  degree: z.string().min(1, "Degree is required.").max(100),
  fieldOfStudy: z.string().max(100).optional().or(z.literal('')),
  graduationYear: z.string().max(4).optional().or(z.literal('')), // YYYY
  gpa: z.string().max(10).optional().or(z.literal('')),
});

// Skill Item (within a category)
const skillItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required.").max(50),
  // level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(), // Example, if you want skill levels
});

// Skill Category
const skillCategorySchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Category name is required.").max(50),
  items: z.array(skillItemSchema),
});

// Project Showcase Item
const projectShowcaseItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required.").max(100),
  description: z.string().max(2000).optional().or(z.literal('')),
  technologies: z.array(z.string().min(1).max(50)).optional(), // Array of strings
  link: z.string().url("Invalid URL.").max(255).optional().or(z.literal('')),
  imageUrl: z.string().url("Invalid URL.").max(255).optional().or(z.literal('')),
});

// Main Edit Portfolio Form Schema (matching UpdatePortfolioRequest)
const editPortfolioFormSchema = z.object({
  title: z.string().min(1, "Portfolio title is required.").max(100),
  personalInformation: personalInformationSchema,
  employmentHistory: z.array(employmentHistoryItemSchema).nullable().optional(),
  educationalBackground: z.array(educationalBackgroundItemSchema).nullable().optional(),
  skills: z.array(skillCategorySchema).nullable().optional(),
  projectShowcases: z.array(projectShowcaseItemSchema).nullable().optional(),
});

type EditPortfolioFormValues = z.infer<typeof editPortfolioFormSchema>;

// Interface for the portfolio data fetched from backend
// This should align with PortfolioResponse from your backend
interface PortfolioData extends EditPortfolioFormValues {
  portfolioId: string;
  userId: string;
  // any other fields returned by GET /api/portfolios/{portfolioId}
}

export default function EditPortfolioPage2() { // Renamed component
  const router = useRouter();
  const params = useParams();
  const portfolioId = params.portfolioId as string;

  const [isLoadingPage, setIsLoadingPage] = React.useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [initialData, setInitialData] = React.useState<PortfolioData | null>(null);
  const [activeTab, setActiveTab] = React.useState("personal-info");
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false); // New state for cancel confirmation

  const form = useForm<EditPortfolioFormValues>({
    resolver: zodResolver(editPortfolioFormSchema),
    defaultValues: { // Default empty structure
      title: "",
      personalInformation: { // Provide default empty object for personalInformation
        fullName: "",
        email: "",
        phone: "",
        address: "",
        summary: "",
        linkedinUrl: "",
        githubUrl: "",
        websiteUrl: "",
      },
      employmentHistory: [],
      educationalBackground: [],
      skills: [],
      projectShowcases: [],
    },
    mode: "onChange",
  });

  const {fields: employmentFields, append: appendEmployment, remove: removeEmployment} = useFieldArray({
    control: form.control,
    name: "employmentHistory",
  });

  const {fields: educationFields, append: appendEducation, remove: removeEducation} = useFieldArray({
    control: form.control,
    name: "educationalBackground",
  });

  const {fields: skillCategories, append: appendSkillCategory, remove: removeSkillCategory} = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const {fields: projectFields, append: appendProject, remove: removeProject} = useFieldArray({
    control: form.control,
    name: "projectShowcases",
  });

  // Consistent text colors
  const primaryTextColor = "text-slate-900 dark:text-slate-50";
  const secondaryTextColor = "text-slate-500 dark:text-slate-400";

  // Helper function to format phone number input
  function formatPhoneNumber(value: string): string {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }

  // Fetch initial portfolio data
  React.useEffect(() => {
    if (!portfolioId) {
      toast.error("Portfolio ID is missing.");
      router.push("/dashboard"); // Or an error page
      return;
    }

    async function fetchPortfolioData() {
      setIsLoadingPage(true);
      setError(null);
      try {
        const token = Cookies.get("token");
        if (!token) {
          toast.error("Authentication required.");
          router.push("/auth/signin");
          return;
        }

        const response = await fetch(`/api/portfolios/${portfolioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404) {
            throw new Error("Portfolio not found.");
          }
          throw new Error(errorData.message || `Failed to fetch portfolio (status: ${response.status})`);
        }

        const data: PortfolioData = await response.json();
        
        const parsedData: PortfolioData = {
            ...data,
            personalInformation: typeof data.personalInformation === 'string' ? JSON.parse(data.personalInformation) : data.personalInformation,
            employmentHistory: typeof data.employmentHistory === 'string' ? JSON.parse(data.employmentHistory as unknown as string) : data.employmentHistory,
            educationalBackground: typeof data.educationalBackground === 'string' ? JSON.parse(data.educationalBackground as unknown as string) : data.educationalBackground,
            skills: typeof data.skills === 'string' ? JSON.parse(data.skills as unknown as string) : data.skills,
            projectShowcases: typeof data.projectShowcases === 'string' ? JSON.parse(data.projectShowcases as unknown as string) : data.projectShowcases,
        };
        
        setInitialData(parsedData);
        form.reset({ 
          title: parsedData.title || "",
          personalInformation: parsedData.personalInformation || { 
            fullName: "", email: "", phone: "", address: "", 
            summary: "", linkedinUrl: "", githubUrl: "", websiteUrl: "" 
          },
          employmentHistory: parsedData.employmentHistory || [],
          educationalBackground: parsedData.educationalBackground || [],
          skills: parsedData.skills || [],
          projectShowcases: parsedData.projectShowcases || [],
        });
        
      } catch (err: any) {
        console.error("Error fetching portfolio data:", err);
        setError(err.message || "An unexpected error occurred.");
        toast.error(err.message || "Could not load portfolio data.");
        if (err.message === "Portfolio not found.") {
            router.push("/dashboard"); 
        }
      } finally {
        setIsLoadingPage(false);
      }
    }

    fetchPortfolioData();
  }, [portfolioId, router, form]);

  // Handle Form Submission
  async function onSubmit(data: EditPortfolioFormValues) {
    if (!portfolioId) {
      toast.error("Portfolio ID is missing.");
      return;
    }
    setIsSubmittingForm(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication token not found.");
        router.push("/auth/signin");
        setIsSubmittingForm(false);
        return;
      }
      
      const payload = {
        ...data,
        personalInformation: data.personalInformation ? JSON.stringify(data.personalInformation) : null,
        employmentHistory: data.employmentHistory ? JSON.stringify(data.employmentHistory) : null,
        educationalBackground: data.educationalBackground ? JSON.stringify(data.educationalBackground) : null,
        skills: data.skills ? JSON.stringify(data.skills) : null,
        projectShowcases: data.projectShowcases ? JSON.stringify(data.projectShowcases) : null,
      };

      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update portfolio (status: ${response.status})`);
      }

      const updatedPortfolio = await response.json();
      toast.success(`Portfolio "${updatedPortfolio.title}" updated successfully!`);
      router.push("/portfolios/showcase"); 
    } catch (err: any) {
      console.error("Error updating portfolio:", err);
      setError(err.message || "An unexpected error occurred while saving.");
      toast.error(err.message || "Could not update portfolio.");
    } finally {
      setIsSubmittingForm(false);
    }
  }

  // --- Helper function for cancel ---
  function handleCancelEdit() {
    if (form.formState.isDirty) {
      setShowCancelConfirm(true);
    } else {
      router.push("/portfolios/showcase");
    }
  }

  function confirmCancelNavigation() {
    setShowCancelConfirm(false);
    router.push("/portfolios/showcase");
  }
  // ---------------------------------

  // Loading State UI
  if (isLoadingPage) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12">
          <div className="flex flex-col space-y-2 mb-8">
            <Skeleton className="h-6 w-24 mb-2" /> 
            <Skeleton className="h-8 w-3/4 mb-1" /> 
            <Skeleton className="h-5 w-1/2" /> 
          </div>
          <Tabs defaultValue="personal-info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
              {["Personal Info", "Employment", "Education", "Skills", "Projects"].map((tabName, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </TabsList>
            <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
              </CardContent>
              <CardFooter className="flex justify-end"><Skeleton className="h-10 w-32" /></CardFooter>
            </Card>
          </Tabs>
        </main>
      </div>
    );
  }

  // Error State UI
  if (error && !initialData) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className={`text-2xl font-semibold ${primaryTextColor} mb-2`}>Could not load Portfolio</h1>
          <p className={`${secondaryTextColor} mb-6`}>{error}</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] text-white">
            Back to Dashboard
          </Button>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col space-y-2 mb-8">
              <h1 className={`text-3xl font-bold tracking-tight ${primaryTextColor}`}>
                Edit Portfolio:`` <span className="text-[#c89b3c]">{initialData?.title || "Loading..."}</span>
              </h1>
              <p className={`text-sm ${secondaryTextColor}`}>
                Update the details of your portfolio. Fill out each section to build a comprehensive showcase.
              </p>
            </div>

            {error && (
              <div className="my-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative flex items-start gap-3" role="alert">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Error:</strong>
                  <span className="block sm:inline ml-1">{error}</span>
                </div>
                <Button variant="ghost" size="sm" className="absolute top-1 right-1 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50 p-1 h-auto" onClick={() => setError(null)}>✕</Button>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full">
                <TabsTrigger 
                    value="personal-info" 
                    className="gap-2 px-6 py-2.5 text-base rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"
                >Personal Info</TabsTrigger>
                <TabsTrigger 
                    value="employment" 
                    className="gap-2 px-6 py-2.5 text-base rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"
                >Employment</TabsTrigger>
                <TabsTrigger 
                    value="education" 
                    className="gap-2 px-6 py-2.5 text-base rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"
                >Education</TabsTrigger>
                <TabsTrigger 
                    value="skills" 
                    className="gap-2 px-6 py-2.5 text-base rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"
                >Skills</TabsTrigger>
                <TabsTrigger 
                    value="projects" 
                    className="gap-2 px-6 py-2.5 text-base rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"
                >Projects</TabsTrigger>
              </TabsList>

              <TabsContent value="personal-info">
                <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                    <CardHeader>
                        <CardTitle className={`text-xl ${primaryTextColor}`}>Personal Information</CardTitle>
                        <CardDescription className={secondaryTextColor}>
                            Provide your contact details and a brief summary about yourself.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="personalInformation.fullName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., John Doe" {...field} value={field.value || ''} disabled={isSubmittingForm} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personalInformation.email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input type="email" placeholder="e.g., john.doe@example.com" {...field} value={field.value || ''} disabled={isSubmittingForm} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="personalInformation.phone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g., (123) 456-7890" 
                                        {...field} 
                                        onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                                        value={field.value || ''} 
                                        disabled={isSubmittingForm} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="personalInformation.address"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl><Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} value={field.value || ''} disabled={isSubmittingForm} className="min-h-[80px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="personalInformation.summary"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Professional Summary</FormLabel>
                                <FormControl><Textarea placeholder="Briefly introduce yourself..." {...field} value={field.value || ''} disabled={isSubmittingForm} className="min-h-[120px]"/></FormControl>
                                <FormDescription>A short bio or summary about your professional background.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Separator />
                        <h3 className={`text-lg font-medium ${primaryTextColor}`}>Social & Website Links (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="personalInformation.linkedinUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn Profile URL</FormLabel>
                                    <FormControl><Input type="url" placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value || ''} disabled={isSubmittingForm} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personalInformation.githubUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GitHub Profile URL</FormLabel>
                                    <FormControl><Input type="url" placeholder="https://github.com/yourusername" {...field} value={field.value || ''} disabled={isSubmittingForm} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="personalInformation.websiteUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Personal Website/Portfolio URL</FormLabel>
                                <FormControl><Input type="url" placeholder="https://yourdomain.com" {...field} value={field.value || ''} disabled={isSubmittingForm} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="employment">
                <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className={`text-xl ${primaryTextColor}`}>Employment History</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEmployment({ company: ' ', position: ' ', startDate: ' ', endDate: ' ', description: ' ' })} disabled={isSubmittingForm} className="gap-1">
                                <PlusCircle className="h-4 w-4" /> Add Employment
                            </Button>
                        </div>
                        <CardDescription className={secondaryTextColor}>
                            Detail your past and current work experiences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {employmentFields.length === 0 && (
                            <p className={`text-sm ${secondaryTextColor} text-center py-4`}>No employment history added yet. Click "Add Employment" to start.</p>
                        )}
                        {employmentFields.map((item, index) => (
                            <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4 relative bg-slate-50 dark:bg-slate-800/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <FormField
                                        control={form.control}
                                        name={`employmentHistory.${index}.company`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Acme Corp" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`employmentHistory.${index}.position`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position / Role</FormLabel>
                                            <FormControl><Input placeholder="e.g., Software Engineer" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`employmentHistory.${index}.startDate`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl><Input placeholder="YYYY-MM" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`employmentHistory.${index}.endDate`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date (or "Present")</FormLabel>
                                            <FormControl><Input placeholder="YYYY-MM or Present" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`employmentHistory.${index}.description`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Responsibilities & Achievements (Optional)</FormLabel>
                                        <FormControl><Textarea placeholder="Describe your role and accomplishments..." {...field} disabled={isSubmittingForm} className="min-h-[100px]" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 p-1 h-auto"
                                    onClick={() => removeEmployment(index)} 
                                    disabled={isSubmittingForm}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="education">
                <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className={`text-xl ${primaryTextColor}`}>Educational Background</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ institution: ' ', degree: ' ', fieldOfStudy: ' ', graduationYear: ' ', gpa: ' ' })} disabled={isSubmittingForm} className="gap-1">
                                <PlusCircle className="h-4 w-4" /> Add Education
                            </Button>
                        </div>
                        <CardDescription className={secondaryTextColor}>
                            List your academic qualifications and achievements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {educationFields.length === 0 && (
                            <p className={`text-sm ${secondaryTextColor} text-center py-4`}>No educational background added yet. Click "Add Education" to start.</p>
                        )}
                        {educationFields.map((item, index) => (
                            <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4 relative bg-slate-50 dark:bg-slate-800/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <FormField
                                        control={form.control}
                                        name={`educationalBackground.${index}.institution`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., University of Example" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`educationalBackground.${index}.degree`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Degree / Qualification</FormLabel>
                                            <FormControl><Input placeholder="e.g., B.S. in Computer Science" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name={`educationalBackground.${index}.fieldOfStudy`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field of Study (Optional)</FormLabel>
                                            <FormControl><Input placeholder="e.g., Software Engineering" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`educationalBackground.${index}.graduationYear`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Graduation Year (Optional)</FormLabel>
                                            <FormControl><Input placeholder="YYYY" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`educationalBackground.${index}.gpa`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GPA / Grade (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., 3.8/4.0 or A+" {...field} disabled={isSubmittingForm} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 p-1 h-auto"
                                    onClick={() => removeEducation(index)} 
                                    disabled={isSubmittingForm}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="skills">
                <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className={`text-xl ${primaryTextColor}`}>Skills & Expertise</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendSkillCategory({ category: ' ', items: [{ name: ' ' }] })} disabled={isSubmittingForm} className="gap-1">
                                <PlusCircle className="h-4 w-4" /> Add Skill Category
                            </Button>
                        </div>
                        <CardDescription className={secondaryTextColor}>
                            Showcase your skills, grouped by categories (e.g., Programming Languages, Software, Design Tools).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {skillCategories.length === 0 && (
                            <p className={`text-sm ${secondaryTextColor} text-center py-4`}>No skills added yet. Click "Add Skill Category" to start.</p>
                        )}
                        {skillCategories.map((categoryItem, categoryIndex) => (
                            <div key={categoryItem.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4 bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex justify-between items-center">
                                    <FormField
                                        control={form.control}
                                        name={`skills.${categoryIndex}.category`}
                                        render={({ field }) => (
                                        <FormItem className="flex-grow">
                                            <FormLabel>Skill Category Title</FormLabel>
                                            <FormControl><Input placeholder="e.g., Programming Languages" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 p-1 h-auto self-end mb-1"
                                        onClick={() => removeSkillCategory(categoryIndex)} 
                                        disabled={isSubmittingForm}
                                    >
                                        <Trash2 className="h-4 w-4" /> <span className="sr-only">Remove Category</span>
                                    </Button>
                                </div>
                                <Separator />
                                <SkillItemsArray control={form.control} categoryIndex={categoryIndex} isSubmittingForm={isSubmittingForm} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="projects">
                <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className={`text-xl ${primaryTextColor}`}>Project Showcases</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendProject({ title: '', description: '', technologies: [], link: '', imageUrl: '' })} disabled={isSubmittingForm} className="gap-1">
                                <PlusCircle className="h-4 w-4" /> Add Project
                            </Button>
                        </div>
                        <CardDescription className={secondaryTextColor}>
                            Highlight your key projects, including links and visuals if available.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {projectFields.length === 0 && (
                            <p className={`text-sm ${secondaryTextColor} text-center py-4`}>No projects added yet. Click "Add Project" to showcase your work.</p>
                        )}
                        {projectFields.map((item, index) => (
                            <div key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4 relative bg-slate-50 dark:bg-slate-800/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <FormField
                                        control={form.control}
                                        name={`projectShowcases.${index}.title`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Title</FormLabel>
                                            <FormControl><Input placeholder="e.g., E-commerce Platform" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name={`projectShowcases.${index}.link`}
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Link (Optional)</FormLabel>
                                            <FormControl><Input type="url" placeholder="https://example.com/my-project" {...field} disabled={isSubmittingForm} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name={`projectShowcases.${index}.description`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl><Textarea placeholder="Describe the project, its goals, and your role..." {...field} disabled={isSubmittingForm} className="min-h-[100px]" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`projectShowcases.${index}.technologies`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Technologies Used (Optional)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="e.g., React, Node.js, PostgreSQL" 
                                                    {...field} 
                                                    onChange={(e) => {
                                                        const techs = e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
                                                        field.onChange(techs);
                                                    }}
                                                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                                    disabled={isSubmittingForm} 
                                                />
                                            </FormControl>
                                            <FormDescription>Comma-separated list of technologies.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`projectShowcases.${index}.imageUrl`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL (Optional)</FormLabel>
                                        <FormControl><Input type="url" placeholder="https://example.com/image.png" {...field} disabled={isSubmittingForm} /></FormControl>
                                        <FormDescription>Link to a screenshot or logo for the project.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 p-1 h-auto"
                                    onClick={() => removeProject(index)} 
                                    disabled={isSubmittingForm}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end items-center mt-8 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmittingForm}
                  className="py-3 px-6 text-base border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all min-w-[150px] py-3 px-6 text-base"
                  disabled={isSubmittingForm || !form.formState.isDirty}
                >
                  {isSubmittingForm ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {isSubmittingForm ? "Saving..." : "Save Changes"} 
                </Button>
            </div>
          </form>
        </Form>
      </main>
      <footer className="py-8 bg-gray-50 dark:bg-gray-900 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
        <div className="container mx-auto px-4 md:px-6 flex justify-center">
          <p className={`text-sm ${secondaryTextColor}`}>
            &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className={primaryTextColor}>Discard Unsaved Changes?</AlertDialogTitle>
            <AlertDialogDescription className={secondaryTextColor}>
              You have unsaved changes. Are you sure you want to cancel editing? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700" 
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              onClick={confirmCancelNavigation}
            >
              Yes, Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface SkillItemsArrayProps {
  control: any; 
  categoryIndex: number;
  isSubmittingForm: boolean;
}

function SkillItemsArray({ control, categoryIndex, isSubmittingForm }: SkillItemsArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `skills.${categoryIndex}.items`,
  });

  const primaryTextColor = "text-slate-900 dark:text-slate-50";
  const secondaryTextColor = "text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
      {fields.map((item, skillIndex) => (
        <div key={item.id} className="flex items-end gap-3 relative pt-2">
          <FormField
            control={control}
            name={`skills.${categoryIndex}.items.${skillIndex}.name`}
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel className="text-xs">Skill #{skillIndex + 1}</FormLabel>
                <FormControl><Input placeholder="e.g., JavaScript" {...field} value={field.value || ''} disabled={isSubmittingForm} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-700/50 h-9 w-9 shrink-0"
            onClick={() => remove(skillIndex)} 
            disabled={isSubmittingForm || fields.length <=1} 
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove Skill</span>
          </Button>
        </div>
      ))}
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => append({ name: '' })} 
        disabled={isSubmittingForm}
        className="mt-2 gap-1 text-xs"
      >
        <PlusCircle className="h-3.5 w-3.5" /> Add Skill to this Category
      </Button>
    </div>
  );
} 