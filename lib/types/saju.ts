// 타입 정의
interface UserInfo {
  name: string;
  gender: string;
  birthType: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
}

interface Order3MakeResponse {
  statusCode: number;
  message: string;
  order3Id: number;
}

interface Order3FreePayload {
  order3Id: number;
}

interface SajuOutput {
  saju: any | null;
  sinsals: any | null;
}
