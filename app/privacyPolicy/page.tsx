import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 md:p-12 shadow-xs">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Last Updated: September 2026
            </p>
          </div>

          {/* Body Content in Normal Paragraphs */}
          <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
            {/* Introduction */}
            <section className="space-y-3">
              <p>
                This Privacy Policy explains how Nepsole ("we", "us", or "our")
                collects, uses, discloses, and protects your personal
                information when you use our website, mobile platforms, and
                related services (collectively, the "Service").
              </p>
              <p>
                We are committed to protecting your privacy and handling your
                personal information in accordance with applicable laws and data
                protection regulations in Nepal. By accessing or using Nepsole,
                you agree to the terms of this Privacy Policy.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                1. Information We Collect
              </h2>
              <p>
                We may collect personal information from you through various
                channels, including:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Information you provide directly when creating an account,
                  placing an order, or contacting our support team.
                </li>
                <li>
                  Information collected automatically when you use our Service,
                  including IP addresses, browser type, device information, and
                  usage patterns.
                </li>
                <li>
                  Information from third-party sources, such as payment
                  processors and shipping partners.
                </li>
              </ul>
              <p>
                The types of personal information we collect may include:
                contact details, payment information, order history, and website
                usage data.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                2. How We Use Your Information
              </h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Process and fulfill your book orders.</li>
                <li>Provide customer support and assistance.</li>
                <li>
                  Send order confirmations, shipping notifications, and updates.
                </li>
                <li>Improve our website, products, and services.</li>
                <li>Comply with legal and regulatory requirements.</li>
              </ul>
              <p>
                With your consent, we may also use your information to send you
                marketing communications about promotions, new arrivals, and
                other relevant updates.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                3. Data Sharing and Disclosure
              </h2>
              <p>
                We may share your personal information with trusted third-party
                service providers who assist us in operating our business, such
                as payment processors, shipping companies, and technology
                partners. These third parties are obligated to protect your
                information and use it only for the purposes for which it was
                disclosed to them.
              </p>
              <p>
                We may also disclose your information if required by law, court
                order, or other governmental authority, or when we believe
                disclosure is necessary to protect our rights or the safety of
                others.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                4. Data Security
              </h2>
              <p>
                We implement reasonable security measures to protect your
                personal information from unauthorized access, alteration,
                disclosure, or destruction. These measures include encryption,
                secure servers, and access controls.
              </p>
              <p>
                However, please note that no method of transmission over the
                internet or electronic storage is 100% secure. While we strive
                to protect your information, we cannot guarantee its absolute
                security.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                5. Cookies and Tracking Technologies
              </h2>
              <p>
                Nepsole uses cookies and similar tracking technologies to
                enhance your browsing experience, analyze website traffic, and
                personalize content. You can manage your cookie preferences
                through your browser settings.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                6. User Rights
              </h2>
              <p>
                Depending on applicable laws, you may have the right to access,
                correct, update, or request deletion of your personal
                information. You also have the right to object to or restrict
                certain types of data processing.
              </p>
              <p>
                To exercise these rights, please contact us using the
                information provided in the "Contact Us" section below.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                7. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. We will post the
                updated policy on our website with a revised "Last Updated"
                date. Your continued use of our Service after any changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                8. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our data
                handling practices, please contact us at:
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:[EMAIL_ADDRESS]"
                  className="text-orange-600 hover:underline"
                >
                  [EMAIL_ADDRESS]
                </a>
              </p>
              <p>
                <strong>Phone:</strong> 9851234567
              </p>
              <p>
                <strong>Address:</strong> Kathmandu, Nepal
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
