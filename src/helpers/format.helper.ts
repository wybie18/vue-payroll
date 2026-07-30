/**
 * Formats an account number by removing all non-numeric characters
 * (spaces, dashes, dots, slashes, etc.), leaving only digits.
 *
 * @example
 * formatAccountNo('1234-5678-123 22') // '1234567812322'
 * formatAccountNo('00123.456.7890')   // '001234567890'
 */
export function formatAccountNo(accountNo: string): string {
  return accountNo.replace(/\D/g, '')
}

/**
 * Formats a name to:
 * - Uppercase
 * - Normalize ñ/Ñ to n/N
 * - Strip diacritics/accents from other letters (e.g. é → E)
 * - Keep only letters, numbers, commas, and periods
 * - Replace any other character (special symbols) with a space
 * - Collapse multiple spaces into one and trim
 *
 * @example
 * formatName('ayaton, jr., efren o')     // 'AYATON, JR., EFREN O'
 * formatName('Muñoz-Peña #123')          // 'MUNOZ PENA  123'
 * formatName('  José   Garcia!! ')       // 'JOSE GARCIA'
 */
export function formatName(name: string): string {
  return name
    .toUpperCase()
    .replace(/Ñ/g, 'N')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9,.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatNameForCsv(name: string): string {
  return name
    .toUpperCase()
    .replace(/Ñ/g, 'N')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9,.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[,.]/g, '')
}

/**
 * Formats a number as Philippine Peso currency with comma as thousand separator
 * and two decimal places.
 * @example
 * formatCurrency(1234567.89) // '1,234,567.89'
 * formatCurrency(1000)        // '1,000.00'
 * formatCurrency(987654321)   // '987,654,321.00'
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
