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
          className="w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]"
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
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-green-700 dark:text-green-400">
                {isAdmin ? "Admin Access" : "Active Member"}
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300">
              {isAdmin ? "You manage this project" : "You've successfully joined this project"}
            </p>
          </div>
          <Link
            href={`/property/${property._id}/chat`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Go to Project Chat
          </Link>
        </div>
      );
    }

    return (
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className="w-full justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Joining...
          </span>
        ) : (
          `Join Project for ${formatCurrency(property.per_member_cost)}`
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* --- Main Content Grid --- */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* --- Left Column (Details) --- */}
        <div className="w-full lg:w-3/5 space-y-6">
          {/* Image Gallery */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-xl group">
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Image Overlay Badge */}
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Property
              </span>
            </div>
          </div>
          
          {/* Project Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">{property.title}</h1>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {property.created_by.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created by</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {property.created_by.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <LocationIcon />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{property.location}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <CalendarIcon />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(property.created_at)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this Property</h3>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          </div>
          
          {/* --- Member & Admin Lists --- */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Project Team</h3>
            
            {/* Admins Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Admins</h4>
              </div>
              <div className="grid gap-2">
                {property.admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{admin.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Members Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <UsersIcon />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Members ({property.members.length})</h4>
              </div>
              {property.members.length > 0 ? (
                <div className="grid gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {property.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{member.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(member.joined_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <UsersIcon />
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">No members have joined yet.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Be the first to join!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Right Column (Funding Box) --- */}
        <div className="w-full lg:w-2/5">
          {/* This makes the box "stick" to the top when scrolling on large screens */}
          <div className="sticky top-24 space-y-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-xl">
            
            {/* Funding Header with Gradient */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-90">Investment Opportunity</p>
                <p className="text-4xl font-bold mt-2">
                  {formatCurrency(property.per_member_cost)}
                </p>
                <p className="text-sm mt-1 opacity-90">per member contribution</p>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10"></div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Funding Progress</span>
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {fundingProgress.toFixed(0)}%
                </span>
              </div>
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <UsersIcon />
                  <span className="font-bold text-2xl text-gray-900 dark:text-white">{totalBackers}</span>
                  <span className="text-gray-600 dark:text-gray-400">backers</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  Goal: {property.expected_members}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Target Amount</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(property.target_amount)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Spots Left</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {property.expected_members - totalBackers}
                </p>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="pt-2">
              {error && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}
              {renderActionButton()}
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-gray-500 dark:text-gray-400">Secure payment processing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}