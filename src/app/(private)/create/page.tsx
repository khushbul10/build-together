"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define icons for the form
const DollarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.83 1.053M12 8c-1.11 0-2.08.402-2.83 1.053M12 8V6m0 12v-2m0-10a6 6 0 00-6 6v4a6 6 0 006 6m0-16a6 6 0 016 6v4a6 6 0 01-6 6m0-16V6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="flex w-full items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Create a New Project
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* --- Project Details --- */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  id="title" type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Sky Apartment Complex" required
                  className="w-full rounded-md border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description" rows={4} value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the investment opportunity, benefits, and location..." required
                  className="w-full rounded-md border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="location" type="text" value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g., Mirpur-1, Dhaka" required
                  className="w-full rounded-md border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* --- Funding Details --- */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="per_member_cost" className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Member ($)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarIcon />
                    </span>
                    <input
                      id="per_member_cost" type="number" value={per_member_cost}
                      onChange={(e) => setPerMemberCost(e.target.value)}
                      placeholder="5000" min="1" required
                      className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expected_members" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Members
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <UsersIcon />
                    </span>
                    <input
                      id="expected_members" type="number" value={expected_members}
                      onChange={(e) => setExpectedMembers(e.target.value)}
                      placeholder="100" min="2" required
                      className="w-full rounded-md border-gray-300 pl-10 pr-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* --- Calculated Total --- */}
              {targetAmount > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                  <p className="text-sm font-medium text-blue-800">
                    Total Target Amount: 
                    <span className="font-bold text-lg ml-2">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(targetAmount)}
                    </span>
                  </p>
                  <p className="text-xs text-blue-700">
                    ({expected_members} members × ${per_member_cost}/member)
                  </p>
                </div>
              )}
            </div>

            {/* --- Image Uploader --- */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Project Images (Add at least one)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={currentImage}
                  onChange={(e) => setCurrentImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-grow rounded-md border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-md bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300"
                >
                  Add
                </button>
              </div>

              {/* --- Image List --- */}
              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((img, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-700 truncate w-4/5">{img}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full"
                        aria-label="Remove image"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- Submit Button --- */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Submitting Project..." : "Submit Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}