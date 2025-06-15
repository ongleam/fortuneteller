import { generateText, UIMessage } from 'ai';
import { generateUUID } from '../utils';
import { baseAgent } from '../agents/base';

export function getTodaysDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getSingleResponse(query: string) {
  const userQuery = `TODAY DATE INFO: ${getTodaysDate()}\n<USER>${query}</USER>`;

  console.log('userQuery: ', userQuery);
  const userMessage: UIMessage = {
    id: generateUUID(),
    role: 'user',
    parts: [
      {
        type: 'text',
        text: userQuery,
      },
    ],
    content: userQuery,
  };

  const agentConfig = baseAgent({
    model: 'chat-model',
    messages: [userMessage],
  });
  const result = await generateText({
    ...agentConfig,
    maxSteps: 1,
  });

  console.log('result: ', JSON.stringify(result, null, 2));
  return result.text;
}

export async function getContextResponse(messages: any[]) {
  const agentConfig = baseAgent({
    model: 'chat-model',
    messages: messages,
  });
  const result = await generateText({
    ...agentConfig,
    maxSteps: 1,
  });

  console.log('result: ', JSON.stringify(result, null, 2));
  return result.text;
}
