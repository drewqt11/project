"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardHeader } from "@/components/dashboard-header"; // Import the new header
import {
  Plus,
  FileText,
  MoreHorizontal,
  Calendar,
  Clock,
  Download,
  FolderOpen,
  Star,
  Briefcase, // Example for "My Portfolios" icon, consistent with landing
  LineChart, // Added for chart icon
  BarChart2, // Added for new portfolio trends icon
  FileOutput, // Added for Generate into PDF card
  FileDown, // Added for Download a Portfolio card
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
} from "recharts";
import { 
  ChartContainer, 
  ChartConfig, 
  ChartTooltip as ShadcnChartTooltip, // Renaming to avoid conflict if you have a local ChartTooltip
  ChartTooltipContent as ShadcnChartTooltipContent, 
  ChartLegend as ShadcnChartLegend,
  ChartLegendContent as ShadcnChartLegendContent,
} from "@/components/ui/chart"; // Assuming chart.tsx is in ui
import { Skeleton } from "@/components/ui/skeleton";
import Cookies from "js-cookie";

// Sample data for portfolios - replace with actual data fetching
// const portfolios = [
//   {
//     id: "1",
//     title: "Software Engineer Portfolio",
//     description: "Highlighting my experience in full-stack development and cloud architecture",
//     lastEdited: "2 days ago",
//     pages: 5,
//     thumbnail: "/image3.png", // Using an existing image from your project for placeholder
//   },
//   {
//     id: "2",
//     title: "UX Designer Resume",
//     description: "Showcasing my design projects and user research experience",
//     lastEdited: "1 week ago",
//     pages: 3,
//     thumbnail: "/image2.png", // Using an existing image from your project for placeholder
//   },
//   {
//     id: "3",
//     title: "Marketing Portfolio",
//     description: "Collection of my marketing campaigns and growth strategies",
//     lastEdited: "3 weeks ago",
//     pages: 7,
//     thumbnail: "/image4.png", // Using an existing image from your project for placeholder
//   },
// ];

// Add UserProfile interface
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

