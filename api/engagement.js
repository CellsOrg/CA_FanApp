// api/engagement.js
// 앱 활동 신호 → Salesforce Engagement_Signal__c 생성
//
// 우선은 "App Open"(앱 실행) 신호만 전송. 나머지 타입(Login, Purchase 등)은
// 호출 빈도가 높아 성능/데이터량 영향을 고려해 추후 필요 시 확장.
//
// 필드 매핑:
//   type   → Signal_Type__c
//   source → Source__c
//   player → Player__c (선택)
//   date   → Signal_Date__c

import { getSalesforceToken } from './auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { fanId, type, source, player, date } = req.body;

    if (!fanId || !type) {
      return res.status(400).json({ success: false, error: 'fanId와 type은 필수입니다.' });
    }

    const { accessToken, instanceUrl } = await getSalesforceToken();

    const signalRes = await fetch(`${instanceUrl}/services/data/v67.0/sobjects/Engagement_Signal__c`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Fan__c: fanId,
        Signal_Type__c: type,
        Source__c: source || null,
        Player__c: player || null,
        Signal_Date__c: date || new Date().toISOString(),
      }),
    });

    const signalData = await signalRes.json();

    if (!signalRes.ok) {
      console.error('[api/engagement] Salesforce error:', signalData);
      return res.status(400).json({ success: false, error: signalData });
    }

    return res.status(200).json({ success: true, signalId: signalData.id });
  } catch (error) {
    console.error('[api/engagement] error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
