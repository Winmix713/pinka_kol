"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Code, RefreshCw, Download, CheckCircle } from "lucide-react"
import {
  EnhancedStep1Configuration,
  EnhancedStep2SvgGeneration,
  EnhancedStep3CssImplementation,
  EnhancedStep4FinalGeneration,
} from "../code-editor/enhanced-step-components"
import { GlobalErrorBoundary, useErrorHandler } from "../utils/error-handler"

interface GeneratorState {
  // Step 1
  figmaUrl: string
  accessToken: string
  figmaData: any

  // Step 2
  svgCode: string
  generatedTsxCode: string

  // Step 3
  cssCode: string

  // Step 4
  jsxCode: string
  moreCssCode: string
  finalTsxCode: string
  finalCssCode: string

  // Status
  loading: {
    step1: boolean
    step2: boolean
    step3: boolean
    step4: boolean
  }

  errors: {
    step1: string
    step2: string
    step3: string
    step4: string
  }

  success: {
    step1: boolean
    step2: boolean
    step3: boolean
    step4: boolean
  }
}

const initialState: GeneratorState = {
  figmaUrl: "",
  accessToken: "",
  figmaData: null,
  svgCode: "",
  generatedTsxCode: "",
  cssCode: "",
  jsxCode: "",
  moreCssCode: "",
  finalTsxCode: "",
  finalCssCode: "",
  loading: {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  },
  errors: {
    step1: "",
    step2: "",
    step3: "",
    step4: "",
  },
  success: {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  },
}

