import { type NextRequest, NextResponse } from "next/server"

interface ValidationResult {
  isValid: boolean
  errors: Array<{
    type: "error" | "warning" | "info"
    message: string
    line?: number
    column?: number
    file?: string
  }>
  suggestions: string[]
  metrics: {
    linesOfCode: number
    complexity: number
    maintainabilityIndex: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, language = "typescript" } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Code is required for validation" }, { status: 400 })
    }

    const validation = validateCode(code, language)

    return NextResponse.json({
      success: true,
      data: validation,
      message: "Code validation completed",
    })
  } catch (error) {
    console.error("Code validation error:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Code validation failed" },
      { status: 500 },
    )
  }
}

function validateCode(code: string, language: string): ValidationResult {
  const errors: ValidationResult["errors"] = []
  const suggestions: string[] = []

  // Basic syntax validation
  if (language === "typescript" || language === "javascript") {
    // Check for common issues
    if (!code.includes("export")) {
      errors.push({
        type: "warning",
        message: "No exports found - component may not be reusable",
        line: 1,
      })
    }

    if (code.includes("any") && language === "typescript") {
      errors.push({
        type: "warning",
        message: 'Usage of "any" type reduces type safety',
        line: findLineNumber(code, "any"),
      })
      suggestions.push('Consider using specific types instead of "any"')
    }

    if (!code.includes("React") && code.includes("jsx")) {
      errors.push({
        type: "error",
        message: "React import missing for JSX usage",
        line: 1,
      })
    }

    // Accessibility checks
    if (code.includes("<img") && !code.includes("alt=")) {
      errors.push({
        type: "warning",
        message: "Images should have alt attributes for accessibility",
        line: findLineNumber(code, "<img"),
      })
      suggestions.push("Add alt attributes to all images")
    }

    if (code.includes("<button") && !code.includes("aria-")) {
      suggestions.push("Consider adding ARIA labels to buttons for better accessibility")
    }
  }

  // CSS validation
  if (language === "css" || language === "scss") {
    if (!code.includes("@media")) {
      suggestions.push("Consider adding responsive design with media queries")
    }

    if (code.includes("!important")) {
      errors.push({
        type: "warning",
        message: "Avoid using !important - consider refactoring CSS specificity",
        line: findLineNumber(code, "!important"),
      })
    }
  }

  // Calculate metrics
  const linesOfCode = code.split("\n").length
  const complexity = calculateComplexity(code)
  const maintainabilityIndex = calculateMaintainabilityIndex(code, complexity)

  return {
    isValid: errors.filter((e) => e.type === "error").length === 0,
    errors,
    suggestions,
    metrics: {
      linesOfCode,
      complexity,
      maintainabilityIndex,
    },
  }
}

function findLineNumber(code: string, searchTerm: string): number {
  const lines = code.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchTerm)) {
      return i + 1
    }
  }
  return 1
}

function calculateComplexity(code: string): number {
  const complexityIndicators = [
    /if\s*\(/g,
    /else\s*{/g,
    /for\s*\(/g,
    /while\s*\(/g,
    /switch\s*\(/g,
    /case\s+/g,
    /catch\s*\(/g,
    /&&/g,
    /\|\|/g,
  ]

  let complexity = 1
  complexityIndicators.forEach((regex) => {
    const matches = code.match(regex)
    if (matches) {
      complexity += matches.length
    }
  })

  return complexity
}

function calculateMaintainabilityIndex(code: string, complexity: number): number {
  const linesOfCode = code.split("\n").length
  return Math.max(0, Math.min(100, 100 - complexity * 2 - linesOfCode / 10))
}
