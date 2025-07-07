"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  ImageIcon,
  Video,
  Box,
  ChevronRight,
  Plus,
  ZoomIn,
  Aperture,
  Palette,
  GripHorizontal,
  ChevronDown,
  Globe,
  X,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Maximize,
  AlertTriangle,
  Code2,
} from "lucide-react"
import { FigmaPreviewModal } from "@/components/figma-preview-modal"
// 1️⃣  Add Providers import
import Providers from "./providers"

// Types
interface SidebarItem {
  name: string
  icon: React.ReactNode
  hasChevron: boolean
}

interface ExportConfig {
  id: string
  scale: string
  colorProfile: "sRGB" | "Adobe Color"
  activeFormat: "PNG" | "JPG"
}

interface FigmaFile {
  id: string
  key: string
  name: string
  thumbnail_url?: string
  last_modified: string
}

interface ExportJob {
  id: string
  figma_file_id: string
  config: ExportConfig
  status: "pending" | "processing" | "completed" | "failed"
  result_url?: string
  error_message?: string
  created_at: string
  updated_at: string
}

interface ValidationError {
  field: string
  message: string
}

// Constants
const sidebarItems: SidebarItem[] = [
  {
    name: "Import",
    icon: <ImageIcon className="w-4 h-4 stroke-[1.5]" />,
    hasChevron: true,
  },
  {
    name: "Video",
    icon: <Video className="w-4 h-4 stroke-[1.5]" />,
    hasChevron: false,
  },
  {
    name: "3D Object",
    icon: <Box className="w-4 h-4 stroke-[1.5]" />,
    hasChevron: false,
  },
]

const translations = {
  en: {
    importTitle: "Import Figma Design",
    exportStatus: "Export Status",
    noExports: "No exports yet",
    startExport: "Start your first export",
    exportAll: "Export All",
    addNewSize: "Add new size",
    compression: "Compression",
    resolution: "3840px × 2160px",
    exportButton: "Export Robot 2.0",
    importButton: "Import Design",
    removeExportConfig: "Remove export configuration",
    expandPreview: "Expand preview",
    scale: "Scale",
    colorProfile: "Color Profile",
    language: "Language",
    title: "Import Figma Design",
    figmaUrl: "Figma File URL",
    figmaUrlPlaceholder: "https://www.figma.com/design/...",
    figmaToken: "Figma API Token",
    useDefaultToken: "Use default token",
    useCustomToken: "Use custom token",
    tokenPlaceholder: "Enter your Figma API token",
    supportedFormats: "Supported formats: Figma file links (/file/) and design links (/design/)",
    getTokenInfo: "Get your token: Figma → Account Settings → Personal Access Tokens",
    importing: "Importing...",
    cancel: "Cancel",
    success: "Design imported successfully!",
    close: "Close",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    exportStarted: "Export started successfully",
    exportFailed: "Failed to start export",
    retry: "Retry",
    fileGenerated: "JavaScript file generated successfully",
    generatingFile: "Generating JavaScript file...",
    scaleTooltip: "Choose the export scale/resolution",
    colorProfileTooltip: "Select color profile for export",
    compressionTooltip: "Adjust image compression quality",
    noFileSelected: "No file selected",
    importToPreview: "Import a Figma file to view preview",
    errors: {
      required: "This field is required",
      invalidUrl: "Please enter a valid Figma URL",
      invalidToken: "Please enter a valid API key",
    },
  },
  hu: {
    importTitle: "Figma Design Importálása",
    exportStatus: "Export Állapot",
    noExports: "Még nincs export",
    startExport: "Indítsd el az első exportot",
    exportAll: "Összes Exportálása",
    addNewSize: "Új méret hozzáadása",
    compression: "Tömörítés",
    resolution: "3840px × 2160px",
    exportButton: "Robot 2.0 Exportálása",
    importButton: "Design Importálása",
    removeExportConfig: "Export konfiguráció eltávolítása",
    expandPreview: "Előnézet kibontása",
    scale: "Méret",
    colorProfile: "Színprofil",
    language: "Nyelv",
    title: "Figma Design Importálása",
    figmaUrl: "Figma Fájl URL",
    figmaUrlPlaceholder: "https://www.figma.com/design/...",
    figmaToken: "Figma API Kulcs",
    useDefaultToken: "Alapértelmezett kulcs használata",
    useCustomToken: "Egyéni kulcs használata",
    tokenPlaceholder: "Add meg a Figma API kulcsod",
    supportedFormats: "Támogatott formátumok: Figma fájl linkek (/file/) és design linkek (/design/)",
    getTokenInfo: "Szerezd be a tokened: Figma → Account Settings → Personal Access Tokens",
    importing: "Importálás...",
    cancel: "Mégse",
    success: "Design sikeresen importálva!",
    close: "Bezárás",
    pending: "Várakozik",
    processing: "Feldolgozás",
    completed: "Kész",
    failed: "Sikertelen",
    exportStarted: "Export sikeresen elindítva",
    exportFailed: "Export indítása sikertelen",
    retry: "Újra",
    fileGenerated: "JavaScript fájl sikeresen generálva",
    generatingFile: "JavaScript fájl generálása...",
    scaleTooltip: "Válaszd ki az export méretét/felbontását",
    colorProfileTooltip: "Válaszd ki a színprofilt az exporthoz",
    compressionTooltip: "Állítsd be a kép tömörítési minőségét",
    noFileSelected: "Nincs kiválasztott fájl",
    importToPreview: "Importálj egy Figma fájlt az előnézet megtekintéséhez",
    errors: {
      required: "Ez a mező kötelező",
      invalidUrl: "Kérlek adj meg egy érvényes Figma URL-t",
      invalidToken: "Kérlek adj meg egy érvényes API kulcsot",
    },
  },
}