export const EnhancedFigmaGenerator: React.FC = () => {
  const [state, setState] = useState<GeneratorState>(initialState)
  const { handleError } = useErrorHandler()

  // Helper function to update state
  const updateState = useCallback((updates: Partial<GeneratorState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Step 1: Connect to Figma
  const handleFigmaConnect = useCallback(
    async (data: { figmaUrl: string; accessToken: string }) => {
      updateState({
        loading: { ...state.loading, step1: true },
        errors: { ...state.errors, step1: "" },
        success: { ...state.success, step1: false },
      })

      try {
        // Simulate Figma API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Mock successful response
        const mockFigmaData = {
          file: {
            name: "Design System Components",
            last_modified: new Date().toISOString(),
          },
          metadata: {
            componentCount: 12,
            styleCount: 8,
          },
        }

        updateState({
          figmaUrl: data.figmaUrl,
          accessToken: data.accessToken,
          figmaData: mockFigmaData,
          loading: { ...state.loading, step1: false },
          success: { ...state.success, step1: true },
        })

        // Auto-generate SVG code from Figma data
        const mockSvgCode = `<svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="180" height="80" rx="8" fill="#3B82F6" />
  <text x="100" y="55" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="16">
    Button Component
  </text>
</svg>`

        updateState({
          svgCode: mockSvgCode,
        })
      } catch (error) {
        const errorMessage = handleError(
          error instanceof Error ? error : new Error("Connection failed"),
        )

        updateState({
          loading: { ...state.loading, step1: false },
          errors: { ...state.errors, step1: errorMessage },
        })
      }
    },
    [state, updateState, handleError],
  )

  // Step 2: Generate TSX from SVG
  const handleSvgGenerate = useCallback(async () => {
    updateState({
      loading: { ...state.loading, step2: true },
      errors: { ...state.errors, step2: "" },
      success: { ...state.success, step2: false },
    })

    try {
      // Simulate SVG to TSX conversion
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const generatedTsx = `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <button
      className={\`btn-component \${className}\`}
      onClick={onClick}
      aria-label="Button component"
    >
      {children}
    </button>
  );
};`

      updateState({
        generatedTsxCode: generatedTsx,
        loading: { ...state.loading, step2: false },
        success: { ...state.success, step2: true },
      })

      // Auto-generate CSS
      const mockCssCode = `.btn-component {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-component:hover {
  background: #2563EB;
  transform: translateY(-1px);
}

.btn-component:active {
  transform: translateY(0);
}

.btn-component:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}`

      updateState({
        cssCode: mockCssCode,
      })
      } catch (error) {
      const errorMessage = handleError(
        error instanceof Error ? error : new Error("SVG conversion failed"),
      )

      updateState({
        loading: { ...state.loading, step2: false },
        errors: { ...state.errors, step2: errorMessage },
      })
      }
      }, [state, updateState, handleError])

  // Step 3: Save CSS
  const handleCssSave = useCallback(async () => {
    updateState({
      loading: { ...state.loading, step3: true },
      errors: { ...state.errors, step3: "" },
      success: { ...state.success, step3: false },
    })

    try {
      // Simulate CSS validation and save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      updateState({
        loading: { ...state.loading, step3: false },
        success: { ...state.success, step3: true },
      })
    } catch (error) {
      const errorMessage = handleError(
        error instanceof Error ? error : new Error("CSS save failed"),
      )

      updateState({
        loading: { ...state.loading, step3: false },
        errors: { ...state.errors, step3: errorMessage },
      })
      }
      }, [state, updateState, handleError])

  // Step 4: Generate Final Code
  const handleFinalGenerate = useCallback(async () => {
    updateState({
      loading: { ...state.loading, step4: true },
      errors: { ...state.errors, step4: "" },
      success: { ...state.success, step4: false },
    })

    try {
      // Simulate final code generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Combine all code
      const finalTsx = state.generatedTsxCode + "\n\n" + (state.jsxCode || "// Additional JSX code here")
      const finalCss = state.cssCode + "\n\n" + (state.moreCssCode || "/* Additional CSS here */")

      updateState({
        finalTsxCode: finalTsx,
        finalCssCode: finalCss,
        loading: { ...state.loading, step4: false },
        success: { ...state.success, step4: true },
      })
    } catch (error) {
      const errorMessage = handleError(
        error instanceof Error ? error : new Error("Final generation failed"),
      )

      updateState({
        loading: { ...state.loading, step4: false },
        errors: { ...state.errors, step4: errorMessage },
      })
      }
      }, [state, updateState, handleError])

  // Reset all
  const handleReset = useCallback(() => {
    setState(initialState)
  }, [])

  // Download code
  const handleDownload = useCallback(() => {
    if (state.finalTsxCode && state.finalCssCode) {
      // Create and download TSX file
      const tsxBlob = new Blob([state.finalTsxCode], { type: "text/plain" })
      const tsxUrl = URL.createObjectURL(tsxBlob)
      const tsxLink = document.createElement("a")
      tsxLink.href = tsxUrl
      tsxLink.download = "GeneratedComponent.tsx"
      tsxLink.click()
      URL.revokeObjectURL(tsxUrl)

      // Create and download CSS file
      const cssBlob = new Blob([state.finalCssCode], { type: "text/css" })
      const cssUrl = URL.createObjectURL(cssBlob)
      const cssLink = document.createElement("a")
      cssLink.href = cssUrl
      cssLink.download = "GeneratedComponent.css"
      cssLink.click()
      URL.revokeObjectURL(cssUrl)
    }
  }, [state.finalTsxCode, state.finalCssCode])

  // Calculate overall progress
  const overallProgress = Object.values(state.success).filter(Boolean).length * 25

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Enhanced Figma Code Generator</h1>
                <p className="text-gray-400">Advanced 4-step process with intelligent analysis and optimization</p>
              </div>
            </div>

            <div className="flex gap-2">
              {state.success.step4 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="text-gray-300 border-gray-600 hover:bg-gray-800 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-300 border-gray-600 hover:bg-gray-800 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Overall Progress</h3>
                <span className="text-gray-400">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Figma Connection</span>
                <span>SVG Generation</span>
                <span>CSS Implementation</span>
                <span>Final Generation</span>
              </div>
            </CardContent>
          </Card>

          {/* 4-Step Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <EnhancedStep1Configuration
              onConnect={handleFigmaConnect}
              isLoading={state.loading.step1}
              error={state.errors.step1}
              figmaData={state.figmaData}
            />

            <EnhancedStep2SvgGeneration
              svgCode={state.svgCode}
              onSvgChange={(code: string) => updateState({ svgCode: code })}
              onGenerate={handleSvgGenerate}
              isLoading={state.loading.step2}
              error={state.errors.step2}
              generatedCode={state.generatedTsxCode}
            />

            <EnhancedStep3CssImplementation
              cssCode={state.cssCode}
              onCssChange={(code: string) => updateState({ cssCode: code })}
              onSave={handleCssSave}
              isLoading={state.loading.step3}
              error={state.errors.step3}
              isSuccess={state.success.step3}
            />

            <EnhancedStep4FinalGeneration
              jsxCode={state.jsxCode}
              moreCssCode={state.moreCssCode}
              onJsxChange={(code: string) => updateState({ jsxCode: code })}
              onCssChange={(code: string) => updateState({ moreCssCode: code })}
              onGenerate={handleFinalGenerate}
              isLoading={state.loading.step4}
              error={state.errors.step4}
              finalTsxCode={state.finalTsxCode}
              finalCssCode={state.finalCssCode}
            />
          </div>

          {/* Success Summary */}
          {state.success.step4 && (
            <Card className="bg-green-900/20 border-green-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-green-400 font-medium text-lg">Code Generation Complete!</h3>
                </div>
                <p className="text-green-300 mb-4">
                  Your Figma design has been successfully converted to production-ready React components with optimized
                  CSS.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Files
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(state.finalTsxCode + "\n\n" + state.finalCssCode)}
                    className="border-green-600 text-green-400 hover:bg-green-900/20"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Copy All Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default EnhancedFigmaGenerator
