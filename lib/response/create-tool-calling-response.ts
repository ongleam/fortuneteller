import {
  appendResponseMessages,
  DataStreamWriter,
  generateText,
  smoothStream,
  streamText,
} from 'ai';
import { baseAgent } from '../agents/base';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { saveMessages } from '../db/queries';
import { isProductionEnvironment } from '../constants';

const MAX_STEPS = 5;

interface BaseResponseConfig {
  message: any;
  messages: any[];
  model: string;
  session: any;
  userId: string;
  chatId: string;
}

// export function createToolCallingResponse(modelConfig: BaseResponseConfig) {
//   return generateText({
//     ...modelConfig,
//     maxSteps: MAX_STEPS,
//   });
// }
