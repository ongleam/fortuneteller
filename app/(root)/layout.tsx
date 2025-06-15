// app/(chat)/layout.tsx
import { cookies } from 'next/headers';
import { AppSidebar } from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
// import { auth } from '../(auth)/auth'; // NextAuth 코드 주석 처리
import Script from 'next/script';
import { createServerClient } from '@/lib/supabase/server';

export const experimental_ppr = true;

export default async function Layout({ children }: { children: React.ReactNode }) {
  // const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  // const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  // Supabase Auth로 대체
  const cookieStore = await cookies();
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        {/* user가 null일 수 있음을 AppSidebar가 처리하도록 함 */}
        <AppSidebar user={user ?? undefined} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
