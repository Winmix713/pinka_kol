"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Copy,
  Eye,
  EyeOff,
  Code,
  Palette,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react"
import { MonacoEditor } from "./monaco-editor"
import { codeValidator, type ValidationResult } from "./code-validator"

interface CodeEditorPanelProps {
  tsxCode: string
  cssCode: string
  typesCode: string
  onTsxChange: (code: string) => void
  onCssChange: (code: string) => void
  onTypesChange: (code: string) => void
  className?: string
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  tsxCode,
  cssCode,
  typesCode,
  onTsxChange,
  onCssChange,
  onTypesChange,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("tsx")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [validationResults, setValidationResults] = useState<{
    tsx: ValidationResult
    css: ValidationResult
    types: ValidationResult
  }>({
    tsx: { isValid: true, errors: [], warnings: [], suggestions: [] },
    css: { isValid: true, errors: [], warnings: [], suggestions: [] },
    types: { isValid: true, errors: [], warnings: [], suggestions: [] },
  })

  // Validate code when it changes
  const validateCode = useCallback(async () => {
    const [tsxResult, cssResult, typesResult] = await Promise.all([
      codeValidator.validateTSX(tsxCode),
      codeValidator.validateCSS(cssCode),
      codeValidator.validateTypeScript(typesCode),
    ])

    setValidationResults({
      tsx: tsxResult,
      css: cssResult,
      types: typesResult,
    })
  }, [tsxCode, cssCode, typesCode])

  React.useEffect(() => {
    validateCode()
  }, [validateCode])

  const handleCopy = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code)
      // Could add toast notification here
    } catch (error) {
      console.error(`Failed to copy ${type}:`, error)
    }
  }

  const handleDownload = (code: string, filename: string, mimeType: string) => {
    const blob = new Blob([code], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getValidationSummary = (result: ValidationResult) => {
    const totalIssues = result.errors.length + result.warnings.length
    if (result.errors.length > 0) {
      return { status: "error", count: totalIssues, color: "text-red-500" }
    } else if (result.warnings.length > 0) {
      return { status: "warning", count: totalIssues, color: "text-yellow-500" }
    } else {
      return { status: "success", count: 0, color: "text-green-500" }
    }
  }

  const renderValidationPanel = (result: ValidationResult, type: string) => {
    const summary = getValidationSummary(result)

    return (
      <div className="space-y-3">
        {/* Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {summary.status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
            {summary.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            {summary.status === "error" && <AlertTriangle className="w-4 h-4 text-red-500" />}
            <span className={`font-medium ${summary.color}`}>
              {summary.status === "success"
                ? "No issues found"
                : `${summary.count} issue${summary.count !== 1 ? "s" : ""} found`}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {type.toUpperCase()}
          </Badge>
        </div>

        {/* Errors */}
        {result.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Errors ({result.errors.length})
            </h4>
            <div className="space-y-1">
              {result.errors.map((error, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">{error.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings ({result.warnings.length})
            </h4>
            <div className="space-y-1">
              {result.warnings.map((warning, index) => (
                <Alert key={index} className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-800 text-sm">{warning.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Suggestions ({result.suggestions.length})
            </h4>
            <div className="space-y-1">
              {result.suggestions.map((suggestion, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-800 text-sm">{suggestion.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`bg-white border-gray-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Code Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="text-gray-600"
            >
              {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => validateCode()} className="text-gray-600">
              <Zap className="w-4 h-4 mr-1" />
              Validate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tsx" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              TSX
              {validationResults.tsx.errors.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {validationResults.tsx.errors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="css" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              CSS
              {validationResults.css.errors.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {validationResults.css.errors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Types
              {validationResults.types.errors.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {validationResults.types.errors.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <TabsContent value="tsx" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">React Component (TSX)</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(tsxCode, "TSX")}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(tsxCode, "Component.tsx", "text/typescript")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <MonacoEditor
                    value={tsxCode}
                    onChange={onTsxChange}
                    language="typescript"
                    height="400px"
                    readOnly={isPreviewMode}
                  />
                </div>
                <div>
                  <ScrollArea className="h-[400px] border rounded-md p-4">
                    {renderValidationPanel(validationResults.tsx, "tsx")}
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="css" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Styles (CSS)</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(cssCode, "CSS")}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(cssCode, "Component.css", "text/css")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <MonacoEditor
                    value={cssCode}
                    onChange={onCssChange}
                    language="css"
                    height="400px"
                    readOnly={isPreviewMode}
                  />
                </div>
                <div>
                  <ScrollArea className="h-[400px] border rounded-md p-4">
                    {renderValidationPanel(validationResults.css, "css")}
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="types" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Type Definitions (TS)</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(typesCode, "Types")}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(typesCode, "Component.types.ts", "text/typescript")}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <MonacoEditor
                    value={typesCode}
                    onChange={onTypesChange}
                    language="typescript"
                    height="400px"
                    readOnly={isPreviewMode}
                  />
                </div>
                <div>
                  <ScrollArea className="h-[400px] border rounded-md p-4">
                    {renderValidationPanel(validationResults.types, "types")}
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
