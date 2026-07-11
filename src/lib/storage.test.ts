import {
  clearAdminToken,
  getAdminToken,
  getStoredParticipant,
  saveAdminToken,
  saveParticipant,
} from "./storage";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("persists and reads the participant per session code, case-insensitive", () => {
    saveParticipant("por-8841", { participantId: "abc", displayName: "Marina" });
    expect(getStoredParticipant("POR-8841")).toEqual({
      participantId: "abc",
      displayName: "Marina",
    });
    expect(getStoredParticipant("OTHER-1234")).toBeNull();
  });

  it("stores and clears the admin token", () => {
    saveAdminToken("token-123");
    expect(getAdminToken()).toBe("token-123");
    clearAdminToken();
    expect(getAdminToken()).toBeNull();
  });
});
