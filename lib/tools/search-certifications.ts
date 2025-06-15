// import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import { tools } from '@/config/prompts';
import {
  getCertificationsByCategorySimilarity,
  getCertificationsByVector,
  getCertificationDetailsByIds,
} from '@/lib/db/queries';

import {
  getCertificationsByCategory as getCertificationsByCategorySupabase,
  getCertificationsBySimilarity as getCertificationsByCategorySimilaritySupabase,
  getCertificationsByVector as getCertificationsByVectorSupabase,
} from '@/lib/supabase/queries';
import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';

interface SearchCertificationsProps {
  dataStream?: DataStreamWriter;
}

const TOOL = tools['searchCertifications'];
const SIMILARITY_THRESHOLD = 0.7;
const COSINE_SIMILARITY_THRESHOLD = 0.7;

export const searchCertifications = ({ dataStream }: SearchCertificationsProps) =>
  tool({
    description: TOOL.description,
    parameters: z.object({
      product: z.string().describe(TOOL.parameters.product.description),
    }),
    execute: async ({ product }) => {
      console.log(`[INFO] Query Supabase: '${product}'`);

      let certs = [];
      try {
        // const data = await getCertificationsByCategory(product);
        // console.log(`[INFO] ILIKE Search found ${data.length} results.`);
        certs = await getCertificationsByCategorySimilarity(product, SIMILARITY_THRESHOLD);

        if (certs.length === 0) {
          console.log(`[INFO] data is empty. try vector search...`);
          certs = await getCertificationsByVector(product, COSINE_SIMILARITY_THRESHOLD);
          console.log(`[INFO] Vector Search found ${certs.length} results.`);
        }

        // const allDetailIds = certs.flatMap((cert) => cert.detail_ids ?? []);

        // const uniqueDetailIds = [...new Set(allDetailIds)];

        const allDetails = await getCertificationDetailsByIds([]);

        const certsWithDetails = certs.map((cert) => ({
          ...cert,
          certification_details:
            cert.detail_ids
              ?.map((id) => allDetails.find((detail) => detail.id === id))
              .filter(Boolean) ?? [],
        }));

        return certsWithDetails;
      } catch (error) {
        // const errorMessage = formattingErrorMessage(error);
        console.error(`[ERROR] Query Supabase error: ${error}`);
        throw error;
      }
    },
  });

export const searchCertificationsBySupabase = ({ dataStream }: SearchCertificationsProps) =>
  tool({
    description: TOOL.description,
    parameters: z.object({
      product: z.string().describe(TOOL.parameters.product.description),
    }),
    execute: async ({ product }) => {
      console.log(`[INFO] Query Supabase: '${product}'`);

      let certs = [];
      try {
        // certs = await getCertificationsByCategorySupabase(product);
        // console.log(`[INFO] ILIKE Search found ${data.length} results.`);
        const ilikeSearchStartTime = Date.now();
        certs = (await getCertificationsByCategorySimilaritySupabase(product, 0.7)) ?? [];
        const ilikeSearchEndTime = Date.now();
        console.log(`[INFO] ILIKE Search time: ${ilikeSearchEndTime - ilikeSearchStartTime}ms`);

        if (certs.length === 0) {
          console.log(`[INFO] data is empty. try vector search...`);
          const vectorSearchStartTime = Date.now();

          certs =
            (await getCertificationsByVectorSupabase(product, COSINE_SIMILARITY_THRESHOLD)) ?? [];
          const vectorSearchEndTime = Date.now();
          console.log(`[INFO] Vector Search found ${certs.length} results.`);
          console.log(
            `[INFO] Vector Search time: ${vectorSearchEndTime - vectorSearchStartTime}ms`
          );
        }
        return certs;
      } catch (error) {
        // const errorMessage = formattingErrorMessage(error);
        console.error(`[ERROR] Query Supabase error: ${error}`);
        throw error;
      }
    },
  });

export const searchCertificationsByEndpoint = ({ dataStream }: SearchCertificationsProps) =>
  tool({
    description: TOOL.description,
    parameters: z.object({
      product: z.string().describe(TOOL.parameters.product.description),
    }),
    execute: async ({ product }) => {
      console.log(`[INFO] Query Supabase: '${product}'`);

      let certs = [];
      try {
        // certs = await getCertificationsByCategorySupabase(product);
        // console.log(`[INFO] ILIKE Search found ${data.length} results.`);
        // certs = (await getCertificationsByCategorySimilaritySupabase(product, 0.7)) ?? [];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/queries/get-certifications-by-similarity?query=${encodeURIComponent(product)}`
        );

        const data = await response.json();
        certs = data;
        console.log(certs);

        if (certs.length === 0) {
          console.log(`[INFO] data is empty. try vector search...`);
          // certs =
          //   (await getCertificationsByVectorSupabase(product, COSINE_SIMILARITY_THRESHOLD)) ?? [];
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/queries/get-certifications-by-vector?query=${encodeURIComponent(product)}`
          );
          const data = await response.json();
          certs = data;
          console.log(certs);

          console.log(`[INFO] Vector Search found ${certs.length} results.`);
        }

        // const allDetailIds = certs.flatMap((cert) => cert.detail_ids ?? []);

        // const uniqueDetailIds = [...new Set(allDetailIds)];

        // const allDetails = await getCertificationDetailsByIds([]);

        // const certsWithDetails = certs.map((cert) => ({
        //   ...cert,
        //   certification_details:
        //     cert.detail_ids
        //       ?.map((id) => allDetails.find((detail) => detail.id === id))
        //       .filter(Boolean) ?? [],
        // }));

        // return certsWithDetails;
        // console.log(certs);
        return certs;
      } catch (error) {
        // const errorMessage = formattingErrorMessage(error);
        console.error(`[ERROR] Query Supabase error: ${error}`);
        throw error;
      }
    },
  });
