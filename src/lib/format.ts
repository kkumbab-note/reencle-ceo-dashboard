const intFormatter = new Intl.NumberFormat('ko-KR')

export function formatInt(value: number): string {
  return intFormatter.format(Math.round(value))
}

export function formatDecimal(value: number, digits = 1): string {
  return value.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

/** 백만원 → '304.6억' */
export function formatEok(millionWon: number, digits = 1): string {
  return `${formatDecimal(millionWon / 100, digits)}억`
}

/** 334,773 → '33.5만' */
export function formatMan(value: number, digits = 1): string {
  return `${formatDecimal(value / 10_000, digits)}만`
}

export function formatPercent(value: number, digits = 1): string {
  return `${formatDecimal(value, digits)}%`
}

/** 부호 붙은 숫자 — '+3.2', '−1.0' */
export function formatSigned(value: number, digits = 1): string {
  const abs = formatDecimal(Math.abs(value), digits)
  if (Math.abs(value) < 0.5 * 10 ** -digits) return abs
  return `${value > 0 ? '+' : '−'}${abs}`
}
