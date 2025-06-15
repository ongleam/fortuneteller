import { generateText, UIMessage } from 'ai';
import { generateUUID } from '../utils';
import { baseAgent } from '../agents/base';

export async function getAgentResponse(query: string) {
  const userQuery = `<USER>${query}</USER>`;

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
