import PublicNavbar from "../components/PublicNavbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";

import "../styles/Home.css";

function Home() {
  return (
    <>
      <PublicNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </>
  );
}

export default Home;