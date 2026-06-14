const _ones = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
]

const _tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY']

function _toWords(n: number): string {
  if (n === 0) return ''
  if (n < 20) return _ones[n]!
  if (n < 100) return _tens[Math.floor(n / 10)] + (n % 10 ? '-' + _ones[n % 10] : '')
  if (n < 1_000)
    return _ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + _toWords(n % 100) : '')
  if (n < 1_000_000)
    return (
      _toWords(Math.floor(n / 1_000)) + ' THOUSAND' + (n % 1_000 ? ' ' + _toWords(n % 1_000) : '')
    )
  if (n < 1_000_000_000)
    return (
      _toWords(Math.floor(n / 1_000_000)) +
      ' MILLION' +
      (n % 1_000_000 ? ' ' + _toWords(n % 1_000_000) : '')
    )
  return (
    _toWords(Math.floor(n / 1_000_000_000)) +
    ' BILLION' +
    (n % 1_000_000_000 ? ' ' + _toWords(n % 1_000_000_000) : '')
  )
}

/**
 * Converts a numeric amount to Philippine government document word format.
 * @example amountToWords(31628.45) // 'THIRTY-ONE THOUSAND SIX HUNDRED TWENTY-EIGHT & 45/100'
 */
export function amountToWords(amount: number): string {
  const [intStr, decStr] = amount.toFixed(2).split('.')
  const intPart = parseInt(intStr!)
  const cents = decStr ?? '00'
  const words = intPart === 0 ? 'ZERO' : _toWords(intPart)
  return `${words} & ${cents}/100`
}
