import type { Metadata } from "next";
import { Montserrat} from "next/font/google";
import "./globals.css"

const base = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Worship Savvy",
  description: "Worship presentation software for churches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${base.className} text-sm antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
