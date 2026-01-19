"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define icons for the form
const DollarIcon = () => (
  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.83 1.053M12 8c-1.11 0-2.08.402-2.83 1.053M12 8V6m0 12v-2m0-10a6 6 0 00-6 6v4a6 6 0 006 6m0-16a6 6 0 016 6v4a6 6 0 01-6 6m0-16V6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function CreatePropertyPage() {
  const router = useRouter();
  
  // State for each form field
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [expected_members, setExpectedMembers] = useState("");
  const [per_member_cost, setPerMemberCost] = useState("");
  
  // State for the dynamic image list
  const [images, setImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total target
  const targetAmount = (parseFloat(per_member_cost) || 0) * (parseInt(expected_members, 10) || 0);

  // --- Image List Functions ---
  const handleAddImage = () => {
    if (currentImage && !images.includes(currentImage)) {
      // Check for valid URL format (simple check)
      if (!currentImage.startsWith('http://') && !currentImage.startsWith('https://')) {
        setError("Please enter a valid URL (starting with http:// or https://)");
        return;
      }
      setImages([...images, currentImage]);
      setCurrentImage("");
      setError(""); // Clear error
    } else if (images.includes(currentImage)) {
      setError("This image URL has already been added.");
    }
  };

  const handleRemoveImage = (imgToRemove: string) => {
    setImages(images.filter(img => img !== imgToRemove));
  };
  // --------------------------

  // --- Form Submit Function ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (images.length === 0) {
      setError("Please add at least one image URL.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          location,
          expected_members,
          per_member_cost,
          images, // Pass the array of images
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        // Success, redirect to homepage
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  // --------------------------

  return (
    <div className="flex w-full items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Create New Project
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Share your investment opportunity with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl shadow-md" role="alert">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* --- Project Details --- */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Details</h3>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  id="title" type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Sky Apartment Complex" required
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="description" rows={4} value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the investment opportunity, benefits, and location..." required
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input
                    id="location" type="text" value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g., Mirpur-1, Dhaka" required
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* --- Funding Details --- */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Funding Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="per_member_cost" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Cost per Member ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <DollarIcon />
                    </span>
                    <input
                      id="per_member_cost" type="number" value={per_member_cost}
                      onChange={(e) => setPerMemberCost(e.target.value)}
                      placeholder="5000" min="1" required
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expected_members" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Expected Members *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <UsersIcon />
                    </span>
                    <input
                      id="expected_members" type="number" value={expected_members}
                      onChange={(e) => setExpectedMembers(e.target.value)}
                      placeholder="100" min="2" required
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
              
              {/* --- Calculated Total --- */}
              {targetAmount > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 p-5 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Total Target Amount
                    </p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(targetAmount)}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {expected_members} members × ${per_member_cost} per member
                  </p>
                </div>
              )}
            </div>

            {/* --- Image Uploader --- */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Images</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add at least one image URL</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={currentImage}
                  onChange={(e) => setCurrentImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-grow rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                >
                  Add Image
                </button>
              </div>

              {/* --- Image List --- */}
              {images.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Added Images ({images.length})</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    {images.map((img, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 group hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{img}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                          aria-label="Remove image"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --- Submit Button --- */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Project...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}