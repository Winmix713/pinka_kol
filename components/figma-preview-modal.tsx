"use client"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, X } from "lucide-react"

interface FigmaFile {
  id: string
  key: string
  name: string
  thumbnail_url?: string
  last_modified: string
  downloadUrl?: string
  jsFilename?: string
}

interface FigmaPreviewModalProps {
  file: FigmaFile | null
  isOpen: boolean
  onClose: () => void
  previewUrl?: string
  title?: string
  description?: string
  language: "en" | "hu"
}

const mockColors = [
  { name: "Primary", hex: "#3B82F6", rgb: "rgb(59, 130, 246)" },
  { name: "Secondary", hex: "#8B5CF6", rgb: "rgb(139, 92, 246)" },
  { name: "Background", hex: "#1F2937", rgb: "rgb(31, 41, 55)" },
  { name: "Text", hex: "#F9FAFB", rgb: "rgb(249, 250, 251)" },
  { name: "Accent", hex: "#10B981", rgb: "rgb(16, 185, 129)" },
]

const mockTypography = [
  { name: "Heading 1", family: "Inter", size: "32px", weight: "700" },
  { name: "Heading 2", family: "Inter", size: "24px", weight: "600" },
  { name: "Body", family: "Inter", size: "16px", weight: "400" },
  { name: "Caption", family: "Inter", size: "14px", weight: "500" },
]

const mockComponents = [
  { name: "Button Primary", type: "COMPONENT", instances: 3 },
  { name: "Card Container", type: "COMPONENT", instances: 1 },
  { name: "Icon Button", type: "COMPONENT", instances: 2 },
  { name: "Text Input", type: "COMPONENT", instances: 1 },
]

export function FigmaPreviewModal({
  file,
  isOpen,
  onClose,
  previewUrl,
  title = "Figma Preview",
  description = "Preview of your Figma design",
  language,
}: FigmaPreviewModalProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "color") {
        setCopiedColor(text)
        setTimeout(() => setCopiedColor(null), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadJSFile = () => {
    if (file?.downloadUrl && file?.jsFilename) {
      const link = document.createElement("a")
      link.href = file.downloadUrl
      link.download = file.jsFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(file.downloadUrl)
    }
  }

  if (!file) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {previewUrl && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Figma
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadJSFile}>
                        <Download className="w-4 h-4 mr-2" />
                        Download JS
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden rounded-lg border bg-muted/50">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[60vh] border-0"
                  title="Figma Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">No preview available</p>
                    <p className="text-sm">Connect to Figma to see your designs here</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
