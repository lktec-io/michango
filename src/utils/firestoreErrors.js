const MESSAGES = {
  'permission-denied': 'You do not have permission to access this data. Please sign in again.',
  unauthenticated: 'Your session has expired. Please sign in again.',
  unavailable: 'The database is temporarily unavailable. Please check your connection and try again.',
  'resource-exhausted': 'The service is busy right now. Please try again in a moment.',
  'deadline-exceeded': 'The request took too long to respond. Please try again.',
  cancelled: 'The request was cancelled. Please try again.',
  'failed-precondition': 'This data view is still being prepared on our end. Please try again shortly.',
  'not-found': 'The requested data could not be found.',
};

/** Maps a Firestore/Firebase error to a friendly, actionable message for the UI. */
export function getFirestoreErrorMessage(error) {
  const code = (error?.code || '').replace(/^firestore\//, '');
  return MESSAGES[code] || error?.message || 'Something went wrong while talking to the database. Please try again.';
}
