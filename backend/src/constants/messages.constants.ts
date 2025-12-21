export const AUTH_MESSAGES = {
  FIREBASE_TOKEN_REQUIRED: 'Firebase token is required',
  FIREBASE_TOKEN_INVALID: 'Firebase token verification failed',
  EMAIL_NOT_FOUND: 'Email not found in Firebase token',
  AUTH_SUCCESS: 'Authentication successful',
  AUTH_FAILED: 'Authentication failed',
  AUTH_REQUIRED: 'Authentication required',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGOUT_FAILED: 'Logout failed',
  TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully',
  TOKEN_REFRESH_FAILED: 'Failed to refresh token',
  NOT_AUTHENTICATED: 'Not authenticated',
} as const;

export const USER_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_NOT_FOUND: 'User not found',
} as const;

export const POLL_MESSAGES = {
  POLL_CREATED: 'Poll created successfully',
  POLL_UPDATED: 'Poll updated successfully',
  POLL_DELETED: 'Poll deleted successfully',
  POLL_NOT_FOUND: 'Poll not found',
  POLL_UNAUTHORIZED: 'You are not authorized to perform this action',
  POLL_CREATE_FAILED: 'Failed to create poll',
  POLL_UPDATE_FAILED: 'Failed to update poll',
  POLL_DELETE_FAILED: 'Failed to delete poll',
  POLL_FETCH_FAILED: 'Failed to fetch polls',
  POLL_VOTE_SUCCESS: 'Vote recorded successfully',
  POLL_VOTE_FAILED: 'Failed to record vote',
  POLL_NOT_ACTIVE: 'This poll is not active',
  POLL_EXPIRED: 'This poll has expired',
} as const;