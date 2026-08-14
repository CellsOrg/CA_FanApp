// api/signup.js
// Fan App 회원가입 → Salesforce Person Account 생성
//
// 필드 매핑 (2026-08-13 org 조회로 확인된 실제 API 이름 기준):
//   name          → LastName (Person Account는 Name이 아니라 LastName)
//   phone         → Phone
//   channel[0]    → Acquisition_Channel__c (단일 Picklist — MVP는 첫 번째 값만 사용, Decision 참고)
//   consent.email → Email_Opt_In__c
//   consent.sms   → SMS_Opt_In__c
//   consent.push  → Push_Opt_In__c
//   consent.kakao → Kakao_Opt_In__c
//
// 주의: consent.terms(이용약관), consent.privacy(개인정보)는 프론트엔드 가입 검증용일 뿐,
//       대응하는 Salesforce 필드가 아직 없어 전송하지 않음 (승우님 확인 대기 중 — Decision 문서 참고).

import { getSalesforceToken } from './auth.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { name, phone, channel, consent } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'name과 phone은 필수입니다.' });
    }

    const { accessToken, instanceUrl } = await getSalesforceToken();

    const accountPayload = {
      LastName: name,
      Phone: phone,
      Acquisition_Channel__c: Array.isArray(channel) && channel.length > 0 ? channel[0] : null,
      Email_Opt_In__c: !!consent?.email,
      SMS_Opt_In__c: !!consent?.sms,
      Push_Opt_In__c: !!consent?.push,
      Kakao_Opt_In__c: !!consent?.kakao,
    };

    // Person Account RecordTypeId가 이 org에 필요하면 Vercel 환경변수로 지정
    // (승우님께 확인 필요 — 없으면 생략하고 시도)
    if (process.env.SF_PERSON_ACCOUNT_RECORD_TYPE_ID) {
      accountPayload.RecordTypeId = process.env.SF_PERSON_ACCOUNT_RECORD_TYPE_ID;
    }

    const accountRes = await fetch(`${instanceUrl}/services/data/v67.0/sobjects/Account`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountPayload),
    });

    const accountData = await accountRes.json();

    if (!accountRes.ok) {
      console.error('[api/signup] Salesforce error:', accountData);
      return res.status(400).json({ success: false, error: accountData });
    }

    return res.status(200).json({ success: true, accountId: accountData.id });
  } catch (error) {
    console.error('[api/signup] error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
