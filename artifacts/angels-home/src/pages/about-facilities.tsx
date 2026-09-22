import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { motion } from "framer-motion";
import { useFacilityPhotos } from "@/lib/use-site-data";
import { resolveImageUrl } from "@/lib/image-url";

interface FacilityPhoto {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export default function AboutFacilities() {
  const { data: photos } = useFacilityPhotos();

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="시설 둘러보기"
        breadcrumb={[{ name: "기관소개", href: "/about/intro" }, { name: "시설 둘러보기", href: "/about/facilities" }]}
      />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-12">

          <div className="text-center max-w-5xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-6">편안한 보금자리</h2>
            <p className="text-lg text-muted-foreground">
              <span className="md:whitespace-nowrap">
                경기도 천사의집은 한부모가족의 건강한 자립과 아기들의 안전한 양육을 위해 최고의 시설과 환경을 유지하고 있습니다.
              </span>
              <br />
              내 집처럼 편안하게 지낼 수 있도록 세심한 부분까지 정성을 다해 관리합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(photos ?? []).map((fac: FacilityPhoto, idx: number) => (
              <motion.div
                key={fac.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(idx * 0.1, 0.6) }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border/50 group hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={resolveImageUrl(fac.imageUrl)}
                    alt={fac.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold">{fac.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
