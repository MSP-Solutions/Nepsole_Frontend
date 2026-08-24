import React from "react";
import { BookOpen, ArrowUpRight, Mail, Phone } from "lucide-react";

const quickLinks = [
  "About Us",
  "Contact Us",
  "FAQs",
  "Shipping & Delivery",
  "Return & Refund Policy",
  "Terms & Conditions",
];

const customerLinks = [
  "Help & Support",
  "Track Order",
  "My Account",
  "Wishlist",
  "Bulk Order",
  "Gift Cards",
];

const categories = [
  "Fiction",
  "Biography",
  "Self Help",
  "Business & Economics",
  "Children's Books",
  "Nepal Literature",
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white font-sans text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <BookOpen size={22} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Nepsole
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Books, Knowledge & Beyond
                </p>
              </div>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              Your trusted online bookstore for books, e-books, and audiobooks.
              Discover stories, ideas, and knowledge all in one place.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">
              <a
                href="mailto:hello@nepsole.com"
                className="flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                <Mail size={15} />
                hello@nepsole.com
              </a>

              <a
                href="tel:+9779800000000"
                className="flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                <Phone size={15} />
                +977 9800000000
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title="Quick Links" items={quickLinks} />

          {/* Customer Service */}
          <FooterColumn title="Customer Service" items={customerLinks} />

          {/* Categories */}
          <FooterColumn title="Popular Categories" items={categories} />
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 py-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-slate-600">Nepsole</span>. All
            Rights Reserved.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a href="#" className="transition-colors hover:text-slate-700">
              Privacy Policy
            </a>

            <span className="h-3 w-px bg-slate-200" />

            <a href="#" className="transition-colors hover:text-slate-700">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>

      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item}>
            <a
              href="#"
              className="group inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <span>{item}</span>

              <ArrowUpRight
                size={13}
                className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
