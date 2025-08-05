
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Eye, Package } from "lucide-react"

export function SeoSection() {
  return (
    <section className="w-full py-12 bg-background border-t">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Elevate Your Brand with the Perfect Favicon</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
             A favicon is more than just an icon; it's a vital part of your brand identity. It builds trust, improves user experience in browser tabs and bookmarks, and boosts your site's professional appearance in search results. This app gives you the tools to create a memorable, high-resolution icon that stands out and makes a lasting impression.
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
             Unleash your creativity. Upload any image and our AI will generate unique and inspiring favicon ideas in seconds. Explore different styles, colors, and concepts without any design experience.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Eye className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">Pixel-Perfect Previews</h3>
            <p className="text-sm text-muted-foreground">
             Ensure your icon looks sharp on every device. Instantly preview your favicon across dozens of standard sizes, from browser tabs to Apple touch icons and Android home screen shortcuts.
            </p>
          </div>
          <div className="grid gap-1 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Package className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">One-Click Export</h3>
            <p className="text-sm text-muted-foreground">
             Get everything you need in one simple download. We provide a production-ready package with all required PNG sizes, a favicon.ico file, and the necessary HTML code.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
