"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight, Home, Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5"
        >
          <Construction className="size-12 text-accent" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          قريباً
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          هذه الخدمة قيد التطوير وستكون متاحة قريباً إن شاء الله
        </p>

        {/* Features hint */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>قريبVery Soon</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90 hover:shadow-lg"
          >
            <Home className="size-4" />
            العودة للرئيسية
          </a>
          <a
            href="/contact"
            className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold transition hover:bg-muted/50"
          >
            تواصل معنا
            <ArrowRight className="size-4" />
          </a>
        </div>

        {/* Decorative dots */}
        <div className="mt-12 flex justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="size-2 rounded-full bg-accent/30"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
