// 🚀 OPTIMIZACIÓN FASE 1: Cache ISR - Revalidar cada 1 hora
export const revalidate = 3600;
export const fetchCache = 'force-cache';

export default function CatalogoPage() {
    return (
        <div className="container">
            <h1>Catálogo</h1>
            <p className="muted">Todos los productos</p>
        </div>
    );
}


