import React from "react";
import HeroSection from "../components/HeroSection"
import BeforeAfterSection from "../components/BeforeAfterSection"
import HowItWorksSection from "../components/HowItWorksSection"
import OutcomeFeaturesSection from "../components/OutcomeFeaturesSection"
import TrustSection from "../components/TrustSection"
import FinalCTASection from "../components/FinalCTASection"
import Footer from "../components/Footer"

function LandingPage() {
  return (
    <main>
      <HeroSection />
      <BeforeAfterSection />
      <HowItWorksSection />
      <OutcomeFeaturesSection />
      <TrustSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}

export default LandingPage;
