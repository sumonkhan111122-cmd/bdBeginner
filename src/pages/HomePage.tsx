import { Hero } from '@/components/home/Hero';
import { CategoryExplorer } from '@/components/home/CategoryExplorer';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyBdBeginner } from '@/components/home/WhyBdBeginner';
import { ServicesSection } from '@/components/home/ServicesSection';
import { ReviewSection } from '@/components/home/ReviewSection';
import { FaqSection } from '@/components/home/FaqSection';
import { Newsletter } from '@/components/Newsletter';
import { Layout } from '@/components/layout/Layout';
import { RecentlyViewedSection } from '@/components/discovery/RecentlyViewedSection';

export function HomePage() {
  return (
    <Layout>
      <Hero />
      <CategoryExplorer />
      <FeaturedProducts />
      <RecentlyViewedSection />
      <HowItWorks />
      <WhyBdBeginner />
      <ServicesSection />
      <ReviewSection />
      <FaqSection />
      <Newsletter />
    </Layout>
  );
}
