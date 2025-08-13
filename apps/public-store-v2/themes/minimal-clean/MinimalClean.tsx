"use client";

type Props = {
	storeSubdomain: string;
};

export default function MinimalClean({ storeSubdomain }: Props) {
	// CSR-only: datos simulados / defaults; sin errores duros.
	const products = Array.from({ length: 8 }).map((_, i) => ({
		id: i + 1,
		title: `Producto ${i + 1}`,
		price: (i + 1) * 10,
	}));

	return (
		<div>
			<header className="header">
				<div className="container">
					<div className="logo">{storeSubdomain}</div>
				</div>
			</header>
			<main className="container">
				<div className="grid">
					{products.map((p) => (
						<div key={p.id} className="card">
							<div style={{ fontWeight: 600 }}>{p.title}</div>
							<div className="muted">${p.price}</div>
						</div>
					))}
				</div>
			</main>
			<footer className="footer">
				<div className="container">
					<div className="muted">Shopifree</div>
				</div>
			</footer>
		</div>
	);
}


