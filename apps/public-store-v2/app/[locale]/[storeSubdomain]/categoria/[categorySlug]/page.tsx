export default function CategoriaPage({ params }: { params: { categorySlug: string } }) {
    return (
        <div className="container">
            <h1>Categoría: {params.categorySlug}</h1>
        </div>
    );
}


