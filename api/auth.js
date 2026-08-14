// api/auth.js
// Salesforce OAuth 2.0 Client Credentials Flow
// (기존 Username-Password Flow에서 전환 — 2026-08-14)
//
// 이 방식은 사람 로그인을 흉내내지 않고, 등록된 클라이언트(Client ID/Secret) 자체를 인증한다.
// 실행 권한은 External Client App에 미리 지정된 "Run As" Integration User를 따른다
// (Salesforce 쪽 설정이라 이 코드엔 등장하지 않음).
//
// 필요한 환경변수 (Vercel Settings > Environment Variables):
//   SF_LOGIN_URL     - My Domain 기반 URL (예: https://trailsignup-xxxx.my.salesforce.com)
//                       ⚠️ login.salesforce.com이 아니라 My Domain URL이어야 함
//   SF_CLIENT_ID     - Consumer Key
//   SF_CLIENT_SECRET - Consumer Secret
//
// 더 이상 필요 없음 (삭제 대상): SF_USERNAME, SF_PASSWORD

export async function getSalesforceToken() {
  const requiredEnvVars = ['SF_LOGIN_URL', 'SF_CLIENT_ID', 'SF_CLIENT_SECRET'];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Salesforce 인증 정보가 없습니다. Vercel 환경변수를 확인하세요: ${missing.join(', ')}`
    );
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.SF_CLIENT_ID,
    client_secret: process.env.SF_CLIENT_SECRET,
  });

  const res = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!res.ok) {
    const errText = await res.text();
    // invalid_client / invalid_grant / unauthorized_client 등이 여기 담겨서 옴
    throw new Error(`Salesforce 인증 실패: ${errText}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url,
  };
}
