import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THUMBNAIL ANTI-SLOP — Direção Visual para Thumbnails de YouTube',
  description:
    'Direção visual para thumbnails que parecem dirigidas por uma pessoa — não montadas automaticamente por IA. Menos efeitos, mais decisões.',
  keywords: [
    'youtube thumbnails',
    'art direction',
    'anti-slop',
    'midjourney prompts',
    'flux prompts',
    'visual hierarchy',
    'ctr optimization'
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#090a0d] text-zinc-100 selection:bg-amber-500 selection:text-black font-sans">
        {children}
      </body>
    </html>
  );
}
