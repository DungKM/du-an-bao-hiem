import { Be_Vietnam_Pro, Inter, Roboto } from "next/font/google";
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

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata = {
  title: "Trust Tool",
  description: "Bộ công cụ tư vấn tài chính chuyên nghiệp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${inter.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
