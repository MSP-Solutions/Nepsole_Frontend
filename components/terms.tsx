import React from "react";
import {
  BadgeCheck,
  Truck,
  RotateCcw,
  WalletCards,
  CircleDollarSign,
} from "lucide-react";

const terms = () => {
  const features = [
    {
      icon: BadgeCheck,
      title: "100% Original Books",
      subtitle: "Genuine & Authentic",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      subtitle: "Across Nepal",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      subtitle: "7 Days Return Policy",
    },
    {
      icon: WalletCards,
      title: "Secure Payment",
      subtitle: "100% Safe & Secure",
    },
    {
      icon: CircleDollarSign,
      title: "Best Price Guarantee",
      subtitle: "Unbeatable Prices",
    },
  ];

  return (
    <div>
      {/* Trust Features */}
      <section className="border-b border-slate-100 bg-white px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-2 md:grid-cols-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`
                    flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5
                    transition-colors hover:bg-slate-50
                    ${
                      index !== features.length - 1
                        ? "border-slate-100 md:border-r"
                        : ""
                    }
                    ${index === 1 ? "border-t sm:border-t-0" : ""}
                    ${index === 2 ? "border-t md:border-t-0" : ""}
                    ${index === 3 ? "border-t sm:border-t-0" : ""}
                    ${
                      index === 4
                        ? "col-span-2 border-t md:col-span-1 md:border-t-0"
                        : ""
                    }
                  `}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#172B5B] sm:h-11 sm:w-11">
                    <Icon
                      size={22}
                      strokeWidth={1.8}
                      className="sm:h-[23px] sm:w-[23px]"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-[11px] font-bold text-slate-800 sm:text-xs">
                      {feature.title}
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default terms;
