
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-purple-dark">Africa HR</div>
          <Button asChild variant="outline" className="hover:bg-purple-light/10">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center md:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
          Simplify Your Leave Management
          <span className="text-purple-light"> Process</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Streamline your organization's leave management with our intuitive platform. 
          Track, approve, and manage time off requests effortlessly.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-purple-light hover:bg-purple-dark">
            <Link to="/login" className="gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 inline-block rounded-lg bg-purple-light/10 p-3 text-purple-light">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">Easy Leave Requests</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Submit and track leave requests with just a few clicks
            </p>
          </div>

          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 inline-block rounded-lg bg-purple-light/10 p-3 text-purple-light">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">Team Calendar</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View your team's availability at a glance
            </p>
          </div>

          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 inline-block rounded-lg bg-purple-light/10 p-3 text-purple-light">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">Quick Approvals</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Streamlined approval process for managers
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 md:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Africa HR. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-600 hover:text-purple-light dark:text-gray-400">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-light dark:text-gray-400">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
