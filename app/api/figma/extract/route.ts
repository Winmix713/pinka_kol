import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { figmaUrl, accessToken } = await request.json()
    
    if (!figmaUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Figma URL and access token are required' },
        { status: 400 }
      )
    }
    
    // Extract file key from Figma URL
    const fileKeyMatch = figmaUrl.match(/file\/([a-zA-Z0-9]+)/)
    if (!fileKeyMatch) {
      return NextResponse.json(
        { error: 'Invalid Figma URL format' },
        { status: 400 }
      )
    }
    
    const fileKey = fileKeyMatch[1]
    
    // Fetch file data from Figma API
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': accessToken,
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Figma file' },
        { status: response.status }
      )
    }
    
    const figmaData = await response.json()
    
    // Extract SVG exports
    const nodeIds = extractNodeIds(figmaData.document)
    const svgExports = await Promise.all(
      nodeIds.map(async (nodeId) => {
        const svgResponse = await fetch(
          `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=svg`,
          {
            headers: {
              'X-Figma-Token': accessToken,
            },
          }
        )
        
        if (svgResponse.ok) {
          const svgData = await svgResponse.json()
          return {
            nodeId,
            svgUrl: svgData.images[nodeId],
          }
        }
        return null
      })
    )
    
    return NextResponse.json({
      success: true,
      data: {
        fileKey,
        figmaData,
        svgExports: svgExports.filter(Boolean),
      },
    })
  } catch (error) {
    console.error('Error extracting Figma data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractNodeIds(node: any, ids: string[] = []): string[] {
  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    ids.push(node.id)
  }
  
  if (node.children) {
    node.children.forEach((child: any) => {
      extractNodeIds(child, ids)
    })
  }
  
  return ids
}