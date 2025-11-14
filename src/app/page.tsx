import Image from "next/image";
import Banner from "./components/Home/Banner";
import PropertyList from "./components/properties/PropertyList";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <Banner />
      <PropertyList />
    </div>
  );
}
