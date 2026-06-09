'use client';

import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

const logos = [
  {
    id: "logo-2",
    description: "Figma",
    image: "https://www.shadcnblocks.com/images/block/logos/figma.svg",
    className: "h-7 w-auto",
  },
  {
    id: "logo-3",
    description: "Next.js",
    image: "https://www.shadcnblocks.com/images/block/logos/nextjs.svg",
    className: "h-7 w-auto",
  },
  {
    id: "logo-6",
    description: "Supabase",
    image: "https://www.shadcnblocks.com/images/block/logos/supabase.svg",
    className: "h-7 w-auto",
  },
  {
    id: "logo-8",
    description: "Vercel",
    image: "https://www.shadcnblocks.com/images/block/logos/vercel.svg",
    className: "h-7 w-auto",
  },
];

export function LogosSlider() {
  return (
    <section className="py-12 bg-background border-t border-border/50">
      <div className="max-w-[1200px] mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Trusted by innovative companies
        </p>
      </div>
      <div className='relative h-[100px] w-full overflow-hidden'>
        <InfiniteSlider 
          className='flex h-full w-full items-center' 
          duration={30}
          gap={48}
        >
          {logos.map((logo) => (
            <div 
              key={logo.id} 
              className='flex w-32 items-center justify-center opacity-70 hover:opacity-100 transition-opacity'
            >
              <img
                src={logo.image}
                alt={logo.description}
                className={logo.className}
              />
            </div>
          ))}
        </InfiniteSlider>
        <ProgressiveBlur
          className='pointer-events-none absolute top-0 left-0 h-full w-[100px] md:w-[200px]'
          direction='left'
          blurIntensity={1}
        />
        <ProgressiveBlur
          className='pointer-events-none absolute top-0 right-0 h-full w-[100px] md:w-[200px]'
          direction='right'
          blurIntensity={1}
        />
      </div>
    </section>
  );
}
