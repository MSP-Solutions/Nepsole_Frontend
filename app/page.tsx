import TopHeader from '@/components/topHeader'
import React from 'react'
import Footer from '@/components/footer'
import Headers from '@/components/header'
import Hero from '@/components/hero'
import TrendingBooks from '@/components/trendingBooks'
const page = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] overflow-x-hidden w-full">
      <TopHeader />
      <Headers />
      <main className="flex-1 w-full">
        <Hero />
        <TrendingBooks />
      </main>
      <Footer />
    </div>
  )
}

export default page
