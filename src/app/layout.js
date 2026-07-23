import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Trust Tool",
  description: "Bộ công cụ tư vấn tài chính chuyên nghiệp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
