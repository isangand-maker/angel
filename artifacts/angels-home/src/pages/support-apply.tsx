import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConsentDialog } from "@/components/ConsentDialog";
import { adminApi } from "@/lib/admin-api";
import { useSiteSettings } from "@/lib/use-site-data";
import { toast } from "sonner";

const DONATION_TYPES = [
  "정기후원",
  "일시후원",
  // "물품후원",
  // "기업 및 단체후원",
];

const AMOUNT_OPTIONS = ["10000", "20000", "30000"];

const EMPTY_FORM = {
  donationType: DONATION_TYPES[0],
  paymentMethod: "cms",
  pledgeAmount: "10000",
  pledgeAmountCustom: "",
  name: "",
  birthDate: "",
  phone: "",
  address: "",
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  withdrawalDate: "",
  depositDateTime: "",
  email: "",
  message: "",
};

const CONSENT_INTRO =
  "경기도 천사의집은 후원 신청 및 후원자 관리, 기부금 영수증 발급 등을 위하여 「개인정보 보호법」에 따라 아래와 같이 개인정보를 수집·이용 및 제3자에게 제공합니다. 내용을 충분히 확인하신 후 동의 여부를 선택하여 주시기 바랍니다.";

const CONSENT_STEPS = [
  {
    stepTitle: "1. 개인정보 수집·이용 동의",
    sections: [
      {
        heading: "수집 항목",
        body: "필수: 성명(또는 단체명), 생년월일(또는 사업자등록번호), 휴대전화번호, 주소, 결제 정보(CMS 출금계좌 또는 무통장입금 계좌·입금일시 등)\n선택항목: 이메일 주소, 기타 신청자가 후원을 위해 직접 작성하거나 첨부한 내용",
      },
      {
        heading: "수집 및 이용 목적",
        body: "후원 신청 접수\n후원자 관리\n후원금 출금(CMS) 관리\n연말정산 기부금 영수증 발급\n후원 관련 안내\n소식지 발송",
      },
      {
        heading: "보유 및 이용기간",
        body: "후원 종료일로부터 5년 또는 관계 법령에서 정한 기간",
      },
      {
        heading: "동의 거부 권리",
        body: "귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수항목에 대한 동의를 거부하실 경우 후원 신청 및 CMS 자동이체 신청, 기부금 영수증 발급 등 서비스 이용이 제한될 수 있습니다.",
      },
    ],
    checkboxLabel: "개인정보 수집·이용에 동의합니다.",
  },
  {
    stepTitle: "2. 개인정보 제3자 제공 동의",
    intro: "경기도 천사의집은 후원금 관리 및 기부금 영수증 발급을 위하여 다음과 같이 개인정보를 제공합니다.",
    sections: [
      {
        heading: "국세청",
        body: "제공 항목: 성명, 생년월일(기부금 영수증 발급 시), 후원내역\n제공 목적: 기부금 영수증 발급 및 연말정산 (관련 법령에 따름)",
      },
      {
        heading: "금융결제원",
        body: "제공 항목: 성명(예금주), 생년월일, 은행명, 계좌번호\n제공 목적: CMS 관리 (후원 종료 시까지)",
      },
      {
        heading: "효성FMS",
        body: "제공 항목: 성명, 생년월일, 휴대전화번호, 은행명, 계좌번호\n제공 목적: CMS 관리 (후원 종료 시까지)",
      },
      {
        heading: "동의 거부 권리",
        body: "귀하는 개인정보 제3자 제공에 대한 동의를 거부할 권리가 있습니다. 다만, 동의를 거부하실 경우 CMS 자동이체를 통한 후원 신청 또는 기부금 영수증 발급이 제한될 수 있습니다.",
      },
    ],
    checkboxLabel: "개인정보 제3자 제공에 동의합니다.",
  },
  {
    stepTitle: "3. 개인정보 처리방침 확인",
    sections: [
      {
        body: "경기도 천사의집은 「개인정보 보호법」에 따라 개인정보를 안전하게 처리하며, 자세한 사항은 홈페이지의 개인정보 처리방침을 통해 확인하실 수 있습니다.",
      },
    ],
    checkboxLabel: "개인정보 처리방침을 확인하였습니다.",
  },
];

