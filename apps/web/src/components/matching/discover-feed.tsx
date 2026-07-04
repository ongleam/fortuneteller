"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { likeUser } from "@/actions/matching";
import { brandColors } from "@/components/brand/theme";

const { ink: INK, seal: SEAL, sub: SUB } = brandColors;

export interface DiscoverCandidateView {
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  photoUrls: string[];
  gender: string | null;
  age: number | null;
  score: number;
  summary: string;
}

export function DiscoverFeed({ candidates }: { candidates: DiscoverCandidateView[] }) {
  const [remaining, setRemaining] = useState(candidates);
  const [flash, setFlash] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLike(userId: string) {
    startTransition(async () => {
      const result = await likeUser(userId);
      if (result.success) {
        setRemaining((prev) => prev.filter((c) => c.userId !== userId));
        setFlash(
          result.matched
            ? "🎉 인연이 이어졌어요! 매칭 목록에서 확인하세요."
            : "💌 좋아요를 보냈어요.",
        );
      } else {
        setFlash(`⚠️ ${result.error ?? "좋아요에 실패했어요."}`);
      }
    });
  }

  if (remaining.length === 0) {
    return (
      <div className="py-24 text-center" data-testid="discover-empty" style={{ color: SUB }}>
        <div className="mb-4 text-5xl">🌙</div>
        <p className="text-lg">지금은 보여드릴 상대가 없어요.</p>
        <p className="mt-2 text-sm">프로필을 완성하거나 잠시 후 다시 봐 주세요.</p>
      </div>
    );
  }

  return (
    <div>
      {flash && (
        <div
          className="mb-6 px-4 py-3 text-center"
          data-testid="discover-flash"
          style={{
            border: `1px solid ${SEAL}`,
            backgroundColor: "rgba(156,43,31,0.06)",
            color: INK,
          }}
        >
          {flash}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="discover-list">
        {remaining.map((c) => {
          const photo = c.photoUrls[0] ?? c.avatarUrl;
          return (
            <div
              key={c.userId}
              className="flex flex-col overflow-hidden bg-[#f4ecd8]"
              data-testid="discover-card"
              style={{
                border: `1px solid ${brandColors.line}`,
                boxShadow: "3px 3px 0 rgba(60,40,20,0.12)",
              }}
            >
              <div
                className="relative flex h-56 items-center justify-center"
                style={{ backgroundColor: "#e5d8ba" }}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl">🧑</span>
                )}
                <span
                  className="absolute right-3 top-3 px-3 py-1 text-sm font-bold"
                  style={{ backgroundColor: SEAL, color: "#f7ecd6" }}
                >
                  궁합 {c.score}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-baseline gap-2">
                  <h3 className="text-xl font-bold" style={{ color: INK }}>
                    {c.name}
                  </h3>
                  {c.age != null && (
                    <span className="text-sm" style={{ color: SUB }}>
                      {c.age}세
                    </span>
                  )}
                </div>
                <p className="mb-2 text-xs" style={{ color: SUB }}>
                  {[c.gender, c.region].filter(Boolean).join(" · ")}
                </p>
                {c.summary && (
                  <p className="mb-2 text-sm" style={{ color: SEAL }}>
                    {c.summary}
                  </p>
                )}
                {c.bio && (
                  <p className="mb-4 line-clamp-3 text-sm" style={{ color: INK }}>
                    {c.bio}
                  </p>
                )}
                <Button
                  onClick={() => handleLike(c.userId)}
                  disabled={isPending}
                  className="mt-auto w-full rounded-none font-bold"
                  data-testid="like-button"
                  style={{ backgroundColor: SEAL, color: "#f7ecd6" }}
                >
                  💗 좋아요
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
