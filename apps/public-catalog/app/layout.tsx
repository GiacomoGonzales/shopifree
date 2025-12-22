import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalogo',
  description: 'Catalogo de productos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
