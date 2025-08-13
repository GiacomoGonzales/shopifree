import "./globals.css";
export const metadata = {
	title: "Shopifree Public Store",
	description: "Tienda pública minimal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body>{children}</body>
		</html>
	);
}


