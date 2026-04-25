'use client'

import { useState } from 'react'
import { createBooking } from '@/app/actions/booking'
import { QRCodeSVG } from 'qrcode.react'
import styles from './BookingForm.module.css'

interface Mountain {
  id: number
  name: string
  pricePerPerson: number
  minGroupSize: number
  maxGroupSize: number
}

interface Trail {
  id: number
  name: string
}

interface BookingFormProps {
  mountain: Mountain
  trails: Trail[]
}

export default function BookingForm({ mountain, trails }: BookingFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ bookingCode: string } | null>(null)

  // Form State
  const [trailId, setTrailId] = useState<number>(trails[0]?.id || 0)
  const [hikingDate, setHikingDate] = useState<string>('')
  const [totalMembers, setTotalMembers] = useState<number>(mountain.minGroupSize)

  // Member State: Array of objects
  const [members, setMembers] = useState(
    Array(mountain.minGroupSize).fill(null).map((_, i) => ({
      name: '',
      nik: '',
      phone: '',
      ktp: null as File | null,
      sehat: null as File | null,
      isLeader: i === 0
    }))
  )

  const [paymentProof, setPaymentProof] = useState<File | null>(null)

  // Handlers
  const handleMembersChange = (num: number) => {
    let newMembers = [...members]
    if (num > members.length) {
      const diff = num - members.length
      newMembers = [
        ...newMembers,
        ...Array(diff).fill(null).map(() => ({
          name: '', nik: '', phone: '', ktp: null, sehat: null, isLeader: false
        }))
      ]
    } else if (num < members.length) {
      newMembers = newMembers.slice(0, num)
    }
    setMembers(newMembers)
    setTotalMembers(num)
  }

  const updateMember = (index: number, field: string, value: any) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }

  const validateStep1 = () => {
    if (!hikingDate) return 'Tanggal pendakian wajib diisi'
    if (totalMembers < mountain.minGroupSize || totalMembers > mountain.maxGroupSize) {
      return `Jumlah anggota harus antara ${mountain.minGroupSize} - ${mountain.maxGroupSize}`
    }
    return null
  }

  const validateStep2 = () => {
    for (let i = 0; i < members.length; i++) {
      const m = members[i]
      if (!m.name || !m.nik || !m.phone) return `Mohon lengkapi data teks untuk Anggota ${i + 1}`
      if (!m.ktp || !m.sehat) return `KTP dan Surat Sehat wajib diunggah untuk Anggota ${i + 1}`
    }
    return null
  }

  const nextStep = () => {
    setError(null)
    if (step === 1) {
      const err = validateStep1()
      if (err) return setError(err)
    } else if (step === 2) {
      const err = validateStep2()
      if (err) return setError(err)
    }
    setStep(s => s + 1)
  }

  const prevStep = () => {
    setError(null)
    setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    if (!paymentProof) return setError('Bukti transfer wajib diunggah')
    
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('mountainId', mountain.id.toString())
    formData.append('trailId', trailId.toString())
    formData.append('hikingDate', hikingDate)
    formData.append('totalMembers', totalMembers.toString())
    formData.append('totalPrice', (totalMembers * mountain.pricePerPerson).toString())
    formData.append('paymentProof', paymentProof)

    members.forEach((m, i) => {
      formData.append(`members[${i}].name`, m.name)
      formData.append(`members[${i}].nik`, m.nik)
      formData.append(`members[${i}].phone`, m.phone)
      formData.append(`members[${i}].isLeader`, m.isLeader.toString())
      if (m.ktp) formData.append(`members[${i}].ktp`, m.ktp)
      if (m.sehat) formData.append(`members[${i}].sehat`, m.sehat)
    })

    const res = await createBooking(formData)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccessData({ bookingCode: res.bookingCode! })
      setStep(4)
    }
  }

  const totalPrice = totalMembers * mountain.pricePerPerson

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pemesanan Tiket</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>{mountain.name}</p>

        {step < 4 && (
          <div className={styles.stepper}>
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
              <span className={styles.stepNumber}>1</span> Rencana
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
              <span className={styles.stepNumber}>2</span> Anggota
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
              <span className={styles.stepNumber}>3</span> Bayar
            </div>
          </div>
        )}
      </div>

      <div className={styles.content}>
        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: Rencana */}
        {step === 1 && (
          <div>
            <h2 className={styles.sectionTitle}>Detail Pendakian</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Pilih Jalur (Trail)</label>
                <select className={styles.input} value={trailId} onChange={e => setTrailId(parseInt(e.target.value))}>
                  {trails.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tanggal Naik</label>
                <input 
                  type="date" 
                  className={styles.input} 
                  value={hikingDate} 
                  onChange={e => setHikingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Jumlah Anggota (Termasuk Ketua)</label>
                <input 
                  type="number" 
                  className={styles.input} 
                  min={mountain.minGroupSize} 
                  max={mountain.maxGroupSize} 
                  value={totalMembers} 
                  onChange={e => handleMembersChange(parseInt(e.target.value) || mountain.minGroupSize)}
                />
                <small style={{ color: 'var(--color-text-tertiary)' }}>
                  Minimal {mountain.minGroupSize}, Maksimal {mountain.maxGroupSize} orang.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Anggota */}
        {step === 2 && (
          <div>
            <h2 className={styles.sectionTitle}>Identitas Rombongan</h2>
            {members.map((m, i) => (
              <div key={i} className={styles.memberCard}>
                <div className={styles.memberHeader}>
                  Anggota {i + 1} {m.isLeader && <span className={styles.badge}>Ketua</span>}
                </div>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Lengkap sesuai KTP</label>
                    <input type="text" className={styles.input} value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>NIK</label>
                    <input type="text" className={styles.input} value={m.nik} onChange={e => updateMember(i, 'nik', e.target.value)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>No. HP / WhatsApp</label>
                    <input type="text" className={styles.input} value={m.phone} onChange={e => updateMember(i, 'phone', e.target.value)} />
                  </div>
                </div>
                <div className={styles.grid} style={{ marginTop: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Upload KTP (.jpg/.png)</label>
                    <input type="file" className={styles.input} accept="image/*" onChange={e => updateMember(i, 'ktp', e.target.files?.[0] || null)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Surat Keterangan Sehat (.jpg/.png)</label>
                    <input type="file" className={styles.input} accept="image/*" onChange={e => updateMember(i, 'sehat', e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Pembayaran */}
        {step === 3 && (
          <div>
            <h2 className={styles.sectionTitle}>Pembayaran Simaksi</h2>
            <div className={styles.paymentBox}>
              <p style={{ color: 'var(--color-text-secondary)' }}>Silakan transfer sesuai total tagihan ke rekening berikut:</p>
              <div className={styles.rekening}>BCA 123-4567-890</div>
              <p style={{ fontWeight: 600 }}>a.n HikePass Indonesia</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Upload Bukti Transfer</label>
              <input 
                type="file" 
                className={styles.input} 
                accept="image/*" 
                onChange={e => setPaymentProof(e.target.files?.[0] || null)}
              />
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', marginTop: '1rem' }}>
              Tiket Anda akan diterbitkan dalam status Menunggu Konfirmasi. Admin akan mengecek bukti pembayaran Anda sebelum menyetujui pendakian.
            </p>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && successData && (
          <div className={styles.ticketBox}>
            <h2 style={{ color: 'var(--color-success-dark)', marginBottom: '1rem' }}>🎉 Pemesanan Berhasil!</h2>
            <p>Kode Booking Anda:</p>
            <div className={styles.ticketCode}>{successData.bookingCode}</div>
            
            <div className={styles.qrWrapper}>
              <QRCodeSVG value={successData.bookingCode} size={200} />
            </div>

            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '1rem auto' }}>
              Tunjukkan QR Code ini kepada petugas Basecamp saat hari keberangkatan setelah admin mengonfirmasi pembayaran Anda.
            </p>

            <button 
              className="btn btn-primary" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '2rem' }}
            >
              Kembali ke Beranda
            </button>
          </div>
        )}
      </div>

      {step < 4 && (
        <div className={styles.footer}>
          <div className={styles.totalPrice}>
            <span className={styles.totalLabel}>Total Tagihan</span>
            <span className={styles.totalAmount}>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {step > 1 && (
              <button className="btn btn-ghost" onClick={prevStep} disabled={loading}>
                Kembali
              </button>
            )}
            
            {step < 3 ? (
              <button className="btn btn-primary" onClick={nextStep}>
                Lanjut
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Memproses...' : 'Konfirmasi & Selesai'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
