"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HardDrive, FileCheck, Download, Search, Calendar, Filter } from "lucide-react"
import { getProfile } from "@/lib/auth"
import { listCertificates, downloadCertificatePDF } from "@/lib/api"

export default function CertificatesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // use `any` here to avoid type mismatches with nested payload structure
  const [certificates, setCertificates] = useState<any[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [downloading, setDownloading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const profile = await getProfile()
      if (!profile) {
        router.push("/login")
        return
      }

      setUser(profile)
      const res = await listCertificates()
      // assume listCertificates returns an array (or adapt accordingly)
      setCertificates(res)
      setFilteredCertificates(res)
      setLoading(false)
    }

    loadData()
  }, [router])

  // helper utils to safely read nested fields
  const getCertId = (c: any) => c.certificateId ?? c.payload?.payload?.certificate_id ?? ""
  const getDeviceId = (c: any) => c.payload?.payload?.device?.id ?? c.device ?? "Unknown"
  const getIssuer = (c: any) => c.payload?.payload?.issuer?.org ?? "Unknown"

  useEffect(() => {
    const q = searchTerm.toLowerCase()
    const filtered = certificates.filter((cert) => {
      return (
        getCertId(cert).toLowerCase().includes(q) ||
        (getDeviceId(cert) || "").toLowerCase().includes(q) ||
        (getIssuer(cert) || "").toLowerCase().includes(q)
      )
    })
    setFilteredCertificates(filtered)
  }, [searchTerm, certificates])

  const handleDownload = async (certId: string) => {
    setDownloading(certId)
    try {
      await downloadCertificatePDF(certId)
    } catch (error) {
      console.error("Download failed:", error)
    }
    setDownloading(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // compute latest certificate (by createdAt)
  const latestCertificate = certificates.length
    ? certificates.reduce((prev: any, curr: any) =>
        new Date(prev.createdAt) > new Date(curr.createdAt) ? prev : curr
      )
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="md:pl-64">
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                <FileCheck className="h-8 w-8 text-accent mr-3" />
                Certificate Management
              </h1>
              <p className="text-muted-foreground">View and manage your secure wipe certificates</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
                  <FileCheck className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{certificates.length}</div>
                  <p className="text-xs text-muted-foreground">Verified wipe operations</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unique Devices</CardTitle>
                  <HardDrive className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {new Set(certificates.map((c) => getDeviceId(c))).size}
                  </div>
                  <p className="text-xs text-muted-foreground">Different drives wiped</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Latest Certificate</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {latestCertificate ? formatDate(latestCertificate.createdAt) : "None"}
                  </div>
                  <p className="text-xs text-muted-foreground">Most recent wipe</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="bg-card border-border mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates by ID, device, or issuer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Certificates List */}
            {filteredCertificates.length > 0 ? (
              <div className="space-y-4">
                {filteredCertificates.map((certificate) => (
                  <Card
                    key={certificate._id ?? certificate.certificateId}
                    className="bg-card border-border hover:border-accent/50 transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileCheck className="h-5 w-5 text-accent" />
                            <h3 className="font-semibold text-foreground">
                              Certificate {getCertId(certificate).slice(0, 12)}...
                            </h3>
                            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                              Verified
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Device ID</p>
                              <p className="font-mono text-foreground">{getDeviceId(certificate)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Issuer</p>
                              <p className="text-foreground">{getIssuer(certificate)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="text-foreground">{formatDate(certificate.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/certificates/${certificate.certificateId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(certificate.certificateId)}
                            disabled={downloading === certificate.certificateId}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            {downloading === certificate.certificateId ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent-foreground mr-1"></div>
                                Downloading...
                              </div>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    {searchTerm ? (
                      <>
                        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Results Found</h3>
                        <p className="text-muted-foreground mb-4">No certificates match your search criteria</p>
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm("")}
                          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        >
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Certificates Yet</h3>
                        <p className="text-muted-foreground mb-4">You haven't created any wipe certificates yet</p>
                        <Link href="/wipe">
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            Start Secure Wipe
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
