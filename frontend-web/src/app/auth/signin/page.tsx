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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// A simple Google Icon component
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

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
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

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: SignInFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Sign in failed. Please try again.");
      }

      if (result.token && result.refreshToken && result.id && result.email) {
        Cookies.set("token", result.token, { expires: 1 });
        Cookies.set("refreshToken", result.refreshToken, { expires: 7 });
        Cookies.set(
          "user",
          JSON.stringify({
            id: result.id,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            isOAuth2User: result.isOAuth2User
          }),
          { expires: 7 }
        );
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during sign in.");
    }
    setIsLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      // Directly redirect to the backend's OAuth2 authorization URL for Google
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    } catch (err: any) {
      toast.error(err.message || "Could not initiate Google Sign-In.");
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
        {/* Left side - Background and testimonial */}
        <div className="relative hidden bg-gradient-to-br from-[#4a0001] to-[#c89b3c] lg:col-span-2 lg:flex lg:flex-col lg:items-start lg:justify-between lg:p-12">
          <div className="absolute inset-0 z-0 opacity-20">
            <Image
              src="/image4.png"
              alt="Background"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
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
              <CardTitle className="text-2xl font-bold text-black dark:text-slate-100">Sign in to your account</CardTitle>
              <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-[#4A0404] dark:hover:text-slate-300">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Home
              </Link>
            </div>
            <CardDescription className="text-muted-foreground dark:text-slate-400">Enter your email below to sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="px-6 md:px-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...form.register("email")}
                  disabled={isLoading}
                  className="h-11 border-slate-300 focus-visible:ring-[#C89B3C] dark:border-slate-700 dark:bg-slate-800 dark:text-white text-slate-900"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-600 pt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-black dark:text-slate-300">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#C89B3C] hover:text-[#b88a2c] dark:text-amber-500 dark:hover:text-amber-400 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  {...form.register("rememberMe")}
                  disabled={isLoading}
                  className="border-slate-400 data-[state=checked]:bg-[#832225] data-[state=checked]:border-[#832225] data-[state=checked]:text-white dark:border-slate-600 dark:data-[state=checked]:bg-[#832225] dark:data-[state=checked]:border-[#832225]"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black dark:text-slate-300"
                >
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] border-0 shadow-md hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-[1.02] rounded-md py-2.5 text-sm font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
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
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center px-6 pb-8 pt-4 md:px-10">
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-[#C89B3C] hover:text-[#b88a2c] dark:text-rose-500 dark:hover:text-rose-400 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 