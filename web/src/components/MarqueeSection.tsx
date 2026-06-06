import Image from "next/image";
import { MARQUEE_LOGOS } from "@/lib/marquee-logos";

interface MarqueeSectionProps {
  title: string;
}

export function MarqueeSection({ title }: MarqueeSectionProps) {
  const logos = [...MARQUEE_LOGOS, ...MARQUEE_LOGOS];

  return (
    <section className="marquee-section overflow-hidden border-y-[3px] border-[#333] bg-[#111] py-5">
      <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {title}
      </p>
      <div className="overflow-hidden">
        <div className="marquee-track items-center">
          {logos.map((logo, i) => (
            <div key={`${logo.src}-${i}`} className="ngo-logo-item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={150}
                height={36}
                className="h-9 w-auto max-w-[150px] object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
