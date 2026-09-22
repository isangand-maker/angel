import React from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface SubpageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb: { name: string; href: string }[];
}

export const SubpageHeader = ({ title, subtitle, breadcrumb }: SubpageHeaderProps) => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-secondary/40">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-background blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">홈</Link>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={14} className="opacity-50" />
                {idx === breadcrumb.length - 1 ? (
                  <span className="text-foreground">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">{crumb.name}</Link>
                )}
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-4">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  );
};
