import { getFaqsByVector } from '@/lib/db/queries';
import { getFaqsByVector as getFaqsByVectorSupabase } from '@/lib/supabase/queries';
import { formattingErrorMessage } from '@/lib/utils';
import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';

interface SearchFaqProps {
  dataStream?: DataStreamWriter;
}

const FAQ_TOOL_PROMPTS = tools.searchFaq;

export const searchFaq = ({ dataStream }: SearchFaqProps) =>
  tool({
    description: FAQ_TOOL_PROMPTS.description,
    parameters: z.object({
      query: z.string().describe(FAQ_TOOL_PROMPTS.parameters.query.description),
    }),
    execute: async ({ query }) => {
      console.log(`[INFO] searchFaq calling : '${query}'`);

      try {
        return await getFaqsByVector(query);
      } catch (error) {
        console.error(formattingErrorMessage(error));
        throw error;
      }
    },
  });

export const searchFaqBySupabase = ({ dataStream }: SearchFaqProps) =>
  tool({
    description: FAQ_TOOL_PROMPTS.description,
    parameters: z.object({
      query: z.string().describe(FAQ_TOOL_PROMPTS.parameters.query.description),
    }),
    execute: async ({ query }) => {
      console.log(`[INFO] searchFaq calling : '${query}'`);

      try {
        const vectorSearchStartTime = Date.now();
        const result = await getFaqsByVectorSupabase(query);
        const vectorSearchEndTime = Date.now();
        console.log(
          `[INFO] Vector Search FAQ time: ${vectorSearchEndTime - vectorSearchStartTime}ms`
        );
        return result;
      } catch (error) {
        console.error(formattingErrorMessage(error));
        throw error;
      }
    },
  });

export const searchFaqByEndpoint = ({ dataStream }: SearchFaqProps) =>
  tool({
    description: FAQ_TOOL_PROMPTS.description,
    parameters: z.object({
      query: z.string().describe(FAQ_TOOL_PROMPTS.parameters.query.description),
    }),
    execute: async ({ query }) => {
      console.log(`[INFO] searchFaq calling : '${query}'`);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/queries/get-faqs-by-vector?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error(formattingErrorMessage(error));
        throw error;
      }
    },
  });
