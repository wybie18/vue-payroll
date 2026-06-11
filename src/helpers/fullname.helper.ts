export function getFullName(
  firstName: string | null | undefined,
  middleName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ')
  return fullName || '—'
}
