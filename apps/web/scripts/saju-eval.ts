// 사주풀이 eval 하네스 — 실제 시스템 프롬프트 + 모델 + 계산 엔진을 그대로 구동해
// (1) 계산 정확도/속도 (2) LLM 풀이 품질/속도 (3) 필수 섹션 커버리지를 측정한다.
// DB(profile/chat/message)는 경유하지 않는다 — dev/prod가 DB를 공유하므로 오염 방지.
//
// 실행: GEMINI_API_KEY 로드된 상태에서  bun run scripts/saju-eval.ts
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { google } from "@fortuneteller/clients/gemini/client";
import { modelConfig } from "@fortuneteller/config/models";
import { systemPrompts, tools as toolPrompts } from "@fortuneteller/config/prompts";
import { computeSaju } from "@fortuneteller/modules/fortune/application/handlers";

const cfg = modelConfig["chat-model"];
const model = google(cfg.model);

type Persona = {
  id: string;
  name: string;
  gender: "남성" | "여성";
  calendar: "양력" | "음력";
  year: string;
  month: string;
  day: string;
  hour: string;
  q: string;
};

const PERSONAS: Persona[] = [
  {
    id: "p1",
    name: "홍길동",
    gender: "남성",
    calendar: "양력",
    year: "1990",
    month: "03",
    day: "15",
    hour: "14",
    q: "내 사주팔자를 자세히 풀이해줘",
  },
  {
    id: "p2",
    name: "김영희",
    gender: "여성",
    calendar: "양력",
    year: "1988",
    month: "11",
    day: "02",
    hour: "06",
    q: "내 사주 전체적으로 봐줘",
  },
  {
    id: "p3",
    name: "이철수",
    gender: "남성",
    calendar: "음력",
    year: "1975",
    month: "07",
    day: "23",
    hour: "22",
    q: "내 사주랑 올해 운세 봐줘",
  },
  {
    id: "p4",
    name: "박지민",
    gender: "여성",
    calendar: "양력",
    year: "2001",
    month: "05",
    day: "09",
    hour: "10",
    q: "내 사주팔자 알려줘",
  },
  // 엣지: 자시 경계('24'=23:30~24:00), 입춘 직전/직후(년주 경계 검증)
  {
    id: "e1",
    name: "자시경계",
    gender: "남성",
    calendar: "양력",
    year: "1999",
    month: "12",
    day: "31",
    hour: "24",
    q: "내 사주 봐줘",
  },
  {
    id: "e2",
    name: "입춘전",
    gender: "여성",
    calendar: "양력",
    year: "2000",
    month: "02",
    day: "03",
    hour: "12",
    q: "내 사주 봐줘",
  },
  {
    id: "e3",
    name: "입춘후",
    gender: "여성",
    calendar: "양력",
    year: "2000",
    month: "02",
    day: "05",
    hour: "12",
    q: "내 사주 봐줘",
  },
];

const PP = toolPrompts.getSaju;
const getSaju = tool({
  description: PP.description,
  inputSchema: z.object({
    name: z.string(),
    gender: z.enum(["남성", "여성"]),
    calendar: z.enum(["양력", "음력"]).default("양력"),
    year: z.string(),
    month: z.string(),
    day: z.string(),
    hour: z
      .enum(["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22", "24"])
      .nullable()
      .optional(),
  }),
  execute: async ({ name, gender, calendar, year, month, day, hour }: any) =>
    computeSaju({ name, gender, calendar, year, month, day, hour: hour || "12" }),
});

function today() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 필수 섹션 커버리지 — 계산 요소가 풀이에 실제로 등장하는가.
function coverage(text: string) {
  const has = (re: RegExp) => re.test(text);
  return {
    사주팔자: has(/년주|월주|일주|시주|사주팔자/),
    음양오행: has(/오행|음양/),
    십성: has(/십성|비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인/),
    신살: has(/신살|역마|도화|화개|장성|겁살|망신|천을귀인|귀인|육해|반안|월살|천살|년살|지살/),
    대운: has(/대운|세운|년운/),
    지장간_12운성: has(/지장간|장생|목욕|관대|건록|제왕|쇠|병|사|묘|절|태|양/),
    띠: has(/띠|쥐|소|호랑이|토끼|용|뱀|말|양|원숭이|닭|개|돼지/),
  };
}

