import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
	const headersList = headers();
	const host = headersList.get('host') || '';
	
	// Si estamos en un subdominio de shopifree.app, redirigir a la página principal
	if (host.endsWith('.shopifree.app') && host !== 'shopifree.app') {
		redirect('https://shopifree.app');
	}
	
	// Solo mostrar esta página en desarrollo local o en el dominio principal
	const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
	
	return (
		<div className="container">
			<h1>Bienvenido</h1>
			{isLocalDev ? (
				<p className="muted">Visita /lunara para ver una tienda de ejemplo.</p>
			) : (
				<p className="muted">Esta página no debería mostrarse en producción para subdominios.</p>
			)}
		</div>
	);
}


