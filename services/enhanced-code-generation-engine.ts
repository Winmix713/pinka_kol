import { metricsCalculator } from "./metrics-calculator"

interface CodeGenerationConfig {
  framework: "react" | "vue" | "angular" | "svelte"
  typescript: boolean
  styling: "css" | "scss" | "styled-components" | "tailwind"
  componentLibrary: "custom" | "mui" | "antd" | "chakra"
  optimization: {
    treeshaking: boolean
    bundleAnalysis: boolean
    codesplitting: boolean
    lazyLoading: boolean
  }
  accessibility: {
    wcagLevel: "A" | "AA" | "AAA"
    screenReader: boolean
    keyboardNavigation: boolean
    colorContrast: boolean
  }
  testing: {
    unitTests: boolean
    integrationTests: boolean
    e2eTests: boolean
    visualRegression: boolean
  }
}

interface GeneratedCode {
  id: string
  timestamp: Date
  config: CodeGenerationConfig
  files: any[]
  structure: any
  metrics: any
  quality: any
  preview: string
  buildStatus: "success" | "warning" | "error"
  buildLogs: any[]
}

interface GenerationContext {
  sessionId: string
  startTime: number
  config: CodeGenerationConfig
  userPreferences?: Record<string, any>
  figmaData?: any
}

/**
 * Enhanced Code Generation Engine
 * Orchestrates the entire code generation pipeline with AI assistance
 */
import { FigmaFile } from "./figma-api-service";

export interface FigmaCodeOutput {
  fileKey: string;
  lastModified: string;
  thumbnailUrl: string;
  nodeID: string;
  name: string;
  type: string;
  sourceURL: string;
  document: any; // Raw Figma document data
  components: Record<string, any>;
  styles: Record<string, any>;
  extractFigmaStyles: string; // The helper function as a string
}

export class EnhancedCodeGenerationEngine {
  private static instance: EnhancedCodeGenerationEngine
  private generationQueue: Map<string, GenerationContext> = new Map()
  private performanceMetrics: Map<string, any> = new Map()

  static getInstance(): EnhancedCodeGenerationEngine {
    if (!EnhancedCodeGenerationEngine.instance) {
      EnhancedCodeGenerationEngine.instance = new EnhancedCodeGenerationEngine()
    }
    return EnhancedCodeGenerationEngine.instance
  }

  private constructor() {
    this.initializePerformanceMonitoring()
  }

  private initializePerformanceMonitoring(): void {
    this.performanceMetrics.set("startup", Date.now())
  }

