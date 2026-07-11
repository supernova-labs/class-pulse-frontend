import { useCallback, useState } from "react";
import { joinSession } from "../api/sessions";
import type { StoredParticipant } from "../lib/storage";
import { getStoredParticipant, saveParticipant } from "../lib/storage";

export function useParticipant(code: string) {
  const normalizedCode = code.trim();
  const [participant, setParticipant] = useState<StoredParticipant | null>(() =>
    normalizedCode ? getStoredParticipant(normalizedCode) : null,
  );

  // re-sync when navigating between sessions without a full reload
  const [lastCode, setLastCode] = useState(normalizedCode);
  if (normalizedCode !== lastCode) {
    setLastCode(normalizedCode);
    setParticipant(normalizedCode ? getStoredParticipant(normalizedCode) : null);
  }

  const join = useCallback(
    async (joinCode: string, displayName?: string) => {
      const targetCode = joinCode.trim();
      const result = await joinSession(targetCode, displayName);
      const stored: StoredParticipant = {
        participantId: result.participant_id,
        displayName: result.display_name,
      };
      saveParticipant(targetCode, stored);
      if (targetCode.toUpperCase() === normalizedCode.toUpperCase() || !normalizedCode) {
        setParticipant(stored);
      }
      return result;
    },
    [normalizedCode],
  );

  return { participant, join };
}
