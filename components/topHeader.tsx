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
      <div
        className="
          mx-auto flex w-full max-w-[1400px] items-center
          justify-between gap-2
          px-3 py-1.5
          text-[10px] font-normal
          sm:px-4 sm:text-xs
          md:py-1
          lg:text-sm
        "
      >
        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Delivery */}
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin
              size={11}
              strokeWidth={1.8}
              className="shrink-0 sm:h-3 sm:w-3"
            />

            <span className="truncate whitespace-nowrap">
              Delivering all over Nepal
            </span>
          </div>

          {/* Divider */}
          <div className="hidden h-3 w-px shrink-0 bg-white/30 sm:block" />

          {/* Original Books */}
          <div className="hidden items-center gap-1.5 md:flex">
            <ShieldCheck
              size={11}
              strokeWidth={1.8}
              className="shrink-0"
            />

            <span className="whitespace-nowrap">
              100% Original Books
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* About Us */}
          <a
            href="#"
            className="
              hidden items-center gap-1.5
              px-1.5
              transition-colors
              hover:text-gray-300
              lg:flex
            "
          >
            <Info size={11} strokeWidth={1.8} />
            <span>About Us</span>
          </a>

          <div className="hidden h-3 w-px bg-white/30 lg:block" />

          {/* Help & Support */}
          <a
            href="#"
            className="
              hidden items-center gap-1.5
              px-1.5
              transition-colors
              hover:text-gray-300
              md:flex
            "
          >
            <Headphones size={11} strokeWidth={1.8} />
            <span className="whitespace-nowrap">
              Help & Support
            </span>
          </a>

          <div className="hidden h-3 w-px bg-white/30 md:block" />

          {/* Track Order */}
          <a
            href="#"
            className="
              hidden items-center gap-1.5
              px-1.5
              transition-colors
              hover:text-gray-300
              sm:flex
            "
          >
            <Truck size={11} strokeWidth={1.8} />
            <span className="whitespace-nowrap">
              Track Order
            </span>
          </a>

          <div className="hidden h-3 w-px bg-white/30 sm:block" />

          {/* Sell on Nepsole */}
          <a
            href="#"
            className="
              flex items-center gap-1
              pl-1
              transition-colors
              hover:text-gray-300
              sm:gap-1.5 sm:pl-2
            "
          >
            <Store
              size={11}
              strokeWidth={1.8}
              className="shrink-0 sm:h-3 sm:w-3"
            />

            <span className="whitespace-nowrap">
              Sell on Nepsole
            </span>

            {/* New Badge */}
            <span
              className="
                ml-0.5 rounded-[3px]
                bg-[#FF8A00]
                px-1 py-[1px]
                text-[6px]
                font-semibold
                leading-none
                text-white
                sm:text-[7px]
              "
            >
              New
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;