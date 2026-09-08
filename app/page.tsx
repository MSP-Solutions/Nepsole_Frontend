import TopHeader from "@/components/topHeader";
import React from "react";
import Footer from "@/components/footer";
import Headers from "@/components/header";
import Hero from "@/components/hero";
import Books from "@/components/books";
import Terms from "@/components/terms";
import Ebooks from "@/components/ebooks";
import Authors from "@/components/authors";
import Testmonial from "@/components/testmonials";
import Faq from "@/components/faq";
import TrendingBooks from "@/components/trendingBooks";
const page = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] overflow-x-clip w-full">
      <TopHeader />
      <Headers />
      <main className="flex-1 w-full">
        <Hero />
        <TrendingBooks />
        <Books />
        <Ebooks />
        <Authors />
        <Terms />
        <Faq />
        <Testmonial />
      </main>
      <Footer />
    </div>
  );
};

export default page;
