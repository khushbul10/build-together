"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define the shape of our NEW Property data
interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  images: string[]; // <-- Updated from imageURL
  target_amount: number; // <-- Updated from targetAmount
  created_by: {
    id: string;
    name: string;
  };
  created_at: string; // <-- Updated from createdAt
}

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PropertyList({ limit }: { limit?: number }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          setProperties(limit ? data.slice(0, limit) : data);
        } else {
          console.error("Failed to fetch properties");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
      setIsLoading(false);
    }

    fetchProperties();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Skeleton loaders */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="h-56 w-full animate-pulse bg-gray-200"></div>
            <div className="p-5">
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="mt-1 h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <p className="text-gray-600">No properties have been proposed yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((prop) => (
        <Link
          key={prop._id}
          href={`/property/${prop._id}`}
          className="group block"
        >
          <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 group-hover:shadow-xl">
            <img
              // Use the FIRST image from the images array
              src={prop.images && prop.images[0] ? prop.images[0] : 'https.placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found'} 
              alt={prop.title}
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found')}
              className="h-56 w-full object-cover"
            />
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
                {prop.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {prop.location}
              </p>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {prop.description}
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Total Target Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {/* Use the new target_amount field */}
                  {formatCurrency(prop.target_amount)} 
                </p>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                {/* Use the new created_by object */}
                By {prop.created_by.name}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}