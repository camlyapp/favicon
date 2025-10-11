
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Eye, Package, ImageIcon, HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export function SeoSection() {
  return (
    <section className="w-full py-12 lg:py-24 bg-background border-t">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Elevate Your Brand with the Perfect Favicon</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
             A favicon is more than just an icon—it’s the digital face of your brand. It builds trust, improves user experience by making your site easy to spot in crowded browser tabs and bookmark lists, and boosts your professional appearance in search results. Our free favicon generator gives you all the tools to create a memorable, high-resolution icon that stands out and makes a lasting impression on every platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
          <div className="grid gap-1 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">Powerful Online Editor</h3>
            <p className="text-sm text-muted-foreground">
             Take full control of your design with our intuitive, powerful online editor. Add text, insert shapes, adjust colors, and fine-tune every detail. No design experience needed to create a stunning icon from scratch or by editing an existing image.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <ImageIcon className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">Pixel-Perfect Previews</h3>
            <p className="text-sm text-muted-foreground">
             Ensure your icon looks sharp and professional on every device. Instantly preview your favicon across dozens of standard sizes, from tiny browser tabs to high-resolution Apple touch icons and Android home screen shortcuts.
            </p>
          </div>
          <div className="grid gap-1 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Package className="h-8 w-8 text-primary" />
             </div>
            <h3 className="text-lg font-bold">One-Click Export for All Platforms</h3>
            <p className="text-sm text-muted-foreground">
             Get everything you need in one simple, free download. We provide a production-ready package with all required PNG sizes, a `favicon.ico` file, and the necessary HTML code and web manifest for perfect integration.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-16 lg:mt-24">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl flex items-center justify-center gap-2">
                    <HelpCircle className="w-7 h-7 text-primary"/>
                    Frequently Asked Questions
                </h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What exactly is a favicon?</AccordionTrigger>
                <AccordionContent>
                  A favicon (short for "favorite icon") is a small icon that represents a website. It appears in browser tabs, bookmark lists, search history, and in search results next to your site's URL. It's a key part of your website's visual identity.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Why is a favicon important for SEO and branding?</AccordionTrigger>
                <AccordionContent>
                  A favicon boosts brand recognition and builds user trust. When users see your icon in a list of tabs or search results, they can quickly identify your site. This improves click-through rates and enhances the user experience. While not a direct ranking factor, it contributes to a professional appearance that search engines and users value.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What makes a good favicon?</AccordionTrigger>
                <AccordionContent>
                  A great favicon is simple, memorable, and scalable. It should be instantly recognizable even at a small size (16x16 pixels). Use your brand's logo or a key element from it, with clear contrast and minimal detail. Ensure it reflects your brand's colors and personality.
                </AccordionContent>
              </AccordionItem>
                 <AccordionItem value="item-4">
                <AccordionTrigger>What sizes do I need?</AccordionTrigger>
                <AccordionContent>
                 Different devices and browsers require different sizes. Our generator provides a complete package, including standard sizes like 16x16, 32x32, and larger sizes like 180x180 for Apple touch icons and 192x192 or 512x512 for Android/Chrome. This ensures your icon looks sharp everywhere.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </div>
      </div>
    </section>
  )
}
