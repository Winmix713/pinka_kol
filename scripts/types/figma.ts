export interface FigmaFile {
  document: FigmaNode
  components: Record<string, FigmaComponent>
  styles: Record<string, FigmaStyle>
  name: string
  lastModified: string
  thumbnailUrl: string
  version: string
}

export interface FigmaNode {
  id: string
  name: string
  type: string
  visible?: boolean
  children?: FigmaNode[]
  absoluteBoundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  fills?: FigmaFill[]
  strokes?: FigmaStroke[]
  strokeWeight?: number
  cornerRadius?: number
  opacity?: number
  blendMode?: string
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL"
  primaryAxisSizingMode?: "FIXED" | "AUTO"
  counterAxisSizingMode?: "FIXED" | "AUTO"
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX"
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  itemSpacing?: number
  characters?: string
  style?: FigmaTextStyle
  componentPropertyDefinitions?: Record<string, FigmaComponentProperty>
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  componentSetId?: string
  documentationLinks: any[]
}

export interface FigmaStyle {
  key: string
  name: string
  description: string
  styleType: "FILL" | "TEXT" | "EFFECT" | "GRID"
}

export interface FigmaFill {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND" | "IMAGE"
  color?: FigmaColor
  opacity?: number
  gradientStops?: FigmaGradientStop[]
  imageRef?: string
}

export interface FigmaStroke {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND"
  color?: FigmaColor
  opacity?: number
}

export interface FigmaColor {
  r: number
  g: number
  b: number
  a?: number
}

export interface FigmaGradientStop {
  position: number
  color: FigmaColor
}

export interface FigmaTextStyle {
  fontFamily: string
  fontPostScriptName?: string
  fontWeight: number
  fontSize: number
  lineHeightPx?: number
  lineHeightPercent?: number
  letterSpacing?: number
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED"
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM"
}

export interface FigmaComponentProperty {
  type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT"
  defaultValue?: any
  variantOptions?: string[]
}

export interface DesignToken {
  name: string
  value: string | number
  type: "color" | "dimension" | "fontFamily" | "fontWeight" | "fontSize" | "lineHeight" | "letterSpacing" | "shadow"
  description?: string
  category: string
}

export interface GeneratedComponent {
  name: string
  props: ComponentProp[]
  jsx: string
  styles: string
  imports: string[]
  dependencies: string[]
}

export interface ComponentProp {
  name: string
  type: string
  defaultValue?: any
  required: boolean
  description?: string
}
