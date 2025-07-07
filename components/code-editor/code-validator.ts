import * as ts from "typescript"

/**
 * Validation error interface
 */
export interface ValidationError {
  line: number
  column: number
  message: string
  severity: "error" | "warning" | "info"
  source: string
  code?: string | number
  category?: string
  suggestion?: string
}

/**
 * Validation statistics
 */
export interface ValidationStats {
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsBySeverity: Record<string, number>
  validationTime: number
}

/**
 * CSS property database for validation
 */
const CSS_PROPERTIES = new Set([
  // Layout
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "float",
  "clear",
  "overflow",
  "overflow-x",
  "overflow-y",
  "clip",
  "visibility",
  "opacity",
  "filter",

  // Box Model
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-radius",
  "box-sizing",
  "box-shadow",

  // Typography
  "font",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-align",
  "text-decoration",
  "text-transform",
  "text-indent",
  "text-shadow",
  "white-space",
  "word-wrap",
  "word-break",

  // Colors & Backgrounds
  "color",
  "background",
  "background-color",
  "background-image",
  "background-repeat",
  "background-position",
  "background-size",
  "background-attachment",
  "background-clip",
  "background-origin",

  // Flexbox
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-flow",
  "justify-content",
  "align-items",
  "align-content",
  "align-self",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "order",

  // Grid
  "grid",
  "grid-template",
  "grid-template-columns",
  "grid-template-rows",
  "grid-template-areas",
  "grid-gap",
  "grid-column-gap",
  "grid-row-gap",
  "grid-column",
  "grid-row",
  "grid-area",
  "justify-items",

  // Animation & Transitions
  "transition",
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  "animation-iteration-count",
  "animation-direction",
  "animation-fill-mode",
  "animation-play-state",

  // Transform
  "transform",
  "transform-origin",
  "transform-style",
  "perspective",
  "perspective-origin",
  "backface-visibility",

  // Modern CSS
  "gap",
  "row-gap",
  "column-gap",
  "place-items",
  "place-content",
  "place-self",
  "aspect-ratio",
  "object-fit",
  "object-position",
  "scroll-behavior",
  "scroll-snap-type",
  "scroll-snap-align",
])

/**
 * Enhanced CSS validator with comprehensive property checking
 */
