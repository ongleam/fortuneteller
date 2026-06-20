export interface KakaoRequestBody {
  userRequest: {
    callbackUrl?: string;
    timezone: string;
    params: {
      surface?: string;
      ignoreMe?: string;
    };
    block: {
      id: string;
      name: string;
    };
    utterance: string; // 사용자의 실제 발화 내용
    lang: string; // "ko" 등
    user: {
      id: string; // 사용자 식별자 (봇 ID + 사용자 ID 해시값)
      type: string; // "botUserKey" 등
      properties: {
        botUserKey?: string; // 실제 사용자 식별자
        plusfriendUserKey?: string; // 채널 추가한 사용자의 경우
        appUserId?: string; // 앱 연동된 경우
        // 기타 사용자 프로필 정보 (봇 관리자센터에서 설정 시)
        bot_user_key?: string; // (중복될 수 있음)
        plus_friend_user_key?: string; // (중복될 수 있음)
      };
    };
  };
  bot: {
    id: string;
    name: string;
  };
  action: {
    name: string;
    clientExtra?: any;
    params: Record<string, string>;
    id: string;
    detailParams: Record<
      string,
      {
        groupName: string;
        origin: string;
        value: string;
      }
    >;
  };
  contexts?: any[]; // 이전 대화 컨텍스트 (사용 시)
}

export interface KakaoSkillResponse {
  version: string;
  useCallback?: boolean;
  template?: {
    outputs: Array<{
      simpleText?: {
        text: string;
      };
      basicCard?: {
        title?: string;
        description?: string;
        thumbnail?: {
          imageUrl: string;
          fixedRatio?: boolean;
          width?: number;
          height?: number;
        };
        buttons?: Array<{
          action: "message" | "webLink" | "phone" | "block" | "share";
          label: string;
          messageText?: string;
          webLinkUrl?: string;
          phoneNumber?: string;
          blockId?: string;
        }>;
      };
      carousel?: {
        type: "basicCard" | "textCard" | "listCard" | "itemCard";
        items: Array<{
          title?: string;
          description?: string;
          thumbnail?: {
            imageUrl: string;
            fixedRatio?: boolean;
            width?: number;
            height?: number;
          };
          buttons?: Array<{
            action: "message" | "webLink" | "phone" | "block" | "share";
            label: string;
            messageText?: string;
            webLinkUrl?: string;
            phoneNumber?: string;
            blockId?: string;
          }>;
        }>;
      };
      commerceCard?: {
        description: string;
        price: number;
        currency: string;
        discount?: number;
        discountRate?: number;
        discountedPrice?: number;
        thumbnails: Array<{
          imageUrl: string;
          link?: {
            web: string;
          };
        }>;
        profile?: {
          nickname: string;
          imageUrl?: string;
        };
        buttons?: Array<{
          action: "message" | "webLink" | "phone" | "block" | "share";
          label: string;
          messageText?: string;
          webLinkUrl?: string;
          phoneNumber?: string;
          blockId?: string;
        }>;
      };
      listCard?: {
        header: {
          title: string;
          imageUrl?: string;
        };
        items: Array<{
          title: string;
          description?: string;
          imageUrl?: string;
          link?: {
            web: string;
          };
        }>;
        buttons?: Array<{
          action: "message" | "webLink" | "phone" | "block" | "share";
          label: string;
          messageText?: string;
          webLinkUrl?: string;
          phoneNumber?: string;
          blockId?: string;
        }>;
      };
      itemCard?: {
        thumbnail?: {
          imageUrl: string;
          fixedRatio?: boolean;
          width?: number;
          height?: number;
        };
        head?: {
          title: string;
        };
        profile?: {
          imageUrl?: string;
          nickname: string;
        };
        itemList?: Array<{
          title: string;
          description?: string;
        }>;
        itemListAlignment?: "left" | "right";
        itemListSummary?: {
          title: string;
          description: string;
        };
        title?: string;
        description?: string;
        buttons?: Array<{
          action: "message" | "webLink" | "phone" | "block" | "share";
          label: string;
          messageText?: string;
          webLinkUrl?: string;
          phoneNumber?: string;
          blockId?: string;
        }>;
      };
    }>;
    quickReplies?: Array<{
      action: "message" | "block";
      label: string;
      messageText: string;
      blockId?: string;
    }>;
  };
  context?: {
    values: Array<{
      name: string;
      lifeSpan: number;
      params: Record<string, string>;
    }>;
  };
  data?: Record<string, any>;
}

// 카카오 챗봇 버튼 액션 타입
type KakaoButtonAction = "message" | "webLink" | "phone" | "block" | "share";

// 카카오 챗봇 썸네일 타입
interface KakaoThumbnail {
  imageUrl: string;
  fixedRatio?: boolean;
  width?: number;
  height?: number;
}

// 카카오 챗봇 버튼 타입
export interface KakaoButton {
  action: KakaoButtonAction;
  label: string;
  messageText?: string;
  webLinkUrl?: string;
  phoneNumber?: string;
  blockId?: string;
}

// 카카오 챗봇 퀵리플라이 타입
export interface KakaoQuickReply {
  action: "message" | "block";
  label: string;
  messageText: string;
  blockId?: string;
}

export interface KakaoUserProfile {
  id: number;
  connected_at: string;
  synched_at: string;
  properties: {
    nickname: string;
    profile_image: string;
    thumbnail_image: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean;
      is_default_nickname: boolean;
    };
    name_needs_agreement: boolean;
    name: string;
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
    has_phone_number: boolean;
    phone_number_needs_agreement: boolean;
    phone_number: string;
    has_birthyear: boolean;
    birthyear_needs_agreement: boolean;
    birthyear: string;
    has_gender: boolean;
    gender_needs_agreement: boolean;
    gender: string;
  };
}
