"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Loader2, AlertCircle } from "lucide-react"
import { createSafeResizeObserver } from "@/utils/performance-utils"
import type { ValidationError } from "./code-validator"

// Monaco Editor dynamic import and setup
let monaco: any = null
let isMonacoLoaded = false

// Configure Monaco Environment for web workers
if (typeof window !== "undefined") {
  ;(window as any).MonacoEnvironment = {
    getWorkerUrl: (moduleId: string, label: string) => {
      if (label === "json") {
        return "/monaco-editor/min/vs/language/json/json.worker.js"
      }
      if (label === "css" || label === "scss" || label === "less") {
        return "/monaco-editor/min/vs/language/css/css.worker.js"
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return "/monaco-editor/min/vs/language/html/html.worker.js"
      }
      if (label === "typescript" || label === "javascript") {
        return "/monaco-editor/min/vs/language/typescript/ts.worker.js"
      }
      return "/monaco-editor/min/vs/editor/editor.worker.js"
    },
  }
}

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: "typescript" | "css" | "javascript"
  errors?: ValidationError[]
  readOnly?: boolean
  height?: string
  theme?: "vs-dark" | "vs-light"
  placeholder?: string
  onMount?: (editor: any) => void
  options?: any
}

export function MonacoEditor({
  value,
  onChange,
  language,
  errors = [],
  readOnly = false,
  height = "400px",
  theme = "vs-dark",
  placeholder,
  onMount,
  options = {},
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadMonaco = async () => {
      try {
        setIsLoading(true)

        if (!isMonacoLoaded) {
          // Dynamic import of Monaco Editor
          const monacoModule = await import("monaco-editor")
          monaco = monacoModule.default || monacoModule
          isMonacoLoaded = true

          // Configure TypeScript compiler options
          monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
            allowJs: true,
            strict: false,
            skipLibCheck: true,
          })

          // Add React types
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `
            declare module 'react' {
              export interface FC<P = {}> {
                (props: P): JSX.Element | null;
              }
              export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
              export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
              export function useRef<T>(initialValue: T): { current: T };
              export function useMemo<T>(factory: () => T, deps: any[]): T;
              export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
              export interface ReactNode {}
              export interface JSX {
                Element: any;
                IntrinsicElements: {
                  [elemName: string]: any;
                };
              }
              export interface CSSProperties {
                [key: string]: any;
              }
            }
          `,
            "file:///node_modules/@types/react/index.d.ts",
          )

          // Define custom theme
          monaco.editor.defineTheme("figma-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "comment", foreground: "6A737D", fontStyle: "italic" },
              { token: "keyword", foreground: "F97583", fontStyle: "bold" },
              { token: "string", foreground: "9ECBFF" },
              { token: "number", foreground: "79B8FF" },
              { token: "type", foreground: "B392F0" },
              { token: "function", foreground: "B392F0" },
              { token: "variable", foreground: "E1E4E8" },
            ],
            colors: {
              "editor.background": "#0D1117",
              "editor.foreground": "#F0F6FC",
              "editorLineNumber.foreground": "#6E7681",
              "editor.selectionBackground": "#264F78",
              "editor.lineHighlightBackground": "#161B22",
              "editorCursor.foreground": "#F0F6FC",
              "editor.findMatchBackground": "#FFDF5D",
              "editor.findMatchHighlightBackground": "#FFDF5D66",
            },
          })
        }

        if (!isMounted || !editorRef.current) return

        // Create editor instance
        const editor = monaco.editor.create(editorRef.current, {
          value: value || placeholder || "",
          language: language === "typescript" ? "typescript" : language,
          theme: theme === "vs-dark" ? "figma-dark" : theme,
          readOnly,
          automaticLayout: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineHeight: 20,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
          lineNumbers: "on",
          renderWhitespace: "selection",
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: "line",
          selectionHighlight: false,
          occurrencesHighlight: false,
          codeLens: false,
          contextmenu: true,
          mouseWheelZoom: true,
          ...options,
        })

        editorInstanceRef.current = editor

        // Handle value changes with debouncing
        const disposable = editor.onDidChangeModelContent(() => {
          if (changeTimeoutRef.current) {
            clearTimeout(changeTimeoutRef.current)
          }

          changeTimeoutRef.current = setTimeout(() => {
            const newValue = editor.getValue()
            onChange(newValue)
          }, 300)
        })

        // Set up safe resize observer
        resizeObserverRef.current = createSafeResizeObserver(
          () => {
            if (editorInstanceRef.current && isMounted) {
              try {
                editorInstanceRef.current.layout()
              } catch (error) {
                console.warn("Editor layout error:", error)
              }
            }
          },
          { debounceMs: 100 },
        )

        if (editorRef.current) {
          resizeObserverRef.current.observe(editorRef.current)
        }

        // Call onMount callback
        if (onMount) {
          onMount(editor)
        }

        setIsLoading(false)

        // Cleanup function
        return () => {
          disposable.dispose()
          if (changeTimeoutRef.current) {
            clearTimeout(changeTimeoutRef.current)
          }
        }
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error)
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : "Failed to load editor")
          setIsLoading(false)
        }
      }
    }

    loadMonaco()

    return () => {
      isMounted = false
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose()
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current)
      }
    }
  }, [])

  // Update editor value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== value) {
      const editor = editorInstanceRef.current
      const model = editor.getModel()
      if (model) {
        const position = editor.getPosition()
        editor.setValue(value || placeholder || "")
        if (position) {
          editor.setPosition(position)
        }
      }
    }
  }, [value, placeholder])

  // Update editor theme
  useEffect(() => {
    if (monaco && editorInstanceRef.current) {
      const themeToUse = theme === "vs-dark" ? "figma-dark" : theme
      monaco.editor.setTheme(themeToUse)
    }
  }, [theme])

  // Update read-only state
  useEffect(() => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.updateOptions({ readOnly })
    }
  }, [readOnly])

  // Update error markers
  useEffect(() => {
    if (monaco && editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel()
      if (model) {
        const markers = errors.map((error) => ({
          startLineNumber: error.line,
          startColumn: error.column,
          endLineNumber: error.line,
          endColumn: error.column + 10,
          message: error.message,
          severity:
            error.severity === "error"
              ? monaco.MarkerSeverity.Error
              : error.severity === "warning"
                ? monaco.MarkerSeverity.Warning
                : monaco.MarkerSeverity.Info,
          source: error.source,
          code: error.code,
        }))

        monaco.editor.setModelMarkers(model, "validation", markers)
      }
    }
  }, [errors])

  if (loadError) {
    return (
      <div className="flex items-center justify-center border rounded-lg bg-muted/50" style={{ height }}>
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">Failed to load code editor</p>
            <p className="text-xs text-muted-foreground mt-1">{loadError}</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-xs text-primary hover:underline">
            Refresh page to retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading editor...</span>
          </div>
        </motion.div>
      )}

      <div
        ref={editorRef}
        className="w-full h-full border rounded-lg overflow-hidden bg-background"
        style={{ height }}
      />

      {errors.length > 0 && (
        <div className="absolute top-2 right-2 z-20">
          <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 border border-destructive/20 rounded text-xs">
            <AlertCircle className="w-3 h-3 text-destructive" />
            <span className="text-destructive font-medium">{errors.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
