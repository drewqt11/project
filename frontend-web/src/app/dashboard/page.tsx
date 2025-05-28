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
import { validateToken, getUserFromCookies, clearAuthCookies, type UserProfile } from "@/lib/auth";

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

// Interface for individual portfolio summary (adjust as per your API response)
interface PortfolioSummary {
  portfolioId: string;
  title: string;
  lastUpdatedAt?: string; // Expecting this from your API for trends
  createdAt?: string; // Ideal for creation trends
  // Add any other relevant fields from your GET /api/users/{userId}/portfolios response
}

// Function to safely get item from localStorage
// function getCookieItem(key: string) {
//   if (typeof window !== "undefined") {
//     const item = Cookies.get(key);
//     try {
//       return item ? JSON.parse(item) : null;
//     } catch (e) {
//       // If parsing fails, return the raw item (it might not be JSON)
//       return item || null;
//     }
//   }
//   return null;
// }

export default function DashboardPage() {
  const router = useRouter();
  // const [searchQuery, setSearchQuery] = useState(""); // Removed as it's no longer used
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Add userProfile state
  const [currentTime, setCurrentTime] = useState(new Date());

  // State for Portfolio Trends Chart
  const [portfolioTimeRange, setPortfolioTimeRange] = useState("week");
  const [portfolioChartLoading, setPortfolioChartLoading] = useState(true); // This will now depend on allPortfoliosLoading
  const [portfolioChartData, setPortfolioChartData] = useState<any[]>([]); // Define a proper type later

  // State for all user portfolios and total count
  const [allUserPortfolios, setAllUserPortfolios] = useState<PortfolioSummary[]>([]);
  const [isAllPortfoliosLoading, setIsAllPortfoliosLoading] = useState(true);
  const [totalPortfoliosCount, setTotalPortfoliosCount] = useState(0);
  const [portfoliosError, setPortfoliosError] = useState<string | null>(null);

  const portfolioChartConfig: ChartConfig = {
    portfolios: {
      label: "Portfolios Created",
      color: "#C89B3C", // Using one of the predefined chart colors from shadcn
      icon: Briefcase, // Or LineChart
    },
  };

  // Function to process portfolio data for the chart
  function processPortfolioDataForChart(
    portfolios: PortfolioSummary[],
    range: "week" | "month" | "quarter"
  ): { date: string; portfolios: number }[] {
    if (!portfolios || portfolios.length === 0) {
      setPortfolioChartLoading(false);
      return [];
    }

    const now = new Date();
    const validPortfolios = portfolios
      .filter(p => p.createdAt && !isNaN(new Date(p.createdAt).getTime()))
      .map(p => ({ ...p, createdAtDate: new Date(p.createdAt!) }))
      .sort((a, b) => a.createdAtDate.getTime() - b.createdAtDate.getTime());

    if (validPortfolios.length === 0) {
        setPortfolioChartLoading(false);
        return [];
    }
    
    let processedData: { date: string; portfolios: number }[] = [];
    const counts: { [key: string]: number } = {};

    if (range === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      // Initialize counts for the last 7 days
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i - (6 - now.getDay())); // Adjust to show current day as last point
         if (day > now) continue; // Don't project into future
        const formattedDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        counts[formattedDate] = 0;
      }
      
      validPortfolios.forEach(p => {
        const portfolioDate = p.createdAtDate;
        // Check if the portfolio was created within the last 7 days from 'now'
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6); // Includes today
        sevenDaysAgo.setHours(0,0,0,0);

        if (portfolioDate >= sevenDaysAgo && portfolioDate <= now) {
            const formattedDate = portfolioDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (counts[formattedDate] !== undefined) { // Ensure we only count for the initialized days
                 counts[formattedDate]++;
            }
        }
      });
      // Fill processedData based on the days of the current week leading up to 'now'
        for (let i = 6; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);
            day.setHours(0, 0, 0, 0);
            const formattedDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
             // Ensure we only add dates that were initialized
            if(counts[formattedDate] !== undefined) {
                processedData.push({ date: formattedDate, portfolios: counts[formattedDate] || 0 });
            } else {
                 // If a date within the last 7 days wasn't initialized (e.g. due to specific start of week calc),
                 // but we expect it, add it with 0. This handles cases where the 7-day window spans across week starts.
                 const sevenDaysAgo = new Date(now);
                 sevenDaysAgo.setDate(now.getDate() - 6);
                 sevenDaysAgo.setHours(0,0,0,0);
                 if(day >= sevenDaysAgo){
                    processedData.push({ date: formattedDate, portfolios: 0 });
                 }
            }
        }
        // Ensure exactly 7 data points, filling with 0 if necessary for past days leading to 'now'
        const finalWeekData: { date: string; portfolios: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);
            const formattedDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const existingEntry = processedData.find(d => d.date === formattedDate);
            if (existingEntry) {
                finalWeekData.push(existingEntry);
            } else {
                finalWeekData.push({ date: formattedDate, portfolios: 0 });
            }
        }
        processedData = finalWeekData;


    } else if (range === "month") {
      // Aggregates by week for the current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const numWeeks = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7);

      for (let i = 0; i < numWeeks; i++) {
        const weekStartDate = new Date(monthStart);
        weekStartDate.setDate(monthStart.getDate() + i * 7 - monthStart.getDay()); // Start of week (Sunday)
        
        // Ensure weekStartDate does not go before monthStart due to getDay()
        if (weekStartDate < monthStart && weekStartDate.getMonth() !== monthStart.getMonth()) {
            weekStartDate.setDate(weekStartDate.getDate() + 7);
        }
        if (weekStartDate.getMonth() !== monthStart.getMonth() && i === 0) {
             // Special handling for the first week if its Sunday is in the previous month
        }


        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);
        weekEndDate.setHours(23,59,59,999); // End of day

        // Clamp weekEndDate to not exceed current date 'now' or monthEnd
        const displayEndDate = new Date(Math.min(weekEndDate.getTime(), now.getTime(), monthEnd.getTime()));
        
        //Ensure the week displayed is within the current month or ends today
        if (weekStartDate > now ) continue;


        const formattedWeekLabel = `${weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        // const formattedWeekLabel = `W${i + 1} (${displayEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
        counts[formattedWeekLabel] = 0;

        validPortfolios.forEach(p => {
          if (p.createdAtDate >= weekStartDate && p.createdAtDate <= displayEndDate) {
            counts[formattedWeekLabel]++;
          }
        });
         processedData.push({ date: formattedWeekLabel, portfolios: counts[formattedWeekLabel] });
      }
      // Ensure there are at least 4 data points for the month, even if some are 0
        const expectedWeeks = 4; 
        if (processedData.length < expectedWeeks) {
            for (let i = processedData.length; i < expectedWeeks; i++) {
                // Attempt to create meaningful labels for empty future weeks within the month if applicable
                const futureWeekStartGuess = new Date(now.getFullYear(), now.getMonth(), 1);
                futureWeekStartGuess.setDate(futureWeekStartGuess.getDate() + i*7 - futureWeekStartGuess.getDay());
                if (futureWeekStartGuess.getMonth() === now.getMonth() && futureWeekStartGuess <= now) {
                     const label = `${futureWeekStartGuess.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                     if (!processedData.find(dp => dp.date === label)) { // Avoid duplicate dates
                        processedData.push({ date: label, portfolios: 0 });
                     }
                } else {
                    // Fallback label if the above is not suitable or to ensure unique keys
                    const label = `Week ${i + 1}`;
                     if (!processedData.find(dp => dp.date === label)) {
                        processedData.push({ date: label, portfolios: 0 });
                     }
                }
            }
            // Sort by date again if new entries were added, assuming labels are sortable or manage order
            processedData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            // Ensure we don't exceed a sensible number of points (e.g. 5 for a month with partial 5th week)
            processedData = processedData.slice(0, 5); 
        }


    } else if (range === "quarter") {
      // Aggregates by month for the current quarter
      const currentMonth = now.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

      for (let i = 0; i < 3; i++) {
        const monthDate = new Date(now.getFullYear(), quarterStartMonth + i, 1);
        if (monthDate > now) continue; // Don't project into future months

        const monthEnd = new Date(now.getFullYear(), quarterStartMonth + i + 1, 0);
        // Clamp monthEnd to not exceed current date 'now'
        const displayMonthEnd = new Date(Math.min(monthEnd.getTime(), now.getTime()));

        const formattedMonth = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        counts[formattedMonth] = 0;

        validPortfolios.forEach(p => {
          if (p.createdAtDate.getFullYear() === monthDate.getFullYear() &&
              p.createdAtDate.getMonth() === monthDate.getMonth() &&
              p.createdAtDate <= displayMonthEnd) { // Ensure it's within the part of the month that has passed
            counts[formattedMonth]++;
          }
        });
        processedData.push({ date: formattedMonth, portfolios: counts[formattedMonth] });
      }
       // Ensure 3 data points for the quarter
        const expectedMonths = 3;
        if(processedData.length < expectedMonths) {
            for(let i=0; i<expectedMonths; i++) {
                const month = new Date(now.getFullYear(), quarterStartMonth + i, 1);
                const formattedMonth = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (!processedData.find(dp => dp.date === formattedMonth)) {
                    if (month <= now) { // Only add if the month has started
                        processedData.push({ date: formattedMonth, portfolios: 0});
                    } else {
                        // For future months in quarter, can add with 0 or omit
                        // Adding with 0 for consistent 3 points if the quarter isn't over
                         processedData.push({ date: formattedMonth, portfolios: 0});
                    }
                }
            }
             // Sort again as we might have added missing months out of order
            processedData.sort((a, b) => {
                const dateA = new Date(a.date.split(" ")[0] + " 1, " + a.date.split(" ")[1]);
                const dateB = new Date(b.date.split(" ")[0] + " 1, " + b.date.split(" ")[1]);
                return dateA.getTime() - dateB.getTime();
            });
        }
    }
    
    setPortfolioChartLoading(false);
    return processedData;
  }

  // New useEffect to process real portfolio data for the chart
  useEffect(() => {
    if (isAllPortfoliosLoading) {
      setPortfolioChartLoading(true); // Keep chart loading if portfolios are loading
      return;
    }
    
    if (allUserPortfolios) { 
      const chartData = processPortfolioDataForChart(
        allUserPortfolios,
        portfolioTimeRange as "week" | "month" | "quarter"
      );
      setPortfolioChartData(chartData);
      // setPortfolioChartLoading is now handled within processPortfolioDataForChart
    } else {
      setPortfolioChartData([]); 
      setPortfolioChartLoading(false);
    }
  }, [allUserPortfolios, portfolioTimeRange, isAllPortfoliosLoading]); // isAllPortfoliosLoading dependency is important

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
    async function checkAuth() {
      setIsLoadingAuth(true);
      const { isValid, user } = await validateToken();

      if (!isValid || !user) {
        router.push("/auth/signin");
        setIsLoadingAuth(false);
        return;
      }
      
      setIsAuthenticated(true);
      setUserProfile(user);
      setIsLoadingAuth(false);

      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
    }

    checkAuth();
  }, [router]);

  // New useEffect to fetch all portfolios when userProfile is available
  useEffect(() => {
    if (userProfile?.id) {
      async function fetchUserPortfolios() {
        setIsAllPortfoliosLoading(true);
        setPortfoliosError(null);
        const token = Cookies.get("token");

        if (!token) {
          // This case should ideally be caught by the auth useEffect,
          // but as a safeguard:
          setPortfoliosError("Authentication token not found.");
          setIsAllPortfoliosLoading(false);
          // Potentially redirect or show a global error
          return;
        }

        try {
          const response = await fetch(`/api/users/${userProfile!.id}/portfolios`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            if (response.status === 404) { // No portfolios found
              setAllUserPortfolios([]);
              setTotalPortfoliosCount(0);
            } else {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Failed to fetch portfolios (status: ${response.status})`);
            }
          } else {
            const data: PortfolioSummary[] = await response.json();
            setAllUserPortfolios(data);
            setTotalPortfoliosCount(data.length);
          }
        } catch (err: any) {
          console.error("Error fetching user portfolios:", err);
          setPortfoliosError(err.message || "An unexpected error occurred while fetching portfolios.");
          setAllUserPortfolios([]);
          setTotalPortfoliosCount(0);
        } finally {
          setIsAllPortfoliosLoading(false);
        }
      }
      fetchUserPortfolios();
    }
  }, [userProfile]);

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
              <Link href="/portfolios/showcase" passHref>
                <Card className="border-none shadow-xl overflow-hidden bg-white dark:bg-slate-800 rounded-xl hover:shadow-2xl transition-shadow duration-200 group flex flex-col flex-1 min-h-[140px] cursor-pointer">
                  <CardContent className="p-6 flex flex-col flex-1 justify-center">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`text-sm font-medium ${secondaryTextColor}`}>Total Portfolios Created</p>
                        <h3 className={`text-3xl font-bold ${primaryTextColor} mt-1`}>
                          {isAllPortfoliosLoading ? <Skeleton className="h-8 w-12 inline-block" /> : totalPortfoliosCount}
                        </h3>
                      </div>
                      <div className={`h-14 w-14 bg-[#4a0001]/10 dark:bg-[#4a0001]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Briefcase className={`h-7 w-7 ${iconColor}`} />
                      </div>
                    </div>
                    <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50`}>
                      <div className={`text-xs ${secondaryTextColor}`}>
                        {isAllPortfoliosLoading ? <Skeleton className="h-4 w-3/4" /> : `You currently have ${totalPortfoliosCount} ${totalPortfoliosCount === 1 ? "portfolio" : "portfolios"}.`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div> {/* End of wrapper for right column cards */}
          </div>
  
          {/* Create new portfolio card section */}
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {/* Create new portfolio card */}
              <Link href="/portfolios/create" passHref>
                <Card className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-lg transition-all flex flex-col justify-center items-center min-h-[280px]">
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
                      Start from scratch and create your portfolio.
                    </p>
                  </CardContent>
                </Card>
              </Link>
  
              {/* Generate into PDF card - New Placeholder */}
              <Link href="/portfolios/select-for-pdf" passHref>
                <Card className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col justify-center items-center min-h-[280px]">
                  <CardHeader className="flex flex-col items-center text-center pb-1">
                    <div className={`h-20 w-20 bg-amber-500/10 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-3`}>
                      <FileOutput className={`h-10 w-10 text-amber-600 dark:text-amber-400`} />
                    </div>
                    <CardTitle className={`text-xl font-semibold leading-tight ${primaryTextColor}`}>
                      Generate PDF
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-3 pb-5">
                    <p className={`text-sm ${secondaryTextColor}`}>
                      Convert your existing portfolio to a PDF.
                    </p>
                  </CardContent>
                </Card>
              </Link>
  
              {/* Download a Portfolio card - New Placeholder */}
              <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-center items-center min-h-[280px]">
                <CardHeader className="flex flex-col items-center text-center pb-1">
                  <div className={`h-20 w-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-3`}>
                    <FileDown className={`h-10 w-10 text-blue-600 dark:text-blue-400`} />
                  </div>
                  <CardTitle className={`text-xl font-semibold leading-tight ${primaryTextColor}`}>
                    Download PDF
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