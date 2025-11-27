
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Content from "./ClinetLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FCCE Library System",
  description: "Professional Media Asset Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-slate-50/50 font-sans antialiased", inter.className)}>
        <AuthProvider>
          <Content>{children}</Content>
        </AuthProvider>
      </body>
    </html>
  );
}
