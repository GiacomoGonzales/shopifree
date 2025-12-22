import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to a default store or show a landing
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-light mb-4">Shopifree Catalog</h1>
        <p className="text-gray-500">Accede a tu catalogo usando tu subdominio</p>
      </div>
    </main>
  );
}
