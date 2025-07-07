import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, language = 'typescript' } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }
    
    // Basic validation
    const validationResult = validateCode(code, language)
    
    return NextResponse.json({
      success: true,
      data: validationResult,
    })
  } catch (error) {
    console.error('Error validating code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function validateCode(code: string, language: string) {
  const errors: Array<{ line: number; column: number; message: string; severity: string }> = []
  const warnings: Array<{ line: number; column: number; message: string; severity: string }> = []
  
  const lines = code.split('\n')
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    
    // Check for common TypeScript/JavaScript issues
    if (language === 'typescript' || language === 'javascript') {
      // Missing semicolons
      if (line.trim().match(/^(const|let|var|function|return|throw|break|continue)\s+.*[^;{}]$/)) {
        warnings.push({
          line: lineNumber,
          column: line.length,
          message: 'Missing semicolon',
          severity: 'warning'
        })
      }
      
      // Unused variables
      if (line.match(/^(const|let|var)\s+(\w+)\s*=/) && !code.includes(line.match(/^(const|let|var)\s+(\w+)\s*=/)?.[2] || '')) {
        warnings.push({
          line: lineNumber,
          column: 1,
          message: 'Unused variable',
          severity: 'warning'
        })
      }
      
      // Basic syntax errors
      if (line.includes('(') && !line.includes(')')) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('('),
          message: 'Unclosed parenthesis',
          severity: 'error'
        })
      }
      
      if (line.includes('{') && !line.includes('}') && !lines[index + 1]?.trim().startsWith('}')) {
        // This is a simplistic check - in real validation this would be more sophisticated
        warnings.push({
          line: lineNumber,
          column: line.indexOf('{'),
          message: 'Potentially unclosed brace',
          severity: 'warning'
        })
      }
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      errorCount: errors.length,
      warningCount: warnings.length,
      lines: lines.length,
    }
  }
}