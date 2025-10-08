"use client";

import { Category } from "../../../lib/categories";

type Props = {
    categories: Category[];
    activeCategory: string | null;
    onCategoryChange: (slug: string | null) => void;
    t: (key: string) => string;
};

export default function RestaurantCategoryFilter({ categories, activeCategory, onCategoryChange, t }: Props) {
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="restaurant-category-filter">
            <div className="nbd-container">
                <div className="category-filter-wrapper">
                    {/* Botón "Todos" */}
                    <button
                        className={`category-filter-btn ${(!activeCategory || activeCategory === 'todos') ? 'active' : ''}`}
                        onClick={() => onCategoryChange('todos')}
                    >
                        <span>{t('all')}</span>
                    </button>

                    {/* Botones de categorías */}
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`category-filter-btn ${activeCategory === category.slug ? 'active' : ''}`}
                            onClick={() => onCategoryChange(category.slug)}
                        >
                            {category.imageUrl && (
                                <div className="category-filter-icon">
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
