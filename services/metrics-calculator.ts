// Code quality metrics calculator
export interface CodeMetrics {
  complexity: number
  maintainability: number
  testability: number
  performance: number
  accessibility: number
  bundle: {
    size: number
    gzipSize: number
    modules: number
  }
  dependencies: {
    count: number
    outdated: number
    vulnerabilities: number
  }
}

export interface ComponentMetrics {
  name: string
  type: string
  lines: number
  complexity: number
  dependencies: string[]
  props: number
  hooks: number
  testCoverage: number
}

export class MetricsCalculator {
  static calculateCodeComplexity(code: string): number {
    // Basic cyclomatic complexity calculation
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s*.*:/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
    ]
    
    let complexity = 1 // Base complexity
    
    for (const pattern of complexityPatterns) {
      const matches = code.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    }
    
    return Math.min(complexity, 100)
  }

  static calculateMaintainability(code: string): number {
    const lines = code.split('\n').length
    const complexity = this.calculateCodeComplexity(code)
    const comments = (code.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || []).length
    
    // Maintainability Index formula (simplified)
    const maintainability = Math.max(
      0,
      171 - 5.2 * Math.log(lines) - 0.23 * complexity - 16.2 * Math.log(lines + 1) + 50 * Math.sin(Math.sqrt(2.4 * comments))
    )
    
    return Math.round(maintainability)
  }

  static calculateTestability(code: string): number {
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length
    const classes = (code.match(/class\s+\w+/g) || []).length
    const pureComponents = (code.match(/React\.memo|useMemo|useCallback/g) || []).length
    const sideEffects = (code.match(/useEffect|fetch|axios|localStorage|sessionStorage/g) || []).length
    
    // Higher testability score for more pure functions and fewer side effects
    const testability = Math.max(0, 100 - sideEffects * 5 + pureComponents * 10)
    
    return Math.min(testability, 100)
  }

  static calculatePerformance(code: string): number {
    const inefficientPatterns = [
      /document\.querySelector/g,
      /getElementById/g,
      /innerHTML/g,
      /for\s*\(.*in.*\)/g,
      /while\s*\(.*true.*\)/g,
    ]
    
    const optimizedPatterns = [
      /React\.memo/g,
      /useMemo/g,
      /useCallback/g,
      /lazy\s*\(/g,
      /Suspense/g,
    ]
    
    let performance = 100
    
    for (const pattern of inefficientPatterns) {
      const matches = code.match(pattern)
      if (matches) {
        performance -= matches.length * 5
      }
    }
    
    for (const pattern of optimizedPatterns) {
      const matches = code.match(pattern)
      if (matches) {
        performance += matches.length * 3
      }
    }
    
    return Math.max(0, Math.min(performance, 100))
  }

  static calculateAccessibility(code: string): number {
    const accessibilityPatterns = [
      /aria-label/g,
      /aria-describedby/g,
      /role=/g,
      /alt=/g,
      /tabIndex/g,
      /onKeyDown/g,
      /onKeyPress/g,
    ]
    
    const accessibilityIssues = [
      /onClick(?!.*onKeyDown)/g,
      /<img(?!.*alt)/g,
      /<input(?!.*aria-label)(?!.*id)/g,
    ]
    
    let accessibility = 50 // Base score
    
    for (const pattern of accessibilityPatterns) {
      const matches = code.match(pattern)
      if (matches) {
        accessibility += matches.length * 5
      }
    }
    
    for (const pattern of accessibilityIssues) {
      const matches = code.match(pattern)
      if (matches) {
        accessibility -= matches.length * 10
      }
    }
    
    return Math.max(0, Math.min(accessibility, 100))
  }

  static calculateBundleSize(code: string): { size: number; gzipSize: number; modules: number } {
    // Rough estimation based on code length and imports
    const imports = (code.match(/import\s+.*from/g) || []).length
    const size = code.length
    const gzipSize = Math.round(size * 0.3) // Rough gzip compression estimate
    
    return {
      size,
      gzipSize,
      modules: imports
    }
  }

  static analyzeComponent(code: string, name: string): ComponentMetrics {
    const lines = code.split('\n').length
    const complexity = this.calculateCodeComplexity(code)
    const dependencies = (code.match(/import\s+.*from\s+['"]([^'"]+)['"]/g) || [])
      .map(imp => imp.match(/from\s+['"]([^'"]+)['"]/)?.[1])
      .filter(Boolean) as string[]
    
    const props = (code.match(/interface\s+\w+Props|type\s+\w+Props/g) || []).length
    const hooks = (code.match(/use[A-Z]\w*/g) || []).length
    
    return {
      name,
      type: code.includes('class ') ? 'class' : 'function',
      lines,
      complexity,
      dependencies,
      props,
      hooks,
      testCoverage: 0 // Would need actual test data
    }
  }

  static generateReport(code: string): CodeMetrics {
    const complexity = this.calculateCodeComplexity(code)
    const maintainability = this.calculateMaintainability(code)
    const testability = this.calculateTestability(code)
    const performance = this.calculatePerformance(code)
    const accessibility = this.calculateAccessibility(code)
    const bundle = this.calculateBundleSize(code)
    
    return {
      complexity,
      maintainability,
      testability,
      performance,
      accessibility,
      bundle,
      dependencies: {
        count: bundle.modules,
        outdated: 0, // Would need package.json analysis
        vulnerabilities: 0 // Would need security audit
      }
    }
  }
}

// Export singleton instance
export const metricsCalculator = new MetricsCalculator()