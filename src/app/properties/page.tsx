"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  target_amount: number;
  per_member_cost: number;
  created_by: {
    id: string;
    name: string;
  };
  created_at: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter states
  const [searchLocation, setSearchLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
          setFilteredProperties(data);
        } else {
          console.error("Failed to fetch properties");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
      setIsLoading(false);
    }

    fetchProperties();
  }, []);

  // Filter properties when search criteria change
  useEffect(() => {
    let filtered = [...properties];

    // Filter by location
    if (searchLocation.trim()) {
      filtered = filtered.filter((prop) =>
        prop.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter((prop) => prop.per_member_cost >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter((prop) => prop.per_member_cost <= max);
    }

    setFilteredProperties(filtered);
  }, [searchLocation, minPrice, maxPrice, properties]);

  const handleReset = () => {
    setSearchLocation("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse All Properties
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover investment opportunities and find the perfect property to co-own
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Search */}
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Search by location..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            {/* Min Price */}
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Price per Member
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="minPrice"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full px-4 py-2 pl-7 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Max Price */}
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Price per Member
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full px-4 py-2 pl-7 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                <div className="h-56 w-full animate-pulse bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-1 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-6 h-8 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or reset filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((prop) => (
              <Link
                key={prop._id}
                href={`/property/${prop._id}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
                  <img
                    src={prop.images && prop.images[0] ? prop.images[0] : 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found'}
                    alt={prop.title}
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found')}
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {prop.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {prop.location}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {prop.description}
                    </p>
                    <div className="mt-4 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Per Member</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(prop.per_member_cost)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Target</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatCurrency(prop.target_amount)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                      By {prop.created_by.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
