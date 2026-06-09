import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider
} from "@/components/ui/image-comparison";
import { Sparkles, FileText } from "lucide-react";
import { FileCard } from "@/components/ui/file-card-collections";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const formats = ["doc", "pdf", "txt", "md", "csv", "zip", "png", "jpg", "json"] as const;

export function CVComparison() {
  return (
    <section className="py-20 md:py-24 bg-muted/30">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-primary/10 text-primary font-bold text-sm tracking-wide">
            <Sparkles className="w-4 h-4" />
            Vex Resume Engine
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-6">
            From Messy to <span className="text-primary">Harvard-Level</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our AI transforms a standard, messy resume into a top-tier, highly optimized profile designed to beat ATS systems and impress recruiters.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="p-2 bg-card rounded-2xl shadow-xl border border-border">
            <ImageComparison className="aspect-[4/3] md:aspect-[16/9] w-full rounded-xl" enableHover>
              {/* Bad CV (Left) */}
              <ImageComparisonImage
                src="https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?q=80&w=2000"
                className="grayscale opacity-80"
                alt="Bad CV Before AI"
                position="left"
              />
              {/* Good CV (Right) */}
              <ImageComparisonImage
                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2000"
                alt="Harvard Level CV After AI"
                position="right"
              />
              <ImageComparisonSlider className="w-1 bg-white shadow-xl">
                <div className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-black/20 rounded-full" />
                    <div className="w-1 h-3 bg-black/20 rounded-full" />
                  </div>
                </div>
              </ImageComparisonSlider>
            </ImageComparison>
          </div>
        </div>

        {/* Added Supported Formats Animation */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground mb-6 uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            Upload any existing format
          </div>
          <div className="relative h-[120px] w-full overflow-hidden max-w-3xl mx-auto">
            <InfiniteSlider duration={40} gap={24} className="flex h-full items-center py-4">
              {formats.map((format, i) => (
                <div key={i} className="hover:scale-110 transition-transform cursor-pointer">
                  <FileCard formatFile={format} />
                </div>
              ))}
            </InfiniteSlider>
            <ProgressiveBlur
              className='pointer-events-none absolute top-0 left-0 h-full w-[100px]'
              direction='left'
              blurIntensity={1}
            />
            <ProgressiveBlur
              className='pointer-events-none absolute top-0 right-0 h-full w-[100px]'
              direction='right'
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
