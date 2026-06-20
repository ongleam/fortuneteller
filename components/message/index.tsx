import type { UIMessage } from 'ai';
import { PreviewMessage, ThinkingMessage } from './item';
import { useScrollToBottom } from '../use-scroll-to-bottom';
import { Greeting } from '@/components/chat/greeting';
import { memo } from 'react';
import type { Vote } from '@/lib/infra/db/schema';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>['status'];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  regenerate: UseChatHelpers<UIMessage>['regenerate'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto pt-2 sm:gap-6 sm:pt-4"
    >
      {messages.length === 0 && <Greeting />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          vote={votes ? votes.find((vote) => vote.message_id === message.id) : undefined}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