// Components
const DevelopmentBanner = () => {
  const [isVisible, setIsVisible] = useState(true)
  const isDevelopment =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      process.env.NODE_ENV === "development")

  if (!isDevelopment || !isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-50"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Development Mode - Using mock Figma API responses</span>
              <span className="text-xs opacity-75">Deploy Edge Functions for production use</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-yellow-100 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4 text-yellow-600" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function generateFigmaJSFile(params: {
  name: string
  fileKey: string
  nodeId: string
  url: string
  timestamp: string
}) {
  return `// Figma Node: ${params.name}
// File Key: ${params.fileKey}
// Node ID: ${params.nodeId}
// Imported: ${params.timestamp}

// Raw Figma data - can be used with Figma API
const figmaData = {
"name": "${params.name}",
"lastModified": "${params.timestamp}",
"thumbnailUrl": "/placeholder.svg?height=200&width=300",
"version": "${Date.now()}",
"role": "viewer",
"editorType": "figma",
"linkAccess": "view",
"nodes": {
  "${params.nodeId}": {
    "document": {
      "id": "${params.nodeId}",
      "name": "${params.name}",
      "type": "COMPONENT",
      "scrollBehavior": "SCROLLS",
      "children": [
        {
          "id": "mock-child-1",
          "name": "Background",
          "type": "RECTANGLE",
          "fills": [
            {
              "blendMode": "NORMAL",
              "type": "SOLID",
              "color": {
                "r": 0.1,
                "g": 0.1,
                "b": 0.1,
                "a": 1
              }
            }
          ],
          "cornerRadius": 12,
          "absoluteBoundingBox": {
            "x": 0,
            "y": 0,
            "width": 300,
            "height": 200
          }
        },
        {
          "id": "mock-child-2",
          "name": "Title",
          "type": "TEXT",
          "characters": "Sample Design Component",
          "style": {
            "fontFamily": "Inter",
            "fontWeight": 600,
            "fontSize": 18,
            "textAlignHorizontal": "LEFT"
          },
          "fills": [
            {
              "blendMode": "NORMAL",
              "type": "SOLID",
              "color": {
                "r": 1,
                "g": 1,
                "b": 1,
                "a": 1
              }
            }
          ]
        }
      ],
      "absoluteBoundingBox": {
        "x": 0,
        "y": 0,
        "width": 300,
        "height": 200
      },
      "effects": [
        {
          "type": "DROP_SHADOW",
          "visible": true,
          "color": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.25
          },
          "offset": {
            "x": 0,
            "y": 4
          },
          "radius": 8
        }
      ]
    }
  }
},
"components": {},
"componentSets": {},
"styles": {
  "text-primary": {
    "name": "Text/Primary",
    "styleType": "FILL",
    "fills": [
      {
        "blendMode": "NORMAL",
        "type": "SOLID",
        "color": {
          "r": 1,
          "g": 1,
          "b": 1,
          "a": 1
        }
      }
    ]
  },
  "bg-primary": {
    "name": "Background/Primary",
    "styleType": "FILL",
    "fills": [
      {
        "blendMode": "NORMAL",
        "type": "SOLID",
        "color": {
          "r": 0.1,
          "g": 0.1,
          "b": 0.1,
          "a": 1
        }
      }
    ]
  }
}
};

// Helper function to extract styles and properties
function extractFigmaStyles(data) {
const result = {
  nodeName: "${params.name}",
  fileKey: "${params.fileKey}",
  nodeID: "${params.nodeId}",
  sourceURL: "${params.url}",
  components: [],
  styles: {},
  colors: [],
  typography: []
};

// Extract colors from the design
if (data.nodes && data.nodes["${params.nodeId}"]) {
  const node = data.nodes["${params.nodeId}"];
  result.colors = extractColors(node);
  result.typography = extractTypography(node);
}

return result;
}

// Extract color palette from Figma data
function extractColors(node) {
const colors = [];

function traverseNode(currentNode) {
  if (currentNode.fills) {
    currentNode.fills.forEach(fill => {
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b, a } = fill.color;
        const hex = rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
        colors.push({
          hex: hex,
          rgb: \`rgb(\${Math.round(r * 255)}, \${Math.round(g * 255)}, \${Math.round(b * 255)})\`,
          rgba: \`rgba(\${Math.round(r * 255)}, \${Math.round(g * 255)}, \${Math.round(b * 255)}, \${a})\`,
          opacity: a
        });
      }
    });
  }
  
  if (currentNode.children) {
    currentNode.children.forEach(child => traverseNode(child));
  }
}

traverseNode(node);
return [...new Set(colors.map(c => c.hex))].map(hex => colors.find(c => c.hex === hex));
}

// Extract typography from Figma data
function extractTypography(node) {
const typography = [];

function traverseNode(currentNode) {
  if (currentNode.type === 'TEXT' && currentNode.style) {
    typography.push({
      fontFamily: currentNode.style.fontFamily || 'Inter',
      fontSize: currentNode.style.fontSize || 16,
      fontWeight: currentNode.style.fontWeight || 400,
      lineHeight: currentNode.style.lineHeightPx || currentNode.style.fontSize * 1.2,
      letterSpacing: currentNode.style.letterSpacing || 0
    });
  }
  
  if (currentNode.children) {
    currentNode.children.forEach(child => traverseNode(child));
  }
}

traverseNode(node);
return typography;
}

// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Extract useful information from the Figma data
const figmaStyles = extractFigmaStyles(figmaData);

export { figmaData, figmaStyles };`
}

