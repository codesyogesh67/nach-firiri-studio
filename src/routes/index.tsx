import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/home/HeroSection";
import { AnnouncementTicker } from "@/components/home/AnnouncementTicker";
import { ArtistSection } from "@/components/home/ArtistSection";
import { WorkshopSpotlight } from "@/components/home/WorkshopSpotlight";
import { TutorialsPreview } from "@/components/home/TutorialsPreview";
import { VibeReel } from "@/components/home/VibeReel";
import { TikTokSection } from "@/components/home/TikTokSection";
import { ShopTeaser } from "@/components/home/ShopTeaser";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nach Firiri — Feel Every Beat | South Asian Dance" },
      { name: "description", content: "Nepali & South Asian dance workshops, tutorials, private bookings, and Newari-inspired fashion with Swastika. Dance. Feel. Belong." },
      { property: "og:title", content: "Nach Firiri — Feel Every Beat" },
      { property: "og:description", content: "Workshops · Tutorials · Private Bookings · South Asian Fashion" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSection />
      <AnnouncementTicker />
      <ArtistSection />
      <WorkshopSpotlight />
      <TutorialsPreview />
      <VibeReel />
      <TikTokSection />
      <ShopTeaser />
    </>
  );
}
