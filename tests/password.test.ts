import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing', () => {
  it('hashes and verifies passwords with argon2id', async () => {
    const password = 'SuperSecurePassword123!';
    const hash = await hashPassword(password);
    expect(hash).toMatch(/\$/);
    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, 'wrong')).resolves.toBe(false);
  });
});
