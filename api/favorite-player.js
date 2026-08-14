// api/favorite-player.js
// 최애 선수 선택 → Salesforce Account.Favorite_Player__c 업데이트
//
// Fan App의 player id(player-moon 등)를 Salesforce Contact Id로 매핑해서 사용.
// (Fan App 4명만 매핑 — 나머지 팀원은 필요 시 추가)

import { getSalesforceToken } from './auth.js';

const PLAYER_ID_MAP = {
  'player-moon': '003bm00001h8hPtAAI', // 문태양
  'player-kang': '003bm00001h8oUbAAI', // 강도윤
  'player-lee': '003bm00001h8o4pAAA',  // 이서준
  'player-park': '003bm00001h8oUdAAI', // 박현우
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { fanId, playerId } = req.body;

    if (!fanId) {
      return res.status(400).json({ success: false, error: 'fanId는 필수입니다.' });
    }

    const { accessToken, instanceUrl } = await getSalesforceToken();

    // playerId가 'none'이거나 없으면 최애 선수를 비움
    const salesforcePlayerId = playerId && PLAYER_ID_MAP[playerId] ? PLAYER_ID_MAP[playerId] : null;

    const updateRes = await fetch(
      `${instanceUrl}/services/data/v67.0/sobjects/Account/${fanId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Favorite_Player__c: salesforcePlayerId }),
      }
    );

    // PATCH 성공 시 204 No Content (본문 없음)
    if (!updateRes.ok) {
      const errData = await updateRes.json();
      console.error('[api/favorite-player] Salesforce error:', errData);
      return res.status(400).json({ success: false, error: errData });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[api/favorite-player] error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
