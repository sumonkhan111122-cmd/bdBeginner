import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Check, Code2, Crown, Download, Globe2, Headphones, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { CategoryExplorer } from '@/components/home/CategoryExplorer';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FaqAccordion } from '@/components/FaqAccordion';
import { faqItems, services } from '@/data/homepage';
import { Layout } from '@/components/layout/Layout';

export function HomePage() {
  return <Layout><div className="bb-home">
    <Hero />
    <div className="bb-benefits"><div className="bb-container">{[
      { icon: BookOpen, title: 'Skills that go somewhere', text: 'Practical, project-based learning' },
      { icon: Download, title: 'Less searching. More creating.', text: 'Resources ready for your next idea' },
      { icon: ShieldCheck, title: 'Shop with confidence', text: 'Secure checkout, clear delivery' },
      { icon: Headphones, title: 'A little help, whenever you need', text: 'Friendly support, just a message away' },
    ].map(item => <div className="bb-benefit" key={item.title}><span><item.icon size={23} strokeWidth={1.6} /></span><div><strong>{item.title}</strong><p>{item.text}</p></div></div>)}</div></div>
    <CategoryExplorer />
    <FeaturedProducts />
    <section className="bb-section bb-how"><div className="bb-container"><div className="bb-section-heading bb-heading-centered"><div><p className="bb-kicker">FROM “WHAT IF” TO “LOOK WHAT I MADE”</p><h2>A good place to begin<span>.</span></h2><p>Less friction between you and your next big idea.</p></div></div><div className="bb-how-grid">{[
      { number: '01', icon: SearchIcon, title: 'Find your next thing', text: 'Explore courses, creative tools, and digital resources that fit what you want to do.' },
      { number: '02', icon: ShieldCheck, title: 'Make it yours', text: 'Check the details, choose what you need, and complete your order with secure checkout.' },
      { number: '03', icon: Sparkles, title: 'Create something great', text: 'Find your purchases in your account, start learning, and bring your ideas to life.' },
    ].map(step => <div className="bb-how-card" key={step.number}><div><span className="bb-how-icon"><step.icon size={23} strokeWidth={1.6} /></span><span className="bb-step-number">{step.number}</span></div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></div></section>
    <section className="bb-membership-section"><div className="bb-container"><div className="bb-membership-banner"><div><p className="bb-kicker"><Crown size={15} /> THE BDBEGINNER MEMBERSHIP</p><h2>More creating.<br /><span>More possibilities.</span></h2><p>Your creative toolkit, with a little more freedom. Explore a membership that fits the way you work.</p><Link to="/membership" className="bb-button bb-button-dark">Find your membership <ArrowUpRight size={17} /></Link><div className="bb-membership-perks"><span><Check size={14} /> Flexible access options</span><span><Check size={14} /> One place for your resources</span></div></div><div className="bb-member-card-stack" aria-hidden="true"><div className="bb-member-card-back" /><div className="bb-member-card"><div><span>bdBeginner.</span><Crown size={25} /></div><span className="bb-member-card-star">✳</span><strong>A world of<br />possibility.</strong><div><span>THE CREATIVE ALL-ACCESS PASS</span><ArrowUpRight size={21} /></div></div><span className="bb-member-card-seal">LESS LIMITS.<br />MORE IDEAS.</span></div></div></div></section>
    <section className="bb-section bb-services"><div className="bb-container"><div className="bb-section-heading"><div><p className="bb-kicker">LET'S BUILD SOMETHING TOGETHER</p><h2>Your vision. Our expertise<span>.</span></h2><p>A helping hand to turn your next idea into a working website.</p></div><Link to="/services" className="bb-text-link">Explore our services <ArrowUpRight size={17} /></Link></div><div className="bb-services-grid">{services.slice(0, 3).map((service, i) => { const Icon = [Code2, Layers3, Globe2][i]; return <Link to={`/services/${service.slug}`} className={`bb-service-card bb-service-tone-${i}`} key={service.id}><span className="bb-service-icon"><Icon size={28} strokeWidth={1.5} /></span><span className="bb-service-index">0{i + 1}</span><h3>{service.title}</h3><p>{service.description}</p><span className="bb-service-cta">Let's make it happen <ArrowUpRight size={18} /></span></Link>; })}</div></div></section>
    <section className="bb-section bb-faq"><div className="bb-container bb-faq-grid"><div><p className="bb-kicker">A LITTLE CLARITY BEFORE YOU BEGIN</p><h2>Good questions.<br /><span>Clear answers.</span></h2><p>নতুন শুরুতে কিছু প্রশ্ন থাকতেই পারে। প্রয়োজনীয় তথ্যগুলো এখানে পাবেন।</p><Link to="/support" className="bb-text-link">We're here to help <ArrowUpRight size={17} /></Link></div><FaqAccordion items={faqItems.slice(0, 4)} /></div></section>
    <section className="bb-final-cta"><div className="bb-container"><div><p className="bb-kicker">GO ON. SEE WHAT'S POSSIBLE.</p><h2>Your next big thing<br />starts with <span>a little beginning.</span></h2></div><Link to="/courses" className="bb-button bb-button-white">Find your next skill <ArrowUpRight size={18} /></Link><span className="bb-final-asterisk" aria-hidden="true">✳</span></div></section>
  </div></Layout>;
}

function SearchIcon({ size = 24, strokeWidth = 1.6 }: { size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
}