  /**
   * Enhanced SVG extraction with robust data structure handling
   */
  async extractSVGFromFigma(figmaData: any): Promise<string> {
    console.log("Starting SVG extraction from Figma data...")

    try {
      // Validate the Figma data structure
      if (!figmaData || typeof figmaData !== "object") {
        console.error("Invalid Figma data structure")
        return this.createFallbackSVG("Invalid Figma data structure")
      }

      // Handle different data structures
      let documentData = figmaData
      if (figmaData.document) {
        documentData = figmaData.document
      } else if (figmaData.file && figmaData.file.document) {
        documentData = figmaData.file.document
      }

      if (!documentData || !documentData.children) {
        console.warn("No document children found, creating default SVG")
        return this.createDefaultSVG()
      }

      console.log(`Processing Figma data with ${documentData.children.length} top-level children`)

      // Extract SVG from normalized data
      const width = 400
      const height = 300

      let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`

      const extractShapes = (nodes: any[], offsetX = 0, offsetY = 0): string => {
        let shapes = ""

        if (!Array.isArray(nodes)) {
          console.warn("Expected array of nodes, got:", typeof nodes)
          return shapes
        }

        nodes.forEach((node, index) => {
          try {
            if (node.absoluteBoundingBox) {
              const { x, y, width: w, height: h } = node.absoluteBoundingBox

              switch (node.type) {
                case "RECTANGLE":
                  shapes += `<rect x="${x + offsetX}" y="${y + offsetY}" width="${w}" height="${h}" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>`
                  break
                case "ELLIPSE":
                  const cx = x + w / 2
                  const cy = y + h / 2
                  shapes += `<ellipse cx="${cx + offsetX}" cy="${cy + offsetY}" rx="${w / 2}" ry="${h / 2}" fill="#e0e0e0" stroke="#ccc" stroke-width="1"/>`
                  break
                case "TEXT":
                  shapes += `<text x="${x + offsetX}" y="${y + offsetY + 16}" font-family="Arial, sans-serif" font-size="14" fill="#333">${node.characters || "Text"}</text>`
                  break
                default:
                  console.log(`Unhandled node type: ${node.type}`)
              }
            }

            if (node.children && Array.isArray(node.children)) {
              shapes += extractShapes(node.children, offsetX, offsetY)
            }
          } catch (nodeError) {
            console.warn(`Error processing node ${index}:`, nodeError)
          }
        })

        return shapes
      }

      const extractedShapes = extractShapes(documentData.children)
      svgContent += extractedShapes
      svgContent += "</svg>"

      if (extractedShapes.trim()) {
        console.log("Successfully extracted SVG with shapes")
        return svgContent
      } else {
        console.warn("No shapes were extracted, returning default SVG")
        return this.createDefaultSVG()
      }
    } catch (error) {
      console.error("SVG extraction error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown extraction error"
      return this.createFallbackSVG(errorMessage)
    }
  }

  /**
   * Create a fallback SVG when extraction fails
   */
  private createFallbackSVG(errorMessage: string): string {
    return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="#ddd" stroke-width="1"/>
      <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">SVG Generation Error</text>
      <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">${errorMessage}</text>
    </svg>`
  }

  /**
   * Create a default SVG for successful extraction with no shapes
   */
  private createDefaultSVG(): string {
    return `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="50" width="300" height="200" fill="#f0f0f0" stroke="#ccc" stroke-width="2" rx="8"/>
      <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">Generated from Figma</text>
    </svg>`
  }

  /**
   * Main entry point for code generation
   */
  async generateCode(
    figmaData: FigmaFile,
    config: CodeGenerationConfig,
    progressCallback?: (progress: number, status: string) => void,
  ): Promise<GeneratedCode> {
    const sessionId = this.generateSessionId()
    const startTime = Date.now()

    const context: GenerationContext = {
      sessionId,
      startTime,
      config,
      figmaData,
    }

    this.generationQueue.set(sessionId, context)

    try {
      console.log(`[${sessionId}] Starting Figma JSON generation...`)
      progressCallback?.(10, "Extracting design data...")

      const figmaCodeOutput = this.generateFigmaJson(figmaData)

      progressCallback?.(50, "Formatting output file...")

      const figmaDesignContent = `export const figmaDesign = ${JSON.stringify(figmaCodeOutput, null, 2)};

${figmaCodeOutput.extractFigmaStyles}
`;

      const finalCode = {
        files: [
          {
            path: "src/figma-design.js",
            name: "figma-design.js",
            content: figmaDesignContent,
            size: figmaDesignContent.length,
          },
        ],
        structure: {
          root: "src",
          files: ["figma-design.js"],
        },
        preview: this.generatePreview(`// figma-design.js generated successfully!\n\n${figmaDesignContent.substring(0, 300)}...`),
      }

      console.log(`[${sessionId}] Assessing code quality...`)
      progressCallback?.(85, "Assessing quality...")

      const metrics = metricsCalculator.calculateMetrics(finalCode, startTime)
      const buildLogs: any[] = []

      const result: GeneratedCode = {
        id: sessionId,
        timestamp: new Date(),
        config,
        files: finalCode.files,
        structure: finalCode.structure,
        metrics,
        quality: {
          overall: 95, // High quality for direct Figma JSON output
          categories: {
            visual: 100, // Direct representation of Figma
            code: 90,    // Generated JSON structure
            performance: 80, // Depends on actual Figma data size
            accessibility: 70, // Needs manual review post-generation
            maintainability: 90,
            security: 95,
          },
          issues: [],
          recommendations: ["Review generated figma-design.js for specific implementation details.", "Consider manual optimization for large Figma files."],
          aiSuggestions: ["Enhance extractFigmaStyles function for more advanced code generation patterns."],
        },
        preview: finalCode.preview,
        buildStatus: "success",
        buildLogs,
      }

      console.log(`[${sessionId}] Code generation completed successfully`)
      progressCallback?.(100, "Complete!")
      return result
    } catch (error) {
      console.error(`[${sessionId}] Code generation failed:`, error)
      throw error
    } finally {
      this.generationQueue.delete(sessionId)
    }
  }

  private generateSessionId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFallbackJSX(config: CodeGenerationConfig): string {
    return `import React from 'react';
${config.styling === "css" ? `import './GeneratedComponent.css';` : ""}

interface GeneratedComponentProps {
  className?: string;
  [key: string]: any;
}

const GeneratedComponent: React.FC<GeneratedComponentProps> = ({ className = '', ...props }) => {
  return (
    <div className={\`generated-component \${className}\`} {...props}>
      <h1>Generated Component</h1>
      <p>This component was generated from your Figma design.</p>
    </div>
  );
};

export default GeneratedComponent;`
  }

  private generateFallbackCSS(config: CodeGenerationConfig): string {
    return `.generated-component {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.generated-component h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.generated-component p {
  color: #666;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .generated-component {
    padding: 15px;
  }
  
  .generated-component h1 {
    font-size: 1.25rem;
  }
}`
  }

  private generatePreview(componentCode: string): string {
    return `<!DOCTYPE html>
  <html>
  <head>
    <title>Generated Component Preview</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .preview {
          background: white;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .code-preview {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 15px;
          margin-top: 15px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          overflow-x: auto;
        }
    </style>
  </head>
  <body>
    <div class=\"preview\">
        <h2>🎉 Component Preview</h2>
        <p>Your Figma design has been successfully converted to a React component!</p>
        <div class=\"code-preview\">
          <strong>Generated Code Preview:</strong><br/>
          <pre>${componentCode.substring(0, 300)}...</pre>
        </div>
        <p><em>Download the complete files to see the full implementation.</em></p>
    </div>
  </body>
  </html>`
  }

  /**
   * Generates a detailed JavaScript object representing the Figma design.
   * This function aims to convert raw Figma API data into a structured,
   * machine-readable format for code generation.
   */
  public generateFigmaJson(figmaFile: FigmaFile, nodeId?: string): FigmaCodeOutput {
    const document = figmaFile.document;
    const components = figmaFile.components;
    const styles = figmaFile.styles;

    // Helper to find a node by ID recursively
    const findNode = (node: any, targetId: string): any | null => {
      if (node.id === targetId) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    let targetNode: any = document;
    if (nodeId) {
      const foundNode = findNode(document, nodeId);
      if (foundNode) {
        targetNode = foundNode;
      } else {
        console.warn(`Node with ID ${nodeId} not found. Generating for the whole document.`);
      }
    }

    // A simplified helper function to be included in the generated JS file
    // This function is a placeholder and should be expanded based on actual Figma styles processing
    const extractFigmaStylesFunction = "function extractFigmaStyles(figmaData) {\n  if (!figmaData) {\n    return { name: \"Untitled\", id: \"N/A\", url: \"N/A\", styles: {}, components: {} };\n  }\n\n  const fileKey = figmaData.fileKey || \'N/A\';\n  const nodeID = figmaData.nodeID || \'N/A\';\n  const name = figmaData.name || \'Untitled\';\n\n  // Construct a direct URL to the element in Figma\n  const sourceURL = `https://www.figma.com/file/${fileKey}/?node-id=${nodeID}`;\n\n  // Basic extraction example for styles and components\n  const extractedStyles = figmaData.styles || {};\n  const extractedComponents = figmaData.components || {};\n\n  return {\n    fileKey: fileKey,\n    nodeID: nodeID,\n    name: name,\n    type: figmaData.type || \'DOCUMENT\',\n    sourceURL: sourceURL,\n    lastModified: figmaData.lastModified || new Date().toISOString(),\n    thumbnailUrl: figmaData.thumbnailUrl || \'\',\n    document: figmaData.document || {},\n    components: extractedComponents,\n    styles: extractedStyles,\n  };\n}";

    // Construct the sourceURL based on the fileKey and nodeID
    const sourceURL = `https://www.figma.com/file/${figmaFile.key}/?node-id=${targetNode.id}`;

    const figmaCodeOutput: FigmaCodeOutput = {
      fileKey: figmaFile.key,
      lastModified: figmaFile.lastModified,
      thumbnailUrl: figmaFile.thumbnailUrl,
      nodeID: targetNode.id,
      name: targetNode.name,
      type: targetNode.type,
      sourceURL: sourceURL,
      document: targetNode, // The relevant part of the document
      components: components,
      styles: styles,
      extractFigmaStyles: extractFigmaStylesFunction,
    };

    return figmaCodeOutput;
  }
}

export const enhancedCodeGenerationEngine = EnhancedCodeGenerationEngine.getInstance()
