import './globals.css';
import { Kanit } from 'next/font/google';
import BottomNav from '../components/bottom-nav';
import { UserProvider } from '@/context/user-context';

const kanit = Kanit({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['thai', 'latin'],
    variable: '--font-kanit',
});

export const metadata = {
    title: 'Budget Craft',
    description: 'แอปจัดการงบประมาณสไตล์คราฟต์',
    manifest: '/manifest.json',
    icons: {
        apple: '/290850.png',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="th" className={`${kanit.variable} h-full`}>
            <head>
                <link rel="apple-touch-icon" href="/290850.png" />
            </head>
            <body className="antialiased bg-muted/40 h-full overflow-hidden font-sans">
                <UserProvider>{children}</UserProvider>
                <BottomNav />
            </body>
        </html>
    );
}
