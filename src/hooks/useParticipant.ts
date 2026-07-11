import { useCallback, useState } from "react";
import { joinSession } from "../api/sessions";
import type { StoredParticipant } from "../lib/storage";
import { getStoredParticipant, saveParticipant } from "../lib/storage";

export function useParticipant(code: string) {
  const [participant, setParticipant] = useState<StoredParticipant | null>(() =>
    code ? getStoredParticipant(code) : null,
  );

  const join = useCallback(
    async (joinCode: string, displayName?: string) => {
      const result = await joinSession(joinCode, displayName);
      const stored: StoredParticipant = {
        participantId: result.participant_id,
        displayName: result.display_name,
      };
      saveParticipant(joinCode, stored);
      if (joinCode.toUpperCase() === code.toUpperCase() || !code) setParticipant(stored);
      return result;
    },
    [code],
  );

  return { participant, join };
}
