import { Link } from "react-router-dom";
import { ArrowUpRight, Play, Crown, Check, ArrowRight } from "lucide-react";
import { MEMBERSHIP_PLANS } from "@/data/membershipPlans";
import { useCurrencyFormatter } from "@/hooks/useCurrency";

export function SignatureFeatures() {
  const formatPrice = useCurrencyFormatter();
  const lifetime = MEMBERSHIP_PLANS.find((plan) => plan.id === "lifetime")!;
  return (
    <section className="signature-section" id="signature">
      <div className="studio-container">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">NOT JUST MORE. SOMETHING BETTER.</p>
            <h2>
              Two ways to
              <br />
              <span className="muted-heading">go a little further.</span>
            </h2>
          </div>
          <p>
            কিছু জিনিস একটু আলাদা।
            <br />
            আপনার পরের প্রজেক্টের জন্য, বিশেষ দুটি পছন্দ।
          </p>
        </div>
        <div className="signature-grid">
          <article className="playflix-feature">
            <div className="signature-label">
              <span>
                <Play size={14} fill="currentColor" /> THE SIGNATURE TOOL
              </span>
              <span>01 / PLAYFLIX</span>
            </div>
            <h3>
              Big-screen ambition.
              <br />
              Meet <span>Playflix.</span>
            </h3>
            <p>
              নিজের মুভি ও টিভি ওয়েবসাইট তৈরি করুন। অটোমেটেড মেটাডেটা, সাজানো
              কনটেন্ট ও রেসপনসিভ ডিজাইন—একটি স্ক্রিপ্টে।
            </p>
            <a
              href="https://www.bdbeginner.com/playflix"
              className="studio-button studio-button-white"
            >
              Discover Playflix <ArrowUpRight size={18} />
            </a>
            <a
              className="playflix-window"
              href="https://www.bdbeginner.com/playflix"
              aria-label="Explore Playflix website script"
            >
              <div className="preview-browserbar">
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <span>playflix / your next project</span>
                <ArrowUpRight size={13} />
              </div>
              <img
                src="/images/playflix-preview.png"
                alt="Actual Playflix movie website interface preview"
                loading="lazy"
              />
              <span className="preview-caption">
                YOUR WEBSITE. YOUR SPOTLIGHT. <ArrowUpRight size={16} />
              </span>
            </a>
            <div className="signature-bottom">
              <span>Automatic metadata</span>
              <span>Movie & TV library</span>
              <span>Responsive frontend</span>
            </div>
          </article>
          <article className="membership-feature">
            <div className="signature-label">
              <span>
                <Crown size={16} /> THE ALL-ACCESS ADVANTAGE
              </span>
              <span>02 / MEMBERSHIP</span>
            </div>
            <h3>
              Less searching.
              <br />
              More <span>creating.</span>
            </h3>
            <p>
              বারবার আলাদা করে কেনার বদলে, আপনার কাজের জন্য একটি মেম্বারশিপ।
              কোর্স, সফটওয়্যার ও ডিজিটাল রিসোর্স একসঙ্গে।
            </p>
            <div
              className="membership-pass"
              aria-label={`Lifetime membership ${formatPrice(lifetime.price)}`}
            >
              <div className="pass-top">
                <span className="pass-brand">bdBeginner®</span>
                <Crown size={27} />
              </div>
              <span className="pass-small">THE CREATOR'S PASS</span>
              <div className="pass-title">
                ALL
                <br />
                ACCESS<span>↗</span>
              </div>
              <div className="pass-bottom">
                <span>LIFETIME MEMBERSHIP</span>
                <span>•••• 0001</span>
              </div>
            </div>
            <div className="member-benefits">
              <span>
                <Check size={14} /> Paid courses & software
              </span>
              <span>
                <Check size={14} /> Digital assets & tools
              </span>
            </div>
            <div className="membership-price">
              <div>
                <small>Lifetime access</small>
                <strong>
                  {formatPrice(lifetime.price)}
                  <span> / one-time</span>
                </strong>
              </div>
              <Link
                to="/membership"
                className="member-round-link"
                aria-label="Explore membership plans"
              >
                <ArrowUpRight size={26} />
              </Link>
            </div>
            <Link to="/membership" className="membership-all-plans">
              Find your perfect plan <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
