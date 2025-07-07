"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MonacoEditor } from "@/components/code-editor/monaco-editor"
import { codeValidator, type ValidationError } from "@/components/code-editor/code-validator"
import { AlertCircle, CheckCircle, Code, Palette, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

const SAMPLE_CODE = {
  typescript: `import React, { useState } from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    if (onClick && !disabled) {
      setIsLoading(true)
      onClick()
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  return (
    <button
      className={\`btn btn-\${variant} \${disabled ? 'disabled' : ''}\`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}`,
  css: `.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}`,
  javascript: `function createCounter() {
  let count = 0
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
    reset: () => {
      count = 0
      return count
    }
  }
}

const counter = createCounter()
console.log(counter.getValue()) // 0
console.log(counter.increment()) // 1
console.log(counter.increment()) // 2
console.log(counter.decrement()) // 1
console.log(counter.reset()) // 0`,
}

export default function CodeEnhancementPage() {
  const [activeTab, setActiveTab] = useState<"typescript" | "css" | "javascript">("typescript")
  const [code, setCode] = useState(SAMPLE_CODE.typescript)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  const handleTabChange = useCallback((value: string) => {
    const newTab = value as "typescript" | "css" | "javascript"
    setActiveTab(newTab)
    setCode(SAMPLE_CODE[newTab])
    setErrors([])
    setStats(null)
  }, [])

  const handleCodeChange = useCallback(
    async (newCode: string) => {
      setCode(newCode)
      setIsValidating(true)

      try {
        const result = await codeValidator.validate(newCode, activeTab)
        setErrors(result.errors)
        setStats(result.stats)
      } catch (error) {
        console.error("Validation error:", error)
        toast({
          title: "Validation Error",
          description: "Failed to validate code. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsValidating(false)
      }
    },
    [activeTab, toast],
  )

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "typescript":
        return <Code className="w-4 h-4" />
      case "css":
        return <Palette className="w-4 h-4" />
      case "javascript":
        return <FileText className="w-4 h-4" />
      default:
        return null
    }
  }

  const getErrorsByCategory = () => {
    const categories = errors.reduce(
      (acc, error) => {
        const category = error.category || "general"
        if (!acc[category]) acc[category] = []
        acc[category].push(error)
        return acc
      },
      {} as Record<string, ValidationError[]>,
    )
    return categories
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Enhancement Studio</h1>
        <p className="text-muted-foreground">
          Advanced code editor with real-time validation, error checking, and enhancement suggestions.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getTabIcon(activeTab)}
                    Code Editor
                  </CardTitle>
                  <CardDescription>Write and validate your {activeTab} code with real-time feedback</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isValidating && (
                    <Badge variant="secondary" className="animate-pulse">
                      Validating...
                    </Badge>
                  )}
                  {errors.length === 0 && !isValidating && code.trim() && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  )}
                  {errors.length > 0 && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.length} Error{errors.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="typescript" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    TypeScript
                  </TabsTrigger>
                  <TabsTrigger value="css" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    CSS
                  </TabsTrigger>
                  <TabsTrigger value="javascript" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    JavaScript
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <MonacoEditor
                    value={code}
                    onChange={handleCodeChange}
                    language={activeTab}
                    errors={errors}
                    height="500px"
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      lineHeight: 20,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                    }}
                  />
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Validation Results */}
        <div className="space-y-6">
          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Errors:</span>
                    <Badge variant={stats.totalErrors === 0 ? "default" : "destructive"}>{stats.totalErrors}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Validation Time:</span>
                    <span className="text-sm font-medium">{stats.validationTime.toFixed(2)}ms</span>
                  </div>

                  {Object.keys(stats.errorsBySeverity).length > 0 && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium mb-2">By Severity:</h4>
                      <div className="space-y-1">
                        {Object.entries(stats.errorsBySeverity).map(([severity, count]) => (
                          <div key={severity} className="flex justify-between text-xs">
                            <span className="capitalize text-muted-foreground">{severity}:</span>
                            <Badge variant={severity === "error" ? "destructive" : "secondary"} className="h-5 text-xs">
                              {count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Validation Results
              </CardTitle>
              <CardDescription>
                {errors.length === 0
                  ? "No errors found in your code!"
                  : `Found ${errors.length} issue${errors.length !== 1 ? "s" : ""} in your code`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Your code looks great! No validation errors found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(getErrorsByCategory()).map(([category, categoryErrors]) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <h4 className="text-sm font-medium capitalize flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                        <span className="text-muted-foreground">({categoryErrors.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {categoryErrors.map((error, index) => (
                          <motion.div
                            key={`${error.line}-${error.column}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 rounded-lg border bg-muted/50"
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle
                                className={`w-4 h-4 mt-0.5 ${
                                  error.severity === "error"
                                    ? "text-destructive"
                                    : error.severity === "warning"
                                      ? "text-yellow-500"
                                      : "text-blue-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant={error.severity === "error" ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {error.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Line {error.line}, Column {error.column}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-foreground mb-1">{error.message}</p>
                                {error.suggestion && (
                                  <p className="text-xs text-muted-foreground">💡 {error.suggestion}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setCode("")
                    setErrors([])
                    setStats(null)
                  }}
                >
                  Clear Code
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setCode(SAMPLE_CODE[activeTab])
                    handleCodeChange(SAMPLE_CODE[activeTab])
                  }}
                >
                  Load Sample
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    navigator.clipboard.writeText(code)
                    toast({
                      title: "Copied!",
                      description: "Code copied to clipboard",
                    })
                  }}
                >
                  Copy Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
