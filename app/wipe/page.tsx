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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, AlertTriangle, CheckCircle, HardDrive } from "lucide-react"
import { getProfile } from "@/lib/auth"
import { startWipe } from "@/lib/api"

export default function WipePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wiping, setWiping] = useState(false)
  const [driveId, setDriveId] = useState("")
  const [driveModel, setDriveModel] = useState("")
  const [driveFirmware, setDriveFirmware] = useState("")
  const [driveCapacity, setDriveCapacity] = useState("")
  const [devPath, setDevPath] = useState("")
  const [wipeMethod, setWipeMethod] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [certificateId, setCertificateId] = useState("")
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

  const handleWipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setWiping(true)
    setError("")

    try {
      const wipeData = {
        device: {
          id: driveId,
          model: driveModel,
          firmware: driveFirmware,
          capacity_gb: Number.parseInt(driveCapacity),
        },
        dev_path: devPath,
        method: wipeMethod,
      }

      const result = await startWipe(wipeData)


      if (result.status == 'completed' || result.certificate_json) {
          setSuccess(true)
          setCertificateId(result.certificate_json?.certificate_id || "Generated")
        } else {
          setError(result.error || "Wipe operation failed")
        }
      } catch (err) {
        setError("Network error occurred")
      }

    setWiping(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) return null

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="md:pl-64">
          <main className="p-6">
            <Card className="max-w-2xl mx-auto bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Wipe Completed Successfully!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your drive has been securely wiped and a certificate has been generated.
                  </p>

                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Certificate ID</p>
                    <p className="font-mono text-foreground">{certificateId}</p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => router.push("/certificates")}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      View Certificates
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      Wipe Another Drive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
                <Shield className="h-8 w-8 text-accent mr-3" />
                Secure Drive Wipe
              </h1>
              <p className="text-muted-foreground">Permanently destroy data with military-grade security standards</p>
            </div>

            {/* Warning Alert */}
            <Alert className="mb-6 border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Warning:</strong> This operation will permanently destroy all data on the selected drive. This
                action cannot be undone. Ensure you have backed up any important data.
              </AlertDescription>
            </Alert>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <HardDrive className="h-5 w-5 text-accent mr-2" />
                  Drive Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter the details of the drive you want to securely wipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWipe} className="space-y-6">
                  {error && (
                    <Alert className="border-destructive bg-destructive/10">
                      <AlertDescription className="text-destructive">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="driveModel" className="text-foreground">
                        Drive Model
                      </Label>
                      <Input
                        id="driveModel"
                        placeholder="e.g., WD Blue SN570 1TB"
                        value={driveModel}
                        onChange={(e) => setDriveModel(e.target.value)}
                        required
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driveFirmware" className="text-foreground">
                        Firmware Version
                      </Label>
                      <Input
                        id="driveFirmware"
                        placeholder="e.g., 233010WD"
                        value={driveFirmware}
                        onChange={(e) => setDriveFirmware(e.target.value)}
                        required
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driveCapacity" className="text-foreground">
                        Capacity (GB)
                      </Label>
                      <Input
                        id="driveCapacity"
                        type="number"
                        placeholder="e.g., 1000"
                        value={driveCapacity}
                        onChange={(e) => setDriveCapacity(e.target.value)}
                        required
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="devPath" className="text-foreground">
                        Device Path
                      </Label>
                      <Input
                        id="devPath"
                        placeholder="e.g., /dev/sda or \\?\PhysicalDrive0"
                        value={devPath}
                        onChange={(e) => setDevPath(e.target.value)}
                        required
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wipeMethod" className="text-foreground">
                      Wipe Method
                    </Label>
                    <Select value={wipeMethod} onValueChange={setWipeMethod} required>
                      <SelectTrigger className="bg-input border-border text-foreground focus:ring-accent focus:border-accent">
                        <SelectValue placeholder="Select a wipe method" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem
                          value="dod_5220_22_m"
                          className="text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          DoD 5220.22-M (3-pass)
                        </SelectItem>
                        <SelectItem
                          value="nist_800_88"
                          className="text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          NIST 800-88 (1-pass)
                        </SelectItem>
                        <SelectItem
                          value="gutmann"
                          className="text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          Gutmann Method (35-pass)
                        </SelectItem>
                        <SelectItem
                          value="random_overwrite"
                          className="text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          Random Overwrite (7-pass)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Security Standards</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Military-grade data destruction</li>
                      <li>• Cryptographically signed certificates</li>
                      <li>• Compliance with DoD and NIST standards</li>
                      <li>• Tamper-evident verification</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={wiping}
                  >
                    {wiping ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                        Wiping Drive...
                      </div>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Start Secure Wipe
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
