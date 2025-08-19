import "../styles/globals.css";
import { CartProvider } from "../lib/cart-context";
// import "../styles/tokens.css"; // no existía en el commit base
// import "../styles/fonts.css";  // no existían fuentes locales en el commit base
// 🚀 CORREGIDO: Metadata eliminado del layout raíz para evitar duplicación
// Los metadatos se manejan completamente en los layouts específicos de tienda
// export const metadata = {
//     title: "Shopifree Public Store", 
//     description: "Tienda pública minimal",
// };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="es">
            <body>
                <CartProvider>
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}


