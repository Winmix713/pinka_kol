"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertTriangle, Loader2, Link, Code, Palette, FileText, Download, Eye, Zap } from "lucide-react"
import { useFigmaSteps } from "@/contexts/FigmaStepsContext"

// Step 1: Figma Configuration
export const Step1FigmaConfig: React.FC = () => {
  const { state, actions } = useFigmaSteps()
  const { stepData, stepStatus } = state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (stepData.figmaUrl) {
      actions.connectToFigma(stepData.figmaUrl)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Step 1: Figma Configuration
          {stepStatus.step1 === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
          {stepStatus.step1 === "loading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {stepStatus.step1 === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="figma-url">Figma Design URL</Label>
            <Input
              id="figma-url"
              type="url"
              placeholder="https://www.figma.com/design/..."
              value={stepData.figmaUrl}
              onChange={(e) => actions.setStepData({ figmaUrl: e.target.value })}
              disabled={stepStatus.step1 === "loading"}
              required
            />
            <p className="text-sm text-gray-500">
              Paste your Figma design URL. Make sure the file is publicly accessible or you have the right permissions.
            </p>
          </div>

          {stepData.figmaError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{stepData.figmaError}</AlertDescription>
            </Alert>
          )}

          {stepData.figmaFileInfo && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <strong>Connected:</strong> {stepData.figmaFileInfo.name}
                <br />
                <span className="text-sm">Last modified: {stepData.figmaFileInfo.lastModified}</span>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={!stepData.figmaUrl || stepStatus.step1 === "loading"} className="w-full">
            {stepStatus.step1 === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting to Figma...
              </>
            ) : (
              <>
                <Link className="w-4 h-4 mr-2" />
                Connect to Figma
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Step 2: SVG Generation
export const Step2SvgGeneration: React.FC = () => {
  const { state, actions } = useFigmaSteps()
  const { stepData, stepStatus } = state

  const handleGenerate = () => {
    actions.generateSvg()
  }

  const isDisabled = stepStatus.step1 !== "success" || stepStatus.step2 === "loading"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Step 2: SVG Generation
          {stepStatus.step2 === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
          {stepStatus.step2 === "loading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {stepStatus.step2 === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stepStatus.step1 !== "success" && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please complete Step 1 first.</AlertDescription>
          </Alert>
        )}

        {stepData.svgProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Extracting SVG...</span>
              <span>{stepData.svgProgress.percentage}%</span>
            </div>
            <Progress value={stepData.svgProgress.percentage} />
            <p className="text-sm text-gray-500">{stepData.svgProgress.message}</p>
          </div>
        )}

        {stepData.generatedSvg && (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                SVG generated successfully! ({stepData.generatedSvg.length} characters)
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generated SVG Preview</span>
                <Badge variant="outline">SVG</Badge>
              </div>
              <div
                className="w-full h-32 border rounded bg-white flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: stepData.generatedSvg }}
              />
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isDisabled} className="w-full">
          {stepStatus.step2 === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating SVG...
            </>
          ) : (
            <>
              <Code className="w-4 h-4 mr-2" />
              Generate SVG
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Step 3: CSS Implementation
export const Step3CssImplementation: React.FC = () => {
  const { state, actions } = useFigmaSteps()
  const { stepData, stepStatus } = state

  const handleGenerate = () => {
    actions.generateCss()
  }

  const isDisabled = stepStatus.step2 !== "success" || stepStatus.step3 === "loading"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Step 3: CSS Implementation
          {stepStatus.step3 === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
          {stepStatus.step3 === "loading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {stepStatus.step3 === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stepStatus.step2 !== "success" && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please complete Step 2 first.</AlertDescription>
          </Alert>
        )}

        {stepData.cssProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating CSS...</span>
              <span>{stepData.cssProgress.percentage}%</span>
            </div>
            <Progress value={stepData.cssProgress.percentage} />
            <p className="text-sm text-gray-500">{stepData.cssProgress.message}</p>
          </div>
        )}

        {stepData.generatedCss && (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                CSS generated successfully! ({stepData.generatedCss.split("\n").length} lines)
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generated CSS Preview</span>
                <Badge variant="outline">CSS</Badge>
              </div>
              <Textarea
                value={stepData.generatedCss.substring(0, 300) + (stepData.generatedCss.length > 300 ? "..." : "")}
                readOnly
                className="font-mono text-xs h-24"
              />
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isDisabled} className="w-full">
          {stepStatus.step3 === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating CSS...
            </>
          ) : (
            <>
              <Palette className="w-4 h-4 mr-2" />
              Generate CSS
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Step 4: Final Generation
export const Step4FinalGeneration: React.FC = () => {
  const { state, actions } = useFigmaSteps()
  const { stepData, stepStatus } = state

  const handleGenerate = () => {
    actions.generateFinalCode()
  }

  const isDisabled = stepStatus.step3 !== "success" || stepStatus.step4 === "loading"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Step 4: Final Code Generation
          {stepStatus.step4 === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
          {stepStatus.step4 === "loading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {stepStatus.step4 === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stepStatus.step3 !== "success" && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please complete Step 3 first.</AlertDescription>
          </Alert>
        )}

        {stepData.finalProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Generating final code...</span>
              <span>{stepData.finalProgress.percentage}%</span>
            </div>
            <Progress value={stepData.finalProgress.percentage} />
            <p className="text-sm text-gray-500">{stepData.finalProgress.message}</p>
          </div>
        )}

        {stepStatus.step4 === "success" && stepData.finalTsxCode && stepData.finalCssCode && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <strong>🎉 Code generation complete!</strong>
                <br />
                Your React component is ready for use.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">TSX Component</span>
                </div>
                <p className="text-xs text-blue-600">{stepData.finalTsxCode.split("\n").length} lines</p>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">CSS Styles</span>
                </div>
                <p className="text-xs text-purple-600">{stepData.finalCssCode.split("\n").length} lines</p>
              </div>

              <div className="border rounded-lg p-3 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Type Definitions</span>
                </div>
                <p className="text-xs text-green-600">
                  {stepData.finalTypesCode ? stepData.finalTypesCode.split("\n").length : 0} lines
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={actions.downloadCode} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download All Files
              </Button>
              <Button variant="outline" onClick={() => actions.setUIState({ previewMode: true })}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isDisabled} className="w-full">
          {stepStatus.step4 === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating final code...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Final Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
