"use client"; // This component doesn't need to be a client component, 
           // but making it one doesn't hurt and allows for future 
           // interactivity (like a carousel) if you want.

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Banner() {
  const { data: session } = useSession();

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] max-h-[550px] overflow-hidden rounded-xl shadow-xl mb-12">
      {/* Background Image */}
      {/* You can replace this with any high-quality image */}
      <img
        src="https://squarefeetstory.com/wp-content/uploads/2022/02/Nikunjo-03-1536x864.jpg.webp"
        alt="Modern house and architecture"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4 sm:p-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Invest in Property, Together.
        </h1>
        <p className="mt-4 text-lg lg:text-xl max-w-3xl">
          Welcome to PropertyShare, the platform where you can co-own buildings 
          and fund new projects as a community.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="#properties" // We'll add an ID to the PropertyList
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 transition-colors"
          >
            Browse Opportunities
          </Link>
          
          {/* Only show "Create Proposal" if the user is logged in */}
          {session && (
            <Link 
              href="/create"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md shadow-md hover:bg-white hover:text-gray-900 transition-colors"
            >
              Start a Proposal
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}