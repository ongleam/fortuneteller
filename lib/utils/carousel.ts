import { GenerateTextResult } from 'ai';
import { getKSTDateTime } from '@/lib/utils';
import { ResponseMessage } from '@/lib/types/ai';
import { KakaoButton } from '@/lib/types/kakao';
import { certificationNameToCarouselButtonText, factorDescription } from '@/config/kakaoCarousel';

// --- 캐러셀 아이템 데이터 구조 정의 (LLM 응답의 answer 파싱 후) ---
interface CarouselItemData {
  id: string;
  isCarouselItem: boolean;
  product: string;
  variant: string;
  search_keywords?: string[];
  certifications: Array<{
    name: string;
    purchaseAgencyAvailable?: boolean;
    requiredSamples?: string;
    estimatedPeriod?: string;
  }>;
}

export function createCarouselItemsFromLlmResponse(llmResponse: GenerateTextResult<any, any>): {
  items: any[];
  showCarousel: boolean;
} {
  let carouselItems: any[] = [];
  let showCarousel = false;
  const responseMessages = llmResponse.response.messages as ResponseMessage[];

  for (const message of responseMessages) {
    for (const contentPart of message.content) {
      if (
        contentPart.type === 'tool-result' &&
        contentPart.toolName === 'searchFaq' &&
        contentPart.result
      ) {
        const faqResults = contentPart.result as Array<{
          question: string;
          answer: string;
          similarity: number;
        }>;

        // 첫 번째 결과의 isCarouselItem 값을 확인
        if (faqResults.length > 0) {
          try {
            const firstAnswer = JSON.parse(faqResults[0].answer) as CarouselItemData;
            showCarousel = firstAnswer.isCarouselItem === true;
          } catch (e) {
            console.warn(`[${getKSTDateTime()}] [Inngest] Failed to parse first FAQ answer:`, {
              error: e instanceof Error ? e.message : 'Unknown error',
              answer: faqResults[0].answer.substring(0, 100) + '...',
            });
            showCarousel = false;
          }
        }

        for (const faq of faqResults) {
          try {
            let answerData: CarouselItemData | null = null;

            // JSON 형식인 경우 파싱 시도
            if (faq.answer.startsWith('{') && faq.answer.endsWith('}')) {
              try {
                answerData = JSON.parse(faq.answer) as CarouselItemData;
              } catch (parseError) {
                console.log(
                  `[${getKSTDateTime()}] [Inngest] Failed to parse JSON answer:`,
                  faq.answer.substring(0, 100) + '...'
                );
              }
            }

            // JSON이 아니거나 파싱에 실패한 경우, 일반 텍스트로 처리
            if (!answerData) {
              console.log(
                `[${getKSTDateTime()}] [Inngest] Processing non-JSON answer as plain text:`,
                faq.answer.substring(0, 100) + '...'
              );
              continue;
            }

            const product = answerData.product.replace(/\([^)]*\)/g, '').trim();
            const variant = answerData.variant ? `(${answerData.variant})` : '';
            console.log('variant: ', variant);
            // 필수 필드 검증
            if (!answerData.product || !Array.isArray(answerData.certifications)) {
              console.log(
                `[${getKSTDateTime()}] [Inngest] Skipping item with missing required fields:`,
                {
                  product: answerData.product,
                  hasCertifications: Array.isArray(answerData.certifications),
                }
              );
              continue;
            }

            if (answerData.isCarouselItem) {
              let isAgencyPurchaseAvailable = answerData.certifications.every(
                (certification) => certification.purchaseAgencyAvailable
              );
              const description = `구매대행: ${isAgencyPurchaseAvailable ? '✅' : '❌'} \n${
                variant ? factorDescription[variant.replace(/\(|\)/g, '')] : ''
              }`;
              let buttons: KakaoButton[] = [];
              answerData.certifications.forEach((certification) => {
                const buttonLabel =
                  certificationNameToCarouselButtonText[certification.name] || certification.name;
                buttons.push({
                  action: 'message',
                  label: buttonLabel,
                  messageText: `${buttonLabel} 상세정보`,
                });
              });

              carouselItems.push({
                title: `${product} ${variant}`,
                description: description,
                buttons: buttons,
              });
            }
          } catch (e) {
            console.error(`[${getKSTDateTime()}] [Inngest] Failed to parse FAQ answer:`, {
              error: e instanceof Error ? e.message : 'Unknown error',
              answer: faq.answer.substring(0, 100) + '...',
              question: faq.question,
            });
            continue;
          }
        }
      }
    }
  }
  // 최대 5개의 캐러셀 아이템만 반환 (카카오톡 제한)
  return { items: carouselItems.slice(0, 5), showCarousel };
}
