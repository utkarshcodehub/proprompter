import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "ProPrompter — Write better prompts, spend fewer tokens",
  description:
    "Transform vague ideas into lean, structured AI prompts optimized for ChatGPT, Claude, Midjourney, and Cursor.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrains.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
