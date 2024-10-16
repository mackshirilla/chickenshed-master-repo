// state/selectedSessions.ts

export const loadSelectedSession = () => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  return state.selectedSession || null;
};

export const saveSelectedSession = (session: {
  id: string;
  details: string;
}) => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  state.selectedSession = session;
  localStorage.setItem("registrationState", JSON.stringify(state));
};

export const resetSelectedSessions = () => {
  const registrationState = JSON.parse(
    localStorage.getItem("registrationState") || "{}"
  );
  registrationState.selectedSessions = [];
  localStorage.setItem("registrationState", JSON.stringify(registrationState));
};

export const updateSelectedSessions = (
  sessionId: string,
  studentId: number,
  checked: boolean
) => {
  const registrationState = JSON.parse(
    localStorage.getItem("registrationState") || "{}"
  );

  if (!registrationState.selectedSessions) {
    registrationState.selectedSessions = [];
  }

  let session = registrationState.selectedSessions.find(
    (s: any) => s.sessionId === sessionId
  );

  if (checked) {
    if (!session) {
      session = { sessionId: sessionId, studentIds: [studentId] };
      registrationState.selectedSessions.push(session);
    } else {
      if (!session.studentIds.includes(studentId)) {
        session.studentIds.push(studentId);
      }
    }
  } else {
    if (session) {
      session.studentIds = session.studentIds.filter(
        (id: number) => id !== studentId
      );
      if (session.studentIds.length === 0) {
        registrationState.selectedSessions =
          registrationState.selectedSessions.filter(
            (s: any) => s.sessionId !== sessionId
          );
      }
    }
  }

  localStorage.setItem("registrationState", JSON.stringify(registrationState));
};
