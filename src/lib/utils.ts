/**
 * Format number to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}

/**
 * Format date + time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate booking code: HP-YYYY-MM-XXXXX
 */
export function generateBookingCode(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = String(Math.floor(10000 + Math.random() * 90000))
  return `HP-${year}-${month}-${random}`
}

/**
 * Validate Indonesian NIK (16 digits)
 */
export function isValidNIK(nik: string): boolean {
  return /^\d{16}$/.test(nik)
}

/**
 * Normalize phone number to 628xxx format
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned
  }
  return cleaned
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'var(--color-warning)',
    WAITING_CONFIRM: 'var(--color-info)',
    PAID: 'var(--color-success)',
    CHECKED_IN: 'var(--color-primary)',
    COMPLETED: 'var(--color-success-dark)',
    CANCELLED: 'var(--color-danger)',
    EXPIRED: 'var(--color-muted)',
  }
  return map[status] || 'var(--color-muted)'
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Menunggu Pembayaran',
    WAITING_CONFIRM: 'Menunggu Konfirmasi',
    PAID: 'Lunas',
    CHECKED_IN: 'Sedang Mendaki',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    EXPIRED: 'Kedaluwarsa',
  }
  return map[status] || status
}
