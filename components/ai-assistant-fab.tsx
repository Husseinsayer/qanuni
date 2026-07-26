"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function AiAssistantFab() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <Link
        href="/chat"
        className="group flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-white shadow-lg shadow-accent/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-accent/30"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-bold">المساعد القانوني</span>
      </Link>
    </motion.div>
  );
}
