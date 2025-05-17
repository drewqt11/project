import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckSquare, Palette, ShieldCheck, Settings, Users, Briefcase, BookOpen, Lightbulb, LayoutGrid, LockKeyhole, ListChecks } from "lucide-react"; // Added more icons

export default function LandingPage() {
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
                variant="ghost"
                className="text-[#4A0404] hover:bg-[#F4EDED] hover:text-[#4A0404] px-3 md:px-4 py-2 text-sm md:text-base"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" passHref>
              <Button className="bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] px-3 md:px-5 py-2 text-sm md:text-base shadow-md hover:shadow-lg transition-all">
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
                <h1 className="text-4xl font-bold tracking-tight text-[#832225] sm:text-5xl md:text-6xl">
                  Welcome to <span className="text-[#C89B3C]">FolioFlow</span>
                </h1>
                <p className="mt-4 max-w-xl text-lg text-[#4A0404]/90 md:mt-6 md:text-xl">
                  Simplify the process of creating professional PDF portfolios with our step-by-step guided application.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link href="/auth/signup" passHref>
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#4a0001] to-[#c89b3c] text-white hover:from-[#6a0001] hover:to-[#d8ab4c] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group px-8 py-3 text-base">
                      Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#about" passHref>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 hover:border-[#b88a2c] shadow-sm hover:shadow-md transition-all duration-300 px-8 py-3 text-base">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md p-3 sm:p-4 bg-gradient-to-br from-[#e8d9d8] to-white rounded-xl shadow-xl flex items-center justify-center overflow-hidden">
                   <Image 
                    src="/assets/imagelanding.png" 
                    alt="FolioFlow application interface example"
                    width={400}
                    height={225}
                    className="rounded-lg object-contain"
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
              <h2 className="text-3xl font-bold tracking-tight text-[#832225] sm:text-4xl md:text-5xl">
                About <span className="text-[#C89B3C]">FolioFlow</span>
              </h2>
              <p className="mt-4 text-lg text-[#4A0404]/90 md:text-xl">
                FolioFlow empowers users to create high-quality, visually appealing PDF portfolios with ease.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
              {[
                {
                  icon: <ListChecks className="h-10 w-10 text-[#C89B3C] mb-4" />,
                  title: "Guided Creation",
                  description: "Step-by-step process to input personal information, employment history, education, skills, and projects.",
                },
                {
                  icon: <Palette className="h-10 w-10 text-[#C89B3C] mb-4" />,
                  title: "Customizable Templates",
                  description: "Choose from professionally designed templates to showcase your unique skills and experience.",
                },
                {
                  icon: <ShieldCheck className="h-10 w-10 text-[#C89B3C] mb-4" />,
                  title: "Secure Management",
                  description: "Safely store and manage your portfolio data with our secure account system.",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-[#e8d9d8] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-[#4A0404] mb-2">{feature.title}</h3>
                  <p className="text-[#4A0404]/80 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="cta" className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#832225] sm:text-4xl md:text-5xl">
              Ready to Create Your Portfolio?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-[#4A0404]/90 md:text-xl">
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
          <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-[#4A0404]/80 mb-2 md:mb-0">
              &copy; {new Date().getFullYear()} FolioFlow. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-sm text-[#4A0404]/80 hover:text-[#C89B3C] transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-[#4A0404]/80 hover:text-[#C89B3C] transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
