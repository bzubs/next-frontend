"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, HardDrive, FileCheck, Activity, ArrowRight, Zap } from "lucide-react"
import { getProfile, type User } from "@/lib/auth"
import { listCertificates, type Certificate } from "@/lib/api"

// Features for landing page and dashboard
const features = [
  {
    icon: Shield,
    title: "Secure Wipe",
    description: "Military-grade data destruction with certified proof",
    href: "/wipe",
    color: "text-red-400",
  },
  {
    icon: FileCheck,
    title: "Certificate Verification",
    description: "Verify authenticity of wipe certificates instantly",
    href: "/verify",
    color: "text-green-400",
  },
  {
    icon: Activity,
    title: "Drive Health",
    description: "Monitor drive status and performance metrics",
    href: "/health",
    color: "text-blue-400",
  },
  {
    icon: HardDrive,
    title: "Certificate Management",
    description: "View and manage all your certificates",
    href: "/certificates",
    color: "text-purple-400",
  },
]

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getProfile()
        if (!profile) {
          setUser(null)
        } else {
          setUser(profile)
          const certs = await listCertificates()
          setCertificates(certs)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  // ------------------- LANDING PAGE (Unauthenticated) -------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold text-foreground mb-4 text-center">Welcome to SecureWipe</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xl">
          Military-grade data wiping, health monitoring, and certificate management. Keep your drives secure and data protected.
        </p>
        <div className="flex space-x-4 mb-12">
          <Link href="/login">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-green-500 hover:bg-green-600 text-white">Sign Up</Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="bg-card border-border hover:border-accent/50 transition-colors group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">{feature.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ------------------- DASHBOARD (Authenticated) -------------------
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="md:pl-64">
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.username}</h1>
            <p className="text-muted-foreground">Manage your secure drive operations and certificates</p>
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
                <p className="text-xs text-muted-foreground">Verified wipe certificates</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Security Level</CardTitle>
                <Shield className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">Military</div>
                <p className="text-xs text-muted-foreground">DoD 5220.22-M compliant</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">Online</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="bg-card border-border hover:border-accent/50 transition-colors group"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">{feature.title}</CardTitle>
                          <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={feature.href}>
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Recent Certificates */}
          {certificates.length > 0 && (
            <Card className="mt-8 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Certificates</CardTitle>
                <CardDescription className="text-muted-foreground">Your latest wipe certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.slice(0, 3).map((cert) => (
                    <div
                      key={cert.certificate_id || cert.device_id || Math.random()}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div className="flex items-center space-x-3">
                        <FileCheck className="h-5 w-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Certificate {cert.certificate_id ? cert.certificate_id.slice(0, 8) : "Unknown"}...
                          </p>
                          <p className="text-xs text-muted-foreground">Device: {cert.device_id || "Unknown"}</p>
                        </div>
                      </div>
                      <Link href={`/certificates/${cert.certificate_id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-accent hover:text-accent-foreground hover:bg-accent"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
                {certificates.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link href="/certificates">
                      <Button
                        variant="outline"
                        className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                      >
                        View All Certificates
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
