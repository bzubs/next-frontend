"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileCheck, Download, Shield, HardDrive } from "lucide-react"
import { getProfile } from "@/lib/auth"
import { getCertificate, downloadCertificatePDF } from "@/lib/api"

export default function CertificateDetailPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [certificate, setCertificate] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const certificateId = params.id as string

  useEffect(() => {
    const loadData = async () => {
      const profile = await getProfile()
      if (!profile) {
        router.push("/login")
        return
      }

      setUser(profile)

      try {
        const cert = await getCertificate(certificateId)
        setCertificate(cert)
      } catch (err) {
        setError("Failed to load certificate details")
      }

      setLoading(false)
    }

    loadData()
  }, [router, certificateId])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadCertificatePDF(certificateId)
    } catch (error) {
      console.error("Download failed:", error)
    }
    setDownloading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) return null

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="md:pl-64">
          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Certificate Not Found</h3>
                    <p className="text-muted-foreground mb-4">
                      The requested certificate could not be found or you don't have access to it.
                    </p>
                    <Link href="/certificates">
                      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        Back to Certificates
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="md:pl-64">
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/certificates">
                <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Certificates
                </Button>
              </Link>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                    <FileCheck className="h-8 w-8 text-accent mr-3" />
                    Certificate Details
                  </h1>
                  <p className="text-muted-foreground">Secure wipe certificate verification and details</p>
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {downloading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                      Downloading...
                    </div>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Certificate Overview */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">Certificate Information</CardTitle>
                      <Badge variant="secondary" className="bg-green-400/10 text-green-400 border-green-400/20">
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Certificate ID</p>
                        <p className="font-mono text-foreground break-all">{certificate.certificate_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issuer</p>
                        <p className="text-foreground">{certificate.issuer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="font-mono text-foreground">{certificate.user_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="text-foreground">{formatDate(certificate.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Information */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <HardDrive className="h-5 w-5 text-accent mr-2" />
                      Device Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Device ID</p>
                        <p className="font-mono text-foreground">{certificate.device_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="text-foreground">{certificate.device?.model || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Firmware</p>
                        <p className="text-foreground">{certificate.device?.firmware || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="text-foreground">{certificate.device?.capacity_gb || "N/A"} GB</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wipe Details */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <Shield className="h-5 w-5 text-accent mr-2" />
                      Wipe Operation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {certificate.wipe && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Wipe Method</p>
                          <p className="text-foreground">{certificate.wipe.method || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Passes</p>
                          <p className="text-foreground">{certificate.wipe.passes || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Time</p>
                          <p className="text-foreground">
                            {certificate.wipe.start_time ? formatDate(certificate.wipe.start_time) : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Time</p>
                          <p className="text-foreground">
                            {certificate.wipe.end_time ? formatDate(certificate.wipe.end_time) : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Security Status */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Security Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Digital Signature</span>
                      <Badge variant="secondary" className="bg-green-400/10 text-green-400 border-green-400/20">
                        Valid
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tamper Detection</span>
                      <Badge variant="secondary" className="bg-green-400/10 text-green-400 border-green-400/20">
                        Intact
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Chain of Trust</span>
                      <Badge variant="secondary" className="bg-green-400/10 text-green-400 border-green-400/20">
                        Verified
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Compliance Standards</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-foreground">DoD 5220.22-M</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-foreground">NIST 800-88</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-foreground">HIPAA Compliant</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-foreground">GDPR Compliant</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/verify">
                      <Button
                        variant="outline"
                        className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                      >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Verify Certificate
                      </Button>
                    </Link>
                    <Link href="/certificates">
                      <Button
                        variant="outline"
                        className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                      >
                        View All Certificates
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
