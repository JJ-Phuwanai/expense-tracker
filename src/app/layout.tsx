import "./globals.css";
import { Kanit } from "next/font/google";
import BottomNav from "../components/bottom-nav";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${kanit.variable} h-full`}>
      <body className="antialiased bg-muted/40 h-full overflow-hidden font-sans">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
