const TOKEN_KEY = 'token'

export function getAuthToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) ?? ''
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}
