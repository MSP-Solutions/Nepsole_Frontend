import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import Link from "next/link";
import React from "react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 md:p-12 shadow-xs">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Terms & Conditions
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
                Welcome to Nepsole. These Terms and Conditions govern your
                use of our website, mobile platforms, and the purchase of any
                physical books, e-books, and associated services provided by
                Nepsole.
              </p>
              <p>
                By accessing or using our website, you acknowledge that you have
                read, understood, and agreed to be legally bound by these terms.
                If you do not agree with any part of these Terms and Conditions,
                please do not use our services.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                1. Acceptance of Terms
              </h2>
              <p>
                By registering an account, purchasing items, or browsing
                Nepsole, you confirm that you are at least 18 years of age or
                are accessing the platform under the supervision of a parent or
                legal guardian. You agree to use the website solely for lawful
                purposes and in compliance with all applicable local and
                national laws in Nepal.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                2. User Accounts and Security
              </h2>
              <p>
                When you create an account on Nepsole, you must provide
                accurate, complete, and current information. You are responsible
                for maintaining the confidentiality of your account credentials,
                including your password, and for all activities that occur under
                your account.
              </p>
              <p>
                You must notify us immediately upon becoming aware of any
                unauthorized use of your account or any other breach of security.
                Nepsole will not be liable for any loss or damage arising from
                your failure to protect your login credentials.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                3. Book Orders and Pricing
              </h2>
              <p>
                All book prices on Nepsole are displayed in Nepalese Rupees
                (NPR) and include applicable taxes unless otherwise stated. We
                make every effort to provide accurate pricing, book descriptions,
                and availability details. However, pricing or typographical
                errors may occasionally occur.
              </p>
              <p>
                We reserve the right to correct any errors, modify prices, or
                cancel orders placed for items listed at an incorrect price,
                even after an order confirmation has been sent. If your order is
                cancelled after payment has been completed, a full refund will
                be issued to your original payment method.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                4. Payments and Billing
              </h2>
              <p>
                Nepsole accepts various payment options including major digital
                wallets (eSewa, Khalti, Fonepay), ConnectIPS, credit/debit
                cards, and Cash on Delivery (COD) for eligible delivery
                destinations across Nepal.
              </p>
              <p>
                By providing payment information, you authorize Nepsole and its
                third-party payment processors to charge the designated amount
                for your orders. All online payment transactions are processed
                through secure and encrypted gateways.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                5. Shipping and Delivery
              </h2>
              <p>
                We deliver physical books across Kathmandu Valley and to all
                accessible districts in Nepal through our logistics partners.
                Estimated delivery timelines are typically 1 to 2 business days
                within Kathmandu Valley and 2 to 6 business days for locations
                outside the valley.
              </p>
              <p>
                Delivery times are estimates and may vary due to weather
                conditions, public holidays, transportation disruptions, or
                remote delivery addresses. You are responsible for providing
                an accurate delivery address and active contact number.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                6. E-Books and Digital Content
              </h2>
              <p>
                Purchased or free e-books accessible on Nepsole are licensed, not
                sold, to you for personal, non-commercial use only. You may not
                copy, redistribute, modify, upload, resell, or publicly display
                any digital content obtained from our platform.
              </p>
              <p>
                Any unauthorized distribution or circumvention of digital rights
                management (DRM) technologies is strictly prohibited and constitutes
                a violation of copyright laws.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                7. Returns, Replacements, and Refunds
              </h2>
              <p>
                If you receive a physical book that is damaged, defective, or
                has missing/misprinted pages, you may request a free replacement
                or full refund within 7 days of delivery.
              </p>
              <p>
                Returned books must be in their original condition. Please note
                that digital e-books are non-refundable once access or streaming
                has started, except in cases of technical failure on our part.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                8. Intellectual Property Rights
              </h2>
              <p>
                All website design, logos, icons, graphics, text, and software
                associated with Nepsole are the intellectual property of
                Nepsole or its content suppliers. Book covers, author names,
                and publisher materials belong to their respective copyright
                holders.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                9. User Conduct
              </h2>
              <p>
                You agree not to use our platform to post false, defamatory, or
                unlawful material, interfere with the operation of the website,
                or attempt unauthorized access to our servers, user accounts,
                or databases. We reserve the right to suspend or terminate
                accounts that violate these terms.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                10. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, Nepsole shall not be
                liable for any indirect, incidental, or consequential damages
                resulting from the use of, or inability to use, our website or
                services, including delays in shipping or temporary service
                outages.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                11. Governing Law
              </h2>
              <p>
                These Terms and Conditions shall be governed by and interpreted
                in accordance with the laws of Nepal. Any disputes arising
                under or in connection with these terms shall be subject to the
                exclusive jurisdiction of the courts in Kathmandu, Nepal.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                12. Contact Information
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding
                these Terms and Conditions, please contact us at:
              </p>
              <div className="text-slate-600 text-sm space-y-1">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:support@nepsole.com"
                    className="text-[#1749A0] hover:underline"
                  >
                    support@nepsole.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong> +977 01-4445566
                </p>
                <p>
                  <strong>Address:</strong> Kathmandu, Nepal
                </p>
                <p>
                  You can also reach out via our{" "}
                  <Link
                    href="/contact"
                    className="text-[#1749A0] font-semibold hover:underline"
                  >
                    Contact Us page
                  </Link>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
