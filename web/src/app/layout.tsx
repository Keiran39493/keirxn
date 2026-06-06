import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LocaleProvider } from "@/context/LocaleContext";
import "./globals.css";
import "../styles/custom.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Charity Navigator | gemeinnuetzig.li",
  description:
    "Find Liechtenstein NGOs that align with your philanthropic values.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
