// api/checkin.js
// 체크인 → Salesforce Admission__c 생성
//
// Fan App의 game id를 Salesforce Game__c Id로 매핑해서 사용.
// (현재 Fan App 5경기 중 4개만 Salesforce에 매칭됨 — 나머지는 승우님 요청 후 추가 예정)

import { getSalesforceToken } from './auth.js';

const GAME_ID_MAP = {
  'game-001': 'a5Lbm0000000UAzEAM', // 5/2 vs 레드폭스
  'game-002': 'a5Lbm0000000UPaEAM', // 5/9 vs 스톰이글스
  'game-003': 'a5Lbm0000000UPbEAM', // 5/16 vs 그린드래곤스
  'game-005': 'a5Lbm0000000UPcEAM', // 5/30 vs 선더버즈
  // 'game-004' (5/23)는 Salesforce에 아직 없음 — 승우님 데이터 추가 후 매핑
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { fanId, gameId, gate, section, row, seatNumber } = req.body;

    if (!fanId) {
      return res.status(400).json({ success: false, error: 'fanId는 필수입니다.' });
    }

    const salesforceGameId = gameId && GAME_ID_MAP[gameId] ? GAME_ID_MAP[gameId] : null;
    if (!salesforceGameId) {
      // 매핑 안 되는 경기는 조용히 스킵 (에러 아님 — 아직 Salesforce에 없는 경기)
      return res.status(200).json({ success: false, error: '아직 연동되지 않은 경기입니다.', skipped: true });
    }

    const { accessToken, instanceUrl } = await getSalesforceToken();

    const admissionRes = await fetch(`${instanceUrl}/services/data/v67.0/sobjects/Admission__c`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Fan__c: fanId,
        Game__c: salesforceGameId,
        Admission_Time__c: new Date().toISOString(),
        Gate__c: gate || null,
        Section__c: section || null,
        Row__c: row || null,
        Seat_Number__c: seatNumber || null,
      }),
    });

    const admissionData = await admissionRes.json();

    if (!admissionRes.ok) {
      console.error('[api/checkin] Salesforce error:', admissionData);
      return res.status(400).json({ success: false, error: admissionData });
    }

    return res.status(200).json({ success: true, admissionId: admissionData.id });
  } catch (error) {
    console.error('[api/checkin] error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
