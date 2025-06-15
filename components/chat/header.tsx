'use client';

import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

import { SidebarToggle } from '@/components/sidebar/toggle';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/auth-js';
import { PlusIcon, MoonIcon, SunIcon, KakaoIcon } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type VisibilityType } from '@/components/chat/visibility-selector';
import { useTheme } from 'next-themes';
import { ReportModal } from '@/components/report-modal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/components/sidebar/user-profile-modal';
import { Database, MailIcon } from 'lucide-react';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  user,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  user: User;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const [isClient, setIsClient] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shouldShowNewChatButton = isClient && (!open || windowWidth < 768);

  // console.log('user in chat header:', user);
  // 사용자 아바타 관련 데이터

  const isGuest = user?.is_anonymous === true;
  const displayName = user?.user_metadata?.name || user.email || 'User';
  const displayAvatarUrl =
    user?.user_metadata?.avatar_url || `https://avatar.vercel.sh/${user.email || user.id}`;

  // 이름 첫 글자 가져오기
  const getInitials = () => {
    if (!displayName) return 'U';
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 flex items-center justify-between gap-2 bg-background py-1.5 pl-2 pr-4">
      <div className="flex items-center gap-2">
        <SidebarToggle />

        {shouldShowNewChatButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                data-testid="new-chat-button"
                className="px-2 md:h-fit md:px-2"
                onClick={() => {
                  router.push('/');
                  router.refresh();
                }}
              >
                <PlusIcon />
                <span className="md:sr-only">New chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New chat</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="flex items-center gap-1 px-2 py-1 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() =>
            window.open(
              'https://docs.google.com/spreadsheets/d/1DEmdLc_khD_IpVa200SJta5ueNTMFF9rZidhOhDcGEk/edit?gid=0#gid=0',
              '_blank'
            )
          }
        >
          <Database className="h-4 w-4" />
          <span>DB</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <MailIcon className="h-4 w-4" />
          <span>Feedback</span>
        </Button>

        {/* 카카오 로그인 버튼 - 게스트 사용자에게만 표시 */}
        {/* {isGuest && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 bg-[#FEE500] text-black hover:bg-[#E6CF00]"
                onClick={() => router.push('/login')}
              >
                <KakaoIcon />
                <span className="text-xs font-semibold">Login</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Login with Kakao</TooltipContent>
          </Tooltip>
        )} */}

        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</TooltipContent>
        </Tooltip> */}

        {isMobile && !isGuest && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full p-0"
                onClick={() => setIsProfileOpen(true)}
              >
                <Avatar className="h-9 w-9">
                  {displayAvatarUrl ? (
                    <AvatarImage src={displayAvatarUrl} alt={displayName} />
                  ) : (
                    <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent>My profile</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ReportModal과 동일한 패턴으로 UserProfile 모달 사용 */}
      <ReportModal isOpen={isReportModalOpen} onOpenChange={setIsReportModalOpen} chatId={chatId} />

      {isMobile && !isGuest && (
        <UserProfile
          user={{
            name: displayName,
            email: user.email,
            image: displayAvatarUrl,
            theme: (user.user_metadata?.theme as 'light' | 'dark' | 'system') || 'system',
          }}
          isOpen={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  // 메모이제이션 비교 로직은 그대로 유지
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
