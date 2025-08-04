'use client';

import type { Vote } from '@/lib/infra/db/schema';
import { cn } from '@/lib/shared/utils';
import { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
// import { DocumentToolCall, DocumentToolResult } from '@/components/artifact/document';
// import { DocumentPreview } from '@/components/artifact/document-preview';
import { PencilEditIcon, SparklesIcon } from '@/components/icons';
import { Markdown } from '@/components/markdown';
import { MessageActions } from './actions';
import { MessageReasoning } from './reasoning';
import { PreviewAttachment } from '@/components/preview-attachment';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Weather } from '@/components/weather';
import { useIsMobile } from '@/hooks/use-mobile';
import clsx from 'clsx';

//
const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="group/message mx-auto w-full max-w-3xl px-4"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex w-full gap-3 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl sm:gap-4',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            }
          )}
        >
          {message.role === 'assistant' && !isMobile && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 sm:gap-4">
            {message.experimental_attachments && (
              <div data-testid={`message-attachments`} className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment key={attachment.url} attachment={attachment} />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning key={key} isLoading={isLoading} reasoning={part.reasoning} />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  // console.log('part', part);

                  // <Thinking></Thinking> 태그를 필터링하는 함수
                  const filterThinkingTags = (text: string) => {
                    return text.replace(/<Thinking>[\s\S]*?<\/Thinking>/g, '');
                  };

                  // 필터링된 텍스트
                  const filteredText = filterThinkingTags(part.text);

                  return (
                    <div key={key} className="flex flex-row items-start gap-2">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="h-fit rounded-full px-2 text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>메시지 수정</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-3 sm:gap-4', {
                          'rounded-xl bg-primary px-3 py-2 text-primary-foreground':
                            message.role === 'user',
                        })}
                      >
                        <Markdown>{filteredText}</Markdown>
                      </div>
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                // console.log(`[INFO] toolInvocation: `, part);

                if (state === 'call') {
                  const { args } = toolInvocation;
                  // console.log('[INFO] args of `@/components/message.tsx`: ', args);
                  return (
                    <div
                      key={toolCallId}
                      className={clsx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? <Weather /> : null}
                    </div>
                  );
                }

                if (state === 'result') {
                  const { result } = toolInvocation;
                  // console.log(`[INFO] result: `, result);
                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? <Weather weatherAtLocation={result} /> : null}
                    </div>
                  );
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  if (!equal(prevProps.vote, nextProps.vote)) return false;

  return true;
});

export const ThinkingMessage = () => {
  const role = 'assistant';
  const isMobile = useIsMobile();

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="group/message mx-auto w-full max-w-3xl px-3 sm:px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={clsx(
          'flex w-full gap-3 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2 sm:gap-4',
          {
            'group-data-[role=user]/message:bg-muted': true,
          }
        )}
      >
        {!isMobile && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-4 text-muted-foreground">Thinking...</div>
        </div>
      </div>
    </motion.div>
  );
};
