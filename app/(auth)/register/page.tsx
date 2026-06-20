"use client";

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // This is a dummy action.
    // You can log form data to the console if you want to see it:
    // const formData = new FormData(event.currentTarget);
    // const data = Object.fromEntries(formData.entries());
    // console.log('Register form submitted (dummy action):', data);
    alert("회원가입이 완료되었습니다.");
    redirect("/api/login");
  };

  return (
    <div className="flex min-h-dvh w-screen items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8 md:p-10">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">점순이 회원가입</h1>
        <p className="mb-8 text-center text-sm text-gray-600">
          아래 필수 항목들을 입력하여 회원가입을 진행해주세요.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700">
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              className="mt-1 bg-white/70"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">
              비밀번호
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="mt-1 bg-white/70"
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-gray-700">
              이름
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              required
              className="mt-1 bg-white/70"
            />
          </div>

          <div>
            <Label htmlFor="gender" className="text-gray-700">
              성별
            </Label>
            <Select name="gender" required>
              <SelectTrigger id="gender" className="mt-1 w-full bg-white/70">
                <SelectValue placeholder="성별을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">남성</SelectItem>
                <SelectItem value="female">여성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-700">
              연락처
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="010-1234-5678"
              required
              className="mt-1 bg-white/70"
            />
          </div>

          <div>
            <Label htmlFor="year" className="text-gray-700">
              출생연도
            </Label>
            <Input
              id="year"
              name="year"
              type="number"
              placeholder="예: 1990"
              min="1900"
              max={new Date().getFullYear()}
              required
              className="mt-1 bg-white/70"
            />
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            가입 시{" "}
            <Link
              href="https://www.notion.so/ongleam/1ee0ab7fb18f80a69e18df2f8052b156"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              개인정보처리방침
            </Link>
            {" 및 "}
            <Link
              href="https://ongleam.notion.site/1ee0ab7fb18f802dba22f415dbd517c7"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              이용약관
            </Link>
            에 동의하는 것으로 간주합니다.
          </div>

          <Button type="submit" className="w-full py-3 text-base">
            가입하기
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
