"use client"

import React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export interface ErrorInfo {
  message: string
  code?: string
  details?: string
  stack?: string
}

interface ErrorHandlerProps {
  error: ErrorInfo
  onRetry?: () => void
  onReset?: () => void
  showDetails?: boolean
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, onRetry, onReset, showDetails = false }) => {
  const [showFullDetails, setShowFullDetails] = React.useState(false)

  const getErrorType = (message: string) => {
    if (message.includes("Figma")) return "figma"
    if (message.includes("network") || message.includes("fetch")) return "network"
    if (message.includes("validation")) return "validation"
    if (message.includes("generation")) return "generation"
    return "general"
  }

  const getErrorSuggestion = (type: string) => {
    switch (type) {
      case "figma":
        return "Check your Figma URL and ensure the file is publicly accessible or you have the right permissions."
      case "network":
        return "Check your internet connection and try again."
      case "validation":
        return "Please check your code for syntax errors and try again."
      case "generation":
        return "There was an issue generating the code. Please try with a different design or contact support."
      default:
        return "An unexpected error occurred. Please try again or contact support if the problem persists."
    }
  }

  const errorType = getErrorType(error.message)
  const suggestion = getErrorSuggestion(errorType)

  return (
    <div className="space-y-4">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-red-800 mb-1">Error Details</h4>
              <p className="text-red-700">{error.message}</p>
              {error.code && <p className="text-sm text-red-600 mt-1">Error Code: {error.code}</p>}
            </div>

            <div className="text-sm text-red-600">
              <strong>Suggestion:</strong> {suggestion}
            </div>

            {showDetails && error.details && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="text-red-600 hover:text-red-700 p-0 h-auto"
                >
                  {showFullDetails ? "Hide" : "Show"} Technical Details
                </Button>
                {showFullDetails && (
                  <div className="mt-2 p-3 bg-red-100 rounded border text-xs font-mono text-red-800 overflow-auto max-h-32">
                    {error.details}
                    {error.stack && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="flex-1 bg-transparent">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onReset && (
          <Button onClick={onReset} variant="outline" className="flex-1 bg-transparent">
            <Home className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>
    </div>
  )
}

// Global error boundary component
export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global error caught:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <ErrorHandler
          error={{
            message: this.state.error.message,
            details: this.state.error.stack,
          }}
          onRetry={this.resetError}
          showDetails={true}
        />
      )
    }

    return this.props.children
  }
}

// Hook for handling async errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<ErrorInfo | null>(null)

  const handleError = React.useCallback((error: Error | ErrorInfo) => {
    if (error instanceof Error) {
      setError({
        message: error.message,
        stack: error.stack,
      })
    } else {
      setError(error)
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