class CSSValidator {
  /**
   * Validate CSS code
   */
  validate(css: string): ValidationError[] {
    const errors: ValidationError[] = []
    const lines = css.split("\n")

    let inRule = false
    let braceCount = 0
    let currentSelector = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineNumber = i + 1

      if (!line || line.startsWith("/*")) continue

      // Check for selector
      if (line.includes("{")) {
        inRule = true
        braceCount++
        currentSelector = line.substring(0, line.indexOf("{")).trim()

        // Validate selector syntax
        if (!this.isValidSelector(currentSelector)) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: `Invalid CSS selector: ${currentSelector}`,
            severity: "error",
            source: "css",
            category: "selector",
            suggestion: "Check selector syntax and ensure proper nesting",
          })
        }
      }

      // Check for closing brace
      if (line.includes("}")) {
        braceCount--
        if (braceCount === 0) {
          inRule = false
          currentSelector = ""
        }
      }

      // Validate properties within rules
      if (inRule && line.includes(":") && !line.includes("{")) {
        const colonIndex = line.indexOf(":")
        const property = line.substring(0, colonIndex).trim()
        const value = line
          .substring(colonIndex + 1)
          .replace(";", "")
          .trim()

        // Check if property exists
        if (!this.isValidCSSProperty(property)) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: `Unknown CSS property: ${property}`,
            severity: "warning",
            source: "css",
            category: "property",
            suggestion: `Did you mean one of: ${this.getSimilarProperties(property).join(", ")}?`,
          })
        }

        // Validate property value
        const valueError = this.validatePropertyValue(property, value)
        if (valueError) {
          errors.push({
            line: lineNumber,
            column: colonIndex + 2,
            message: valueError,
            severity: "error",
            source: "css",
            category: "value",
            suggestion: this.getValueSuggestion(property),
          })
        }

        // Check for missing semicolon
        if (!line.endsWith(";") && !line.endsWith("}")) {
          errors.push({
            line: lineNumber,
            column: line.length,
            message: "Missing semicolon",
            severity: "warning",
            source: "css",
            category: "syntax",
            suggestion: "Add semicolon at the end of the declaration",
          })
        }
      }
    }

    // Check for unmatched braces
    if (braceCount !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: "Unmatched braces in CSS",
        severity: "error",
        source: "css",
        category: "syntax",
        suggestion: "Ensure all opening braces have corresponding closing braces",
      })
    }

    return errors
  }

  private isValidSelector(selector: string): boolean {
    if (!selector) return false

    // Basic selector validation
    const selectorRegex = /^[a-zA-Z0-9\-_#.[\]:(),\s>+~*]+$/
    return selectorRegex.test(selector)
  }

  private isValidCSSProperty(property: string): boolean {
    // Check standard properties
    if (CSS_PROPERTIES.has(property)) return true

    // Check vendor prefixes
    if (
      property.startsWith("-webkit-") ||
      property.startsWith("-moz-") ||
      property.startsWith("-ms-") ||
      property.startsWith("-o-")
    ) {
      const unprefixed = property.substring(property.indexOf("-", 1) + 1)
      return CSS_PROPERTIES.has(unprefixed)
    }

    // Check CSS custom properties (variables)
    if (property.startsWith("--")) return true

    return false
  }

  private validatePropertyValue(property: string, value: string): string | null {
    if (!value) return "Empty value"

    // Color validation
    if (property.includes("color") || property === "background") {
      if (!this.isValidColor(value)) {
        return "Invalid color value"
      }
    }

    // Length validation
    if (
      property.includes("width") ||
      property.includes("height") ||
      property.includes("margin") ||
      property.includes("padding")
    ) {
      if (!this.isValidLength(value)) {
        return "Invalid length value"
      }
    }

    return null
  }

  private isValidColor(value: string): boolean {
    // Hex colors
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)) return true

    // RGB/RGBA
    if (/^rgba?$$\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*$$$/.test(value)) return true

    // HSL/HSLA
    if (/^hsla?$$\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*$$$/.test(value)) return true

    // Named colors (basic check)
    const namedColors = ["red", "blue", "green", "black", "white", "transparent", "inherit", "initial", "unset"]
    if (namedColors.includes(value.toLowerCase())) return true

    return false
  }

  private isValidLength(value: string): boolean {
    // Auto, inherit, initial, unset
    if (["auto", "inherit", "initial", "unset"].includes(value)) return true

    // Length units
    if (/^\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(value)) return true

    // Zero without unit
    if (value === "0") return true

    return false
  }

  private getSimilarProperties(property: string): string[] {
    const similar: string[] = []
    const propertyArray = Array.from(CSS_PROPERTIES)

    for (const prop of propertyArray) {
      if (this.levenshteinDistance(property, prop) <= 2) {
        similar.push(prop)
      }
    }

    return similar.slice(0, 3) // Return top 3 suggestions
  }

  private getValueSuggestion(property: string): string {
    const suggestions: Record<string, string> = {
      color: "Use hex (#000000), rgb(0,0,0), or named colors",
      "background-color": "Use hex (#000000), rgb(0,0,0), or named colors",
      width: "Use length units like px, em, rem, % or auto",
      height: "Use length units like px, em, rem, % or auto",
      margin: "Use length units like px, em, rem, % or auto",
      padding: "Use length units like px, em, rem, % or auto",
      "font-size": "Use length units like px, em, rem or keywords like small, medium, large",
      display: "Use values like block, inline, flex, grid, none",
    }

    return suggestions[property] || "Check CSS specification for valid values"
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }
}

/**
 * Browser-compatible TypeScript validator
 */
class TypeScriptValidator {
  private compilerHost: ts.CompilerHost

  constructor() {
    // Ensure ts.sys exists for browser compatibility
    this.ensureTypeScriptSys()
    this.compilerHost = this.createCompilerHost()
  }