const FilePreview: React.FC<{
  file: FigmaFile | null
  isLoading?: boolean
  language: "en" | "hu"
  onExpand?: () => void
  onExport?: () => void
  onEnhance?: () => void
}> = ({ file, isLoading = false, language, onExpand, onExport, onEnhance }) => {
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const t = translations[language]

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "hu" ? "hu-HU" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-24 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading preview...</span>
        </div>
      </motion.div>
    )
  }

  if (!file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full h-24 rounded-xl overflow-hidden border border-dashed border-border bg-muted/50 flex flex-col items-center justify-center p-2"
      >
        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground mb-1">{t.noFileSelected}</div>
          <div className="text-[11px] text-muted-foreground/70">{t.importToPreview}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
      <figure className="relative w-full h-24 rounded-xl overflow-hidden border border-border bg-muted group">
        {file.thumbnail_url && !imageError ? (
          <>
            <AnimatePresence>
              {imageLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-muted"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={file.thumbnail_url}
              alt={file.name}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              onLoadStart={() => setImageLoading(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No preview</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onExpand && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExpand}
                aria-label="Expand preview"
                className="flex items-center justify-center h-6 w-6 rounded-md bg-background/90 hover:bg-background shadow transition"
              >
                <Maximize className="w-3 h-3 stroke-[1.5] text-foreground" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(`https://www.figma.com/file/${file.key}`, "_blank")}
              aria-label="Open in Figma"
              className="flex items-center justify-center h-6 w-6 rounded-md bg-background/90 hover:bg-background shadow transition"
            >
              <ExternalLink className="w-3 h-3 stroke-[1.5] text-foreground" />
            </motion.button>
            {onEnhance && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnhance}
                aria-label="Enhance code"
                className="flex items-center justify-center h-6 w-6 rounded-md bg-background/90 hover:bg-background shadow transition"
              >
                <Code2 className="w-3 h-3 stroke-[1.5] text-foreground" />
              </motion.button>
            )}
          </div>
        </div>
      </figure>
      <div className="px-1 space-y-1">
        <div className="text-xs font-medium text-foreground truncate" title={file.name}>
          {file.name}
        </div>
        <div className="text-[10px] text-muted-foreground">Last modified: {formatDate(file.last_modified)}</div>
      </div>
    </motion.div>
  )
}

