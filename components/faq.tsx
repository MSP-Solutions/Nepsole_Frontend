"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  CreditCard,
  Headphones,
  HelpCircle,
  MessageSquare,
  Search,
  Sparkles,
  Tablet,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export interface FAQItem {
  id: string;
  category: "delivery" | "ebooks" | "payment" | "general";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "item-1",
    category: "delivery",
    question: "How long does book delivery take across Nepal?",
    answer:
      "Deliveries inside Kathmandu Valley and Pokhara typically arrive within 24 to 48 hours. For all other districts and municipalities across Nepal, standard delivery takes 2 to 4 business days with end-to-end parcel tracking.",
  },
  {
    id: "item-2",
    category: "delivery",
    question: "What are the shipping charges?",
    answer:
      "Shipping fees depend on your delivery location and parcel weight. Inside major cities, standard delivery starts from Rs. 60–100. We also offer FREE delivery on qualifying orders above Rs. 1,500.",
  },
  {
    id: "item-3",
    category: "ebooks",
    question: "How do I read and access purchased E-Books?",
    answer:
      "Digital E-Books are instantly unlocked on your Nepsole account upon checkout. You can read them directly on your mobile browser, tablet, or PC without needing third-party software.",
  },
  {
    id: "item-4",
    category: "ebooks",
    question: "Can I download E-Books for offline reading?",
    answer:
      "Yes! Our modern digital reader allows offline caching on supported devices so you can continue reading your favorite Nepali literature, fiction, or academic textbooks without an active internet connection.",
  },
  {
    id: "item-5",
    category: "payment",
    question: "What payment methods are supported on Nepsole?",
    answer:
      "We support all major Nepali payment options including eSewa, Khalti, Mobile Banking, Fonepay QR, direct bank transfers, as well as Cash on Delivery (COD) for physical book shipments.",
  },
  {
    id: "item-6",
    category: "payment",
    question: "Is online payment safe on Nepsole?",
    answer:
      "Yes, 100% secure. All online transactions are processed through encrypted, PCI-DSS compliant payment gateways. We never store your payment card or banking PIN credentials.",
  },
  {
    id: "item-7",
    category: "general",
    question:
      "Can I request a book that is currently not listed or out of stock?",
    answer:
      "Absolutely! Reach out to us through our Contact Us page with the book title, author, or publisher name. Our procurement team coordinates with over 100+ publishers across Nepal and India to source rare and out-of-stock titles.",
  },
  {
    id: "item-8",
    category: "general",
    question: "What is the return and replacement policy?",
    answer:
      "If you receive a misprinted, damaged, or incorrect book, simply notify our support team within 7 days of delivery. We will arrange a free exchange or full refund promptly.",
  },
];

const CATEGORIES = [
  { key: "all", label: "All Questions", icon: HelpCircle },
  { key: "delivery", label: "Delivery & Shipping", icon: Truck },
  { key: "ebooks", label: "E-Books & Reading", icon: Tablet },
  { key: "payment", label: "Payment & Pricing", icon: CreditCard },
  { key: "general", label: "General & Support", icon: BookOpen },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section className="w-full py-12 sm:py-16 bg-slate-50/70 border-t border-slate-200/80">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Everything you need to know about buying books, digital e-books,
            delivery timelines, and secure payments on Nepsole.
          </p>
        </div>

        {/* Accordion FAQ List */}
        <div className="max-w-3xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <Accordion
              type="single"
              collapsible
              defaultValue="item-1"
              className="space-y-3"
            >
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                No matching questions found
              </h3>
              <p className="text-xs text-slate-500">
                Try searching with different keywords or browse our categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
