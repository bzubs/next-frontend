const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export interface Certificate {
  certificate_id: string
  user_id: string
  device_id: string
  wipe: any
  issuer: string
  created_at: string
}

export interface DriveHealth {
  message: string
  prediction: String,
  temperature: number
  smart_status: string
  errors: string[]
}

export async function startWipe(driveData: any) {
  const response = await fetch(`${API_BASE}/api/wipe`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(driveData),
  })
  return await response.json()
}

export async function listCertificates(): Promise<Certificate[]> {
  const response = await fetch(`${API_BASE}/api/list-certificates`, {
    headers: getAuthHeaders(),
  })
  const data = await response.json()
  return data.success ? data.certificates : []
}

export async function getCertificate(certId: string) {
  const response = await fetch(`${API_BASE}/api/certificates/${certId}`, {
    headers: getAuthHeaders(),
  })
  return await response.json()
}

export async function downloadCertificatePDF(certId: string) {
  const response = await fetch(`${API_BASE}/api/certificates/${certId}/pdf`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (response.ok) {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${certId}_certificate.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}

export async function verifyPDF(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE}/api/verify-pdf`, {
    method: "POST",
    body: formData,
  })
  return await response.json()
}


export async function checkDriveHealth(data: { drive_id: string }): Promise<DriveHealth> {
  const response = await fetch(`${API_BASE}/api/drive/health`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorText}`)
  }

  return await response.json()
}
