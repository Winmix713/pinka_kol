"use client"

import { useState, useCallback } from "react"
import { FIGMA_URL_PATTERNS, TOKEN_CONSTRAINTS, ERROR_MESSAGES } from "@/utils/validation"

interface ValidationResult {
  valid: boolean
  message?: string
}

interface ValidationState {
  isFigmaUrlValid: boolean
  isAccessTokenValid: boolean
  urlValidationMessage?: string
  tokenValidationMessage?: string
}

/**
 * Custom hook for form validation
 * Extracted from Step1Configuration for better separation of concerns
 */
export const useValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isFigmaUrlValid: true,
    isAccessTokenValid: true,
  })

  // Enhanced URL validation with detailed feedback
  const validateFigmaUrl = useCallback((url: string): ValidationResult => {
    if (!url.trim()) {
      return { valid: false, message: ERROR_MESSAGES.URL_REQUIRED }
    }

    const isValid = FIGMA_URL_PATTERNS.some((pattern) => pattern.test(url))

    if (!isValid) {
      if (!url.includes("figma.com")) {
        return { valid: false, message: ERROR_MESSAGES.URL_INVALID_DOMAIN }
      }
      if (!url.startsWith("https://")) {
        return { valid: false, message: ERROR_MESSAGES.URL_INVALID_PROTOCOL }
      }
      return { valid: false, message: ERROR_MESSAGES.URL_INVALID_FORMAT }
    }

    return { valid: true }
  }, [])

  // Enhanced token validation
  const validateAccessToken = useCallback((token: string): ValidationResult => {
    if (!token.trim()) {
      return { valid: false, message: ERROR_MESSAGES.TOKEN_REQUIRED }
    }

    if (token.length < TOKEN_CONSTRAINTS.MIN_LENGTH) {
      return { valid: false, message: ERROR_MESSAGES.TOKEN_TOO_SHORT }
    }

    if (token.length > TOKEN_CONSTRAINTS.MAX_LENGTH) {
      return { valid: false, message: ERROR_MESSAGES.TOKEN_TOO_LONG }
    }

    // Check for common token patterns
    if (!TOKEN_CONSTRAINTS.PATTERN.test(token)) {
      return { valid: false, message: ERROR_MESSAGES.TOKEN_INVALID_CHARS }
    }

    return { valid: true }
  }, [])

  // Validate inputs and update state
  const validateInputs = useCallback(
    (url: string, token: string) => {
      const urlValidation = validateFigmaUrl(url)
      const tokenValidation = validateAccessToken(token)

      setValidationState({
        isFigmaUrlValid: urlValidation.valid,
        isAccessTokenValid: tokenValidation.valid,
        urlValidationMessage: urlValidation.message,
        tokenValidationMessage: tokenValidation.message,
      })

      return {
        isValid: urlValidation.valid && tokenValidation.valid,
        urlValid: urlValidation.valid,
        tokenValid: tokenValidation.valid,
      }
    },
    [validateFigmaUrl, validateAccessToken],
  )

  return {
    validationState,
    validateInputs,
    validateFigmaUrl,
    validateAccessToken,
  }
}
