"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, HardDrive, Thermometer, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { getProfile } from "@/lib/auth"
import { checkDriveHealth } from "@/lib/api"

interface DriveHealth {
  health_score: number
  health_class: number
  prediction: string
  message: string
  temperature: number
  smart_status: string
  errors?: string[]
}

export default function HealthPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [driveId, setDriveId] = useState("")
  const [healthData, setHealthData] = useState<DriveHealth | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const profile = await getProfile()
      if (!profile) {
        router.push("/login")
        return
      }
      setUser(profile)
      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleHealthCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError("")
    setHealthData(null)

    try {
      const result = await checkDriveHealth({ drive_id: driveId })
      setHealthData(result)
    } catch (err: any) {
      setError(err.message || "Failed to check drive health. Please try again.")
    }

    setChecking(false)
  }

  const getScoreColor = (score: number) => {
    if (score < 0.3) return "text-green-500"
    if (score < 0.5) return "text-yellow-500"
    if (score < 0.8) return "text-orange-500"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) return null

  const { prediction = "N/A", message = "No message", temperature = 0, smart_status = "Unknown", errors = [] } = healthData || {}

  return (
    <div className="min-h-screen bg-background relative">
      <Navigation />

      <div className="md:pl-64">
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                <Activity className="h-8 w-8 text-accent mr-3" />
                Drive Health Monitor
              </h1>
              <p className="text-muted-foreground">Monitor drive performance, temperature, and SMART status</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Health Check Form */}
              <div className="lg:col-span-1 relative">
                {checking && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  </div>
                )}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center">
                      <HardDrive className="h-5 w-5 text-accent mr-2" />
                      Check Drive Health
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Enter drive ID to check health status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleHealthCheck} className="space-y-4">
                      {error && (
                        <Alert className="border-destructive bg-destructive/10">
                          <AlertDescription className="text-destructive">{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="driveId" className="text-foreground">
                          Drive ID / Serial Number
                        </Label>
                        <Input
                          id="driveId"
                          placeholder="e.g., WD-WCAV12345678"
                          value={driveId}
                          onChange={(e) => setDriveId(e.target.value)}
                          required
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={checking}>
                        {checking ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                            Checking...
                          </div>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Check Health
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Health Tips */}
                <Card className="mt-6 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Health Monitoring Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>• Regular health checks help prevent data loss</p>
                      <p>• Monitor temperature to avoid overheating</p>
                      <p>• SMART errors indicate potential drive failure</p>
                      <p>• Backup important data if warnings appear</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Results */}
              <div className="lg:col-span-2">
                {healthData ? (
                  <div className="space-y-6">
                    {/* Failure Analysis */}
                    <Card className="bg-card border-border mt-6">
                      <CardHeader>
                        <CardTitle className={`text-foreground flex items-center ${getScoreColor(healthData.health_score)}`}>
                          <Activity className="h-5 w-5 mr-2" />
                          Failure Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>
                            <strong>Failure Score:</strong> {prediction}
                          </p>
                          <p>
                            <strong>Message:</strong> {message}
                          </p>
                          <p className="text-xs">
                            Failure score represents the probability of drive failure. A higher score indicates greater risk.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Temperature */}
                      <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Temperature</CardTitle>
                          <Thermometer className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-foreground">{temperature}°C</div>
                          <p className="text-xs text-muted-foreground">
                            {temperature < 45
                              ? "Normal operating temperature"
                              : temperature < 60
                              ? "Elevated temperature"
                              : "High temperature warning"}
                          </p>
                        </CardContent>
                      </Card>

                      {/* SMART Status */}
                      <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">SMART Status</CardTitle>
                          <Activity className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-foreground">{smart_status}</div>
                          <p className="text-xs text-muted-foreground">
                            Self-Monitoring Analysis and Reporting Technology
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Errors */}
                    {errors.length > 0 && (
                      <Card className="bg-card border-border">
                        <CardHeader>
                          <CardTitle className="text-foreground flex items-center">
                            <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                            Detected Issues
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {errors.map((error, index) => (
                              <Alert key={index} className="border-destructive bg-destructive/10">
                                <AlertDescription className="text-destructive">{error}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <HardDrive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No Health Data</h3>
                        <p className="text-muted-foreground">
                          Enter a drive ID and click "Check Health" to view drive status and metrics
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
