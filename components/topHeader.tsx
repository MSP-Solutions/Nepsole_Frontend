import React from "react";
import {
  MapPin,
  ShieldCheck,
  Info,
  Headphones,
  Truck,
  Store,
} from "lucide-react";

const TopHeader = () => {
  return (
    <div className="w-full bg-[#0F2557] text-white">
      <div className="mx-auto flex min-h-[28px] max-w-[1400px] items-center justify-between px-3 sm:px-4 py-1 sm:py-0 text-sm font-normal">
        {/* Left Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} strokeWidth={1.8} className="shrink-0" />
            <span className="truncate">Delivering all over Nepal</span>
          </div>

          <div className="hidden sm:block h-3 w-px bg-white/30" />

          <div className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck size={11} strokeWidth={1.8} className="shrink-0" />
            <span>100% Original Books</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="#"
            className="hidden md:flex items-center gap-1.5 px-2 transition-colors hover:text-gray-300"
          >
            <Info size={11} strokeWidth={1.8} />
            <span>About Us</span>
          </a>

          <div className="hidden md:block h-3 w-px bg-white/30" />

          <a
            href="#"
            className="hidden sm:flex items-center gap-1.5 px-2 transition-colors hover:text-gray-300"
          >
            <Headphones size={11} strokeWidth={1.8} />
            <span>Help & Support</span>
          </a>

          <div className="hidden sm:block h-3 w-px bg-white/30" />

          <a
            href="#"
            className="hidden sm:flex items-center gap-1.5 px-2 transition-colors hover:text-gray-300"
          >
            <Truck size={11} strokeWidth={1.8} />
            <span>Track Order</span>
          </a>

          <div className="hidden sm:block h-3 w-px bg-white/30" />

          <a
            href="#"
            className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 transition-colors hover:text-gray-300"
          >
            <Store size={11} strokeWidth={1.8} className="shrink-0" />
            <span className="whitespace-nowrap">Sell on Nepsole</span>

            {/* New Badge */}
            <span className="ml-0.5 rounded-[3px] bg-[#FF8A00] px-1 py-[1px] text-[7px] font-semibold leading-none text-white">
              New
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;