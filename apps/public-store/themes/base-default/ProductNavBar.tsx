import React, { useState } from 'react';

const ProductNavBar = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Relevancia');

  const categories = [
    'All',
    'Dogs',
    'Cats',
    'Birds',
    'Fish',
    'Reptiles',
    'Small Pets',
    'Accessories',
    'Toys',
    'Food'
  ];

  const sortOptions = [
    'Relevancia',
    'Precio: Menor a Mayor',
    'Precio: Mayor a Menor',
    'Más Nuevos',
    'Más Populares',
    'Mejor Calificados'
  ];

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const handleSortSelect = (option: string) => {
    setSortBy(option);
    setShowSortDropdown(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
      {/* Scroll horizontal de categorías */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Controles de filtros y ordenamiento */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Botón de filtros */}
        <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </button>

        {/* Dropdown de ordenamiento */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{sortBy}</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortSelect(option)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductNavBar; 