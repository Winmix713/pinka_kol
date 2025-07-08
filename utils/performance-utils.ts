/**
 * Performance utilities for handling ResizeObserver and other performance-critical operations
 */

// Global error suppression for ResizeObserver
if (typeof window !== "undefined") {
  // Suppress ResizeObserver loop errors
  const originalError = console.error
  console.error = (...args) => {
    const message = args[0]?.toString() || ""
    if (
      message.includes("ResizeObserver loop") ||
      message.includes("ResizeObserver loop completed with undelivered notifications") ||
      message.includes("ResizeObserver loop limit exceeded")
    ) {
      return // Suppress these specific errors
    }
    originalError.apply(console, args)
  }

  // Handle window errors
  window.addEventListener("error", (e) => {
    if (
      e.message?.includes("ResizeObserver loop") ||
      e.message?.includes("ResizeObserver loop completed with undelivered notifications") ||
      e.message?.includes("ResizeObserver loop limit exceeded")
    ) {
      e.preventDefault()
      e.stopImmediatePropagation()
      return false
    }
  })

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    if (e.reason?.toString().includes("ResizeObserver loop")) {
      e.preventDefault()
      return false
    }
  })
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Throttle function to limit the rate of function calls
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function executedFunction(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Safe ResizeObserver that handles errors gracefully
 */
export interface SafeResizeObserverOptions {
  debounceMs?: number
  throttleMs?: number
}

export function createSafeResizeObserver(
  callback: ResizeObserverCallback,
  options: SafeResizeObserverOptions = {},
): ResizeObserver {
  const { debounceMs = 0, throttleMs = 0 } = options

  let processedCallback = callback

  // Apply debouncing if specified
  if (debounceMs > 0) {
    processedCallback = debounce(callback, debounceMs)
  }

  // Apply throttling if specified
  if (throttleMs > 0) {
    processedCallback = throttle(callback, throttleMs)
  }

  // Wrap callback with error handling
  const safeCallback: ResizeObserverCallback = (entries, observer) => {
    try {
      processedCallback(entries, observer)
    } catch (error) {
      console.warn("ResizeObserver callback error:", error)
    }
  }

  return new ResizeObserver(safeCallback)
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map()

  static mark(name: string): void {
    if (typeof performance !== "undefined") {
      performance.mark(name)
      this.marks.set(name, performance.now())
    }
  }

  static measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof performance !== "undefined") {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark)
        } else {
          performance.measure(name, startMark)
        }

        const entries = performance.getEntriesByName(name, "measure")
        return entries.length > 0 ? entries[entries.length - 1].duration : null
      } catch (error) {
        console.warn("Performance measurement error:", error)
        return null
      }
    }
    return null
  }

  static getDuration(startMark: string): number | null {
    const startTime = this.marks.get(startMark)
    if (startTime && typeof performance !== "undefined") {
      return performance.now() - startTime
    }
    return null
  }

  static clear(): void {
    if (typeof performance !== "undefined") {
      performance.clearMarks()
      performance.clearMeasures()
    }
    this.marks.clear()
  }
}

/**
 * Memory usage monitoring
 */
interface MemoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

export function getMemoryUsage(): MemoryInfo | null {
  if (typeof performance !== "undefined" && "memory" in performance) {
    return (performance as any).memory
  }
  return null
}

/**
 * Intersection Observer with error handling
 */
export function createSafeIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver {
  const safeCallback: IntersectionObserverCallback = (entries, observer) => {
    try {
      callback(entries, observer)
    } catch (error) {
      console.warn("IntersectionObserver callback error:", error)
    }
  }

  return new IntersectionObserver(safeCallback, options)
}
