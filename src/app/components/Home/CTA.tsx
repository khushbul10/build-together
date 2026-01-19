"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CTA() {
  const { data: session } = useSession();

  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-16 sm:px-12 sm:py-20 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join our community of investors and discover exclusive property investment opportunities. 
              Start building your real estate portfolio today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <>
                  <Link
                    href="#properties"
                    className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl"
                  >
                    Browse Properties
                  </Link>
                  <Link
                    href="/create"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
                  >
                    Create a Project
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-xl"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/signin"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <p className="mt-6 text-sm text-blue-100">
              No credit card required • Join in less than 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