const ExportConfigCard: React.FC<{
  config: ExportConfig
  onUpdate: (id: string, updates: Partial<ExportConfig>) => void
  onRemove: (id: string) => void
  language: "en" | "hu"
}> = ({ config, onUpdate, onRemove, language }) => {
  const t = translations[language]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-muted/50 rounded-xl p-4 border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Scale: {config.scale}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(config.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label={t.removeExportConfig}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{t.scale}</label>
          <Select value={config.scale} onValueChange={(value) => onUpdate(config.id, { scale: value })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5x">0.5x</SelectItem>
              <SelectItem value="1x">1x</SelectItem>
              <SelectItem value="1.5x">1.5x</SelectItem>
              <SelectItem value="2x">2x</SelectItem>
              <SelectItem value="3x">3x</SelectItem>
              <SelectItem value="4x">4x</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">{t.colorProfile}</label>
          <Select
            value={config.colorProfile}
            onValueChange={(value) => onUpdate(config.id, { colorProfile: value as "sRGB" | "Adobe Color" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sRGB">sRGB</SelectItem>
              <SelectItem value="Adobe Color">Adobe Color</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Format</label>
          <div className="flex gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={config.activeFormat === "PNG" ? "default" : "secondary"}
                size="sm"
                onClick={() => onUpdate(config.id, { activeFormat: "PNG" })}
                className="px-3 py-1 text-xs"
              >
                PNG
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={config.activeFormat === "JPG" ? "default" : "secondary"}
                size="sm"
                onClick={() => onUpdate(config.id, { activeFormat: "JPG" })}
                className="px-3 py-1 text-xs"
              >
                JPG
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ImportDialog: React.FC<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: (file: FigmaFile & { jsFilename?: string; downloadUrl?: string }) => void
  language: "en" | "hu"
}> = ({ open, onOpenChange, onImportSuccess, language }) => {
  const [figmaUrl, setFigmaUrl] = useState("")
  const [figmaToken, setFigmaToken] = useState("")
  const [useDefaultToken, setUseDefaultToken] = useState(true)
  const [showToken, setShowToken] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const t = translations[language]

  const importMutation = useMutation({
    mutationFn: async (data: { url: string; useDefaultToken: boolean; customToken?: string }) => {
      // Mock API response for development - simulate generating JavaScript file
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Extract file key and node ID from URL
      const urlMatch = data.url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/)
      const fileKey = urlMatch ? urlMatch[2] : "mock-file-key"
      const nodeId = "1-344" // This would be extracted from the URL or API response

      // Generate timestamp for unique filename
      const timestamp = Date.now()
      const filename = `figma-design_${timestamp}.js`

      // Generate the JavaScript file content
      const jsContent = generateFigmaJSFile({
        name: "Sample Figma Design",
        fileKey: fileKey,
        nodeId: nodeId,
        url: data.url,
        timestamp: new Date().toISOString(),
      })

      // Create blob URL for download
      const blob = new Blob([jsContent], { type: "application/javascript" })
      const downloadUrl = URL.createObjectURL(blob)

      return {
        success: true,
        data: {
          id: "mock-file-id",
          key: fileKey,
          name: "Sample Figma Design",
          thumbnail_url: "/placeholder.svg?height=96&width=200",
          last_modified: new Date().toISOString(),
          jsFilename: filename,
          downloadUrl: downloadUrl,
        },
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        onImportSuccess(data.data)
        queryClient.invalidateQueries({ queryKey: ["/api/figma/files"] })
        toast({
          title: t.success,
          description: "File imported successfully",
        })
        onOpenChange(false)
        setFigmaUrl("")
        setFigmaToken("")
        setUseDefaultToken(true)
        setErrors([])

        // Navigate to code enhancement after successful import
        setTimeout(() => {
          window.location.href = `/code-enhancement?fileId=${data.data.id}`
        }, 2000)
      } else {
        toast({
          title: "Import failed",
          description: "Failed to import file",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const validateInputs = (): boolean => {
    const newErrors: ValidationError[] = []
    if (!figmaUrl.trim()) {
      newErrors.push({ field: "url", message: t.errors.required })
    } else if (!/^https:\/\/(www\.)?figma\.com\/(file|design)\/[a-zA-Z0-9]+/.test(figmaUrl)) {
      newErrors.push({ field: "url", message: t.errors.invalidUrl })
    }

    if (!useDefaultToken) {
      if (!figmaToken.trim()) {
        newErrors.push({ field: "token", message: t.errors.required })
      } else if (figmaToken.length < 10) {
        newErrors.push({ field: "token", message: t.errors.invalidToken })
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleImport = async () => {
    if (!validateInputs()) return

    importMutation.mutate({
      url: figmaUrl,
      useDefaultToken,
      customToken: useDefaultToken ? undefined : figmaToken,
    })
  }

  const getFieldError = (field: string) => {
    return errors.find((error) => error.field === field)?.message
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DialogHeader>
                <DialogTitle>{t.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="figma-url">{t.figmaUrl}</Label>
                  <div className="relative">
                    <Input
                      id="figma-url"
                      type="url"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      placeholder={t.figmaUrlPlaceholder}
                      disabled={importMutation.isPending}
                      className={getFieldError("url") ? "border-destructive" : ""}
                    />
                    <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {getFieldError("url") && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive"
                    >
                      {getFieldError("url")}
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground">{t.supportedFormats}</p>
                </div>
                <div className="space-y-3">
                  <Label>{t.figmaToken}</Label>
                  <RadioGroup
                    value={useDefaultToken ? "default" : "custom"}
                    onValueChange={(value) => setUseDefaultToken(value === "default")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="default-token" />
                      <Label htmlFor="default-token" className="text-sm">
                        {t.useDefaultToken}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom-token" />
                      <Label htmlFor="custom-token" className="text-sm">
                        {t.useCustom}
                      </Label>
                    </div>
                  </RadioGroup>
                  <AnimatePresence>
                    {!useDefaultToken && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="relative">
                          <Input
                            type={showToken ? "text" : "password"}
                            value={figmaToken}
                            onChange={(e) => setFigmaToken(e.target.value)}
                            placeholder={t.tokenPlaceholder}
                            disabled={importMutation.isPending}
                            className={getFieldError("token") ? "border-destructive" : ""}
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </motion.button>
                        </div>
                        {getFieldError("token") && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-destructive"
                          >
                            {getFieldError("token")}
                          </motion.p>
                        )}
                        <p className="text-xs text-muted-foreground">{t.getTokenInfo}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importMutation.isPending}>
                    {t.cancel}
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleImport} disabled={importMutation.isPending}>
                    {importMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.importing}
                      </>
                    ) : (
                      t.importButton
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

const ExportJobStatus: React.FC<{
  job: ExportJob
  language: "en" | "hu"
}> = ({ job, language }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-muted-foreground" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusText = (status: string) => {
    const t = translations[language]
    switch (status) {
      case "pending":
        return t.pending
      case "processing":
        return t.processing
      case "completed":
        return t.completed
      case "failed":
        return t.failed
      default:
        return status
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/50 rounded-xl p-4 border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
            {getStatusIcon(job.status)}
          </motion.div>
          <span className="text-sm font-medium text-foreground">
            {job.config.scale} • {job.config.activeFormat}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{getStatusText(job.status)}</div>
      </div>
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Color Profile: {job.config.colorProfile}</div>

        <AnimatePresence>
          {job.status === "completed" && job.result_url && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 pt-2"
            >
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={() => window.open(job.result_url, "_blank")} className="px-3 py-1 text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {job.status === "failed" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 pt-2"
            >
              {job.error_message && <div className="text-xs text-red-500 flex-1">Error: {job.error_message}</div>}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log("Retrying export for job:", job.id)
                  }}
                  className="px-3 py-1 text-xs"
                >
                  {translations[language].retry}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const ExportSettings: React.FC<{
  exportConfigs: ExportConfig[]
  updateExportConfig: (id: string, updates: Partial<ExportConfig>) => void
  addExportConfig: () => void
  removeExportConfig: (id: string) => void
  compressionValue: number
  setCompressionValue: (value: number) => void
  language: "en" | "hu"
}> = ({
  exportConfigs,
  updateExportConfig,
  addExportConfig,
  removeExportConfig,
  compressionValue,
  setCompressionValue,
  language,
}) => {
  const t = translations[language]
  const scaleOptions = ["0.5x", "1x", "1.5x", "2x", "3x", "4x"]

  return (
    <>
      <AnimatePresence>
        {exportConfigs.map((config, index) => (
          <motion.div
            key={config.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="relative" title={t.scaleTooltip}>
              <select
                aria-label={t.scale}
                value={config.scale}
                onChange={(e) => updateExportConfig(config.id, { scale: e.target.value })}
                className="appearance-none flex items-center h-11 px-3 pr-8 rounded-lg bg-muted border border-border cursor-pointer hover:bg-background text-xs font-medium tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {scaleOptions.map((scale) => (
                  <option key={scale} value={scale}>
                    {scale}
                  </option>
                ))}
              </select>
              <ZoomIn className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 stroke-[1.5] text-muted-foreground/80 pointer-events-none" />
            </div>
            <div className="relative flex-1" title={t.colorProfileTooltip}>
              <select
                aria-label={t.colorProfile}
                value={config.colorProfile}
                onChange={(e) =>
                  updateExportConfig(config.id, { colorProfile: e.target.value as "sRGB" | "Adobe Color" })
                }
                className="appearance-none w-full h-11 pl-10 pr-8 rounded-lg bg-background border border-border cursor-pointer hover:bg-muted text-xs font-medium tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="sRGB">sRGB</option>
                <option value="Adobe Color">Adobe Color</option>
              </select>
              {config.colorProfile === "sRGB" ? (
                <Aperture className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 stroke-[1.5] text-muted-foreground/80 pointer-events-none" />
              ) : (
                <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 stroke-[1.5] text-muted-foreground/80 pointer-events-none" />
              )}
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 stroke-[1.5] text-muted-foreground pointer-events-none" />
            </div>
            <div className="flex items-center h-11 bg-muted border border-border rounded-lg overflow-hidden">
              <button
                aria-pressed={config.activeFormat === "PNG"}
                onClick={() => updateExportConfig(config.id, { activeFormat: "PNG" })}
                className={`px-4 h-full flex items-center justify-center text-xs font-medium tracking-tight transition-all ${
                  config.activeFormat === "PNG"
                    ? "bg-background font-semibold shadow-sm border-r border-border"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                PNG
              </button>
              <button
                aria-pressed={config.activeFormat === "JPG"}
                onClick={() => updateExportConfig(config.id, { activeFormat: "JPG" })}
                className={`px-4 h-full flex items-center justify-center text-xs font-medium tracking-tight transition-all ${
                  config.activeFormat === "JPG"
                    ? "bg-background font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                JPG
              </button>
            </div>
            {exportConfigs.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Remove export configuration"
                onClick={() => removeExportConfig(config.id)}
                className="p-1 rounded-md hover:bg-muted focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-ring transition"
              >
                <Plus className="w-4 h-4 stroke-[1.5] text-muted-foreground rotate-45" />
              </motion.button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={t.addNewSize}
        onClick={addExportConfig}
        className="mt-3 p-2 rounded-md hover:bg-muted focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-ring transition w-full flex justify-center items-center gap-2 text-muted-foreground text-xs font-medium border border-dashed border-border"
      >
        <Plus className="w-4 h-4 stroke-[1.5]" />
        {t.addNewSize}
      </motion.button>
      <div className="flex flex-col gap-2 w-full pt-2 border-t border-border mt-2" title={t.compressionTooltip}>
        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
          <span className="font-medium tracking-tight text-foreground">{t.compression}</span>
          <span className="text-[10px]">{t.resolution}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            aria-label="Compression quality"
            min={0}
            max={100}
            value={compressionValue}
            onChange={(e) => setCompressionValue(Number(e.target.value))}
            className="flex-1 appearance-none h-3 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 slider-thumb"
          />
          <div className="flex items-center h-9 px-3 rounded-lg border border-border gap-1 bg-background">
            <GripHorizontal className="w-4 h-4 stroke-[1.5] text-muted-foreground/70 rotate-180" />
            <span className="text-xs font-medium tracking-tight min-w-[2.5rem] text-center">{compressionValue}%</span>
          </div>
        </div>
      </div>
    </>
  )
}

// 2️⃣  Rename the original component so it can be wrapped by Providers
function FigmaExportToolInner() {
  const [activeItem, setActiveItem] = useState<string>("Import")
  const [language, setLanguage] = useState<"en" | "hu">("hu")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState<FigmaFile | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [compressionValue, setCompressionValue] = useState<number>(80)
  const [exportConfigs, setExportConfigs] = useState<ExportConfig[]>([
    {
      id: "1x",
      scale: "1x",
      colorProfile: "sRGB",
      activeFormat: "PNG",
    },
    {
      id: "2x",
      scale: "2x",
      colorProfile: "Adobe Color",
      activeFormat: "JPG",
    },
  ])
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const t = translations[language]

  // Add state for the preview modal after the other state declarations:
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // Mock export jobs data
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/figma", currentFile?.id, "jobs"],
    queryFn: async () => {
      if (!currentFile) return []
      // Mock data
      return [
        {
          id: "job-1",
          figma_file_id: currentFile.id,
          config: exportConfigs[0],
          status: "completed" as const,
          result_url: "/mock-export-1.png",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "job-2",
          figma_file_id: currentFile.id,
          config: exportConfigs[1],
          status: "processing" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    },
    enabled: !!currentFile,
    refetchInterval: 2000,
  })

  useEffect(() => {
    if (jobs) {
      setExportJobs(jobs)
    }
  }, [jobs])

  const exportMutation = useMutation({
    mutationFn: async (data: { figmaFileId: string; configs: ExportConfig[] }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        data: { message: "Export jobs started successfully" },
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t.exportStarted,
          description: data.data.message,
        })
        queryClient.invalidateQueries({ queryKey: ["/api/figma", currentFile?.id, "jobs"] })
      } else {
        toast({
          title: t.exportFailed,
          description: "Failed to start export",
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: t.exportFailed,
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateExportConfig = (configId: string, updates: Partial<ExportConfig>) => {
    setExportConfigs((prev) => prev.map((config) => (config.id === configId ? { ...config, ...updates } : config)))
  }

  const addExportConfig = () => {
    const newId = `${exportConfigs.length + 1}x`
    setExportConfigs((prev) => [
      ...prev,
      {
        id: newId,
        scale: newId,
        colorProfile: "sRGB",
        activeFormat: "PNG",
      },
    ])
  }

  const removeExportConfig = (configId: string) => {
    if (exportConfigs.length > 1) {
      setExportConfigs((prev) => prev.filter((config) => config.id !== configId))
    }
  }

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName)
    if (itemName === "Import") {
      setIsImportDialogOpen(true)
    }
  }

  const handleImportSuccess = (file: FigmaFile & { jsFilename?: string; downloadUrl?: string }) => {
    setCurrentFile(file)
    setIsImporting(false)

    if (file.jsFilename && file.downloadUrl) {
      toast({
        title: t.fileGenerated,
        description: (
          <div className="flex items-center gap-2">
            <span>{file.jsFilename}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Create download link
                const link = document.createElement("a")
                link.href = file.downloadUrl
                link.download = file.jsFilename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                // Clean up blob URL
                URL.revokeObjectURL(file.downloadUrl)
              }}
              className="h-6 px-2 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        ),
        duration: 10000,
      })
    } else {
      toast({
        title: t.success,
        description: t.fileGenerated,
        duration: 5000,
      })
    }
  }

  const handleExportAll = () => {
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Please import a Figma file first",
        variant: "destructive",
      })
      return
    }
    exportMutation.mutate({
      figmaFileId: currentFile.id,
      configs: exportConfigs,
    })
  }

  return (
    <>
      <DevelopmentBanner />
      <div
        className="min-h-screen flex items-center justify-center bg-neutral-100 text-foreground antialiased selection:bg-neutral-900/90 selection:text-neutral-50 p-4"
        style={{
          paddingTop:
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
              ? "3rem"
              : "1rem",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row w-full max-w-[900px] h-auto lg:h-[400px] rounded-2xl border border-border overflow-hidden shadow-sm bg-card/60 backdrop-blur-xl"
        >
          {/* Sidebar */}
          <aside className="w-full lg:w-[200px] h-auto lg:h-full flex flex-row lg:flex-col justify-between border-b lg:border-b-0 lg:border-r border-border bg-card/70 p-3 gap-4">
            {/* Navigation */}
            <nav className="flex flex-row lg:flex-col gap-1 flex-1 lg:flex-none" aria-label="Export categories">
              {sidebarItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-current={activeItem === item.name ? "page" : undefined}
                  onClick={() => handleItemClick(item.name)}
                  className={`group flex items-center justify-between w-full lg:h-10 h-12 rounded-xl focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-ring transition-all ${
                    activeItem === item.name
                      ? "pl-1 pr-2 bg-background border border-border shadow-sm"
                      : "p-1 hover:bg-muted/60"
                  }`}
                >
                  <span className="flex items-center gap-3 flex-1">
                    <span
                      className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                        activeItem === item.name ? "bg-blue-500 shadow-sm" : "bg-muted group-hover:bg-background"
                      }`}
                    >
                      <div
                        className={
                          activeItem === item.name ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                        }
                      >
                        {item.icon}
                      </div>
                    </span>
                    <span className="text-xs font-medium tracking-tight text-foreground hidden sm:inline">
                      {item.name}
                    </span>
                  </span>
                  {item.hasChevron && (
                    <ChevronRight className="w-4 h-4 stroke-[1.5] text-muted-foreground group-hover:translate-x-[2px] transition-transform hidden sm:inline" />
                  )}
                </motion.button>
              ))}
            </nav>
            {/* File Preview */}
            <div className="hidden lg:block">
              <FilePreview
                file={currentFile}
                isLoading={isImporting}
                language={language}
                onExpand={() => {
                  setIsPreviewModalOpen(true)
                }}
                onExport={() => {
                  // Scroll to export section or highlight it
                }}
                onEnhance={() => {
                  if (currentFile) {
                    window.location.href = `/code-enhancement?fileId=${currentFile.id}`
                  }
                }}
              />
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex flex-col flex-1 bg-background">
            {/* Header */}
            <header className="flex items-center justify-between h-14 px-4 border-b border-border">
              <h2 className="text-xs font-semibold tracking-tight text-foreground">
                {activeItem === "Import" ? t.importTitle : activeItem}
              </h2>
              {/* Language Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(language === "en" ? "hu" : "en")}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors text-xs font-medium text-muted-foreground"
                aria-label={t.language}
              >
                <Globe className="w-3 h-3" />
                {language.toUpperCase()}
              </motion.button>
            </header>
            {/* Settings */}
            <section className="flex flex-col gap-1.5 py-4 px-4 overflow-y-auto custom-scrollbar min-h-[200px] max-h-[calc(400px-56px)] lg:max-h-[calc(400px-112px)]">
              {activeItem === "Import" ? (
                <div className="space-y-4">
                  {/* Mobile File Preview */}
                  <div className="lg:hidden">
                    <FilePreview
                      file={currentFile}
                      isLoading={isImporting}
                      language={language}
                      onExpand={() => {
                        // TODO: Implement expanded preview modal
                      }}
                      onExport={() => {
                        // Scroll to export section or highlight it
                      }}
                    />
                  </div>
                  {/* Export Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-medium text-foreground">{t.exportStatus}</h3>
                      {currentFile && exportConfigs.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleExportAll}
                          disabled={exportMutation.isPending}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {exportMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                          {exportMutation.isPending ? "Exporting..." : t.exportAll}
                        </motion.button>
                      )}
                    </div>
                    {jobsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : exportJobs.length === 0 ? (
                      <div className="text-center py-4 text-xs text-muted-foreground">
                        <div className="mb-1">{t.noExports}</div>
                        <div className="text-[10px]">{t.startExport}</div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        <AnimatePresence>
                          {exportJobs.map((job) => (
                            <ExportJobStatus key={job.id} job={job} language={language} />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <ExportSettings
                  exportConfigs={exportConfigs}
                  updateExportConfig={updateExportConfig}
                  addExportConfig={addExportConfig}
                  removeExportConfig={removeExportConfig}
                  compressionValue={compressionValue}
                  setCompressionValue={setCompressionValue}
                  language={language}
                />
              )}
            </section>
            {/* Footer */}
            <footer className="mt-auto p-4 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-11 flex items-center justify-center rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 text-white text-sm font-semibold tracking-tight hover:from-blue-600 hover:to-blue-700 focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-ring transition-all shadow-sm"
                type="button"
                onClick={() => activeItem === "Import" && setIsImportDialogOpen(true)}
              >
                {activeItem === "Import" ? t.importButton : t.exportButton}
              </motion.button>
            </footer>
          </main>
        </motion.section>
      </div>
      {/* Figma Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportSuccess={handleImportSuccess}
        language={language}
      />
      {/* Figma Preview Modal */}
      <FigmaPreviewModal
        file={currentFile}
        open={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        language={language}
      />
    </>
  )
}

// 3️⃣  (new) Export a wrapper component that puts <Providers> around the page
export default function FigmaExportTool() {
  return (
    <Providers>
      <FigmaExportToolInner />
    </Providers>
  )
}
