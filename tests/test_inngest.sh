#!/bin/bash

# Inngest 테스트 스크립트
# 목적: Inngest 함수의 작동 및 카카오 메시지 처리 이벤트를 테스트

# 기본 설정
INNGEST_API_URL="http://localhost:8288/" # Inngest Dev 서버 URL
KAKAO_API_URL="http://localhost:3000/api/kakao"
# 프로덕션 테스트 시 사용 URL
# KAKAO_API_URL="https://dev.chat.factoreal.site/api/kakao"
TEST_CALLBACK_URL="https://httpbin.org/post" # 테스트용 콜백 엔드포인트

# 색상 설정
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 1. 기본 Inngest 상태 확인
echo -e "${YELLOW}1. Inngest 상태 확인 중...${NC}"
INNGEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $INNGEST_API_URL/ping)

if [ "$INNGEST_STATUS" == "200" ]; then
  echo -e "${GREEN}✅ Inngest 서버가 실행 중입니다.${NC}"
else
  echo -e "${RED}❌ Inngest 서버가 실행되고 있지 않습니다. 'inngest dev' 명령어로 로컬 서버를 실행하세요.${NC}"
  echo "실행 방법: npx inngest-cli@latest dev"
  exit 1
fi

# 2. 직접 이벤트 전송 테스트
echo -e "\n${YELLOW}2. Inngest에 직접 이벤트 전송 테스트...${NC}"
INNGEST_EVENT_RESPONSE=$(curl -s -X POST $INNGEST_API_URL \
  -H "Content-Type: application/json" \
  -H "User-Agent: bot-api.kakao.com" \
  -d '{
    "name": "kakao/message.process.request",
    "data": {
      "originalCallbackUrl": "'$TEST_CALLBACK_URL'",
      "userUtterance": "테스트 메시지: KC 인증에 대해 알려줘",
      "userId": "test-user-'$(date +%s)'"
    }
  }')

# echo "응답: $INNGEST_EVENT_RESPONSE"

if [[ $INNGEST_EVENT_RESPONSE == *"id"* ]]; then
  echo -e "${GREEN}✅ Inngest 이벤트가 성공적으로 전송되었습니다.${NC}"
  EVENT_ID=$(echo $INNGEST_EVENT_RESPONSE | sed 's/.*"id":"\([^"]*\)".*/\1/')
  # echo "이벤트 ID: $EVENT_ID"
else
  echo -e "${RED}❌ Inngest 이벤트 전송에 실패했습니다.${NC}"
fi

# 3. 카카오 API를 통한 통합 테스트
echo -e "\n${YELLOW}3. 카카오 API를 통한 통합 테스트...${NC}"
KAKAO_RESPONSE=$(curl -s -X POST $KAKAO_API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "userRequest": {
      "timezone": "Asia/Seoul",
      "callbackUrl": "'$TEST_CALLBACK_URL'",
      "params": {},
      "block": {
        "id": "test-block-id",
        "name": "테스트"
      },
      "utterance": "KC인증 비용은 어떻게 되나요?",
      "lang": "ko",
      "user": {
        "id": "test-user-'$(date +%s)'",
        "type": "botUserKey",
        "properties": {
          "botUserKey": "test-kakao-user-'$(date +%s)'"
        }
      }
    },
    "bot": {
      "id": "test-bot-id",
      "name": "테스트 봇"
    },
    "action": {
      "name": "testAction",
      "params": {},
      "id": "test-action-id",
      "detailParams": {}
    }
  }')

echo "응답: $KAKAO_RESPONSE"

if [[ $KAKAO_RESPONSE == *"useCallback"* && $KAKAO_RESPONSE == *"true"* ]]; then
  echo -e "${GREEN}✅ 카카오 API가 성공적으로 useCallback:true로 응답했습니다.${NC}"
  echo "이제 Inngest 서버 로그에서 처리되는 이벤트를 확인하세요."
else
  echo -e "${RED}❌ 카카오 API 응답이 예상과 다릅니다.${NC}"
fi

# 4. Inngest 이벤트 로그 조회 안내
echo -e "\n${YELLOW}4. Inngest 이벤트 로그 확인 방법${NC}"
echo "1. Inngest UI: http://localhost:8288에 접속하여 이벤트 및 함수 실행 로그 확인"
echo "2. 서버 로그: Inngest 서버를 실행한 터미널에서 로그 확인"
echo "3. 콜백 확인: httpbin.org에서 $TEST_CALLBACK_URL로 전송된 데이터 확인"

echo -e "\n${GREEN}테스트 완료!${NC}" 