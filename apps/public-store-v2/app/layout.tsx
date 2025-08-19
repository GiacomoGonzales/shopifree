import "../styles/globals.css";
import { CartProvider } from "../lib/cart-context";
// import "../styles/tokens.css"; // no existía en el commit base
// import "../styles/fonts.css";  // no existían fuentes locales en el commit base
export const metadata = {
	title: "Shopifree Public Store",
	description: "Tienda pública minimal",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="es">
            <head>
                {/* 🚀 Preconnect críticos para rendimiento - una sola vez */}
                <link rel="preconnect" href="https://res.cloudinary.com" />
                <link rel="dns-prefetch" href="https://res.cloudinary.com" />
            </head>
            <body>
                <CartProvider>
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}


