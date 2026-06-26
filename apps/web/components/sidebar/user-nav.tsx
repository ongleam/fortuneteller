// components/sidebar/user-nav.tsx
"use client";

import { ChevronUp, Loader2, LogOut, Settings, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { KakaoIcon } from "@/components/icons";
import { createClient } from "@/lib/infra/supabase/client";
import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "./user-profile-modal";
import { useIsMobile } from "@/hooks/use-mobile";

export function SidebarUserNav({ user }: { user: SupabaseUser | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useIsMobile();

  const isGuest = user?.is_anonymous === true;

  // 로딩 중 UI를 위한 버튼 컴포넌트
  const AuthButton = ({ text, onClick }: { text: string; onClick: () => void }) => (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <KakaoIcon />
          {text}
        </>
      )}
    </Button>
  );

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <AuthButton text="Login with Kakao" onClick={() => router.push("/login")} />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isGuest) {
    return (
      <>
        {!isMobile && (
          <SidebarMenu>
            <SidebarMenuItem>
              <AuthButton
                text="Continue with Kakao account"
                onClick={() => router.push("/login")}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </>
    );
  }

  // 로그인된 영구 사용자
  const displayName = user.user_metadata?.name || user.email || "User";
  const displayAvatarUrl =
    user.user_metadata?.avatar_url || `https://avatar.vercel.sh/${user.email || user.id}`;

  // 이름 첫 글자 가져오기
  const getInitials = () => {
    if (!displayName) return "U";
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          data-testid="user-nav-button"
          className="bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10"
          disabled={isLoading}
          onClick={() => setIsProfileOpen(true)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Avatar className="h-5 w-5">
              {displayAvatarUrl ? (
                <AvatarImage src={displayAvatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
              )}
            </Avatar>
          )}
          <span data-testid="user-email" className="truncate">
            {isLoading ? "Processing..." : displayName}
          </span>
          <ChevronUp className="ml-auto" />
        </SidebarMenuButton>

        <UserProfile
          user={{
            name: displayName,
            email: user.email,
            image: displayAvatarUrl,
            theme: (user.user_metadata?.theme as "light" | "dark" | "system") || "system",
          }}
          isOpen={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
