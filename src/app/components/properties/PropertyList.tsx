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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Skeleton loaders */}
        {[...Array(limit || 6)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="h-56 w-full animate-pulse bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="h-6 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Properties Available</h3>
        <p className="text-gray-600 dark:text-gray-400">No properties have been proposed yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((prop) => (
        <Link
          key={prop._id}
          href={`/property/${prop._id}`}
          className="group block"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-blue-500 dark:hover:border-blue-500">
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={prop.images && prop.images[0] ? prop.images[0] : 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found'} 
                alt={prop.title}
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found')}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Location Badge */}
              <div className="absolute top-4 left-4 flex items-center space-x-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{prop.location}</span>
              </div>

              {/* View Details Badge (appears on hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  View Details →
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                {prop.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                {prop.description}
              </p>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-4"></div>

              {/* Price & Creator Info */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Target Amount</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(prop.target_amount)}
                  </p>
                </div>
                
                {/* Creator Avatar */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {prop.created_by.name[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-500 dark:text-gray-500">Created by</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[100px]">
                      {prop.created_by.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-bl-full"></div>
          </div>
        </Link>
      ))}
    </div>
  );
}