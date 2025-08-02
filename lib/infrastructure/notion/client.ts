import { Client } from '@notionhq/client';
import {
  NotionReportData,
  ReportFormData,
  NOTION_CONFIG,
  NOTION_PROPERTIES,
  NOTION_SELECT_OPTIONS,
} from '../../shared/types/notion';

// Notion API 클라이언트 초기화
const notion = new Client({
  auth: NOTION_CONFIG.apiKey,
});

export async function createReport(
  data: ReportFormData,
  userId?: string,
  userName?: string,
  chatId?: string
): Promise<string> {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_CONFIG.databaseId,
      },
      properties: {
        [NOTION_PROPERTIES.title]: {
          title: [
            {
              text: {
                content: data.title,
              },
            },
          ],
        },
        [NOTION_PROPERTIES.description]: {
          rich_text: [
            {
              text: {
                content: data.description,
              },
            },
          ],
        },
        [NOTION_PROPERTIES.type]: {
          select: {
            name: NOTION_SELECT_OPTIONS.type[data.type],
          },
        },
        [NOTION_PROPERTIES.status]: {
          select: {
            name: NOTION_SELECT_OPTIONS.status.open,
          },
        },
        ...(userId && {
          [NOTION_PROPERTIES.userId]: {
            rich_text: [
              {
                text: {
                  content: userId,
                },
              },
            ],
          },
        }),
        ...(userName && {
          [NOTION_PROPERTIES.userName]: {
            rich_text: [
              {
                text: {
                  content: userName,
                },
              },
            ],
          },
        }),
        ...(chatId && {
          [NOTION_PROPERTIES.chatId]: {
            rich_text: [
              {
                text: {
                  content: chatId,
                },
              },
            ],
          },
        }),
        [NOTION_PROPERTIES.createdAt]: {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    });

    return response.id;
  } catch (error) {
    console.error('노션 데이터베이스에 리포트 추가 실패:', error);
    throw new Error('리포트를 저장하는 중 오류가 발생했습니다.');
  }
}

/**
 * 노션 데이터베이스에서 모든 리포트를 가져옵니다.
 */
export async function getAllReports(): Promise<NotionReportData[]> {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.databaseId,
      sorts: [
        {
          property: NOTION_PROPERTIES.createdAt,
          direction: 'descending',
        },
      ],
    });

    return response.results.map((page: any) => {
      const properties = page.properties;

      // 노션 속성에서 데이터 추출
      const title = properties[NOTION_PROPERTIES.title]?.title[0]?.plain_text || '';
      const description = properties[NOTION_PROPERTIES.description]?.rich_text[0]?.plain_text || '';
      const type = Object.keys(NOTION_SELECT_OPTIONS.type).find(
        (key) =>
          NOTION_SELECT_OPTIONS.type[key as keyof typeof NOTION_SELECT_OPTIONS.type] ===
          properties[NOTION_PROPERTIES.type]?.select?.name
      ) as any;
      const status = Object.keys(NOTION_SELECT_OPTIONS.status).find(
        (key) =>
          NOTION_SELECT_OPTIONS.status[key as keyof typeof NOTION_SELECT_OPTIONS.status] ===
          properties[NOTION_PROPERTIES.status]?.select?.name
      ) as any;
      const userId = properties[NOTION_PROPERTIES.userId]?.rich_text[0]?.plain_text || undefined;
      const userName =
        properties[NOTION_PROPERTIES.userName]?.rich_text[0]?.plain_text || undefined;
      const chatId = properties[NOTION_PROPERTIES.chatId]?.rich_text[0]?.plain_text || undefined;
      const createdAt = properties[NOTION_PROPERTIES.createdAt]?.date?.start || '';

      return {
        title,
        description,
        type,
        status,
        chatId,
        user_id: userId,
        user_name: userName,
        created_at: createdAt,
      };
    });
  } catch (error) {
    console.error('노션 데이터베이스에서 리포트 조회 실패:', error);
    throw new Error('리포트를 조회하는 중 오류가 발생했습니다.');
  }
}
