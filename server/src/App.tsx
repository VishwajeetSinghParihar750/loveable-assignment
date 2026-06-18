import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  ctaText: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    priceYearly: 15,
    description: "Ideal for individual builders and testing out concepts.",
    features: [
      "1 Active Project Workspace",
      "5GB Premium Cloud Storage",
      "Standard Live React Preview",
      "Basic Build & Bundle Tools",
      "Community Forum Support",
    ],
    ctaText: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Pro Professional",
    priceMonthly: 49,
    priceYearly: 39,
    description: "Perfect for scaling teams, power creators, and prompt developers.",
    features: [
      "Unlimited Active Projects",
      "50GB Secure SSD Storage",
      "Instant High-Performance Preview",
      "Advanced File & AI Prompt Tools",
      "Priority 24/7 Slack & Email Support",
      "Custom Domain Integration",
      "Collaborative Shared Workspace (Up to 5)",
    ],
    ctaText: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 99,
    priceYearly: 79,
    description: "Full capabilities, enhanced compliance, and dedicated support.",
    features: [
      "Unlimited Projects & Workspaces",
      "Dedicated Secure Storage (250GB+)",
      "Isolated Execution Previews",
      "Custom REST/GraphQL APIs",
      "Dedicated Account Representative",
      "Enterprise SLA & 99.9% Uptime Guarantee",
      "Single Sign-On (SSO) & SAML Support",
    ],
    ctaText: "Contact Sales",
  },
];

const FAQS = [
  {
    question: "Can I switch plans later?",
    answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time. If you upgrade or downgrade, your billing will be prorated automatically.",
  },
  {
    question: "What does 'billed annually' mean?",
    answer: "With annual billing, you pay for 12 months upfront. This offers a discount of roughly 20% compared to paying month-to-month.",
  },
  {
    question: "Is there a limit on AI prompt usage?",
    answer: "Our Starter and Pro plans offer extremely generous soft limits designed for active daily usage. Enterprise customers receive dedicated execution instances with tailored quotas.",
  },
  {
    question: "What forms of payment do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for annual Enterprise billing.",
  },
];

export function App() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCtaClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsSubmitted(false);
    setEmail("");
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <main className="project-page">
      {/* Navigation Header */}
      <header className="header">
        <div className="logo-container">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">GEMINI_DEV</span>
        </div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing" className="active-nav">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="header-cta" onClick={() => handleCtaClick(PLANS[1])}>
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <p className="kicker">Editable React Template</p>
        <h1>Build, Edit, and Scale with Prompt-Driven Power.</h1>
        <p className="lede">
          Our target React project is now equipped with interactive components, real-time pricing plans,
          and customizable subscription tiers. Choose the plan that perfectly matches your pace.
        </p>
        <div className="feature-row" id="features">
          {["Prompt-driven edits", "Live React preview", "File tools", "Flexible Pricing Plans"].map((feature) => (
            <span key={feature} className="hero-feature-pill">
              {feature}
            </span>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-header">
          <p className="kicker text-center">Simple, Transparent Pricing</p>
          <h2>Plans for Builders of All Scales</h2>
          <p className="pricing-subtitle">
            Get started for free or unlock professional features with our flexible billing. Save up to 20% with annual subscription.
          </p>

          {/* Toggle Switch */}
          <div className="billing-toggle-container">
            <span className={`toggle-label ${!isYearly ? "active" : ""}`}>Monthly billing</span>
            <button
              className={`toggle-switch ${isYearly ? "checked" : ""}`}
              onClick={() => setIsYearly(!isYearly)}
              aria-label="Toggle billing cycle"
            >
              <div className="toggle-slider" />
            </button>
            <span className={`toggle-label ${isYearly ? "active" : ""}`}>
              Yearly billing <span className="discount-badge">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="pricing-grid">
          {PLANS.map((plan) => {
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            const originalPrice = plan.priceMonthly;

            return (
              <div key={plan.id} className={`pricing-card ${plan.popular ? "popular" : ""}`}>
                {plan.popular && <span className="popular-badge">MOST POPULAR</span>}
                
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                
                <div className="price-container">
                  <span className="currency">$</span>
                  <span className="price">{price}</span>
                  <span className="period">/mo</span>
                  
                  {isYearly && (
                    <div className="price-saving-note">
                      Billed annually (${price * 12}/yr) instead of ${originalPrice * 12}/yr
                    </div>
                  )}
                </div>

                <button 
                  className={`cta-button ${plan.popular ? "cta-popular" : ""}`}
                  onClick={() => handleCtaClick(plan)}
                >
                  {plan.ctaText}
                </button>

                <div className="divider" />

                <ul className="features-list">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="feature-item">
                      <svg
                        className="check-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="faq-section" id="faq">
        <p className="kicker text-center">Got questions?</p>
        <h2 className="text-center">Frequently Asked Questions</h2>
        
        <div className="faq-grid">
          {FAQS.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${expandedFaq === index ? "open" : ""}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question-row">
                <span className="faq-question">{faq.question}</span>
                <span className="faq-arrow">{expandedFaq === index ? "−" : "+"}</span>
              </div>
              <div className="faq-answer-container">
                <p className="faq-answer">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retro Brutalist Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">⚡ GEMINI_DEV</span>
            <p className="footer-desc">Empowering developers to prompt, preview, and deploy instantly.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} GEMINI_DEV, Inc. All rights reserved.</p>
          <p className="footer-kicker">PROUDLY MADE IN THE REACT SANDBOX</p>
        </div>
      </footer>

      {/* Subscription / Contact Modal */}
      {selectedPlan && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setSelectedPlan(null)}>
              ✕
            </button>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubscribe} className="modal-form">
                <p className="kicker">Subscribe to plan</p>
                <h2>Activate {selectedPlan.name}</h2>
                <p className="modal-plan-desc">
                  You are subscribing to the <strong>{selectedPlan.name}</strong> plan billed{" "}
                  <strong>{isYearly ? "annually" : "monthly"}</strong>.
                </p>

                <div className="modal-price-box">
                  <div className="modal-price-label">Total Due Now:</div>
                  <div className="modal-price-value">
                    ${isYearly ? selectedPlan.priceYearly * 12 : selectedPlan.priceMonthly}
                    <span className="modal-price-period">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && <div className="modal-savings-pill">Includes 20% annual discount!</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <button type="submit" className="cta-button cta-popular submit-btn">
                  Confirm and Activate
                </button>
                
                <p className="form-note">
                  No credit card required for initial trial setup. Cancel anytime.
                </p>
              </form>
            ) : (
              <div className="modal-success">
                <div className="success-icon">🎉</div>
                <h2>You're on the list!</h2>
                <p className="success-text">
                  Thank you for subscribing to the <strong>{selectedPlan.name}</strong> plan!
                </p>
                <div className="success-receipt">
                  <p><strong>Confirmation Sent To:</strong> {email}</p>
                  <p><strong>Pricing:</strong> ${isYearly ? selectedPlan.priceYearly : selectedPlan.priceMonthly}/mo billed {isYearly ? "annually" : "monthly"}</p>
                </div>
                <button 
                  className="cta-button" 
                  onClick={() => setSelectedPlan(null)}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
