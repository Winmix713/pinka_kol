interface TransformOptions {
  framework: "react" | "vue" | "angular" | "svelte"
  typescript: boolean
  styling: "css" | "scss" | "styled-components" | "tailwind"
  componentName: string
  passProps: boolean
}

/**
 * Transform SVG content to framework-specific component code
 */
export async function transformer(svgContent: string, options: TransformOptions): Promise<string> {
  try {
    // Validate SVG content
    if (!svgContent || !svgContent.trim()) {
      throw new Error("SVG content is required")
    }

    // Clean and normalize SVG
    const cleanedSvg = cleanSvgContent(svgContent)

    // Convert based on framework
    switch (options.framework) {
      case "react":
        return transformToReact(cleanedSvg, options)
      case "vue":
        return transformToVue(cleanedSvg, options)
      case "angular":
        return transformToAngular(cleanedSvg, options)
      case "svelte":
        return transformToSvelte(cleanedSvg, options)
      default:
        throw new Error(`Unsupported framework: ${options.framework}`)
    }
  } catch (error) {
    console.error("Transform error:", error)
    throw new Error(`Transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function cleanSvgContent(svgContent: string): string {
  // Remove XML declarations and comments
  let cleaned = svgContent
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim()

  // Ensure SVG has proper structure
  if (!cleaned.startsWith("<svg")) {
    // If it's just path data or other elements, wrap in SVG
    cleaned = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${cleaned}</svg>`
  }

  // Fix common SVG issues
  cleaned = cleaned
    .replace(/class=/g, "className=") // React compatibility
    .replace(/stroke-width/g, "strokeWidth")
    .replace(/fill-rule/g, "fillRule")
    .replace(/clip-rule/g, "clipRule")

  return cleaned
}

function transformToReact(svgContent: string, options: TransformOptions): string {
  const { componentName, typescript, passProps } = options

  // Convert SVG attributes to React props
  const reactSvg = svgContent
    .replace(/class=/g, "className=")
    .replace(/for=/g, "htmlFor=")
    .replace(/tabindex=/g, "tabIndex=")

  const propsInterface = typescript
    ? `
interface ${componentName}Props {
  className?: string
  width?: number | string
  height?: number | string
  fill?: string
  stroke?: string
  [key: string]: any
}`
    : ""

  const propsType = typescript ? `: React.FC<${componentName}Props>` : ""
  const propsParam = passProps ? `{ className = '', width, height, fill, stroke, ...props }` : "()"

  // Extract SVG attributes for dynamic props
  const svgWithProps = passProps
    ? reactSvg.replace(
        /<svg([^>]*)>/,
        `<svg$1 className={\`\${className}\`} width={width} height={height} fill={fill} stroke={stroke} {...props}>`,
      )
    : reactSvg

  return `import React from 'react'
${propsInterface}

const ${componentName}${propsType} = (${propsParam}) => {
  return (
    ${svgWithProps
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")}
  )
}

export default ${componentName}`
}

function transformToVue(svgContent: string, options: TransformOptions): string {
  const { componentName, typescript } = options

  // Convert to Vue template syntax
  const vueSvg = svgContent.replace(/className=/g, ":class=").replace(/\{([^}]+)\}/g, "{{ $1 }}")

  return `<template>
  ${vueSvg}
</template>

<script ${typescript ? 'lang="ts"' : ""}>
import { defineComponent } from 'vue'

export default defineComponent({
  name: '${componentName}',
  props: {
    className: {
      type: String,
      default: ''
    },
    width: {
      type: [Number, String],
      default: undefined
    },
    height: {
      type: [Number, String],
      default: undefined
    }
  }
})
</script>`
}

function transformToAngular(svgContent: string, options: TransformOptions): string {
  const { componentName } = options

  // Convert to Angular template syntax
  const angularSvg = svgContent.replace(/className=/g, "[class]=").replace(/\{([^}]+)\}/g, "{{ $1 }}")

  const selector = componentName
    .toLowerCase()
    .replace(/([A-Z])/g, "-$1")
    .substring(1)

  return `import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-${selector}',
  template: \`
    ${angularSvg}
  \`,
  standalone: true
})
export class ${componentName}Component {
  @Input() className: string = ''
  @Input() width: number | string | undefined
  @Input() height: number | string | undefined
}`
}

function transformToSvelte(svgContent: string, options: TransformOptions): string {
  const { typescript } = options

  // Convert to Svelte syntax
  const svelteSvg = svgContent.replace(/className=/g, "class=")

  return `<script ${typescript ? 'lang="ts"' : ""}>
  export let className = ''
  export let width = undefined
  export let height = undefined
</script>

${svelteSvg}`
}
