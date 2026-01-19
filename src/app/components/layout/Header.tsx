"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              PropertyShare
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {isLoading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            ) : (
              <>
                {session?.user ? (
                  <>
                    <Link
                      href="/my-projects"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      My Projects
                    </Link>
                    <Link
                      href="/create"
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                    >
                      + Create Property
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
