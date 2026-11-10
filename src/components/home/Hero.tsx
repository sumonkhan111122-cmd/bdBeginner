import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Layers3, Play, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { PLAYFLIX_URL } from '@/data/playflix';

export function Hero() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  function search(event: FormEvent) {
    event.preventDefault();
    navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products');
  }
  return <section className="bb-hero">
    <div className="bb-container bb-hero-grid">
      <div className="bb-hero-copy">
        <Link to="/courses" className="bb-eyebrow-pill"><span className="bb-online-dot" /> YOUR NEXT CHAPTER STARTS HERE <ArrowUpRight size={13} /></Link>
        <h1>Big ideas.<br />New skills.<br /><span>Endless possibilities.</span><svg className="bb-heading-spark" width="43" height="49" viewBox="0 0 43 49" fill="none" aria-hidden="true"><path d="M22 3v13M39 12l-10 9M40 32l-13-3M7 10l8 11M3 31l12-3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg></h1>
        <p className="bb-hero-description">Everything you need to learn, create, and build something great. Practical courses. Powerful tools. All in one place.</p>
        <p className="bb-hero-bengali" lang="bn">শিখুন নতুন কিছু। তৈরি করুন নিজের মতো।</p>
        <form className="bb-hero-search" onSubmit={search} role="search"><Search size={20} aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search courses & tools" aria-label="Search courses and digital products" /><button type="submit" aria-label="Find courses and products"><ArrowRight size={21} /></button></form>
        <div className="bb-popular-searches"><span>Popular:</span>{[{ label: 'Courses', to: '/courses' }, { label: 'WordPress', to: '/wordpress' }, { label: 'Design assets', to: '/resources' }].map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}</div>
        <div className="bb-hero-proof"><span><ShieldCheck size={16} /> Secure payments</span><span><BookOpen size={16} /> Learn at your pace</span><span><Check size={16} /> Made for creators</span></div>
      </div>
      <div className="bb-hero-visual" aria-label="Explore creative learning and digital tools">
        <span className="bb-visual-orbit" aria-hidden="true" />
        <span className="bb-visual-star" aria-hidden="true">✳</span>
        <a href={PLAYFLIX_URL} className="bb-playflix-card">
          <div className="bb-playflix-card-top"><span><Play size={14} fill="currentColor" aria-hidden="true" /> FEATURED TOOL</span><ArrowUpRight size={22} aria-hidden="true" /></div>
          <div className="bb-playflix-card-copy"><h2>Meet <span>Playflix.</span></h2><p>Your movie & TV website script.</p></div>
          <div className="bb-playflix-preview"><div className="bb-playflix-browserbar" aria-hidden="true"><span><i /><i /><i /></span><span>Playflix / a preview of your next project</span></div><img src="/images/playflix-preview.png" alt="Playflix movie and TV website interface with a featured carousel and movie library" width={1024} height={576} decoding="async" /></div>
          <div className="bb-playflix-card-bottom"><span>Automatic metadata · Responsive design</span><strong>Explore Playflix <ArrowUpRight size={17} aria-hidden="true" /></strong></div>
        </a>
        <Link to="/products" className="bb-mini-product"><span className="bb-mini-product-icon"><Layers3 size={27} strokeWidth={1.5} /></span><span><small>Digital resources</small><strong>Your next great project.</strong><span>Ready to create <ArrowUpRight size={16} /></span></span></Link>
        <Link to="/wordpress" className="bb-mini-code"><span className="bb-mini-code-icon"><Code2 size={24} /></span><span><small>WordPress & code</small><strong>Build something<br />beautiful.</strong></span><ArrowUpRight size={20} /></Link>
        <div className="bb-learning-note"><span><Sparkles size={15} /></span> A little head start for your next idea.</div>
      </div>
    </div>
    <div className="bb-container bb-hero-foot"><span>FOR THE CURIOUS. THE CREATORS. THE DOERS.</span><a href="#explore">Find your next thing <ArrowDown size={14} /></a></div>
  </section>;
}
