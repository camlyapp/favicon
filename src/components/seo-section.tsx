
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Eye, Package } from "lucide-react"

export function SeoSection() {
  return (
    <section className="w-full py-12 bg-background border-t">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Your Favicon Matters</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              A great favicon is a small detail that makes a huge difference. It reinforces your brand, improves user experience, and boosts your site's credibility in browser tabs and search results. Favicon Forge gives you the tools to create a memorable icon that stands out.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
          <div className="grid gap-1 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">AI-Powered Variations</h3>
            <p className="text-sm text-muted-foreground">
              Stuck for ideas? Use AI to generate unique and creative variations of your icon in seconds.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Eye className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">Pixel-Perfect Previews</h3>
            <p className="text-sm text-muted-foreground">
              Preview your favicon across dozens of standard sizes to ensure it looks crisp and clear everywhere.
            </p>
          </div>
          <div className="grid gap-1 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Package className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">One-Click Export</h3>
            <p className="text-sm text-muted-foreground">
              Download a production-ready package with all the sizes and formats you need, including PNGs and ICO.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