  private ensureTypeScriptSys() {
    if (!(ts as any).sys) {
      ;(ts as any).sys = {
        args: [],
        newLine: "\n",
        useCaseSensitiveFileNames: true,
        write: () => {},
        writeFile: () => {},
        readFile: () => undefined,
        fileExists: () => false,
        directoryExists: () => false,
        getCurrentDirectory: () => "/",
        getDirectories: () => [],
        readDirectory: () => [],
        resolvePath: (p: string) => p,
        getExecutingFilePath: () => "",
        exit: () => {},
      }
    }
  }

  private createCompilerHost(): ts.CompilerHost {
    const host = ts.createCompilerHost({
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      strict: false,
      skipLibCheck: true,
      allowJs: true,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noEmit: true,
    })

    // Override file reading to handle virtual files
    const originalReadFile = host.readFile
    host.readFile = (fileName: string) => {
      if (fileName.includes("node_modules") || fileName.includes("lib.")) {
        return undefined // Skip external dependencies
      }
      return originalReadFile(fileName)
    }

    return host
  }

  validate(code: string, fileName = "temp.tsx"): ValidationError[] {
    try {
      const sourceFile = ts.createSourceFile(
        fileName,
        code,
        ts.ScriptTarget.ES2020,
        true,
        fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      )

      const program = ts.createProgram(
        [fileName],
        {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
          strict: false,
          skipLibCheck: true,
          allowJs: true,
          esModuleInterop: true,
          noEmit: true,
          moduleResolution: ts.ModuleResolutionKind.NodeJs,
        },
        {
          ...this.compilerHost,
          getSourceFile: (name: string) => {
            if (name === fileName) return sourceFile
            return undefined
          },
          fileExists: (name: string) => name === fileName,
          getCurrentDirectory: () => "/",
          getDirectories: () => [],
          getCanonicalFileName: (name: string) => name,
          useCaseSensitiveFileNames: () => true,
          getNewLine: () => "\n",
        },
      )

      const diagnostics = ts.getPreEmitDiagnostics(program)

      return diagnostics
        .filter((diagnostic) => {
          // Filter out irrelevant diagnostics
          if (!diagnostic.file || diagnostic.file.fileName !== fileName) return false

          const code = diagnostic.code
          // Skip module resolution errors and library errors
          if (code === 2307 || code === 2304 || code === 2339 || code === 2322) {
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
            if (
              message.includes("Cannot find module") ||
              message.includes("Cannot find name") ||
              message.includes("does not exist on type")
            ) {
              return false
            }
          }

          return true
        })
        .map((diagnostic) => {
          const file = diagnostic.file!
          const { line, character } = file.getLineAndCharacterOfPosition(diagnostic.start!)
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")

          return {
            line: line + 1,
            column: character + 1,
            message,
            severity: diagnostic.category === ts.DiagnosticCategory.Error ? ("error" as const) : ("warning" as const),
            source: "typescript",
            code: diagnostic.code,
            category: this.categorizeError(diagnostic.code),
            suggestion: this.getSuggestionForError(diagnostic.code, message),
          }
        })
    } catch (error) {
      console.warn("TypeScript validation error:", error)
      return [
        {
          line: 1,
          column: 1,
          message: "TypeScript validation failed",
          severity: "warning",
          source: "typescript",
          category: "system",
        },
      ]
    }
  }

  private categorizeError(code: number): string {
    const categories: Record<number, string> = {
      1005: "syntax",
      1009: "syntax",
      1128: "syntax",
      1161: "syntax",
      2304: "reference",
      2307: "module",
      2322: "type",
      2339: "property",
      2345: "argument",
      2554: "parameter",
      2741: "type",
      7006: "type",
      7031: "type",
    }

    return categories[code] || "general"
  }

  private getSuggestionForError(code: number, message: string): string {
    const suggestions: Record<number, string> = {
      1005: "Check for missing brackets, parentheses, or semicolons",
      2304: "Import the missing identifier or check spelling",
      2307: "Install the missing package or check the import path",
      2322: "Check the type compatibility between assigned values",
      2339: "Verify the property exists on the object type",
      2345: "Check the number and types of function arguments",
      7006: "Add explicit type annotations",
      7031: "Add explicit return type annotation",
    }

    return suggestions[code] || "Check TypeScript documentation for this error"
  }
}

