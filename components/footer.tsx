import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white text-slate-600 font-sans">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 pt-10 sm:pt-12 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-1 flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 6L16 10M16 6L12 10" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg leading-tight">Nepsole</div>
                <div className="text-sm text-slate-400 font-medium">Books, Knowledge & Beyond</div>
              </div>
            </div>

            <div className="text-sm text-slate-400 leading-relaxed space-y-1 max-w-sm">
              <p>Your trusted online bookstore for books, e-books, and audiobooks.</p>
              <p>Books, Knowledge & Beyond</p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors text-sm font-semibold">
                f
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors text-sm font-semibold">
                in
              </a>
              <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors text-sm">
                ▶
              </a>
              <a href="#" aria-label="TikTok/Twitter" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors text-sm">
                ♪
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Return & Refund Policy</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 sm:mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Help & Support</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">My Account</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Wishlist</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Bulk Order</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          {/* Col 4: My Account */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 sm:mb-4">My Account</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Login / Register</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Orders</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">E-books Library</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Addresses</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Payment Methods</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Loyalty Points</a></li>
            </ul>
          </div>

          {/* Col 5: Popular Categories */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 sm:mb-4">Popular Categories</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Fiction</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Biography</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Self Help</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Business & Economics</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Children's Books</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Nepal Literature</a></li>
            </ul>
          </div>

          {/* Col 6: Download Our App */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Download Our App</h4>
            <p className="text-sm text-slate-400 mb-4">Read Books Anywhere, Anytime!</p>

            <div className="flex flex-col gap-2.5">
              <a href="#" className="inline-flex items-center gap-3 bg-[#0B132B] hover:bg-[#1E293B] text-white py-2.5 px-4 rounded-xl transition-colors shadow-sm w-full max-w-[200px]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186c-.185-.205-.298-.476-.298-.775V2.589c0-.299.113-.57.298-.775zM14.923 13.131l2.424 2.424-11.455 6.643 9.031-9.067zM14.923 10.869L5.892 1.802l11.455 6.643-2.424 2.424zM16.054 12l2.846-1.649c.563-.326.563-.858 0-1.184L16.054 12z" />
                </svg>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] text-slate-300 uppercase tracking-wider font-medium">GET IT ON</span>
                  <span className="text-sm font-semibold text-white">Google Play</span>
                </div>
              </a>

              <a href="#" className="inline-flex items-center gap-3 bg-[#0B132B] hover:bg-[#1E293B] text-white py-2.5 px-4 rounded-xl transition-colors shadow-sm w-full max-w-[200px]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.14 1.86-.99 2.96 1.08.08 2.16-.55 2.81-1.36z" />
                </svg>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[9px] text-slate-300 font-medium">Download on the</span>
                  <span className="text-sm font-semibold text-white">App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-12 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 gap-4">
          <div className="text-center sm:text-left">
            © 2025 <span className="text-blue-600 font-bold">Nepsole</span>. All Rights Reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 text-slate-600 font-semibold rounded text-[11px] border border-gray-200/60">
              eSewa
            </span>
            <span className="px-3 py-1 bg-gray-100 text-slate-600 font-semibold rounded text-[11px] border border-gray-200/60">
              FonePay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
