"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle,
  Maximize2,
  Minimize2,
} from "lucide-react"

interface PreviewRendererProps {
  tsxCode: string
  cssCode: string
  className?: string
}

type ViewportSize = "mobile" | "tablet" | "desktop"

const viewportSizes = {
  mobile: { width: 375, height: 667, icon: Smartphone },
  tablet: { width: 768, height: 1024, icon: Tablet },
  desktop: { width: 1200, height: 800, icon: Monitor },
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ tsxCode, cssCode, className = "" }) => {
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>("desktop")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const generatePreviewHTML = () => {
    // Extract component name from TSX code
    const componentMatch = tsxCode.match(/export\s+(?:const|function)\s+(\w+)/)
    const componentName = componentMatch ? componentMatch[1] : "Component"

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f8fafc;
    }
    #root {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 40px);
    }
    .preview-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    ${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
    // Transform TSX code to remove imports and exports
    const componentCode = \`${tsxCode.replace(/import.*from.*['"];?/g, "").replace(/export\s+(default\s+)?/g, "")}\`;
    
    // Evaluate the component code
    try {
      eval(componentCode);
      
      // Render the component
      const App = () => {
        return React.createElement('div', { className: 'preview-container' }, 
          React.createElement(${componentName}, {
            // Add some default props for preview
            children: 'Preview Content',
            onClick: () => console.log('Component clicked'),
          })
        );
      };
      
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
    } catch (error) {
      document.getElementById('root').innerHTML = \`
        <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px; background: #fef2f2;">
          <h3>Preview Error</h3>
          <p>\${error.message}</p>
        </div>
      \`;
    }
  </script>
</body>
</html>
    `
  }

  const updatePreview = () => {
    if (!iframeRef.current) return

    setIsLoading(true)
    setPreviewError(null)

    try {
      const html = generatePreviewHTML()
      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      iframeRef.current.src = url

      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Failed to generate preview")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    updatePreview()
  }, [tsxCode, cssCode])

  const handleDownloadHTML = () => {
    const html = generatePreviewHTML()
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "component-preview.html"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const viewport = viewportSizes[currentViewport]
  const ViewportIcon = viewport.icon

  return (
    <Card className={`bg-white border-gray-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={updatePreview}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadHTML}>
              <Download className="w-4 h-4 mr-1" />
              Export HTML
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Viewport Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Viewport:</span>
              <Tabs value={currentViewport} onValueChange={(value) => setCurrentViewport(value as ViewportSize)}>
                <TabsList className="grid w-full grid-cols-3">
                  {Object.entries(viewportSizes).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{key}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </Tabs>
            </div>
            <Badge variant="outline" className="text-xs">
              {viewport.width} × {viewport.height}
            </Badge>
          </div>

          {/* Error Display */}
          {previewError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>Preview Error:</strong> {previewError}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-blue-800">Generating preview...</AlertDescription>
            </Alert>
          )}

          {/* Preview Frame */}
          <div
            className={`
              border border-gray-200 rounded-lg overflow-hidden bg-gray-50
              ${isFullscreen ? "fixed inset-4 z-50" : ""}
            `}
          >
            <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
              <div className="flex items-center gap-2">
                <ViewportIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {currentViewport.charAt(0).toUpperCase() + currentViewport.slice(1)} Preview
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>

            <div
              className="flex items-center justify-center p-4"
              style={{
                height: isFullscreen ? "calc(100vh - 120px)" : "500px",
              }}
            >
              <div
                className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white"
                style={{
                  width: isFullscreen ? "100%" : `${Math.min(viewport.width, 800)}px`,
                  height: isFullscreen ? "100%" : `${Math.min(viewport.height, 450)}px`,
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              >
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  title="Component Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Preview updates automatically when code changes</p>
            <p>• Use viewport controls to test responsive design</p>
            <p>• Click "Export HTML" to download standalone preview</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
