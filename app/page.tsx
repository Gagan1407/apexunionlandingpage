import SiteHeader from "@/components/landing/SiteHeader";
import Hero from "@/components/landing/Hero";
import TruthSection from "@/components/landing/TruthSection";
import AboutApexSection from "@/components/landing/AboutApexSection";
import ProgrammeStructureSection from "@/components/landing/ProgrammeStructureSection";
import MentorsSection from "@/components/landing/MentorsSection";
import ConsultationBanner from "@/components/landing/ConsultationBanner";
import PartnersSection from "@/components/landing/PartnersSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import AudienceSection from "@/components/landing/AudienceSection";
import FoundersSection from "@/components/landing/FoundersSection";
import AdmissionSection from "@/components/landing/AdmissionSection";
import FaqSection from "@/components/landing/FaqSection";
import EnrollSection from "@/components/landing/EnrollSection";
import SiteFooter from "@/components/landing/SiteFooter";
import LeadModal from "@/components/lead/LeadModal";
import InteractiveBehaviors from "@/components/landing/InteractiveBehaviors";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <TruthSection />
        <AboutApexSection />
        <ProgrammeStructureSection />
        <MentorsSection />
        <ConsultationBanner source="consult-banner-mentors" />
        <PartnersSection />
        <ComparisonSection />
        <AudienceSection />
        <FoundersSection />
        <AdmissionSection />
        <FaqSection />
        <EnrollSection />
      </main>
      <SiteFooter />
      <LeadModal />
      <InteractiveBehaviors />
    </>
  );
}
