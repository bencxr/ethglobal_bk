import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "banana babies",
  description: "A Tropical Adventure",
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/bblogo.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/bblogo.png',
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/bblogo.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/bblogo.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/bblogo.png',
      },
    ],
  },
};

// eslint-disable-next-line no-undef
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/bblogo.png" />
        <link rel="apple-touch-icon" href="/bblogo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
