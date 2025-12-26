import { describe, it, expect } from 'vitest';
import authErrorMessage from '../authErrorMessage';

describe('authErrorMessage', () => {
  it('should return correct message for account-exists-with-different-credential', () => {
    const error = { code: 'auth/account-exists-with-different-credential' };
    expect(authErrorMessage(error)).toBe('user already exist with different signin method');
  });

  it('should return correct message for credential-already-in-use', () => {
    const error = { code: 'auth/credential-already-in-use' };
    expect(authErrorMessage(error)).toBe('user already exist with the same information');
  });

  it('should return correct message for email-already-in-use', () => {
    const error = { code: 'auth/email-already-in-use' };
    expect(authErrorMessage(error)).toBe('unique email id is required');
  });

  it('should return correct message for popup-closed-by-user', () => {
    const error = { code: 'auth/popup-closed-by-user' };
    expect(authErrorMessage(error)).toBe('authorization canceled by user');
  });

  it('should return default message for unknown error', () => {
    const error = { code: 'auth/unknown-error' };
    expect(authErrorMessage(error)).toBe('something went wrong, please try again later.');
  });

  it('should handle null error', () => {
    expect(authErrorMessage(null)).toBe('something went wrong, please try again later.');
  });
});

