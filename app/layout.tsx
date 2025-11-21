import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '../app/context/AuthContext'; // Import AuthProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FCCE Library System',
  description: 'Professional Media Asset Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-slate-50/50 font-sans antialiased", inter.className)}>
        {/* Wrap the entire app with AuthProvider */}
        <AuthProvider>
          <Navbar />
          
          <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-[1600px]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}