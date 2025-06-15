import { cookies, headers } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/config/models';
import { generateUUID } from '@/lib/utils';
// import { DataStreamHandler } from '@/components/data-stream-handler';
import { redirect } from 'next/navigation';
import { userAgent } from 'next/server';
import { createServerClient } from '@/lib/supabase/server'; // 서버용 클라이언트 import

export default async function Page() {
  const requestHeaders = await headers();
  const { isBot } = userAgent({ headers: requestHeaders });
  const supabase = await createServerClient(); // 서버용 클라이언트 생성

  const {
    data: { user },
  } = await supabase.auth.getUser(); // 수정된 getUser 호출

  const isGuest = user && user.is_anonymous;

  if (isBot) {
    return <div>Bot detected!</div>;
  }

  if (!isGuest && !user) {
    redirect('/');
  }

  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
          user={user}
        />
        {/* <DataStreamHandler id={id} /> */}
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
        user={user}
      />
      {/* <DataStreamHandler id={id} /> */}
    </>
  );
}
