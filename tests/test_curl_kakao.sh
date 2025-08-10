#! /bin/bash

BASE_URL="http://localhost:3000/api/kakao"
# BASE_URL="https://dev.chat.factoreal.site/api/kakao"
# BASE_URL="https://cdb7-114-201-201-79.ngrok-free.app/api/kakao"

curl -X POST $BASE_URL \
-H "Content-Type: application/json" \
-d '{
  "userRequest": {
    "timezone": "Asia/Seoul",
    "callbackUrl": "https://dev.chat.factoreal.site/api/kakao",
    "params": {},
    "block": {
      "id": "block-id",
      "name": "챗봇 시작"
    },
    "utterance": "Wi-Fi 제품과 블루투스 제품의 KC 인증 시험 항목의 차이점",
    "lang": "ko",
    "user": {
      "id": "hashed_user_id_example",
      "type": "botUserKey",
      "properties": {
        "botUserKey": "actual_user_key_from_kakao_channel_12345"
      }
    }
  },
  "bot": {
    "id": "bot-id",
    "name": "내 AI 챗봇"
  },
  "action": {
    "name": "chatAction",
    "params": {},
    "id": "action-id",
    "detailParams": {}
  }
}'