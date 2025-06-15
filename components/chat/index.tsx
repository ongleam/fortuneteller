'use client';

import { ChatHeader } from '@/components/chat/header';
// import { useArtifactSelector } from '@/hooks/use-artifact';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import type { Attachment, UIMessage } from 'ai';
import type { User } from '@supabase/auth-js';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { Messages } from '@/components/message';
import { MultimodalInput } from '@/components/chat/multimodal-input';
import { getChatHistoryPaginationKey } from '@/components/sidebar/history';
import { toast } from '@/components/toast';
import type { VisibilityType } from '@/components/chat/visibility-selector';

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  user,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  user: User;
}) {
  const { mutate } = useSWRConfig();

  const { messages, setMessages, handleSubmit, input, setInput, append, status, stop, reload } =
    useChat({
      id,
      initialMessages,
      experimental_throttle: 100,
      sendExtraMessageFields: true,
      generateId: generateUUID,
      experimental_prepareRequestBody: (body) => ({
        id,
        message: body.messages.at(-1),
        selectedChatModel,
      }),
      onFinish: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
      },
      onError: (error) => {
        toast({
          type: 'error',
          description: error.message,
        });
      },
    });

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  // const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex h-dvh min-w-0 flex-col bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
          user={user}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={false}
        />

        <form className="mx-auto flex w-full gap-2 bg-background px-2 pb-2 sm:px-4 sm:pb-4 md:max-w-3xl md:pb-6">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>
    </>
  );
}
