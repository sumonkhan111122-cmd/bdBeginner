import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Crown,
  Check,
  Minus,
  Layers,
  Download,
  LifeBuoy,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  MEMBERSHIP_PLANS,
  planToProduct,
  type MembershipPlan,
} from "@/data/membershipPlans";
import { useCart } from "@/context/CartContext";
import { useMembership } from "@/context/MembershipContext";
import { useCurrencyFormatter } from "@/hooks/useCurrency";
import { trackSubscribe, trackViewContent } from "@/lib/tracking";

const planNames: Record<string, string> = {
  monthly: "The short stay",
  yearly: "A little longer",
  lifetime: "The forever pass",
};
export function MembershipPage() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { isVip, status } = useMembership();
  const formatPrice = useCurrencyFormatter();
  const plans = ["monthly", "yearly", "lifetime"].map(
    (id) => MEMBERSHIP_PLANS.find((plan) => plan.id === id)!,
  );
  const lifetime = plans[2];
  useEffect(() => {
    trackViewContent({
      id: "vip-membership",
      name: "VIP All-Access Membership",
      price: lifetime.price,
      category: "Membership",
    });
  }, [lifetime.price]);
  function selectPlan(plan: MembershipPlan) {
    trackSubscribe(plan.name, plan.price);
    clearCart();
    addItem(planToProduct(plan), 1, false);
    navigate("/checkout");
  }
  const faqs = [
    {
      question: "ফ্রি রিসোর্সের জন্য কি মেম্বারশিপ প্রয়োজন?",
      answer:
        "না। WordPress থিম, প্লাগইন ও PHP স্ক্রিপ্ট সবার জন্য ফ্রি। মেম্বারশিপ মূলত পেইড কোর্স, সফটওয়্যার, এআই টুলস ও ডিজিটাল এসেটের এক্সেসের জন্য।",
    },
    {
      question: "কোন প্ল্যানে কতদিন এক্সেস পাব?",
      answer: `১০ দিনের পাস ${formatPrice(plans[0].price)}, ৩০ দিনের পাস ${formatPrice(plans[1].price)}। লাইফটাইম পাসে ${formatPrice(lifetime.price)} এককালীন পেমেন্টে আজীবন এক্সেস পাবেন। প্রতিটি প্ল্যানের ডাউনলোড সীমা উপরে দেওয়া আছে।`,
    },
    {
      question: "লাইফটাইম প্ল্যানে কি রিনিউয়াল ফি আছে?",
      answer:
        "লাইফটাইম প্ল্যানের মূল্য এককালীন। এই প্ল্যানে মাসিক বা বার্ষিক রিনিউয়াল ফি নেই। ভবিষ্যতের নতুন প্রোডাক্ট ও আপডেট প্ল্যানে অন্তর্ভুক্ত।",
    },
    {
      question: "পেমেন্ট বা এক্সেস নিয়ে সাহায্য কোথায় পাব?",
      answer:
        "প্ল্যান বেছে নিলে চেকআউটে উপলব্ধ পেমেন্ট পদ্ধতি দেখতে পাবেন। পেমেন্ট নিশ্চিত হওয়া বা আপনার এক্সেস নিয়ে প্রশ্ন থাকলে সাপোর্ট টিমের সঙ্গে যোগাযোগ করুন।",
    },
  ];
  return (
    <Layout>
      <div className="premium-home membership-page">
        <section className="membership-intro studio-container">
          <Link to="/" className="membership-breadcrumb">
            Home <ArrowRight size={12} /> Membership
          </Link>
          <p className="studio-kicker">
            <Crown size={16} /> THE BDBEGINNER MEMBERSHIP
          </p>
          <h1>
            One pass.
            <br />
            <span>A world of possibility.</span>
          </h1>
          <p className="membership-intro-copy">
            কাজের রিসোর্স খুঁজতে কম সময়। নিজের কাজের জন্য আরও বেশি সময়।
            <br />
            আপনার প্রয়োজন অনুযায়ী একটি প্ল্যান বেছে নিন।
          </p>
          {isVip && (
            <div className="membership-active">
              <Check size={17} />
              <span>আপনার {status.planName} মেম্বারশিপ সক্রিয় আছে।</span>
              <Link to="/account/downloads">
                Your downloads <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <section
          className="studio-container membership-pricing"
          aria-label="Membership plans"
        >
          <div className="membership-plan-grid">
            {plans.map((plan) => {
              const featured = plan.id === "lifetime";
              return (
                <article
                  className={`membership-plan ${featured ? "is-featured" : ""}`}
                  key={plan.id}
                >
                  <div className="plan-eyebrow">
                    <span>
                      {plan.durationDays
                        ? `${plan.durationDays}-DAY ACCESS`
                        : "LIFETIME ACCESS"}
                    </span>
                    {featured ? (
                      <span className="plan-choice">
                        <Crown size={12} /> One-time payment
                      </span>
                    ) : (
                      <Layers size={17} />
                    )}
                  </div>
                  <h2>{planNames[plan.id]}</h2>
                  <p className="plan-bangla-name">{plan.nameBn}</p>
                  <div className="plan-price">
                    {formatPrice(plan.price)}
                    <span>{plan.durationLabel}</span>
                  </div>
                  <p className="plan-description">{plan.taglineBn}</p>
                  <button
                    type="button"
                    onClick={() => selectPlan(plan)}
                    className={`studio-button ${featured ? "studio-button-lime" : "studio-button-dark"}`}
                  >
                    Choose this plan <ArrowUpRight size={17} />
                  </button>
                  <div className="plan-limit">
                    <Download size={14} />
                    {plan.dailyDownloadLimit
                      ? `Daily downloads: ${plan.dailyDownloadLimit}`
                      : "Unlimited daily downloads"}
                  </div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className={feature.unavailable ? "unavailable" : ""}
                      >
                        {feature.unavailable ? (
                          <Minus size={13} />
                        ) : (
                          <Check size={13} />
                        )}
                        <span>{feature.textBn || feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <div className="membership-free-note">
            <span>
              <Layers size={17} /> WordPress থিম, প্লাগইন ও স্ক্রিপ্ট সবার জন্য
              ফ্রি।
            </span>
            <Link to="/wordpress">
              Explore free resources <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="studio-faq">
          <div className="studio-container studio-faq-grid">
            <div>
              <p className="studio-kicker">A FEW DETAILS, BEFORE YOU BEGIN.</p>
              <h2>
                Good to know.
                <br />
                <span className="muted-heading">Easy to get started.</span>
              </h2>
              <p className="faq-intro">
                মেয়াদ, ডাউনলোড সীমা ও এক্সেস—আপনার সিদ্ধান্তের জন্য প্রয়োজনীয়
                তথ্য।
              </p>
              <Link to="/support" className="studio-inline-link">
                <LifeBuoy size={16} /> Ask our team <ArrowUpRight size={17} />
              </Link>
            </div>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
