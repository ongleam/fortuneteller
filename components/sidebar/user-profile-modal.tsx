'use client';

import { useState, ReactNode, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LogOut,
  Settings,
  Globe,
  Moon,
  Sun,
  HelpCircle,
  Shield,
  FileText,
  ChevronRight,
  X,
  Loader2,
  Bell,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { useTheme } from 'next-themes';

interface UserProfileProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    theme?: 'light' | 'dark' | 'system';
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfile({ user, isOpen, onOpenChange }: UserProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ type: 'error', description: 'Logout failed.' });
      } else {
        onOpenChange(false);
        window.location.href = '/';
      }
    } catch (error) {
      toast({ type: 'error', description: 'An error occurred during logout.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 테마 토글 처리
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 테마 아이콘 표시
  const getThemeIcon = () => {
    return theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  // 테마 이름 표시
  const getThemeName = () => {
    return theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  // 터치 영역을 넓게 하는 버튼 래퍼 컴포넌트
  const TouchableItem = ({
    icon,
    label,
    rightContent,
    onClick,
    danger = false,
    disabled = false,
  }: {
    icon: ReactNode;
    label: string;
    rightContent?: ReactNode;
    onClick?: () => void;
    danger?: boolean;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between px-3 py-4 transition-colors',
        'hover:bg-muted/50 focus:bg-muted/70 focus:outline-none active:bg-muted',
        danger &&
          'hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950/20 dark:active:bg-red-950/30',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
            danger ? 'text-red-500' : 'text-muted-foreground',
            'bg-muted/50'
          )}
        >
          {icon}
        </div>
        <span className={cn('text-sm font-medium', danger && 'text-red-500')}>{label}</span>
      </div>
      {rightContent}
    </button>
  );

  // 설정 아이템 컴포넌트
  const SettingItem = ({
    icon,
    label,
    value,
    onClick,
  }: {
    icon: ReactNode;
    label: string;
    value: string;
    onClick?: () => void;
  }) => (
    <TouchableItem
      icon={icon}
      label={label}
      onClick={onClick}
      rightContent={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{value}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      }
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent max-h-[90vh] overflow-y-auto',
          isMobile ? 'w-full p-0 sm:max-w-full' : 'sm:max-w-2xl'
        )}
      >
        <div className="flex flex-col">
          {/* 계정 섹션 */}
          <div className="p-4">
            <h3 className="mb-2 px-1 text-sm font-medium text-muted-foreground">Account</h3>
            <div className="overflow-hidden rounded-lg border">
              <SettingItem
                icon={getThemeIcon()}
                label="Theme"
                value={getThemeName()}
                onClick={toggleTheme}
              />
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className="p-4">
            <h3 className="mb-2 px-1 text-sm font-medium text-muted-foreground">Information</h3>
            <div className="overflow-hidden rounded-lg border">
              <Link href={siteConfig.termsOfService.url} className="block">
                <TouchableItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Terms of Service"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>

              <Separator />

              <Link href={siteConfig.privacyPolicy.url} className="block">
                <TouchableItem
                  icon={<Shield className="h-5 w-5" />}
                  label="Privacy Policy"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
            </div>
          </div>

          {/* 기타 섹션 */}
          <div className="p-4">
            <h3 className="mb-2 px-1 text-sm font-medium text-muted-foreground">Other</h3>
            <div className="overflow-hidden rounded-lg border">
              <TouchableItem
                icon={<LogOut className="h-5 w-5" />}
                label={isLoading ? 'Processing...' : 'Logout'}
                danger
                disabled={isLoading}
                onClick={handleLogout}
              />
            </div>
          </div>

          <div className="py-6 text-center text-xs text-muted-foreground">
            v{siteConfig.version}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