// Function to safely get item from localStorage
function getCookieItem(key: string) {
  if (typeof window !== "undefined") {
    const item = Cookies.get(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch (e) {
      // If parsing fails, return the raw item (it might not be JSON)
      return item || null;
    }
  }
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  // const [searchQuery, setSearchQuery] = useState(""); // Removed as it's no longer used
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Add userProfile state
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for Portfolio Trends Chart
  const [portfolioTimeRange, setPortfolioTimeRange] = useState("week");
  const [portfolioChartLoading, setPortfolioChartLoading] = useState(true);
  const [portfolioChartData, setPortfolioChartData] = useState<any[]>([]); // Define a proper type later

  const portfolioChartConfig: ChartConfig = {
    portfolios: {
      label: "Portfolios Created",
      color: "#C89B3C", // Using one of the predefined chart colors from shadcn
      icon: Briefcase, // Or LineChart
    },
  };

  // Effect to load/mock portfolio chart data based on time range
  useEffect(() => {
    const fetchData = async () => {
      setPortfolioChartLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      let mockData = [];
      const endDate = new Date();
      if (portfolioTimeRange === "week") {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(endDate);
          date.setDate(endDate.getDate() - i);
          mockData.push({ 
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
            portfolios: Math.floor(Math.random() * 5) + 1 
          });
        }
      } else if (portfolioTimeRange === "month") {
        for (let i = 3; i >= 0; i--) { // 4 weeks
          const weekEndDate = new Date(endDate);
          weekEndDate.setDate(endDate.getDate() - i * 7);
          mockData.push({ 
            date: weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            portfolios: Math.floor(Math.random() * 10) + 5 
          });
        }
      } else if (portfolioTimeRange === "quarter") {
        for (let i = 2; i >= 0; i--) { // 3 months
          // Get the last day of the month for each of the last 3 months
          const monthEndDate = new Date(endDate.getFullYear(), endDate.getMonth() - i + 1, 0);
          mockData.push({ 
            date: monthEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            portfolios: Math.floor(Math.random() * 20) + 10 
          });
        }
      }
      setPortfolioChartData(mockData);
      setPortfolioChartLoading(false);
    };
    fetchData();
  }, [portfolioTimeRange]);

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
          <p className={`label text-sm font-medium ${primaryTextColor}`}>{`${label}`}</p>
          <p className={`intro text-xs ${secondaryTextColor}`}>
            {`Portfolios: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("token");
      const storedUser = getCookieItem("user") as UserProfile | null; // Get user info

      if (!token) {
        router.push("/auth/signin");
      } else {
        setIsAuthenticated(true);
        if (storedUser) { // Set user profile
          setUserProfile(storedUser);
        }
      }
    }
    setIsLoadingAuth(false);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // const filteredPortfolios = portfolios.filter(
  //   (portfolio) =>
  //     portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     portfolio.description.toLowerCase().includes(searchQuery.toLowerCase()),
  // );

  // Consistent text colors with landing page
  const primaryTextColor = "text-black dark:text-white";
  const secondaryTextColor = "text-slate-600 dark:text-slate-400";
  const accentColor = "text-[#C89B3C]";
  const iconColor = "text-[#832225] dark:text-rose-400"; // Primary red tone for icons
  const iconAccentColor = "text-[#C89B3C] dark:text-amber-500"; // Accent gold tone for icons

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 ${primaryTextColor} font-sans`}>
      <DashboardHeader />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 md:py-8">
        <div className="flex flex-col space-y-8">
          {/* Dashboard header text */}
          <div className="flex flex-col space-y-1.5">
            <h1 className={`text-3xl font-bold tracking-tight ${primaryTextColor}`}>
              Welcome, {userProfile?.firstName || "User"}!
            </h1>
            <p className={secondaryTextColor}>Manage your portfolios and create new ones.</p>
          </div>

          {/* Quick navigation cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Portfolio Trends Chart Card - New */}
            <Card className="border-none shadow-xl overflow-hidden bg-white dark:bg-slate-800 rounded-xl md:col-span-2 lg:col-span-2"> {/* Span 2 columns for wider chart */}
              
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 bg-gradient-to-br from-[#4a0001] to-[#c89b3c] rounded-full flex items-center justify-center shadow-md`}>
                      <BarChart2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className={`text-xl font-bold ${primaryTextColor}`}>
                      Portfolio Trends
                    </CardTitle>
                  </div>
                  <Tabs value={portfolioTimeRange} onValueChange={setPortfolioTimeRange} className="w-full md:w-auto">
                    <TabsList className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full">
                      <TabsTrigger
                        value="week"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm rounded-full px-3 md:px-4 py-1 text-xs md:text-sm data-[state=active]:text-[#6e0e0e] dark:data-[state=active]:text-[#6e0e0e]"
                      >
                        Week
                      </TabsTrigger>
                      <TabsTrigger
                        value="month"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm rounded-full px-3 md:px-4 py-1 text-xs md:text-sm data-[state=active]:text-[#6e0e0e] dark:data-[state=active]:text-[#6e0e0e]"
                      >
                        Month
                      </TabsTrigger>
                      <TabsTrigger
                        value="quarter"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm rounded-full px-3 md:px-4 py-1 text-xs md:text-sm data-[state=active]:text-[#6e0e0e] dark:data-[state=active]:text-[#6e0e0e]"
                      >
                        Quarter
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {portfolioChartLoading ? (
                  <Skeleton className="h-[250px] md:h-[300px] w-full rounded-lg" />
                ) : portfolioChartData.length > 0 ? (
                  <div className="h-[250px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={portfolioChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={portfolioChartConfig.portfolios.color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={portfolioChartConfig.portfolios.color} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.7)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: "hsl(var(--border))" }}
                          allowDecimals={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <ShadcnChartTooltip cursor={false} content={<CustomTooltip />} /> 
                        <Area
                          type="monotone"
                          dataKey="portfolios"
                          stroke={portfolioChartConfig.portfolios.color}
                          fillOpacity={1}
                          fill="url(#portfolioGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] md:h-[300px] w-full flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className={`h-12 w-12 ${secondaryTextColor} mx-auto mb-4`} />
                      <h3 className={`text-lg font-medium ${primaryTextColor}`}>
                        No portfolio data available
                      </h3>
                      <p className={`${secondaryTextColor} max-w-md text-sm`}>
                        Portfolio creation trends will appear here once you create more portfolios.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column for Date/Time and Total Portfolios */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Date and Time Card - Updated Design */}
              <div
                className="w-full bg-white dark:bg-slate-800 backdrop-blur-sm rounded-xl p-6 text-center relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-200 group border-none flex flex-col justify-center flex-1 min-h-[140px] md:self-start"
                role="status"
                aria-label={`Current time: ${currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
              >
                <div className={`absolute -top-6 -right-6 w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-400/10`}></div>
                <div className={`absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-400/10`}></div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <Calendar className={`h-5 w-5 ${iconAccentColor}`} aria-hidden="true" />
                  <p className={`text-base ${secondaryTextColor} font-medium`}>
                    {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className={`text-5xl font-mono font-bold ${primaryTextColor} relative`}>
                  {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              {/* Total Portfolio Created Card - NEW */}
              <Card className="border-none shadow-xl overflow-hidden bg-white dark:bg-slate-800 rounded-xl hover:shadow-2xl transition-shadow duration-200 group flex flex-col flex-1 min-h-[140px]">
                
                <CardContent className="p-6 flex flex-col flex-1 justify-center">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-sm font-medium ${secondaryTextColor}`}>Total Portfolios Created</p>
                      <h3 className={`text-3xl font-bold ${primaryTextColor} mt-1`}>
                        0
                      </h3>
                    </div>
                    <div className={`h-14 w-14 bg-[#4a0001]/10 dark:bg-[#4a0001]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Briefcase className={`h-7 w-7 ${iconColor}`} />
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50`}>
                    <p className={`text-xs ${secondaryTextColor}`}>
                      You currently have 0 portfolios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div> {/* End of wrapper for right column cards */}
          </div>

          {/* Create new portfolio card section */}
          <div className="space-y-6">
            <h2 className={`text-2xl font-semibold tracking-tight ${primaryTextColor} mb-4`}>
              Start your Journey here
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {/* Create new portfolio card */}
              <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-center items-center min-h-[280px]">
                <CardHeader className="flex flex-col items-center text-center pb-1">
                  <div className={`h-20 w-20 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-3`}>
                    <Plus className={`h-10 w-10 text-green-600 dark:text-green-400`} />
                  </div>
                  <CardTitle className={`text-xl font-semibold leading-tight ${primaryTextColor}`}>
                    Create
                    <br />
                    Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-3 pb-5">
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Start from scratch or use a template.
                  </p>
                </CardContent>
              </Card>

              {/* Generate into PDF card - New Placeholder */}
              <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-center items-center min-h-[280px]">
                <CardHeader className="flex flex-col items-center text-center pb-1">
                  <div className={`h-20 w-20 bg-amber-500/10 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-3`}>
                    <FileOutput className={`h-10 w-10 text-amber-600 dark:text-amber-400`} />
                  </div>
                  <CardTitle className={`text-xl font-semibold leading-tight ${primaryTextColor}`}>
                    Generate into PDF
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-3 pb-5">
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Convert your existing portfolio to a PDF.
                  </p>
                </CardContent>
                {/* Optional: Add a button or link here later */}
              </Card>

              {/* Download a Portfolio card - New Placeholder */}
              <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-center items-center min-h-[280px]">
                <CardHeader className="flex flex-col items-center text-center pb-1">
                  <div className={`h-20 w-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-3`}>
                    <FileDown className={`h-10 w-10 text-blue-600 dark:text-blue-400`} />
                  </div>
                  <CardTitle className={`text-xl font-semibold leading-tight ${primaryTextColor}`}>
                    Download Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-3 pb-5">
                  <p className={`text-sm ${secondaryTextColor}`}>
                    Access and download your saved portfolios.
                  </p>
                </CardContent>
                {/* Optional: Add a button or link here later */}
              </Card>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="py-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/50">
        <div className="container mx-auto px-4 md:px-6 flex justify-center">
          <p className={`text-sm ${secondaryTextColor}`}>
            &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 