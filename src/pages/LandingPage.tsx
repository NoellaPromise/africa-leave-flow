import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheck, Calendar, Users } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-purple-dark">IST Africa </div>
          <Button
            asChild
            variant="outline"
            className="hover:bg-purple-light/10"
          >
            <Link to="/login">Staff Login</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center md:py-32">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
          Leave Management System
          <span className="text-purple-light"> for IST Africa</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Our comprehensive leave management system helps IST Africa optimize
          workforce planning, track employee time off, and maintain operational
          efficiency.
        </p>
      </section>

      {/* Features Section */}
      {/* <section className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 inline-block rounded-lg bg-purple-light/10 p-3 text-purple-light">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">Centralized Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Centralize and standardize leave tracking across the organization
            </p>
          </div>

          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 inline-block rounded-lg bg-purple-light/10 p-3 text-purple-light">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">Team Availability</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Easily view and manage team schedules and availability
            </p>
          </div>

          <div className="glass-card rounded-lg p-6">
            <div className="mb-4 inline-block rounded-lg bg-purple-light/10 p-3 text-purple-light">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">Compliance & Reporting</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ensure accurate leave tracking and generate comprehensive reports
            </p>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 md:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 IST Africa. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-purple-light dark:text-gray-400"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-purple-light dark:text-gray-400"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
