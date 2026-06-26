"use client";

import { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion } from "framer-motion";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
}

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const isMobile = useIsMobile();

  const suggestedActions = [
    {
      title: "What is the GNI requirement for the F1-D visa?",
      label: "Visa question",
      action: "What is the GNI requirement for the F1-D visa?",
    },

    {
      title:
        "Will I become a tax resident in Korea if I stay for more than 183 days on the F-1-D visa?",
      label: "Tax question",
      action:
        "Will I become a tax resident in Korea if I stay for more than 183 days on the F-1-D visa?",
    },
    // {
    //   title: 'What are the advantages',
    //   label: 'of using Next.js?',
    //   action: 'What are the advantages of using Next.js?',
    // },
    // {
    //   title: 'Write code to',
    //   label: `demonstrate djikstra's algorithm`,
    //   action: `Write code to demonstrate djikstra's algorithm`,
    // },
    // {
    //   title: "Help me write an essay",
    //   label: `about silicon valley`,
    //   action: `Help me write an essay about silicon valley`,
    // },
  ];

  return (
    <div data-testid="suggested-actions" className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, "", `/chat/${chatId}`);

              sendMessage({
                text: suggestedAction.action,
              });
            }}
            className={`h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border text-left ${
              isMobile ? "px-3 py-2.5 text-xs" : "px-4 py-3.5 text-sm sm:flex-col"
            }`}
          >
            <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium">
              {suggestedAction.title}
            </span>
            <span className="text-muted-foreground text-xs">{suggestedAction.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
