"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Checkbox is not used in signup, can be removed if not needed elsewhere, but kept for now.
// import { Checkbox } from "@/components/ui/checkbox"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Re-using the Google Icon from sign-in or a shared components directory
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("token");
      if (token) {
        router.push("/dashboard");
      } else {
        setIsLoadingAuth(false);
      }
    } else {
      setIsLoadingAuth(false);
    }
  }, [router]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    try {
      const { confirmPassword, ...dataToSubmit } = values;
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Sign up failed. Please try again.");
      }
      
      toast.success(result.message || "Sign up successful! Please sign in.", {
        description: "You can now sign in with your new account.",
      });
      form.reset();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during sign up.");
    }
    setIsLoading(false);
  }

  async function handleGoogleSignUp() {
    setIsLoading(true);
    try {
      // Directly redirect to the backend's OAuth2 authorization URL for Google
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    } catch (err: any) {
      toast.error(err.message || "Could not initiate Google Sign-Up.");
      setIsLoading(false); // Ensure loading is stopped on error
    }
     // setIsLoading(false); // This will not be reached if redirect is successful
  }

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 md:py-16">
      <div className="grid w-full max-w-[1200px] grid-cols-1 overflow-hidden rounded-2xl shadow-lg lg:grid-cols-5">
          {/* Left Panel: Decorative - Same as SignIn */}
          <div className="relative hidden bg-gradient-to-br from-[#4a0001] to-[#c89b3c] lg:col-span-2 lg:flex lg:flex-col lg:items-start lg:justify-between lg:p-12">
            <div className="absolute inset-0 z-0 opacity-20">
              <Image
                src="/image4.png"
                alt="Background"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-3">
                <div className="overflow-hidden rounded-lg bg-white/25 p-1 backdrop-blur-sm">
                  <Image
                    src="/assets/folioflow_logo.png"
                    alt="FolioFlow Logo"
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-2xl font-bold text-white">FolioFlow</span>
              </Link>
            </div>
            <div className="relative z-10 mt-auto space-y-6">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                <blockquote className="space-y-3">
                  <p className="text-lg font-medium text-white">
                    "FolioFlow has revolutionized how I present my professional experience. Creating a portfolio has
                    never been this easy!"
                  </p>
                  <footer className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">FolioFlow Community</p>
                      <p className="text-xs text-white/80">Programmers</p>
                    </div>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <Card className="border-0 shadow-none lg:col-span-3 bg-white dark:bg-gray-950">
            <CardHeader className="space-y-1 px-6 pt-8 md:px-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-black dark:text-slate-100">Create your account</CardTitle>
                <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-[#4A0404] dark:hover:text-slate-300">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Home
                </Link>
              </div>
              <CardDescription className="text-muted-foreground dark:text-slate-400">Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-10">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-black dark:text-slate-300">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...form.register("firstName")}
                      disabled={isLoading}
                      className="h-11 border-slate-300 focus-visible:ring-[#C89B3C] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-slate-900"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-xs text-red-600 pt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-black dark:text-slate-300">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...form.register("lastName")}
                      disabled={isLoading}
                      className="h-11 border-slate-300 focus-visible:ring-[#C89B3C] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-slate-900"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-xs text-red-600 pt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black dark:text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...form.register("email")}
                    disabled={isLoading}
                    className="h-11 border-slate-300 focus-visible:ring-[#C89B3C] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-slate-900"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-600 pt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black dark:text-slate-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...form.register("password")}
                      disabled={isLoading}
                      className="h-11 pr-10 border-slate-300 focus-visible:ring-[#C89B3C] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-600 pt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black dark:text-slate-300">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...form.register("confirmPassword")}
                      disabled={isLoading}
                      className="h-11 pr-10 border-slate-300 focus-visible:ring-[#C89B3C] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-600 pt-1">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] border-0 shadow-md hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-[1.02] rounded-md py-2.5 text-sm font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center">
                <Separator className="flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="mx-4 text-xs text-muted-foreground dark:text-slate-500">OR</span>
                <Separator className="flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              <Button
                variant="outline"
                className="h-11 w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-100 shadow-sm"
                disabled={isLoading}
                onClick={handleGoogleSignUp}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center px-6 pb-8 pt-4 md:px-10">
              <p className="text-center text-sm text-muted-foreground dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-[#C89B3C] hover:text-[#b88a2c] dark:text-rose-500 dark:hover:text-rose-400 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
    </div>
  );
} 