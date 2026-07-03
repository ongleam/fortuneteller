import {
  deleteChatById,
  getChatById,
  countUserMessages,
  getMessagesByChatId,
  createChat,
  createMessages,
} from "@fortuneteller/modules/chat/infra/queries";
import type { UIMessage } from "ai";
import { generateTitleFromUserMessage } from "@/actions/chat";
import { entitlementsByUserType } from "@fortuneteller/config/entitlements";
import {
  postRequestBodySchema,
  type PostRequestBody,
} from "@fortuneteller/modules/chat/application/dtos";
import { createToolCallingStream } from "@/lib/create-tool-calling-stream";
import type { DBMessage } from "@fortuneteller/db/schema";

// Convert stored DB messages into v6 UIMessages for model input.
// Only text/file parts are preserved to stay compatible with convertToModelMessages.
function toUIMessage(dbMessage: DBMessage): UIMessage {
  const parts = Array.isArray(dbMessage.parts) ? dbMessage.parts : [];
  const safeParts = parts.filter(
    (part: any) => part?.type === "text" || part?.type === "file",
  ) as UIMessage["parts"];

  return {
    id: dbMessage.id,
    role: dbMessage.role as UIMessage["role"],
    parts: safeParts,
  };
}

export const maxDuration = 60;
import { createServerClient } from "@fortuneteller/clients/supabase/server";

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    console.error("[ERROR] Invalid request body: ", _);
    return new Response("Invalid request body", { status: 400 });
  }

  try {
    const { id, message, selectedChatModel } = requestBody;
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // console.log('[Chat] User:', user);

    const isAnonymous = user?.is_anonymous;

    if (!isAnonymous && !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const entitlements = isAnonymous
      ? entitlementsByUserType["guest"]
      : entitlementsByUserType["regular"];

    const messageCount = await countUserMessages({
      id: user?.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlements.maxMessagesPerDay) {
      return new Response(
        "You have exceeded your maximum number of messages for the day! Please try again later.",
        {
          status: 429,
        },
      );
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await createChat({ id, userId: user.id, title });
    } else {
      if (chat.user_id !== user.id) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const messages: UIMessage[] = [...previousMessages.map(toUIMessage), message as UIMessage];

    await createMessages({
      messages: [
        {
          chat_id: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          created_at: new Date(),
        },
      ],
    });
    return await createToolCallingStream({
      message,
      messages,
      model: selectedChatModel,
      userId: user.id,
      chatId: id,
    });
  } catch (_) {
    console.error("[ERROR] Failed to process chat request: ", _);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.user_id !== user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
