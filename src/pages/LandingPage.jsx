import React from "react";
import HeroSection from "../components/HeroSection"
import BeforeAfterSection from "../components/BeforeAfterSection"
import HowItWorksSection from "../components/HowItWorksSection"
import OutcomeFeaturesSection from "../components/OutcomeFeaturesSection"
import TrustSection from "../components/TrustSection"
import FinalCTASection from "../components/FinalCTASection"
import Footer from "../components/Footer"
import SEO from "../components/SEO"

function LandingPage() {
  return (
    <main>
      <SEO
        title="Home"
        description="The ultimate cloud-based PG management solution. Streamline your hostel or PG business with ManageMyPg - manage rents, tenants, and properties with ease."
        canonical="/"
      />
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
