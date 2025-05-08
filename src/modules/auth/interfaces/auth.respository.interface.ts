interface IAuthRepository {
  invalidateToken: (jti: string, userId: number, expiresAtTimestamp: number) => Promise<void>
  isTokenBlacklisted: (jti: string) => Promise<boolean>
}

export { IAuthRepository }
