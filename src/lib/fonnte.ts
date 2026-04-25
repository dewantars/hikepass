/**
 * Fonnte WhatsApp API wrapper
 * Untuk development: gunakan mock OTP (kode ditampilkan di console)
 * Untuk production: set FONNTE_TOKEN di environment variables
 */

export async function sendOTP(phone: string, code: string): Promise<{ success: boolean; mock?: boolean }> {
  const token = process.env.FONNTE_TOKEN

  // Mock mode: jika tidak ada token Fonnte
  if (!token) {
    console.log(`\n========================================`)
    console.log(`  [MOCK OTP] Nomor: ${phone}`)
    console.log(`  [MOCK OTP] Kode : ${code}`)
    console.log(`========================================\n`)
    return { success: true, mock: true }
  }

  // Production mode: kirim via Fonnte API
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: new URLSearchParams({
        target: phone,
        message: `[HikePass] Kode OTP Anda: ${code}\nBerlaku ${process.env.OTP_EXPIRY_MINUTES || '5'} menit.\nJangan berikan kode ini kepada siapapun.`,
        countryCode: '62',
      }),
    })

    const data = await res.json()
    return { success: data.status === true }
  } catch (error) {
    console.error('Fonnte API error:', error)
    return { success: false }
  }
}

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
