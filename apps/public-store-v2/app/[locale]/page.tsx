import { redirect } from "next/navigation";
import { isValidLocale } from "../../lib/locale-validation";

export default function HomeLocale({ params }: { params: { locale: string } }) {
    // Validar locale y redirigir si es inválido
    if (!isValidLocale(params.locale)) {
        redirect(`/es/`);
    }
    
    return (
        <div className="container">
            <h1>Inicio</h1>
            <p className="muted">Selecciona una tienda: visita /lunara</p>
        </div>
    );
}


