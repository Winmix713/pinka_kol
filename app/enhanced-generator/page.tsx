"use client"
import { FigmaStepsProvider } from "@/contexts/FigmaStepsContext"
import { EnhancedFigmaGenerator } from "@/components/enhanced-figma-generator"

/**
 * Enhanced Figma Steps Generator Page
 * Main export with context provider
 */
export default function EnhancedGeneratorPage() {
  return (
    <FigmaStepsProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">🚀 Enhanced Figma to Code Generator</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional-grade tool for converting Figma designs to production-ready code with AI assistance, advanced
              validation, and multi-framework support.
            </p>
          </div>

          <EnhancedFigmaGenerator />
        </div>
      </div>
    </FigmaStepsProvider>
  )
}
