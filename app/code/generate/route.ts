import { type NextRequest, NextResponse } from "next/server"
import { enhancedCodeGenerationEngine } from "@/services/enhanced-code-generation-engine"

export async function POST(request: NextRequest) {
  try {
    const { figmaData, config, svgContent } = await request.json()

    if (!figmaData && !svgContent) {
      return NextResponse.json({ error: "Either Figma data or SVG content is required" }, { status: 400 })
    }

    const defaultConfig = {
      framework: "react" as const,
      typescript: true,
      styling: "css" as const,
      componentLibrary: "custom" as const,
      optimization: {
        treeshaking: true,
        bundleAnalysis: true,
        codesplitting: true,
        lazyLoading: true,
      },
      accessibility: {
        wcagLevel: "AA" as const,
        screenReader: true,
        keyboardNavigation: true,
        colorContrast: true,
      },
      testing: {
        unitTests: false,
        integrationTests: false,
        e2eTests: false,
        visualRegression: false,
      },
      ...config,
    }

    // Generate code using the enhanced engine
    const generatedCode = await enhancedCodeGenerationEngine.generateCode(
      figmaData,
      defaultConfig,
      (progress, status) => {
        // Progress callback - could be used for WebSocket updates
        console.log(`Progress: ${progress}% - ${status}`)
      },
    )

    return NextResponse.json({
      success: true,
      data: generatedCode,
      message: "Code generated successfully",
    })
  } catch (error) {
    console.error("Code generation error:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Code generation failed" },
      { status: 500 },
    )
  }
}
