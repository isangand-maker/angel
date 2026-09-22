import { db, adminUsersTable, siteSettingsTable, facilityPhotosTable, partnerLogosTable, noticesTable, faqsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const uploadsDir = path.resolve(repoRoot, "artifacts/api-server/uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

function copyToUploads(srcRelPath: string, destName: string): string {
  const src = path.resolve(repoRoot, srcRelPath);
  const dest = path.resolve(uploadsDir, destName);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
  return `/uploads/${destName}`;
}

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "angelshome2026!";

  const [existing] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username)).limit(1);
  if (existing) {
    console.log(`admin user "${username}" already exists, skipping`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(adminUsersTable).values({ username, passwordHash });
  console.log(`created admin user "${username}" / "${password}" — change this password after first login`);
}

async function seedSettings() {
  const exteriorUrl = copyToUploads("attached_assets/facility/exterior.jpg", "seed-exterior.jpg");
  const popupUrl = copyToUploads("attached_assets/popup/popup-poster.jpg", "seed-popup-poster.jpg");

  const defaults: Record<string, unknown> = {
    home_hero: {
      badge: "위기임산부·미혼모자 보호시설",
      titleLine1: "혼자가 아닙니다.",
      titleHighlight: "당신과 아기의",
      titleLine3: "안전한 쉼터",
      description:
        "두려움과 막막함 속에서 용기 낸 당신을 환영합니다. 엔젤스홈은 출산부터 양육, 자립까지 함께 걸어가는 따뜻한 보금자리입니다.",
      heroImage: exteriorUrl,
      quote: "이곳에 오고 나서야 처음으로 푹 잘 수 있었어요.",
      statValue: "1,240+",
      statLabel: "새로운 생명의 탄생",
    },
    about_mission: {
      missionTitle: "미션 (Mission)",
      missionText:
        "위기임산부와 미혼모들이 안전한 환경에서 생명을 잉태하고 출산할 수 있도록 도우며, 신체적·심리적 안정을 통해 스스로 자립할 수 있는 기반을 마련하여 건강한 사회인으로 복귀하도록 지원합니다.",
      visionTitle: "비전 (Vision)",
      visionText:
        "미혼모와 아기가 편견 없이 존중받는 세상을 만들며, 당당한 엄마로서 희망찬 미래를 설계할 수 있도록 최고의 맞춤형 통합 복지 서비스를 제공하는 전문 기관으로 도약합니다.",
    },
    org_chart: {
      director: "원장",
      officeChief: "사무국장",
      teamLead: "팀장",
      departments: [
        { name: "양육지원", roles: ["생활지도원"] },
        { name: "위기지원", roles: ["상담사", "상담사", "상담사"] },
      ],
    },
    footer_contact: {
      orgName: "경기도 천사의집",
      bizRegNo: "127-80-09161",
      address: "(11343) 경기도 동두천시 생연로 39-74",
      phone: "031-864-2004",
      fax: "031-867-2003",
      email: "angel8642004@hanmail.net",
    },
    popup_banner: {
      enabled: true,
      imageUrl: popupUrl,
      linkUrl: "https://www.1308.or.kr",
    },
  };

  for (const [key, value] of Object.entries(defaults)) {
    const [existing] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
    if (existing) {
      console.log(`setting "${key}" already exists, skipping`);
      continue;
    }
    await db.insert(siteSettingsTable).values({ key, value: value as object });
    console.log(`seeded setting "${key}"`);
  }
}

async function seedFacilityPhotos() {
  const existing = await db.select().from(facilityPhotosTable).limit(1);
  if (existing.length > 0) {
    console.log("facility_photos already seeded, skipping");
    return;
  }

  const photos = [
    { file: "exterior.jpg", title: "시설 외관", description: "따뜻하고 아늑한 분위기의 천사의집 건물 외관입니다." },
    { file: "office-1.jpg", title: "사무실", description: "입소자 상담과 사례관리를 담당하는 사회복지사들이 상주하는 공간입니다." },
    { file: "office-2.jpg", title: "사무실", description: "행정 및 운영 업무가 이루어지는 공간입니다." },
    { file: "counseling-room.jpg", title: "상담실", description: "따뜻하고 아늑한 분위기의 상담실에서 전문 상담사와 함께 마음의 상처를 치유하고 안정을 되찾는 시간을 가집니다." },
    { file: "program-room.jpg", title: "프로그램실", description: "다양한 자립 교육, 부모 교육, 문화/예술 프로그램이 진행되는 넓고 쾌적한 다목적 공간입니다." },
    { file: "playroom.jpg", title: "놀이방", description: "아이들이 안전하고 즐겁게 뛰놀 수 있도록 꾸며진 놀이 공간입니다." },
    { file: "rooftop.jpg", title: "옥상", description: "입소자들이 바람을 쐬며 편안하게 쉴 수 있는 야외 공간입니다." },
  ];

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i]!;
    const url = copyToUploads(`attached_assets/facility/${p.file}`, `seed-facility-${p.file}`);
    await db.insert(facilityPhotosTable).values({
      title: p.title,
      description: p.description,
      imageUrl: url,
      sortOrder: i,
    });
    console.log(`seeded facility photo "${p.title}"`);
  }
}