export default function SupportApply() {
  const { data: settings } = useSiteSettings();
  const donationInfo = settings?.donation_info ?? {};
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (key: keyof typeof EMPTY_FORM, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isRecurring = form.donationType === "정기후원";
  const isOneTime = form.donationType === "일시후원";
  const paymentMethod = isOneTime ? "bank_transfer" : form.paymentMethod;

  const pledgeAmount =
    form.pledgeAmount === "custom" ? Number(form.pledgeAmountCustom.replace(/[^0-9]/g, "")) : Number(form.pledgeAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRecurring || isOneTime) {
      if (!pledgeAmount || Number.isNaN(pledgeAmount) || pledgeAmount < 10000) {
        toast.error("후원약정금액은 10,000원 이상 입력해 주세요.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const details: Record<string, string> = {
        "후원 방식": form.donationType,
        "생년월일(사업자등록번호)": form.birthDate,
        "주소": form.address,
      };

      if (isRecurring || isOneTime) {
        details["후원약정금액"] = `${pledgeAmount.toLocaleString("ko-KR")}원`;
        details["결제 방법"] = paymentMethod === "cms" ? "CMS 자동이체" : "무통장입금";
        if (paymentMethod === "cms") {
          details["은행명"] = form.bankName;
          details["계좌번호"] = form.accountNumber;
          details["예금주"] = form.accountHolder;
          details["출금 희망일"] = form.withdrawalDate || "미기재";
        } else {
          details["입금일시"] = form.depositDateTime || "미기재";
        }
      } else {
        details["은행명"] = form.bankName;
        details["계좌번호"] = form.accountNumber;
        details["예금주"] = form.accountHolder;
        details["출금 희망일"] = form.withdrawalDate || "미기재";
      }

      await adminApi.submitInquiry({
        type: "donation",
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        message: form.message || "미기재",
        details,
      });
      toast.success("후원 신청이 접수되었습니다.", { description: "빠른 시일 내에 연락드리겠습니다." });
      setForm(EMPTY_FORM);
      setSubmitted(true);
    } catch (err) {
      toast.error("접수 중 문제가 발생했습니다.", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <SubpageHeader
        title="후원신청"
        breadcrumb={[{ name: "후원 및 자원봉사", href: "/support/info" }, { name: "후원신청", href: "/support/apply" }]}
      />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <ConsentDialog
            open={!consented}
            onAgree={() => setConsented(true)}
            title="후원 신청을 위한 개인정보 수집·이용 동의"
            intro={CONSENT_INTRO}
            steps={CONSENT_STEPS}
          />

          {consented && (
            submitted ? (
              <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-12 text-center">
                <h2 className="text-2xl font-bold mb-3">신청이 접수되었습니다</h2>
                <p className="text-muted-foreground mb-8">빠른 시일 내에 담당자가 연락드리겠습니다. 감사합니다.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full px-8">
                  다시 신청하기
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-border/50 shadow-sm p-8 md:p-10 space-y-5">
                <div className="space-y-2">
                  <Label>후원 방식</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DONATION_TYPES.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          set("donationType", opt);
                          if (opt === "일시후원") set("paymentMethod", "bank_transfer");
                          else if (opt === "정기후원") set("paymentMethod", "cms");
                        }}
                        className={`h-11 rounded-xl text-sm font-semibold border transition-colors ${
                          form.donationType === opt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {(isRecurring || isOneTime) && (
                  <div className="space-y-2">
                    <Label>후원약정금액 * (최소 10,000원)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AMOUNT_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => set("pledgeAmount", opt)}
                          className={`h-11 rounded-xl text-sm font-semibold border transition-colors ${
                            form.pledgeAmount === opt
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-input hover:border-primary/50"
                          }`}
                        >
                          {Number(opt).toLocaleString("ko-KR")}원
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => set("pledgeAmount", "custom")}
                        className={`h-11 rounded-xl text-sm font-semibold border transition-colors ${
                          form.pledgeAmount === "custom"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50"
                        }`}
                      >
                        기타(직접입력)
                      </button>
                    </div>
                    {form.pledgeAmount === "custom" && (
                      <Input
                        type="number"
                        min={10000}
                        step={1000}
                        value={form.pledgeAmountCustom}
                        onChange={(e) => set("pledgeAmountCustom", e.target.value)}
                        placeholder="희망하시는 금액을 입력해 주세요 (예: 15000)"
                        required
                      />
                    )}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="d-name">성명(또는 단체명) *</Label>
                    <Input id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="d-phone">휴대전화번호 *</Label>
                    <Input id="d-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-1234-5678" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="d-birth">생년월일(또는 사업자등록번호) *</Label>
                  <Input
                    id="d-birth"
                    value={form.birthDate}
                    onChange={(e) => set("birthDate", e.target.value)}
                    placeholder="예: 1990-01-01 (기부금 영수증 발급을 위해 필요합니다)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="d-address">주소 *</Label>
                  <Input id="d-address" value={form.address} onChange={(e) => set("address", e.target.value)} required />
                </div>

                {isRecurring || isOneTime ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">결제 방법 *</Label>
                      {isRecurring ? (
                        <div className="grid grid-cols-2 gap-3">
                          {(["cms", "bank_transfer"] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => set("paymentMethod", m)}
                              className={`h-11 rounded-xl text-sm font-semibold border transition-colors ${
                                form.paymentMethod === m
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-muted-foreground border-input hover:border-primary/50"
                              }`}
                            >
                              {m === "cms" ? "CMS 자동이체" : "무통장입금"}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="h-11 rounded-xl text-sm font-semibold border border-primary bg-primary text-primary-foreground flex items-center justify-center">
                          무통장입금
                        </div>
                      )}
                    </div>

                    {paymentMethod === "bank_transfer" ? (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">입금 계좌 안내</Label>
                        <div className="rounded-xl bg-secondary/40 border border-border/50 p-4 text-sm space-y-1.5">
                          <p><span className="text-muted-foreground mr-2">은행</span><span className="font-semibold">{donationInfo.bankName || "관리자 설정 필요"}</span></p>
                          <p><span className="text-muted-foreground mr-2">계좌번호</span><span className="font-semibold">{donationInfo.accountNumber || "-"}</span></p>
                          <p><span className="text-muted-foreground mr-2">예금주</span><span className="font-semibold">{donationInfo.accountHolder || "-"}</span></p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="d-deposit">입금일시 *</Label>
                          <Input
                            id="d-deposit"
                            type="datetime-local"
                            value={form.depositDateTime}
                            onChange={(e) => set("depositDateTime", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">CMS 출금계좌 정보 *</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder="은행명" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} required />
                          <Input placeholder="계좌번호" value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} required />
                          <Input placeholder="예금주" value={form.accountHolder} onChange={(e) => set("accountHolder", e.target.value)} required />
                          <Input placeholder="출금 희망일 (예: 매월 25일)" value={form.withdrawalDate} onChange={(e) => set("withdrawalDate", e.target.value)} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">후원금 납부정보 *</Label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="은행명" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} required />
                      <Input placeholder="계좌번호" value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} required />
                      <Input placeholder="예금주" value={form.accountHolder} onChange={(e) => set("accountHolder", e.target.value)} required />
                      <Input placeholder="출금 희망일 (예: 매월 25일)" value={form.withdrawalDate} onChange={(e) => set("withdrawalDate", e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="d-email">이메일 (선택)</Label>
                  <Input id="d-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="d-message">기타 문의사항 (선택)</Label>
                  <Textarea
                    id="d-message"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="희망하시는 후원 금액이나 문의사항을 적어주세요."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full rounded-full h-12">
                  {submitting ? "접수 중..." : "신청하기"}
                </Button>
              </form>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
