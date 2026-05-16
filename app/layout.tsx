import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalorieApp",
  description: "Track calories and get AI-powered meal plans",
};

const fruits = [
  { emoji: '🍎', top: '8%',  left: '3%',  size: '1.8rem', rotate: '-12deg', duration: 4.2, delay: 0,   anim: 'float'     },
  { emoji: '🍊', top: '20%', left: '95%', size: '1.6rem', rotate: '18deg',  duration: 5.1, delay: 0.8, anim: 'floatWide' },
  { emoji: '🍋', top: '38%', left: '1%',  size: '1.5rem', rotate: '-8deg',  duration: 6.0, delay: 1.5, anim: 'floatSlow' },
  { emoji: '🍇', top: '55%', left: '97%', size: '1.8rem', rotate: '25deg',  duration: 4.8, delay: 0.4, anim: 'float'     },
  { emoji: '🍓', top: '70%', left: '4%',  size: '1.5rem', rotate: '-20deg', duration: 5.5, delay: 2.0, anim: 'floatWide' },
  { emoji: '🫐', top: '85%', left: '94%', size: '1.4rem', rotate: '10deg',  duration: 4.0, delay: 1.2, anim: 'floatSlow' },
  { emoji: '🥝', top: '93%', left: '2%',  size: '1.6rem', rotate: '-5deg',  duration: 5.8, delay: 0.6, anim: 'float'     },
  { emoji: '🍑', top: '28%', left: '91%', size: '1.4rem', rotate: '15deg',  duration: 4.5, delay: 2.5, anim: 'floatWide' },
  { emoji: '🍌', top: '75%', left: '92%', size: '1.7rem', rotate: '-25deg', duration: 6.2, delay: 0.9, anim: 'floatSlow' },
  { emoji: '🥑', top: '48%', left: '6%',  size: '1.5rem', rotate: '8deg',   duration: 4.3, delay: 1.8, anim: 'float'     },
  { emoji: '🍉', top: '62%', left: '96%', size: '1.8rem', rotate: '-18deg', duration: 5.2, delay: 0.2, anim: 'floatWide' },
  { emoji: '🍒', top: '12%', left: '48%', size: '1.3rem', rotate: '12deg',  duration: 3.8, delay: 3.0, anim: 'floatSlow' },
  { emoji: '🥕', top: '90%', left: '52%', size: '1.4rem', rotate: '-10deg', duration: 5.6, delay: 1.0, anim: 'float'     },
  { emoji: '🍍', top: '44%', left: '0%',  size: '1.6rem', rotate: '20deg',  duration: 4.9, delay: 2.2, anim: 'floatWide' },
  { emoji: '🍄', top: '96%', left: '22%', size: '1.3rem', rotate: '-15deg', duration: 6.5, delay: 0.7, anim: 'floatSlow' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {fruits.map((f, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: f.top,
                left: f.left,
                fontSize: f.size,
                opacity: 0.11,
                userSelect: 'none',
                animation: `${f.anim} ${f.duration}s ease-in-out infinite`,
                animationDelay: `${f.delay}s`,
                ['--r' as string]: f.rotate,
              }}
            >
              {f.emoji}
            </span>
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
