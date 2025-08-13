export default function SubCategoriaPage({ params }: { params: { categorySlug: string; subCategorySlug: string } }) {
    return (
        <div className="container">
            <h1>Subcategoría: {params.subCategorySlug}</h1>
            <p className="muted">Dentro de {params.categorySlug}</p>
        </div>
    );
}


