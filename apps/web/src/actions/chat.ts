"use server";

import { cookies } from "next/headers";
import type { UIMessage } from "ai";
import type { VisibilityType } from "@fortuneteller/shared/types/chat";
import {
  generateTitleFromUserMessage as generateTitle,
  generateRecommandQuestions as generateRecommand,
} from "@fortuneteller/modules/chat/application/handlers";
import {
  DeleteTrailingMessages,
  UpdateChatVisibility,
} from "@fortuneteller/modules/chat/domain/commands";
import { aiClient } from "@fortuneteller/modules/chat/infra/ai-client";
import { myProvider } from "@/lib/registry";
import { bus } from "@/bootstrap/bus";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({ message }: { message: UIMessage }) {
  return generateTitle({ message, model: myProvider.languageModel("title-model"), aiClient });
}

export async function generateRecommandQuestions(args: {
  userUtterance: string;
  questions: string[];
}) {
  return generateRecommand({ ...args, model: myProvider.languageModel("chat-model"), aiClient });
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  return bus.handle(DeleteTrailingMessages({ id }));
}

export async function updateChatVisibility(args: { chatId: string; visibility: VisibilityType }) {
  return bus.handle(UpdateChatVisibility(args));
}
