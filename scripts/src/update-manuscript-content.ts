import { db, siteSettingsTable, faqsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function upsertSetting(key: string, value: unknown) {
  const [existing] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
  if (existing) {
    await db.update(siteSettingsTable).set({ value: value as object }).where(eq(siteSettingsTable.key, key));
    console.log(`updated setting "${key}"`);
  } else {
    await db.insert(siteSettingsTable).values({ key, value: value as object });
    console.log(`inserted setting "${key}"`);
  }
}

async function main() {
  await upsertSetting("greeting_page", {
    quote: "섬김과 나눔으로 희망을 이어갑니다.",
    content:
      "경기도 천사의집 홈페이지를 찾아주신 여러분을 진심으로 환영합니다.\n\n" +
      "경기도 천사의집은 2004년부터 한부모가족과 함께하며 새로운 시작을 응원해 왔습니다. 현재는 양육지원시설과 위기임산부 지역상담기관을 운영하며, 위기임산부와 자립을 준비하는 한부모가족의 곁을 지키고 있습니다.\n\n" +
      "편안한 마음으로 자신의 이야기를 나누고, 희망을 만들어 갈 수 있는 든든한 공간이 되고자 합니다.\n\n" +
      "변함없는 마음으로 도움이 필요한 분들의 곁을 지키며 신뢰받는 기관이 되겠습니다.\n\n" +
      "감사합니다.",
    signatureTitle: "직원 일동",
    signatureName: "",
  });

  await upsertSetting("about_mission", {
    missionTitle: "미션 (Mission)",
    missionText: "섬김과 나눔으로 위기임산부와 한부모가족의 새로운 시작을 함께합니다.",
    visionTitle: "비전 (Vision)",
    visionText: "생명을 존중하고 한부모가족의 자립을 응원하는 든든한 동반자",
  });

  await upsertSetting("org_founding", {
    operator: "낙원복지재단",
    story:
      "시작은 갈 곳 없는 엄마와 아이들을 위한 작은 공간이었습니다.\n\n" +
      "동두천은 오랜 시간 미군기지와 함께 성장하며 다양한 복지적 돌봄이 필요한 이웃들이 함께 살아온 도시입니다. 이러한 지역사회의 필요를 가까이에서 바라보며 낙원교회는 갈 곳 없는 엄마와 아이들이 안전하게 머물 수 있도록 교회 공간을 내어주었습니다. 그 작은 섬김이 오늘날 '경기도 천사의집'의 시작이 되었습니다.\n\n" +
      "2004년부터 시작된 경기도 천사의집은 한부모가족의 안정적인 생활과 자립을 지원해 왔으며, 현재는 양육지원시설과 위기임산부 지역상담기관을 함께 운영하여 위기임산부부터 자녀를 양육하는 한부모가족까지 상담부터 보호, 자립 지원을 아우르는 통합적인 서비스를 제공하고 있습니다.\n\n" +
      "경기도 천사의집은 앞으로도 섬김과 나눔의 정신을 바탕으로 도움이 필요한 분들의 든든한 울타리가 되어, 희망을 함께 만들어 가겠습니다.",
    values: ["섬김", "나눔", "존중", "신뢰", "동행"],
  });

  await upsertSetting("admission_info", {
    target: "6세 미만의 영유아를 양육하는 한부모 (모자가정)",
    period: "3년 이내 (입소기간 연장기준에 부합할 경우 6개월 단위로 연장하여 최대 4년 가능)",
    documents: ["입소 신청서 (기관방문 작성)", "주민등록등본", "가족관계증명서", "혼인관계증명서", "한부모가족증명서"],
  });

  await upsertSetting("support_services", [
    {
      title: "생활지원",
      desc: "서로를 존중하고 배려하는 공동체 안에서 안정적인 생활을 이어갈 수 있도록 일상 전반을 지원합니다. 건강한 생활 습관을 형성하고, 행복한 공동체 문화를 만들어갈 수 있도록 함께합니다.",
      items: ["의·식·주 지원", "일상생활 교육", "생일 등 기념행사 지원"],
    },
    {
      title: "상담지원",
      desc: "개별상담과 집단상담, 심리치료 프로그램을 통해 심리적 안정과 정서적 회복을 지원합니다. 자신을 이해하고 긍정적인 관계를 형성하며 건강한 가족으로 성장할 수 있도록 함께합니다.",
      items: ["전문심리검사", "개별상담", "집단상담"],
    },
    {
      title: "양육지원",
      desc: "엄마와 아이가 건강하고 행복하게 성장할 수 있도록 출산부터 영유아 양육까지 단계별 맞춤형 지원을 제공합니다. 부모의 양육 역량을 강화하고 안정적인 양육환경을 조성하여 건강한 가족의 성장을 함께합니다.",
      items: ["출산 및 양육용품 지원", "신생아 돌봄 및 양육코칭", "단계별 개별 양육지도", "백일·돌 축하행사", "성장앨범(백일) 촬영 지원", "아이돌봄서비스 연계 및 지원"],
    },
    {
      title: "교육 및 정서문화지원",
      desc: "다양한 교육과 문화·체험활동을 통해 건강한 부모 역할과 사회적 역량을 키우고, 가족 간 유대감을 높이며 행복한 일상을 만들어갈 수 있도록 지원합니다.",
      items: ["인권·성·아동학대예방·부모·자립 및 경제·안전교육", "문화공연 관람", "가족 나들이", "계절 캠프"],
    },
    {
      title: "자립지원",
      desc: "안정적인 사회구성원으로 성장할 수 있도록 자립역량 강화와 취업 지원 프로그램을 운영합니다. 경제적 자립 기반을 마련하고 성공적인 사회정착을 위한 맞춤형 지원을 제공합니다.",
      items: ["자격증 취득 지원", "취업박람회 참여", "취업역량 강화 교육", "면접 준비 및 취업 컨설팅", "만기퇴소 자립계획 수립", "만기퇴소 자립축하금 지원"],
    },
    {
      title: "의료지원",
      desc: "안전한 임신과 출산, 그리고 산후 회복까지 체계적인 의료서비스를 받을 수 있도록 지원합니다. 산모와 영유아의 맞춤형 의료지원과 교육을 제공하고, 지속적인 건강관리를 통해 행복한 일상을 이어갈 수 있도록 지원합니다.",
      items: ["산전 정기검진 및 병원 진료 지원", "임신·출산 건강상담", "분만 준비교육", "산후 건강관리 및 병원 진료 지원", "산후조리 및 회복 지원", "영유아 건강관리 및 검진 연계", "응급상황 발생 시 의료기관 연계"],
    },
  ]);

  await upsertSetting("donation_info", {
    bankName: "농협",
    accountNumber: "301-0083-5521-71",
    accountHolder: "경기도 천사의집",
  });

  // Replace FAQ content with the real Q&A from the 26.07.27 manuscript
  await db.delete(faqsTable);
  const faqs = [
    { question: "입소 후 외출이나 외박이 가능한가요?", answer: "외출은 자유롭게 가능합니다. 다만, 양육모와 아동의 안전 및 공동생활을 위해 귀가 시간이 정해져 있습니다. 주말 및 공휴일 외박을 희망하시는 경우에는 담당 사회복지사에게 사전에 말씀해 주시면 됩니다." },
    { question: "입소 시 비용이 발생하나요?", answer: "입소 비용은 무료입니다. 입소 기간 동안 엄마와 아기의 기본적인 의·식·주를 비롯한 생활에 필요한 지원을 제공합니다." },
    { question: "이혼한 경우에도 입소할 수 있나요?", answer: "네, 가능합니다. 이혼 경력이 있더라도 「한부모가족지원법」에 따른 한부모가족증명서 발급 대상에 해당하는 경우 입소하실 수 있습니다." },
    { question: "가족이나 지인이 기관을 방문할 수 있나요?", answer: "다른 양육모와 아동이 함께 생활하는 공간의 특성상 생활관 내 방문은 제한됩니다. 가족이나 지인과의 만남은 외출 시 기관 인근의 외부 장소에서 이루어지도록 안내해 드리고 있습니다." },
    { question: "직장이나 학교를 다니면서도 입소할 수 있나요?", answer: "네, 가능합니다. 입소 후에도 직장에 다니거나 학업을 이어갈 수 있으며, 안정적으로 자립과 양육을 병행할 수 있도록 담당 사회복지사가 함께 상담하고 지원해 드립니다. 공동생활 규정을 준수하는 범위 내에서 근무 및 학업 일정을 조율하여 생활하실 수 있습니다." },
  ];
  for (let i = 0; i < faqs.length; i++) {
    await db.insert(faqsTable).values({ ...faqs[i]!, sortOrder: i });
  }
  console.log(`replaced faqs with ${faqs.length} real entries`);

  console.log("done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
