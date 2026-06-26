import type { UIMessage } from "ai";
import { useSWRConfig } from "swr";
import { useCopyToClipboard } from "usehooks-ts";

import type { Vote } from "@/lib/infra/db/schema";

import equal from "fast-deep-equal";
import { memo } from "react";
import { toast } from "sonner";
import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from "../icons";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const isMobile = useIsMobile();

  if (isLoading) return null;
  if (message.role === "user") return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground h-fit px-2 py-1"
              variant="outline"
              onClick={async () => {
                const textFromParts = message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part) => (part as { text: string }).text)
                  .join("\n")
                  .trim();

                if (!textFromParts) {
                  toast.error("복사할 텍스트가 없습니다!");
                  return;
                }

                await copyToClipboard(textFromParts);
                toast.success("클립보드에 복사되었습니다!");
              }}
            >
              <CopyIcon size={isMobile ? 12 : 14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>복사</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-upvote"
              className="text-muted-foreground !pointer-events-auto h-fit px-2 py-1"
              disabled={vote?.is_upvoted}
              variant="outline"
              onClick={async () => {
                const upvote = fetch("/api/vote", {
                  method: "PATCH",
                  body: JSON.stringify({
                    chatId,
                    messageId: message.id,
                    type: "up",
                  }),
                });

                toast.promise(upvote, {
                  loading: "추천 중...",
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.message_id !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chat_id: chatId,
                            message_id: message.id,
                            is_upvoted: true,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return "Upvoted Response!";
                  },
                  error: "Failed to upvote response.",
                });
              }}
            >
              <ThumbUpIcon size={isMobile ? 12 : 14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>추천</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-downvote"
              className="text-muted-foreground !pointer-events-auto h-fit px-2 py-1"
              variant="outline"
              disabled={vote && !vote.is_upvoted}
              onClick={async () => {
                const downvote = fetch("/api/vote", {
                  method: "PATCH",
                  body: JSON.stringify({
                    chatId,
                    messageId: message.id,
                    type: "down",
                  }),
                });

                toast.promise(downvote, {
                  loading: "Downvoting Response...",
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.message_id !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chat_id: chatId,
                            message_id: message.id,
                            is_upvoted: false,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return "Downvoted Response!";
                  },
                  error: "Failed to downvote response.",
                });
              }}
            >
              <ThumbDownIcon size={isMobile ? 12 : 14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>반대</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(PureMessageActions, (prevProps, nextProps) => {
  if (!equal(prevProps.vote, nextProps.vote)) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  return true;
});
