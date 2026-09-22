import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useFaqs } from "@/lib/use-site-data";

const DEFAULT_FAQS = [
  {
    id: 1,
    question: "입소 후 외출이나 외박이 가능한가요?",
    answer: "외출은 자유롭게 가능합니다. 다만, 양육모와 아동의 안전 및 공동생활을 위해 귀가 시간이 정해져 있습니다. 주말 및 공휴일 외박을 희망하시는 경우에는 담당 사회복지사에게 사전에 말씀해 주시면 됩니다.",
  },
  {
    id: 2,
    question: "입소 시 비용이 발생하나요?",
    answer: "입소 비용은 무료입니다. 입소 기간 동안 엄마와 아기의 기본적인 의·식·주를 비롯한 생활에 필요한 지원을 제공합니다.",
  },
  {
    id: 3,
    question: "이혼한 경우에도 입소할 수 있나요?",
    answer: "네, 가능합니다. 이혼 경력이 있더라도 「한부모가족지원법」에 따른 한부모가족증명서 발급 대상에 해당하는 경우 입소하실 수 있습니다.",
  },
  {
    id: 4,
    question: "가족이나 지인이 기관을 방문할 수 있나요?",
    answer: "다른 양육모와 아동이 함께 생활하는 공간의 특성상 생활관 내 방문은 제한됩니다. 가족이나 지인과의 만남은 외출 시 기관 인근의 외부 장소에서 이루어지도록 안내해 드리고 있습니다.",
  },
  {
    id: 5,
    question: "직장이나 학교를 다니면서도 입소할 수 있나요?",
    answer: "네, 가능합니다. 입소 후에도 직장에 다니거나 학업을 이어갈 수 있으며, 안정적으로 자립과 양육을 병행할 수 있도록 담당 사회복지사가 함께 상담하고 지원해 드립니다. 공동생활 규정을 준수하는 범위 내에서 근무 및 학업 일정을 조율하여 생활하실 수 있습니다.",
  },
];

export default function Faq() {
  const { data: faqs } = useFaqs();
  const faqList = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="자주 하는 질문"
        breadcrumb={[{ name: "입소상담", href: "/admission" }, { name: "자주하는 질문", href: "/faq" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-10">
            <HelpCircle className="text-primary" size={32} />
            <h2 className="text-3xl font-bold text-center">FAQ</h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqList.map((faq: { id: number; question: string; answer: string }) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`} className="bg-white border border-border/50 rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 whitespace-pre-wrap">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-20 text-center">
            <p className="text-lg mb-6 text-muted-foreground">더 궁금한 점이 있으신가요? 언제든 연락주세요.</p>
            <Button asChild size="lg" className="rounded-full px-8 text-lg bg-foreground text-background">
              <Link href="/counsel">상담 신청하기</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
