// app/layout.tsx — Root layout
import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'WC Predictor 2026 — World Cup Prediction Game',
  description: 'Predict FIFA World Cup 2026 scores, compete in private leagues, and climb the leaderboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased bg-pattern min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
