import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  Search,
  Sparkles,
  Crown,
  Play,
  Plus,
} from "lucide-react";

export function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  function search(event: FormEvent) {
    event.preventDefault();
    navigate(
      query.trim()
        ? `/products?search=${encodeURIComponent(query.trim())}`
        : "/products",
    );
  }
  return (
    <section className="studio-hero">
      <div className="studio-container">
        <div className="hero-topline">
          <span>
            <span className="status-dot" /> THE DIGITAL POSSIBILITIES STUDIO
          </span>
          <span>
            MADE FOR YOUR NEXT CHAPTER <ArrowDown size={13} />
          </span>
        </div>
        <div className="studio-hero-grid">
          <div className="studio-hero-copy">
            <p className="studio-kicker">
              <Sparkles size={15} /> A GOOD PLACE TO BEGIN.
            </p>
            <h1>
              Small spark.
              <br />
              Big ideas.
              <br />
              <span>Start here.</span>
              <span className="hero-period">✳</span>
            </h1>
            <p className="hero-description">
              আপনার পরের বড় কাজের শুরুটা হোক এখানেই। বেছে নিন ডিজিটাল টুলস,
              শিখুন নতুন কিছু, তৈরি করুন নিজের মতো।
            </p>
            <div className="hero-actions">
              <Link to="/products" className="studio-button studio-button-blue">
                Explore the collection <ArrowUpRight size={19} />
              </Link>
              <a
                href="https://www.bdbeginner.com/playflix"
                className="hero-text-link"
              >
                <Play size={12} fill="currentColor" /> Meet Playflix{" "}
                <ArrowUpRight size={17} />
              </a>
            </div>
            <form className="studio-search" onSubmit={search} role="search">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you working on?"
                aria-label="Search products"
              />
              <button type="submit" aria-label="Search products">
                <ArrowUpRight size={19} />
              </button>
            </form>
          </div>
          <div className="studio-hero-art">
            <div className="art-index">
              <span>THE SHAPE OF POSSIBILITY</span>
              <span>FIG. 01 / BD</span>
            </div>
            <img
              className="hero-sculpture"
              src="/images/possibility-sculpture.webp"
              alt="Sculptural cobalt blue ribbon with polished chrome and a lime glass sphere"
              fetchPriority="high"
            />
            <div className="art-grid-mark mark-one">
              <Plus size={17} />
            </div>
            <div className="art-grid-mark mark-two">
              <Plus size={17} />
            </div>
            <a
              className="art-float art-playflix"
              href="https://www.bdbeginner.com/playflix"
            >
              <span className="float-icon">
                <Play size={19} fill="currentColor" />
              </span>
              <span>
                <small>BUILD SOMETHING DIFFERENT</small>
                <strong>
                  Playflix <ArrowUpRight size={16} />
                </strong>
              </span>
            </a>
            <Link className="art-float art-member" to="/membership">
              <span className="member-mini-mark">
                <Crown size={22} />
              </span>
              <span>
                <small>YOUR CREATIVE ADVANTAGE</small>
                <strong>
                  One membership.
                  <br />
                  More possibilities.
                </strong>
              </span>
              <ArrowUpRight size={20} />
            </Link>
            <div className="art-caption">
              <span>TOOLS. IDEAS. A LITTLE AMBITION.</span>
              <span>∞ POSSIBILITIES</span>
            </div>
          </div>
        </div>
        <div className="hero-footnote">
          <span>FOR THE BUILDERS. THE LEARNERS. THE WHAT-IF PEOPLE.</span>
          <a href="#discover" aria-label="Discover the collections">
            SCROLL TO DISCOVER <ArrowDown size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