/**
 * JSX validator for React components
 */
class JSXValidator {
  validate(code: string): ValidationError[] {
    const errors: ValidationError[] = []
    const lines = code.split("\n")

    const tagStack: Array<{ tag: string; line: number }> = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Find JSX tags
      const tagMatches = line.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)/g)

      for (const match of tagMatches) {
        const isClosing = match[0].startsWith("</")
        const tagName = match[1]

        if (isClosing) {
          const lastTag = tagStack.pop()
          if (!lastTag) {
            errors.push({
              line: lineNumber,
              column: match.index! + 1,
              message: `Unexpected closing tag: ${tagName}`,
              severity: "error",
              source: "jsx",
              category: "syntax",
              suggestion: "Remove the extra closing tag or add a matching opening tag",
            })
          } else if (lastTag.tag !== tagName) {
            errors.push({
              line: lineNumber,
              column: match.index! + 1,
              message: `Mismatched tags: expected ${lastTag.tag}, found ${tagName}`,
              severity: "error",
              source: "jsx",
              category: "syntax",
              suggestion: `Change to </${lastTag.tag}> or fix the opening tag`,
            })
          }
        } else {
          // Check for self-closing tags
          if (!line.includes("/>") || line.indexOf("/>") > match.index! + match[0].length) {
            tagStack.push({ tag: tagName, line: lineNumber })
          }
        }
      }

      // Check for common JSX mistakes
      if (line.includes("class=")) {
        const classIndex = line.indexOf("class=")
        errors.push({
          line: lineNumber,
          column: classIndex + 1,
          message: "Use 'className' instead of 'class' in JSX",
          severity: "error",
          source: "jsx",
          category: "attribute",
          suggestion: "Replace 'class' with 'className'",
        })
      }

      if (line.includes("for=")) {
        const forIndex = line.indexOf("for=")
        errors.push({
          line: lineNumber,
          column: forIndex + 1,
          message: "Use 'htmlFor' instead of 'for' in JSX",
          severity: "error",
          source: "jsx",
          category: "attribute",
          suggestion: "Replace 'for' with 'htmlFor'",
        })
      }
    }

    // Check for unclosed tags
    for (const unclosedTag of tagStack) {
      errors.push({
        line: unclosedTag.line,
        column: 1,
        message: `Unclosed tag: ${unclosedTag.tag}`,
        severity: "error",
        source: "jsx",
        category: "syntax",
        suggestion: `Add closing tag </${unclosedTag.tag}>`,
      })
    }

    return errors
  }
}

/**
 * Main code validator class
 */
export class CodeValidator {
  private cssValidator = new CSSValidator()
  private tsValidator = new TypeScriptValidator()
  private jsxValidator = new JSXValidator()

  /**
   * Validate code based on language type
   */
  async validate(
    code: string,
    language: "typescript" | "css" | "javascript",
  ): Promise<{
    errors: ValidationError[]
    stats: ValidationStats
  }> {
    const startTime = performance.now()
    let errors: ValidationError[] = []

    try {
      switch (language) {
        case "css":
          errors = this.cssValidator.validate(code)
          break
        case "typescript":
          // Validate both TypeScript and JSX
          const tsErrors = this.tsValidator.validate(code)
          const jsxErrors = this.jsxValidator.validate(code)
          errors = [...tsErrors, ...jsxErrors]
          break
        case "javascript":
          errors = this.jsxValidator.validate(code)
          break
      }
    } catch (error) {
      console.error("Validation error:", error)
      errors = [
        {
          line: 1,
          column: 1,
          message: "Validation failed due to internal error",
          severity: "error",
          source: language,
          category: "system",
        },
      ]
    }

    const endTime = performance.now()

    // Generate statistics
    const stats: ValidationStats = {
      totalErrors: errors.length,
      errorsByCategory: this.groupBy(errors, "category"),
      errorsBySeverity: this.groupBy(errors, "severity"),
      validationTime: endTime - startTime,
    }

    return { errors, stats }
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce(
      (acc, item) => {
        const value = String(item[key] || "unknown")
        acc[value] = (acc[value] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }
}

// Export singleton instance
export const codeValidator = new CodeValidator()
