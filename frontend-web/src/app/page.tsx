"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, Palette, ShieldCheck, ListChecks } from "lucide-react";
import Image from "next/image";

const featureDetails = [
  {
    id: "guided-creation",
    Icon: ListChecks,
    iconProps: { className: "h-7 w-7 text-[#832225]" },
    title: "Guided Creation",
    description: "Step-by-step process to input personal information, employment history, education, skills, and projects.",
  },
  {
    id: "customizable-templates",
    Icon: Palette,
    iconProps: { className: "h-7 w-7 text-[#C89B3C]" },
    title: "Customizable Templates",
    description: "Choose from professionally designed templates to showcase your unique skills and experience.",
  },
  {
    id: "secure-management",
    Icon: ShieldCheck,
    iconProps: { className: "h-7 w-7 text-[#832225]" },
    title: "Secure Management",
    description: "Safely store and manage your portfolio data with our secure account system.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/dashboard");
      } else {
        setIsLoadingAuth(false);
      }
    } else {
      setIsLoadingAuth(false);
    }
  }, [router]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#4A0404] font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-transparent backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/folioflow_logo.png"
              alt="FolioFlow Icon"
              width={50}
              height={50}
              priority
            />
            <span className="font-semibold text-2xl text-black">FolioFlow</span>
          </Link>
          <nav className="flex items-center gap-3 md:gap-4">
            <Link href="/auth/signin" passHref>
              <Button
                variant="outline"
                className="border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 hover:border-[#b88a2c] hover:text-[#C89B3C]
                           px-4 md:px-5 py-2 text-sm md:text-base rounded-lg 
                           shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" passHref>
              <Button className="bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] rounded-lg px-4 md:px-5 py-2 text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl md:text-6xl">
                  Welcome to <span className="text-black">FolioFlow</span>
                </h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground md:mt-6 md:text-xl">
                  Simplify the process of creating professional PDF portfolios with our step-by-step guided application.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link href="/auth/signup" passHref>
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group px-8 py-3 text-base">
                      Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#about" passHref>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="sm:w-auto border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-500 shadow-sm hover:shadow-md transition-all duration-300 px-3.5 py-3 text-base rounded-lg"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-2xl rounded-lg overflow-hidden">
          <Image
                    src="/image2.png"
                    alt="FolioFlow Showcase"
                    width={640}
                    height={360}
                    className="rounded-lg object-cover"
                    priority 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24 lg:py-32 bg-[#fafafa]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
                About <span className="text-black">FolioFlow</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                FolioFlow empowers users to create high-quality, visually appealing PDF portfolios with ease.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
              {featureDetails.map((feature) => (
                <Card 
                  key={feature.id}
                  className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-200 group text-center flex flex-col p-6 border-none overflow-hidden"
                >
                  <CardHeader className="flex flex-col items-center p-0 mb-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-rose-50 to-red-100 mb-4">
                      <feature.Icon {...feature.iconProps} />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-800 mb-1">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow flex flex-col justify-center">
                    <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="cta" className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
              Ready to Create Your Portfolio?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground md:text-xl">
              Join FolioFlow today and create a professional PDF portfolio in minutes.
            </p>
            <div className="mt-8">
              <Link href="/auth/signup" passHref>
                <Button size="lg" className="bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group px-10 py-3 text-base mx-auto">
                  Get Started Now <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 md:px-6 flex justify-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
            </p>
          </div>
      </footer>
      </main>
    </div>
  );
}
