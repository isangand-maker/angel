import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Button } from "@/components/ui/button";
import { Download, ShieldAlert } from "lucide-react";
import appIconUrl from "@assets/app_icon.png";

const APK_URL = "/uploads/app/angelshome.apk";

export default function AppDownload() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="모바일 앱 다운로드"
        breadcrumb={[{ name: "모바일 앱 다운로드", href: "/app/download" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-2xl">
          <div className="bg-white border border-border/50 rounded-2xl p-8 md:p-12 text-center space-y-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-sm">
              <img src={appIconUrl} alt="경기도 천사의집 앱 아이콘" className="w-full h-full object-cover" />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">경기도 천사의집 안드로이드 앱</h2>
              <p className="text-muted-foreground">
                아래 버튼을 눌러 APK 파일을 내려받은 뒤, 설치를 진행해 주세요.
              </p>
            </div>

            <Button asChild size="lg" className="rounded-full px-10 text-lg h-14">
              <a href={APK_URL} download>
                <Download className="mr-2" size={20} />
                APK 다운로드
              </a>
            </Button>

            <div className="bg-secondary/40 rounded-xl p-5 text-left flex gap-3">
              <ShieldAlert className="text-primary shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1">설치 시 안내</p>
                <p>
                  플레이스토어가 아닌 파일로 직접 설치하는 앱이라 "출처를 알 수 없는 앱" 설치 허용이
                  필요할 수 있습니다. 설치 중 안내가 뜨면 <strong>설정 &gt; 이 출처 허용</strong>을
                  눌러 진행해 주세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
