// api/signup.js
// Fan App 회원가입 → Salesforce Person Account 생성
//
// [디버깅 중] Phone 필드에서 "No such column 'Phone'" 에러 발생 (2026-08-14)
// → Integration User(Client Credentials Flow)의 FLS(필드 레벨 보안) 문제로 추정
// → 원인 확정을 위해 Phone 필드 임시 제외. 확정되면 승우님께 권한 추가 요청 후 복구.

import { getSalesforceToken } from './auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { name, phone, channel, consent } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'name은 필수입니다.' });
    }

    const { accessToken, instanceUrl } = await getSalesforceToken();

    // TODO: Phone 필드 FLS 확인되면 복구 — Phone: phone,
    const accountPayload = {
      LastName: name,
      Acquisition_Channel__c: Array.isArray(channel) && channel.length > 0 ? channel[0] : null,
      Email_Opt_In__c: !!consent?.email,
      SMS_Opt_In__c: !!consent?.sms,
      Push_Opt_In__c: !!consent?.push,
      Kakao_Opt_In__c: !!consent?.kakao,
    };

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
