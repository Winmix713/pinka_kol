import axios, { type AxiosInstance } from "axios"
import type { FigmaFile, FigmaVariable, FigmaVariableCollection } from "../types/figma.js"

export class FigmaAPI {
  private client: AxiosInstance
  private baseURL = "https://api.figma.com/v1"

  constructor(token: string) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "X-Figma-Token": token,
      },
      timeout: 30000,
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          throw new Error("Invalid Figma token or insufficient permissions")
        } else if (error.response?.status === 404) {
          throw new Error("Figma file not found or not accessible")
        } else if (error.response?.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later")
        }
        throw error
      },
    )
  }

  async getFile(fileId: string): Promise<FigmaFile> {
    const response = await this.client.get(`/files/${fileId}`)
    return response.data
  }

  async getFileVariables(fileId: string): Promise<{
    meta: {
      variableCollections: Record<string, FigmaVariableCollection>
      variables: Record<string, FigmaVariable>
    }
  }> {
    const response = await this.client.get(`/files/${fileId}/variables/local`)
    return response.data
  }

  async getImages(
    fileId: string,
    nodeIds: string[],
    options: {
      format?: "jpg" | "png" | "svg" | "pdf"
      scale?: number
      svg_include_id?: boolean
      svg_simplify_stroke?: boolean
    } = {},
  ): Promise<{ images: Record<string, string> }> {
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
      format: options.format || "svg",
      ...(options.scale && { scale: options.scale.toString() }),
      ...(options.svg_include_id && { svg_include_id: "true" }),
      ...(options.svg_simplify_stroke && { svg_simplify_stroke: "true" }),
    })

    const response = await this.client.get(`/images/${fileId}?${params}`)
    return response.data
  }

  async getComponent(componentKey: string): Promise<any> {
    const response = await this.client.get(`/components/${componentKey}`)
    return response.data
  }

  async getComponentSet(componentSetKey: string): Promise<any> {
    const response = await this.client.get(`/component_sets/${componentSetKey}`)
    return response.data
  }

  async getStyle(styleKey: string): Promise<any> {
    const response = await this.client.get(`/styles/${styleKey}`)
    return response.data
  }

  async getFileNodes(fileId: string, nodeIds: string[]): Promise<any> {
    const params = new URLSearchParams({
      ids: nodeIds.join(","),
    })

    const response = await this.client.get(`/files/${fileId}/nodes?${params}`)
    return response.data
  }

  async getComments(fileId: string): Promise<any> {
    const response = await this.client.get(`/files/${fileId}/comments`)
    return response.data
  }

  async getVersions(fileId: string): Promise<any> {
    const response = await this.client.get(`/files/${fileId}/versions`)
    return response.data
  }

  async getTeamProjects(teamId: string): Promise<any> {
    const response = await this.client.get(`/teams/${teamId}/projects`)
    return response.data
  }

  async getProjectFiles(projectId: string): Promise<any> {
    const response = await this.client.get(`/projects/${projectId}/files`)
    return response.data
  }

  // Helper method to find nodes by type
  findNodesByType(node: any, type: string): any[] {
    const results: any[] = []

    if (node.type === type) {
      results.push(node)
    }

    if (node.children) {
      for (const child of node.children) {
        results.push(...this.findNodesByType(child, type))
      }
    }

    return results
  }

  // Helper method to find nodes by name pattern
  findNodesByName(node: any, pattern: RegExp): any[] {
    const results: any[] = []

    if (pattern.test(node.name)) {
      results.push(node)
    }

    if (node.children) {
      for (const child of node.children) {
        results.push(...this.findNodesByName(child, pattern))
      }
    }

    return results
  }
}
