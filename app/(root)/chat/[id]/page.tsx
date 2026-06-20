import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

// import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/infra/db/queries';
// import { DataStreamHandler } from '@/components/artifact/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/config/models';
import type { DBMessage } from '@/lib/infra/db/schema';
import type { UIMessage } from 'ai';
import { createServerClient } from '@/lib/infra/supabase/server';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!chat) {
    notFound();
  }

  if (!user) {
    redirect('/login');
  }

  if (chat.visibility === 'private') {
    if (!user) {
      return notFound();
    }

    if (user.id !== chat.user_id) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={chat.visibility}
          isReadonly={user?.id !== chat.user_id}
          user={user}
        />
        {/* <DataStreamHandler id={id} /> */}
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={user?.id !== chat.user_id}
        user={user}
      />
      {/* <DataStreamHandler id={id} /> */}
    </>
  );
}
