import type { Metadata } from 'next';
import './globals.css';
import { RestaurantProvider } from '@/context/RestaurantContext';

export const metadata: Metadata = {
  title: 'NYC Restaurant Inspection Results',
  description: 'Interactive map of NYC DOHMH restaurant inspection data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RestaurantProvider>{children}</RestaurantProvider>
      </body>
    </html>
  );
}
