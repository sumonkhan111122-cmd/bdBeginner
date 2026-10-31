import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Layers,
  Zap,
  Play,
  Plus,
} from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CategoryExplorer } from "@/components/home/CategoryExplorer";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SignatureFeatures } from "@/components/home/SignatureFeatures";
import { FaqAccordion } from "@/components/FaqAccordion";
import { faqItems, services } from "@/data/homepage";
import { Layout } from "@/components/layout/Layout";
import "@/studio.css";

export function HomePage() {
  return (
    <Layout>
      <div className="premium-home">
        <Hero />
        <div
          className="studio-ribbon"
          aria-label="Resources for your next project"
        >
          <div>
            <span>BUILT FOR YOUR NEXT BIG THING</span>
            <Plus size={16} />
            <span>DESIGN</span>
            <Plus size={16} />
            <span>BUILD</span>
            <Plus size={16} />
            <span>LEARN</span>
            <Plus size={16} />
            <span>CREATE</span>
            <Plus size={16} />
            <span>REPEAT.</span>
            <Plus size={16} />
          </div>
        </div>
        <SignatureFeatures />
        <CategoryExplorer />
        <FeaturedProducts />
        <section className="studio-course-section">
          <div className="studio-container">
            <div className="studio-course">
              <Link
                className="course-art"
                to="/course/ai-motion?demo=1"
                aria-label="Watch AI Motion Masterclass demo"
              >
                <div className="course-art-label">
                  BDBEGINNER / CREATIVE LEARNING
                </div>
                <div className="course-art-title">
                  MAKE
                  <br />
                  <span>IT MOVE.</span>
                </div>
                <div className="course-play">
                  <Play size={24} fill="currentColor" />
                </div>
                <span className="course-art-bottom">
                  AI MOTION MASTERCLASS <ArrowUpRight size={19} />
                </span>
              </Link>
              <div className="course-copy">
                <p className="studio-kicker">A NEW SKILL. A NEW DIRECTION.</p>
                <h2>
                  Don't just watch.
                  <br />
                  <span className="muted-heading">Make something.</span>
                </h2>
                <p>
                  সিনেমাটিক ভিডিও, মোশন গ্রাফিক্স, এআই দিয়ে নতুন কিছু তৈরি—আপনার
                  ক্রিয়েটিভ আইডিয়াকে কাজে লাগাতে শিখুন AI Motion Masterclass-এ।
                </p>
                <Link
                  to="/course/ai-motion"
                  className="studio-button studio-button-dark"
                >
                  Explore the masterclass <ArrowUpRight size={18} />
                </Link>
                <Link
                  to="/course/ai-motion?demo=1"
                  className="course-demo-link"
                >
                  Try a demo class <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="studio-services">
          <div className="studio-container">
            <div className="studio-section-heading">
              <div>
                <p className="studio-kicker">A LITTLE HELP GOES A LONG WAY.</p>
                <h2>
                  Your vision.
                  <br />
                  <span className="muted-heading">Our expertise.</span>
                </h2>
              </div>
              <Link to="/services" className="studio-inline-link">
                All services <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="studio-service-grid">
              {services.slice(0, 3).map((service, index) => {
                const Icon = [Code2, Layers, Zap][index];
                return (
                  <Link
                    to={`/services/${service.slug}`}
                    className="studio-service-card"
                    key={service.id}
                  >
                    <div className="service-card-top">
                      <Icon size={25} strokeWidth={1.4} />
                      <span>0{index + 1}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <span className="service-card-bottom">
                      Let's build it <ArrowUpRight size={20} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        <section className="studio-faq">
          <div className="studio-container studio-faq-grid">
            <div>
              <p className="studio-kicker">GOOD QUESTIONS. CLEAR ANSWERS.</p>
              <h2>
                A few things
                <br />
                <span className="muted-heading">worth knowing.</span>
              </h2>
              <p className="faq-intro">
                প্রথমবার এসেছেন? প্রয়োজনীয় কিছু তথ্য এখানে পাবেন। আর কিছু জানতে
                চাইলে আমরা আছি।
              </p>
              <Link to="/support" className="studio-inline-link">
                Talk to our team <ArrowUpRight size={18} />
              </Link>
            </div>
            <FaqAccordion items={faqItems.slice(0, 4)} />
          </div>
        </section>
        <section className="studio-closing">
          <div className="studio-container">
            <span className="closing-asterisk" aria-hidden="true">
              ✳
            </span>
            <p className="studio-kicker">YOUR NEXT CHAPTER IS WAITING.</p>
            <h2>
              Good things
              <br />
              begin <span>here.</span>
            </h2>
            <div className="closing-actions">
              <Link to="/products" className="studio-button studio-button-blue">
                Find your next resource <ArrowUpRight size={19} />
              </Link>
              <Link to="/membership" className="studio-inline-link">
                Become a member <ArrowUpRight size={18} />
              </Link>
            </div>
            <p className="closing-bangla">
              বড় কিছু শুরু করতে, ছোট একটা পদক্ষেপই যথেষ্ট।
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
