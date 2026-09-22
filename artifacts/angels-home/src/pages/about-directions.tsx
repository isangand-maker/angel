import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { MapPin, Phone, Bus, Train } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/use-site-data";

const DEFAULT_CONTACT = {
  address: "(11343) 경기도 동두천시 생연로 39-74",
  phone: "031-864-2004",
  fax: "031-867-2003",
  email: "angel8642004@hanmail.net",
};

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY ?? "d3fbb6f131d27b8650f1571d6ad64450";

declare global {
  interface Window {
    kakao?: any;
  }
}

function loadKakaoMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const existing = document.getElementById("kakao-maps-sdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => window.kakao.maps.load(() => resolve()));
      return;
    }
    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("카카오맵 스크립트를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

function useKakaoMap(address: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadKakaoMapsScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address.replace(/^\([0-9]+\)\s*/, ""), (result: any[], geoStatus: string) => {
          if (cancelled) return;
          if (geoStatus !== window.kakao.maps.services.Status.OK || !result[0]) {
            setStatus("error");
            return;
          }
          const coords = new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
          const map = new window.kakao.maps.Map(containerRef.current, { center: coords, level: 3 });
          new window.kakao.maps.Marker({ map, position: coords });
          setStatus("ready");
        });
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { containerRef, status };
}

export default function AboutDirections() {
  const { data: settings } = useSiteSettings();
  const contact = { ...DEFAULT_CONTACT, ...(settings?.footer_contact ?? {}) };
  const mapSearchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(contact.address)}`;
  const { containerRef, status } = useKakaoMap(contact.address);
  const addressMatch = contact.address.match(/^(\(\d+\))\s*(.*)$/);
  const addressZip = addressMatch?.[1];
  const addressRest = addressMatch?.[2] ?? contact.address;

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="찾아오시는 길"
        breadcrumb={[{ name: "기관소개", href: "/about/intro" }, { name: "찾아오시는 길", href: "/about/directions" }]}
      />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">

          {/* Warning Banner */}
          <div className="bg-destructive/10 border-l-4 border-destructive p-6 rounded-r-lg mb-12">
            <h3 className="text-destructive font-bold text-lg mb-2">방문 안내</h3>
            <p className="text-foreground/80">
              천사의집은 입소자들의 안전과 사생활 보호를 최우선으로 합니다.
              사전 예약 없이 방문하실 경우 출입이 제한될 수 있으니,
              <br />
              <strong>반드시 사전에 전화({contact.phone})로 상담 예약을 진행해 주시기 바랍니다.</strong>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Map */}
            <div className="lg:col-span-2 h-full">
              <div className="relative bg-secondary/30 rounded-3xl w-full h-full min-h-[460px] overflow-hidden border border-border/50">
                <div ref={containerRef} className="w-full h-full" />
                {status !== "ready" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 pointer-events-none">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto mb-4 text-primary" />
                      <p className="font-semibold text-foreground mb-1 break-keep px-6">{addressRest}</p>
                      {status === "loading" && <p className="text-sm text-muted-foreground">지도를 불러오는 중입니다...</p>}
                      {status === "error" && <p className="text-sm text-muted-foreground">지도를 표시할 수 없습니다. 아래 버튼을 이용해 주세요.</p>}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                  <Button asChild className="rounded-full shadow-lg">
                    <a href={mapSearchUrl} target="_blank" rel="noopener noreferrer">카카오맵에서 길찾기</a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="h-full">
              <Card className="h-full border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="text-primary" size={18} />
                      </div>
                      <h4 className="font-bold text-base">주소</h4>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground leading-relaxed break-keep">
                        {addressZip && <span className="text-muted-foreground/60 block mb-0.5">{addressZip}</span>}
                        {addressRest}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="text-primary" size={18} />
                      </div>
                      <h4 className="font-bold text-base">연락처</h4>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="space-y-1.5 text-sm mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-muted-foreground">입소상담</span>
                          <span className="text-foreground">{contact.phone}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-muted-foreground">팩스</span>
                          <span className="text-foreground">{contact.fax}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground block mb-0.5">이메일</span>
                        <span className="text-foreground whitespace-nowrap">{contact.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Transit Info */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8">교통편 안내</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm">
                <Train className="text-primary w-10 h-10 mb-4" />
                <h4 className="font-bold text-lg mb-4">지하철 이용시</h4>
                <ul className="text-muted-foreground space-y-2 list-disc list-outside pl-5">
                  <li>1호선 지행역 2번 출구</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm">
                <Bus className="text-primary w-10 h-10 mb-4" />
                <h4 className="font-bold text-lg mb-4">버스 이용시</h4>
                <ul className="text-muted-foreground space-y-2 list-disc list-outside pl-5">
                  <li>
                    지행역 2번 출구에서 3-2번 마을버스 탑승 <span className="whitespace-nowrap">(우리은행 방면)</span>
                  </li>
                  <li>'생연중학교' 정류장 하차</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
