import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DialogProvider } from "@/context/DialogContext";

export const metadata: Metadata = {
  title: "🌕 ลอยกระทงออนไลน์ ๒๕๖๙ | ลอยคนโสดหาคู่ดวงสมพงษ์ & ลอยคู่หวานใจ",
  description: "เว็บลอยกระทงออนไลน์ คืนวันเพ็ญเดือน ๑๒ เสี่ยงทายตามหาเนื้อคู่ดวงสมพงษ์ด้วยวันเกิดและราศี หรือลอยกระทงคู่รักเคียงกัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full bg-slate-950" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-slate-950 text-slate-100" suppressHydrationWarning>
        <AuthProvider>
          <DialogProvider>{children}</DialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
