"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Shield, HardDrive, FileCheck, Activity, Home, LogOut } from "lucide-react"
import { getProfile, logout, type User } from "@/lib/auth"

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Secure Wipe", href: "/wipe", icon: Shield },
  { name: "Verify Certificate", href: "/verify", icon: FileCheck },
  { name: "Drive Health", href: "/health", icon: Activity },
  { name: "Certificates", href: "/certificates", icon: HardDrive },
]

export function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const profile = await getProfile()
      setUser(profile)
    }
    loadUser()
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/login")
  }

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            } ${mobile ? "w-full" : ""}`}
            onClick={() => mobile && setIsOpen(false)}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  if (!user) {
    return null
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Shield className="h-8 w-8 text-accent" />
            <span className="ml-2 text-xl font-bold text-foreground">SecureDrive</span>
          </div>

          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <NavItems />
            </nav>

            <div className="flex-shrink-0 p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm font-medium text-accent-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">{user.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-accent" />
            <span className="ml-2 text-lg font-bold text-foreground">SecureDrive</span>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-accent" />
                    <span className="ml-2 text-lg font-bold text-foreground">SecureDrive</span>
                  </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  <NavItems mobile />
                </nav>

                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-sm font-medium text-accent-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-foreground">{user.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
