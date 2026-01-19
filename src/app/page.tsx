import Banner from "./components/Home/Banner";
import PropertyList from "./components/properties/PropertyList";
import HowItWorks from "./components/Home/HowItWorks";
import Features from "./components/Home/Features";
import Stats from "./components/Home/Stats";
import CTA from "./components/Home/CTA";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Banner />
      </div>
      
      <HowItWorks />
      
      <Features />
      
      <Stats />
      
      <div id="properties" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our current investment opportunities and find the perfect property to co-own
          </p>
        </div>
        <PropertyList limit={6} />
      </div>
      
      <CTA />
    </div>
  );
}
