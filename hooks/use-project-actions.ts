import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function useProjectActions() {
  const router = useRouter()
  const pathname = usePathname()

  // Create States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createSuffix, setCreateSuffix] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Rename States
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [renameId, setRenameId] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  // Delete States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const [deleteName, setDeleteName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Slugify Helper
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  }

  // Opens
  const handleOpenCreate = () => {
    setCreateName("")
    setCreateDescription("")
    setCreateSuffix(Math.random().toString(36).substring(2, 8))
    setIsCreateOpen(true)
  }

  const handleOpenRename = (id: string, name: string) => {
    setRenameId(id)
    setRenameName(name)
    setIsRenameOpen(true)
  }

  const handleOpenDelete = (id: string, name: string) => {
    setDeleteId(id)
    setDeleteName(name)
    setIsDeleteOpen(true)
  }

  // Actions
  const handleCreate = async () => {
    const trimmedName = createName.trim()
    if (!trimmedName) return

    setIsCreating(true)
    try {
      const roomId = `${slugify(trimmedName)}-${createSuffix}`
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roomId,
          name: trimmedName,
          description: createDescription.trim() || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create project")
      }

      const project = await res.json()
      setIsCreateOpen(false)
      // Navigate to the new workspace (aligned with project id)
      router.refresh()
      router.push(`/editor/${project.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRename = async () => {
    const trimmedName = renameName.trim()
    if (!trimmedName || !renameId) return

    setIsRenaming(true)
    try {
      const res = await fetch(`/api/projects/${renameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      })

      if (!res.ok) {
        throw new Error("Failed to rename project")
      }

      setIsRenameOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error renaming project:", error)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${deleteId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete project")
      }

      setIsDeleteOpen(false)

      const activeWorkspacePath = `/editor/${deleteId}`
      if (pathname === activeWorkspacePath) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Previews
  const previewRoomId = createName.trim()
    ? `${slugify(createName)}-${createSuffix}`
    : ""

  return {
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
    previewRoomId,
    isCreating,
    handleOpenCreate,
    handleCreate,

    isRenameOpen,
    setIsRenameOpen,
    renameName,
    setRenameName,
    isRenaming,
    handleOpenRename,
    handleRename,

    isDeleteOpen,
    setIsDeleteOpen,
    deleteName,
    isDeleting,
    handleOpenDelete,
    handleDelete,
  }
}
