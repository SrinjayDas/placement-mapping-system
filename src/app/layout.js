import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: "Velocity",
  description: "Launch faster. Convert better.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border-light)', marginTop: '4rem' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
            <p>&copy; 2024 University Placement Portal</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="/">Home</a>
              <a href="/drives">Drives</a>
              <a href="/admin/login">Admin Access</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
