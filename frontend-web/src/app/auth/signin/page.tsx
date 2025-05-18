"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// A simple Google Icon component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="20px"
      height="20px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
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
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

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
    setError(null);
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
        localStorage.setItem("token", result.token);
        localStorage.setItem("refreshToken", result.refreshToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: result.id,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
          })
        );
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/google-login-url");
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: "Failed to get Google login URL."}))
        throw new Error(errorResult.message || "Could not initiate Google Sign-In.");
      }
      const googleLoginUrl = await response.text();
      window.location.href = googleLoginUrl;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email below to sign in to your account
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600 bg-red-100 p-3 rounded-md text-center">
          {error}
        </p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-800">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...form.register("email")}
            className="border-slate-300 focus:border-[#C89B3C] focus:ring-[#C89B3C] rounded-md"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-slate-800">Password</Label>
            <Link href="#" className="text-sm font-medium text-[#C89B3C] hover:text-[#b88a2c] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...form.register("password")}
              className="border-slate-300 focus:border-[#C89B3C] focus:ring-[#C89B3C] rounded-md pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3 text-slate-500 hover:text-slate-500 hover:bg-transparent transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="rememberMe" {...form.register("rememberMe")} disabled={isLoading} />
          <Label htmlFor="rememberMe" className="text-sm font-normal text-slate-600 cursor-pointer">
            Remember me
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 rounded-lg py-2.5 text-sm font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign in"}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">or</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg py-2.5 text-sm font-medium"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <GoogleIcon />
        {isLoading ? "Redirecting..." : "Sign in with Google"}
      </Button>

      <div className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-[#C89B3C] hover:text-[#b88a2c] hover:underline">
          Sign up
        </Link>
      </div>
    </>
  );
} 