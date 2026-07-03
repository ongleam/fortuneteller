"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDatingProfile } from "@/actions/profile";

export interface ProfileEditInitial {
  gender: string | null;
  birth_type: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_time: string | null;
  bio: string | null;
  region: string | null;
  photo_urls: string[];
  pref_gender: string | null;
  pref_age_min: number | null;
  pref_age_max: number | null;
  status: string | null;
}

const BIRTH_TIMES = [
  "00",
  "02",
  "04",
  "06",
  "08",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
] as const;

const selectClass =
  "mt-1 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white";

function toNum(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function ProfileEditForm({ initial }: { initial: ProfileEditInitial }) {
  const [gender, setGender] = useState(initial.gender ?? "");
  const [birthType, setBirthType] = useState(initial.birth_type ?? "양력");
  const [birthYear, setBirthYear] = useState(initial.birth_year?.toString() ?? "");
  const [birthMonth, setBirthMonth] = useState(initial.birth_month?.toString() ?? "");
  const [birthDay, setBirthDay] = useState(initial.birth_day?.toString() ?? "");
  const [birthTime, setBirthTime] = useState(initial.birth_time ?? "12");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [region, setRegion] = useState(initial.region ?? "");
  const [photoUrls, setPhotoUrls] = useState((initial.photo_urls ?? []).join(", "));
  const [prefGender, setPrefGender] = useState(initial.pref_gender ?? "무관");
  const [prefAgeMin, setPrefAgeMin] = useState(initial.pref_age_min?.toString() ?? "");
  const [prefAgeMax, setPrefAgeMax] = useState(initial.pref_age_max?.toString() ?? "");
  const [status, setStatus] = useState(initial.status ?? "draft");
  const [flash, setFlash] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateDatingProfile({
        gender: gender === "남성" || gender === "여성" ? gender : null,
        birth_type: birthType === "양력" || birthType === "음력" ? birthType : null,
        birth_year: toNum(birthYear),
        birth_month: toNum(birthMonth),
        birth_day: toNum(birthDay),
        birth_time: birthTime as (typeof BIRTH_TIMES)[number],
        bio: bio.trim() || null,
        region: region.trim() || null,
        photo_urls: photoUrls
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        pref_gender:
          prefGender === "남성" || prefGender === "여성" || prefGender === "무관"
            ? prefGender
            : "무관",
        pref_age_min: toNum(prefAgeMin),
        pref_age_max: toNum(prefAgeMax),
        status: status === "active" || status === "hidden" ? status : "draft",
      });
      setFlash(result.success ? "✅ 프로필이 저장되었습니다." : `⚠️ ${result.error}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-6"
      data-testid="profile-form"
    >
      {flash && (
        <div
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-center text-rose-200"
          data-testid="profile-flash"
        >
          {flash}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="gender">성별</Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={selectClass}
            data-testid="gender"
          >
            <option value="">선택</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
          </select>
        </div>
        <div>
          <Label htmlFor="birthType">달력</Label>
          <select
            id="birthType"
            value={birthType}
            onChange={(e) => setBirthType(e.target.value)}
            className={selectClass}
          >
            <option value="양력">양력</option>
            <option value="음력">음력</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="birthYear">출생년도</Label>
          <Input
            id="birthYear"
            inputMode="numeric"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="1990"
            className="mt-1"
            data-testid="birth-year"
          />
        </div>
        <div>
          <Label htmlFor="birthMonth">월</Label>
          <Input
            id="birthMonth"
            inputMode="numeric"
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            placeholder="5"
            className="mt-1"
            data-testid="birth-month"
          />
        </div>
        <div>
          <Label htmlFor="birthDay">일</Label>
          <Input
            id="birthDay"
            inputMode="numeric"
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            placeholder="15"
            className="mt-1"
            data-testid="birth-day"
          />
        </div>
        <div>
          <Label htmlFor="birthTime">시각</Label>
          <select
            id="birthTime"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className={selectClass}
          >
            {BIRTH_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}시
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="region">지역</Label>
        <Input
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="서울"
          className="mt-1"
          data-testid="region"
        />
      </div>

      <div>
        <Label htmlFor="bio">자기소개</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="나를 소개해주세요"
          className="mt-1"
          rows={4}
          data-testid="bio"
        />
      </div>

      <div>
        <Label htmlFor="photoUrls">사진 URL (쉼표로 구분)</Label>
        <Input
          id="photoUrls"
          value={photoUrls}
          onChange={(e) => setPhotoUrls(e.target.value)}
          placeholder="https://... , https://..."
          className="mt-1"
        />
      </div>

      <fieldset className="rounded-xl border border-slate-700 p-4">
        <legend className="px-2 text-sm text-slate-400">상대 선호</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="prefGender">선호 성별</Label>
            <select
              id="prefGender"
              value={prefGender}
              onChange={(e) => setPrefGender(e.target.value)}
              className={selectClass}
              data-testid="pref-gender"
            >
              <option value="무관">무관</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </div>
          <div>
            <Label htmlFor="prefAgeMin">최소 나이</Label>
            <Input
              id="prefAgeMin"
              inputMode="numeric"
              value={prefAgeMin}
              onChange={(e) => setPrefAgeMin(e.target.value)}
              placeholder="20"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="prefAgeMax">최대 나이</Label>
            <Input
              id="prefAgeMax"
              inputMode="numeric"
              value={prefAgeMax}
              onChange={(e) => setPrefAgeMax(e.target.value)}
              placeholder="40"
              className="mt-1"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="status">공개 상태</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClass}
          data-testid="status"
        >
          <option value="draft">비공개 (작성 중)</option>
          <option value="active">공개 (추천에 노출)</option>
          <option value="hidden">숨김</option>
        </select>
        <p className="mt-1 text-xs text-slate-500">
          공개로 설정해야 다른 사람의 추천 피드에 노출됩니다.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 py-3 text-lg font-bold text-white hover:from-rose-600 hover:to-pink-700"
        data-testid="profile-save"
      >
        {isPending ? "저장 중..." : "프로필 저장"}
      </Button>
    </form>
  );
}
