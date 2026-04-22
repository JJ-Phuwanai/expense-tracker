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
    manifest: '/manifest.json',
    icons: {
        apple: '/apple-touch-icon.png',
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
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="Budget" />
            </head>
            <body className="antialiased bg-muted/40 h-full overflow-hidden font-sans">
                <UserProvider>{children}</UserProvider>
                <BottomNav />
            </body>
        </html>
    );
}
