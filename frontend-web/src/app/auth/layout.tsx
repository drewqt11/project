import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left Column - Background image and overlay content */}
      <div className="relative hidden h-full lg:flex flex-col items-center justify-between p-8 text-white">
        <Image
          src="/image4.png" 
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0" 
        />
        
        {/* Top spacer for justify-between */}
        <div className="relative z-10"></div>

        {/* Overlay Content - Logo and Title (centered) */}
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/assets/folioflow_logo.png"
            alt="FolioFlow Logo"
            width={256} 
            height={256} 
            className="mb-4" 
          />
          <span className="text-7xl font-bold text-black">
            FolioFlow
          </span>
        </div>

        {/* Testimonial Content (bottom) */}
        <div className="relative z-10 flex w-full flex-col items-start px-4 md:px-8 lg:px-12">
          <p className="mt-4 max-w-md text-left text-lg text-black">
            "With FolioFlow, I created a stunning portfolio that helped me land my dream job. The process was intuitive and the results were professional."
          </p>
          <p className="mt-2 text-sm font-semibold text-black">
            - Alex Johnson
          </p>
        </div>
      </div>

      {/* Right Column - Form Content */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
         <div className="lg:hidden flex justify-start w-full mb-8">
            <Link href="/" className="flex items-center text-slate-700 hover:text-slate-900">
              <Image
                src="/folioflow_logo_red_brown.png" // A dark version of your logo for light backgrounds
                alt="FolioFlow Logo"
                width={24}
                height={24}
                className="mr-2"
              />
              <span className="text-xl font-semibold text-[#4A0404]">FolioFlow</span>
            </Link>
          </div>
          {children}
          <div className="pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-[#C89B3C] hover:underline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 