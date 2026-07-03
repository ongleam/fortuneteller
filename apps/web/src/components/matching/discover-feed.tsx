"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { likeUser } from "@/actions/matching";

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
          result.matched ? "🎉 매칭 성립! 매칭 목록에서 확인하세요." : "💌 좋아요를 보냈어요.",
        );
      } else {
        setFlash(`⚠️ ${result.error ?? "좋아요에 실패했습니다."}`);
      }
    });
  }

  if (remaining.length === 0) {
    return (
      <div
        className="mx-auto max-w-md py-24 text-center text-slate-400"
        data-testid="discover-empty"
      >
        <div className="mb-4 text-5xl">🌙</div>
        <p className="text-lg">지금은 추천할 상대가 없어요.</p>
        <p className="mt-2 text-sm">프로필을 완성하거나 잠시 후 다시 확인해보세요.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {flash && (
        <div
          className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-center text-rose-200"
          data-testid="discover-flash"
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
              className="flex flex-col overflow-hidden rounded-2xl border border-rose-700/30 bg-gradient-to-br from-slate-800/60 to-gray-900/60 backdrop-blur-sm"
              data-testid="discover-card"
            >
              <div className="relative flex h-56 items-center justify-center bg-slate-800/60">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl">🧑</span>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-rose-600/90 px-3 py-1 text-sm font-bold text-white">
                  궁합 {c.score}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-rose-100">{c.name}</h3>
                  {c.age != null && <span className="text-sm text-slate-400">{c.age}세</span>}
                </div>
                <p className="mb-2 text-xs text-slate-400">
                  {[c.gender, c.region].filter(Boolean).join(" · ")}
                </p>
                {c.summary && <p className="mb-2 text-sm text-rose-300">{c.summary}</p>}
                {c.bio && <p className="mb-4 line-clamp-3 text-sm text-slate-300">{c.bio}</p>}
                <Button
                  onClick={() => handleLike(c.userId)}
                  disabled={isPending}
                  className="mt-auto w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 font-bold text-white hover:from-rose-600 hover:to-pink-700"
                  data-testid="like-button"
                >
                  💘 좋아요
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
