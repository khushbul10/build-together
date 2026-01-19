"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import type { Property } from "@/types/property";
import Link from "next/link";

// --- Helper Icons ---
const UsersIcon = () => ( <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> );
const LocationIcon = () => ( <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const CalendarIcon = () => ( <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> );

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: Date) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * The main Client Component for the property page
 */
export default function PropertyDetailsClient({ property }: { property: Property }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Calculate Project Stats ---
  const totalBackers = property.admins.length + property.members.length;
  const fundingProgress = (totalBackers / property.expected_members) * 100;

  // --- Handle Join Button Click ---
  const handleJoin = async () => {
    setIsLoading(true);
    setError("");

    const res = await fetch(`/api/properties/${property._id}/join`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Failed to join project. Please try again.");
    } else {
      // Success! Refresh the page to get the new data
      // This will re-run the Server Component fetch and update the UI
      router.refresh();
    }

    setIsLoading(false);
  };

  // --- Determine what button to show ---
  const renderActionButton = () => {
    if (sessionStatus === "loading") {
      return <div className="h-12 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>;
    }

    if (!session) {
      return (
        <button
          onClick={() => signIn()}
          className="w-full justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Sign In to Join
        </button>
      );
    }
    
    const userId = session.user.id;
    const isAdmin = property.admins.some(admin => admin.id === userId);
    const isMember = property.members.some(member => member.id === userId);

    if (isAdmin || isMember) {
      return (
        <div className="text-center">
          <p className="font-medium text-green-700 dark:text-green-400 mb-4">
            {isAdmin ? "You are an admin of this project." : "You have successfully joined this project!"}
          </p>
          <Link
            href={`/property/${property._id}/chat`}
            className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Go to Project Chat
          </Link>
        </div>
      );
    }

    return (
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className="w-full justify-center rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? "Joining..." : `Join Project for ${formatCurrency(property.per_member_cost)}`}
      </button>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* --- Main Content Grid --- */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- Left Column (Details) --- */}
        <div className="w-full lg:w-3/5">
          {/* Image Gallery (shows first image) */}
          <div className="w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-auto w-full object-cover"
            />
          </div>
          
          {/* Project Details */}
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.title}</h1>
            <p className="mt-1 text-lg font-medium text-gray-600 dark:text-gray-400">
              Created by {property.created_by.name}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center"><LocationIcon /> {property.location}</span>
              <span className="flex items-center"><CalendarIcon /> Created: {formatDate(property.created_at)}</span>
            </div>

            <div className="mt-6 text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {property.description}
            </div>
          </div>
          
          {/* --- Member & Admin Lists --- */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Team</h3>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Admins</h4>
              <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                {property.admins.map(admin => (
                  <li key={admin.id}>{admin.name}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Members ({property.members.length})</h4>
              {property.members.length > 0 ? (
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                  {property.members.map(member => (
                    <li key={member.id}>{member.name} (Joined: {formatDate(member.joined_at)})</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">No members have joined yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* --- Right Column (Funding Box) --- */}
        <div className="w-full lg:w-2/5">
          {/* This makes the box "stick" to the top when scrolling on large screens */}
          <div className="sticky top-24 space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md">
            
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Funding Progress</span>
                <span className="font-bold">{fundingProgress.toFixed(0)}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${fundingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <UsersIcon />
              <span className="text-2xl font-bold">{totalBackers}</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">backers of {property.expected_members} expected</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Member</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(property.per_member_cost)}
              </p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                Total Target: {formatCurrency(property.target_amount)}
              </p>
            </div>
            
            {/* Action Button */}
            <div className="pt-4">
              {error && (
                <p className="text-sm text-red-600 mb-2 text-center">{error}</p>
              )}
              {renderActionButton()}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Your contribution will be processed securely.</p>
          </div>
        </div>
      </div>
    </div>
  );
}