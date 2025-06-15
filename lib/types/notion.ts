// 노션 API와 연동하기 위한 타입 정의

export type ReportType = 'bug' | 'feature' | 'other';
export type StatusType = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface ReportFormData {
  title: string;
  description: string;
  type: ReportType;
  chatId?: string;
}

export interface NotionReportData extends ReportFormData {
  status: StatusType;
  user_id?: string;
  user_name?: string;
  created_at: string;
}

// 노션 데이터베이스 ID 및 API 키 설정
export const NOTION_CONFIG = {
  databaseId: process.env.NOTION_FEEDBACK_DATABASE_ID || '',
  apiKey: process.env.NOTION_API_KEY || '',
};

// 노션 속성 매핑 (Notion 데이터베이스의 속성 이름과 매핑)
export const NOTION_PROPERTIES = {
  title: '이름',
  description: '설명',
  type: '유형',
  chatId: '채팅 ID',
  status: '상태',
  userId: '사용자 ID',
  userName: '사용자 이름',
  createdAt: '생성일',
};

// 노션 선택 옵션 값 매핑
export const NOTION_SELECT_OPTIONS = {
  type: {
    contact: '문의',
    bug: '버그',
    feature: '기능 요청',
    other: '기타',
  },
  status: {
    open: '미해결',
    in_progress: '진행중',
    resolved: '해결됨',
  },
};
