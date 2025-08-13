import "./globals.css";
export const metadata = {
	title: "Shopifree Public Store",
	description: "Tienda pública minimal",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}


