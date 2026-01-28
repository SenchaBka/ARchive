"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, LogIn, UserPlus, X, User, MapPin, LogOut } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Logo } from "./logo";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useUser();

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-[100] px-4 py-4"
        style={{ 
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}
      >
        <div className="mx-auto flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Logo
              height={32}
              className="transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Menu className="w-5 h-5" style={{ color: "#ffffff" }} />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100]"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[101] flex flex-col w-full sm:w-80 transition-transform duration-300 ease-out"
        style={{
          backgroundColor: "rgba(0,0,0,0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)"
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center">
            <Logo height={24} />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          >
            <X className="w-5 h-5" style={{ color: "#ffffff" }} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2 p-4">
          {!isLoading && user && (
            <Link
              href="/posts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Posts</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Explore nearby stories
                </span>
              </div>
            </Link>
          )}

          {!isLoading && user && (
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Profile</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  View your profile
                </span>
              </div>
            </Link>
          )}

          <div className="my-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }} />

          {!isLoading && !user && (
            <>
              <a
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Log in</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Access your account
                  </span>
                </div>
              </a>

              <a
                href="/auth/login?screen_hint=signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Sign up</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Create a new account
                  </span>
                </div>
              </a>
            </>
          )}

          {!isLoading && user && (
            <a
              href="/auth/logout"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Sign out</span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Log out of your account
                </span>
              </div>
            </a>
          )}
        </div>

        {/* Footer */}
        <div 
          className="mt-auto p-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
            Discover stories anchored to places
          </p>
        </div>
      </div>
    </>
  );
}
