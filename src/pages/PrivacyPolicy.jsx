import PageHero from '../components/PageHero';

const LAST_UPDATED = 'February 27, 2026';
const COMPANY = 'Slava LLC';
const SITE = 'GetMyRefinance';
const EMAIL = 'privacy@getmyrefinance.com'; // TODO: update to real privacy contact email

export default function PrivacyPolicy() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        subtitle={`Last updated: ${LAST_UPDATED}`}
      />

      <section style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '48px 56px', boxShadow: 'var(--shadow-md)', lineHeight: 1.8 }}>

            <Section title="1. Introduction">
              <p>
                {COMPANY} ("we," "us," or "our") operates the {SITE} platform located at getmyrefinance.com
                (the "Site"). This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you visit our Site or submit information through our mortgage refinance
                matching service.
              </p>
              <p>
                By using the Site, you agree to the collection and use of information in accordance with
                this policy. If you do not agree, please do not use our services.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>We collect the following categories of personal information:</p>
              <SubHeading>Information You Provide Directly</SubHeading>
              <ul>
                <li>Name, email address, and phone number</li>
                <li>Property address and ZIP code</li>
                <li>Home value, mortgage balance, and current interest rate</li>
                <li>Credit score range and refinance goal</li>
                <li>Property type and occupancy status</li>
              </ul>
              <SubHeading>Information Collected Automatically</SubHeading>
              <ul>
                <li>IP address, browser type, and operating system</li>
                <li>Pages visited, time spent, and referring URLs</li>
                <li>Device identifiers and cookie data</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Match you with lenders in our network based on your financial profile</li>
                <li>Deliver personalized refinance rate offers to your email or phone</li>
                <li>Communicate with you about your inquiry and our services</li>
                <li>Improve our platform, tools, and user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Send service updates and, with your consent, marketing communications</li>
              </ul>
            </Section>

            <Section title="4. Sharing of Information">
              <p>
                We do not sell your personal information to third parties for their own marketing purposes.
                We may share your information with:
              </p>
              <ul>
                <li>
                  <strong>Lending Partners:</strong> When you submit a refinance inquiry, we share your
                  profile with licensed lenders in our network who may contact you with offers. You consent
                  to this sharing when you submit our form.
                </li>
                <li>
                  <strong>Service Providers:</strong> Companies that help us operate the Site (analytics,
                  email delivery, CRM tools), bound by confidentiality obligations.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> When required by law, court order, or to protect our
                  legal rights.
                </li>
              </ul>
            </Section>

            <Section title="5. Consent to Be Contacted">
              <p>
                By submitting your information through our Site, you expressly consent to be contacted by
                {COMPANY}, {SITE}, and our lending partners by telephone, email, text message, or automated
                dialing systems at the number or address you provide, even if your number is on a Do Not
                Call registry. This consent is not a condition of any purchase. Standard message and data
                rates may apply. You may opt out at any time by contacting us at {EMAIL}.
              </p>
            </Section>

            <Section title="6. Cookies and Tracking Technologies">
              <p>
                We use cookies, web beacons, and similar technologies to operate and improve the Site,
                analyze usage, and deliver relevant content. You can control cookies through your browser
                settings. Disabling cookies may limit some Site features.
              </p>
            </Section>

            <Section title="7. Data Retention">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes
                described in this policy, comply with legal obligations, resolve disputes, and enforce our
                agreements. You may request deletion of your data at any time by contacting us.
              </p>
            </Section>

            <Section title="8. Security">
              <p>
                We implement industry-standard security measures including 256-bit SSL encryption, access
                controls, and regular security audits to protect your information. No method of transmission
                over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="9. Your Rights">
              <p>Depending on your state of residence, you may have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of certain sharing practices</li>
                <li>Receive a portable copy of your data</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                We will respond within 30 days.
              </p>
            </Section>

            <Section title="10. California Residents (CCPA)">
              <p>
                If you are a California resident, you have additional rights under the California Consumer
                Privacy Act (CCPA), including the right to know what personal information we collect and
                how it is used, the right to delete personal information, and the right to opt out of the
                sale of personal information. We do not sell personal information as defined under CCPA.
                To submit a request, contact us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </p>
            </Section>

            <Section title="11. Children's Privacy">
              <p>
                Our Site is not directed to individuals under 18 years of age. We do not knowingly collect
                personal information from children. If you believe we have collected information from a
                child, please contact us immediately.
              </p>
            </Section>

            <Section title="12. Third-Party Links">
              <p>
                Our Site may contain links to third-party websites. We are not responsible for the privacy
                practices of those sites and encourage you to review their privacy policies.
              </p>
            </Section>

            <Section title="13. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes
                by posting the new policy on this page with an updated effective date. Your continued use
                of the Site after changes are posted constitutes your acceptance of the revised policy.
              </p>
            </Section>

            <Section title="14. Contact Us" last>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <p>
                <strong>{COMPANY} — {SITE}</strong><br />
                Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                {/* TODO: Add mailing address once available */}
              </p>
            </Section>

          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 36 }}>
      <h3 style={{ color: 'var(--color-primary)', marginBottom: 12, fontSize: '1.1rem' }}>{title}</h3>
      <div style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>{children}</div>
    </div>
  );
}

function SubHeading({ children }) {
  return (
    <p style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: 14, marginBottom: 6 }}>
      {children}
    </p>
  );
}
