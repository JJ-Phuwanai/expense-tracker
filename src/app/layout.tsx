import './globals.css';
import BottomNav from '../components/bottom-nav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="th">
            <body className="antialiased bg-background">
                {/* เนื้อหาหลัก */}
                <div className="pb-24">{children}</div>
                {/* เมนูด้านล่าง */}
                <BottomNav />
            </body>
        </html>
    );
}
