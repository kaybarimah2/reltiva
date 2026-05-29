"use client";

import React from "react";
import Link from "next/link";


export default function Footer() {
  return (
    <>
      <footer className="bg-brand-navy text-gray-300 font-sans pt-16 pb-8 border-t border-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Logo & Tagline */}
            <div className="md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <svg className="h-8 w-8 transition-transform group-hover:scale-105" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L16 4L26 12V28H21V18H11V28H6V12Z" fill="#ffffff" />
                  <path d="M16 4L26 12V18L16 10L6 18V12L16 4Z" fill="#00ad80" />
                  <circle cx="16" cy="14" r="3.5" fill="#262637" />
                </svg>
                <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-brand-green transition-colors">
                  Reltiva
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                The leading property platform in Ghana. Finding your next home, apartment, commercial space, or land made happy, transparent, and direct.
              </p>
            </div>

            {/* Column 2: Search */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Search
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/search?type=SALE" className="hover:text-brand-green transition-colors">
                    Properties for sale
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=RENT" className="hover:text-brand-green transition-colors">
                    Properties to rent
                  </Link>
                </li>
                <li>
                  <Link href="/new-homes" className="hover:text-brand-green transition-colors">
                    New homes & developments
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=SALE&propertyType=LAND" className="hover:text-brand-green transition-colors">
                    Land listings in Ghana
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Reltiva */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Reltiva
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/about" className="hover:text-brand-green transition-colors">
                    About Reltiva
                  </Link>
                </li>
                <li>
                  <Link href="/agents" className="hover:text-brand-green transition-colors">
                    Verified Agents
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-green transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-brand-green transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Professional & Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Professional
              </h3>
              <ul className="space-y-2.5 text-sm mb-4">
                <li>
                  <Link href="/dashboard/agent" className="hover:text-brand-green transition-colors">
                    Agent Portal & Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-brand-green transition-colors">
                    Sign in to Account
                  </Link>
                </li>
              </ul>
              <div className="flex gap-4">
                <a href="#" className="hover:text-brand-green transition-colors text-gray-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="hover:text-brand-green transition-colors text-gray-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="hover:text-brand-green transition-colors text-gray-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="hover:text-brand-green transition-colors text-gray-400">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Reltiva Limited. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:underline hover:text-brand-green">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline hover:text-brand-green">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="hover:underline hover:text-brand-green">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/233241234567?text=Hello%20Reltiva,%20I%20am%20interested%20in%20a%20property%20on%2520your%2520website."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 bg-brand-green hover:bg-brand-green-hover text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none"
        title="Chat with us on WhatsApp"
      >
        <span className="absolute right-16 bg-brand-navy text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-xl whitespace-nowrap">
          Chat on WhatsApp
        </span>
        <svg
          className="h-7 w-7 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 2C6.493 2 2 6.478 2 12.016c0 1.77.46 3.493 1.332 5.025l-1.417 5.163 5.302-1.391c1.47.801 3.127 1.223 4.814 1.223 5.538 0 10.031-4.478 10.031-10.016C22.062 6.478 17.568 2 12.031 2zm0 18.375c-1.515 0-3.003-.406-4.303-1.176l-.308-.183-3.203.84.856-3.117-.2-.319c-.845-1.343-1.291-2.903-1.291-4.504 0-4.636 3.784-8.411 8.449-8.411 4.664 0 8.448 3.775 8.448 8.411 0 4.637-3.784 8.46-8.449 8.46zM15.42 12.87c-.267-.134-1.58-.781-1.826-.87-.247-.09-.427-.134-.606.134-.18.267-.696.87-.852 1.047-.156.177-.312.2-.579.066-.267-.134-1.127-.416-2.148-1.325-.794-.707-1.33-1.581-1.486-1.849-.156-.267-.017-.412.117-.545.121-.12.267-.312.4-.469.134-.156.178-.267.267-.446.09-.178.045-.335-.022-.469-.067-.134-.606-1.46-.83-1.996-.219-.526-.459-.452-.63-.46-.164-.008-.352-.01-.54-.01s-.494.07-.753.352c-.259.282-1.008.986-1.008 2.404s1.034 2.791 1.178 2.984c.144.193 2.037 3.111 4.933 4.364.689.298 1.227.476 1.646.608.692.221 1.322.19 1.82.115.556-.083 1.58-.646 1.802-1.238.222-.593.222-1.103.156-1.21-.067-.107-.247-.174-.514-.308z" />
        </svg>
      </a>
    </>
  );
}
