import React from "react";
import {
  BookOpen,
  FileText,
  UserRound,
  CircleHelp,
  BarChart3,
  GraduationCap,
  Heart,
  Mountain,
  PenTool,
  BookMarked,
  Plane,
  ChevronRight,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
} from "lucide-react";

const categories = [
  { name: "Fiction", icon: BookOpen },
  { name: "Non-Fiction", icon: FileText },
  { name: "Biography", icon: UserRound },
  { name: "Self Help", icon: CircleHelp },
  { name: "Business & Economics", icon: BarChart3 },
  { name: "Children's Books", icon: UserRound },
  { name: "Science & Technology", icon: BookOpen },
  { name: "Education", icon: GraduationCap },
  { name: "Health & Fitness", icon: Heart },
  { name: "Nepali Literature", icon: Mountain },
  { name: "Religious & Spirituality", icon: BookMarked },
  { name: "Travel & Maps", icon: Plane },
  { name: "Poetry & Drama", icon: PenTool },
];

const features = [
  {
    icon: ShieldCheck,
    title: "100% Original",
    subtitle: "Genuine Books",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    subtitle: "All Over Nepal",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    subtitle: "100% Safe & Secure",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    subtitle: "7 Days Easy Return",
  },
];

const Hero = () => {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-3 py-3">
      <div className="flex gap-3">
        {/* ================= LEFT CATEGORY SIDEBAR ================= */}
        <aside className="hidden lg:block w-[150px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 px-3 py-2 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Shop by Category
            </h2>
          </div>

          {/* Categories */}
          <div className="divide-y divide-gray-100">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.name}
                  className="group flex w-full items-center justify-between px-2.5 py-[6px] text-left transition hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Icon
                      size={11}
                      strokeWidth={1.5}
                      className="shrink-0 text-gray-500 group-hover:text-[#1749A0]"
                    />

                    <span className="truncate text-[8px] font-medium text-gray-600 group-hover:text-[#1749A0]">
                      {category.name}
                    </span>
                  </div>

                  <ChevronRight
                    size={10}
                    className="shrink-0 text-gray-300 group-hover:text-[#1749A0]"
                  />
                </button>
              );
            })}

            {/* View All */}
            <button className="flex w-full items-center gap-1.5 px-2.5 py-2 text-[8px] font-semibold text-[#1749A0] hover:bg-blue-50 transition-colors">
              <BookOpen size={11} />
              <span>View All Categories</span>
              <ChevronRight size={10} className="ml-auto" />
            </button>
          </div>
        </aside>

        {/* ================= HERO MAIN ================= */}
        <div className="relative min-h-[360px] sm:min-h-[355px] flex-1 overflow-hidden rounded-lg bg-[#071020] flex flex-col justify-between">
          {/* Background visuals */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_55%,rgba(30,48,75,0.7),transparent_45%)]" />

            {/* Decorative shape */}
            <div className="absolute right-[15%] sm:right-[25%] top-[20%] h-[120px] w-[180px] rounded-full bg-[#111d32] opacity-40 blur-[2px]" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#071020] via-[#071020]/90 to-[#071020]/40" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex min-h-[220px] sm:h-[250px] items-center px-4 sm:px-8 py-6">
            <div className="max-w-[420px]">
              <h1 className="text-xl sm:text-2xl md:text-[29px] font-extrabold leading-[1.2] sm:leading-[1.15] tracking-tight text-white">
                पढ्ने बानी, सफलताको
                <br />
                <span className="text-[#F59E0B]">पहिलो पाइला ।</span>
              </h1>

              <p className="mt-3 sm:mt-4 max-w-[350px] text-xs sm:text-[9px] leading-relaxed text-gray-300">
                Explore Thousands of Books, E-books & Audiobooks
                <br className="hidden sm:inline" />
                All in One Place.
              </p>
            </div>

            {/* Right Promo Banner */}
            <div className="absolute right-6 sm:right-12 top-10 sm:top-[105px] hidden md:block h-[118px] w-[80px] border-l-[3px] border-[#2774E8] bg-[#06101F] shadow-lg">
              <div className="flex h-full flex-col items-center justify-center p-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#082969] text-center p-1">
                  <span className="text-[7px] font-bold leading-tight text-white">
                    किताबलाई
                    <br />
                    घरमै लैजानुहोस्
                  </span>
                </div>

                <span className="mt-2 text-[6px] font-medium text-gray-400">
                  Nepsole
                </span>
              </div>
            </div>
          </div>

          {/* ================= FEATURE BAR ================= */}
          <div className="relative z-10 w-full bg-[#061020]/95 border-t border-gray-800/60 px-4 sm:px-8 py-3 sm:py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-center">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-gray-500/60 bg-[#172235]">
                      <Icon
                        size={13}
                        strokeWidth={1.5}
                        className="text-white"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-sm font-bold text-white truncate">
                        {feature.title}
                      </p>

                      <p className="mt-0.5 text-[7px] sm:text-[8px] text-gray-400 truncate">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider Dots */}
            <div className="mt-3 flex items-center justify-center gap-1">
              <span className="h-1 w-4 rounded-full bg-[#2879F0]" />
              <span className="h-1 w-1 rounded-full bg-gray-500" />
              <span className="h-1 w-1 rounded-full bg-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;