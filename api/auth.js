// api/auth.js
// Salesforce Username-Password OAuth Flow
// 모든 api/*.js 파일이 이 함수를 import해서 Salesforce Access Token을 받는다.
//
// 필요한 환경변수 (Vercel Settings > Environment Variables):
//   SF_LOGIN_URL     - https://login.salesforce.com
//   SF_CLIENT_ID     - Consumer Key
//   SF_CLIENT_SECRET - Consumer Secret
//   SF_USERNAME      - API 호출용 계정 (Username)
//   SF_PASSWORD      - 비밀번호 + Security Token을 이어붙인 값

export async function getSalesforceToken() {
  const requiredEnvVars = [
    'SF_LOGIN_URL',
    'SF_CLIENT_ID',
    'SF_CLIENT_SECRET',
    'SF_USERNAME',
    'SF_PASSWORD',
  ];

  // 환경변수가 아직 안 채워졌으면 명확한 에러 메시지로 알려줌
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Salesforce 인증 정보가 없습니다. Vercel 환경변수를 확인하세요: ${missing.join(', ')}`
    );
  }

  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: process.env.SF_CLIENT_ID,
    client_secret: process.env.SF_CLIENT_SECRET,
    username: process.env.SF_USERNAME,
    password: process.env.SF_PASSWORD, // 비밀번호 + Security Token 합친 값
  });

  const res = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Salesforce 인증 실패: ${errText}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url, // 예: https://your-org.my.salesforce.com
  };
}
