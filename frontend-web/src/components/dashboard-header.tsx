"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string; // Optional avatar URL
}

// Function to safely get item from Cookies
function getCookieItem(key: string) {
  if (typeof window !== "undefined") {
    const item = Cookies.get(key);
    try {
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return item || null; // Return raw if not JSON
    }
  }
  return null;
}

export function DashboardHeader() {
  const router = useRouter();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    const storedUser = getCookieItem("user") as UserProfile | null;
    if (storedUser) {
      setUserProfile(storedUser);
    }

    // Listen for localStorage changes from other tabs/windows or profile page updates
    function handleStorageChange(event: StorageEvent) {
      if (event.key === "user") {
        const newStoredUser = getCookieItem("user") as UserProfile | null;
        if (newStoredUser) {
          setUserProfile(newStoredUser);
        } else {
          // User might have been cleared (e.g., logged out from another tab)
          setUserProfile(null);
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      // Listen for custom event for same-page updates
      window.addEventListener("userProfileUpdated", handleProfileUpdateEvent as EventListener);
    }

    // Cleanup listener on component unmount
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("userProfileUpdated", handleProfileUpdateEvent as EventListener);
      }
    };
  }, []);

  // Handler for the custom userProfileUpdated event
  function handleProfileUpdateEvent(event: CustomEvent<UserProfile>) {
    console.log("DashboardHeader: userProfileUpdated event received", event.detail);
    if (event.detail) {
      setUserProfile(event.detail);
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return `${firstName[0]}`.toUpperCase();
    }
    if (lastName) {
      return `${lastName[0]}`.toUpperCase();
    }
    return "JD"; // Default initials
  };
  
  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "User";
  const displayEmail = userProfile ? userProfile.email : "No email";
  const displayInitials = userProfile ? getInitials(userProfile.firstName, userProfile.lastName) : getInitials();

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: "Logout failed. Please try again."}));
        throw new Error(result.message);
      }

      // Clear client-side storage
      if (typeof window !== "undefined") {
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        Cookies.remove("user");
      }
      
      setUserProfile(null); // Clear user profile state
      toast.success("Logged out successfully!");
      router.push("/auth/signin");

    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during logout.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-transparent backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/folioflow_logo.png"
              alt="FolioFlow Icon"
              width={50}
              height={50}
              priority
            />
            <span className="font-semibold text-2xl text-black dark:text-white">
              FolioFlow
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-3 h-12 min-w-[220px] md:min-w-[250px] ml-auto">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50",
                  "flex items-center gap-3 md:gap-4 pl-6 pr-8 md:pl-8 md:pr-10 py-5 rounded-full transition-all duration-300 flex-shrink-0",
                  "bg-white dark:bg-slate-900 shadow-sm",
                  "hover:bg-[#C89B3C]/20 dark:hover:bg-[#C89B3C]/40",
                  "active:bg-slate-200 dark:active:bg-slate-700",
                  "outline-none focus-visible:ring-1 focus-visible:ring-[#C89B3C]/80",
                  "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/40 aria-invalid:border-red-500"
                )}
              >
                <div className={cn(
                  "h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0",
                  "bg-gradient-to-r from-[#800000] to-[#a70000]",
                  "ring-2 ring-white dark:ring-blue-950"
                )}>
                  {isLoggingOut ? (
                    <div className="h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : userProfile && userProfile.firstName && userProfile.lastName ? (
                    <span className="text-xs md:text-sm font-medium">
                      {userProfile.firstName.charAt(0)}
                      {userProfile.lastName.charAt(0)}
                    </span>
                  ) : (
                    <User className="h-3 w-3 md:h-4 md:w-4" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-xs md:text-sm text-slate-900 dark:text-slate-50 whitespace-nowrap">
                    {!userProfile ? "Loading..." : displayName}
                  </span>
                  <span className="text-[10px] md:text-xs text-[#800000] dark:text-rose-400 whitespace-nowrap font-medium mt-[-2px]">
                    User Account
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-[#800000] dark:text-rose-400 ml-0 md:ml-1 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 mt-1 rounded-xl p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg" 
              align="end"
            >
              <DropdownMenuLabel className="font-normal px-2 pt-1.5 pb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-50">{displayName}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => router.push("/profile")}
                  className="rounded-lg px-3 py-2 cursor-pointer transition-colors hover:!bg-[#C89B3C]/20 focus:!bg-[#C89B3C]/20 dark:hover:!bg-[#C89B3C]/40 dark:focus:!bg-[#C89B3C]/40 hover:!text-slate-900 dark:hover:!text-slate-100"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer transition-colors hover:!bg-[#C89B3C]/20 focus:!bg-[#C89B3C]/20 dark:hover:!bg-[#C89B3C]/40 dark:focus:!bg-[#C89B3C]/40 hover:!text-slate-900 dark:hover:!text-slate-100">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onSelect={handleLogout} 
                disabled={isLoggingOut}
                className="rounded-lg px-3 py-2 cursor-pointer transition-colors text-red-600 dark:text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/50 focus:text-red-600 dark:focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 