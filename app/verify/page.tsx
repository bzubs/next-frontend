"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileCheck, Upload, CheckCircle, XCircle, FileText } from "lucide-react"
import { getProfile } from "@/lib/auth"
import { verifyPDF } from "@/lib/api"

export default function VerifyPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const profile = await getProfile()
      setUser(profile)
      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file")
      return
    }

    setFile(selectedFile)
    setError("")
    setResult(null)
  }

  const handleVerify = async () => {
    if (!file) return

    setVerifying(true)
    setError("")

    try {
      const verificationResult = await verifyPDF(file)
      setResult(verificationResult)
    } catch (err) {
      setError("Verification failed. Please try again.")
    }

    setVerifying(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  // Shared content used for both authenticated and anonymous layouts
  const Content = () => (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center">
        <FileCheck className="h-8 w-8 text-accent mr-2" />
        Certificate Verification
      </h1>
      <p className="text-muted-foreground text-center mb-6">
        Verify the authenticity of wipe certificates using cryptographic signatures
      </p>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-center">Upload Certificate</CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Upload a PDF certificate to verify its authenticity and integrity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive bg-destructive/10">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="presentation"
          >
            {file ? (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-accent mx-auto" />
                <div>
                  <p className="text-foreground font-medium text-center">{file.name}</p>
                  <p className="text-sm text-muted-foreground text-center">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {verifying ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Verify Certificate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-foreground font-medium text-center">Drop your PDF certificate here</p>
                  <p className="text-sm text-muted-foreground text-center">or click to browse files</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) handleFileSelect(selectedFile)
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex justify-center">
                  <Button
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground cursor-pointer bg-transparent"
                    asChild
                  >
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {result && (
        <Card className="bg-card border-border mt-6">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-center">
              {result.valid ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive mr-2" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert
                className={`${
                  result.valid ? "border-green-400 bg-green-400/10" : "border-destructive bg-destructive/10"
                }`}
              >
                <AlertDescription className={result.valid ? "text-green-400" : "text-destructive"}>
                  {result.message}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  // If anonymous: center content and show small banner
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">
          <Alert className="border-yellow-400 bg-yellow-50">
            <AlertDescription className="text-yellow-700">
              <strong>Notice:</strong> You’re not logged in — results won’t be saved to your account.
            </AlertDescription>
          </Alert>
          <Content />
        </div>
      </div>
    )
  }

  // Authenticated view: keep original layout with Navigation
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="md:pl-64">
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Content />
          </div>
        </main>
      </div>
    </div>
  )
}
