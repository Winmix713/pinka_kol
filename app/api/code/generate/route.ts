import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { svgCode, componentName, framework = 'react', typescript = true } = await request.json()
    
    if (!svgCode || !componentName) {
      return NextResponse.json(
        { error: 'SVG code and component name are required' },
        { status: 400 }
      )
    }
    
    // Generate React component code from SVG
    const generatedCode = generateReactComponent(svgCode, componentName, typescript)
    
    // Calculate basic metrics
    const metrics = {
      lines: generatedCode.split('\n').length,
      characters: generatedCode.length,
      complexity: calculateComplexity(generatedCode),
    }
    
    return NextResponse.json({
      success: true,
      data: {
        code: generatedCode,
        framework,
        typescript,
        metrics,
      },
    })
  } catch (error) {
    console.error('Error generating code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateReactComponent(svgCode: string, componentName: string, typescript: boolean): string {
  const fileExtension = typescript ? 'tsx' : 'jsx'
  const propsType = typescript ? ': React.SVGProps<SVGSVGElement>' : ''
  
  // Clean up SVG code
  const cleanedSvg = svgCode
    .replace(/class="/g, 'className="')
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
  
  return `import React from 'react'

interface ${componentName}Props${typescript ? ' extends React.SVGProps<SVGSVGElement>' : ''} {
  size?: number
  className?: string
}

export const ${componentName}${typescript ? ': React.FC<' + componentName + 'Props>' : ''} = ({ 
  size = 24, 
  className = '', 
  ...props 
}${propsType}) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      {...props}
    >
      ${cleanedSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}
    </svg>
  )
}

export default ${componentName}`
}

function calculateComplexity(code: string): number {
  const complexityIndicators = [
    /if\s*\(/g,
    /for\s*\(/g,
    /while\s*\(/g,
    /switch\s*\(/g,
    /case\s*.*:/g,
    /&&/g,
    /\|\|/g,
    /\?/g,
  ]
  
  let complexity = 1
  complexityIndicators.forEach(regex => {
    const matches = code.match(regex)
    if (matches) {
      complexity += matches.length
    }
  })
  
  return complexity
}