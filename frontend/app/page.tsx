"use client";

import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { HeroVideo } from "@/components/HeroVideo";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Appbar />
      <div className="flex-1">
          <Hero />
          <div className="pt-8 pb-20 px-4">
            <HeroVideo />
          </div>
      </div>
      <Footer />
    </main>
  );
}