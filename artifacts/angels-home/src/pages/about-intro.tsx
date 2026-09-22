import React, { useLayoutEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { motion } from "framer-motion";
import {
  Heart,
  Target,
  Eye,
  Sparkles,
  UserRound,
  Baby,
  ShieldCheck,
  HandHeart,
  Home as HomeIcon,
  GraduationCap,
  Stethoscope,
} from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_MISSION = {
  missionTitle: "미션 (Mission)",
  missionText: "섬김과 나눔으로 위기임산부와 한부모가족의 새로운 시작을 함께합니다.",
  visionTitle: "비전 (Vision)",
  visionText: "생명을 존중하고 한부모가족의 자립을 응원하는 든든한 동반자",
};

const DEFAULT_FOUNDING = {
  operator: "낙원복지재단",
  story:
    "시작은 갈 곳 없는 엄마와 아이들을 위한 작은 공간이었습니다.\n\n" +
    "동두천은 오랜 시간 미군기지와 함께 성장하며 다양한 복지적 돌봄이 필요한 이웃들이 함께 살아온 도시입니다. 이러한 지역사회의 필요를 가까이에서 바라보며 낙원교회는 갈 곳 없는 엄마와 아이들이 안전하게 머물 수 있도록 교회 공간을 내어주었습니다. 그 작은 섬김이 오늘날 '경기도 천사의집'의 시작이 되었습니다.\n\n" +
    "2004년부터 시작된 경기도 천사의집은 한부모가족의 안정적인 생활과 자립을 지원해 왔으며, 현재는 양육지원시설과 위기임산부 지역상담기관을 함께 운영하여 위기임산부부터 자녀를 양육하는 한부모가족까지 상담부터 보호, 자립 지원을 아우르는 통합적인 서비스를 제공하고 있습니다.\n\n" +
    "경기도 천사의집은 앞으로도 섬김과 나눔의 정신을 바탕으로 도움이 필요한 분들의 든든한 울타리가 되어, 희망을 함께 만들어 가겠습니다.",
  values: ["섬김", "나눔", "존중", "신뢰", "동행"],
};

interface OrgTier {
  id: string;
  label: string;
}
interface OrgBranch {
  id: string;
  afterId: string;
  label: string;
}
interface OrgDepartment {
  name: string;
  roles: string[];
}

const DEFAULT_ORG_CHART: { mainChain: OrgTier[]; branches: OrgBranch[]; departments: OrgDepartment[] } = {
  mainChain: [
    { id: "director", label: "원장" },
    { id: "officeChief", label: "사무국장" },
    { id: "teamLead", label: "팀장" },
  ],
  branches: [],
  departments: [
    { name: "양육지원", roles: ["생활지도원"] },
    { name: "위기지원", roles: ["상담사", "상담사", "상담사"] },
  ],
};

// Older saved data only had { director, officeChief, teamLead, departments } — no mainChain/branches.
function normalizeOrgChart(
  raw: Record<string, any> | undefined,
): { mainChain: OrgTier[]; branches: OrgBranch[]; departments: OrgDepartment[] } {
  if (!raw) return DEFAULT_ORG_CHART;
  if (Array.isArray(raw.mainChain)) {
    return {
      mainChain: raw.mainChain as OrgTier[],
      branches: (raw.branches ?? []) as OrgBranch[],
      departments: (raw.departments ?? []) as OrgDepartment[],
    };
  }
  return {
    mainChain: [
      { id: "director", label: raw.director ?? "원장" },
      { id: "officeChief", label: raw.officeChief ?? "사무국장" },
      { id: "teamLead", label: raw.teamLead ?? "팀장" },
    ],
    branches: [],
    departments: (raw.departments ?? DEFAULT_ORG_CHART.departments) as OrgDepartment[],
  };
}

const TIER_STYLE = "bg-primary text-primary-foreground shadow-md";
const DEPT_ICONS = [Baby, ShieldCheck, HandHeart, HomeIcon, GraduationCap, Stethoscope, UserRound];
const DEPT_ICON_COLORS = [
  "bg-primary/10 text-primary",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function DepartmentChart({ departments }: { departments: OrgDepartment[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [barStyle, setBarStyle] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = wrapperRef.current;
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!wrapper || cards.length < 2) {
        setBarStyle(null);
        return;
      }
      const wrapperRect = wrapper.getBoundingClientRect();
      const centers = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return r.left + r.width / 2 - wrapperRect.left;
      });
      const left = Math.min(...centers);
      const right = Math.max(...centers);
      setBarStyle({ left, width: right - left });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [departments]);

  return (
    <div ref={wrapperRef} className="relative pt-16 mt-10">
      {/* drop line from the last tier down to the branch point */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-2 h-10 bg-primary/70 rounded-full"></div>
      {/* horizontal spreader connecting every department card, measured against actual card positions */}
      {barStyle && (
        <div
          className="hidden md:block absolute top-0 h-2 bg-primary/70 rounded-full"
          style={{ left: barStyle.left, width: barStyle.width }}
        ></div>
      )}
      <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-10">
        {departments.map((dept, idx) => {
          const DeptIcon = DEPT_ICONS[idx % DEPT_ICONS.length];
          const deptColor = DEPT_ICON_COLORS[idx % DEPT_ICON_COLORS.length];
          return (
            <div
              key={idx}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="bg-white p-8 rounded-3xl shadow-md border border-border/50 flex-1 relative mt-6 md:mt-0 text-left"
            >
              <div className="hidden md:block absolute -top-16 left-1/2 -translate-x-1/2 w-2 h-16 bg-primary/70 rounded-full"></div>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${deptColor}`}>
                  <DeptIcon size={22} />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-foreground">{dept.name}</h4>
              </div>
              <ul className="text-base md:text-lg text-muted-foreground space-y-3">
                {dept.roles.map((role, rIdx) => (
                  <li key={rIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AboutIntro() {
  const { data: settings } = useSiteSettings();
  const mission = { ...DEFAULT_MISSION, ...(settings?.about_mission ?? {}) };
  const founding = { ...DEFAULT_FOUNDING, ...(settings?.org_founding ?? {}) };
  const orgChart = normalizeOrgChart(settings?.org_chart);
  const foundingParagraphs = founding.story.split(/\n\n+/);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="천사의집 소개"
        breadcrumb={[{ name: "기관소개", href: "/about/intro" }, { name: "소개", href: "/about/intro" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12">

          {/* Founding Story Section */}
          <div className="max-w-4xl mx-auto mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">설립 이야기</h2>
              <p className="text-lg text-muted-foreground">운영법인: {founding.operator}</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 shadow-sm space-y-6 text-foreground/80 leading-loose text-lg"
            >
              {foundingParagraphs.map((p: string, i: number) => (
                <p key={i} className="whitespace-pre-line">{p}</p>
              ))}
            </motion.div>
          </div>

          {/* Mission & Vision Section */}
          <div className="max-w-5xl mx-auto mb-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">미션과 비전</h2>
              <p className="text-lg text-muted-foreground">생명을 존중하고 차별 없는 사랑을 실천합니다</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-secondary/50 rounded-3xl p-10 flex flex-col h-full"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm">
                  <Target size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{mission.missionTitle}</h3>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  {mission.missionText}
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-primary/10 rounded-3xl p-10 flex flex-col h-full"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-8 shadow-sm">
                  <Eye size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{mission.visionTitle}</h3>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  {mission.visionText}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Core Values */}
          <div className="max-w-4xl mx-auto mb-32">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">핵심 가치</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {founding.values.map((val: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 px-8 py-5 rounded-2xl border border-border/50 bg-secondary/40 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <Sparkles size={20} className="text-primary" />
                  <span className="text-xl font-bold">{val}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Organization Chart */}
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">조직도</h2>
            <div className="bg-secondary/30 rounded-3xl p-8 md:p-16 border border-border/50">
              {orgChart.mainChain.map((tier, idx) => {
                const tierBranches = orgChart.branches.filter((b) => b.afterId === tier.id);
                return (
                  <React.Fragment key={tier.id}>
                    <div className="relative flex flex-col md:flex-row items-center justify-center gap-4">
                      {tierBranches.length > 0 && (
                        <div className="hidden md:block absolute top-1/2 left-1/2 w-10 h-2 bg-chart-3/70 -translate-y-1/2 rounded-full" />
                      )}
                      <div className={`relative z-10 inline-flex items-center gap-3 font-bold rounded-2xl text-xl md:text-2xl px-8 py-4 min-w-[220px] justify-center ${TIER_STYLE}`}>
                        {tier.label}
                      </div>
                      {tierBranches.length > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="hidden md:block w-10 h-2 bg-chart-3/70 rounded-full" />
                          <div className="flex flex-wrap justify-center gap-3">
                            {tierBranches.map((b) => (
                              <div
                                key={b.id}
                                className="bg-chart-3/10 border-2 border-chart-3 text-chart-3 rounded-xl px-5 py-2.5 text-sm md:text-base font-bold shadow-sm"
                              >
                                {b.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {idx < orgChart.mainChain.length - 1 && (
                      <div className="h-8 w-2 bg-primary/70 mx-auto my-6 rounded-full"></div>
                    )}
                  </React.Fragment>
                );
              })}

              {orgChart.departments.length > 0 && <DepartmentChart departments={orgChart.departments} />}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
