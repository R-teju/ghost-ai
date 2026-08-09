"use client"

import * as React from "react"
import { DialogPattern } from "@/components/editor/dialog-pattern"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Copy,
  Check,
  Users,
  Trash2,
  MailPlus,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"

interface ShareDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  currentUserId: string
  ownerId: string
  projectName: string
}

function generateRandomPassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let result = ""
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

export function ShareDialog({
  isOpen,
  onOpenChange,
  projectId,
  currentUserId,
  ownerId,
  projectName,
}: ShareDialogProps) {
  const [loading, setLoading] = React.useState(true)
  const [owner, setOwner] = React.useState<any>(null)
  const [collaborators, setCollaborators] = React.useState<any[]>([])
  const [error, setError] = React.useState("")
  
  const [inviteEmail, setInviteEmail] = React.useState("")
  const [inviting, setInviting] = React.useState(false)
  const [inviteError, setInviteError] = React.useState("")
  const [inviteSuccess, setInviteSuccess] = React.useState("")
  
  const [copied, setCopied] = React.useState(false)
  const [removingEmail, setRemovingEmail] = React.useState<string | null>(null)

  // Room password state
  const [roomPassword, setRoomPassword] = React.useState("")
  const [passwordInput, setPasswordInput] = React.useState("")
  const [passwordLoading, setPasswordLoading] = React.useState(false)
  const [passwordSaved, setPasswordSaved] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [passwordCopied, setPasswordCopied] = React.useState(false)

  const isOwner = currentUserId === ownerId

  // Fetch Collaborators
  const fetchCollaborators = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to load collaborators")
        return
      }
      setOwner(data.owner)
      setCollaborators(data.collaborators || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to load sharing details")
    } finally {
      setLoading(false)
    }
  }

  // Fetch Room Password
  const fetchRoomPassword = async () => {
    if (!isOwner) return
    try {
      const res = await fetch(`/api/projects/${projectId}/room-password`)
      if (res.ok) {
        const data = await res.json()
        setRoomPassword(data.password || "")
        setPasswordInput(data.password || "")
      }
    } catch (err) {
      console.error("Failed to fetch room password:", err)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      fetchCollaborators()
      fetchRoomPassword()
      setInviteSuccess("")
      setInviteError("")
      setPasswordSaved(false)
    }
  }, [isOpen, projectId])

  // Save Room Password
  const handleSavePassword = async () => {
    const pw = passwordInput.trim()
    if (!pw || pw.length < 4) return

    setPasswordLoading(true)
    setPasswordSaved(false)
    try {
      const res = await fetch(`/api/projects/${projectId}/room-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save password")
      }

      setRoomPassword(pw)
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to save room password")
    } finally {
      setPasswordLoading(false)
    }
  }

  // Generate random password
  const handleGeneratePassword = () => {
    const pw = generateRandomPassword()
    setPasswordInput(pw)
    setShowPassword(true)
  }

  // Copy password
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordInput)
    setPasswordCopied(true)
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  // Invite collaborator
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return

    // Require room password before inviting
    if (!roomPassword) {
      setInviteError("Please set a Room Password first before inviting collaborators.")
      return
    }

    setInviting(true)
    setInviteError("")
    setInviteSuccess("")
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setInviteError(data.error || "Failed to invite collaborator")
        return
      }

      setCollaborators((prev) => [...prev, data])
      setInviteEmail("")
      setInviteSuccess(`Invitation sent to ${email}`)
      setTimeout(() => setInviteSuccess(""), 5000)
    } catch (err: any) {
      console.error(err)
      setInviteError(err.message || "Invitation failed")
    } finally {
      setInviting(false)
    }
  }

  // Remove collaborator
  const handleRemove = async (email: string) => {
    setRemovingEmail(email)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove collaborator")
      }

      setCollaborators((prev) => prev.filter((c) => c.email !== email))
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Removal failed")
    } finally {
      setRemovingEmail(null)
    }
  }

  // Copy Viewer Link
  const handleCopyLink = () => {
    if (typeof window === "undefined") return
    const link = `${window.location.origin}/view/${projectId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLink = () => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/view/${projectId}`
  }

  return (
    <DialogPattern
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Share Project"
      description={`Manage viewer access and invitation settings for "${projectName}".`}
    >
      <div className="space-y-6 pt-2 select-none">
        {/* Room Password Section (Owners only) */}
        {isOwner && (
          <div className="space-y-2.5 flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="size-3" />
              Room Password
            </label>
            <p className="text-[10px] text-zinc-500 leading-relaxed -mt-1">
              Viewers must enter this password to access the live canvas. Set it before inviting collaborators.
            </p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value)
                    setPasswordSaved(false)
                  }}
                  disabled={passwordLoading}
                  placeholder="Set a room password (min 4 chars)"
                  className="bg-zinc-950/80 border-zinc-800 text-zinc-300 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              <Button
                variant="outline"
                onClick={handleGeneratePassword}
                disabled={passwordLoading}
                className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 shrink-0 text-xs gap-1.5 h-10 px-3 cursor-pointer"
                title="Generate random password"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              {passwordInput.trim() && (
                <Button
                  variant="outline"
                  onClick={handleCopyPassword}
                  disabled={!passwordInput.trim()}
                  className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 shrink-0 text-xs gap-1.5 h-10 px-3 cursor-pointer"
                  title="Copy password"
                >
                  {passwordCopied ? (
                    <Check className="size-3.5 text-green-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSavePassword}
                disabled={passwordLoading || passwordInput.trim().length < 4}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold h-8 px-4 cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : passwordSaved ? (
                  <>
                    <ShieldCheck className="size-3.5 mr-1.5" />
                    Saved
                  </>
                ) : (
                  "Save Password"
                )}
              </Button>
              {passwordSaved && (
                <span className="text-[10px] text-green-400 font-medium">
                  Password saved successfully
                </span>
              )}
            </div>
          </div>
        )}

        {/* Viewer Link Section */}
        <div className="space-y-2 flex flex-col">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Viewer Link
          </label>
          <div className="flex gap-2 items-center">
            <Input
              readOnly
              value={getLink()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="bg-zinc-950/80 border-zinc-800 text-zinc-300 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 select-all"
            />
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 shrink-0 text-xs gap-1.5 h-10 px-3.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-[9px] text-zinc-600">
            Share this link along with the room password. Viewers do not need an account.
          </p>
        </div>

        {/* Invite Form (Owners only) */}
        {isOwner && (
          <form onSubmit={handleInvite} className="space-y-2 flex flex-col">
            <label htmlFor="invite-email" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Invite by Email
            </label>
            <div className="flex gap-2 items-center">
              <Input
                id="invite-email"
                type="email"
                required
                disabled={inviting}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collaborator@example.com"
                className="border-zinc-800 bg-zinc-950 focus:border-indigo-500/50 text-xs"
              />
              <Button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 text-xs font-semibold gap-1.5 h-10 px-4 cursor-pointer disabled:opacity-50"
              >
                {inviting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <MailPlus className="size-3.5" />
                )}
                Invite
              </Button>
            </div>
            {inviteError && (
              <span className="text-[11px] text-red-400 mt-1 block">
                {inviteError}
              </span>
            )}
            {inviteSuccess && (
              <span className="text-[11px] text-green-400 mt-1 block">
                ✓ {inviteSuccess}
              </span>
            )}
          </form>
        )}

        {/* Collaborators List */}
        <div className="space-y-3 flex flex-col">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Who has access
          </span>

          {loading ? (
            <div className="py-8 flex justify-center items-center text-zinc-500 gap-2 text-xs">
              <Loader2 className="size-4 animate-spin text-indigo-400" />
              Loading access list...
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-400 text-xs bg-red-950/20 border border-red-900/30 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {/* Owner row */}
              {owner && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/40 bg-zinc-900/20 select-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50">
                      {owner.imageUrl ? (
                        <img src={owner.imageUrl} alt={owner.name} className="size-full object-cover" />
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          {owner.name.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {owner.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 truncate">
                        {owner.email}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    Owner
                  </span>
                </div>
              )}

              {/* Collaborators rows */}
              {collaborators.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-xl text-zinc-500 text-center select-none gap-1.5">
                  <Users className="size-4 text-zinc-600" />
                  <span className="text-[11px]">No collaborators invited yet.</span>
                </div>
              ) : (
                collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800/40 bg-zinc-900/20"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50">
                        {collab.imageUrl ? (
                          <img src={collab.imageUrl} alt={collab.name || collab.email} className="size-full object-cover" />
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            {(collab.name || collab.email).substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {collab.name || "Collaborator"}
                        </span>
                        <span className="text-[9px] text-zinc-500 truncate">
                          {collab.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status badge */}
                      <span
                        className={`text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          collab.inviteStatus === "ACCEPTED"
                            ? "text-green-400 bg-green-950/30 border-green-900/40"
                            : "text-amber-400 bg-amber-950/30 border-amber-900/40"
                        }`}
                      >
                        {collab.inviteStatus === "ACCEPTED" ? "Joined" : "Pending"}
                      </span>

                      {isOwner ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={removingEmail === collab.email}
                          onClick={() => handleRemove(collab.email)}
                          className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 rounded size-7 shrink-0 cursor-pointer disabled:opacity-50"
                          aria-label="Remove collaborator"
                        >
                          {removingEmail === collab.email ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          Viewer
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DialogPattern>
  )
}
