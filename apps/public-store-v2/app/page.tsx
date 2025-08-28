import { headers } from 'next/headers';

export default function Home() {
	const headersList = headers();
	const host = headersList.get('host') || '';
	
	// Solo mostrar esta página en desarrollo local o en el dominio principal
	const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
	
	return (
		<div className="container">
			<h1>Bienvenido</h1>
			{isLocalDev ? (
				<p className="muted">Visita /lunara para ver una tienda de ejemplo.</p>
			) : (
				<p className="muted">Esta página se muestra cuando no se encuentra una tienda configurada.</p>
			)}
		</div>
	);
}


