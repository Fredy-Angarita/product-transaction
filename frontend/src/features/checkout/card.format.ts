const BRANDS: { label: string; pattern: RegExp }[] = [
  { label: 'Visa', pattern: /^4/ },
  { label: 'Mastercard', pattern: /^(5[1-5]|2[2-7])/ },
  { label: 'American Express', pattern: /^3[47]/ },
  { label: 'Discover', pattern: /^6(?:011|5)/ },
  { label: 'Diners Club', pattern: /^3(?:0[0-5]|[68])/ },
]

export function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '')
}

export function groupCardNumber(value: string): string {
  return digitsOnly(value)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function detectBrand(value: string): string {
  const digits = digitsOnly(value)
  return BRANDS.find((brand) => brand.pattern.test(digits))?.label ?? ''
}

export function maskCardNumber(value: string): string {
  const digits = digitsOnly(value)
  if (digits.length < 12) return groupCardNumber(digits)
  return `${groupCardNumber(digits.slice(0, 8))} •••• ${digits.slice(-4)}`
}