// 마크다운 누출 감지 — plain text 규칙 위반 여부.
function markdownLeaks(text: string): string[] {
  const leaks: string[] = [];
  if (/#{1,6}\s/.test(text)) leaks.push("헤더(#)");
  if (/\*\*/.test(text)) leaks.push("볼드(**)");
  if (/^\s*([-*_])\1{2,}\s*$/m.test(text)) leaks.push("수평선(---)");
  if (/^\s*[-*+]\s/m.test(text)) leaks.push("md리스트(*/-)");
  return leaks;
}

async function run() {
  console.log(`\n=== SAJU EVAL — model=${cfg.model} temp=${cfg.temperature} — ${today()} ===\n`);
  const rows: any[] = [];

  for (const p of PERSONAS) {
    // 1) 계산 정확도/속도
    const c0 = performance.now();
    const saju = await computeSaju({ ...p });
    const calcMs = Math.round(performance.now() - c0);
    const pill = saju.pillars;
    const pillStr = `${pill.year.gapjaKorean}(${pill.year.gapja}) ${pill.month.gapjaKorean}(${pill.month.gapja}) ${pill.day.gapjaKorean}(${pill.day.gapja}) ${pill.time.gapjaKorean}(${pill.time.gapja})`;

    // 2) LLM 풀이 속도/품질
    const l0 = performance.now();
    let text = "";
    let steps = 0;
    let err = "";
    try {
      const res = await generateText({
        model,
        temperature: cfg.temperature,
        system: systemPrompts.BASE_AGENT,
        messages: [
          {
            role: "user",
            content: `오늘 날짜: ${today()}\n<USER_INPUT>${p.q} (${p.name}, ${p.gender}, ${p.year}년 ${p.month}월 ${p.day}일 ${p.calendar}, ${Number(p.hour)}시경 출생)</USER_INPUT>`,
          },
        ],
        tools: { getSaju },
        stopWhen: stepCountIs(5),
      });
      text = res.text;
      steps = res.steps.length;
    } catch (e: any) {
      err = e?.message ?? String(e);
    }
    const llmMs = Math.round(performance.now() - l0);
    const cov = coverage(text);
    const covKeys = Object.keys(cov);
    const covScore = Object.values(cov).filter(Boolean).length;
    const leaks = markdownLeaks(text);

    rows.push({
      id: p.id,
      name: p.name,
      calcMs,
      llmMs,
      totalMs: calcMs + llmMs,
      steps,
      covScore,
      covMax: covKeys.length,
      leaks,
      chars: text.length,
      err,
    });

    console.log(
      `--- [${p.id}] ${p.name} ${p.gender} ${p.year}.${p.month}.${p.day} ${p.calendar} ${p.hour}시 ---`,
    );
    console.log(`사주팔자(계산): ${pillStr}`);
    console.log(
      `일간:${saju.dayMaster.korean}(${saju.dayMaster.element}) 띠:${saju.zodiac?.display ?? JSON.stringify(saju.zodiac)} 최강오행:${saju.elements.strongest.korean} 최약오행:${saju.elements.weakest.korean}`,
    );
    console.log(
      `대운: 시작 ${saju.daeun.startAge}세 방향 ${saju.daeun.direction} / 현재대운: ${saju.now.currentDaeun ? (saju.now.currentDaeun.gapjaKorean ?? JSON.stringify(saju.now.currentDaeun)) : "없음"} (나이 ${saju.now.age})`,
    );
    console.log(`신살: ${JSON.stringify(saju.sinsal)}`);
    console.log(
      `⏱  calc=${calcMs}ms  llm=${llmMs}ms  total=${calcMs + llmMs}ms  steps=${steps}  coverage=${covScore}/${covKeys.length} ${JSON.stringify(cov)}`,
    );
    console.log(`📝 마크다운 누출: ${leaks.length ? "🔴 " + leaks.join(", ") : "🟢 없음"}`);
    if (err) console.log(`❌ ERROR: ${err}`);
    console.log(`\n📜 풀이 (${text.length}자):\n${text}\n`);
  }

  console.log(`\n=== SUMMARY ===`);
  for (const r of rows) {
    const flag = r.totalMs > 60000 ? "🔴>1min" : r.totalMs > 30000 ? "🟡" : "🟢";
    console.log(
      `${flag} ${r.id} ${r.name}: total=${(r.totalMs / 1000).toFixed(1)}s (calc ${r.calcMs}ms + llm ${(r.llmMs / 1000).toFixed(1)}s) steps=${r.steps} cov=${r.covScore}/${r.covMax} md=${r.leaks.length ? "🔴" : "🟢"} chars=${r.chars}${r.err ? " ERR" : ""}`,
    );
  }
  const avg = rows.reduce((a, r) => a + r.totalMs, 0) / rows.length;
  const maxT = Math.max(...rows.map((r) => r.totalMs));
  console.log(
    `\navg total=${(avg / 1000).toFixed(1)}s  max total=${(maxT / 1000).toFixed(1)}s  (제약: 모두 <60s)`,
  );
}

run().then(() => process.exit(0));
