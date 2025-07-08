import React, { useState, useEffect } from 'react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'María González',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      comment: 'Excelente servicio y productos de calidad. Mi perro Max está encantado con su nueva cama ortopédica.',
      rating: 5,
      location: 'Madrid, España'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      comment: 'La variedad de productos es increíble. Encontré todo lo que necesitaba para mis gatos en un solo lugar.',
      rating: 5,
      location: 'Barcelona, España'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      comment: 'Entrega rápida y productos tal como se describen. Definitivamente volveré a comprar aquí.',
      rating: 5,
      location: 'Valencia, España'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Miles de clientes satisfechos confían en nosotros para el cuidado de sus mascotas
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial principal */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <img
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              />
              <div className="flex justify-center mb-4">
                {renderStars(testimonials[currentTestimonial].rating)}
              </div>
            </div>
            
            <blockquote className="text-xl text-gray-700 mb-6 italic">
              "{testimonials[currentTestimonial].comment}"
            </blockquote>
            
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-lg">
                {testimonials[currentTestimonial].name}
              </p>
              <p className="text-gray-500">
                {testimonials[currentTestimonial].location}
              </p>
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Testimonios en miniatura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-lg p-6 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                index === currentTestimonial ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => goToTestimonial(index)}
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3">
                {testimonial.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials; 