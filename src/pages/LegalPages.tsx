import { LegalPage } from './LegalPage';

export function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The terms and conditions that govern your use of bdBeginner and your purchases from our marketplace."
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: 'By accessing and using bdBeginner, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not use our website or purchase our products.',
        },
        {
          heading: '2. Digital Products',
          body: 'All digital products sold on bdBeginner are provided as described on their respective product pages. Due to the nature of digital goods, we encourage you to review product descriptions, requirements, and compatibility information carefully before purchasing.',
        },
        {
          heading: '3. Licenses',
          body: 'Unless otherwise stated on the product page, digital products are licensed for use as specified in the product description. Reselling, redistributing, or sharing product files without authorization is not permitted.',
        },
        {
          heading: '4. Pricing and Payment',
          body: 'All prices are listed in US Dollars unless otherwise indicated. We reserve the right to change pricing at any time. Orders are subject to acceptance and payment verification before delivery.',
        },
        {
          heading: '5. Intellectual Property',
          body: 'All content on this website, including text, graphics, logos, and design elements, is the property of bdBeginner or its content creators and is protected by applicable intellectual property laws.',
        },
        {
          heading: '6. Limitation of Liability',
          body: 'bdBeginner is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product in question.',
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How bdBeginner collects, uses, and protects your personal information when you use our website and services."
      sections={[
        {
          heading: '1. Information We Collect',
          body: 'We collect information you provide directly to us, such as your name, email address, and payment information when you create an account or make a purchase. We also automatically collect certain technical data such as browser type and usage patterns.',
        },
        {
          heading: '2. How We Use Your Information',
          body: 'We use your information to process orders, deliver products, provide support, send important account notifications, and improve our services. We do not sell your personal information to third parties.',
        },
        {
          heading: '3. Data Security',
          body: 'We take reasonable measures to protect your personal information using industry-standard security practices. Payment processing is handled through secure, encrypted payment infrastructure.',
        },
        {
          heading: '4. Cookies',
          body: 'We use cookies and similar technologies to improve your browsing experience, analyze website traffic, and remember your preferences. You can control cookies through your browser settings.',
        },
        {
          heading: '5. Your Rights',
          body: 'You have the right to access, update, or request deletion of your personal information. Contact us if you wish to exercise any of these rights regarding your data.',
        },
        {
          heading: '6. Third-Party Services',
          body: 'We may use trusted third-party services for payment processing, analytics, and email delivery. These providers have their own privacy policies governing how they handle your data.',
        },
      ]}
    />
  );
}

export function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="Our policy on refunds and returns for digital products and services purchased through bdBeginner."
      sections={[
        {
          heading: '1. Digital Product Refunds',
          body: 'Due to the nature of digital products, refund eligibility is evaluated on a case-by-case basis. If a product is not as described, is non-functional, or has significant issues not mentioned on the product page, you may request a refund within a reasonable period after purchase.',
        },
        {
          heading: '2. Service Refunds',
          body: 'For professional services, refund eligibility depends on the stage of work completed. If work has not yet begun, a full or partial refund may be available. If work is in progress, refunds are evaluated based on completed deliverables.',
        },
        {
          heading: '3. How to Request a Refund',
          body: 'To request a refund, contact our support team through the Get Support option with your order details and a description of the issue. We aim to respond to all refund requests within a reasonable timeframe.',
        },
        {
          heading: '4. Non-Refundable Cases',
          body: 'Refunds may not be available for products that have been downloaded and used, change of mind purchases, or cases where the product matches its description and functions as advertised.',
        },
        {
          heading: '5. Processing Time',
          body: 'Approved refunds are typically processed back to the original payment method. Processing times may vary depending on your payment provider.',
        },
      ]}
    />
  );
}

export function DeliveryPolicyPage() {
  return (
    <LegalPage
      title="Delivery Policy"
      description="How digital products and services are delivered after purchase on bdBeginner."
      sections={[
        {
          heading: '1. Digital Product Delivery',
          body: 'Most digital products are available for download immediately after a successful purchase. You can access your products through your account dashboard under your purchases or downloads section.',
        },
        {
          heading: '2. Service Delivery',
          body: 'For professional services, delivery begins after we confirm your purchase and conduct an initial consultation to scope the work. A timeline will be communicated based on the scope and complexity of the project.',
        },
        {
          heading: '3. Download Access',
          body: 'Product downloads remain accessible through your account. If you lose access or encounter download issues, contact support and we will help restore your access.',
        },
        {
          heading: '4. Updates',
          body: 'When product updates are available, they are typically accessible through your account. Update availability depends on the product and the terms specified on the product page.',
        },
        {
          heading: '5. Delivery Issues',
          body: 'If you do not receive access to your product after purchase, or encounter any delivery-related issues, contact our support team and we will resolve the matter promptly.',
        },
      ]}
    />
  );
}
