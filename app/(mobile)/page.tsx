import BannerSlider from "@/components/home/banner-slider";
import ServiceMenu from "@/components/home/service-menu";
import FeaturedCampaign from "@/components/home/featured-campaign";
import LatestCampaign from "@/components/home/latest-campaign";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 pb-28">
      {/* HERO */}
      <BannerSlider />

      {/* LAYANAN */}
      <ServiceMenu />

      {/* TOP CAMPAIGN */}
      <FeaturedCampaign />

      {/* LATEST CAMPAIGN */}
      <LatestCampaign />
    </main>
  );
}