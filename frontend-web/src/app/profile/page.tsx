"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Lock, Save, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Define UserProfile interface based on expected data
interface UserProfile {
  userId: string
  firstName: string
  lastName: string
  email: string
  isOAuth2User: boolean
  // Add any other fields that your API might return, e.g., avatarUrl
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isPasswordAlertOpen, setIsPasswordAlertOpen] = useState(false)

  useEffect(() => {
    async function fetchUserProfile() {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          toast.error("Authentication token not found. Please sign in.")
          router.push("/auth/signin")
          return
        }

        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message || `Failed to fetch profile: ${response.status}`,
          )
        }

        const data: UserProfile = await response.json()
        setUser(data)
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError(err.message || "An unexpected error occurred while fetching your profile.")
        toast.error(err.message || "Could not load profile.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication token not found. Please sign in.")
        router.push("/auth/signin")
        return
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update profile.")
      }

      const updatedUser: UserProfile = await response.json()
      setUser(updatedUser)
      // Update localStorage with the new user details
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Dispatch a custom event to notify other components (like the header)
        window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedUser }));
      }
      setFormData({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      })
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      console.error("Error saving profile:", err)
      setError(err.message || "An unexpected error occurred while saving your profile.")
      toast.error(err.message || "Could not save profile.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    }
    setIsEditing(false)
    setError(null)
  }

  // Handler for password input changes
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordError(null); // Clear previous errors on new input
    if (name === "current-password") setCurrentPassword(value);
    else if (name === "new-password") setNewPassword(value);
    else if (name === "confirm-password") setConfirmPassword(value);
  };

  // Handles the click on "Update Password" button, shows confirmation dialog
  const handleUpdatePasswordClick = () => {
    console.log("handleUpdatePasswordClick triggered");
    console.log("Passwords:", { currentPassword, newPassword, confirmPassword });
    setPasswordError(null); // Clear previous errors

    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log("Validation failed: All fields required.");
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      console.log("Validation failed: Passwords do not match.");
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 8) {
      console.log("Validation failed: Password too short.");
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    console.log("All validations passed. Opening alert dialog.");
    setIsPasswordAlertOpen(true);
  };

  const handleConfirmPasswordChange = async () => {
    setIsPasswordAlertOpen(false);
    setIsUpdatingPassword(true);
    setPasswordError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found. Please sign in.");
        router.push("/auth/signin");
        setIsUpdatingPassword(false);
        return;
      }

      const payload = {
        currentPassword,
        newPassword,
      };

      const response = await fetch("/api/auth/profile/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update password.");
      }

      // Password updated successfully
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error updating password:", err);
      setPasswordError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "Could not update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-1/3 mb-1" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <TabsTrigger value="profile" className="gap-2 px-3 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md data-[state=active]:text-[#C89B3C]">
                  <User className="h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2 px-3 py-1.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-md data-[state=active]:text-[#C89B3C]">
                  <Lock className="h-4 w-4" /> Security
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <Card className="border-slate-200 dark:border-slate-700 shadow-lg rounded-xl bg-white dark:bg-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-2">
                    <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div>
                        <Skeleton className="h-7 w-40 mb-1" />
                        <Skeleton className="h-5 w-52 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Separator className="bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-4 px-1">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2"><Skeleton className="h-5 w-20 mb-1" /><Skeleton className="h-10 w-full" /></div>
                         <div className="space-y-2"><Skeleton className="h-5 w-20 mb-1" /><Skeleton className="h-10 w-full" /></div>
                       </div>
                       <div className="space-y-2"><Skeleton className="h-5 w-20 mb-1" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Could not load profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Button onClick={() => router.refresh()} className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] text-white">
            Try Again
          </Button>
        </main>
      </div>
    )
  }
  
  if (!user) {
     return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12 flex flex-col items-center justify-center text-center">
          <p className="text-slate-600 dark:text-slate-400">User data not available. Please try refreshing.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container max-w-4xl mx-auto py-8 md:py-12"> 
        <div className="flex flex-col space-y-8">
          {/* Page header */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => router.back()}> 
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Profile Settings</h1> 
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p> 
          </div>

          {/* Display fetch error if any, but user data might still be displayed from previous state */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative flex items-start gap-3" role="alert">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Error:</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
               <Button variant="ghost" size="sm" className="absolute top-1 right-1 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50 p-1 h-auto" onClick={() => setError(null)}>✕</Button>
            </div>
          )}

          {/* Profile tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full"> 
              <TabsTrigger value="profile" className="gap-2 px-3 py-1.5 text-sm rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"> 
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 px-3 py-1.5 text-sm rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:shadow-sm data-[state=active]:text-[#6e0e0e]"> 
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800"> 
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-900 dark:text-slate-50">Personal Information</CardTitle> 
                      <CardDescription className="text-slate-500 dark:text-slate-400">Update your personal details</CardDescription> 
                    </div>
                    {!isEditing && !user.isOAuth2User && (
                      <Button variant="outline" onClick={() => { setIsEditing(true); setError(null); }} className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#800000] to-[#C89B3C] text-white text-3xl font-medium shadow-md">
                      {(user.firstName?.charAt(0) || "") + (user.lastName?.charAt(0) || "")}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">User ID: {user.userId}</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-200 dark:bg-slate-700"/>

                  {isEditing ? (
                    <div className="space-y-4 px-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300">First Name</Label>
                          <Input id="firstName" name="firstName" value={formData.firstName || ""} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]" disabled={isSaving}/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300">Last Name</Label>
                          <Input id="lastName" name="lastName" value={formData.lastName || ""} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]" disabled={isSaving}/>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]" disabled={true}/>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm px-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <h4 className="font-medium text-slate-500 dark:text-slate-400">First Name</h4>
                          <p className="text-slate-800 dark:text-slate-200">{user.firstName}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-500 dark:text-slate-400">Last Name</h4>
                          <p className="text-slate-800 dark:text-slate-200">{user.lastName}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-slate-500 dark:text-slate-400">Email</h4>
                          <p className="text-slate-800 dark:text-slate-200">{user.email}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="font-medium text-slate-500 dark:text-slate-400">Account Type</h4>
                          <p className="text-slate-800 dark:text-slate-200">{user.isOAuth2User ? "Social Login (OAuth2)" : "Email & Password"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                {isEditing && (
                  <CardFooter className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                    <Button variant="outline" onClick={handleCancel} className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700" disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all min-w-[130px]"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="border-none shadow-xl rounded-xl bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-50">Password</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {user.isOAuth2User ? (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4 border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        You are signed in with a social account (OAuth2). Password management is handled by your identity provider.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password"className="text-slate-700 dark:text-slate-300">Current Password</Label>
                        <Input id="current-password" name="current-password" type="password" value={currentPassword} onChange={handlePasswordInputChange} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]" disabled={isUpdatingPassword}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-slate-700 dark:text-slate-300">New Password</Label>
                        <Input id="new-password" name="new-password" type="password" value={newPassword} onChange={handlePasswordInputChange} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]" disabled={isUpdatingPassword}/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-slate-700 dark:text-slate-300">Confirm New Password</Label>
                        <Input id="confirm-password" name="confirm-password" type="password" value={confirmPassword} onChange={handlePasswordInputChange} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-[#C89B3C]" disabled={isUpdatingPassword}/>
                      </div>
                      {passwordError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-md border border-red-200 dark:border-red-700/50">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}
                      <Button 
                        className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                        onClick={handleUpdatePasswordClick} 
                        disabled={isUpdatingPassword}
                      >
                        {isUpdatingPassword ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        Update Password
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {/* Footer consistent with dashboard */}
      <footer className="py-8 bg-gray-50 dark:bg-gray-900 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
        <div className="container mx-auto px-4 md:px-6 flex justify-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Password Change Confirmation Dialog */}
      <AlertDialog open={isPasswordAlertOpen} onOpenChange={setIsPasswordAlertOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-50">Confirm Password Change</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 pt-2">
              Are you sure you want to change your password? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel 
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 data-[disabled]:opacity-70"
              disabled={isUpdatingPassword}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-gradient-to-r from-[#6e0e0e] to-[#c89b3c] hover:from-[#800000] hover:to-[#d8ab4c] text-white data-[disabled]:opacity-70"
              onClick={handleConfirmPasswordChange} 
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 