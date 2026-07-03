// components/certification-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { normText } from "@fortuneteller/shared/utils/textPreprocess";
import { useIsMobile } from "@/hooks/use-mobile";

// KCTable에서 정의한 인터페이스 재사용 또는 임포트

interface CertificationDetailModalProps {
  certification_detail: CertificationDetail | null;
  onClose: () => void;
}

function createMarkup(htmlString?: string) {
  if (!htmlString) return { __html: "" };

  return { __html: htmlString };
}

// 상세 정보 항목을 렌더링하는 도우미 컴포넌트
const DetailItem = ({ value, isHtml = false }: { value?: string; isHtml?: boolean }) => {
  if (!value) return null;

  return isHtml ? (
    <span className="whitespace-pre-line text-sm" dangerouslySetInnerHTML={createMarkup(value)} />
  ) : (
    <span className="text-sm">{value}</span>
  );
};

// 뱃지 렌더링 함수 (재사용 가능)
function renderBadges(items?: string[], variant: "secondary" | "outline" = "secondary") {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-wrap">
      {items.map((item, idx) => (
        <Badge key={idx} className="mb-1 mr-1" variant={variant}>
          {item}
        </Badge>
      ))}
    </div>
  );
}

// 필요서류 뱃지 렌더링 함수
function renderIcReqBadges(ic_req?: string) {
  if (!ic_req) return null;

  const items = ic_req
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);

  return renderBadges(items);
}

// 소관 부처 뱃지 렌더링 함수
function renderIcComBadges(ic_com?: string) {
  if (!ic_com) return null;

  const items = ic_com
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return renderBadges(items);
}

// 세부내용 요약 렌더링 함수
function renderDetailSummary(item: CertificationDetail["item"]) {
  const details: string[] = [];

  if (item.lc_cate1_con) {
    details.push(`- ${item.lc_cate1_con}`);
  }

  if (item.lc_cate2_con) {
    const combined = item.lc_cate2_qu
      ? `${item.lc_cate2_con} ${item.lc_cate2_qu}`
      : item.lc_cate2_con;
    details.push(`- ${combined}`);
  }

  if (item.lc_cate3_con) {
    const combined = item.lc_cate3_qu
      ? `${item.lc_cate3_con} ${item.lc_cate3_qu}`
      : item.lc_cate3_con;
    details.push(`- ${combined}`);
  }

  if (details.length === 0) return null;
  return normText(details.join("\n"));
}

// 구매대행 상태 뱃지 렌더링 함수
function renderPurchaseAgencyStatus(status?: string) {
  if (status === "Y") {
    return (
      <span className="inline-block rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        가능
      </span>
    );
  } else if (status === "N") {
    return (
      <span className="inline-block rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        불가능
      </span>
    );
  } else {
    return (
      <span className="inline-block rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
        정보없음
      </span>
    );
  }
}

// 상세 항목 렌더링 함수 (재사용 가능)
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mb-3">
        <div className="mb-1 text-xs font-medium text-zinc-500">{label}</div>
        <div className="pl-1">{children}</div>
      </div>
    );
  }

  return (
    <>
      <dt className="text-muted-foreground self-center px-3 py-2 text-sm font-medium">{label}</dt>
      <dd className="self-center border-b border-zinc-200 py-2 text-sm dark:border-zinc-700">
        {children}
      </dd>
    </>
  );
}

export function CertificationDetailModal({
  certification_detail,
  onClose,
}: CertificationDetailModalProps) {
  const isMobile = useIsMobile();

  // certification 객체가 없으면 모달을 렌더링하지 않음
  if (!certification_detail) {
    return null;
  }

  const { item } = certification_detail;

  return (
    // Dialog의 open 상태와 onOpenChange를 통해 열고 닫기 제어
    <Dialog open={!!certification_detail} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className={`${isMobile ? "p-4 sm:p-6" : "sm:max-w-2xl"}`}>
        <DialogHeader>
          <DialogTitle className={`${isMobile ? "text-lg" : "text-xl"}`}>
            {`${item.gubun1} ${item.gubun2}`}
          </DialogTitle>
          <div className="text-muted-foreground flex flex-wrap items-center gap-1 pt-1 text-sm">
            {item.cate1 && <Badge variant="outline">{item.cate1}</Badge>}
            {item.cate2 && (
              <>
                <span>&gt;</span>
                <Badge variant="outline">{item.cate2}</Badge>
              </>
            )}
            {item.cate3 && (
              <>
                <span>&gt;</span>
                <Badge variant="outline">{item.cate3}</Badge>
              </>
            )}
          </div>
        </DialogHeader>
        {/* 내용이 길어질 수 있으므로 ScrollArea 사용 */}
        <ScrollArea
          className={`${isMobile ? "max-h-[60vh]" : "max-h-[70vh]"} ${isMobile ? "pr-2" : "pr-6"}`}
          type="always"
        >
          {/* 높이 제한 및 스크롤 */}
          {isMobile ? (
            <div className="py-2">
              <DetailRow label="관련 법규">
                <DetailItem value={item.ic_law} />
              </DetailRow>

              <DetailRow label="소관 부처">{renderIcComBadges(item.ic_com)}</DetailRow>

              <DetailRow label="구매대행">{renderPurchaseAgencyStatus(item.ic_pagent)}</DetailRow>

              <DetailRow label="샘플 수량">
                <DetailItem value={normText(item.ic_ea)} />
              </DetailRow>

              <DetailRow label="예상 소요 기간">
                <DetailItem value={normText(item.ic_btween)} isHtml />
              </DetailRow>

              <DetailRow label="필요 서류">{renderIcReqBadges(item.ic_req)}</DetailRow>

              <DetailRow label="참고 사항 (Tip)">
                <DetailItem value={normText(item.ic_tip)} isHtml />
              </DetailRow>

              {item.lc_cate1_con && (
                <DetailRow label="세부내용">
                  <span className="whitespace-pre-line">{renderDetailSummary(item)}</span>
                </DetailRow>
              )}
            </div>
          ) : (
            <dl className="grid grid-cols-[max-content_1fr] items-center gap-x-4 py-4">
              <DetailRow label="관련 법규">
                <DetailItem value={item.ic_law} />
              </DetailRow>

              <DetailRow label="소관 부처">{renderIcComBadges(item.ic_com)}</DetailRow>

              <DetailRow label="구매대행">{renderPurchaseAgencyStatus(item.ic_pagent)}</DetailRow>

              <DetailRow label="샘플 수량">
                <DetailItem value={normText(item.ic_ea)} />
              </DetailRow>

              <DetailRow label="예상 소요 기간">
                <DetailItem value={normText(item.ic_btween)} isHtml />
              </DetailRow>

              <DetailRow label="필요 서류">{renderIcReqBadges(item.ic_req)}</DetailRow>

              <DetailRow label="참고 사항 (Tip)">
                <DetailItem value={normText(item.ic_tip)} isHtml />
              </DetailRow>

              {item.lc_cate1_con && (
                <DetailRow label="세부내용">
                  <span className="whitespace-pre-line">{renderDetailSummary(item)}</span>
                </DetailRow>
              )}
            </dl>
          )}
        </ScrollArea>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className={isMobile ? "w-full" : ""}>
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
