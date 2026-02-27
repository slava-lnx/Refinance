import PageHero from '../components/PageHero';

const LAST_UPDATED = 'February 27, 2026';
const SITE = 'GetMyRefinance';
const EMAIL = 'legal@getmyrefinance.com'; // TODO: update to real legal contact email

export default function TermsOfService() {
  return (
    <>
      <PageHero
        title="Terms of Service"
        subtitle={`Last updated: ${LAST_UPDATED}`}
      />

      <section style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '48px 56px', boxShadow: 'var(--shadow-md)', lineHeight: 1.8 }}>

            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using the {SITE} website located at getmyrefinance.com (the "Site") or any
                of our services, you agree to be bound by these Terms of Service ("Terms") and our Privacy
                Policy. These Terms apply to all visitors, users, and others who access or use the Site.
              </p>
              <p>
                If you do not agree to these Terms, please do not access or use the Site. {SITE}
                reserves the right to update these Terms at any time. Continued use of the Site after
                changes constitutes acceptance of the revised Terms.
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                {SITE} is a free online platform that connects homeowners with licensed mortgage lenders
                and refinance specialists. We operate as a lead generation and matching service — we are
                not a mortgage lender, mortgage broker, or financial advisor.
              </p>
              <p>
                By submitting your information, you authorize us to share your profile with lenders in our
                network who may offer refinance products and contact you directly with rate quotes and offers.
              </p>
            </Section>

            <Section title="3. Eligibility">
              <p>
                You must be at least 18 years of age and a legal resident of the United States to use our
                services. By using the Site, you represent and warrant that you meet these requirements.
              </p>
            </Section>

            <Section title="4. Not Financial or Legal Advice">
              <p>
                All content on this Site, including but not limited to rates, calculators, articles, and
                lender matches, is provided for informational purposes only and does not constitute
                financial, legal, tax, or mortgage advice. You should consult a qualified financial
                professional before making any mortgage or refinancing decisions.
              </p>
              <p>
                Rates and offers displayed or communicated are estimates only. Actual rates depend on your
                credit profile, property characteristics, loan-to-value ratio, and lender criteria.
              </p>
            </Section>

            <Section title="5. User Obligations">
              <p>By using our services, you agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information in all forms and inquiries</li>
                <li>Not misrepresent your identity, financial situation, or property information</li>
                <li>Not use the Site for any unlawful or fraudulent purpose</li>
                <li>Not attempt to gain unauthorized access to our systems or data</li>
                <li>Not scrape, copy, or reproduce Site content without written permission</li>
                <li>Not transmit spam, malware, or harmful code through the Site</li>
              </ul>
            </Section>

            <Section title="6. Consent to Contact">
              <p>
                By submitting a form on this Site, you expressly consent to be contacted by {SITE},
                {SITE}, and our lending partners via telephone calls, emails, text messages, and
                pre-recorded or autodialed messages at the contact information you provide. This consent
                is not required as a condition of obtaining any services. Standard carrier message and
                data rates may apply. You may opt out at any time by contacting us at {EMAIL}.
              </p>
            </Section>

            <Section title="7. Lender Relationships">
              <p>
                Lenders in our network are independent third parties. {SITE} does not guarantee the
                accuracy, completeness, or suitability of any lender's offers. We are not responsible for
                a lender's products, services, rates, terms, or actions. Any agreement you enter into with
                a lender is solely between you and that lender.
              </p>
              <p>
                {SITE} may receive compensation from lenders when a match is made. This compensation may
                influence which lenders are presented to you but does not affect our commitment to
                connecting you with suitable options.
              </p>
            </Section>

            <Section title="8. Intellectual Property">
              <p>
                All content on the Site — including text, graphics, logos, icons, images, and software —
                is the property of {SITE} or its licensors and is protected by applicable intellectual
                property laws. You may not reproduce, distribute, or create derivative works without our
                express written consent.
              </p>
            </Section>

            <Section title="9. Disclaimer of Warranties">
              <p>
                THE SITE AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
                KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE
                WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR HARMFUL COMPONENTS.
              </p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, {SITE.toUpperCase()} SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST
                PROFITS OR DATA, ARISING FROM YOUR USE OF THE SITE OR SERVICES, EVEN IF WE HAVE BEEN
                ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED $100.
              </p>
            </Section>

            <Section title="11. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless {SITE}, its officers, directors,
                employees, and agents from and against any claims, liabilities, damages, losses, and
                expenses (including reasonable attorneys' fees) arising from your use of the Site,
                violation of these Terms, or infringement of any third-party rights.
              </p>
            </Section>

            <Section title="12. Governing Law">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State
                of [State] {/* TODO: Insert state of incorporation */}, without regard to its conflict
                of law provisions. Any disputes shall be resolved exclusively in the courts located in
                [County, State] {/* TODO: Insert jurisdiction */}.
              </p>
            </Section>

            <Section title="13. Dispute Resolution">
              <p>
                Any dispute, claim, or controversy arising out of or relating to these Terms or the
                Site shall first be attempted to be resolved through good-faith negotiation. If
                unresolved within 30 days, disputes shall be submitted to binding arbitration under
                the rules of the American Arbitration Association, except that either party may seek
                injunctive relief in a court of competent jurisdiction.
              </p>
            </Section>

            <Section title="14. Termination">
              <p>
                We reserve the right to suspend or terminate your access to the Site at any time, with
                or without notice, for any reason, including violation of these Terms. Upon termination,
                all provisions of these Terms that by their nature should survive will continue to apply.
              </p>
            </Section>

            <Section title="15. Contact Us" last>
              <p>
                If you have questions about these Terms of Service, please contact us:
              </p>
              <p>
                <strong>{SITE}</strong><br />
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