async function seedPartners() {
  const existing = await db.select().from(partnerLogosTable).limit(1);
  if (existing.length > 0) {
    console.log("partner_logos already seeded, skipping");
    return;
  }

  const partners = [
    { file: "logo-gender-equality-family-ministry.jpg", name: "성평등가족부" },
    { file: "logo-gyeonggido.jpg", name: "경기도" },
    { file: "logo-dongducheon.jpg", name: "동두천시" },
    { file: "logo-crisis-pregnancy-center-transparent.png", name: "경기북부 위기임산부 지역상담기관" },
  ];

  for (let i = 0; i < partners.length; i++) {
    const p = partners[i]!;
    const url = copyToUploads(`attached_assets/logos/${p.file}`, `seed-${p.file}`);
    await db.insert(partnerLogosTable).values({ name: p.name, imageUrl: url, sortOrder: i });
    console.log(`seeded partner "${p.name}"`);
  }

  await db.insert(partnerLogosTable).values({ name: "낙원교회", imageUrl: null, sortOrder: partners.length });
  console.log(`seeded partner "낙원교회" (no logo yet)`);
}

async function seedNotices() {
  const existing = await db.select().from(noticesTable).limit(1);
  if (existing.length > 0) {
    console.log("notices already seeded, skipping");
    return;
  }
  await db.insert(noticesTable).values({
    title: "경기도 천사의집 홈페이지를 새롭게 단장했습니다",
    content: "위기임산부와 미혼모, 그리고 아기들을 위한 정보를 더 쉽게 찾아보실 수 있도록 홈페이지를 새롭게 개편했습니다.",
    pinned: true,
  });
  console.log("seeded notice");
}

async function seedFaqs() {
  const existing = await db.select().from(faqsTable).limit(1);
  if (existing.length > 0) {
    console.log("faqs already seeded, skipping");
    return;
  }
  const faqs = [
    { question: "입소 비용은 얼마인가요?", answer: "입소와 관련된 모든 비용(숙식, 출산, 의료비 등)은 전액 무료입니다. 경제적인 걱정 없이 안전하게 출산하고 몸을 조리하는 데 집중하실 수 있도록 지원합니다." },
    { question: "가족이나 지인에게 비밀로 하고 싶습니다.", answer: "천사의집은 입소자의 프라이버시와 안전을 최우선으로 보호합니다. 입소 사실을 포함한 모든 정보는 철저하게 비밀이 보장되며, 본인의 동의 없이 외부로 유출되지 않습니다." },
    { question: "얼마나 머물 수 있나요?", answer: "기본적으로 입소 후 1년까지 보호가 가능하며, 필요한 경우 심사를 거쳐 추가 연장이 가능합니다. 퇴소 후에도 자립지원센터를 통해 지속적인 관리를 받을 수 있습니다." },
    { question: "현재 지역이 경기도가 아닌데 입소가 가능한가요?", answer: "네, 거주지와 관계없이 도움이 필요한 미혼모라면 전국 어디서나 입소 신청 및 상담이 가능합니다. 거리 문제로 이동이 어려운 경우에도 먼저 연락 주시면 방법을 함께 찾아드리겠습니다." },
  ];
  for (let i = 0; i < faqs.length; i++) {
    await db.insert(faqsTable).values({ ...faqs[i]!, sortOrder: i });
  }
  console.log(`seeded ${faqs.length} faqs`);
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedFacilityPhotos();
  await seedPartners();
  await seedNotices();
  await seedFaqs();
  console.log("done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
