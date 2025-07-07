import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Code, Palette, FileText } from "lucide-react"

export default function CodeEnhancementLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-80 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex items-center justify-center gap-2 p-2">
                  {i === 1 && <Code className="w-4 h-4" />}
                  {i === 2 && <Palette className="w-4 h-4" />}
                  {i === 3 && <FileText className="w-4 h-4" />}
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>

            {/* Editor Area */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Viewport Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-16" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Preview Frame */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-2 border-b">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-1">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center">
                <Skeleton className="h-64 w-full max-w-md rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <Skeleton key={j} className="h-16 w-full rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
