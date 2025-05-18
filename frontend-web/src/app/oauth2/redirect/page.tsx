"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// You might want to add a loading spinner component
// import { Spinner } from "@/components/ui/spinner"; 

export default function OAuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth Error:", error);
      // You could display the error to the user or redirect to login with an error message
      router.push(`/signin?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token && refreshToken && id && email) {
      // Store tokens and user info
      // IMPORTANT: Consider using secure HTTP-only cookies for tokens in a real app
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem(
        "user",
        JSON.stringify({ id, email, firstName, lastName })
      );

      // Redirect to the main application (e.g., dashboard)
      // Replace '/dashboard' with your desired authenticated route
      router.push("/dashboard"); 
    } else if (!error) {
      // If there's no error but also not all tokens, it's an unexpected state
      console.warn("OAuth redirect missing required parameters.");
      router.push("/signin?error=Incomplete OAuth data");
    }
    // If no params are present yet, do nothing and wait for them (or a timeout)
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      {/* Optional: Add a loading state indicator */}
      {/* <Spinner size="large" /> */}
      <p className="text-lg font-medium text-slate-700">
        Processing your authentication...
      </p>
      <p className="text-sm text-slate-500">
        Please wait while we securely log you in.
      </p>
    </div>
  );
} 