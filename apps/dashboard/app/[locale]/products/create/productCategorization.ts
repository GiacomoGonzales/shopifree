// Interfaces para categorías y metacampos
interface MetaField {
  id: string
  name: string
  type: 'text' | 'select' | 'tags'
  options?: string[]
  value?: string | string[]
}

interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
  isLeaf?: boolean // Indica si es un producto final con metadatos
}

// Categorías completas tipo Shopify con navegación anidada
export const CATEGORY_OPTIONS: CategoryNode[] = [

    { 
      id: 'fashion', 
      name: 'Ropa y accesorios',
      isLeaf: true, // Categoría principal también seleccionable
      children: [
        { 
          id: 'fashion-clothing', 
          name: 'Prendas de vestir',
          isLeaf: true, // También puede ser seleccionado directamente
          children: [
            { 
              id: 'fashion-clothing-sportswear', 
              name: 'Ropa deportiva',
              isLeaf: true, // Puede ser seleccionado directamente
              children: [
                { 
                  id: 'fashion-clothing-sportswear-pants', 
                  name: 'Pantalones deportivos',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-pants-running', name: 'Pantalones para correr', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-leggings', name: 'Leggings', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-shorts', name: 'Pantalones cortos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-flannel', name: 'Pantalones de franela', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-tights', name: 'Mallas', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-tracksuit', name: 'Pantalones de chándal', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-training', name: 'Pantalones para entrenamientos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-pants-windbreaker', name: 'Pantalones cortavientos', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-tops', 
                  name: 'Tops deportivos',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-tops-short-category', name: 'Tops cortos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-tops-short-sleeve', name: 'Camisetas de manga corta', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-tops-short-sleeveless', name: 'Camisetas sin mangas', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-tops-long', name: 'Tops largos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-tops-tank', name: 'Tank tops', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-tops-crop', name: 'Crop tops', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-tops-polo', name: 'Polos deportivos', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-boxing', 
                  name: 'Pantalones de boxeo',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-boxing-pants', name: 'Pantalones de boxeo', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-boxing-shorts', name: 'Shorts de boxeo', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-dance', 
                  name: 'Vestidos, faldas y trajes de baile',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-dance-dresses', name: 'Vestidos de baile', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-dance-skirts', name: 'Faldas de baile', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-dance-suits', name: 'Trajes de baile', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-bras', 
                  name: 'Sujetadores deportivos',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-bras-low', name: 'Sujetadores de soporte bajo', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-bras-medium', name: 'Sujetadores de soporte medio', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-bras-high', name: 'Sujetadores de soporte alto', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-hoodies', 
                  name: 'Sudaderas para deporte y sudaderas con capucha',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-hoodies-pullover', name: 'Sudaderas con capucha', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-sweatshirts-general', name: 'Sudaderas', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-hoodies-zip', name: 'Sudaderas con cierre', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-sweatshirts', name: 'Sudaderas sin capucha', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-hoodies-sports-jackets', name: 'Chaquetas deportivas', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-jackets', 
                  name: 'Chalecos y chaquetas deportivas',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-jackets-vests-general', name: 'Chalecos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-jackets-general', name: 'Chaquetas', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-jackets-vests', name: 'Chalecos deportivos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-jackets-windbreaker', name: 'Chaquetas cortavientos', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-jackets-training', name: 'Chaquetas de entrenamiento', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-sportswear-leotards', 
                  name: 'Leotardos y unitardos',
                  isLeaf: true, // También seleccionable
                  children: [
                    { id: 'fashion-clothing-sportswear-leotards-gymnastics', name: 'Leotardos de gimnasia', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-leotards-dance', name: 'Leotardos de danza', isLeaf: true },
                    { id: 'fashion-clothing-sportswear-unitards', name: 'Unitardos', isLeaf: true }
                  ]
                }
              ]
            },
            { 
              id: 'fashion-clothing-outerwear', 
              name: 'Ropa de abrigo',
              isLeaf: true, // También seleccionable
              children: [
                { id: 'fashion-clothing-outerwear-hunters', name: 'Cazadoras', isLeaf: true },
                { id: 'fashion-clothing-outerwear-jackets-coats', name: 'Chaquetas y abrigos', isLeaf: true },
                { id: 'fashion-clothing-outerwear-waterproof-pants', name: 'Pantalones impermeables', isLeaf: true },
                { id: 'fashion-clothing-outerwear-waterproof-suits', name: 'Trajes impermeables', isLeaf: true },
                { id: 'fashion-clothing-outerwear-snow-gear', name: 'Pantalones y trajes para nieve', isLeaf: true },
                { id: 'fashion-clothing-outerwear-vests', name: 'Chalecos', isLeaf: true },
                { id: 'fashion-clothing-outerwear-motorcycle', name: 'Ropa de motociclista', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-sets', 
              name: 'Conjuntos de ropa',
              isLeaf: true,
              children: []
            },
            { 
              id: 'fashion-clothing-pants', 
              name: 'Pantalones',
              isLeaf: true, // También seleccionable
              children: [
                { id: 'fashion-clothing-pants-general', name: 'Pantalones', isLeaf: true },
                { id: 'fashion-clothing-pants-cargo', name: 'Pantalones tipo cargo', isLeaf: true },
                { id: 'fashion-clothing-pants-chinos', name: 'Chinos', isLeaf: true },
                { id: 'fashion-clothing-pants-jeans', name: 'Vaqueros', isLeaf: true },
                { id: 'fashion-clothing-pants-jeggings', name: 'Mallas vaqueras', isLeaf: true },
                { id: 'fashion-clothing-pants-running', name: 'Pantalones para correr', isLeaf: true },
                { id: 'fashion-clothing-pants-leggings', name: 'Leggings', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-tops', 
              name: 'Prendas de ropa superiores',
              isLeaf: true, // También seleccionable
              children: [
                { id: 'fashion-clothing-tops-blouses', name: 'Blusas', isLeaf: true },
                { id: 'fashion-clothing-tops-tunics', name: 'Túnicas', isLeaf: true },
                { id: 'fashion-clothing-tops-sweaters', name: 'Suéteres', isLeaf: true },
                { id: 'fashion-clothing-tops-hoodies', name: 'Sudaderas con capucha', isLeaf: true },
                { id: 'fashion-clothing-tops-sweatshirts', name: 'Sudaderas', isLeaf: true },
                { id: 'fashion-clothing-tops-bodysuits', name: 'Bodis', isLeaf: true },
                { id: 'fashion-clothing-tops-cardigans', name: 'Cárdigan', isLeaf: true },
                { id: 'fashion-clothing-tops-overshirts', name: 'Sobrecamisas', isLeaf: true },
                { id: 'fashion-clothing-tops-polos', name: 'Polos', isLeaf: true },
                { 
                  id: 'fashion-clothing-tops-shirts', 
                  name: 'Camisas',
                  isLeaf: true,
                  children: [
                    { id: 'fashion-clothing-tops-shirts-short-sleeve', name: 'Camisetas de manga corta', isLeaf: true },
                    { id: 'fashion-clothing-tops-shirts-sleeveless', name: 'Camisetas sin mangas', isLeaf: true }
                  ]
                }
              ]
            },
            { 
              id: 'fashion-clothing-shorts', 
              name: 'Pantalones cortos',
              isLeaf: true,
              children: []
            },
            { 
              id: 'fashion-clothing-skirts', 
              name: 'Faldas',
              isLeaf: true,
              children: []
            },
            { 
              id: 'fashion-clothing-skirt-pants', 
              name: 'Faldas pantalón',
              isLeaf: true,
              children: []
            },
            { 
              id: 'fashion-clothing-sleepwear', 
              name: 'Ropa para dormir y para estar en casa',
              isLeaf: true, // También seleccionable
              children: [
                { id: 'fashion-clothing-sleepwear-thermal', name: 'Ropa interior térmica', isLeaf: true },
                { id: 'fashion-clothing-sleepwear-comfortable', name: 'Ropa cómoda', isLeaf: true },
                { id: 'fashion-clothing-sleepwear-nightgowns', name: 'Camisones', isLeaf: true },
                { id: 'fashion-clothing-sleepwear-pajamas', name: 'Pijamas', isLeaf: true },
                { id: 'fashion-clothing-sleepwear-robes', name: 'Albornoces', isLeaf: true },
                { id: 'fashion-clothing-sleepwear-jumpsuits', name: 'Monos', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-socks', 
              name: 'Calcetines',
              isLeaf: true, // También seleccionable
              children: [
                { id: 'fashion-clothing-socks-ankle', name: 'Calcetines de tobillo', isLeaf: true },
                { id: 'fashion-clothing-socks-sports', name: 'Calcetines deportivos', isLeaf: true },
                { id: 'fashion-clothing-socks-athletic', name: 'Calcetines para deporte', isLeaf: true },
                { id: 'fashion-clothing-socks-long', name: 'Calcetines largos', isLeaf: true },
                { id: 'fashion-clothing-socks-dance', name: 'Calcetines de baile', isLeaf: true },
                { id: 'fashion-clothing-socks-no-show', name: 'Pinkis', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-suits', 
              name: 'Trajes',
              children: [
                { id: 'fashion-clothing-suits-pants', name: 'Trajes de pantalón', isLeaf: true },
                { id: 'fashion-clothing-suits-skirt', name: 'Trajes de falda', isLeaf: true },
                { id: 'fashion-clothing-suits-tuxedo', name: 'Esmóquines', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-baby-kids', 
              name: 'Ropa de bebés y niños pequeños',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-baby-kids-pants', name: 'Pantalones para bebés y niños pequeños', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-bodysuits', name: 'Bodys para bebés', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-underwear', name: 'Ropa interior para niños pequeños', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-diaper-covers', name: 'Cubrepañales', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-dresses', name: 'Vestidos para bebés y niñas pequeñas', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-outerwear', name: 'Ropa de abrigo para bebés y niños pequeños', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-sets', name: 'Conjuntos de ropa para bebés y niños pequeños', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-pajamas', name: 'Pijamas y saquitos para bebés', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-socks', name: 'Calcetines para bebés y niños pequeños', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-swimwear', name: 'Bañadores para bebés y niños pequeños', isLeaf: true },
                { id: 'fashion-clothing-baby-kids-shirts', name: 'Camisetas para bebés y niños pequeños', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-swimwear', 
              name: 'Trajes de baño',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-swimwear-wetsuit', name: 'Camiseta de buceo', isLeaf: true },
                { id: 'fashion-clothing-swimwear-dress', name: 'Vestidos de baño', isLeaf: true },
                { id: 'fashion-clothing-swimwear-surf-shorts', name: 'Pantalones cortos de surf', isLeaf: true },
                { id: 'fashion-clothing-swimwear-one-piece', name: 'Trajes de baño de una pieza', isLeaf: true },
                { id: 'fashion-clothing-swimwear-surf-shirts', name: 'Camisetas de surf', isLeaf: true },
                { id: 'fashion-clothing-swimwear-bikini-top', name: 'Parte superior de traje de baño', isLeaf: true },
                { id: 'fashion-clothing-swimwear-swim-boxers', name: 'Bóxers para natación', isLeaf: true },
                { id: 'fashion-clothing-swimwear-swim-briefs', name: 'Calzoncillos de natación', isLeaf: true },
                { id: 'fashion-clothing-swimwear-burkinis', name: 'Burkinis', isLeaf: true },
                { id: 'fashion-clothing-swimwear-bikinis', name: 'Bikinis clásicos', isLeaf: true },
                { id: 'fashion-clothing-swimwear-robes', name: 'Batas', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-wedding', 
              name: 'Vestidos de novia y para el cortejo nupcial',
              isLeaf: true,
              children: []
            },
            { 
              id: 'fashion-clothing-ceremonial', 
              name: 'Trajes ceremoniales y tradicionales',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-ceremonial-kimonos', name: 'Kimonos', isLeaf: true },
                { id: 'fashion-clothing-ceremonial-saris', name: 'Saris', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-workwear', 
              name: 'Uniformes y ropa de trabajo',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-workwear-work-pants', name: 'Monos y pantalones de trabajo', isLeaf: true },
                { id: 'fashion-clothing-workwear-flight-suits', name: 'Monos de vuelo', isLeaf: true },
                { id: 'fashion-clothing-workwear-food-service', name: 'Uniformes de servicio de comida', isLeaf: true },
                { id: 'fashion-clothing-workwear-military', name: 'Uniformes militares', isLeaf: true },
                { id: 'fashion-clothing-workwear-school', name: 'Uniformes de colegio', isLeaf: true },
                { id: 'fashion-clothing-workwear-security', name: 'Uniformes de seguridad', isLeaf: true },
                { id: 'fashion-clothing-workwear-sports', name: 'Uniformes deportivos', isLeaf: true },
                { id: 'fashion-clothing-workwear-lab-coats', name: 'Batas blancas', isLeaf: true },
                { id: 'fashion-clothing-workwear-medical', name: 'Uniformes hospitalarios', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-underwear-boys', 
              name: 'Ropa interior para chicos',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-underwear-boys-thermal', name: 'Ropa interior térmica para niños', isLeaf: true },
                { id: 'fashion-clothing-underwear-boys-briefs', name: 'Calzoncillos para niños', isLeaf: true, children: [
                  { id: 'fashion-clothing-underwear-boys-briefs-boxer', name: 'Calzoncillos bóxer', isLeaf: true },
                  { id: 'fashion-clothing-underwear-boys-briefs-boxer-shorts', name: 'Pantalones cortos estilo bóxer', isLeaf: true },
                  { id: 'fashion-clothing-underwear-boys-briefs-classic', name: 'Calzoncillos', isLeaf: true },
                  { id: 'fashion-clothing-underwear-boys-briefs-mid', name: 'Calzoncillos intermedios', isLeaf: true },
                  { id: 'fashion-clothing-underwear-boys-briefs-trunks', name: 'Baúles', isLeaf: true }
                ]},
                { id: 'fashion-clothing-underwear-boys-undershirts', name: 'Camisetas interiores para niños', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-dresses', 
              name: 'Vestidos',
              isLeaf: true,
              children: []
            },
            { 
              id: 'fashion-clothing-underwear-girls', 
              name: 'Ropa interior para chicas',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-underwear-girls-thermal', name: 'Ropa interior térmica para niñas', isLeaf: true },
                { 
                  id: 'fashion-clothing-underwear-girls-panties', 
                  name: 'Calzones para niñas',
                  isLeaf: true,
                  children: [
                    { id: 'fashion-clothing-underwear-girls-panties-bikinis', name: 'Bikinis', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-boxer-briefs', name: 'Calzoncillos bóxer', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-shaping', name: 'Panty moldeador', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-briefs', name: 'Calzoncillos', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-hipster', name: 'Panties estilo hipster', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-regular', name: 'Panties', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-period', name: 'Ropa interior para menstruación', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-panties-thongs', name: 'Tangas', isLeaf: true }
                  ]
                },
                { 
                  id: 'fashion-clothing-underwear-girls-undershirts', 
                  name: 'Camisetas interiores para niñas',
                  isLeaf: true,
                  children: [
                    { id: 'fashion-clothing-underwear-girls-undershirts-first-bras', name: 'Primeros sujetadores', isLeaf: true },
                    { id: 'fashion-clothing-underwear-girls-undershirts-regular', name: 'Camisetas interiores', isLeaf: true }
                  ]
                }
              ]
            },
            { 
              id: 'fashion-clothing-lingerie', 
              name: 'Lencería',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-lingerie-bodysuits', name: 'Bodis', isLeaf: true },
                { id: 'fashion-clothing-lingerie-shapewear', name: 'Fajas reductoras', isLeaf: true },
                { id: 'fashion-clothing-lingerie-panties-women', name: 'Calzones para mujeres', isLeaf: true },
                { id: 'fashion-clothing-lingerie-undershirts-women', name: 'Camisetas interiores para mujeres', isLeaf: true },
                { id: 'fashion-clothing-lingerie-briefs-women', name: 'Bragas de ropa interior de mujer', isLeaf: true },
                { id: 'fashion-clothing-lingerie-bra-accessories', name: 'Accesorios para sujetadores', isLeaf: true },
                { id: 'fashion-clothing-lingerie-bras', name: 'Sujetadores', isLeaf: true },
                { id: 'fashion-clothing-lingerie-camisoles', name: 'Camisolas', isLeaf: true },
                { id: 'fashion-clothing-lingerie-stockings', name: 'Medias', isLeaf: true },
                { id: 'fashion-clothing-lingerie-garters', name: 'Suspensorios', isLeaf: true },
                { id: 'fashion-clothing-lingerie-accessories', name: 'Accesorios de lencería', isLeaf: true },
                { id: 'fashion-clothing-lingerie-slips', name: 'Enaguas y pololos', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-maternity', 
              name: 'Ropa de maternidad',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-maternity-nursing-bras', name: 'Sujetadores de lactancia', isLeaf: true },
                { id: 'fashion-clothing-maternity-dresses', name: 'Vestidos de maternidad', isLeaf: true },
                { id: 'fashion-clothing-maternity-jumpsuits', name: 'Monos de maternidad', isLeaf: true },
                { id: 'fashion-clothing-maternity-pants', name: 'Pantalones de maternidad', isLeaf: true },
                { id: 'fashion-clothing-maternity-skirts', name: 'Faldas de maternidad', isLeaf: true },
                { id: 'fashion-clothing-maternity-sleepwear', name: 'Ropa de dormir de maternidad', isLeaf: true },
                { id: 'fashion-clothing-maternity-swimwear', name: 'Traje de baño de maternidad', isLeaf: true },
                { id: 'fashion-clothing-maternity-tops', name: 'Tops de maternidad', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-underwear-men', 
              name: 'Ropa interior de caballero',
              isLeaf: true,
              children: [
                { id: 'fashion-clothing-underwear-men-thermal', name: 'Ropa interior térmica para hombres', isLeaf: true },
                { id: 'fashion-clothing-underwear-men-undershirts', name: 'Camisetas interiores de hombre', isLeaf: true },
                { id: 'fashion-clothing-underwear-men-underwear', name: 'Ropa interior de hombre', isLeaf: true }
              ]
            },
            { 
              id: 'fashion-clothing-onepiece', 
              name: 'Ropa de una pieza',
              isLeaf: true,
              children: []
            }
          ]
        },
        { 
          id: 'fashion-complements', 
          name: 'Complementos',
          isLeaf: true,
          children: []
        },
        { 
          id: 'fashion-costumes', 
          name: 'Disfraces y accesorios',
          isLeaf: true,
          children: []
        },
        { 
          id: 'fashion-bag-accessories', 
          name: 'Accesorios para bolsos y billeteras',
          isLeaf: true,
          children: []
        },
        { 
          id: 'fashion-bags-wallets', 
          name: 'Bolsos, billeteras y estuches',
          isLeaf: true,
          children: []
        },
        { 
          id: 'fashion-jewelry', 
          name: 'Joyería',
          isLeaf: true,
          children: []
        },
        { 
          id: 'fashion-shoe-accessories', 
          name: 'Accesorios para zapatos',
          isLeaf: true,
          children: []
        },
        { 
          id: 'fashion-shoes', 
          name: 'Calzado',
          children: [
            { id: 'fashion-shoes-sneakers', name: 'Zapatillas', isLeaf: true },
            { id: 'fashion-shoes-boots', name: 'Botas', isLeaf: true },
            { id: 'fashion-shoes-sandals', name: 'Sandalias', isLeaf: true }
          ]
        }
      ]
    },
    { 
      id: 'electronics', 
      name: 'Tecnología',
      isLeaf: true,
      children: [
        { 
          id: 'electronics-phones', 
          name: 'Teléfonos y comunicación',
          isLeaf: true,
          children: [
            { id: 'electronics-phones-smartphones', name: 'Smartphones', isLeaf: true },
            { id: 'electronics-phones-accessories', name: 'Accesorios para teléfonos', isLeaf: true },
            { id: 'electronics-phones-landline', name: 'Teléfonos fijos', isLeaf: true },
            { id: 'electronics-phones-walkie-talkies', name: 'Walkie-talkies', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-computers', 
          name: 'Computadoras y accesorios',
          isLeaf: true,
          children: [
            { id: 'electronics-computers-laptops', name: 'Laptops', isLeaf: true },
            { id: 'electronics-computers-desktop', name: 'Computadoras de escritorio', isLeaf: true },
            { id: 'electronics-computers-tablets', name: 'Tablets', isLeaf: true },
            { id: 'electronics-computers-accessories', name: 'Accesorios para computadora', isLeaf: true },
            { id: 'electronics-computers-components', name: 'Componentes de PC', isLeaf: true },
            { id: 'electronics-computers-monitors', name: 'Monitores', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-audio', 
          name: 'Audio y sonido',
          isLeaf: true,
          children: [
            { id: 'electronics-audio-headphones', name: 'Audífonos', isLeaf: true },
            { id: 'electronics-audio-speakers', name: 'Altavoces', isLeaf: true },
            { id: 'electronics-audio-soundbars', name: 'Barras de sonido', isLeaf: true },
            { id: 'electronics-audio-microphones', name: 'Micrófonos', isLeaf: true },
            { id: 'electronics-audio-home-audio', name: 'Sistemas de audio para hogar', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-tv-video', 
          name: 'TV y video',
          isLeaf: true,
          children: [
            { id: 'electronics-tv-smart-tv', name: 'Smart TV', isLeaf: true },
            { id: 'electronics-tv-streaming', name: 'Dispositivos de streaming', isLeaf: true },
            { id: 'electronics-tv-projectors', name: 'Proyectores', isLeaf: true },
            { id: 'electronics-tv-accessories', name: 'Accesorios para TV', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-gaming', 
          name: 'Gaming y videojuegos',
          isLeaf: true,
          children: [
            { id: 'electronics-gaming-consoles', name: 'Consolas', isLeaf: true },
            { id: 'electronics-gaming-controllers', name: 'Controles', isLeaf: true },
            { id: 'electronics-gaming-accessories', name: 'Accesorios gaming', isLeaf: true },
            { id: 'electronics-gaming-pc-gaming', name: 'PC Gaming', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-cameras', 
          name: 'Cámaras y fotografía',
          isLeaf: true,
          children: [
            { id: 'electronics-cameras-digital', name: 'Cámaras digitales', isLeaf: true },
            { id: 'electronics-cameras-action', name: 'Cámaras de acción', isLeaf: true },
            { id: 'electronics-cameras-security', name: 'Cámaras de seguridad', isLeaf: true },
            { id: 'electronics-cameras-accessories', name: 'Accesorios para cámaras', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-wearables', 
          name: 'Dispositivos wearables',
          isLeaf: true,
          children: [
            { id: 'electronics-wearables-smartwatches', name: 'Smartwatches', isLeaf: true },
            { id: 'electronics-wearables-fitness', name: 'Rastreadores de fitness', isLeaf: true },
            { id: 'electronics-wearables-vr', name: 'Realidad virtual', isLeaf: true }
          ]
        },
        { 
          id: 'electronics-smart-home', 
          name: 'Hogar inteligente',
          isLeaf: true,
          children: [
            { id: 'electronics-smart-home-assistants', name: 'Asistentes inteligentes', isLeaf: true },
            { id: 'electronics-smart-home-security', name: 'Seguridad del hogar', isLeaf: true },
            { id: 'electronics-smart-home-lighting', name: 'Iluminación inteligente', isLeaf: true },
            { id: 'electronics-smart-home-climate', name: 'Control de clima', isLeaf: true }
          ]
        }
      ]
    },
    { 
      id: 'home-garden', 
      name: 'Hogar y decoración',
      isLeaf: true,
      children: [
        { 
          id: 'home-furniture', 
          name: 'Muebles',
          isLeaf: true,
          children: [
            { id: 'home-furniture-living-room', name: 'Sala de estar', isLeaf: true },
            { id: 'home-furniture-bedroom', name: 'Dormitorio', isLeaf: true },
            { id: 'home-furniture-dining', name: 'Comedor', isLeaf: true },
            { id: 'home-furniture-office', name: 'Oficina', isLeaf: true },
            { id: 'home-furniture-storage', name: 'Almacenamiento', isLeaf: true },
            { id: 'home-furniture-outdoor', name: 'Muebles de exterior', isLeaf: true }
          ]
        },
        { 
          id: 'home-decor', 
          name: 'Decoración',
          isLeaf: true,
          children: [
            { id: 'home-decor-wall-art', name: 'Arte de pared', isLeaf: true },
            { id: 'home-decor-lighting', name: 'Iluminación decorativa', isLeaf: true },
            { id: 'home-decor-mirrors', name: 'Espejos', isLeaf: true },
            { id: 'home-decor-vases', name: 'Jarrones y floreros', isLeaf: true },
            { id: 'home-decor-candles', name: 'Velas y aromaterapia', isLeaf: true },
            { id: 'home-decor-cushions', name: 'Cojines y textiles', isLeaf: true }
          ]
        },
        { 
          id: 'home-kitchen', 
          name: 'Cocina y comedor',
          isLeaf: true,
          children: [
            { id: 'home-kitchen-appliances', name: 'Electrodomésticos', isLeaf: true },
            { id: 'home-kitchen-cookware', name: 'Utensilios de cocina', isLeaf: true },
            { id: 'home-kitchen-tableware', name: 'Vajilla y cristalería', isLeaf: true },
            { id: 'home-kitchen-storage', name: 'Almacenamiento de cocina', isLeaf: true }
          ]
        },
        { 
          id: 'home-bathroom', 
          name: 'Baño',
          isLeaf: true,
          children: [
            { id: 'home-bathroom-accessories', name: 'Accesorios de baño', isLeaf: true },
            { id: 'home-bathroom-towels', name: 'Toallas y textiles', isLeaf: true },
            { id: 'home-bathroom-storage', name: 'Almacenamiento', isLeaf: true },
            { id: 'home-bathroom-fixtures', name: 'Grifería y accesorios', isLeaf: true }
          ]
        },
        { 
          id: 'home-bedding', 
          name: 'Ropa de cama',
          isLeaf: true,
          children: [
            { id: 'home-bedding-sheets', name: 'Sábanas', isLeaf: true },
            { id: 'home-bedding-comforters', name: 'Edredones y cobertores', isLeaf: true },
            { id: 'home-bedding-pillows', name: 'Almohadas', isLeaf: true },
            { id: 'home-bedding-blankets', name: 'Mantas', isLeaf: true }
          ]
        },
        { 
          id: 'home-garden', 
          name: 'Jardín y exterior',
          isLeaf: true,
          children: [
            { id: 'home-garden-plants', name: 'Plantas y macetas', isLeaf: true },
            { id: 'home-garden-tools', name: 'Herramientas de jardín', isLeaf: true },
            { id: 'home-garden-outdoor-decor', name: 'Decoración exterior', isLeaf: true },
            { id: 'home-garden-irrigation', name: 'Riego y cuidado', isLeaf: true }
          ]
        },
        { 
          id: 'home-cleaning', 
          name: 'Limpieza y organización',
          isLeaf: true,
          children: [
            { id: 'home-cleaning-supplies', name: 'Productos de limpieza', isLeaf: true },
            { id: 'home-cleaning-tools', name: 'Herramientas de limpieza', isLeaf: true },
            { id: 'home-cleaning-organization', name: 'Organización', isLeaf: true }
          ]
        }
      ]
    },
    { 
      id: 'health-beauty', 
      name: 'Salud y belleza',
      isLeaf: true,
      children: []
    },
    { 
      id: 'babies-kids', 
      name: 'Bebés y niños pequeños',
      isLeaf: true,
      children: []
    },
    { 
      id: 'toys-games', 
      name: 'Juguetes y juegos',
      isLeaf: true,
      children: []
    },
    { 
      id: 'food-beverages', 
      name: 'Alimentos y bebidas',
      children: [
        { 
          id: 'food-snacks', 
          name: 'Snacks y golosinas',
          children: [
            { id: 'food-snacks-chips', name: 'Papas fritas', isLeaf: true },
            { id: 'food-snacks-candy', name: 'Dulces y caramelos', isLeaf: true },
            { id: 'food-snacks-nuts', name: 'Frutos secos', isLeaf: true }
          ]
        },
        { 
          id: 'food-beverages-drinks', 
          name: 'Bebidas',
          children: [
            { id: 'food-beverages-soft', name: 'Bebidas gaseosas', isLeaf: true },
            { id: 'food-beverages-juice', name: 'Jugos naturales', isLeaf: true },
            { id: 'food-beverages-coffee', name: 'Café y té', isLeaf: true }
          ]
        }
      ]
    },
    { 
      id: 'pets', 
      name: 'Productos para mascotas',
      isLeaf: true,
      children: [
        { 
          id: 'pets-dogs', 
          name: 'Perros',
          isLeaf: true,
          children: [
            { id: 'pets-dogs-food', name: 'Comida para perros', isLeaf: true },
            { id: 'pets-dogs-treats', name: 'Premios y snacks', isLeaf: true },
            { id: 'pets-dogs-toys', name: 'Juguetes para perros', isLeaf: true },
            { id: 'pets-dogs-accessories', name: 'Accesorios para perros', isLeaf: true },
            { id: 'pets-dogs-grooming', name: 'Cuidado e higiene', isLeaf: true },
            { id: 'pets-dogs-health', name: 'Salud y bienestar', isLeaf: true },
            { id: 'pets-dogs-training', name: 'Entrenamiento', isLeaf: true }
          ]
        },
        { 
          id: 'pets-cats', 
          name: 'Gatos',
          isLeaf: true,
          children: [
            { id: 'pets-cats-food', name: 'Comida para gatos', isLeaf: true },
            { id: 'pets-cats-treats', name: 'Premios y snacks', isLeaf: true },
            { id: 'pets-cats-toys', name: 'Juguetes para gatos', isLeaf: true },
            { id: 'pets-cats-accessories', name: 'Accesorios para gatos', isLeaf: true },
            { id: 'pets-cats-grooming', name: 'Cuidado e higiene', isLeaf: true },
            { id: 'pets-cats-health', name: 'Salud y bienestar', isLeaf: true },
            { id: 'pets-cats-litter', name: 'Arena y bandejas', isLeaf: true }
          ]
        },
        { 
          id: 'pets-birds', 
          name: 'Aves',
          isLeaf: true,
          children: [
            { id: 'pets-birds-food', name: 'Comida para aves', isLeaf: true },
            { id: 'pets-birds-cages', name: 'Jaulas y accesorios', isLeaf: true },
            { id: 'pets-birds-toys', name: 'Juguetes para aves', isLeaf: true },
            { id: 'pets-birds-health', name: 'Salud y bienestar', isLeaf: true }
          ]
        },
        { 
          id: 'pets-fish', 
          name: 'Peces',
          isLeaf: true,
          children: [
            { id: 'pets-fish-food', name: 'Comida para peces', isLeaf: true },
            { id: 'pets-fish-aquariums', name: 'Acuarios y decoración', isLeaf: true },
            { id: 'pets-fish-equipment', name: 'Equipos y filtros', isLeaf: true },
            { id: 'pets-fish-care', name: 'Cuidado del agua', isLeaf: true }
          ]
        },
        { 
          id: 'pets-small-animals', 
          name: 'Animales pequeños',
          isLeaf: true,
          children: [
            { id: 'pets-small-food', name: 'Comida para roedores', isLeaf: true },
            { id: 'pets-small-cages', name: 'Jaulas y hábitats', isLeaf: true },
            { id: 'pets-small-toys', name: 'Juguetes y enriquecimiento', isLeaf: true },
            { id: 'pets-small-bedding', name: 'Camas y sustratos', isLeaf: true }
          ]
        },
        { 
          id: 'pets-reptiles', 
          name: 'Reptiles',
          isLeaf: true,
          children: [
            { id: 'pets-reptiles-food', name: 'Comida para reptiles', isLeaf: true },
            { id: 'pets-reptiles-terrariums', name: 'Terrarios y decoración', isLeaf: true },
            { id: 'pets-reptiles-heating', name: 'Calefacción e iluminación', isLeaf: true },
            { id: 'pets-reptiles-substrate', name: 'Sustratos y camas', isLeaf: true }
          ]
        }
      ]
    },
    { 
      id: 'sports-outdoors', 
      name: 'Deportes y aire libre',
      isLeaf: true,
      children: []
    },
]

// Metacampos por categoría
export const META_FIELDS_BY_CATEGORY: Record<string, MetaField[]> = {
  // Ropa y accesorios (categoría principal)
  'fashion': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Marrón', 'Beige'] },
    { id: 'size', name: 'Talla/Tamaño', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'category_type', name: 'Tipo de producto', type: 'select', options: ['Ropa', 'Calzado', 'Accesorios', 'Joyería', 'Bolsos'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Deportivo', 'Fiesta', 'Trabajo', 'Playa'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] }
  ],
  // Prendas de vestir (categoría muy general)
  'fashion-clothing': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Marrón', 'Beige', 'Amarillo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Casual', 'Deportivo', 'Formal', 'Elegante', 'Vintage', 'Moderno'] },
    { id: 'material', name: 'Material principal', type: 'select', options: ['Algodón', 'Poliéster', 'Lino', 'Seda', 'Lana', 'Mezclilla', 'Cuero'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Solo lavado en seco', 'Planchar', 'No planchar', 'Secado al aire'] }
  ],
  // Ropa deportiva (categoría general)
  'fashion-clothing-sportswear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Morado', 'Amarillo', 'Naranja'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Fitness', 'Yoga', 'CrossFit', 'Ciclismo', 'Natación', 'Danza', 'Boxeo', 'Pilates', 'Outdoor'] },
    { id: 'waist_height', name: 'Altura de cintura', type: 'select', options: ['Cintura baja', 'Cintura media', 'Cintura alta', 'Cintura extra alta'] },
    { id: 'target_gender', name: 'Sexo objetivo', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'garment_length', name: 'Tipo de largo de los pantalones', type: 'select', options: ['Cortos', 'Capri', '7/8', 'Largos', 'Extra largos'] },
    { id: 'fabric', name: 'Tejido', type: 'tags', options: ['Algodón', 'Poliéster', 'Spandex', 'Lycra', 'Nylon', 'Dri-FIT', 'Mesh', 'Fleece'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'sportswear_features', name: 'Características de la ropa deportiva', type: 'tags', options: ['Transpirable', 'Secado rápido', 'Anti-odor', 'Compresión', 'Reflectivos', 'Bolsillos', 'Sin costuras', 'Antibacterial'] }
  ],
  // Pantalones deportivos (categoría intermedia)
  'fashion-clothing-sportswear-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rosa', 'Morado', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Cortos', 'Capri', '7/8', 'Largos', 'Extra largos'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Compresión'] },
    { id: 'waist', name: 'Altura de cintura', type: 'select', options: ['Cintura baja', 'Cintura media', 'Cintura alta'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Yoga', 'Fitness', 'CrossFit', 'Casual'] }
  ],
  // Tops deportivos (categoría intermedia)
  'fashion-clothing-sportswear-tops': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto', 'Escote cruzado'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Yoga', 'Fitness', 'Entrenamiento', 'Casual'] }
  ],
  // Tops cortos (categoría específica)
  'fashion-clothing-sportswear-tops-short-category': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Spandex', 'Mezcla'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Crop', 'Oversize'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Fitness', 'Yoga', 'Casual', 'Playa'] }
  ],
  // Tank tops
  'fashion-clothing-sportswear-tops-tank': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Modal', 'Bambú'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Espalda cruzada', 'Halter'] },
    { id: 'support', name: 'Soporte', type: 'select', options: ['Sin soporte', 'Soporte ligero', 'Con sujetador integrado'] }
  ],
  // Crop tops
  'fashion-clothing-sportswear-tops-crop': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Verde', 'Rosa', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Spandex', 'Lycra', 'Algodón-spandex', 'Poliéster'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Yoga', 'Pilates', 'Danza', 'Fitness', 'Casual'] }
  ],
  // Polos deportivos
  'fashion-clothing-sportswear-tops-polo': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul marino', 'Gris', 'Verde', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Piqué algodón', 'Dri-FIT', 'Poliéster', 'Mezcla técnica'] },
    { id: 'collar_style', name: 'Estilo de cuello', type: 'select', options: ['Cuello clásico', 'Cuello alto', 'Cuello moderno'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Golf', 'Tenis', 'Casual', 'Trabajo', 'Oficina'] }
  ],
  // Camisetas de manga corta
  'fashion-clothing-sportswear-tops-short-sleeve': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Rosa', 'Gris'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Spandex', 'Mezcla'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex'] }
  ],
  // Camisetas sin mangas
  'fashion-clothing-sportswear-tops-short-sleeveless': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Verde', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Dri-FIT'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex'] }
  ],
  // Tops largos
  'fashion-clothing-sportswear-tops-long': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Verde', 'Rosa', 'Gris'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Spandex', 'Mezcla'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex'] }
  ],
  // Pantalones para correr
  'fashion-clothing-sportswear-pants-running': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Dri-FIT', 'Poliéster', 'Spandex', 'Mezcla técnica'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Reflectivos', 'Bolsillos', 'Transpirable', 'Secado rápido', 'Compresión'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Largos', '7/8', 'Tobilleros'] }
  ],
  // Leggings deportivos
  'fashion-clothing-sportswear-pants-leggings': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rosa', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Spandex', 'Poliéster', 'Lycra', 'Nylon'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Tobilleros', '7/8', 'Largos', 'Capri'] },
    { id: 'compression', name: 'Nivel de compresión', type: 'select', options: ['Sin compresión', 'Ligera', 'Media', 'Alta'] }
  ],
  // Pantalones cortos
  'fashion-clothing-sportswear-pants-shorts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rosa', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Algodón', 'Dri-FIT', 'Mezcla'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Muy cortos', 'Cortos', 'Medianos', 'Bermudas'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Elástico', 'Cordón', 'Transpirable'] }
  ],
  // Pantalones de franela
  'fashion-clothing-sportswear-pants-flannel': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Gris', 'Negro', 'Azul marino', 'Beige', 'Verde militar'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Franela de algodón', 'Mezcla algodón-poliéster', 'French terry'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Relaxed'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Cordón', 'Puños elásticos', 'Cálido'] }
  ],
  // Mallas
  'fashion-clothing-sportswear-pants-tights': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rosa', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Spandex', 'Nylon-elastano', 'Poliéster-elastano'] },
    { id: 'compression', name: 'Compresión', type: 'select', options: ['Ligera', 'Media', 'Alta', 'Graduada'] },
    { id: 'thickness', name: 'Grosor', type: 'select', options: ['Ultra finas', 'Finas', 'Medianas', 'Gruesas'] }
  ],
  // Pantalones de chándal
  'fashion-clothing-sportswear-pants-tracksuit': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Algodón', 'French terry', 'Tricot'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Moderno', 'Retro', 'Slim fit'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Rayas laterales', 'Bolsillos', 'Puños elásticos', 'Cordón'] }
  ],
  // Pantalones para entrenamientos
  'fashion-clothing-sportswear-pants-training': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Dri-FIT', 'Climacool', 'Poliéster técnico', 'Spandex'] },
    { id: 'training_type', name: 'Tipo de entrenamiento', type: 'tags', options: ['CrossFit', 'Funcional', 'Pesas', 'Cardio', 'HIIT'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Flexibilidad', 'Transpirable', 'Secado rápido', 'Anti-odor'] }
  ],
  // Pantalones cortavientos
  'fashion-clothing-sportswear-pants-windbreaker': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Poliéster ripstop', 'Microfibra', 'DWR coating'] },
    { id: 'weather_protection', name: 'Protección climática', type: 'tags', options: ['Cortavientos', 'Repelente al agua', 'Transpirable', 'Ligero'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Reflectivos', 'Bolsillos con cierre', 'Puños ajustables', 'Cintura elástica'] }
  ],
  // Pantalones de boxeo (categoría general)
  'fashion-clothing-sportswear-boxing': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Blanco', 'Dorado', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Satén', 'Poliéster', 'Nylon', 'Seda', 'Microfibra'] },
    { id: 'boxing_type', name: 'Tipo de boxeo', type: 'select', options: ['Pantalones largos', 'Shorts', 'Muay Thai', 'Kick boxing', 'Tradicional'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Clásicos', 'Con bordados', 'Personalizados', 'Profesional', 'Amateur'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Cintura elástica', 'Cordón', 'Bolsillos', 'Transpirable', 'Ligero'] }
  ],
  // Pantalones de boxeo
  'fashion-clothing-sportswear-boxing-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Blanco', 'Dorado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Satén', 'Poliéster', 'Nylon', 'Seda'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásicos', 'Largos', 'Con bordados', 'Personalizados'] }
  ],
  // Shorts de boxeo
  'fashion-clothing-sportswear-boxing-shorts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Blanco', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Satén', 'Poliéster', 'Microfibra'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Cortos', 'Medianos', 'Largos'] }
  ],
  // Vestidos, faldas y trajes de baile (categoría general)
  'fashion-clothing-sportswear-dance': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rojo', 'Azul', 'Rosa', 'Morado', 'Dorado', 'Plateado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'dance_type', name: 'Tipo de baile', type: 'tags', options: ['Ballet', 'Danza moderna', 'Salsa', 'Tango', 'Flamenco', 'Jazz', 'Hip hop'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Lycra', 'Algodón', 'Chiffon', 'Tul', 'Satén', 'Malla'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Vestidos', 'Faldas', 'Trajes completos', 'Túnicas', 'Maillots'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Clásico', 'Moderno', 'Romántico', 'Dramático', 'Contemporáneo'] }
  ],
  // Vestidos de baile
  'fashion-clothing-sportswear-dance-dresses': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Rosa', 'Blanco', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'dance_style', name: 'Estilo de baile', type: 'select', options: ['Latino', 'Estándar', 'Salsa', 'Tango', 'Ballet'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Midi', 'Largo', 'Asimétrico'] }
  ],
  // Faldas de baile
  'fashion-clothing-sportswear-dance-skirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Rosa', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'dance_style', name: 'Estilo de baile', type: 'select', options: ['Latino', 'Flamenco', 'Ballet', 'Jazz'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Mini', 'Corta', 'Midi', 'Larga'] }
  ],
  // Trajes de baile
  'fashion-clothing-sportswear-dance-suits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Blanco', 'Dorado', 'Plateado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'dance_style', name: 'Estilo de baile', type: 'select', options: ['Latino', 'Estándar', 'Tango', 'Competición'] },
    { id: 'pieces', name: 'Piezas', type: 'select', options: ['2 piezas', '3 piezas', 'Conjunto completo'] }
  ],
  // Sujetadores deportivos (categoría general)
  'fashion-clothing-sportswear-bras': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Rosa', 'Azul', 'Verde', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'support_level', name: 'Nivel de soporte', type: 'select', options: ['Bajo', 'Medio', 'Alto', 'Máximo'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Yoga', 'Pilates', 'Running', 'Fitness', 'CrossFit', 'Danza'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Sin aros', 'Con aros', 'Deportivo básico', 'Cruzado', 'Racerback'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Sin costuras', 'Acolchado', 'Removible', 'Ajustable'] }
  ],
  // Sujetadores de soporte bajo
  'fashion-clothing-sportswear-bras-low': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Rosa', 'Azul'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'activity', name: 'Actividad', type: 'select', options: ['Yoga', 'Pilates', 'Caminar', 'Stretching'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Sin aros', 'Deportivo básico', 'Cómodo'] }
  ],
  // Sujetadores de soporte medio
  'fashion-clothing-sportswear-bras-medium': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Rosa', 'Azul', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'activity', name: 'Actividad', type: 'select', options: ['Fitness', 'Ciclismo', 'Danza', 'Entrenamiento ligero'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Con aros', 'Cruzado', 'Deportivo reforzado'] }
  ],
  // Sujetadores de soporte alto
  'fashion-clothing-sportswear-bras-high': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Rosa', 'Azul'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'activity', name: 'Actividad', type: 'select', options: ['Running', 'CrossFit', 'HIIT', 'Deportes de impacto'] },
    { id: 'support', name: 'Nivel de soporte', type: 'select', options: ['Alto', 'Máximo', 'Ultra soporte'] }
  ],
  // Sudaderas para deporte y sudaderas con capucha (categoría general)
  'fashion-clothing-sportswear-hoodies': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Verde', 'Rojo', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Algodón', 'Poliéster', 'Fleece', 'French terry', 'Mezcla'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Con capucha', 'Sin capucha', 'Con cierre', 'Pullover'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Casual', 'Deportivo', 'Running', 'Fitness', 'Outdoor'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Transpirable', 'Cálido', 'Ligero', 'Capucha ajustable'] }
  ],
  // Sudaderas con capucha
  'fashion-clothing-sportswear-hoodies-pullover': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Verde', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Mezcla algodón-poliéster', 'Fleece'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Regular', 'Oversize', 'Ajustado', 'Relaxed'] },
    { id: 'hood_features', name: 'Características de capucha', type: 'tags', options: ['Cordón ajustable', 'Forro polar', 'Capucha grande', 'Capucha deportiva'] }
  ],
  // Sudaderas (general)
  'fashion-clothing-sportswear-sweatshirts-general': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Verde', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'French terry', 'Fleece', 'Poliéster', 'Mezcla'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Regular', 'Oversize', 'Slim fit', 'Relaxed'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Básica', 'Vintage', 'Moderna', 'Minimalista'] },
    { id: 'activity', name: 'Uso', type: 'tags', options: ['Casual', 'Deportivo', 'Casa', 'Trabajo', 'Universidad'] }
  ],
  // Sudaderas con cierre
  'fashion-clothing-sportswear-hoodies-zip': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Mezcla', 'Tech fleece'] },
    { id: 'zipper', name: 'Tipo de cierre', type: 'select', options: ['Cierre completo', 'Medio cierre', 'Doble cierre'] }
  ],
  // Ropa interior térmica para hombres
  'fashion-clothing-underwear-men-thermal': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón térmico', 'Poliéster térmico', 'Lana merino', 'Microfibra térmica', 'Mezcla térmica'] },
    { id: 'thermal_level', name: 'Nivel térmico', type: 'select', options: ['Ligero', 'Medio', 'Alto', 'Extra cálido'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Camiseta térmica', 'Pantalón térmico', 'Conjunto completo', 'Camiseta manga larga'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Compresión', 'Segunda piel'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Anti-odor', 'Secado rápido', 'Antibacterial', 'Sin costuras'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Deportes de invierno', 'Uso diario', 'Trabajo exterior', 'Montañismo', 'Esquí'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Otoño-Invierno', 'Invierno', 'Todo el año'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Secado rápido', 'No usar suavizante', 'Lavado en frío'] }
  ],
  // Camisetas interiores de hombre
  'fashion-clothing-underwear-men-undershirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Gris', 'Beige', 'Azul marino'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón peinado', 'Modal', 'Microfibra', 'Mezcla de algodón'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásica', 'Sin costuras', 'Ajustada', 'Regular fit', 'Compresión'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Anti-sudor', 'Sin costuras', 'Extra suave', 'Control de olor'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Uso diario', 'Formal', 'Deportivo', 'Trabajo', 'Casual'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'No usar blanqueador', 'Secado rápido', 'Planchar a baja temperatura'] }
  ],
  // Ropa interior de hombre
  'fashion-clothing-underwear-men-underwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul marino', 'Rojo', 'Estampado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Modal', 'Microfibra', 'Bambú', 'Mezcla de algodón-elastano'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Bóxer', 'Brief', 'Bóxer brief', 'Slip', 'Trunk'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Regular', 'Ajustado', 'Holgado', 'Deportivo'] },
    { id: 'waistband', name: 'Tipo de cinturilla', type: 'select', options: ['Elástica clásica', 'Comfort flex', 'Sin costuras', 'Logo band'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Anti-bacteriano', 'Control de humedad', 'Sin costuras', 'Soporte'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Uso diario', 'Deportivo', 'Formal', 'Casual'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Lavado en frío', 'No usar secadora', 'Mantiene forma'] }
  ],
  // Sudaderas sin capucha
  'fashion-clothing-sportswear-sweatshirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'French terry', 'Fleece', 'Mezcla'] },
    { id: 'neck', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Mock neck'] }
  ],
  // Chaquetas deportivas
  'fashion-clothing-sportswear-hoodies-sports-jackets': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster técnico', 'Softshell', 'Nylon', 'Fleece', 'Microfibra'] },
    { id: 'jacket_type', name: 'Tipo de chaqueta', type: 'select', options: ['Track jacket', 'Bomber', 'Windbreaker', 'Softshell', 'Varsity'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Cierre completo', 'Medio cierre', 'Botones', 'Sin cierre'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Impermeable', 'Transpirable', 'Bolsillos', 'Reflectivos', 'Capucha desmontable', 'Cortavientos'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Ciclismo', 'Outdoor', 'Fitness', 'Casual', 'Entrenamiento'] }
  ],
  // Chalecos y chaquetas deportivas (categoría principal)
  'fashion-clothing-sportswear-jackets': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rojo', 'Blanco', 'Amarillo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Poliéster', 'Nylon', 'Fleece', 'Softshell', 'Down', 'Microfibra'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Chaleco', 'Chaqueta ligera', 'Chaqueta pesada', 'Cortavientos', 'Impermeable'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Ciclismo', 'Outdoor', 'Fitness', 'Casual', 'Montañismo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Impermeable', 'Cortavientos', 'Reflectivos', 'Bolsillos', 'Capucha'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] }
  ],
  // Chalecos (general)
  'fashion-clothing-sportswear-jackets-vests-general': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Nylon', 'Down', 'Fleece', 'Softshell', 'Algodón'] },
    { id: 'vest_type', name: 'Tipo de chaleco', type: 'select', options: ['Deportivo', 'Acolchado', 'Polar', 'Cortavientos', 'Térmico'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Ciclismo', 'Outdoor', 'Casual', 'Trabajo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Reflectivos', 'Transpirable', 'Ligero', 'Cálido'] }
  ],
  // Chaquetas (general)
  'fashion-clothing-sportswear-jackets-general': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster técnico', 'Nylon', 'Softshell', 'Fleece', 'Microfibra', 'Impermeable'] },
    { id: 'jacket_style', name: 'Estilo de chaqueta', type: 'select', options: ['Deportiva', 'Casual', 'Técnica', 'Urban', 'Outdoor'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Cierre completo', 'Medio cierre', 'Botones', 'Velcro'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Fitness', 'Ciclismo', 'Outdoor', 'Casual', 'Entrenamiento'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Capucha', 'Impermeable', 'Transpirable', 'Bolsillos', 'Reflectivos', 'Ajustable'] }
  ],
  // Chalecos deportivos
  'fashion-clothing-sportswear-jackets-vests': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Blanco', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Nylon', 'Down', 'Fleece'] },
    { id: 'activity', name: 'Actividad', type: 'select', options: ['Running', 'Ciclismo', 'Outdoor', 'Casual'] }
  ],
  // Chaquetas cortavientos
  'fashion-clothing-sportswear-jackets-windbreaker': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Poliéster', 'Ripstop', 'DWR coating'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Impermeable', 'Transpirable', 'Capucha', 'Reflectivos'] }
  ],
  // Chaquetas de entrenamiento
  'fashion-clothing-sportswear-jackets-training': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul', 'Verde', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Spandex', 'Dri-FIT', 'Mezcla técnica'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Cierre completo', 'Medio cierre', 'Sin cierre'] }
  ],
  // Leotardos y unitardos (categoría general)
  'fashion-clothing-sportswear-leotards': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Rosa', 'Morado', 'Blanco', 'Gris', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Lycra', 'Spandex', 'Elastano', 'Nylon-spandex', 'Mezcla elástica'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Leotardo', 'Unitardo', 'Maillot', 'Body'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Gimnasia', 'Danza', 'Ballet', 'Yoga', 'Fitness', 'Natación sincronizada'] },
    { id: 'sleeve', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga', 'Manga 3/4'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Elástico', 'Transpirable', 'Ajustado', 'Cómodo', 'Duradero'] }
  ],
  // Leotardos de gimnasia
  'fashion-clothing-sportswear-leotards-gymnastics': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Rojo', 'Rosa', 'Morado', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Spandex', 'Elastano', 'Mezcla elástica'] },
    { id: 'sleeve', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] }
  ],
  // Leotardos de danza
  'fashion-clothing-sportswear-leotards-dance': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Rosa', 'Blanco', 'Azul', 'Burgundy'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Algodón-lycra', 'Microfibra', 'Spandex'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Cruzado', 'Con encaje', 'Básico'] }
  ],
  // Unitardos
  'fashion-clothing-sportswear-unitards': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Rosa', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Spandex', 'Nylon-spandex', 'Mezcla elástica'] },
    { id: 'length', name: 'Largo de pierna', type: 'select', options: ['Tobilleros', 'Largos', 'Capri', '7/8'] }
  ],
  // Zapatillas
  'fashion-shoes-sneakers': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Gris'] },
    { id: 'shoe_size', name: 'Talla', type: 'tags', options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Nike', 'Adidas', 'Puma', 'Converse', 'Vans'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño'] }
  ],
  // Botas
  'fashion-shoes-boots': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Marrón', 'Beige', 'Gris'] },
    { id: 'shoe_size', name: 'Talla', type: 'tags', options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Cuero', 'Gamuza', 'Sintético', 'Tela'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex'] }
  ],
  // Sandalias
  'fashion-shoes-sandals': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Marrón', 'Beige', 'Dorado', 'Plateado'] },
    { id: 'shoe_size', name: 'Talla', type: 'tags', options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Planas', 'Con tacón', 'Plataforma', 'Deportivas'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño'] }
  ],
  // ===================================================
  // TECNOLOGÍA - METADATOS COMPLETOS
  // ===================================================

  // Tecnología (categoría principal)
  'electronics': [
    { id: 'device_type', name: 'Tipo de dispositivo', type: 'select', options: ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Audio', 'TV', 'Gaming', 'Cámara', 'Wearable', 'Smart Home'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'condition', name: 'Condición', type: 'select', options: ['Nuevo', 'Reacondicionado', 'Usado - Como nuevo', 'Usado - Bueno', 'Usado - Aceptable'] },
    { id: 'warranty', name: 'Garantía', type: 'select', options: ['Sin garantía', '6 meses', '1 año', '2 años', '3 años', 'Garantía extendida'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Wi-Fi', 'Bluetooth', '5G', '4G', 'Ethernet', 'USB-C', 'Lightning', 'NFC'] },
    { id: 'power_source', name: 'Fuente de poder', type: 'select', options: ['Batería', 'Cable', 'Batería/Cable', 'Solar', 'USB'] }
  ],

  // Teléfonos y comunicación (categoría general)
  'electronics-phones': [
    { id: 'phone_type', name: 'Tipo de teléfono', type: 'select', options: ['Smartphone', 'Teléfono básico', 'Teléfono fijo', 'Walkie-talkie', 'Satélite'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'operating_system', name: 'Sistema operativo', type: 'select', options: ['Android', 'iOS', 'Windows', 'Otro', 'No aplica'] },
    { id: 'network', name: 'Red', type: 'tags', options: ['5G', '4G LTE', '3G', 'Wi-Fi', 'Bluetooth'] },
    { id: 'condition', name: 'Condición', type: 'select', options: ['Nuevo', 'Reacondicionado', 'Usado'] },
    { id: 'unlocked', name: 'Liberado', type: 'select', options: ['Sí', 'No', 'Carrier específico'] }
  ],

  // Smartphones
  'electronics-phones-smartphones': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Huawei', 'Motorola', 'Sony', 'Nokia', 'Realme', 'Oppo', 'Vivo', 'Otra'] },
    { id: 'operating_system', name: 'Sistema operativo', type: 'select', options: ['iOS', 'Android 14', 'Android 13', 'Android 12', 'Android 11', 'Otro'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'] },
    { id: 'ram', name: 'Memoria RAM', type: 'select', options: ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '18GB', '24GB'] },
    { id: 'screen_size', name: 'Tamaño de pantalla', type: 'select', options: ['Menos de 5"', '5.0"-5.4"', '5.5"-6.0"', '6.1"-6.5"', '6.6"-7.0"', 'Más de 7"'] },
    { id: 'screen_type', name: 'Tipo de pantalla', type: 'select', options: ['OLED', 'AMOLED', 'Super AMOLED', 'LCD', 'IPS', 'Retina', 'Dynamic AMOLED'] },
    { id: 'camera_mp', name: 'Cámara principal', type: 'select', options: ['Menos de 12MP', '12-20MP', '21-50MP', '51-100MP', 'Más de 100MP'] },
    { id: 'battery', name: 'Batería', type: 'select', options: ['Menos de 3000mAh', '3000-4000mAh', '4000-5000mAh', 'Más de 5000mAh'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Morado', 'Dorado', 'Plateado'] },
    { id: 'network', name: 'Red', type: 'tags', options: ['5G', '4G LTE', 'Wi-Fi 6', 'Wi-Fi 5', 'Bluetooth 5.0+', 'NFC'] },
    { id: 'condition', name: 'Condición', type: 'select', options: ['Nuevo', 'Reacondicionado', 'Usado - Excelente', 'Usado - Bueno'] },
    { id: 'unlocked', name: 'Liberado', type: 'select', options: ['Sí', 'No'] }
  ],

  // Accesorios para teléfonos
  'electronics-phones-accessories': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Funda/Case', 'Protector de pantalla', 'Cargador', 'Cable', 'Soporte', 'Audífonos', 'Power bank', 'Lente', 'Ring holder'] },
    { id: 'phone_compatibility', name: 'Compatible con', type: 'tags', options: ['iPhone 15', 'iPhone 14', 'iPhone 13', 'Samsung Galaxy S24', 'Samsung Galaxy S23', 'Google Pixel', 'Universal', 'Android', 'iOS'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Silicona', 'TPU', 'Plástico duro', 'Cuero', 'Metal', 'Vidrio templado', 'Fibra de carbono', 'Madera'] },
    { id: 'protection_level', name: 'Nivel de protección', type: 'select', options: ['Básica', 'Media', 'Alta', 'Militar/Extrema'] },
    { id: 'wireless', name: 'Inalámbrico', type: 'select', options: ['Sí', 'No'] },
    { id: 'fast_charging', name: 'Carga rápida', type: 'select', options: ['Sí', 'No'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Transparente', 'Blanco', 'Azul', 'Rosa', 'Rojo', 'Verde', 'Multicolor'] }
  ],

  // Teléfonos fijos
  'electronics-phones-landline': [
    { id: 'phone_type', name: 'Tipo', type: 'select', options: ['Teléfono básico', 'Teléfono con contestador', 'Teléfono inalámbrico', 'Sistema multi-handset', 'IP phone'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Identificador de llamadas', 'Contestador automático', 'Manos libres', 'Bluetooth', 'Pantalla LCD', 'Memoria de números'] },
    { id: 'range', name: 'Alcance', type: 'select', options: ['Hasta 50m', '50-100m', '100-300m', 'Más de 300m', 'No aplica'] },
    { id: 'handsets', name: 'Número de auriculares', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { id: 'power_source', name: 'Fuente de poder', type: 'select', options: ['Cable', 'Batería recargable', 'Pilas AA/AAA', 'Mixto'] }
  ],

  // Walkie-talkies
  'electronics-phones-walkie-talkies': [
    { id: 'range', name: 'Alcance', type: 'select', options: ['Hasta 1km', '1-5km', '5-10km', '10-20km', 'Más de 20km'] },
    { id: 'channels', name: 'Canales', type: 'select', options: ['8 canales', '16 canales', '22 canales', '50+ canales'] },
    { id: 'power_source', name: 'Fuente de poder', type: 'select', options: ['Batería recargable', 'Pilas AA', 'Ambos'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['VOX (manos libres)', 'Linterna', 'Resistente al agua', 'Clip de cinturón', 'Pantalla LCD', 'Alerta de emergencia'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Recreativo', 'Profesional', 'Emergencias', 'Outdoor', 'Construcción', 'Seguridad'] },
    { id: 'weather_resistant', name: 'Resistente al clima', type: 'select', options: ['Sí', 'No'] }
  ],

  // Computadoras y accesorios (categoría general)
  'electronics-computers': [
    { id: 'computer_type', name: 'Tipo de computadora', type: 'select', options: ['Laptop', 'Desktop', 'All-in-one', 'Mini PC', 'Tablet', 'Workstation'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'operating_system', name: 'Sistema operativo', type: 'select', options: ['Windows 11', 'Windows 10', 'macOS', 'Chrome OS', 'Linux', 'iPadOS', 'Android'] },
    { id: 'processor_brand', name: 'Marca del procesador', type: 'select', options: ['Intel', 'AMD', 'Apple Silicon', 'Qualcomm', 'MediaTek'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Oficina', 'Gaming', 'Diseño gráfico', 'Programación', 'Estudiante', 'Hogar', 'Empresarial', 'Creativos'] },
    { id: 'condition', name: 'Condición', type: 'select', options: ['Nuevo', 'Reacondicionado', 'Usado'] }
  ],

  // Laptops
  'electronics-computers-laptops': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Microsoft', 'Samsung', 'LG', 'Otra'] },
    { id: 'processor', name: 'Procesador', type: 'select', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3'] },
    { id: 'ram', name: 'Memoria RAM', type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD', '1TB HDD', '2TB HDD'] },
    { id: 'screen_size', name: 'Tamaño de pantalla', type: 'select', options: ['11"-12"', '13"-14"', '15"-16"', '17"-18"', 'Más de 18"'] },
    { id: 'graphics', name: 'Tarjeta gráfica', type: 'select', options: ['Integrada', 'NVIDIA GTX', 'NVIDIA RTX', 'AMD Radeon', 'Apple GPU', 'Intel Iris'] },
    { id: 'weight', name: 'Peso', type: 'select', options: ['Menos de 1kg', '1-1.5kg', '1.5-2kg', '2-2.5kg', 'Más de 2.5kg'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Oficina', 'Gaming', 'Diseño gráfico', 'Programación', 'Estudiante', 'Ultrabook', 'Workstation'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['Menos de 5h', '5-8h', '8-12h', '12-16h', 'Más de 16h'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Plateado', 'Gris espacial', 'Negro', 'Blanco', 'Azul', 'Rosa', 'Oro'] }
  ],

  // Computadoras de escritorio
  'electronics-computers-desktop': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Alienware', 'Custom build', 'Otra'] },
    { id: 'form_factor', name: 'Factor de forma', type: 'select', options: ['Torre completa', 'Torre media', 'Mini torre', 'All-in-one', 'Mini PC', 'Barebone'] },
    { id: 'processor', name: 'Procesador', type: 'select', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'] },
    { id: 'ram', name: 'Memoria RAM', type: 'select', options: ['8GB', '16GB', '32GB', '64GB', '128GB'] },
    { id: 'storage', name: 'Almacenamiento', type: 'tags', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD', '4TB HDD'] },
    { id: 'graphics', name: 'Tarjeta gráfica', type: 'select', options: ['Integrada', 'NVIDIA GTX 1650', 'NVIDIA GTX 1660', 'NVIDIA RTX 3060', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 4080', 'AMD Radeon'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Oficina', 'Gaming', 'Diseño gráfico', 'Programación', 'Hogar', 'Workstation', 'Server'] },
    { id: 'operating_system', name: 'Sistema operativo', type: 'select', options: ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'Sin OS'] }
  ],

  // Tablets
  'electronics-computers-tablets': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Huawei', 'Amazon', 'Google', 'Xiaomi', 'Otra'] },
    { id: 'operating_system', name: 'Sistema operativo', type: 'select', options: ['iPadOS', 'Android', 'Windows', 'Fire OS'] },
    { id: 'screen_size', name: 'Tamaño de pantalla', type: 'select', options: ['7"-8"', '8"-10"', '10"-11"', '11"-13"', 'Más de 13"'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['32GB', '64GB', 'GB', '256GB', '512GB', '1TB', '2TB'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Wi-Fi', 'Wi-Fi + Cellular', 'Wi-Fi + 5G', 'Wi-Fi + 4G LTE'] },
    { id: 'stylus_support', name: 'Soporte para stylus', type: 'select', options: ['Sí', 'No', 'Opcional'] },
    { id: 'keyboard_support', name: 'Teclado compatible', type: 'select', options: ['Sí', 'No', 'Opcional'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Entretenimiento', 'Productividad', 'Diseño', 'Educación', 'Gaming', 'Lectura'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Gris espacial', 'Plateado', 'Negro', 'Blanco', 'Azul', 'Rosa', 'Verde'] }
  ],

  // Accesorios para computadora
  'electronics-computers-accessories': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Teclado', 'Mouse', 'Webcam', 'Micrófono', 'Hub USB', 'Dock', 'Soporte', 'Mousepad', 'Enfriador'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['USB', 'Bluetooth', 'Inalámbrico 2.4GHz', 'USB-C', 'Lightning', 'Cable'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'tags', options: ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Universal'] },
    { id: 'gaming', name: 'Para gaming', type: 'select', options: ['Sí', 'No'] },
    { id: 'ergonomic', name: 'Ergonómico', type: 'select', options: ['Sí', 'No'] },
    { id: 'backlit', name: 'Retroiluminado', type: 'select', options: ['Sí', 'No', 'RGB'] }
  ],

  // Componentes de PC
  'electronics-computers-components': [
    { id: 'component_type', name: 'Tipo de componente', type: 'select', options: ['Procesador (CPU)', 'Tarjeta gráfica (GPU)', 'Memoria RAM', 'Almacenamiento', 'Placa madre', 'Fuente de poder', 'Ventilador/Cooling', 'Case'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'compatibility', name: 'Compatible con', type: 'tags', options: ['Intel', 'AMD', 'NVIDIA', 'ATI', 'DDR4', 'DDR5', 'SATA', 'NVMe'] },
    { id: 'performance_level', name: 'Nivel de rendimiento', type: 'select', options: ['Básico', 'Intermedio', 'Alto rendimiento', 'Enthusiast', 'Profesional'] },
    { id: 'form_factor', name: 'Factor de forma', type: 'select', options: ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX', 'Estándar'] },
    { id: 'warranty', name: 'Garantía', type: 'select', options: ['1 año', '2 años', '3 años', '5 años', 'De por vida'] }
  ],

  // Monitores
  'electronics-computers-monitors': [
    { id: 'screen_size', name: 'Tamaño de pantalla', type: 'select', options: ['21"-24"', '25"-27"', '28"-32"', '33"-38"', 'Más de 38"'] },
    { id: 'resolution', name: 'Resolución', type: 'select', options: ['1080p (Full HD)', '1440p (2K)', '4K (Ultra HD)', '5K', '8K'] },
    { id: 'panel_type', name: 'Tipo de panel', type: 'select', options: ['IPS', 'VA', 'TN', 'OLED', 'QLED'] },
    { id: 'refresh_rate', name: 'Tasa de refresco', type: 'select', options: ['60Hz', '75Hz', '120Hz', '144Hz', '165Hz', '240Hz', '360Hz'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['HDMI', 'DisplayPort', 'USB-C', 'VGA', 'DVI', 'Thunderbolt'] },
    { id: 'gaming', name: 'Para gaming', type: 'select', options: ['Sí', 'No'] },
    { id: 'curved', name: 'Curvo', type: 'select', options: ['Sí', 'No'] },
    { id: 'adjustable', name: 'Ajustable', type: 'select', options: ['Altura', 'Inclinación', 'Rotación', 'Pivot', 'Completamente ajustable', 'No ajustable'] }
  ],

  // Audio y sonido (categoría general)
  'electronics-audio': [
    { id: 'audio_type', name: 'Tipo de audio', type: 'select', options: ['Audífonos', 'Altavoces', 'Barra de sonido', 'Micrófono', 'Sistema de audio', 'Amplificador'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Bluetooth', 'Wi-Fi', 'Cable 3.5mm', 'USB', 'USB-C', 'Lightning', 'Inalámbrico'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Música', 'Gaming', 'Trabajo', 'Deportes', 'Viajes', 'Hogar', 'Profesional', 'Streaming'] },
    { id: 'wireless', name: 'Inalámbrico', type: 'select', options: ['Sí', 'No', 'Ambos'] },
    { id: 'noise_cancellation', name: 'Cancelación de ruido', type: 'select', options: ['Activa', 'Pasiva', 'Híbrida', 'No'] }
  ],

  // Audífonos
  'electronics-audio-headphones': [
    { id: 'headphone_type', name: 'Tipo de audífono', type: 'select', options: ['In-ear', 'On-ear', 'Over-ear', 'True wireless', 'Wireless', 'Con cable'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Apple', 'Sony', 'Bose', 'Sennheiser', 'Audio-Technica', 'JBL', 'Beats', 'Samsung', 'Jabra', 'Skullcandy', 'Otra'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Bluetooth', 'Cable 3.5mm', 'USB-C', 'Lightning', 'USB', 'Inalámbrico 2.4GHz'] },
    { id: 'noise_cancellation', name: 'Cancelación de ruido', type: 'select', options: ['ANC activa', 'Pasiva', 'Híbrida', 'No'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Música', 'Gaming', 'Trabajo', 'Deportes', 'Viajes', 'Llamadas', 'Streaming', 'Monitoreo'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['Menos de 5h', '5-10h', '10-20h', '20-30h', 'Más de 30h', 'No aplica'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['IPX4', 'IPX5', 'IPX7', 'IPX8', 'No resistente'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Rosa', 'Rojo', 'Verde', 'Plateado'] }
  ],

  // Altavoces
  'electronics-audio-speakers': [
    { id: 'speaker_type', name: 'Tipo de altavoz', type: 'select', options: ['Portátil', 'Inteligente', 'Bluetooth', 'Bookshelf', 'Soundbar', 'Subwoofer', 'Sistema 2.1', 'Sistema 5.1'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['JBL', 'Bose', 'Sony', 'Amazon', 'Google', 'Apple', 'Marshall', 'Ultimate Ears', 'Harman Kardon', 'Bang & Olufsen', 'Otra'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Bluetooth', 'Wi-Fi', 'AUX 3.5mm', 'USB', 'USB-C', 'Optical', 'HDMI'] },
    { id: 'power_output', name: 'Potencia', type: 'select', options: ['Menos de 10W', '10-20W', '20-50W', '50-100W', 'Más de 100W'] },
    { id: 'smart_features', name: 'Características inteligentes', type: 'tags', options: ['Asistente de voz', 'Control por app', 'Multi-room', 'Streaming', 'Control táctil'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Ultra portátil', 'Portátil', 'Semi-portátil', 'Estacionario'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['IPX4', 'IPX5', 'IPX7', 'IPX8', 'No resistente'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['Menos de 5h', '5-10h', '10-20h', 'Más de 20h', 'No aplica (con cable)'] }
  ],

  // Barras de sonido
  'electronics-audio-soundbars': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Samsung', 'LG', 'Sony', 'Bose', 'JBL', 'Yamaha', 'Polk', 'Vizio', 'Sonos', 'Otra'] },
    { id: 'channels', name: 'Configuración de canales', type: 'select', options: ['2.0', '2.1', '3.1', '5.1', '7.1', 'Atmos'] },
    { id: 'power_output', name: 'Potencia total', type: 'select', options: ['Menos de 100W', '100-200W', '200-400W', '400-600W', 'Más de 600W'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['HDMI ARC', 'HDMI eARC', 'Bluetooth', 'Wi-Fi', 'Optical', 'USB', 'AUX'] },
    { id: 'subwoofer', name: 'Subwoofer', type: 'select', options: ['Incluido inalámbrico', 'Incluido con cable', 'No incluido', 'Opcional'] },
    { id: 'smart_features', name: 'Características inteligentes', type: 'tags', options: ['Asistente de voz', 'Control por app', 'Streaming', 'Multi-room', 'Auto calibración'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Compacta (menos de 60cm)', 'Media (60-90cm)', 'Grande (90-120cm)', 'Extra grande (más de 120cm)'] }
  ],

  // Micrófonos
  'electronics-audio-microphones': [
    { id: 'microphone_type', name: 'Tipo de micrófono', type: 'select', options: ['USB', 'XLR', 'Inalámbrico', 'Lavalier', 'Shotgun', 'Dinámico', 'Condensador'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Streaming', 'Podcasting', 'Gaming', 'Música', 'Conferencias', 'Grabación profesional', 'Karaoke'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['USB', 'USB-C', 'XLR', 'Inalámbrico', '3.5mm', 'Lightning'] },
    { id: 'polar_pattern', name: 'Patrón polar', type: 'select', options: ['Cardioide', 'Omnidireccional', 'Bidireccional', 'Shotgun', 'Múltiple'] },
    { id: 'frequency_response', name: 'Respuesta de frecuencia', type: 'select', options: ['20Hz-20kHz', 'Extendida', 'Optimizada para voz', 'Flat response'] },
    { id: 'phantom_power', name: 'Alimentación phantom', type: 'select', options: ['Requerida', 'No requerida', 'Opcional'] },
    { id: 'accessories_included', name: 'Accesorios incluidos', type: 'tags', options: ['Soporte de mesa', 'Brazo articulado', 'Pop filter', 'Cable', 'Estuche', 'Shock mount'] }
  ],

  // Sistemas de audio para hogar
  'electronics-audio-home-audio': [
    { id: 'system_type', name: 'Tipo de sistema', type: 'select', options: ['Estéreo', '2.1', '5.1', '7.1', 'Atmos', 'Hi-Fi', 'Vintage'] },
    { id: 'components', name: 'Componentes', type: 'tags', options: ['Amplificador', 'Receiver', 'Altavoces', 'Subwoofer', 'Reproductor CD', 'Tocadiscos', 'Streamer'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Bluetooth', 'Wi-Fi', 'HDMI', 'Optical', 'RCA', 'USB', 'Streaming'] },
    { id: 'power_output', name: 'Potencia', type: 'select', options: ['Menos de 50W', '50-100W', '100-300W', '300-500W', 'Más de 500W'] },
    { id: 'room_size', name: 'Tamaño de habitación', type: 'select', options: ['Pequeña (hasta 20m²)', 'Media (20-40m²)', 'Grande (40-80m²)', 'Muy grande (más de 80m²)'] },
    { id: 'brand', name: 'Marca', type: 'text' }
  ],

  // TV y video (categoría general)
  'electronics-tv-video': [
    { id: 'device_type', name: 'Tipo de dispositivo', type: 'select', options: ['Smart TV', 'TV básico', 'Proyector', 'Streaming device', 'Media player', 'Reproductor Blu-ray'] },
    { id: 'screen_technology', name: 'Tecnología de pantalla', type: 'select', options: ['LED', 'OLED', 'QLED', 'LCD', 'Plasma', 'Proyección'] },
    { id: 'resolution', name: 'Resolución', type: 'select', options: ['HD (720p)', 'Full HD (1080p)', '4K (Ultra HD)', '8K'] },
    { id: 'smart_features', name: 'Características inteligentes', type: 'tags', options: ['Smart TV', 'Streaming apps', 'Control por voz', 'Wi-Fi', 'Bluetooth'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['HDMI', 'USB', 'Wi-Fi', 'Bluetooth', 'Ethernet', 'Optical'] }
  ],

  // Smart TV
  'electronics-tv-smart-tv': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'Panasonic', 'Philips', 'Roku', 'Otra'] },
    { id: 'screen_size', name: 'Tamaño de pantalla', type: 'select', options: ['32"', '40"-43"', '48"-50"', '55"', '65"', '75"', '85"', 'Más de 85"'] },
    { id: 'resolution', name: 'Resolución', type: 'select', options: ['Full HD (1080p)', '4K (Ultra HD)', '8K'] },
    { id: 'display_technology', name: 'Tecnología de pantalla', type: 'select', options: ['LED', 'QLED', 'OLED', 'Neo QLED', 'Mini LED', 'LCD'] },
    { id: 'smart_platform', name: 'Plataforma inteligente', type: 'select', options: ['Android TV', 'Google TV', 'Roku TV', 'webOS', 'Tizen', 'Fire TV', 'Apple TV'] },
    { id: 'hdr_support', name: 'Soporte HDR', type: 'tags', options: ['HDR10', 'HDR10+', 'Dolby Vision', 'HLG', 'No HDR'] },
    { id: 'refresh_rate', name: 'Tasa de refresco', type: 'select', options: ['60Hz', '120Hz', '144Hz', 'Variable'] },
    { id: 'gaming_features', name: 'Características gaming', type: 'tags', options: ['HDMI 2.1', 'VRR', 'ALLM', 'Game Mode', 'Baja latencia'] },
    { id: 'audio_features', name: 'Audio', type: 'tags', options: ['Dolby Atmos', 'DTS', 'Altavoces integrados', 'Soporte eARC'] }
  ],

  // Dispositivos de streaming
  'electronics-tv-streaming': [
    { id: 'device_type', name: 'Tipo de dispositivo', type: 'select', options: ['Stick', 'Box', 'Dongle', 'Media player'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Amazon Fire TV', 'Roku', 'Google Chromecast', 'Apple TV', 'NVIDIA Shield', 'Xiaomi Mi Box', 'Otra'] },
    { id: 'resolution_support', name: 'Resolución soportada', type: 'select', options: ['1080p', '4K', '4K HDR', '8K'] },
    { id: 'streaming_services', name: 'Servicios compatibles', type: 'tags', options: ['Netflix', 'Amazon Prime', 'Disney+', 'YouTube', 'Spotify', 'Apple TV+', 'HBO Max', 'Paramount+'] },
    { id: 'remote_type', name: 'Control remoto', type: 'select', options: ['Básico', 'Con voz', 'Touchpad', 'Gaming', 'App móvil'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Wi-Fi', 'Ethernet', 'Bluetooth', 'USB', 'HDMI', 'Micro SD'] }
  ],

  // Proyectores
  'electronics-tv-projectors': [
    { id: 'projector_type', name: 'Tipo de proyector', type: 'select', options: ['DLP', 'LCD', 'LED', 'Láser', 'Mini/Portátil'] },
    { id: 'resolution', name: 'Resolución', type: 'select', options: ['HD (720p)', 'Full HD (1080p)', '4K', '8K'] },
    { id: 'brightness', name: 'Brillo (lúmenes)', type: 'select', options: ['Menos de 1000', '1000-2000', '2000-3000', '3000-4000', 'Más de 4000'] },
    { id: 'throw_distance', name: 'Distancia de proyección', type: 'select', options: ['Corta (menos de 1m)', 'Media (1-3m)', 'Larga (3-6m)', 'Ultra corta'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Hogar', 'Oficina', 'Educación', 'Gaming', 'Cine en casa', 'Portátil', 'Profesional'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['HDMI', 'USB', 'Wi-Fi', 'Bluetooth', 'VGA', 'USB-C'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Ultra portátil', 'Portátil', 'Semi-portátil', 'Estacionario'] }
  ],

  // Accesorios para TV
  'electronics-tv-accessories': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Soporte de pared', 'Soporte de mesa', 'Control remoto', 'Cable HDMI', 'Antena', 'Protector de pantalla', 'Limpiador'] },
    { id: 'tv_size_compatibility', name: 'Compatible con TV de', type: 'select', options: ['32"-43"', '44"-55"', '56"-65"', '66"-75"', 'Más de 75"', 'Universal'] },
    { id: 'vesa_compatibility', name: 'Compatibilidad VESA', type: 'tags', options: ['100x100', '200x200', '400x400', '600x400', '800x400', 'Universal'] },
    { id: 'adjustable', name: 'Ajustable', type: 'select', options: ['Fijo', 'Inclinación', 'Articulado', 'Completamente ajustable'] },
    { id: 'weight_capacity', name: 'Capacidad de peso', type: 'select', options: ['Hasta 15kg', '15-25kg', '25-40kg', '40-60kg', 'Más de 60kg'] }
  ],

  // Gaming y videojuegos (categoría general)
  'electronics-gaming': [
    { id: 'gaming_type', name: 'Tipo de gaming', type: 'select', options: ['Consola', 'PC Gaming', 'Móvil', 'VR', 'Arcade', 'Retro'] },
    { id: 'platform', name: 'Plataforma', type: 'select', options: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Móvil', 'Multi-plataforma'] },
    { id: 'age_rating', name: 'Clasificación de edad', type: 'select', options: ['E (Everyone)', 'T (Teen)', 'M (Mature)', 'A (Adults Only)', 'RP (Rating Pending)'] },
    { id: 'genre', name: 'Género', type: 'tags', options: ['Acción', 'Aventura', 'RPG', 'Deportes', 'Racing', 'Shooter', 'Estrategia', 'Puzzle', 'Simulación'] },
    { id: 'multiplayer', name: 'Multijugador', type: 'select', options: ['Sí', 'No', 'Online', 'Local', 'Cooperativo'] }
  ],

  // Consolas
  'electronics-gaming-consoles': [
    { id: 'console_brand', name: 'Marca de consola', type: 'select', options: ['PlayStation', 'Xbox', 'Nintendo', 'Steam Deck', 'Retro', 'Otra'] },
    { id: 'console_model', name: 'Modelo', type: 'select', options: ['PlayStation 5', 'Xbox Series X', 'Xbox Series S', 'Nintendo Switch', 'Nintendo Switch Lite', 'Steam Deck', 'Retro handheld'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['64GB', '256GB', '512GB', '1TB', '2TB'] },
    { id: 'condition', name: 'Condición', type: 'select', options: ['Nueva', 'Reacondicionada', 'Usada - Excelente', 'Usada - Buena'] },
    { id: 'bundle', name: 'Bundle incluido', type: 'tags', options: ['Solo consola', 'Con control extra', 'Con juegos', 'Bundle completo', 'Accesorios incluidos'] },
    { id: 'region', name: 'Región', type: 'select', options: ['Global', 'NTSC', 'PAL', 'Japón', 'Europa', 'América'] }
  ],

  // Controles
  'electronics-gaming-controllers': [
    { id: 'controller_type', name: 'Tipo de control', type: 'select', options: ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Móvil', 'Universal', 'Arcade stick', 'Racing wheel'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Inalámbrico', 'Cable USB', 'Bluetooth', 'Dongle 2.4GHz'] },
    { id: 'compatibility', name: 'Compatible con', type: 'tags', options: ['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'PC', 'Android', 'iOS'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Vibración', 'Triggers adaptativos', 'Giroscopio', 'Touchpad', 'Audio jack', 'RGB', 'Programable'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['Menos de 10h', '10-20h', '20-40h', 'Más de 40h', 'No aplica (con cable)'] },
    { id: 'ergonomic', name: 'Ergonómico', type: 'select', options: ['Sí', 'No'] },
    { id: 'customizable', name: 'Personalizable', type: 'select', options: ['Sí', 'No'] }
  ],

  // Accesorios gaming
  'electronics-gaming-accessories': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Headset gaming', 'Teclado gaming', 'Mouse gaming', 'Mousepad', 'Silla gaming', 'Micrófono', 'Webcam', 'Capturadora'] },
    { id: 'platform', name: 'Compatible con', type: 'tags', options: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Móvil', 'Multi-plataforma'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['USB', 'Inalámbrico', 'Bluetooth', '3.5mm', 'USB-C'] },
    { id: 'rgb_lighting', name: 'Iluminación RGB', type: 'select', options: ['Sí', 'No'] },
    { id: 'professional', name: 'Nivel profesional', type: 'select', options: ['Casual', 'Enthusiast', 'Profesional', 'Esports'] },
    { id: 'wireless', name: 'Inalámbrico', type: 'select', options: ['Sí', 'No'] }
  ],

  // PC Gaming
  'electronics-gaming-pc-gaming': [
    { id: 'pc_type', name: 'Tipo de PC', type: 'select', options: ['Pre-construido', 'Custom build', 'Laptop gaming', 'Mini PC gaming'] },
    { id: 'performance_tier', name: 'Nivel de rendimiento', type: 'select', options: ['Entry level', 'Mid-range', 'High-end', 'Enthusiast', 'Extreme'] },
    { id: 'graphics_card', name: 'Tarjeta gráfica', type: 'select', options: ['GTX 1650', 'GTX 1660', 'RTX 3060', 'RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090', 'AMD equivalente'] },
    { id: 'processor', name: 'Procesador', type: 'select', options: ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9'] },
    { id: 'ram', name: 'Memoria RAM', type: 'select', options: ['16GB', '32GB', '64GB', '128GB'] },
    { id: 'storage', name: 'Almacenamiento', type: 'tags', options: ['512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD'] },
    { id: 'target_fps', name: 'FPS objetivo', type: 'select', options: ['60 FPS', '120 FPS', '144 FPS', '240 FPS', '360 FPS'] },
    { id: 'resolution_target', name: 'Resolución objetivo', type: 'select', options: ['1080p', '1440p', '4K', '8K'] }
  ],

  // Cámaras y fotografía (categoría general)
  'electronics-cameras': [
    { id: 'camera_type', name: 'Tipo de cámara', type: 'select', options: ['DSLR', 'Mirrorless', 'Compacta', 'Acción', 'Instantánea', 'Seguridad', 'Webcam'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Fotografía', 'Video', 'Deportes extremos', 'Viajes', 'Profesional', 'Principiante', 'Seguridad'] },
    { id: 'skill_level', name: 'Nivel de habilidad', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Ultra portátil', 'Portátil', 'Semi-portátil', 'Estacionario'] }
  ],

  // Cámaras digitales
  'electronics-cameras-digital': [
    { id: 'camera_type', name: 'Tipo de cámara', type: 'select', options: ['DSLR', 'Mirrorless', 'Compacta', 'Medium format', 'Film/Análoga'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'Olympus', 'Leica', 'Pentax', 'Otra'] },
    { id: 'megapixels', name: 'Megapíxeles', type: 'select', options: ['Menos de 16MP', '16-24MP', '24-36MP', '36-50MP', 'Más de 50MP'] },
    { id: 'sensor_size', name: 'Tamaño del sensor', type: 'select', options: ['1/2.3"', 'Micro 4/3', 'APS-C', 'Full Frame', 'Medium Format'] },
    { id: 'video_capability', name: 'Capacidad de video', type: 'select', options: ['1080p', '4K', '6K', '8K', 'No video'] },
    { id: 'lens_mount', name: 'Montura de lente', type: 'select', options: ['Canon EF', 'Canon RF', 'Nikon F', 'Nikon Z', 'Sony E', 'Micro 4/3', 'Fuji X', 'Lente fija'] },
    { id: 'stabilization', name: 'Estabilización', type: 'select', options: ['En el cuerpo', 'En el lente', 'Híbrida', 'Electrónica', 'No'] },
    { id: 'condition', name: 'Condición', type: 'select', options: ['Nueva', 'Usada - Excelente', 'Usada - Buena', 'Para repuestos'] }
  ],

  // Cámaras de acción
  'electronics-cameras-action': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['GoPro', 'DJI', 'Insta360', 'Sony', 'Garmin', 'AKASO', 'YI', 'Otra'] },
    { id: 'video_resolution', name: 'Resolución de video', type: 'select', options: ['1080p', '4K', '5.3K', '6K', '8K'] },
    { id: 'frame_rate', name: 'Tasa de frames', type: 'select', options: ['30fps', '60fps', '120fps', '240fps', 'Variable'] },
    { id: 'stabilization', name: 'Estabilización', type: 'select', options: ['Electrónica', 'Gimbal', 'Híbrida', 'No'] },
    { id: 'waterproof', name: 'Resistencia al agua', type: 'select', options: ['IPX7', 'IPX8', '10m', '30m', '60m', 'No resistente'] },
    { id: 'field_of_view', name: 'Campo de visión', type: 'select', options: ['Ultra gran angular', 'Gran angular', 'Estándar', 'Ajustable'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Pantalla táctil', 'Control por voz', 'Wi-Fi', 'Bluetooth', 'GPS', 'Live streaming'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Deportes extremos', 'Viajes', 'Underwater', 'Vlogging', 'Aventura', 'Profesional'] }
  ],

  // Cámaras de seguridad
  'electronics-cameras-security': [
    { id: 'camera_type', name: 'Tipo de cámara', type: 'select', options: ['Interior', 'Exterior', 'PTZ', 'Bullet', 'Dome', 'Oculta', 'Doorbell'] },
    { id: 'resolution', name: 'Resolución', type: 'select', options: ['720p', '1080p', '4K', '5MP', '8MP'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Wi-Fi', 'Ethernet', 'PoE', 'Inalámbrico', 'Cellular'] },
    { id: 'power_source', name: 'Fuente de poder', type: 'select', options: ['Batería', 'Cable', 'PoE', 'Solar', 'Batería recargable'] },
    { id: 'night_vision', name: 'Visión nocturna', type: 'select', options: ['Infrarrojo', 'Color nocturno', 'Spotlight', 'No'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['Cloud', 'Micro SD', 'NVR', 'Local', 'Híbrido'] },
    { id: 'smart_features', name: 'Características inteligentes', type: 'tags', options: ['Detección de movimiento', 'Reconocimiento facial', 'Audio bidireccional', 'Alertas móviles', 'AI'] },
    { id: 'weather_resistance', name: 'Resistencia climática', type: 'select', options: ['IP65', 'IP66', 'IP67', 'Solo interior'] }
  ],

  // Accesorios para cámaras
  'electronics-cameras-accessories': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Lente', 'Trípode', 'Flash', 'Filtro', 'Bolsa/Case', 'Batería', 'Cargador', 'Memoria', 'Correa'] },
    { id: 'camera_compatibility', name: 'Compatible con', type: 'tags', options: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Universal', 'GoPro', 'DJI'] },
    { id: 'lens_type', name: 'Tipo de lente', type: 'select', options: ['Gran angular', 'Teleobjetivo', 'Macro', 'Estándar', 'Fisheye', 'Zoom', 'Prime'] },
    { id: 'focal_length', name: 'Distancia focal', type: 'select', options: ['Menos de 35mm', '35-85mm', '85-200mm', 'Más de 200mm', 'Zoom variable'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Aluminio', 'Carbono', 'Plástico', 'Cuero', 'Nylon', 'Metal'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Ultra compacto', 'Compacto', 'Estándar', 'Profesional'] }
  ],

  // Dispositivos wearables (categoría general)
  'electronics-wearables': [
    { id: 'wearable_type', name: 'Tipo de wearable', type: 'select', options: ['Smartwatch', 'Fitness tracker', 'VR headset', 'AR glasses', 'Smart ring', 'Smart clothing'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'compatibility', name: 'Compatible con', type: 'tags', options: ['iOS', 'Android', 'Windows', 'Universal'] },
    { id: 'health_tracking', name: 'Seguimiento de salud', type: 'tags', options: ['Ritmo cardíaco', 'Sueño', 'Pasos', 'Calorías', 'Estrés', 'Oxígeno', 'ECG'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['Menos de 1 día', '1-3 días', '3-7 días', '1-2 semanas', 'Más de 2 semanas'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['IPX4', 'IPX7', '5ATM', '10ATM', 'No resistente'] }
  ],

  // Smartwatches
  'electronics-wearables-smartwatches': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Huawei', 'Amazfit', 'Fossil', 'Suunto', 'Polar', 'Otra'] },
    { id: 'operating_system', name: 'Sistema operativo', type: 'select', options: ['watchOS', 'Wear OS', 'Tizen', 'Fitbit OS', 'Garmin OS', 'Propietario'] },
    { id: 'compatibility', name: 'Compatible con', type: 'select', options: ['iPhone', 'Android', 'Ambos', 'Universal'] },
    { id: 'display_type', name: 'Tipo de pantalla', type: 'select', options: ['OLED', 'AMOLED', 'LCD', 'E-ink', 'Retina'] },
    { id: 'case_size', name: 'Tamaño de caja', type: 'select', options: ['38mm', '40mm', '41mm', '42mm', '44mm', '45mm', '46mm', '49mm'] },
    { id: 'health_features', name: 'Características de salud', type: 'tags', options: ['Ritmo cardíaco', 'ECG', 'Oxígeno en sangre', 'Sueño', 'Estrés', 'Ciclo menstrual', 'Caídas'] },
    { id: 'fitness_features', name: 'Características fitness', type: 'tags', options: ['GPS', 'Múltiples deportes', 'Resistencia al agua', 'Altímetro', 'Brújula'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Bluetooth', 'Wi-Fi', 'Cellular', 'NFC', 'GPS'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['Menos de 1 día', '1-2 días', '3-5 días', '1-2 semanas', 'Más de 2 semanas'] }
  ],

  // Rastreadores de fitness
  'electronics-wearables-fitness': [
    { id: 'brand', name: 'Marca', type: 'select', options: ['Fitbit', 'Garmin', 'Xiaomi', 'Huawei', 'Samsung', 'Polar', 'Suunto', 'Amazfit', 'Otra'] },
    { id: 'tracker_type', name: 'Tipo de tracker', type: 'select', options: ['Pulsera básica', 'Pulsera avanzada', 'Smartwatch fitness', 'Clip', 'Ring'] },
    { id: 'display', name: 'Pantalla', type: 'select', options: ['Sin pantalla', 'Básica', 'Color', 'Táctil', 'AMOLED'] },
    { id: 'health_tracking', name: 'Seguimiento de salud', type: 'tags', options: ['Pasos', 'Calorías', 'Distancia', 'Ritmo cardíaco', 'Sueño', 'Estrés', 'Oxígeno'] },
    { id: 'sports_modes', name: 'Modos deportivos', type: 'select', options: ['Básicos (5-10)', 'Múltiples (10-50)', 'Extensos (50+)', 'Automático'] },
    { id: 'gps', name: 'GPS integrado', type: 'select', options: ['Sí', 'No', 'Conectado (usa teléfono)'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['IPX7', '5ATM', '10ATM', 'Natación', 'No resistente'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['3-5 días', '5-7 días', '1-2 semanas', '2-4 semanas', 'Más de 1 mes'] }
  ],

  // Realidad virtual
  'electronics-wearables-vr': [
    { id: 'vr_type', name: 'Tipo de VR', type: 'select', options: ['Standalone', 'PC VR', 'Móvil VR', 'Console VR'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Meta (Oculus)', 'HTC', 'Sony', 'Pico', 'Valve', 'HP', 'Varjo', 'Otra'] },
    { id: 'resolution', name: 'Resolución por ojo', type: 'select', options: ['1440x1700', '1832x1920', '2160x2160', '2880x1700', 'Más alta'] },
    { id: 'refresh_rate', name: 'Tasa de refresco', type: 'select', options: ['72Hz', '90Hz', '120Hz', '144Hz', 'Variable'] },
    { id: 'tracking', name: 'Seguimiento', type: 'select', options: ['3DOF', '6DOF', 'Inside-out', 'Outside-in', 'Hand tracking'] },
    { id: 'platform', name: 'Plataforma', type: 'select', options: ['Meta Store', 'SteamVR', 'PlayStation VR', 'Standalone', 'PC requerida'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Gaming', 'Fitness', 'Educación', 'Trabajo', 'Entretenimiento', 'Social'] },
    { id: 'ipd_range', name: 'Rango IPD', type: 'select', options: ['58-72mm', '56-74mm', 'Ajustable', 'Fijo'] }
  ],

  // Hogar inteligente (categoría general)
  'electronics-smart-home': [
    { id: 'device_type', name: 'Tipo de dispositivo', type: 'select', options: ['Asistente inteligente', 'Cámara seguridad', 'Iluminación', 'Termostato', 'Enchufe inteligente', 'Sensor', 'Hub'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'voice_assistant', name: 'Asistente de voz', type: 'tags', options: ['Alexa', 'Google Assistant', 'Siri', 'Bixby', 'No compatible'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Wi-Fi', 'Bluetooth', 'Zigbee', 'Z-Wave', 'Thread', 'Matter'] },
    { id: 'app_control', name: 'Control por app', type: 'select', options: ['Sí', 'No'] },
    { id: 'automation', name: 'Automatización', type: 'select', options: ['Básica', 'Avanzada', 'IA', 'No'] }
  ],

  // Asistentes inteligentes
  'electronics-smart-home-assistants': [
    { id: 'assistant_type', name: 'Tipo de asistente', type: 'select', options: ['Altavoz inteligente', 'Pantalla inteligente', 'Hub central', 'Portable'] },
    { id: 'voice_assistant', name: 'Asistente de voz', type: 'select', options: ['Alexa', 'Google Assistant', 'Siri', 'Bixby'] },
    { id: 'screen_size', name: 'Tamaño de pantalla', type: 'select', options: ['Sin pantalla', '5"', '7"', '8"', '10"', '15"'] },
    { id: 'audio_quality', name: 'Calidad de audio', type: 'select', options: ['Básica', 'Buena', 'Premium', 'Hi-Fi'] },
    { id: 'smart_home_hub', name: 'Hub integrado', type: 'select', options: ['Zigbee', 'Z-Wave', 'Thread', 'Matter', 'No'] },
    { id: 'video_calling', name: 'Videollamadas', type: 'select', options: ['Sí', 'No'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Portátil', 'Estacionario'] }
  ],

  // Seguridad del hogar
  'electronics-smart-home-security': [
    { id: 'security_type', name: 'Tipo de seguridad', type: 'select', options: ['Cámara', 'Sensor de movimiento', 'Sensor de puerta/ventana', 'Alarma', 'Timbre inteligente', 'Sistema completo'] },
    { id: 'installation', name: 'Instalación', type: 'select', options: ['DIY', 'Profesional', 'Plug and play'] },
    { id: 'monitoring', name: 'Monitoreo', type: 'select', options: ['Auto-monitoreo', 'Monitoreo profesional', 'Híbrido', 'No'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Wi-Fi', 'Cellular', 'Ethernet', 'Zigbee', 'Z-Wave'] },
    { id: 'power_source', name: 'Fuente de poder', type: 'select', options: ['Batería', 'Cable', 'Batería + Cable', 'Solar'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['Cloud gratuito', 'Cloud pagado', 'Local', 'Híbrido'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Visión nocturna', 'Audio bidireccional', 'Detección IA', 'Alertas móviles', 'Sirena'] }
  ],

  // Iluminación inteligente
  'electronics-smart-home-lighting': [
    { id: 'light_type', name: 'Tipo de luz', type: 'select', options: ['Bombilla', 'Tira LED', 'Panel LED', 'Lámpara', 'Switch inteligente', 'Dimmer'] },
    { id: 'bulb_type', name: 'Tipo de bombilla', type: 'select', options: ['LED', 'Smart LED', 'Color changing', 'Tunable white', 'Filamento'] },
    { id: 'base_type', name: 'Tipo de base', type: 'select', options: ['E27', 'E14', 'GU10', 'B22', 'G9', 'No aplica'] },
    { id: 'wattage', name: 'Potencia', type: 'select', options: ['Menos de 5W', '5-10W', '10-15W', '15-25W', 'Más de 25W'] },
    { id: 'color_options', name: 'Opciones de color', type: 'select', options: ['Blanco cálido', 'Blanco frío', 'Tunable white', 'RGB', 'RGBW'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Wi-Fi', 'Bluetooth', 'Zigbee', 'Z-Wave', 'Thread'] },
    { id: 'voice_control', name: 'Control por voz', type: 'tags', options: ['Alexa', 'Google', 'Siri', 'No compatible'] },
    { id: 'dimming', name: 'Regulable', type: 'select', options: ['Sí', 'No'] }
  ],

  // Control de clima
  'electronics-smart-home-climate': [
    { id: 'device_type', name: 'Tipo de dispositivo', type: 'select', options: ['Termostato inteligente', 'Sensor de temperatura', 'Humidificador', 'Deshumidificador', 'Purificador de aire', 'Ventilador inteligente'] },
    { id: 'compatibility', name: 'Compatible con', type: 'tags', options: ['Alexa', 'Google', 'Apple HomeKit', 'SmartThings', 'Standalone'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Wi-Fi', 'Zigbee', 'Z-Wave', 'Thread', 'Bluetooth'] },
    { id: 'power_source', name: 'Fuente de poder', type: 'select', options: ['Batería', 'Cable', 'C-wire', '24V', 'USB'] },
    { id: 'coverage_area', name: 'Área de cobertura', type: 'select', options: ['Hasta 20m²', '20-50m²', '50-100m²', 'Más de 100m²'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Programación', 'Geofencing', 'Aprendizaje automático', 'Sensores múltiples', 'Control remoto'] },
    { id: 'energy_saving', name: 'Ahorro de energía', type: 'select', options: ['Sí', 'No', 'Certificado Energy Star'] }
  ],

  // ===================================================
  // HOGAR Y DECORACIÓN - METADATOS COMPLETOS
  // ===================================================

  // Hogar y decoración (categoría principal)
  'home-garden': [
    { id: 'room', name: 'Habitación', type: 'select', options: ['Sala', 'Dormitorio', 'Cocina', 'Comedor', 'Baño', 'Oficina', 'Jardín', 'Balcón', 'Entrada', 'Todas'] },
    { id: 'style', name: 'Estilo decorativo', type: 'tags', options: ['Moderno', 'Minimalista', 'Industrial', 'Bohemio', 'Escandinavo', 'Rústico', 'Clásico', 'Vintage', 'Contemporáneo'] },
    { id: 'material', name: 'Material principal', type: 'tags', options: ['Madera', 'Metal', 'Plástico', 'Vidrio', 'Cerámica', 'Tela', 'Mimbre', 'Piedra', 'Mármol'] },
    { id: 'color_scheme', name: 'Esquema de color', type: 'tags', options: ['Neutro', 'Blanco', 'Negro', 'Madera natural', 'Colores vivos', 'Pasteles', 'Monocromático'] },
    { id: 'size_category', name: 'Categoría de tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande', 'Ajustable'] },
    { id: 'assembly_required', name: 'Requiere ensamblaje', type: 'select', options: ['No', 'Mínimo', 'Sí', 'Profesional'] }
  ],

  // Muebles (categoría general)
  'home-furniture': [
    { id: 'furniture_type', name: 'Tipo de mueble', type: 'select', options: ['Sofá', 'Silla', 'Mesa', 'Cama', 'Estantería', 'Armario', 'Cómoda', 'Escritorio', 'Banco'] },
    { id: 'room', name: 'Habitación', type: 'select', options: ['Sala', 'Dormitorio', 'Comedor', 'Oficina', 'Cocina', 'Baño', 'Exterior', 'Múltiples'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera maciza', 'MDF', 'Metal', 'Plástico', 'Vidrio', 'Mimbre', 'Ratán', 'Tela', 'Cuero'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Clásico', 'Industrial', 'Rústico', 'Escandinavo', 'Minimalista', 'Vintage', 'Contemporáneo'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Madera natural', 'Gris', 'Beige', 'Azul', 'Verde', 'Multicolor'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande', 'Personalizable'] },
    { id: 'assembly', name: 'Ensamblaje', type: 'select', options: ['Pre-ensamblado', 'Ensamblaje fácil', 'Ensamblaje complejo', 'Instalación profesional'] }
  ],

  // Sala de estar
  'home-furniture-living-room': [
    { id: 'furniture_type', name: 'Tipo de mueble', type: 'select', options: ['Sofá', 'Sillón', 'Mesa de centro', 'Mesa lateral', 'Estantería', 'TV stand', 'Otomana', 'Librero'] },
    { id: 'seating_capacity', name: 'Capacidad de asientos', type: 'select', options: ['1 persona', '2 personas', '3 personas', '4+ personas', 'No aplica'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Cuero', 'Tela', 'Microfibra', 'Lino', 'Terciopelo', 'Madera', 'Metal', 'Vidrio'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Moderno', 'Clásico', 'Industrial', 'Escandinavo', 'Bohemio', 'Mid-century', 'Tradicional'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Beige', 'Gris', 'Negro', 'Blanco', 'Azul', 'Verde', 'Marrón', 'Multicolor'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Reclinable', 'Convertible', 'Almacenamiento', 'Cojines removibles', 'Resistente a manchas'] }
  ],

  // Dormitorio
  'home-furniture-bedroom': [
    { id: 'furniture_type', name: 'Tipo de mueble', type: 'select', options: ['Cama', 'Colchón', 'Mesa de noche', 'Cómoda', 'Armario', 'Tocador', 'Banco', 'Espejo'] },
    { id: 'bed_size', name: 'Tamaño de cama', type: 'select', options: ['Individual', 'Matrimonial', 'Queen', 'King', 'Super King', 'No aplica'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Metal', 'Tapizado', 'Cuero', 'Ratán', 'MDF', 'Mixto'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Moderno', 'Clásico', 'Rústico', 'Industrial', 'Romántico', 'Minimalista', 'Vintage'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Madera natural', 'Gris', 'Beige', 'Azul', 'Rosa'] },
    { id: 'storage', name: 'Con almacenamiento', type: 'select', options: ['Sí', 'No'] },
    { id: 'headboard', name: 'Cabecero', type: 'select', options: ['Incluido', 'Opcional', 'No incluido', 'No aplica'] }
  ],

  // Comedor
  'home-furniture-dining': [
    { id: 'furniture_type', name: 'Tipo de mueble', type: 'select', options: ['Mesa de comedor', 'Silla de comedor', 'Banco', 'Aparador', 'Vitrina', 'Bar cart', 'Conjunto completo'] },
    { id: 'seating_capacity', name: 'Capacidad', type: 'select', options: ['2 personas', '4 personas', '6 personas', '8 personas', '10+ personas', 'No aplica'] },
    { id: 'table_shape', name: 'Forma de mesa', type: 'select', options: ['Rectangular', 'Redonda', 'Ovalada', 'Cuadrada', 'Extensible', 'No aplica'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera maciza', 'Vidrio', 'Mármol', 'Metal', 'MDF', 'Laminado', 'Mixto'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Moderno', 'Clásico', 'Industrial', 'Rústico', 'Escandinavo', 'Farmhouse', 'Contemporáneo'] },
    { id: 'upholstery', name: 'Tapizado', type: 'select', options: ['Cuero', 'Tela', 'Vinilo', 'Sin tapizar', 'Cojín removible'] }
  ],

  // Oficina
  'home-furniture-office': [
    { id: 'furniture_type', name: 'Tipo de mueble', type: 'select', options: ['Escritorio', 'Silla de oficina', 'Estantería', 'Archivero', 'Mesa auxiliar', 'Lámpara de escritorio', 'Organizador'] },
    { id: 'ergonomic', name: 'Ergonómico', type: 'select', options: ['Sí', 'No'] },
    { id: 'adjustable', name: 'Ajustable', type: 'tags', options: ['Altura', 'Inclinación', 'Brazos', 'Respaldo', 'No ajustable'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Metal', 'Vidrio', 'Mesh', 'Cuero', 'Tela', 'Plástico'] },
    { id: 'storage', name: 'Almacenamiento', type: 'select', options: ['Con cajones', 'Con estantes', 'Sin almacenamiento', 'Múltiple'] },
    { id: 'mobility', name: 'Movilidad', type: 'select', options: ['Con ruedas', 'Fijo', 'Plegable'] },
    { id: 'work_style', name: 'Estilo de trabajo', type: 'tags', options: ['Ejecutivo', 'Casual', 'Gaming', 'Creativo', 'Minimalista', 'Tradicional'] }
  ],

  // Almacenamiento
  'home-furniture-storage': [
    { id: 'storage_type', name: 'Tipo de almacenamiento', type: 'select', options: ['Estantería', 'Armario', 'Cómoda', 'Baúl', 'Organizador', 'Rack', 'Gabinete', 'Closet'] },
    { id: 'room', name: 'Habitación', type: 'select', options: ['Dormitorio', 'Sala', 'Cocina', 'Baño', 'Oficina', 'Garaje', 'Sótano', 'Universal'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Metal', 'Plástico', 'Tela', 'Mimbre', 'MDF', 'Mixto'] },
    { id: 'capacity', name: 'Capacidad', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande'] },
    { id: 'doors_drawers', name: 'Puertas/Cajones', type: 'select', options: ['Abierto', 'Con puertas', 'Con cajones', 'Mixto'] },
    { id: 'assembly', name: 'Ensamblaje', type: 'select', options: ['Pre-ensamblado', 'Fácil', 'Complejo'] },
    { id: 'modular', name: 'Modular', type: 'select', options: ['Sí', 'No'] }
  ],

  // Muebles de exterior
  'home-furniture-outdoor': [
    { id: 'furniture_type', name: 'Tipo de mueble', type: 'select', options: ['Mesa de jardín', 'Silla de jardín', 'Tumbona', 'Sombrilla', 'Banco', 'Columpio', 'Conjunto de jardín', 'Macetero'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Teca', 'Aluminio', 'Hierro forjado', 'Ratán sintético', 'Plástico', 'Textilene', 'Acero inoxidable'] },
    { id: 'weather_resistant', name: 'Resistente al clima', type: 'select', options: ['Sí', 'Tratamiento requerido', 'Solo interior cubierto', 'No'] },
    { id: 'seating_capacity', name: 'Capacidad', type: 'select', options: ['1 persona', '2 personas', '4 personas', '6 personas', '8+ personas', 'No aplica'] },
    { id: 'foldable', name: 'Plegable', type: 'select', options: ['Sí', 'No'] },
    { id: 'cushions_included', name: 'Cojines incluidos', type: 'select', options: ['Sí', 'Opcionales', 'No'] },
    { id: 'maintenance', name: 'Mantenimiento', type: 'select', options: ['Bajo', 'Medio', 'Alto'] }
  ],

  // Decoración (categoría general)
  'home-decor': [
    { id: 'decor_type', name: 'Tipo de decoración', type: 'select', options: ['Arte de pared', 'Iluminación', 'Textiles', 'Plantas', 'Espejos', 'Velas', 'Figuras decorativas', 'Marcos'] },
    { id: 'room', name: 'Habitación', type: 'select', options: ['Sala', 'Dormitorio', 'Cocina', 'Comedor', 'Baño', 'Oficina', 'Entrada', 'Todas'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Bohemio', 'Industrial', 'Escandinavo', 'Minimalista', 'Vintage', 'Rústico', 'Clásico'] },
    { id: 'color_palette', name: 'Paleta de colores', type: 'tags', options: ['Neutros', 'Tierra', 'Pasteles', 'Vivos', 'Monocromático', 'Metálicos'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Metal', 'Cerámica', 'Vidrio', 'Tela', 'Papel', 'Plástico', 'Natural'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande'] }
  ],

  // Arte de pared
  'home-decor-wall-art': [
    { id: 'art_type', name: 'Tipo de arte', type: 'select', options: ['Cuadro', 'Póster', 'Canvas', 'Fotografía', 'Vinilo decorativo', 'Escultura de pared', 'Tapiz', 'Espejo decorativo'] },
    { id: 'style', name: 'Estilo artístico', type: 'tags', options: ['Abstracto', 'Realista', 'Moderno', 'Vintage', 'Minimalista', 'Bohemio', 'Geométrico', 'Natural'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (menos de 30cm)', 'Mediano (30-60cm)', 'Grande (60-100cm)', 'Extra grande (más de 100cm)'] },
    { id: 'orientation', name: 'Orientación', type: 'select', options: ['Horizontal', 'Vertical', 'Cuadrado', 'Circular', 'Irregular'] },
    { id: 'frame_included', name: 'Marco incluido', type: 'select', options: ['Sí', 'No', 'Opcional'] },
    { id: 'color_scheme', name: 'Esquema de colores', type: 'tags', options: ['Blanco y negro', 'Colores cálidos', 'Colores fríos', 'Neutros', 'Vivos', 'Pasteles'] },
    { id: 'room_suggestion', name: 'Habitación sugerida', type: 'tags', options: ['Sala', 'Dormitorio', 'Comedor', 'Oficina', 'Cocina', 'Baño', 'Pasillo'] }
  ],

  // Iluminación decorativa
  'home-decor-lighting': [
    { id: 'light_type', name: 'Tipo de iluminación', type: 'select', options: ['Lámpara de mesa', 'Lámpara de pie', 'Colgante', 'Aplique de pared', 'Candelabro', 'Guirnalda', 'Vela LED'] },
    { id: 'bulb_type', name: 'Tipo de bombilla', type: 'select', options: ['LED', 'Incandescente', 'Halógena', 'Fluorescente', 'Vela', 'No incluida'] },
    { id: 'light_color', name: 'Color de luz', type: 'select', options: ['Blanco cálido', 'Blanco frío', 'Blanco natural', 'Colores RGB', 'Amarillo', 'Regulable'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Industrial', 'Vintage', 'Bohemio', 'Escandinavo', 'Clásico', 'Minimalista'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Metal', 'Madera', 'Vidrio', 'Cerámica', 'Tela', 'Plástico', 'Cristal', 'Ratán'] },
    { id: 'dimmable', name: 'Regulable', type: 'select', options: ['Sí', 'No'] },
    { id: 'room_suggestion', name: 'Habitación sugerida', type: 'tags', options: ['Sala', 'Dormitorio', 'Comedor', 'Oficina', 'Cocina', 'Baño'] }
  ],

  // Espejos
  'home-decor-mirrors': [
    { id: 'mirror_type', name: 'Tipo de espejo', type: 'select', options: ['De pared', 'De pie', 'De mesa', 'Decorativo', 'Funcional', 'Con iluminación'] },
    { id: 'shape', name: 'Forma', type: 'select', options: ['Rectangular', 'Redondo', 'Ovalado', 'Cuadrado', 'Irregular', 'Geométrico'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (menos de 40cm)', 'Mediano (40-80cm)', 'Grande (80-120cm)', 'Extra grande (más de 120cm)'] },
    { id: 'frame_material', name: 'Material del marco', type: 'tags', options: ['Madera', 'Metal', 'Plástico', 'Sin marco', 'Dorado', 'Plateado', 'Negro'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Vintage', 'Barroco', 'Minimalista', 'Industrial', 'Bohemio', 'Clásico'] },
    { id: 'room_suggestion', name: 'Habitación sugerida', type: 'tags', options: ['Baño', 'Dormitorio', 'Entrada', 'Sala', 'Comedor'] },
    { id: 'mounting', name: 'Montaje', type: 'select', options: ['Colgante', 'Apoyo', 'Adhesivo', 'Atornillado'] }
  ],

  // Jarrones y floreros
  'home-decor-vases': [
    { id: 'vase_type', name: 'Tipo', type: 'select', options: ['Jarrón decorativo', 'Florero', 'Maceta decorativa', 'Centro de mesa', 'Jarrón de pie'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Cerámica', 'Vidrio', 'Metal', 'Madera', 'Plástico', 'Piedra', 'Cristal', 'Bambú'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (menos de 20cm)', 'Mediano (20-40cm)', 'Grande (40-60cm)', 'Extra grande (más de 60cm)'] },
    { id: 'shape', name: 'Forma', type: 'select', options: ['Cilíndrico', 'Cónico', 'Esférico', 'Cuadrado', 'Irregular', 'Geométrico'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Clásico', 'Minimalista', 'Bohemio', 'Industrial', 'Rústico', 'Elegante'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Transparente', 'Dorado', 'Plateado', 'Azul', 'Verde', 'Multicolor'] },
    { id: 'use', name: 'Uso', type: 'select', options: ['Solo decorativo', 'Para flores frescas', 'Para plantas', 'Centro de mesa', 'Múltiple'] }
  ],

  // Velas y aromaterapia
  'home-decor-candles': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Vela perfumada', 'Vela decorativa', 'Difusor', 'Aceite esencial', 'Incienso', 'Candelabro', 'Portavelas'] },
    { id: 'scent_family', name: 'Familia de aroma', type: 'tags', options: ['Floral', 'Frutal', 'Woody', 'Fresh', 'Oriental', 'Gourmand', 'Sin aroma'] },
    { id: 'scent', name: 'Aroma específico', type: 'tags', options: ['Lavanda', 'Vainilla', 'Canela', 'Eucalipto', 'Limón', 'Rosa', 'Sándalo', 'Menta', 'Coco'] },
    { id: 'wax_type', name: 'Tipo de cera', type: 'select', options: ['Soja', 'Parafina', 'Cera de abeja', 'Coco', 'Mixta', 'No aplica'] },
    { id: 'burn_time', name: 'Tiempo de quemado', type: 'select', options: ['Menos de 10h', '10-25h', '25-50h', '50-80h', 'Más de 80h', 'No aplica'] },
    { id: 'container', name: 'Contenedor', type: 'select', options: ['Vidrio', 'Metal', 'Cerámica', 'Sin contenedor', 'Reutilizable'] },
    { id: 'room_suggestion', name: 'Habitación sugerida', type: 'tags', options: ['Sala', 'Dormitorio', 'Baño', 'Comedor', 'Oficina', 'Todas'] }
  ],

  // Cojines y textiles
  'home-decor-cushions': [
    { id: 'textile_type', name: 'Tipo de textil', type: 'select', options: ['Cojín decorativo', 'Funda de cojín', 'Manta decorativa', 'Cortina', 'Alfombra', 'Tapete', 'Mantel'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Algodón', 'Lino', 'Poliéster', 'Terciopelo', 'Seda', 'Lana', 'Microfibra', 'Yute'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (30x30cm)', 'Mediano (45x45cm)', 'Grande (60x60cm)', 'Rectangular', 'Personalizado'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Rayas', 'Geométrico', 'Floral', 'Abstracto', 'Animal print', 'Étnico', 'Texturizado'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Beige', 'Gris', 'Negro', 'Azul', 'Verde', 'Rosa', 'Amarillo', 'Multicolor'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Bohemio', 'Escandinavo', 'Industrial', 'Clásico', 'Minimalista', 'Rústico'] },
    { id: 'washable', name: 'Lavable', type: 'select', options: ['Lavable en máquina', 'Solo limpieza en seco', 'Lavado a mano', 'No lavable'] }
  ],

  // Cocina y comedor (categoría general)
  'home-kitchen': [
    { id: 'kitchen_category', name: 'Categoría de cocina', type: 'select', options: ['Electrodomésticos', 'Utensilios', 'Vajilla', 'Almacenamiento', 'Textiles', 'Decoración'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Acero inoxidable', 'Cerámica', 'Vidrio', 'Plástico', 'Madera', 'Silicona', 'Aluminio', 'Hierro fundido'] },
    { id: 'dishwasher_safe', name: 'Apto para lavavajillas', type: 'select', options: ['Sí', 'No', 'Solo parte superior'] },
    { id: 'microwave_safe', name: 'Apto para microondas', type: 'select', options: ['Sí', 'No'] },
    { id: 'use_case', name: 'Uso', type: 'tags', options: ['Cocinar', 'Servir', 'Almacenar', 'Decorar', 'Hornear', 'Beber'] },
    { id: 'capacity', name: 'Capacidad', type: 'select', options: ['Individual', '2-4 personas', '4-6 personas', '6+ personas', 'Familiar'] }
  ],

  // Electrodomésticos
  'home-kitchen-appliances': [
    { id: 'appliance_type', name: 'Tipo de electrodoméstico', type: 'select', options: ['Licuadora', 'Cafetera', 'Tostadora', 'Microondas', 'Freidora de aire', 'Batidora', 'Procesador', 'Plancha', 'Aspiradora'] },
    { id: 'power', name: 'Potencia', type: 'select', options: ['Menos de 500W', '500-1000W', '1000-1500W', '1500-2000W', 'Más de 2000W'] },
    { id: 'capacity', name: 'Capacidad', type: 'select', options: ['1-2 personas', '3-4 personas', '5-6 personas', 'Familiar (6+ personas)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Programable', 'Digital', 'Múltiples velocidades', 'Auto-apagado', 'Antiadherente', 'Desmontable'] },
    { id: 'energy_efficiency', name: 'Eficiencia energética', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'warranty', name: 'Garantía', type: 'select', options: ['6 meses', '1 año', '2 años', '3 años', '5 años'] }
  ],

  // Utensilios de cocina
  'home-kitchen-cookware': [
    { id: 'cookware_type', name: 'Tipo de utensilio', type: 'select', options: ['Sartén', 'Olla', 'Cazuela', 'Wok', 'Parrilla', 'Molde para hornear', 'Cuchillos', 'Tabla de cortar', 'Set completo'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Acero inoxidable', 'Antiadherente', 'Hierro fundido', 'Aluminio', 'Cerámica', 'Cobre', 'Carbón', 'Silicona'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (menos de 20cm)', 'Mediano (20-28cm)', 'Grande (28-35cm)', 'Extra grande (más de 35cm)'] },
    { id: 'heat_source', name: 'Fuente de calor', type: 'tags', options: ['Gas', 'Eléctrico', 'Inducción', 'Horno', 'Microondas', 'Universal'] },
    { id: 'dishwasher_safe', name: 'Apto para lavavajillas', type: 'select', options: ['Sí', 'No'] },
    { id: 'oven_safe', name: 'Apto para horno', type: 'select', options: ['Sí', 'No', 'Hasta 180°C', 'Hasta 230°C', 'Más de 230°C'] },
    { id: 'pieces', name: 'Número de piezas', type: 'select', options: ['1 pieza', '2-3 piezas', '4-6 piezas', '7-10 piezas', 'Más de 10 piezas'] }
  ],

  // Vajilla y cristalería
  'home-kitchen-tableware': [
    { id: 'tableware_type', name: 'Tipo de vajilla', type: 'select', options: ['Platos', 'Vasos', 'Copas', 'Tazas', 'Bowls', 'Cubiertos', 'Fuentes', 'Set completo'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Porcelana', 'Cerámica', 'Vidrio', 'Cristal', 'Melamina', 'Acero inoxidable', 'Madera', 'Bambú'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Moderno', 'Clásico', 'Elegante', 'Casual', 'Rústico', 'Minimalista', 'Vintage'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Transparente', 'Azul', 'Verde', 'Rosa', 'Dorado', 'Multicolor'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Formal', 'Fiestas', 'Exterior', 'Niños', 'Especial'] },
    { id: 'dishwasher_safe', name: 'Apto para lavavajillas', type: 'select', options: ['Sí', 'No'] },
    { id: 'microwave_safe', name: 'Apto para microondas', type: 'select', options: ['Sí', 'No'] },
    { id: 'pieces', name: 'Número de piezas', type: 'select', options: ['1 pieza', '2-4 piezas', '6 piezas', '12 piezas', '16+ piezas'] }
  ],

  // Almacenamiento de cocina
  'home-kitchen-storage': [
    { id: 'storage_type', name: 'Tipo de almacenamiento', type: 'select', options: ['Contenedor hermético', 'Frasco', 'Canasta', 'Organizador de cajón', 'Estante', 'Despensa', 'Refrigerador'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Plástico', 'Vidrio', 'Acero inoxidable', 'Cerámica', 'Madera', 'Bambú', 'Silicona'] },
    { id: 'capacity', name: 'Capacidad', type: 'select', options: ['Menos de 500ml', '500ml-1L', '1-2L', '2-5L', 'Más de 5L'] },
    { id: 'airtight', name: 'Hermético', type: 'select', options: ['Sí', 'No'] },
    { id: 'transparent', name: 'Transparente', type: 'select', options: ['Sí', 'No', 'Parcialmente'] },
    { id: 'stackable', name: 'Apilable', type: 'select', options: ['Sí', 'No'] },
    { id: 'use_case', name: 'Uso recomendado', type: 'tags', options: ['Granos', 'Líquidos', 'Especias', 'Snacks', 'Refrigerador', 'Congelador', 'Despensa'] }
  ],
  // Ropa de abrigo (categoría general)
  'fashion-clothing-outerwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Beige', 'Verde', 'Marrón', 'Rojo', 'Blanco', 'Camel'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material principal', type: 'tags', options: ['Lana', 'Poliéster', 'Algodón', 'Plumón', 'Cuero', 'Nylon', 'Gamuza', 'Sintético'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Otoño', 'Invierno', 'Primavera', 'Entre estaciones', 'Todo el año'] },
    { id: 'protection', name: 'Protección', type: 'tags', options: ['Impermeable', 'Cortavientos', 'Térmico', 'Transpirable', 'Resistente al agua'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Casual', 'Formal', 'Deportivo', 'Elegante', 'Vintage', 'Moderno', 'Clásico'] }
  ],
  // Cazadoras
  'fashion-clothing-outerwear-hunters': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Verde militar', 'Marrón', 'Azul marino', 'Gris', 'Camuflaje'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Cuero', 'Sintético', 'Gamuza', 'Nylon', 'Poliéster'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Biker', 'Aviador', 'Bomber', 'Clásica', 'Moderna'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Cierre frontal', 'Bolsillos', 'Forro', 'Capucha', 'Cinturón'] }
  ],
  // Chaquetas y abrigos
  'fashion-clothing-outerwear-jackets-coats': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Beige', 'Camel', 'Marrón', 'Verde', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Cachemira', 'Poliéster', 'Algodón', 'Plumón', 'Mezcla'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Medio', 'Largo', 'Maxi'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Trench', 'Abrigo', 'Chaqueta', 'Blazer', 'Parka', 'Duffle coat'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Botones', 'Cierre', 'Doble botonadura', 'Cinturón'] }
  ],
  // Pantalones impermeables
  'fashion-clothing-outerwear-waterproof-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde', 'Amarillo', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['PVC', 'Nylon impermeable', 'Poliéster con DWR', 'Gore-Tex', 'Vinilo'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Lluvia', 'Pesca', 'Trabajo', 'Motocicleta', 'Senderismo', 'Náutica'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Sellado', 'Reflectivos', 'Bolsillos', 'Cintura ajustable'] }
  ],
  // Trajes impermeables
  'fashion-clothing-outerwear-waterproof-suits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde', 'Amarillo', 'Naranja'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Neopreno', 'PVC', 'Poliuretano', 'Caucho', 'Gore-Tex'] },
    { id: 'suit_type', name: 'Tipo de traje', type: 'select', options: ['Monopiezas', 'Dos piezas', 'Overol', 'Conjunto completo'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Pesca', 'Buceo', 'Trabajo industrial', 'Limpieza', 'Químicos', 'Náutica'] },
    { id: 'protection_level', name: 'Nivel de protección', type: 'select', options: ['Básico', 'Intermedio', 'Profesional', 'Industrial'] }
  ],
  // Pantalones y trajes para nieve
  'fashion-clothing-outerwear-snow-gear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Rojo', 'Verde', 'Blanco', 'Amarillo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Softshell', 'Hardshell', 'Poliéster técnico', 'Nylon', 'Membrana impermeable'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Pantalones', 'Monos', 'Trajes completos', 'Overalls'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Esquí', 'Snowboard', 'Montañismo', 'Senderismo invernal', 'Trabajo exterior'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Impermeable', 'Aislamiento térmico', 'Ventilación', 'Reflectivos'] }
  ],
  // Chalecos (ropa de abrigo)
  'fashion-clothing-outerwear-vests': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Beige', 'Verde', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Plumón', 'Sintético', 'Lana', 'Fleece', 'Poliéster', 'Algodón'] },
    { id: 'vest_type', name: 'Tipo de chaleco', type: 'select', options: ['Acolchado', 'Polar', 'Formal', 'Casual', 'Deportivo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Capucha', 'Cierre frontal', 'Ligero', 'Cálido', 'Transpirable'] }
  ],
  // Ropa de motociclista
  'fashion-clothing-outerwear-motorcycle': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Marrón', 'Azul marino', 'Gris', 'Rojo', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Cuero', 'Textil técnico', 'Kevlar', 'Cordura', 'Mesh', 'Sintético reforzado'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Chaqueta', 'Pantalones', 'Monos', 'Trajes completos', 'Chalecos'] },
    { id: 'protection', name: 'Protección', type: 'tags', options: ['Protecciones CE', 'Espaldera', 'Rodilleras', 'Coderas', 'Reflectivos'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Deportivo', 'Touring', 'Urban', 'Racing'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Entre estaciones', 'Todo el año'] }
  ],
  // Pantalones (categoría general)
  'fashion-clothing-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Beige', 'Marrón', 'Verde', 'Blanco', 'Khaki', 'Camel'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material principal', type: 'tags', options: ['Algodón', 'Mezclilla', 'Poliéster', 'Lino', 'Lana', 'Spandex', 'Cuero', 'Sintético'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Slim', 'Straight', 'Boot cut'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Cortos', 'Capri', '7/8', 'Largos', 'Extra largos'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Trabajo', 'Deportivo', 'Elegante', 'Fiesta'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] }
  ],
  // Pantalones generales
  'fashion-clothing-pants-general': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Beige', 'Marrón', 'Verde', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Lino', 'Lana', 'Mezcla'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Slim'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Moderno', 'Casual', 'Formal'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Cintura elástica', 'Plisados', 'Lisos', 'Cremallera'] }
  ],
  // Pantalones tipo cargo
  'fashion-clothing-pants-cargo': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Verde militar', 'Khaki', 'Negro', 'Gris', 'Beige', 'Camuflaje'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Canvas', 'Ripstop', 'Poliéster', 'Mezcla resistente'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Regular', 'Holgado', 'Tactical', 'Slim cargo'] },
    { id: 'pockets', name: 'Tipo de bolsillos', type: 'tags', options: ['Bolsillos laterales', 'Bolsillos con velcro', 'Bolsillos con cierre', 'Múltiples bolsillos'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Militar', 'Urbano', 'Outdoor', 'Trabajo', 'Casual'] }
  ],
  // Chinos
  'fashion-clothing-pants-chinos': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Khaki', 'Beige', 'Azul marino', 'Negro', 'Gris', 'Blanco', 'Verde oliva'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Algodón-spandex', 'Twill', 'Gabardina', 'Mezcla'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Slim', 'Regular', 'Straight', 'Tailored', 'Athletic'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Smart casual', 'Trabajo', 'Oficina', 'Formal'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Planchado permanente', 'Stretch', 'Resistente a arrugas', 'Bolsillos traseros'] }
  ],
  // Vaqueros / Jeans
  'fashion-clothing-pants-jeans': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul índigo', 'Azul claro', 'Azul oscuro', 'Negro', 'Gris', 'Blanco', 'Desgastado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['100% Algodón', 'Algodón-spandex', 'Mezclilla stretch', 'Denim crudo', 'Eco-denim'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Skinny', 'Slim', 'Straight', 'Regular', 'Relaxed', 'Boot cut', 'Wide leg'] },
    { id: 'rise', name: 'Altura de cintura', type: 'select', options: ['Tiro bajo', 'Tiro medio', 'Tiro alto', 'Tiro extra alto'] },
    { id: 'wash', name: 'Lavado', type: 'tags', options: ['Clásico', 'Desgastado', 'Vintage', 'Raw denim', 'Stone wash', 'Acid wash'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Rotos', 'Desgastados', 'Bordados', 'Tachuelas', 'Parches'] }
  ],
  // Mallas vaqueras / Jeggings
  'fashion-clothing-pants-jeggings': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul índigo', 'Azul claro', 'Azul oscuro', 'Negro', 'Gris', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-spandex', 'Polyester-spandex', 'Denim stretch', 'Lycra-algodón'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ultra ajustado', 'Ajustado', 'Compresión ligera'] },
    { id: 'rise', name: 'Altura de cintura', type: 'select', options: ['Tiro medio', 'Tiro alto', 'Tiro extra alto'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Efecto jean', 'Liso', 'Con costuras', 'Push-up', 'Shaping'] }
  ],
  // Pantalones para correr (casual)
  'fashion-clothing-pants-running': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rojo', 'Blanco', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster técnico', 'Dri-FIT', 'Spandex', 'Nylon', 'Mezcla transpirable'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Largos', '7/8', 'Tobilleros', 'Capri'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Reflectivos', 'Bolsillos', 'Transpirable', 'Secado rápido', 'Compresión', 'Anti-odor'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Running', 'Jogging', 'Fitness', 'Yoga', 'Casual'] }
  ],
  // Vestidos
  'fashion-clothing-dresses': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Rosa', 'Morado', 'Beige', 'Estampado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Seda', 'Lino', 'Poliéster', 'Satén', 'Encaje', 'Chiffon', 'Terciopelo'] },
    { id: 'dress_length', name: 'Largo', type: 'select', options: ['Mini', 'Midi', 'Maxi', 'Largo al piso', 'Asimétrico'] },
    { id: 'dress_style', name: 'Estilo', type: 'select', options: ['Casual', 'Formal', 'Cocktail', 'Fiesta', 'Noche', 'Playa', 'Oficina'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga', 'Manga abullonada', 'Manga murciélago'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Redondo', 'V', 'Cuadrado', 'Halter', 'Bardot', 'Asimétrico', 'Alto'] },
    { id: 'silhouette', name: 'Silueta', type: 'select', options: ['Ajustado', 'Línea A', 'Imperio', 'Sirena', 'Recto', 'Envolvente', 'Globo'] },
    { id: 'waist_line', name: 'Línea de cintura', type: 'select', options: ['Alta', 'Natural', 'Baja', 'Sin cintura', 'Elástica', 'Con cinturón'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Floral', 'Rayas', 'Lunares', 'Geométrico', 'Animal print', 'Abstracto'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Trabajo', 'Fiesta', 'Boda', 'Graduación', 'Playa', 'Noche'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Con forro', 'Con bolsillos', 'Con cierre', 'Con abertura', 'Con cinturón', 'Con aplicaciones'] }
  ],

  // Leggings (casual)
  'fashion-clothing-pants-leggings': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Azul marino', 'Verde', 'Rosa', 'Morado', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-spandex', 'Poliéster-spandex', 'Lycra', 'Bambú', 'Modal'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Tobilleros', '7/8', 'Largos', 'Capri', 'Cortos'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Básicos', 'Estampados', 'Con textura', 'Shaping', 'Push-up'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Deportivo', 'Lounge', 'Yoga', 'Athleisure'] },
    { id: 'rise', name: 'Altura de cintura', type: 'select', options: ['Tiro medio', 'Tiro alto', 'Tiro extra alto'] }
  ],
  // Prendas de ropa superiores (categoría general)
  'fashion-clothing-tops': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Beige', 'Amarillo', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material principal', type: 'tags', options: ['Algodón', 'Poliéster', 'Lino', 'Seda', 'Lana', 'Viscosa', 'Modal', 'Spandex'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Trabajo', 'Fiesta', 'Deportivo', 'Elegante'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Clásico', 'Moderno', 'Casual', 'Elegante', 'Vintage', 'Bohemio'] }
  ],
  // Blusas
  'fashion-clothing-tops-blouses': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Rosa', 'Verde', 'Beige', 'Rojo', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Seda', 'Chiffon', 'Satén', 'Algodón', 'Viscosa', 'Poliéster'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Escote barco', 'Escote halter', 'Off-shoulder'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga', 'Manga abombada'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Trabajo', 'Fiesta', 'Elegante'] }
  ],
  // Túnicas
  'fashion-clothing-tops-tunics': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Beige', 'Azul', 'Verde', 'Rosa', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Lino', 'Viscosa', 'Modal', 'Seda', 'Chiffon'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corta', 'Midi', 'Larga', 'Maxi'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Bohemio', 'Étnico', 'Moderno', 'Clásico', 'Hippie'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Escote barco', 'Cuello alto'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Playa', 'Boho', 'Vacaciones', 'Verano'] }
  ],
  // Suéteres
  'fashion-clothing-tops-sweaters': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Beige', 'Blanco', 'Azul marino', 'Verde', 'Rojo', 'Camel'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Cachemira', 'Algodón', 'Acrílico', 'Mezcla', 'Alpaca'] },
    { id: 'knit_type', name: 'Tipo de tejido', type: 'select', options: ['Punto fino', 'Punto grueso', 'Cable knit', 'Jacquard', 'Punto waffle'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto', 'Cuello tortuga'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Otoño', 'Invierno', 'Entre estaciones'] }
  ],
  // Sudaderas con capucha
  'fashion-clothing-tops-hoodies': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Blanco', 'Azul marino', 'Verde', 'Rosa', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'French terry', 'Fleece', 'Mezcla'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Pullover', 'Cierre frontal', 'Medio cierre'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillo canguro', 'Cordón ajustable', 'Puños elásticos', 'Forro polar'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Deportivo', 'Streetwear', 'Lounge'] }
  ],
  // Sudaderas (sin capucha)
  'fashion-clothing-tops-sweatshirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Blanco', 'Azul marino', 'Verde', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'French terry', 'Fleece', 'Poliéster', 'Mezcla'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Mock neck'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Básica', 'Vintage', 'Moderna', 'Minimalista'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Deportivo', 'Casa', 'Universidad'] }
  ],
  // Bodis
  'fashion-clothing-tops-bodysuits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Beige', 'Gris', 'Rosa', 'Azul', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-spandex', 'Modal', 'Viscosa', 'Lycra', 'Ribbed cotton'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Escote cuadrado', 'Off-shoulder'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Broches', 'Sin cierre', 'Hooks', 'Cierre lateral'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Básico', 'Sexy', 'Elegante', 'Casual', 'Ajustado'] }
  ],
  // Cárdigan
  'fashion-clothing-tops-cardigans': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Beige', 'Blanco', 'Azul marino', 'Verde', 'Camel', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Cachemira', 'Algodón', 'Acrílico', 'Viscosa', 'Mezcla'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Medio', 'Largo', 'Maxi'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Botones', 'Cierre', 'Sin cierre', 'Cinturón'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Moderno', 'Oversized', 'Ajustado', 'Bohemio'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Trabajo', 'Elegante'] }
  ],
  // Sobrecamisas
  'fashion-clothing-tops-overshirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul denim', 'Negro', 'Blanco', 'Khaki', 'Verde militar', 'Gris', 'Cuadros'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Denim', 'Algodón', 'Franela', 'Lino', 'Pana', 'Twill'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Oversized', 'Regular', 'Vintage', 'Moderno', 'Grunge'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Cuadros', 'Rayas', 'Denim wash', 'Estampado'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Botones', 'Presiones', 'Sin cierre'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Streetwear', 'Layering', 'Urbano'] }
  ],
  // Polos (casuales)
  'fashion-clothing-tops-polos': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul marino', 'Gris', 'Verde', 'Rojo', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Piqué algodón', 'Algodón', 'Poliéster', 'Mezcla algodón-poliéster'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Slim fit'] },
    { id: 'collar_style', name: 'Estilo de cuello', type: 'select', options: ['Cuello clásico', 'Cuello alto', 'Cuello moderno'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Smart casual', 'Trabajo', 'Golf', 'Verano'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Manga corta', 'Manga larga', 'Logo bordado', 'Bolsillo'] }
  ],
  // Camisas (categoría general)
  'fashion-clothing-tops-shirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rosa', 'Verde', 'Estampados', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Algodón', 'Lino', 'Seda', 'Poliéster', 'Mezcla', 'Oxford', 'Popelina'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga corta', 'Manga larga', 'Sin mangas', 'Manga 3/4'] },
    { id: 'collar_type', name: 'Tipo de cuello', type: 'select', options: ['Cuello clásico', 'Cuello mao', 'Cuello button-down', 'Sin cuello'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Slim fit', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Trabajo', 'Fiesta', 'Verano'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Rayas', 'Cuadros', 'Estampado', 'Floral'] }
  ],
  // Camisetas de manga corta (subcategoría de camisas)
  'fashion-clothing-tops-shirts-short-sleeve': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Amarillo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Algodón orgánico', 'Poliéster', 'Mezcla', 'Modal'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversize'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello henley'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Básica', 'Gráfica', 'Con mensaje', 'Lisa', 'Vintage'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Deportivo', 'Verano', 'Lounge'] }
  ],
  // Camisetas sin mangas (subcategoría de camisas)
  'fashion-clothing-tops-shirts-sleeveless': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Modal', 'Bambú', 'Poliéster', 'Lino'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Tank top'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Espalda nadadora'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Básica', 'Deportiva', 'Casual', 'Playa'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Verano', 'Playa', 'Deportivo', 'Lounge'] }
  ],
  // Ropa para dormir y para estar en casa (categoría general)
  'fashion-clothing-sleepwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Rosa', 'Verde', 'Beige', 'Morado', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material principal', type: 'tags', options: ['Algodón', 'Modal', 'Seda', 'Satén', 'Bambú', 'Flanela', 'Polar', 'Lana'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Pijamas', 'Camisones', 'Albornoces', 'Ropa térmica', 'Loungewear', 'Monos'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Entre estaciones', 'Todo el año'] },
    { id: 'comfort', name: 'Características de comodidad', type: 'tags', options: ['Suave', 'Transpirable', 'Cálido', 'Ligero', 'Elástico', 'Hipoalergénico'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Dormir', 'Casa', 'Relax', 'Spa', 'Hotel', 'Viaje'] }
  ],
  // Ropa interior térmica
  'fashion-clothing-sleepwear-thermal': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul marino', 'Beige', 'Verde militar'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana merino', 'Algodón térmico', 'Poliéster técnico', 'Bambú térmico', 'Mezcla térmica'] },
    { id: 'thermal_level', name: 'Nivel térmico', type: 'select', options: ['Ligero', 'Medio', 'Cálido', 'Ultra cálido'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'tags', options: ['Camiseta térmica', 'Pantalón térmico', 'Conjunto térmico', 'Calzoncillos largos'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Anti-odor', 'Secado rápido', 'Aislamiento', 'Capa base'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Deportes invernales', 'Montañismo', 'Trabajo exterior', 'Casual', 'Dormir'] }
  ],
  // Ropa cómoda
  'fashion-clothing-sleepwear-comfortable': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Beige', 'Blanco', 'Rosa', 'Azul', 'Verde', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Modal', 'Bambú', 'French terry', 'Jersey suave', 'Mezcla cómoda'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'tags', options: ['Pantalones loungewear', 'Camisetas oversize', 'Shorts cómodos', 'Hoodies suaves', 'Conjuntos'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Holgado', 'Oversize', 'Regular cómodo', 'Relaxed'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Minimalista', 'Casual', 'Athleisure', 'Boho', 'Moderno'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casa', 'Relax', 'Trabajo remoto', 'Fin de semana', 'Viaje'] }
  ],
  // Camisones
  'fashion-clothing-sleepwear-nightgowns': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Azul', 'Verde', 'Beige', 'Morado', 'Estampados florales'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Seda', 'Satén', 'Modal', 'Algodón', 'Bambú', 'Chiffon', 'Encaje'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Midi', 'Largo', 'Maxi'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Vintage', 'Moderno', 'Romántico', 'Sexy', 'Elegante'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Escote corazón', 'Off-shoulder'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Con encaje', 'Con bordados', 'Transparencias', 'Ajustable', 'Suave'] }
  ],
  // Pijamas
  'fashion-clothing-sleepwear-pajamas': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Rosa', 'Verde', 'Blanco', 'Estampados', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Modal', 'Flanela', 'Seda', 'Satén', 'Bambú', 'Jersey'] },
    { id: 'set_type', name: 'Tipo de conjunto', type: 'select', options: ['2 piezas', '3 piezas', 'Camisón', 'Mono pijama', 'Shorts set'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Clásico', 'Moderno', 'Vintage', 'Divertido', 'Elegante', 'Básico'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Rayas', 'Lunares', 'Cuadros', 'Estampado', 'Floral'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Entre estaciones', 'Todo el año'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Cordón', 'Botones', 'Cintura elástica', 'Puños ajustables'] }
  ],
  // Albornoces
  'fashion-clothing-sleepwear-robes': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Gris', 'Beige', 'Azul marino', 'Rosa', 'Verde', 'Burgundy'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Toalla algodón', 'Microfibra', 'Seda', 'Satén', 'Polar', 'Bambú', 'Waffle'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Midi', 'Largo', 'Maxi'] },
    { id: 'weight', name: 'Peso del tejido', type: 'select', options: ['Ligero', 'Medio', 'Pesado', 'Ultra suave'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Spa', 'Hotel', 'Kimono', 'Moderno'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Cinturón', 'Bolsillos', 'Capucha', 'Bordado', 'Absorbente', 'Secado rápido'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Spa', 'Baño', 'Playa', 'Casa', 'Hotel', 'Regalo'] }
  ],
  // Monos para dormir
  'fashion-clothing-sleepwear-jumpsuits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris', 'Rosa', 'Azul', 'Verde', 'Beige', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Modal', 'Bambú', 'French terry', 'Jersey suave', 'Polar'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Relaxed', 'Ajustado', 'Oversize', 'Vintage', 'Moderno'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Cierre frontal', 'Botones', 'Sin cierre', 'Elástico'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Bolsillos', 'Capucha', 'Pies cubiertos', 'Manga larga', 'Cintura ajustable'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Dormir', 'Loungewear', 'Casa', 'Relax', 'Invierno'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Holgado', 'Cómodo', 'Regular', 'Ajustado'] }
  ],
  // Calcetines (categoría general)
  'fashion-clothing-socks': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 'Amarillo', 'Morado', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material principal', type: 'tags', options: ['Algodón', 'Bambú', 'Lana', 'Poliéster', 'Nylon', 'Spandex', 'Modal', 'Mezcla'] },
    { id: 'sock_type', name: 'Tipo de calcetín', type: 'select', options: ['Tobillo', 'Deportivos', 'Largos', 'Invisibles', 'Medios', 'Altos'] },
    { id: 'thickness', name: 'Grosor', type: 'select', options: ['Fino', 'Medio', 'Grueso', 'Ultra fino'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Deportivo', 'Formal', 'Trabajo', 'Casa', 'Especial'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Antibacterial', 'Antideslizante', 'Acolchado', 'Compresión', 'Refuerzo talón/punta'] }
  ],
  // Calcetines de tobillo
  'fashion-clothing-socks-ankle': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Bambú', 'Modal', 'Mezcla algodón-spandex', 'Microfibra'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Básicos', 'Deportivos', 'Casuales', 'Con logo', 'Lisos'] },
    { id: 'thickness', name: 'Grosor', type: 'select', options: ['Fino', 'Medio', 'Transpirable'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Sin costuras', 'Transpirable', 'Antibacterial', 'Elástico', 'Cómodo'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Deportivo', 'Diario', 'Verano'] }
  ],
  // Calcetines deportivos
  'fashion-clothing-socks-sports': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rojo', 'Amarillo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster técnico', 'Dri-FIT', 'CoolMax', 'Merino wool', 'Sintético transpirable'] },
    { id: 'sport_type', name: 'Tipo de deporte', type: 'tags', options: ['Running', 'Fitness', 'Ciclismo', 'Tenis', 'Basketball', 'Fútbol', 'CrossFit'] },
    { id: 'height', name: 'Altura', type: 'select', options: ['Tobillo', 'Crew', 'Mid-calf', 'Knee high'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Secado rápido', 'Anti-odor', 'Acolchado', 'Compresión', 'Refuerzo'] },
    { id: 'cushioning', name: 'Acolchado', type: 'select', options: ['Sin acolchado', 'Ligero', 'Medio', 'Máximo'] }
  ],
  // Calcetines para deporte
  'fashion-clothing-socks-athletic': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul marino', 'Verde', 'Rojo'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Mezcla sintética', 'Poliéster-spandex', 'Nylon-elastano', 'Lana merino', 'Bambú técnico'] },
    { id: 'performance', name: 'Rendimiento', type: 'tags', options: ['Alto rendimiento', 'Entrenamiento', 'Competición', 'Profesional', 'Amateur'] },
    { id: 'activity_level', name: 'Nivel de actividad', type: 'select', options: ['Bajo impacto', 'Medio impacto', 'Alto impacto', 'Extremo'] },
    { id: 'features', name: 'Características técnicas', type: 'tags', options: ['Gestión humedad', 'Control temperatura', 'Anti-ampollas', 'Soporte arco', 'Zonas de ventilación'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Compresión'] }
  ],
  // Calcetines largos
  'fashion-clothing-socks-long': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Gris', 'Azul marino', 'Marrón', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Algodón', 'Cachemira', 'Lana merino', 'Mezcla térmica', 'Bambú'] },
    { id: 'height', name: 'Altura', type: 'select', options: ['Medio muslo', 'Rodilla', 'Pantorrilla', 'Sobre la rodilla'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásicos', 'Elegantes', 'Casuales', 'Térmicos', 'Dress socks'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Rayas', 'Rombos', 'Cuadros', 'Texturas', 'Jacquard'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Formal', 'Oficina', 'Invierno', 'Elegante', 'Casual'] },
    { id: 'warmth', name: 'Nivel de calor', type: 'select', options: ['Ligero', 'Medio', 'Cálido', 'Ultra cálido'] }
  ],
  // Calcetines de baile
  'fashion-clothing-socks-dance': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Beige', 'Transparente', 'Bronceado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Lycra', 'Spandex', 'Microfibra', 'Seda', 'Mezcla elástica'] },
    { id: 'dance_type', name: 'Tipo de baile', type: 'tags', options: ['Ballet', 'Jazz', 'Contemporáneo', 'Tap', 'Ballroom', 'Latin', 'Flamenco'] },
    { id: 'sock_style', name: 'Estilo de calcetín', type: 'select', options: ['Foot undies', 'Convertibles', 'Stirrup', 'Footless', 'Medias'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antideslizante', 'Grip sole', 'Seamless toe', 'Arch support', 'Flexible', 'Duradero'] },
    { id: 'transparency', name: 'Transparencia', type: 'select', options: ['Opaco', 'Semi-transparente', 'Transparente', 'Ultra fino'] }
  ],
  // Pinkis (calcetines invisibles)
  'fashion-clothing-socks-no-show': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Beige', 'Gris', 'Rosa', 'Transparente'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S (35-38)', 'M (39-42)', 'L (43-46)', 'XL (47-50)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-spandex', 'Microfibra', 'Nylon', 'Bambú', 'Modal', 'Silicona'] },
    { id: 'cut_style', name: 'Estilo de corte', type: 'select', options: ['Ultra bajo', 'Invisible', 'No-show', 'Loafer', 'Ballet flat'] },
    { id: 'grip_type', name: 'Tipo de agarre', type: 'select', options: ['Banda silicona', 'Gel heel', 'Adhesivo', 'Sin agarre', 'Doble silicona'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antideslizante', 'Transpirable', 'Sin costuras', 'Forma anatómica', 'Invisible', 'Cómodo'] },
    { id: 'shoe_type', name: 'Tipo de zapato', type: 'tags', options: ['Sneakers', 'Flats', 'Loafers', 'Heels', 'Boat shoes', 'Canvas shoes'] }
  ],
  // Papas fritas
  'food-snacks-chips': [
    { id: 'flavor', name: 'Sabor', type: 'tags', options: ['Original', 'BBQ', 'Limón', 'Queso', 'Picante'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Lays', 'Pringles', 'Doritos', 'Cheetos', 'Ruffles'] },
    { id: 'package_size', name: 'Tamaño', type: 'select', options: ['Individual', 'Familiar', 'Party Size'] },
    { id: 'diet', name: 'Características', type: 'tags', options: ['Sin Gluten', 'Bajo en Grasa', 'Sin Trans', 'Orgánico'] }
  ],
  // Trajes de pantalón
  'fashion-clothing-suits-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Carbón', 'Marrón', 'Beige', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['36', '38', '40', '42', '44', '46', '48', '50', '52'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Slim Fit', 'Regular Fit', 'Classic Fit', 'Tailored Fit'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Algodón', 'Lino', 'Seda', 'Mezcla de lana', 'Poliéster'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Formal', 'Negocios', 'Boda', 'Graduación', 'Entrevista', 'Oficina'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Primavera/Verano', 'Otoño/Invierno', 'Todo el año'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Moderno', 'Italiano', 'Americano', 'Británico'] }
  ],
  // Trajes de falda
  'fashion-clothing-suits-skirt': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Carbón', 'Marrón', 'Beige', 'Blanco', 'Rosa'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'skirt_length', name: 'Largo de falda', type: 'select', options: ['Mini', 'Por encima de rodilla', 'A la rodilla', 'Midi', 'Largo'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Algodón', 'Lino', 'Seda', 'Poliéster', 'Mezcla'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'A-line'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Formal', 'Negocios', 'Oficina', 'Presentación', 'Entrevista', 'Conferencia'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Moderno', 'Ejecutivo', 'Conservador', 'Contemporáneo'] }
  ],
  // Esmóquines
  'fashion-clothing-suits-tuxedo': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Blanco', 'Gris carbón', 'Burdeos', 'Verde esmeralda'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['36', '38', '40', '42', '44', '46', '48', '50', '52'] },
    { id: 'lapel_style', name: 'Estilo de solapa', type: 'select', options: ['Solapa de seda', 'Solapa satinada', 'Solapa pico', 'Solapa chal'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lana', 'Lana con seda', 'Terciopelo', 'Mohair', 'Super 120s', 'Super 150s'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Slim Fit', 'Modern Fit', 'Classic Fit', 'Tailored Fit'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Boda', 'Gala', 'Premio', 'Opera', 'Baile formal', 'Black tie'] },
    { id: 'accessories', name: 'Accesorios incluidos', type: 'tags', options: ['Pajarita', 'Fajín', 'Camisa', 'Gemelos', 'Pañuelo', 'Zapatos'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Contemporáneo', 'Vintage', 'Italiano', 'Americano'] }
  ],
  // Pantalones para bebés y niños pequeños
  'fashion-clothing-baby-kids-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul', 'Rosa', 'Blanco', 'Amarillo', 'Verde', 'Rojo', 'Gris', 'Negro', 'Multicolor', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón', 'Mezcla algodón', 'Bambú', 'Modal', 'Jersey suave'] },
    { id: 'pants_type', name: 'Tipo de pantalón', type: 'select', options: ['Pantalones largos', 'Pantalones cortos', 'Leggings', 'Joggers', 'Overalls'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Elástico', 'Botones a presión', 'Velcro', 'Cordón', 'Sin cierre'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Fácil cambio de pañal', 'Hipoalergénico', 'Transpirable', 'Suave', 'Anti-irritación', 'Refuerzo en rodillas'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Primavera/Otoño', 'Todo el año'] }
  ],
  // Bodys para bebés
  'fashion-clothing-baby-kids-bodysuits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Azul', 'Amarillo', 'Verde', 'Gris', 'Multicolor', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['Prematuro', '0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón 100%', 'Bambú', 'Modal', 'Mezcla suave'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello envelope', 'Cuello kimono'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Botones a presión en entrepierna', 'Botones laterales', 'Sin botones'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Hipoalergénico', 'Transpirable', 'Suave al tacto', 'Fácil de poner', 'Anti-irritación', 'Costuras planas'] }
  ],
  // Ropa interior para niños pequeños
  'fashion-clothing-baby-kids-underwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Azul', 'Amarillo', 'Verde', 'Gris', 'Multicolor', 'Estampados divertidos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T', '6T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón 100%', 'Bambú', 'Modal', 'Mezcla suave'] },
    { id: 'underwear_type', name: 'Tipo', type: 'select', options: ['Calzoncillos', 'Bragas', 'Camisetas interiores', 'Conjunto interior'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Hipoalergénico', 'Transpirable', 'Suave', 'Elástico suave', 'Sin etiquetas', 'Costuras planas'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Unidad', 'Pack de 2', 'Pack de 3', 'Pack de 5', 'Pack de 7'] }
  ],
  // Cubrepañales
  'fashion-clothing-baby-kids-diaper-covers': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Azul', 'Amarillo', 'Verde', 'Gris', 'Estampados', 'Multicolor'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón', 'Bambú', 'Modal', 'Tejido impermeable'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Básico', 'Con volantes', 'Con encajes', 'Deportivo', 'Elegante'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Elástico', 'Botones a presión', 'Velcro', 'Sin cierre'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Impermeable', 'Transpirable', 'Ajuste cómodo', 'Fácil de lavar', 'Anti-fugas', 'Suave'] }
  ],
  // Vestidos para bebés y niñas pequeñas
  'fashion-clothing-baby-kids-dresses': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rosa', 'Blanco', 'Azul', 'Amarillo', 'Verde', 'Rojo', 'Morado', 'Multicolor', 'Estampados florales'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón', 'Jersey suave', 'Tul', 'Seda suave', 'Mezcla cómoda'] },
    { id: 'dress_style', name: 'Estilo de vestido', type: 'select', options: ['Casual', 'Elegante', 'Fiesta', 'Playero', 'Deportivo', 'Princesa'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga', 'Manga 3/4'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Midi', 'Largo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Fácil de poner', 'Cómodo', 'Suave', 'Transpirable', 'Lavable en máquina', 'Sin arrugas'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Fiesta', 'Bautizo', 'Cumpleaños', 'Fotos', 'Especial'] }
  ],
  // Ropa de abrigo para bebés y niños pequeños
  'fashion-clothing-baby-kids-outerwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul marino', 'Rosa', 'Gris', 'Verde', 'Rojo', 'Amarillo', 'Negro', 'Blanco', 'Multicolor'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Polar', 'Lana', 'Plumón', 'Poliéster', 'Mezcla térmica'] },
    { id: 'outerwear_type', name: 'Tipo de abrigo', type: 'select', options: ['Chaqueta', 'Abrigo', 'Chaleco', 'Suéter', 'Cardigan', 'Poncho'] },
    { id: 'warmth_level', name: 'Nivel de abrigo', type: 'select', options: ['Ligero', 'Medio', 'Cálido', 'Muy cálido'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Cremallera', 'Botones', 'Botones a presión', 'Sin cierre'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Capucha', 'Bolsillos', 'Impermeable', 'Cortavientos', 'Forro suave', 'Reflectante'] }
  ],
  // Conjuntos de ropa para bebés y niños pequeños
  'fashion-clothing-baby-kids-sets': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul', 'Rosa', 'Blanco', 'Amarillo', 'Verde', 'Gris', 'Multicolor', 'Estampados coordinados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón', 'Jersey suave', 'Bambú', 'Modal', 'Mezcla cómoda'] },
    { id: 'set_type', name: 'Tipo de conjunto', type: 'select', options: ['2 piezas', '3 piezas', '4 piezas', '5 piezas'] },
    { id: 'pieces_included', name: 'Piezas incluidas', type: 'tags', options: ['Body', 'Pantalón', 'Camiseta', 'Babero', 'Gorro', 'Mitones', 'Calcetines'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Casual', 'Elegante', 'Deportivo', 'Regalo', 'Básico'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Coordinado', 'Fácil de combinar', 'Lavable en máquina', 'Suave', 'Hipoalergénico'] }
  ],
  // Pijamas y saquitos para bebés
  'fashion-clothing-baby-kids-pajamas': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul', 'Rosa', 'Blanco', 'Amarillo', 'Verde', 'Gris', 'Estampados tiernos', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón', 'Modal', 'Bambú', 'Flanela', 'Jersey suave'] },
    { id: 'pajama_type', name: 'Tipo', type: 'select', options: ['Pijama 2 piezas', 'Pelele', 'Saco de dormir', 'Camisón', 'Mono pijama'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Botones a presión', 'Cremallera', 'Sin cierre', 'Velcro'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Fácil cambio nocturno', 'Suave', 'Transpirable', 'Antideslizante', 'Pies cubiertos', 'Regulación térmica'] }
  ],
  // Calcetines para bebés y niños pequeños
  'fashion-clothing-baby-kids-socks': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Azul', 'Amarillo', 'Verde', 'Gris', 'Multicolor', 'Estampados divertidos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T-3T', '4T-5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón', 'Bambú', 'Modal', 'Mezcla suave'] },
    { id: 'sock_type', name: 'Tipo de calcetín', type: 'select', options: ['Antideslizantes', 'Básicos', 'Tobillo', 'Altos', 'Deportivos'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antideslizantes', 'Sin costuras', 'Transpirable', 'Suave', 'Elástico suave', 'Hipoalergénico'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Par individual', 'Pack de 3', 'Pack de 5', 'Pack de 7', 'Pack de 10'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Casa', 'Salir', 'Deportivo', 'Especial'] }
  ],
  // Bañadores para bebés y niños pequeños
  'fashion-clothing-baby-kids-swimwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul', 'Rosa', 'Amarillo', 'Verde', 'Rojo', 'Multicolor', 'Estampados marinos', 'Tropical'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Lycra', 'Poliéster', 'Spandex', 'Mezcla resistente al cloro'] },
    { id: 'swimwear_type', name: 'Tipo', type: 'select', options: ['Bañador entero', 'Bikini', 'Slip de baño', 'Rashguard', 'Conjunto de baño'] },
    { id: 'protection', name: 'Protección UV', type: 'select', options: ['Sin protección', 'UPF 15+', 'UPF 30+', 'UPF 50+'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Protección UV', 'Secado rápido', 'Resistente al cloro', 'Elástico', 'Cómodo', 'Duradero'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Deportivo', 'Casual', 'Tropical', 'Divertido', 'Básico'] }
  ],
  // Camisetas para bebés y niños pequeños
  'fashion-clothing-baby-kids-shirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Rosa', 'Amarillo', 'Verde', 'Gris', 'Rojo', 'Multicolor', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['0-3 meses', '3-6 meses', '6-9 meses', '9-12 meses', '12-18 meses', '18-24 meses', '2T', '3T', '4T', '5T'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Algodón 100%', 'Jersey suave', 'Bambú', 'Modal', 'Mezcla cómoda'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga', 'Manga 3/4'] },
    { id: 'neckline', name: 'Cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello polo', 'Cuello henley'] },
    { id: 'print_type', name: 'Tipo de estampado', type: 'tags', options: ['Liso', 'Rayas', 'Lunares', 'Animales', 'Personajes', 'Mensaje', 'Dibujos'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Suave al tacto', 'Transpirable', 'Hipoalergénico', 'Fácil de lavar', 'Sin arrugas', 'Duradero'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Juego', 'Salir', 'Deportivo', 'Casual', 'Especial'] }
  ],
  // Camiseta de buceo
  'fashion-clothing-swimwear-wetsuit': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Azul', 'Gris', 'Verde', 'Rosa', 'Rojo', 'Multicolor'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Neopreno', 'Lycra', 'Nylon', 'Spandex', 'Poliéster técnico'] },
    { id: 'thickness', name: 'Grosor', type: 'select', options: ['1mm', '2mm', '3mm', '5mm', '7mm'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga corta', 'Manga larga', 'Sin mangas'] },
    { id: 'protection', name: 'Protección UV', type: 'select', options: ['UPF 15+', 'UPF 30+', 'UPF 50+', 'UPF 50++'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Protección UV', 'Secado rápido', 'Térmico', 'Flexibilidad', 'Resistente al agua salada', 'Anti-irritación'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Buceo', 'Snorkel', 'Surf', 'Paddle', 'Natación', 'Kayak'] }
  ],
  // Vestidos de baño
  'fashion-clothing-swimwear-dress': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Azul', 'Rojo', 'Verde', 'Rosa', 'Blanco', 'Estampados florales', 'Tropical'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Poliéster', 'Nylon', 'Spandex', 'Microfibra'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Casual', 'Elegante', 'Deportivo', 'Vintage', 'Bohemio'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Midi', 'Largo', 'Maxi'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Secado rápido', 'Resistente al cloro', 'Elástico', 'Cómodo', 'Protección UV'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Playa', 'Piscina', 'Vacaciones', 'Resort', 'Crucero'] }
  ],
  // Pantalones cortos de surf
  'fashion-clothing-swimwear-surf-shorts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul', 'Verde', 'Rojo', 'Amarillo', 'Gris', 'Blanco', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster reciclado', 'Nylon', 'Spandex', 'Quick-dry fabric'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['16"', '17"', '18"', '19"', '20"', '21"'] },
    { id: 'waist_type', name: 'Tipo de cintura', type: 'select', options: ['Elástica', 'Cordón', 'Velcro', 'Híbrida'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Secado rápido', 'Repelente al agua', 'Bolsillos', 'Cordón de seguridad', 'Protección UV', 'Stretch'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Surf', 'Paddle', 'Natación', 'Playa', 'Casual', 'Deportes acuáticos'] }
  ],
  // Trajes de baño de una pieza
  'fashion-clothing-swimwear-one-piece': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Azul', 'Rojo', 'Verde', 'Rosa', 'Blanco', 'Estampados', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Poliéster', 'Nylon', 'Spandex', 'Resistente al cloro'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Deportivo', 'Elegante', 'Vintage', 'Moderno', 'Competición'] },
    { id: 'neckline', name: 'Escote', type: 'select', options: ['Cuello alto', 'Escote en V', 'Escote redondo', 'Halter', 'Off-shoulder'] },
    { id: 'back_style', name: 'Estilo de espalda', type: 'select', options: ['Espalda abierta', 'Cruzada', 'Cerrada', 'Cut-out', 'Racerback'] },
    { id: 'support', name: 'Soporte', type: 'select', options: ['Sin soporte', 'Soporte ligero', 'Soporte medio', 'Soporte alto', 'Sujetador integrado'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Moldeador', 'Control de abdomen', 'Push-up', 'Secado rápido', 'Resistente al cloro', 'Protección UV'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Natación', 'Aqua fitness', 'Playa', 'Piscina', 'Competición', 'Casual'] }
  ],
  // Camisetas de surf
  'fashion-clothing-swimwear-surf-shirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Azul', 'Verde', 'Gris', 'Amarillo', 'Rosa', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Poliéster reciclado', 'Nylon', 'Spandex'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga corta', 'Manga larga', 'Manga 3/4'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Compression'] },
    { id: 'protection', name: 'Protección UV', type: 'select', options: ['UPF 30+', 'UPF 50+', 'UPF 50++'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Protección UV', 'Secado rápido', 'Transpirable', 'Anti-bacterial', 'Flat seams', 'Stretch'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Surf', 'Paddle', 'Kayak', 'Snorkel', 'Playa', 'Deportes acuáticos'] }
  ],
  // Parte superior de traje de baño
  'fashion-clothing-swimwear-bikini-top': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Rosa', 'Amarillo', 'Estampados', 'Tropical'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'cup_size', name: 'Talla de copa', type: 'tags', options: ['A', 'B', 'C', 'D', 'DD', 'E'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Poliéster', 'Nylon', 'Spandex', 'Microfibra'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Triángulo', 'Bandeau', 'Halter', 'Push-up', 'Deportivo', 'Bralette'] },
    { id: 'support', name: 'Nivel de soporte', type: 'select', options: ['Sin soporte', 'Soporte ligero', 'Soporte medio', 'Soporte alto'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Atado al cuello', 'Atado a la espalda', 'Clip', 'Pull-on'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Push-up', 'Acolchado', 'Aro', 'Removible', 'Secado rápido', 'Resistente al cloro'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Natación', 'Playa', 'Piscina', 'Tomar el sol', 'Deportes acuáticos'] }
  ],
  // Bóxers para natación
  'fashion-clothing-swimwear-swim-boxers': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Azul', 'Gris', 'Verde', 'Rojo', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Nylon', 'Lycra', 'Spandex', 'Resistente al cloro'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Cortos', 'Medianos', 'Largos'] },
    { id: 'waist_type', name: 'Tipo de cintura', type: 'select', options: ['Elástica', 'Cordón', 'Ajustable'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Secado rápido', 'Resistente al cloro', 'Transpirable', 'Compresión', 'Soporte interno'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Natación', 'Aqua fitness', 'Playa', 'Piscina', 'Deportes acuáticos'] }
  ],
  // Calzoncillos de natación
  'fashion-clothing-swimwear-swim-briefs': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Azul', 'Rojo', 'Verde', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Nylon', 'Lycra', 'Endurance+', 'Resistente al cloro'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Deportivo', 'Competición', 'Racing'] },
    { id: 'waist_height', name: 'Altura de cintura', type: 'select', options: ['Baja', 'Media', 'Alta'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Resistente al cloro', 'Secado rápido', 'Ajuste perfecto', 'Durabilidad', 'Compresión'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Natación', 'Competición', 'Entrenamiento', 'Aqua fitness', 'Triatlón'] }
  ],
  // Burkinis
  'fashion-clothing-swimwear-burkinis': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Azul', 'Verde', 'Gris', 'Morado', 'Estampados discretos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Poliéster', 'Nylon', 'Spandex', 'Microfibra'] },
    { id: 'coverage', name: 'Cobertura', type: 'select', options: ['Cobertura completa', 'Brazo completo', 'Pierna completa', 'Con capucha'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Tradicional', 'Moderno', 'Deportivo', 'Elegante'] },
    { id: 'pieces', name: 'Piezas', type: 'select', options: ['2 piezas', '3 piezas', 'Una pieza'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Protección UV', 'Secado rápido', 'Cómodo', 'Modesto', 'Resistente al cloro', 'Transpirable'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Natación', 'Playa', 'Piscina', 'Aqua fitness', 'Deportes acuáticos'] }
  ],
  // Bikinis clásicos
  'fashion-clothing-swimwear-bikinis': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Amarillo', 'Estampados', 'Tropical', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'cup_size', name: 'Talla de copa', type: 'tags', options: ['A', 'B', 'C', 'D', 'DD'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Lycra', 'Poliéster', 'Nylon', 'Spandex'] },
    { id: 'top_style', name: 'Estilo del top', type: 'select', options: ['Triángulo', 'Bandeau', 'Halter', 'Push-up', 'Bralette'] },
    { id: 'bottom_style', name: 'Estilo del bottom', type: 'select', options: ['Brasileño', 'Clásico', 'Tanga', 'Hipster', 'Alto'] },
    { id: 'support', name: 'Soporte', type: 'select', options: ['Sin soporte', 'Soporte ligero', 'Soporte medio', 'Push-up'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Push-up', 'Acolchado', 'Secado rápido', 'Resistente al cloro', 'Reversible'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Playa', 'Piscina', 'Vacaciones', 'Resort', 'Tomar el sol'] }
  ],
  // Batas
  'fashion-clothing-swimwear-robes': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Beige', 'Azul', 'Rosa', 'Gris', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón terry', 'Microfibra', 'Algodón', 'Bambú', 'Modal'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corta', 'Midi', 'Larga', 'Maxi'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Kimono', 'Tradicional', 'Moderno', 'Spa', 'Playa'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Cinturón', 'Sin cierre', 'Botones', 'Velcro'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Absorbente', 'Secado rápido', 'Suave', 'Ligera', 'Bolsillos', 'Capucha'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Playa', 'Piscina', 'Spa', 'Casa', 'Resort', 'After-swim'] }
  ],
  // Kimonos
  'fashion-clothing-ceremonial-kimonos': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Dorado', 'Plateado', 'Multicolor', 'Estampados florales'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Seda', 'Algodón', 'Rayón', 'Poliéster', 'Satén', 'Lino', 'Mezcla seda-algodón'] },
    { id: 'kimono_type', name: 'Tipo de kimono', type: 'select', options: ['Tradicional', 'Casual', 'Formal', 'Ceremonial', 'Moderno', 'Yukata'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corto', 'Midi', 'Largo', 'Extra largo'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga larga', 'Manga 3/4', 'Manga kimono tradicional'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Floral', 'Geométrico', 'Paisajes', 'Animales', 'Abstracto', 'Tradicional japonés'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Obi (cinturón tradicional)', 'Cinturón incluido', 'Sin cierre', 'Botones ocultos'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Ceremonia', 'Casa', 'Spa', 'Teatro', 'Festivales', 'Meditación', 'Casual', 'Formal'] },
    { id: 'authenticity', name: 'Autenticidad', type: 'select', options: ['Tradicional japonés', 'Inspirado en kimono', 'Estilo occidental', 'Fusión moderna'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Hecho a mano', 'Bordado', 'Estampado', 'Reversible', 'Lavable', 'Bolsillos ocultos'] }
  ],
  // Saris
  'fashion-clothing-ceremonial-saris': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rojo', 'Dorado', 'Azul', 'Verde', 'Rosa', 'Morado', 'Naranja', 'Amarillo', 'Multicolor', 'Degradado'] },
    { id: 'size', name: 'Longitud', type: 'tags', options: ['5 metros', '5.5 metros', '6 metros', '6.5 metros', '9 metros'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Seda', 'Algodón', 'Chiffon', 'Georgette', 'Crepe', 'Satén', 'Kanchipuram', 'Banarasi'] },
    { id: 'sari_type', name: 'Tipo de sari', type: 'select', options: ['Tradicional', 'Moderno', 'Diseñador', 'Ceremonial', 'Casual', 'Bollywood'] },
    { id: 'weave_type', name: 'Tipo de tejido', type: 'select', options: ['Kanchipuram', 'Banarasi', 'Chanderi', 'Tussar', 'Handloom', 'Power loom'] },
    { id: 'border_type', name: 'Tipo de borde', type: 'select', options: ['Bordado', 'Zari', 'Liso', 'Estampado', 'Encaje', 'Fleco'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Floral', 'Geométrico', 'Paisley', 'Abstracto', 'Tradicional', 'Moderno', 'Bordado a mano'] },
    { id: 'blouse_included', name: 'Blusa incluida', type: 'select', options: ['Sí, sin coser', 'Sí, lista para usar', 'No incluida', 'Blusa de contraste'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Boda', 'Festival', 'Ceremonia', 'Fiesta', 'Oficina', 'Casual', 'Religioso', 'Graduación'] },
    { id: 'region_style', name: 'Estilo regional', type: 'select', options: ['Sur de India', 'Norte de India', 'Este de India', 'Oeste de India', 'Fusión moderna'] },
    { id: 'care_instructions', name: 'Cuidado', type: 'tags', options: ['Solo lavado en seco', 'Lavado a mano', 'Planchar con vapor', 'Guardar colgado', 'Proteger de humedad'] },
    { id: 'features', name: 'Características especiales', type: 'tags', options: ['Trabajo de zari', 'Bordado a mano', 'Estampado', 'Hilo de oro', 'Lentejuelas', 'Trabajo de espejo'] }
  ],
  // Monos y pantalones de trabajo
  'fashion-clothing-workwear-work-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul marino', 'Negro', 'Gris', 'Caqui', 'Verde militar', 'Blanco', 'Naranja alta visibilidad', 'Amarillo alta visibilidad'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Mezclilla', 'Canvas', 'Ripstop', 'Kevlar', 'Mezcla algodón-poliéster'] },
    { id: 'workwear_type', name: 'Tipo de prenda', type: 'select', options: ['Mono completo', 'Pantalón de trabajo', 'Peto', 'Overall', 'Mono técnico'] },
    { id: 'industry', name: 'Industria', type: 'tags', options: ['Construcción', 'Mecánica', 'Soldadura', 'Electricidad', 'Plomería', 'Agricultura', 'Minería', 'Fábrica'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Alta visibilidad', 'Resistente al fuego', 'Anti-estático', 'Impermeable', 'Reflectivos', 'Protección UV'] },
    { id: 'pockets', name: 'Bolsillos', type: 'tags', options: ['Múltiples bolsillos', 'Bolsillo para herramientas', 'Bolsillo para metro', 'Bolsillos con cremallera', 'Bolsillo para teléfono'] },
    { id: 'durability', name: 'Durabilidad', type: 'tags', options: ['Resistente al desgarro', 'Refuerzos en rodillas', 'Costuras reforzadas', 'Resistente a manchas', 'Lavado industrial'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Regular', 'Holgado', 'Slim fit', 'Cargo', 'Recto'] }
  ],
  // Monos de vuelo
  'fashion-clothing-workwear-flight-suits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Verde oliva', 'Azul marino', 'Negro', 'Gris', 'Caqui', 'Naranja', 'Blanco'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nomex', 'Algodón resistente al fuego', 'Poliéster técnico', 'Mezcla anti-estática', 'Kevlar'] },
    { id: 'flight_type', name: 'Tipo de vuelo', type: 'select', options: ['Piloto comercial', 'Piloto militar', 'Mecánico aeronáutico', 'Personal de pista', 'Entrenamiento'] },
    { id: 'safety_rating', name: 'Clasificación de seguridad', type: 'select', options: ['FAR 25.853', 'MIL-STD', 'NFPA 2112', 'Civil', 'Comercial'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Resistente al fuego', 'Anti-estático', 'Múltiples bolsillos', 'Cremalleras YKK', 'Parches velcro', 'Reflectivos'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Cremallera frontal', 'Cremallera diagonal', 'Doble cremallera', 'Botones a presión'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga larga', 'Manga removible', 'Manga ajustable'] },
    { id: 'certification', name: 'Certificación', type: 'tags', options: ['FAA aprobado', 'CE certificado', 'ISO 11612', 'OEKO-TEX', 'Militar spec'] }
  ],
  // Uniformes de servicio de comida
  'fashion-clothing-workwear-food-service': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Gris', 'Azul marino', 'Rojo', 'Verde', 'A cuadros', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Mezcla algodón-poliéster', 'Microfibra', 'Coolmax'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Chaqueta de chef', 'Pantalón de cocina', 'Delantal', 'Gorro de chef', 'Camisa de servicio', 'Chaleco'] },
    { id: 'position', name: 'Posición', type: 'tags', options: ['Chef', 'Sous chef', 'Cocinero', 'Mesero', 'Barista', 'Panadero', 'Bartender'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Resistente a manchas', 'Antibacterial', 'Transpirable', 'Fácil lavado', 'Secado rápido', 'Resistente al calor'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Botones', 'Velcro', 'Cremallera', 'Cordón', 'Elástico'] },
    { id: 'hygiene', name: 'Características de higiene', type: 'tags', options: ['HACCP compliant', 'Lavable a alta temperatura', 'Sin bolsillos externos', 'Antimicrobial', 'Food safe'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Tradicional', 'Moderno', 'Casual', 'Ejecutivo', 'Vintage'] }
  ],
  // Uniformes militares
  'fashion-clothing-workwear-military': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Verde oliva', 'Camuflaje', 'Azul marino', 'Gris', 'Negro', 'Caqui', 'Beige', 'Woodland'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Ripstop', 'Canvas', 'Nylon', 'Poliéster', 'Algodón', 'Kevlar', 'Cordura'] },
    { id: 'military_branch', name: 'Rama militar', type: 'select', options: ['Ejército', 'Marina', 'Fuerza Aérea', 'Infantería', 'Paracaidismo', 'Fuerzas Especiales'] },
    { id: 'uniform_type', name: 'Tipo de uniforme', type: 'select', options: ['Combate', 'Gala', 'Servicio', 'Entrenamiento', 'Ceremonial', 'Tactical'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Digital', 'Woodland', 'Desert', 'Urban', 'Multicam', 'ACU', 'BDU'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Resistente al desgarro', 'IR signature reduction', 'Múltiples bolsillos', 'Velcro patches', 'Refuerzos', 'Quick-dry'] },
    { id: 'rank_compatibility', name: 'Compatible con rangos', type: 'select', options: ['Oficiales', 'Suboficiales', 'Tropa', 'Cadetes', 'Todos los rangos'] },
    { id: 'regulation', name: 'Reglamento', type: 'tags', options: ['NATO standard', 'US Army regulation', 'Navy regulation', 'Air Force standard', 'Custom military'] }
  ],
  // Uniformes de colegio
  'fashion-clothing-workwear-school': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul marino', 'Blanco', 'Gris', 'Negro', 'Verde', 'Rojo', 'Beige', 'A cuadros', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['4', '6', '8', '10', '12', '14', '16', 'XS', 'S', 'M', 'L', 'XL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Niño', 'Niña', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Mezcla algodón-poliéster', 'Gabardina', 'Lana', 'Piqué'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Camisa', 'Blusa', 'Pantalón', 'Falda', 'Polo', 'Suéter', 'Blazer', 'Corbata'] },
    { id: 'school_level', name: 'Nivel escolar', type: 'select', options: ['Preescolar', 'Primaria', 'Secundaria', 'Preparatoria', 'Universidad'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Entre estaciones', 'Todo el año'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Fácil cuidado', 'No requiere planchar', 'Resistente a manchas', 'Lavable en máquina', 'Duradero', 'Cómodo'] },
    { id: 'fit', name: 'Corte', type: 'select', options: ['Regular', 'Slim fit', 'Holgado', 'Ajustado'] },
    { id: 'collar_type', name: 'Tipo de cuello', type: 'select', options: ['Cuello polo', 'Cuello clásico', 'Sin cuello', 'Cuello alto', 'Cuello Peter Pan'] }
  ],
  // Uniformes de seguridad
  'fashion-clothing-workwear-security': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Blanco', 'Caqui', 'Verde', 'Camuflaje'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Ripstop', 'Poliéster', 'Algodón', 'Canvas', 'Mezcla tactical', 'Nylon'] },
    { id: 'security_type', name: 'Tipo de seguridad', type: 'select', options: ['Guardia privado', 'Seguridad corporativa', 'Vigilancia', 'Escolta', 'Evento', 'Retail'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Camisa', 'Pantalón', 'Chaleco', 'Chaqueta', 'Polo', 'Conjunto completo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Múltiples bolsillos', 'Radio clip', 'Badge holder', 'Pen pocket', 'Velcro patches', 'Reinforced'] },
    { id: 'visibility', name: 'Visibilidad', type: 'select', options: ['Standard', 'Alta visibilidad', 'Reflectivos', 'Discreto'] },
    { id: 'protection_level', name: 'Nivel de protección', type: 'select', options: ['Básico', 'Intermedio', 'Tactical', 'Balístico compatible'] },
    { id: 'professional_grade', name: 'Grado profesional', type: 'select', options: ['Comercial', 'Profesional', 'Tactical', 'Law enforcement'] }
  ],
  // Uniformes deportivos
  'fashion-clothing-workwear-sports': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul', 'Rojo', 'Verde', 'Negro', 'Blanco', 'Amarillo', 'Naranja', 'Morado', 'Multicolor'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Poliéster', 'Dri-FIT', 'Coolmax', 'Spandex', 'Microfibra', 'Mesh', 'Performance fabric'] },
    { id: 'sport', name: 'Deporte', type: 'tags', options: ['Fútbol', 'Basketball', 'Volleyball', 'Tenis', 'Atletismo', 'Natación', 'Baseball', 'Hockey'] },
    { id: 'team_level', name: 'Nivel de equipo', type: 'select', options: ['Profesional', 'Semi-profesional', 'Escolar', 'Amateur', 'Recreativo'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Jersey', 'Shorts', 'Pantalón', 'Chaqueta', 'Polo', 'Tank top', 'Conjunto completo'] },
    { id: 'customization', name: 'Personalización', type: 'tags', options: ['Números', 'Nombres', 'Logo del equipo', 'Sponsor', 'Parches', 'Bordado'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Secado rápido', 'Anti-odor', 'Moisture-wicking', 'Stretch', 'UV protection'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Todas las temporadas', 'Entretiempo'] }
  ],
  // Batas blancas
  'fashion-clothing-workwear-lab-coats': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul claro', 'Verde claro', 'Gris claro', 'Beige', 'Rosa claro'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Mezcla algodón-poliéster', 'Microfibra', 'Antimicrobial fabric'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corta (cintura)', 'Media (cadera)', 'Larga (rodilla)', 'Extra larga'] },
    { id: 'profession', name: 'Profesión', type: 'tags', options: ['Médico', 'Enfermera', 'Laboratorista', 'Dentista', 'Veterinario', 'Farmacéutico', 'Investigador'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga larga', 'Manga corta', 'Manga 3/4', 'Sin mangas'] },
    { id: 'closure', name: 'Cierre', type: 'select', options: ['Botones', 'Velcro', 'Cremallera', 'Cierre a presión'] },
    { id: 'pockets', name: 'Bolsillos', type: 'tags', options: ['2 bolsillos', '3 bolsillos', '4+ bolsillos', 'Bolsillo para plumas', 'Bolsillo interior'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antibacterial', 'Resistente a fluidos', 'Lavable a alta temperatura', 'Anti-estático', 'Hipoalergénico'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Regular', 'Entallado', 'Holgado', 'Slim fit'] }
  ],
  // Uniformes hospitalarios
  'fashion-clothing-workwear-medical': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Azul', 'Verde', 'Blanco', 'Rosa', 'Morado', 'Gris', 'Negro', 'Turquesa', 'Estampados médicos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'gender', name: 'Género', type: 'select', options: ['Hombre', 'Mujer', 'Unisex'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Spandex', 'Mezcla stretch', 'Microfibra', 'Coolmax', 'Antimicrobial'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Scrub top', 'Scrub pants', 'Conjunto scrubs', 'Bata médica', 'Chaqueta', 'Gorro quirúrgico'] },
    { id: 'medical_area', name: 'Área médica', type: 'tags', options: ['Cirugía', 'Emergencias', 'Pediatría', 'UCI', 'Consulta externa', 'Laboratorio', 'Radiología'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Regular', 'Slim fit', 'Relaxed', 'Athletic', 'Maternity'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antimicrobial', 'Moisture-wicking', 'Stretch', 'Wrinkle-free', 'Fade-resistant', 'Multiple pockets'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['4-way stretch', 'Soft fabric', 'Breathable', 'Lightweight', 'All-day comfort'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Secado rápido', 'No requiere planchar', 'Resistente a manchas', 'Alta temperatura'] }
  ],
  // Ropa interior térmica para niños
  'fashion-clothing-underwear-boys-thermal': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Gris', 'Negro', 'Azul marino', 'Verde militar', 'Beige'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón térmico', 'Merino', 'Poliéster térmico', 'Mezcla térmica', 'Microfibra térmica', 'Bambú térmico'] },
    { id: 'thermal_level', name: 'Nivel térmico', type: 'select', options: ['Ligero', 'Medio', 'Cálido', 'Extra cálido', 'Ultra térmico'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Camiseta térmica', 'Pantalón térmico', 'Conjunto térmico', 'Camiseta interior', 'Calzoncillos térmicos'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Segunda piel'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga larga', 'Manga corta', 'Sin mangas'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Antibacterial', 'Anti-odor', 'Moisture-wicking', 'Suave al tacto', 'Sin costuras', 'Hipoalergénico'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Otoño-Invierno', 'Invierno', 'Todo el año', 'Entretiempo'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Deportes de invierno', 'Escuela', 'Casual', 'Deportivo', 'Outdoor', 'Esquí'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Temperatura baja', 'Secado al aire', 'No planchar', 'Suavizante'] }
  ],
  // Calzoncillos para niños
  'fashion-clothing-underwear-boys-briefs': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rojo', 'Verde', 'Multicolor', 'Estampados', 'Rayas'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-elastano', 'Microfibra'] },
    { id: 'brief_style', name: 'Estilo de calzoncillo', type: 'select', options: ['Briefs tradicionales', 'Boxer briefs', 'Tanga', 'Hipster', 'Trunk'] },
    { id: 'waistband', name: 'Tipo de cinturilla', type: 'select', options: ['Elástica clásica', 'Sin costuras', 'Suave', 'Ancha', 'Con logo'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Cómodo'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5', 'Pack de 7'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Antibacterial', 'Sin costuras', 'Hipoalergénico', 'Suave', 'Elástico', 'Duradero'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Personajes', 'Deportivo', 'Rayas', 'Cuadros', 'Temático'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Extra suave', 'No se marca', 'Flexible', 'Transpirable', 'Absorbe humedad'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Colores duraderos', 'Secado rápido'] }
  ],
  // Camisetas interiores para niños
  'fashion-clothing-underwear-boys-undershirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Gris', 'Negro', 'Azul', 'Beige', 'Multicolor'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-poliéster', 'Jersey suave'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto', 'Sin cuello'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Slim fit'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 4', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Absorbe humedad', 'Antibacterial', 'Suave al tacto', 'Sin costuras', 'Hipoalergénico'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Uso diario', 'Deportivo', 'Escuela', 'Capa base', 'Térmica', 'Casual'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Todo el año', 'Entretiempo'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Extra suave', 'Flexible', 'No se arruga', 'Ligera', 'Cómoda'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil planchar', 'No encoge', 'Secado rápido', 'Resistente al lavado'] }
  ],
  // Calzoncillos bóxer para niños
  'fashion-clothing-underwear-boys-briefs-boxer': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rojo', 'Verde', 'Multicolor', 'Estampados', 'Rayas', 'Deportivos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-elastano', 'Microfibra suave', 'Jersey elástico'] },
    { id: 'leg_length', name: 'Largo de pierna', type: 'select', options: ['Corta', 'Media', 'Larga', 'Extra larga'] },
    { id: 'waistband_style', name: 'Estilo de cinturilla', type: 'select', options: ['Elástica clásica', 'Ancha confort', 'Sin costuras', 'Con logo', 'Suave'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Athletic fit', 'Comfort fit'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5', 'Pack de 7'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Sin costuras', 'Anti-rozaduras', 'Suave', 'Elástico', 'Duradero', 'Hipoalergénico'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Deportivo', 'Personajes', 'Rayas', 'Cuadros', 'Temático', 'Superhéroes'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Extra suave', 'No se marca', 'Flexible', 'Libertad de movimiento', 'Cómodo para deportes'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Colores duraderos', 'Secado rápido'] }
  ],
  // Pantalones cortos estilo bóxer para niños
  'fashion-clothing-underwear-boys-briefs-boxer-shorts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rojo', 'Verde', 'Multicolor', 'Estampados', 'Camuflaje'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Jersey suave', 'Mezcla cómoda', 'Modal', 'Bambú'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Muy cortos', 'Cortos', 'Medianos', 'Largos'] },
    { id: 'waistband', name: 'Cinturilla', type: 'select', options: ['Elástica', 'Cordón', 'Mixta', 'Ancha comfort', 'Suave'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Relaxed', 'Athletic'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 4'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Cómodo', 'Duradero', 'Suave', 'Elástico', 'Sin rozaduras'] },
    { id: 'purpose', name: 'Uso', type: 'tags', options: ['Dormir', 'Casa', 'Deportivo', 'Casual', 'Verano', 'Jugar'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Deportivo', 'Divertido', 'Rayas', 'Personajes'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Extra suave', 'Cómodo', 'Flexible', 'Fresco', 'Ligero'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Secado rápido'] }
  ],
  // Calzoncillos clásicos para niños
  'fashion-clothing-underwear-boys-briefs-classic': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rojo', 'Verde', 'Multicolor', 'Estampados', 'Básicos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla suave', 'Jersey clásico'] },
    { id: 'brief_style', name: 'Estilo', type: 'select', options: ['Brief clásico', 'Y-front', 'Sin costuras', 'Tradicional', 'Moderno'] },
    { id: 'waistband', name: 'Cinturilla', type: 'select', options: ['Elástica tradicional', 'Suave', 'Sin costuras', 'Clásica', 'Comfort'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Cómodo', 'Traditional fit'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 3', 'Pack de 5', 'Pack de 7', 'Pack de 10'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Suave', 'Duradero', 'Hipoalergénico', 'Sin costuras laterales'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Básico', 'Clásico', 'Estampado sutil', 'Colores sólidos'] },
    { id: 'quality', name: 'Calidad', type: 'tags', options: ['Premium', 'Estándar', 'Económico', 'Duradero', 'Suave'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Muy cómodo', 'Suave al tacto', 'No se marca', 'Transpirable'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Mantiene forma', 'Colores duraderos'] }
  ],
  // Calzoncillos intermedios para niños
  'fashion-clothing-underwear-boys-briefs-mid': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rojo', 'Verde', 'Multicolor', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla stretch', 'Jersey medio'] },
    { id: 'coverage', name: 'Cobertura', type: 'select', options: ['Cobertura media', 'Pierna media', 'Entre brief y boxer', 'Intermedio'] },
    { id: 'waistband', name: 'Cinturilla', type: 'select', options: ['Elástica media', 'Suave', 'Comfort', 'Sin presión', 'Flexible'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Comfort fit', 'Medio'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Suave', 'Flexible', 'Sin rozaduras', 'Cómodo', 'Duradero'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Moderado', 'Sutil', 'Colores básicos'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Uso diario', 'Escuela', 'Casual', 'Cómodo', 'Versátil'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Equilibrio perfecto', 'Cómodo', 'Flexible', 'Suave', 'No restrictivo'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Secado rápido'] }
  ],
  // Baúles (Trunks) para niños
  'fashion-clothing-underwear-boys-briefs-trunks': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Azul', 'Negro', 'Gris', 'Rojo', 'Verde', 'Multicolor', 'Estampados', 'Deportivos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla stretch', 'Microfibra', 'Jersey elástico'] },
    { id: 'leg_length', name: 'Largo de pierna', type: 'select', options: ['Muy corta', 'Corta', 'Media', 'Estilo trunk'] },
    { id: 'waistband', name: 'Cinturilla', type: 'select', options: ['Elástica trunk', 'Ancha comfort', 'Deportiva', 'Sin costuras', 'Premium'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Athletic fit', 'Trunk fit', 'Moderno'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 4', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Sin costuras', 'Athletic', 'Flexible', 'Suave', 'Moderno', 'Cómodo'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Moderno', 'Deportivo', 'Estampado', 'Liso', 'Trendy', 'Colorido', 'Juvenil'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Deportivo', 'Activo', 'Escuela', 'Casual', 'Juegos', 'Ejercicio'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Muy cómodo', 'Libertad de movimiento', 'Suave', 'No se marca', 'Flexible'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Moderno', 'Clásico', 'Deportivo', 'Trendy', 'Juvenil'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Mantiene elasticidad', 'Secado rápido'] }
  ],
  // Ropa interior térmica para niñas
  'fashion-clothing-underwear-girls-thermal': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Gris', 'Negro', 'Azul marino', 'Morado', 'Beige', 'Lila'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón térmico', 'Merino', 'Poliéster térmico', 'Mezcla térmica', 'Microfibra térmica', 'Bambú térmico', 'Modal térmico'] },
    { id: 'thermal_level', name: 'Nivel térmico', type: 'select', options: ['Ligero', 'Medio', 'Cálido', 'Extra cálido', 'Ultra térmico'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Camiseta térmica', 'Pantalón térmico', 'Conjunto térmico', 'Camiseta interior', 'Calzones térmicos'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Segunda piel'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Manga larga', 'Manga corta', 'Sin mangas'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Antibacterial', 'Anti-odor', 'Moisture-wicking', 'Suave al tacto', 'Sin costuras', 'Hipoalergénico'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Otoño-Invierno', 'Invierno', 'Todo el año', 'Entretiempo'] },
    { id: 'activity', name: 'Actividad', type: 'tags', options: ['Deportes de invierno', 'Escuela', 'Casual', 'Deportivo', 'Outdoor', 'Esquí'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Flores', 'Mariposas', 'Unicornios', 'Princesas', 'Corazones'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Temperatura baja', 'Secado al aire', 'No planchar', 'Suavizante'] }
  ],
  // Calzones para niñas
  'fashion-clothing-underwear-girls-panties': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Morado', 'Azul', 'Verde', 'Amarillo', 'Multicolor', 'Estampados', 'Pastel'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-elastano', 'Microfibra suave'] },
    { id: 'panty_style', name: 'Estilo de calzón', type: 'select', options: ['Brief clásico', 'Bikini', 'Hipster', 'Boyshort', 'Tanga juvenil'] },
    { id: 'waistband', name: 'Tipo de cinturilla', type: 'select', options: ['Elástica clásica', 'Sin costuras', 'Suave', 'Ancha', 'Con logo', 'Decorativa'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Cómodo'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5', 'Pack de 7'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Antibacterial', 'Sin costuras', 'Hipoalergénico', 'Suave', 'Elástico', 'Duradero'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Personajes', 'Princesas', 'Flores', 'Mariposas', 'Corazones', 'Arcoíris'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Extra suave', 'No se marca', 'Flexible', 'Transpirable', 'Absorbe humedad'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Bebé (2-4 años)', 'Niña pequeña (4-7 años)', 'Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Colores duraderos', 'Secado rápido'] }
  ],
  // Bikinis para niñas
  'fashion-clothing-underwear-girls-panties-bikinis': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rosa', 'Azul claro', 'Amarillo', 'Verde menta', 'Morado', 'Blanco', 'Multicolor', 'Estampados tropicales'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón suave', 'Modal', 'Microfibra infantil', 'Mezcla algodón-elastano'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Bikini clásico', 'Corte bajo', 'Cintura media', 'Sin costuras'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Niña pequeña (4-7 años)', 'Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado floral', 'Princesas', 'Mariposas', 'Arcoíris', 'Corazones', 'Personajes'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 3', 'Pack de 5'] },
    { id: 'comfort', name: 'Características de comodidad', type: 'tags', options: ['Extra suave', 'Transpirable', 'No se marca', 'Elástico suave'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Colores duraderos', 'Secado rápido', 'No encoge'] }
  ],
  // Calzoncillos bóxer para niñas
  'fashion-clothing-underwear-girls-panties-boxer-briefs': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rosa', 'Morado', 'Azul', 'Verde', 'Gris', 'Blanco', 'Multicolor', 'Estampados deportivos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón suave', 'Algodón orgánico', 'Modal', 'Bambú', 'Mezcla deportiva'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Regular', 'Cómodo', 'Deportivo', 'Ajustado'] },
    { id: 'leg_length', name: 'Largo de pierna', type: 'select', options: ['Corto', 'Medio', 'Largo'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Rayas', 'Deportivo', 'Personajes', 'Geométrico', 'Flores'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Activo', 'Cobertura total', 'Sin costuras', 'Cinturilla suave'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'Mantiene forma', 'Secado rápido'] }
  ],
  // Panty moldeador para niñas
  'fashion-clothing-underwear-girls-panties-shaping': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Beige', 'Negro', 'Blanco', 'Rosa suave', 'Gris'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Microfibra', 'Nylon-elastano', 'Modal-elastano', 'Algodón-elastano'] },
    { id: 'support_level', name: 'Nivel de soporte', type: 'select', options: ['Ligero', 'Medio', 'Firme'] },
    { id: 'target_area', name: 'Área objetivo', type: 'tags', options: ['Abdomen', 'Cintura', 'Caderas', 'Glúteos', 'General'] },
    { id: 'fit', name: 'Tipo de ajuste', type: 'select', options: ['Sin costuras', 'Invisible', 'Cómodo', 'Modelador'] },
    { id: 'age_appropriate', name: 'Apropiado para edad', type: 'select', options: ['Pre-adolescente (12-16 años)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Sin marcas', 'Transpirable', 'Control suave', 'Cómodo', 'Flexible'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado delicado', 'Secado al aire', 'No planchar', 'Cuidado especial'] }
  ],
  // Calzoncillos para niñas
  'fashion-clothing-underwear-girls-panties-briefs': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Azul', 'Morado', 'Verde', 'Amarillo', 'Multicolor', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-elastano'] },
    { id: 'style', name: 'Estilo de calzoncillo', type: 'select', options: ['Clásico', 'Corte alto', 'Cintura alta', 'Corte francés'] },
    { id: 'waistband', name: 'Tipo de cinturilla', type: 'select', options: ['Elástica clásica', 'Suave', 'Sin costuras', 'Ancha', 'Con logo'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado', 'Personajes', 'Princesas', 'Flores', 'Mariposas', 'Corazones'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 3', 'Pack de 5', 'Pack de 7'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Bebé (2-4 años)', 'Niña pequeña (4-7 años)', 'Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Hipoalergénico', 'Suave', 'Duradero', 'Sin costuras'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Secado rápido'] }
  ],
  // Panties estilo hipster para niñas
  'fashion-clothing-underwear-girls-panties-hipster': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rosa', 'Morado', 'Azul', 'Verde menta', 'Coral', 'Amarillo', 'Multicolor', 'Estampados modernos'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón suave', 'Modal', 'Bambú', 'Microfibra', 'Mezcla algodón-elastano'] },
    { id: 'waist_height', name: 'Altura de cintura', type: 'select', options: ['Cintura baja', 'Cintura media', 'Cintura media-alta'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Cómodo', 'Juvenil'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Encaje sutil', 'Estampado geométrico', 'Rayas', 'Lunares', 'Moderno'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 3', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Sin marcas', 'Transpirable', 'Cómodo', 'Moderno', 'Juvenil'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Mantiene color', 'Secado rápido', 'Fácil cuidado'] }
  ],
  // Panties regulares para niñas
  'fashion-clothing-underwear-girls-panties-regular': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Azul claro', 'Morado', 'Verde', 'Amarillo', 'Multicolor', 'Estampados alegres'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú suave', 'Modal', 'Jersey de algodón'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Bikini', 'Brief', 'Corte medio'] },
    { id: 'waistband', name: 'Tipo de cinturilla', type: 'select', options: ['Elástica', 'Suave', 'Sin costuras', 'Decorativa', 'Con logo'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado infantil', 'Personajes', 'Princesas', 'Animales', 'Flores', 'Corazones'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 3', 'Pack de 5', 'Pack de 7'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Bebé (2-4 años)', 'Niña pequeña (4-7 años)', 'Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Extra suave', 'Transpirable', 'Hipoalergénico', 'Duradero', 'Cómodo'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No encoge', 'Colores duraderos'] }
  ],
  // Ropa interior para menstruación para niñas
  'fashion-clothing-underwear-girls-panties-period': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Gris oscuro', 'Azul marino', 'Morado oscuro', 'Rosa oscuro'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón absorbente', 'Bambú antibacterial', 'Microfibra técnica', 'Mezcla absorbente'] },
    { id: 'absorption_level', name: 'Nivel de absorción', type: 'select', options: ['Ligero', 'Medio', 'Alto', 'Super'] },
    { id: 'protection_hours', name: 'Horas de protección', type: 'select', options: ['4-6 horas', '6-8 horas', '8-10 horas', '10-12 horas'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Brief alto', 'Hipster', 'Bikini reforzado', 'Boyshort'] },
    { id: 'age_appropriate', name: 'Apropiado para edad', type: 'select', options: ['Pre-adolescente (12-16 años)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Anti-fugas', 'Antibacterial', 'Anti-odor', 'Reutilizable', 'Ecológico', 'Cómodo'] },
    { id: 'layers', name: 'Capas de protección', type: 'select', options: ['2 capas', '3 capas', '4 capas', '5 capas'] },
    { id: 'care', name: 'Cuidado especial', type: 'tags', options: ['Enjuague en frío', 'Lavado sin suavizante', 'Secado al aire', 'Cuidado especial'] }
  ],
  // Tangas para niñas
  'fashion-clothing-underwear-girls-panties-thongs': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rosa suave', 'Beige', 'Blanco', 'Gris claro', 'Azul claro'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón suave', 'Modal', 'Microfibra', 'Mezcla cómoda'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Tanga clásica', 'Tanga brasileña', 'G-string juvenil'] },
    { id: 'waistband', name: 'Tipo de cinturilla', type: 'select', options: ['Sin costuras', 'Elástica suave', 'Ultra fina'] },
    { id: 'age_appropriate', name: 'Apropiado para edad', type: 'select', options: ['Pre-adolescente (12-16 años)'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Ropa ajustada', 'Sin marcas', 'Deportivo', 'Especial'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Invisible', 'Sin costuras', 'Transpirable', 'Cómodo', 'Juvenil'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Sutil', 'Encaje delicado', 'Moderno', 'Juvenil'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado delicado', 'Secado al aire', 'Cuidado especial', 'Lavable en máquina'] }
  ],
  // Primeros sujetadores para niñas
  'fashion-clothing-underwear-girls-undershirts-first-bras': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa suave', 'Beige', 'Gris claro', 'Azul claro', 'Lila'] },
    { id: 'size', name: 'Talla de sujetador', type: 'tags', options: ['28AA', '30AA', '32AA', '28A', '30A', '32A', '34A', '32B', '34B'] },
    { id: 'age_range', name: 'Rango de edad', type: 'select', options: ['8-10 años', '10-12 años', '12-14 años', '14-16 años'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón suave', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-elastano', 'Jersey ultra suave'] },
    { id: 'style', name: 'Estilo de sujetador', type: 'select', options: ['Sujetador de entrenamiento', 'Crop top sujetador', 'Sujetador deportivo juvenil', 'Primer sujetador con copas', 'Bralette juvenil'] },
    { id: 'support_level', name: 'Nivel de soporte', type: 'select', options: ['Muy ligero', 'Ligero', 'Medio suave', 'Soporte básico'] },
    { id: 'closure_type', name: 'Tipo de cierre', type: 'select', options: ['Sin cierre (pullover)', 'Cierre frontal', 'Cierre trasero', 'Cierre deportivo'] },
    { id: 'padding', name: 'Acolchado', type: 'select', options: ['Sin acolchado', 'Acolchado muy ligero', 'Acolchado ligero', 'Moldeado suave'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Sin aros', 'Hipoalergénico', 'Suave al tacto', 'Sin costuras', 'Elástico suave', 'Cómodo'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado sutil', 'Flores pequeñas', 'Rayas finas', 'Corazones', 'Mariposas', 'Básico elegante'] },
    { id: 'straps', name: 'Tipo de tirantes', type: 'select', options: ['Tirantes ajustables', 'Tirantes fijos', 'Tirantes anchos', 'Racerback', 'Cruzados'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3'] },
    { id: 'comfort', name: 'Características de comodidad', type: 'tags', options: ['Extra suave', 'Flexible', 'Transpirable', 'No se marca', 'Fácil de poner'] },
    { id: 'educational', name: 'Aspectos educativos', type: 'tags', options: ['Primer sujetador', 'Transición', 'Desarrollo apropiado', 'Confianza', 'Comodidad'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Ciclo delicado', 'Secado al aire', 'No planchar', 'Cuidado especial'] }
  ],
  // Camisetas interiores para niñas  
  'fashion-clothing-underwear-girls-undershirts-regular': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Rosa', 'Gris', 'Negro', 'Azul', 'Morado', 'Beige', 'Multicolor'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Algodón orgánico', 'Bambú', 'Modal', 'Mezcla algodón-poliéster', 'Jersey suave'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto', 'Sin cuello'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Slim fit'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 4', 'Pack de 5'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Absorbe humedad', 'Antibacterial', 'Suave al tacto', 'Sin costuras', 'Hipoalergénico'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Uso diario', 'Deportivo', 'Escuela', 'Capa base', 'Térmica', 'Casual'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Todo el año', 'Entretiempo'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Estampado sutil', 'Personajes', 'Flores', 'Princesas', 'Mariposas', 'Básico'] },
    { id: 'comfort', name: 'Comodidad', type: 'tags', options: ['Extra suave', 'Flexible', 'No se arruga', 'Ligera', 'Cómoda'] },
    { id: 'age_appropriate', name: 'Apropiado para edad', type: 'select', options: ['Bebé (2-4 años)', 'Niña pequeña (4-7 años)', 'Niña (7-12 años)', 'Pre-adolescente (12-16 años)'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil planchar', 'No encoge', 'Secado rápido', 'Resistente al lavado'] }
  ],
  // Bodis para lencería
  'fashion-clothing-lingerie-bodysuits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Rojo', 'Azul marino', 'Beige', 'Morado', 'Verde esmeralda'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Encaje', 'Satén', 'Seda', 'Modal', 'Lycra', 'Algodón-elastano', 'Microfibra'] },
    { id: 'style', name: 'Estilo de body', type: 'select', options: ['Clásico', 'Escote profundo', 'Espalda abierta', 'Manga larga', 'Sin mangas', 'Halter'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello alto', 'Escote en V', 'Escote corazón', 'Escote recto', 'Halter'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Broches entrepierna', 'Sin cierre', 'Cierre lateral', 'Cierre trasero'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Íntimo', 'Casual elegante', 'Noche', 'Especial', 'Diario'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Moldeador', 'Push-up', 'Sin aros', 'Transpirable', 'Sensual', 'Cómodo'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Ciclo delicado', 'Secado al aire', 'No planchar', 'Lavado en seco'] }
  ],
  // Fajas reductoras para lencería
  'fashion-clothing-lingerie-shapewear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Beige', 'Negro', 'Blanco', 'Rosa nude', 'Chocolate'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon-elastano', 'Lycra', 'Powernet', 'Microfibra técnica', 'Algodón-elastano'] },
    { id: 'support_level', name: 'Nivel de control', type: 'select', options: ['Ligero', 'Medio', 'Firme', 'Extra firme'] },
    { id: 'target_area', name: 'Área objetivo', type: 'tags', options: ['Abdomen', 'Cintura', 'Caderas', 'Muslos', 'Espalda', 'Busto', 'Cuerpo completo'] },
    { id: 'style', name: 'Estilo de faja', type: 'select', options: ['Faja completa', 'Faja abdominal', 'Short moldeador', 'Body moldeador', 'Corsé'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Sin costuras', 'Transpirable', 'Anti-bacterial', 'Levanta glúteos', 'Reduce cintura'] },
    { id: 'occasion', name: 'Uso', type: 'tags', options: ['Uso diario', 'Ocasión especial', 'Post-parto', 'Deportivo', 'Vestidos ajustados'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Ciclo delicado', 'Secado al aire', 'No usar suavizante'] }
  ],
  // Calzones para mujeres
  'fashion-clothing-lingerie-panties-women': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Rojo', 'Azul marino', 'Beige', 'Morado', 'Verde'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Encaje', 'Algodón', 'Modal', 'Seda', 'Microfibra', 'Bambú', 'Lycra'] },
    { id: 'style', name: 'Estilo de calzón', type: 'select', options: ['Bikini', 'Hipster', 'Brief', 'Tanga', 'Brasileña', 'Boyshort'] },
    { id: 'waist_height', name: 'Altura de cintura', type: 'select', options: ['Cintura baja', 'Cintura media', 'Cintura alta'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Encaje', 'Estampado', 'Transparente', 'Bordado', 'Con lazos'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Sin costuras', 'Transpirable', 'Antibacterial', 'Sin marcas', 'Cómodo'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Íntimo', 'Deportivo', 'Especial', 'Sensual'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Lavable en máquina', 'Ciclo delicado', 'Secado al aire'] }
  ],
  // Camisetas interiores para mujeres
  'fashion-clothing-lingerie-undershirts-women': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Beige', 'Rosa', 'Gris', 'Azul marino'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón 100%', 'Modal', 'Bambú', 'Mezcla algodón-lycra', 'Microfibra'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga', 'Manga 3/4'] },
    { id: 'neckline', name: 'Tipo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto', 'Escote amplio'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Slim fit'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Absorbe humedad', 'Sin costuras', 'Antibacterial', 'Termorregulador'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Capa base', 'Uso diario', 'Deportivo', 'Trabajo', 'Camisón corto'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 4'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'No planchar', 'Secado rápido'] }
  ],
  // Bragas de ropa interior de mujer
  'fashion-clothing-lingerie-briefs-women': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Rojo', 'Azul', 'Beige', 'Morado', 'Estampados'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Encaje', 'Modal', 'Seda', 'Microfibra', 'Lycra', 'Bambú'] },
    { id: 'style', name: 'Estilo de braga', type: 'select', options: ['Brief clásico', 'Brief alto', 'Maxi brief', 'Control brief', 'Braga menstrual'] },
    { id: 'waist_coverage', name: 'Cobertura de cintura', type: 'select', options: ['Cobertura total', 'Cobertura media', 'Cobertura básica'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Encaje', 'Bordado', 'Estampado', 'Con cintas', 'Transparencias'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Sin costuras', 'Cómodo', 'Transpirable', 'Control abdominal', 'Antibacterial'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Comodidad', 'Control', 'Menstrual', 'Deportivo'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Ciclo delicado', 'Lavado a mano', 'Secado al aire'] }
  ],
  // Accesorios para sujetadores
  'fashion-clothing-lingerie-bra-accessories': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Transparente', 'Beige', 'Negro', 'Blanco', 'Rosa'] },
    { id: 'product_type', name: 'Tipo de accesorio', type: 'select', options: ['Tirantes', 'Almohadillas', 'Extensores', 'Clips', 'Protectores de pezón', 'Insertos'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Silicona', 'Gel', 'Espuma', 'Tela', 'Elastano', 'Plástico'] },
    { id: 'size', name: 'Talla/Tamaño', type: 'tags', options: ['Único', 'S', 'M', 'L', 'Ajustable'] },
    { id: 'functionality', name: 'Funcionalidad', type: 'tags', options: ['Relleno', 'Soporte', 'Extensión', 'Corrección', 'Comodidad', 'Invisibilidad'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'tags', options: ['Sujetador deportivo', 'Sujetador con aros', 'Sujetador sin aros', 'Universal'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Reutilizable', 'Lavable', 'Hipoalergénico', 'Transpirable', 'Invisible'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 4', 'Pack de 6'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Agua fría', 'Secado al aire', 'No usar jabón fuerte'] }
  ],
  // Sujetadores
  'fashion-clothing-lingerie-bras': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Beige', 'Rosa', 'Rojo', 'Azul marino', 'Morado', 'Verde'] },
    { id: 'size', name: 'Talla de sujetador', type: 'tags', options: ['32A', '32B', '32C', '34A', '34B', '34C', '34D', '36B', '36C', '36D', '38C', '38D', '40C', '40D'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Encaje', 'Algodón', 'Microfibra', 'Seda', 'Modal', 'Lycra', 'Satén'] },
    { id: 'style', name: 'Estilo de sujetador', type: 'select', options: ['Push-up', 'Balconette', 'Full cup', 'Demi cup', 'Bandeau', 'Bralette', 'Deportivo'] },
    { id: 'support_level', name: 'Nivel de soporte', type: 'select', options: ['Ligero', 'Medio', 'Alto', 'Máximo'] },
    { id: 'padding', name: 'Tipo de acolchado', type: 'select', options: ['Sin acolchado', 'Acolchado ligero', 'Push-up', 'Moldeado', 'Con gel'] },
    { id: 'underwire', name: 'Con aros', type: 'select', options: ['Sin aros', 'Con aros', 'Aros suaves'] },
    { id: 'straps', name: 'Tipo de tirantes', type: 'select', options: ['Tirantes clásicos', 'Tirantes convertibles', 'Halter', 'Racerback', 'Sin tirantes'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Deportivo', 'Íntimo', 'Especial', 'Vestidos', 'T-shirt'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Sin costuras', 'Moldeador', 'Sensual', 'Cómodo', 'Invisible'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Ciclo delicado', 'Secado al aire', 'No retorcer', 'Guardar con forma'] }
  ],
  // Camisolas
  'fashion-clothing-lingerie-camisoles': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Rojo', 'Azul marino', 'Beige', 'Morado', 'Dorado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Seda', 'Satén', 'Encaje', 'Modal', 'Algodón', 'Chiffon', 'Lycra'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corta', 'Media', 'Larga', 'Extra larga'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello en V', 'Escote recto', 'Halter', 'Escote corazón', 'Cuello alto'] },
    { id: 'straps', name: 'Tipo de tirantes', type: 'select', options: ['Tirantes finos', 'Tirantes anchos', 'Sin tirantes', 'Halter', 'Cruzados'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásica', 'Sensual', 'Romántica', 'Deportiva', 'Casual elegante'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Suave', 'Sensual', 'Cómoda', 'Elegante', 'Con sujetador'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Dormir', 'Íntimo', 'Casual', 'Especial', 'Loungewear'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Ciclo delicado', 'Lavado en seco', 'Secado al aire', 'Planchar suave'] }
  ],
  // Medias
  'fashion-clothing-lingerie-stockings': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Beige', 'Blanco', 'Gris', 'Rojo', 'Azul marino', 'Transparente'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['S', 'M', 'L', 'XL', 'Única'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Lycra', 'Seda', 'Algodón', 'Microfibra', 'Elastano'] },
    { id: 'denier', name: 'Deniers', type: 'select', options: ['5-10 (Ultra finas)', '15-20 (Finas)', '30-40 (Medianas)', '50-60 (Opacas)', '80+ (Gruesas)'] },
    { id: 'style', name: 'Estilo de media', type: 'select', options: ['Pantimedias', 'Medias hasta muslo', 'Medias con liga', 'Medias deportivas', 'Medias de compresión'] },
    { id: 'finish', name: 'Acabado', type: 'select', options: ['Transparente', 'Mate', 'Brillante', 'Con textura', 'Con costura'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Anti-runs', 'Transpirable', 'Compresión', 'Antibacterial', 'Control de humedad'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Formal', 'Casual', 'Deportivo', 'Íntimo', 'Profesional'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Agua fría', 'No retorcer', 'Secado al aire', 'Cuidado delicado'] }
  ],
  // Suspensorios
  'fashion-clothing-lingerie-garters': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rojo', 'Rosa', 'Azul marino', 'Morado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Encaje', 'Satén', 'Lycra', 'Seda', 'Elástico decorativo'] },
    { id: 'style', name: 'Estilo de suspensorio', type: 'select', options: ['Clásico', 'High waist', 'Vintage', 'Moderno', 'Deportivo'] },
    { id: 'clips_number', name: 'Número de clips', type: 'select', options: ['4 clips', '6 clips', '8 clips'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Encaje', 'Bordado', 'Con lazos', 'Transparente', 'Estampado'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Ajustable', 'Clips metálicos', 'Cómodo', 'Sensual', 'Elástico'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Íntimo', 'Especial', 'Romántico', 'Fetiche', 'Vintage'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'tags', options: ['Medias con costura', 'Medias lisas', 'Cualquier media'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavado a mano', 'Ciclo delicado', 'Secado al aire', 'No planchar clips'] }
  ],
  // Accesorios de lencería
  'fashion-clothing-lingerie-accessories': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Blanco', 'Rosa', 'Rojo', 'Dorado', 'Plateado', 'Transparente'] },
    { id: 'product_type', name: 'Tipo de accesorio', type: 'select', options: ['Antifaz', 'Guantes', 'Medias decorativas', 'Cinturones', 'Collares', 'Pulseras', 'Diademas'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Encaje', 'Satén', 'Seda', 'Cuero sintético', 'Plumas', 'Perlas', 'Metal'] },
    { id: 'size', name: 'Talla/Tamaño', type: 'tags', options: ['Único', 'S', 'M', 'L', 'Ajustable'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Clásico', 'Vintage', 'Gótico', 'Romántico', 'Moderno', 'Fetiche'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Íntimo', 'Fiesta', 'Disfraz', 'Romántico', 'Especial', 'Juego de rol'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Ajustable', 'Decorativo', 'Sensual', 'Cómodo', 'Elegante'] },
    { id: 'pack_content', name: 'Contenido del pack', type: 'tags', options: ['Individual', 'Set completo', 'Con estuche', 'Con instrucciones'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Limpiar con paño', 'Lavado a mano', 'Secar bien', 'Guardar cuidadosamente'] }
  ],
  // Enaguas y pololos
  'fashion-clothing-lingerie-slips': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Beige', 'Rosa', 'Gris', 'Azul marino'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Modal', 'Seda', 'Satén', 'Microfibra', 'Nylon'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['Enagua completa', 'Media enagua', 'Pololo', 'Combinación', 'Slip dress'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Corta', 'Media', 'Larga', 'Hasta rodilla', 'Hasta tobillo'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Sin mangas', 'Tirantes ajustables'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Anti-static', 'Transpirable', 'Sin costuras', 'Cómoda', 'Ligera'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Capa base', 'Anti-transparencia', 'Suavizar líneas', 'Modestia', 'Comodidad'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Diario', 'Formal', 'Vestidos', 'Trabajo', 'Especial'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Ciclo delicado', 'Secado al aire', 'Planchar suave'] }
  ],
  // Sujetadores de lactancia
  'fashion-clothing-maternity-nursing-bras': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Beige', 'Negro', 'Rosa suave', 'Gris claro', 'Azul claro'] },
    { id: 'size', name: 'Talla de sujetador', type: 'tags', options: ['34B', '34C', '34D', '36B', '36C', '36D', '36DD', '38C', '38D', '38DD', '40C', '40D', '40DD'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón orgánico', 'Bambú', 'Modal', 'Microfibra suave', 'Mezcla algodón-elastano'] },
    { id: 'nursing_style', name: 'Estilo de lactancia', type: 'select', options: ['Clip frontal', 'Abertura superior', 'Crossover', 'Clip lateral', 'Pull-aside'] },
    { id: 'support_level', name: 'Nivel de soporte', type: 'select', options: ['Ligero', 'Medio', 'Alto', 'Soporte completo'] },
    { id: 'underwire', name: 'Con aros', type: 'select', options: ['Sin aros', 'Con aros suaves', 'Aros flexibles'] },
    { id: 'padding', name: 'Acolchado', type: 'select', options: ['Sin acolchado', 'Acolchado ligero', 'Moldeado suave', 'Removible'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Antibacterial', 'Sin costuras', 'Elástico', 'Cómodo', 'Ajustable'] },
    { id: 'pregnancy_stage', name: 'Etapa', type: 'tags', options: ['Embarazo', 'Lactancia', 'Post-parto', 'Durante y después'] },
    { id: 'pack_size', name: 'Tamaño del pack', type: 'select', options: ['Individual', 'Pack de 2', 'Pack de 3'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Ciclo delicado', 'Secado al aire', 'No retorcer'] }
  ],
  // Vestidos de maternidad
  'fashion-clothing-maternity-dresses': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Rosa', 'Verde', 'Beige', 'Blanco', 'Estampado floral'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón elástico', 'Jersey', 'Modal', 'Viscosa', 'Poliéster-elastano', 'Mezcla suave'] },
    { id: 'length', name: 'Largo del vestido', type: 'select', options: ['Corto', 'Midi', 'Largo', 'Maxi'] },
    { id: 'style', name: 'Estilo', type: 'select', options: ['A-line', 'Wrap', 'Bodycon', 'Empire waist', 'Shift', 'Casual'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Escote cruzado', 'Halter', 'Off-shoulder'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Trabajo', 'Formal', 'Fiesta', 'Baby shower', 'Diario'] },
    { id: 'nursing_friendly', name: 'Apto para lactancia', type: 'select', options: ['Sí', 'No', 'Fácil acceso'] },
    { id: 'pregnancy_stage', name: 'Etapa del embarazo', type: 'tags', options: ['Primer trimestre', 'Segundo trimestre', 'Tercer trimestre', 'Post-parto'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Elástico', 'Cómodo', 'Transpirable', 'Adjustable', 'Crecimiento adaptable'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Fácil cuidado', 'Planchar suave', 'Secado rápido'] }
  ],
  // Monos de maternidad
  'fashion-clothing-maternity-jumpsuits': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Verde oliva', 'Beige', 'Rosa', 'Estampado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-elastano', 'Jersey elástico', 'Viscosa', 'Poliéster-lycra', 'Mezclilla elástica'] },
    { id: 'style', name: 'Estilo de mono', type: 'select', options: ['Casual', 'Elegante', 'Deportivo', 'Wide leg', 'Fitted', 'Palazzo'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Tobillero', 'Largo completo', 'Capri', '7/8'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Halter', 'Strapless', 'Off-shoulder'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'waist_style', name: 'Estilo de cintura', type: 'select', options: ['Cintura elástica', 'Ajustable', 'Empire', 'Drawstring', 'Banda bajo busto'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Formal', 'Trabajo', 'Fiesta', 'Verano', 'Playa'] },
    { id: 'nursing_access', name: 'Acceso para lactancia', type: 'select', options: ['Sí', 'No', 'Fácil acceso'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Elástico', 'Cómodo', 'Bolsillos', 'Ajustable', 'Versátil'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Planchar suave', 'Secado rápido', 'Fácil cuidado'] }
  ],
  // Pantalones de maternidad
  'fashion-clothing-maternity-pants': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Blanco', 'Beige', 'Mezclilla azul', 'Verde oliva'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-elastano', 'Mezclilla elástica', 'Poliéster-lycra', 'Viscosa', 'Jersey'] },
    { id: 'style', name: 'Estilo de pantalón', type: 'select', options: ['Jeans', 'Leggings', 'Chinos', 'Dress pants', 'Cargo', 'Wide leg'] },
    { id: 'length', name: 'Largo', type: 'select', options: ['Tobillero', 'Regular', 'Largo', 'Capri', 'Shorts'] },
    { id: 'waist_type', name: 'Tipo de cintura', type: 'select', options: ['Banda completa', 'Banda baja', 'Side panel', 'Under bump', 'Over bump'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Skinny', 'Straight', 'Bootcut', 'Wide leg', 'Relaxed', 'Slim'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Trabajo', 'Formal', 'Deportivo', 'Diario', 'Oficina'] },
    { id: 'pregnancy_stage', name: 'Etapa del embarazo', type: 'tags', options: ['Temprano', 'Medio', 'Tardío', 'Post-parto', 'Todo el embarazo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Elástico', 'Ajustable', 'Cómodo', 'Bolsillos', 'Crecimiento adaptable'] },
    { id: 'closure', name: 'Tipo de cierre', type: 'select', options: ['Elástico', 'Botón ajustable', 'Cordón', 'Sin cierre', 'Cierre lateral'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Planchar', 'Secado rápido', 'Fácil cuidado'] }
  ],
  // Faldas de maternidad
  'fashion-clothing-maternity-skirts': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Gris', 'Beige', 'Rosa', 'Verde', 'Estampado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón-elastano', 'Jersey', 'Viscosa', 'Poliéster-lycra', 'Modal'] },
    { id: 'length', name: 'Largo de falda', type: 'select', options: ['Mini', 'Corta', 'Midi', 'Larga', 'Maxi'] },
    { id: 'style', name: 'Estilo de falda', type: 'select', options: ['A-line', 'Pencil', 'Pleated', 'Wrap', 'Bodycon', 'Flowy'] },
    { id: 'waist_type', name: 'Tipo de cintura', type: 'select', options: ['Banda completa', 'Banda baja', 'Under bump', 'Over bump', 'Ajustable'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Trabajo', 'Formal', 'Fiesta', 'Diario', 'Oficina'] },
    { id: 'pregnancy_stage', name: 'Etapa del embarazo', type: 'tags', options: ['Temprano', 'Medio', 'Tardío', 'Post-parto', 'Todo el embarazo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Elástico', 'Cómodo', 'Transpirable', 'Ajustable', 'Versátil'] },
    { id: 'pattern', name: 'Patrón', type: 'tags', options: ['Liso', 'Rayas', 'Floral', 'Lunares', 'Geométrico', 'Estampado'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Planchar suave', 'Secado rápido', 'Fácil cuidado'] }
  ],
  // Ropa de dormir de maternidad
  'fashion-clothing-maternity-sleepwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Rosa', 'Azul claro', 'Gris', 'Blanco', 'Lavanda', 'Verde menta', 'Estampado floral'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón suave', 'Modal', 'Bambú', 'Jersey de algodón', 'Microfibra', 'Seda sintética'] },
    { id: 'garment_type', name: 'Tipo de prenda', type: 'select', options: ['Pijama 2 piezas', 'Camisón', 'Bata', 'Conjunto 3 piezas', 'Shorts + top'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'nursing_access', name: 'Acceso para lactancia', type: 'select', options: ['Sí', 'No', 'Botones frontales', 'Wrap style', 'Clip access'] },
    { id: 'season', name: 'Temporada', type: 'select', options: ['Verano', 'Invierno', 'Entretiempo', 'Todo el año'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Transpirable', 'Suave', 'Elástico', 'Cómodo', 'Antibacterial', 'Hipoalergénico'] },
    { id: 'pregnancy_stage', name: 'Etapa', type: 'tags', options: ['Embarazo', 'Lactancia', 'Post-parto', 'Durante y después'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Clásico', 'Romántico', 'Moderno', 'Casual', 'Elegante'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Suave detergente', 'Secado al aire', 'Planchar suave'] }
  ],
  // Traje de baño de maternidad
  'fashion-clothing-maternity-swimwear': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Negro', 'Azul marino', 'Verde', 'Rosa', 'Estampado tropical', 'Rayas', 'Floral'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon-elastano', 'Poliéster-lycra', 'Microfibra elástica', 'Material de secado rápido'] },
    { id: 'style', name: 'Estilo de traje', type: 'select', options: ['Una pieza', 'Dos piezas', 'Tankini', 'Monokini', 'Bikini'] },
    { id: 'support_level', name: 'Nivel de soporte', type: 'select', options: ['Ligero', 'Medio', 'Alto soporte', 'Sujetador integrado'] },
    { id: 'coverage', name: 'Cobertura', type: 'select', options: ['Completa', 'Media', 'Mínima', 'Abdomen completo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Protección UV', 'Secado rápido', 'Elástico', 'Ajustable', 'Cómodo', 'Moldeador'] },
    { id: 'belly_support', name: 'Soporte abdominal', type: 'select', options: ['Sí', 'No', 'Panel de soporte', 'Banda bajo busto'] },
    { id: 'nursing_friendly', name: 'Apto para lactancia', type: 'select', options: ['Sí', 'No', 'Fácil acceso'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Playa', 'Piscina', 'Vacaciones', 'Deportes acuáticos', 'Prenatal aqua'] },
    { id: 'adjustability', name: 'Ajustabilidad', type: 'tags', options: ['Tirantes ajustables', 'Cordones laterales', 'Elástico adaptable'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Enjuagar después del uso', 'Lavado a mano', 'Secado al aire', 'No planchar'] }
  ],
  // Tops de maternidad
  'fashion-clothing-maternity-tops': [
    { id: 'color', name: 'Color', type: 'tags', options: ['Blanco', 'Negro', 'Gris', 'Rosa', 'Azul', 'Verde', 'Beige', 'Estampado'] },
    { id: 'size', name: 'Talla', type: 'tags', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Jersey elástico', 'Modal', 'Viscosa', 'Poliéster-elastano', 'Bambú'] },
    { id: 'style', name: 'Estilo de top', type: 'select', options: ['Básico', 'Wrap', 'Peplum', 'Túnica', 'Blusa', 'Camiseta'] },
    { id: 'sleeve_type', name: 'Tipo de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'neckline', name: 'Tipo de escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Escote barco', 'Halter', 'Off-shoulder'] },
    { id: 'fit', name: 'Ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Empire waist', 'Flowing'] },
    { id: 'nursing_access', name: 'Acceso para lactancia', type: 'select', options: ['Sí', 'No', 'Lift-up', 'Wrap style', 'Side access'] },
    { id: 'occasion', name: 'Ocasión', type: 'tags', options: ['Casual', 'Trabajo', 'Formal', 'Deportivo', 'Diario', 'Elegante'] },
    { id: 'pregnancy_stage', name: 'Etapa', type: 'tags', options: ['Temprano', 'Medio', 'Tardío', 'Post-parto', 'Todo el embarazo'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Elástico', 'Transpirable', 'Cómodo', 'Suave', 'Ajustable', 'Versátil'] },
    { id: 'care', name: 'Cuidado', type: 'tags', options: ['Lavable en máquina', 'Planchar suave', 'Secado rápido', 'Fácil cuidado'] }
  ],

  // ===================================================
  // PRODUCTOS PARA MASCOTAS - METADATOS COMPLETOS
  // ===================================================

  // Productos para mascotas (categoría principal)
  'pets': [
    { id: 'pet_type', name: 'Tipo de mascota', type: 'select', options: ['Perro', 'Gato', 'Ave', 'Pez', 'Roedor', 'Reptil', 'Otro'] },
    { id: 'pet_size', name: 'Tamaño de mascota', type: 'select', options: ['Extra pequeño', 'Pequeño', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'pet_age', name: 'Edad de mascota', type: 'select', options: ['Cachorro/Cría', 'Joven', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'product_category', name: 'Categoría de producto', type: 'select', options: ['Alimentación', 'Juguetes', 'Accesorios', 'Cuidado e higiene', 'Salud', 'Hábitat', 'Entrenamiento'] },
    { id: 'brand', name: 'Marca', type: 'text' },
    { id: 'indoor_outdoor', name: 'Uso', type: 'select', options: ['Interior', 'Exterior', 'Interior/Exterior'] }
  ],

  // Perros (categoría general)
  'pets-dogs': [
    { id: 'dog_size', name: 'Tamaño del perro', type: 'select', options: ['Toy (menos de 3kg)', 'Pequeño (3-10kg)', 'Mediano (10-25kg)', 'Grande (25-45kg)', 'Gigante (más de 45kg)'] },
    { id: 'dog_age', name: 'Edad del perro', type: 'select', options: ['Cachorro (0-12 meses)', 'Joven (1-3 años)', 'Adulto (3-7 años)', 'Senior (7+ años)'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Comida', 'Premios', 'Juguetes', 'Correas y collares', 'Camas', 'Cuidado', 'Salud', 'Entrenamiento'] },
    { id: 'activity_level', name: 'Nivel de actividad', type: 'select', options: ['Bajo', 'Moderado', 'Alto', 'Muy alto'] },
    { id: 'breed_group', name: 'Grupo de raza', type: 'select', options: ['Toy', 'Terrier', 'Trabajador', 'Pastor', 'Sabueso', 'Deportivo', 'No deportivo', 'Mixto'] },
    { id: 'special_needs', name: 'Necesidades especiales', type: 'tags', options: ['Piel sensible', 'Alergias', 'Digestión sensible', 'Control de peso', 'Articulaciones', 'Dental'] }
  ],

  // Comida para perros
  'pets-dogs-food': [
    { id: 'dog_size', name: 'Tamaño del perro', type: 'select', options: ['Toy', 'Pequeño', 'Mediano', 'Grande', 'Gigante', 'Todos los tamaños'] },
    { id: 'dog_age', name: 'Edad del perro', type: 'select', options: ['Cachorro', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Seco (croquetas)', 'Húmedo (latas)', 'Semi-húmedo', 'Crudo/BARF', 'Deshidratado'] },
    { id: 'protein_source', name: 'Fuente de proteína', type: 'tags', options: ['Pollo', 'Res', 'Cordero', 'Pescado', 'Pavo', 'Cerdo', 'Venado', 'Pato', 'Vegetariano'] },
    { id: 'grain_free', name: 'Sin cereales', type: 'select', options: ['Sí', 'No'] },
    { id: 'special_diet', name: 'Dieta especial', type: 'tags', options: ['Hipoalergénico', 'Control de peso', 'Digestión sensible', 'Piel y pelaje', 'Articulaciones', 'Orgánico', 'Natural'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 1kg', '1-3kg', '3-7kg', '7-15kg', 'Más de 15kg'] },
    { id: 'texture', name: 'Textura', type: 'select', options: ['Croquetas pequeñas', 'Croquetas medianas', 'Croquetas grandes', 'Paté', 'Trozos en salsa', 'Filetes'] }
  ],

  // Premios y snacks para perros
  'pets-dogs-treats': [
    { id: 'dog_size', name: 'Tamaño del perro', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Todos los tamaños'] },
    { id: 'treat_type', name: 'Tipo de premio', type: 'select', options: ['Galletas', 'Huesos masticables', 'Snacks blandos', 'Premios dentales', 'Premios de entrenamiento', 'Jerky', 'Sticks'] },
    { id: 'protein_source', name: 'Sabor/Proteína', type: 'tags', options: ['Pollo', 'Res', 'Cordero', 'Pescado', 'Pavo', 'Bacon', 'Hígado', 'Vegetales'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Entrenamiento', 'Salud dental', 'Recompensa', 'Ocupación', 'Digestión', 'Articulaciones', 'Piel y pelaje'] },
    { id: 'texture', name: 'Textura', type: 'select', options: ['Crujiente', 'Blando', 'Masticable', 'Duro'] },
    { id: 'natural', name: 'Natural/Orgánico', type: 'select', options: ['Natural', 'Orgánico', 'Convencional'] },
    { id: 'grain_free', name: 'Sin cereales', type: 'select', options: ['Sí', 'No'] }
  ],

  // Juguetes para perros
  'pets-dogs-toys': [
    { id: 'dog_size', name: 'Tamaño del perro', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'toy_type', name: 'Tipo de juguete', type: 'select', options: ['Peluche', 'Cuerda', 'Pelota', 'Frisbee', 'Hueso de juguete', 'Puzzle/Interactivo', 'Masticable', 'Squeaky'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Felpa', 'Caucho', 'Cuerda', 'Plástico', 'Nylon', 'Cuero', 'Madera', 'Natural'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Entretenimiento', 'Ejercicio', 'Masticación', 'Estimulación mental', 'Entrenamiento', 'Comfort', 'Dental'] },
    { id: 'durability', name: 'Durabilidad', type: 'select', options: ['Suave (masticadores ligeros)', 'Moderada', 'Resistente (masticadores fuertes)', 'Extra resistente'] },
    { id: 'interactive', name: 'Interactivo', type: 'select', options: ['Sí', 'No'] },
    { id: 'sound', name: 'Sonido', type: 'select', options: ['Con sonido', 'Sin sonido', 'Crujiente'] }
  ],

  // Accesorios para perros
  'pets-dogs-accessories': [
    { id: 'dog_size', name: 'Tamaño del perro', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Collar', 'Correa', 'Arnés', 'Ropa', 'Cama', 'Transportadora', 'Platos', 'Bozal', 'Identificación'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Nylon', 'Cuero', 'Tela', 'Metal', 'Plástico', 'Caucho', 'Algodón', 'Poliéster'] },
    { id: 'adjustable', name: 'Ajustable', type: 'select', options: ['Sí', 'No'] },
    { id: 'waterproof', name: 'Resistente al agua', type: 'select', options: ['Sí', 'No'] },
    { id: 'reflective', name: 'Reflectivo', type: 'select', options: ['Sí', 'No'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Básico', 'Elegante', 'Deportivo', 'Casual', 'Decorativo', 'Funcional'] }
  ],

  // Cuidado e higiene para perros
  'pets-dogs-grooming': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Champú', 'Acondicionador', 'Cepillo', 'Peine', 'Cortauñas', 'Limpieza dental', 'Toallitas', 'Desodorante'] },
    { id: 'coat_type', name: 'Tipo de pelaje', type: 'select', options: ['Corto', 'Largo', 'Rizado', 'Doble capa', 'Sin pelo', 'Todos los tipos'] },
    { id: 'skin_type', name: 'Tipo de piel', type: 'select', options: ['Normal', 'Sensible', 'Seca', 'Grasa', 'Con alergias'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Limpieza general', 'Anti-pulgas', 'Piel sensible', 'Brillo del pelaje', 'Desenredante', 'Antibacterial', 'Desodorante'] },
    { id: 'natural', name: 'Fórmula', type: 'select', options: ['Natural', 'Orgánico', 'Hipoalergénico', 'Medicado', 'Convencional'] },
    { id: 'scent', name: 'Aroma', type: 'tags', options: ['Sin aroma', 'Lavanda', 'Avena', 'Coco', 'Manzanilla', 'Cítrico', 'Menta'] }
  ],

  // Salud y bienestar para perros
  'pets-dogs-health': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Suplemento', 'Vitamina', 'Medicamento', 'Primeros auxilios', 'Antipulgas', 'Desparasitante', 'Cuidado dental'] },
    { id: 'health_focus', name: 'Enfoque de salud', type: 'tags', options: ['Articulaciones', 'Digestión', 'Piel y pelaje', 'Sistema inmune', 'Corazón', 'Ojos', 'Dental', 'Calming', 'Energía'] },
    { id: 'form', name: 'Forma', type: 'select', options: ['Tabletas', 'Cápsulas', 'Líquido', 'Polvo', 'Masticable', 'Spray', 'Crema', 'Collar'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Cachorro', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'natural', name: 'Tipo', type: 'select', options: ['Natural', 'Orgánico', 'Veterinario', 'Homeopático'] },
    { id: 'prescription', name: 'Prescripción', type: 'select', options: ['Con receta', 'Sin receta'] }
  ],

  // Entrenamiento para perros
  'pets-dogs-training': [
    { id: 'training_type', name: 'Tipo de entrenamiento', type: 'select', options: ['Obediencia básica', 'Casa/baño', 'Caminar con correa', 'Socialización', 'Trucos', 'Comportamiento', 'Agilidad'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Clicker', 'Silbato', 'Correa de entrenamiento', 'Collar de entrenamiento', 'Premios', 'Juguete interactivo', 'Libro/Guía'] },
    { id: 'age_group', name: 'Edad apropiada', type: 'select', options: ['Cachorro', 'Joven', 'Adulto', 'Todas las edades'] },
    { id: 'difficulty', name: 'Nivel de dificultad', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'] },
    { id: 'method', name: 'Método', type: 'tags', options: ['Refuerzo positivo', 'Clicker training', 'Comando de voz', 'Señales manuales', 'Treat-based'] }
  ],

  // Gatos (categoría general)
  'pets-cats': [
    { id: 'cat_age', name: 'Edad del gato', type: 'select', options: ['Gatito (0-12 meses)', 'Joven (1-3 años)', 'Adulto (3-7 años)', 'Senior (7+ años)'] },
    { id: 'cat_size', name: 'Tamaño del gato', type: 'select', options: ['Pequeño (menos de 3kg)', 'Mediano (3-5kg)', 'Grande (5-7kg)', 'Extra grande (más de 7kg)'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Comida', 'Premios', 'Juguetes', 'Arena', 'Accesorios', 'Cuidado', 'Salud', 'Rascadores'] },
    { id: 'indoor_outdoor', name: 'Estilo de vida', type: 'select', options: ['Interior', 'Exterior', 'Interior/Exterior'] },
    { id: 'activity_level', name: 'Nivel de actividad', type: 'select', options: ['Bajo', 'Moderado', 'Alto'] },
    { id: 'special_needs', name: 'Necesidades especiales', type: 'tags', options: ['Piel sensible', 'Alergias', 'Digestión sensible', 'Control de peso', 'Bolas de pelo', 'Dental'] }
  ],

  // Comida para gatos
  'pets-cats-food': [
    { id: 'cat_age', name: 'Edad del gato', type: 'select', options: ['Gatito', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Seco (croquetas)', 'Húmedo (latas)', 'Semi-húmedo', 'Crudo/BARF'] },
    { id: 'protein_source', name: 'Fuente de proteína', type: 'tags', options: ['Pollo', 'Pescado', 'Res', 'Cordero', 'Pavo', 'Atún', 'Salmón', 'Pato', 'Conejo'] },
    { id: 'grain_free', name: 'Sin cereales', type: 'select', options: ['Sí', 'No'] },
    { id: 'special_diet', name: 'Dieta especial', type: 'tags', options: ['Hipoalergénico', 'Control de peso', 'Digestión sensible', 'Bolas de pelo', 'Urinario', 'Indoor', 'Orgánico'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 1kg', '1-3kg', '3-7kg', '7-15kg', 'Más de 15kg'] },
    { id: 'texture', name: 'Textura', type: 'select', options: ['Croquetas pequeñas', 'Croquetas grandes', 'Paté', 'Trozos en salsa', 'Trozos en gelatina', 'Filetes'] }
  ],

  // Premios para gatos
  'pets-cats-treats': [
    { id: 'treat_type', name: 'Tipo de premio', type: 'select', options: ['Galletas crujientes', 'Snacks blandos', 'Premios dentales', 'Premios de entrenamiento', 'Hierba gatera', 'Lickables'] },
    { id: 'protein_source', name: 'Sabor/Proteína', type: 'tags', options: ['Pollo', 'Pescado', 'Atún', 'Salmón', 'Res', 'Pavo', 'Hígado', 'Camarón'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Entrenamiento', 'Salud dental', 'Recompensa', 'Bolas de pelo', 'Digestión', 'Relajación', 'Urinario'] },
    { id: 'texture', name: 'Textura', type: 'select', options: ['Crujiente', 'Blando', 'Cremoso', 'Lickable', 'Freeze-dried'] },
    { id: 'natural', name: 'Natural/Orgánico', type: 'select', options: ['Natural', 'Orgánico', 'Convencional'] },
    { id: 'grain_free', name: 'Sin cereales', type: 'select', options: ['Sí', 'No'] }
  ],

  // Juguetes para gatos
  'pets-cats-toys': [
    { id: 'toy_type', name: 'Tipo de juguete', type: 'select', options: ['Ratón de juguete', 'Varita con plumas', 'Pelota', 'Túnel', 'Puzzle/Interactivo', 'Catnip', 'Láser', 'Rascador'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Felpa', 'Plumas', 'Cuerda', 'Sisal', 'Cartón', 'Plástico', 'Caucho', 'Natural'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Caza/Instinto', 'Ejercicio', 'Estimulación mental', 'Rascado', 'Comfort', 'Entretenimiento', 'Interactivo'] },
    { id: 'interactive', name: 'Interactivo', type: 'select', options: ['Sí', 'No'] },
    { id: 'sound', name: 'Sonido', type: 'select', options: ['Con sonido', 'Sin sonido', 'Crujiente'] },
    { id: 'catnip', name: 'Con hierba gatera', type: 'select', options: ['Sí', 'No'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande'] }
  ],

  // Accesorios para gatos
  'pets-cats-accessories': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Collar', 'Arnés', 'Correa', 'Cama', 'Transportadora', 'Platos', 'Fuente de agua', 'Rascador', 'Casa/Cueva'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Nylon', 'Cuero', 'Tela', 'Plástico', 'Cerámica', 'Acero inoxidable', 'Sisal', 'Cartón'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'adjustable', name: 'Ajustable', type: 'select', options: ['Sí', 'No'] },
    { id: 'washable', name: 'Lavable', type: 'select', options: ['Sí', 'No'] },
    { id: 'style', name: 'Estilo', type: 'tags', options: ['Básico', 'Elegante', 'Decorativo', 'Funcional', 'Moderno', 'Tradicional'] }
  ],

  // Cuidado e higiene para gatos
  'pets-cats-grooming': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Champú', 'Cepillo', 'Peine', 'Cortauñas', 'Limpieza dental', 'Toallitas', 'Desodorante', 'Desenredante'] },
    { id: 'coat_type', name: 'Tipo de pelaje', type: 'select', options: ['Corto', 'Largo', 'Sin pelo', 'Todos los tipos'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Limpieza general', 'Bolas de pelo', 'Piel sensible', 'Brillo del pelaje', 'Desenredante', 'Antibacterial', 'Desodorante'] },
    { id: 'natural', name: 'Fórmula', type: 'select', options: ['Natural', 'Orgánico', 'Hipoalergénico', 'Convencional'] },
    { id: 'scent', name: 'Aroma', type: 'tags', options: ['Sin aroma', 'Lavanda', 'Manzanilla', 'Neutro', 'Fresco'] }
  ],

  // Salud y bienestar para gatos
  'pets-cats-health': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Suplemento', 'Vitamina', 'Medicamento', 'Primeros auxilios', 'Antipulgas', 'Desparasitante', 'Cuidado dental'] },
    { id: 'health_focus', name: 'Enfoque de salud', type: 'tags', options: ['Urinario', 'Digestión', 'Bolas de pelo', 'Articulaciones', 'Piel y pelaje', 'Sistema inmune', 'Dental', 'Calming', 'Respiratorio'] },
    { id: 'form', name: 'Forma', type: 'select', options: ['Tabletas', 'Cápsulas', 'Líquido', 'Polvo', 'Pasta', 'Spray', 'Collar'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Gatito', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'natural', name: 'Tipo', type: 'select', options: ['Natural', 'Orgánico', 'Veterinario', 'Homeopático'] },
    { id: 'prescription', name: 'Prescripción', type: 'select', options: ['Con receta', 'Sin receta'] }
  ],

  // Arena y bandejas para gatos
  'pets-cats-litter': [
    { id: 'litter_type', name: 'Tipo de arena', type: 'select', options: ['Arcilla', 'Aglomerante', 'Cristales de sílice', 'Natural/Biodegradable', 'Papel reciclado', 'Maíz', 'Madera'] },
    { id: 'clumping', name: 'Aglomerante', type: 'select', options: ['Sí', 'No'] },
    { id: 'scented', name: 'Con aroma', type: 'select', options: ['Sin aroma', 'Lavanda', 'Limón', 'Baby powder', 'Neutro'] },
    { id: 'dust_free', name: 'Sin polvo', type: 'select', options: ['Sí', 'No', 'Bajo polvo'] },
    { id: 'flushable', name: 'Biodegradable', type: 'select', options: ['Sí', 'No'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 5kg', '5-10kg', '10-20kg', 'Más de 20kg'] },
    { id: 'multi_cat', name: 'Para múltiples gatos', type: 'select', options: ['Sí', 'No'] }
  ],

  // Aves (categoría general)
  'pets-birds': [
    { id: 'bird_type', name: 'Tipo de ave', type: 'select', options: ['Canario', 'Periquito', 'Ninfa', 'Loro', 'Agapornis', 'Diamante', 'Jilguero', 'Otras aves pequeñas', 'Otras aves grandes'] },
    { id: 'bird_size', name: 'Tamaño del ave', type: 'select', options: ['Muy pequeña', 'Pequeña', 'Mediana', 'Grande'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Comida', 'Semillas', 'Jaula', 'Accesorios', 'Juguetes', 'Cuidado', 'Salud'] },
    { id: 'age_group', name: 'Edad', type: 'select', options: ['Polluelo', 'Juvenil', 'Adulto', 'Todas las edades'] }
  ],

  // Comida para aves
  'pets-birds-food': [
    { id: 'bird_type', name: 'Tipo de ave', type: 'select', options: ['Canario', 'Periquito', 'Ninfa', 'Loro', 'Agapornis', 'Aves pequeñas', 'Aves grandes', 'Todas las aves'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Semillas mixtas', 'Pellets', 'Frutas deshidratadas', 'Verduras', 'Suplementos', 'Pasta de cría'] },
    { id: 'age_group', name: 'Edad', type: 'select', options: ['Polluelo', 'Adulto', 'Todas las edades'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Mantenimiento', 'Cría', 'Muda', 'Canto', 'Color', 'Digestión'] },
    { id: 'natural', name: 'Tipo', type: 'select', options: ['Natural', 'Orgánico', 'Convencional'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 500g', '500g-1kg', '1-3kg', 'Más de 3kg'] }
  ],

  // Jaulas y accesorios para aves
  'pets-birds-cages': [
    { id: 'bird_size', name: 'Tamaño del ave', type: 'select', options: ['Pequeña', 'Mediana', 'Grande'] },
    { id: 'cage_type', name: 'Tipo de jaula', type: 'select', options: ['Jaula básica', 'Jaula de vuelo', 'Jaula de cría', 'Transportadora', 'Pajarera'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Acero inoxidable', 'Hierro pintado', 'Plástico', 'Madera'] },
    { id: 'cage_size', name: 'Tamaño de jaula', type: 'select', options: ['Pequeña (30-40cm)', 'Mediana (40-60cm)', 'Grande (60-80cm)', 'Extra grande (más de 80cm)'] },
    { id: 'accessories_included', name: 'Accesorios incluidos', type: 'tags', options: ['Perchas', 'Comederos', 'Bebederos', 'Juguetes', 'Nido', 'Bandeja'] }
  ],

  // Juguetes para aves
  'pets-birds-toys': [
    { id: 'bird_size', name: 'Tamaño del ave', type: 'select', options: ['Pequeña', 'Mediana', 'Grande'] },
    { id: 'toy_type', name: 'Tipo de juguete', type: 'select', options: ['Columpio', 'Espejo', 'Campana', 'Escalera', 'Cuerda', 'Puzzle', 'Masticable', 'Forrajeo'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Cuerda', 'Metal', 'Plástico', 'Natural', 'Cuero', 'Papel'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Entretenimiento', 'Ejercicio', 'Estimulación mental', 'Masticación', 'Forrajeo', 'Socialización'] },
    { id: 'interactive', name: 'Interactivo', type: 'select', options: ['Sí', 'No'] },
    { id: 'sound', name: 'Con sonido', type: 'select', options: ['Sí', 'No'] }
  ],

  // Salud para aves
  'pets-birds-health': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Suplemento vitamínico', 'Probiótico', 'Desparasitante', 'Antibiótico', 'Primeros auxilios', 'Limpieza'] },
    { id: 'health_focus', name: 'Enfoque de salud', type: 'tags', options: ['Sistema inmune', 'Digestión', 'Plumas', 'Respiratorio', 'Reproducción', 'Muda', 'Estrés'] },
    { id: 'form', name: 'Forma', type: 'select', options: ['Líquido', 'Polvo', 'Tabletas', 'Gotas', 'Spray'] },
    { id: 'age_group', name: 'Edad', type: 'select', options: ['Polluelo', 'Adulto', 'Todas las edades'] },
    { id: 'prescription', name: 'Prescripción', type: 'select', options: ['Con receta', 'Sin receta'] }
  ],

  // Peces (categoría general)
  'pets-fish': [
    { id: 'fish_type', name: 'Tipo de pez', type: 'select', options: ['Agua dulce tropical', 'Agua fría', 'Marino', 'Betta', 'Goldfish', 'Cíclidos', 'Tetras', 'Otros'] },
    { id: 'tank_size', name: 'Tamaño del acuario', type: 'select', options: ['Nano (menos de 40L)', 'Pequeño (40-100L)', 'Mediano (100-300L)', 'Grande (más de 300L)'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Comida', 'Acuario', 'Filtro', 'Decoración', 'Plantas', 'Iluminación', 'Calentador', 'Químicos'] },
    { id: 'experience_level', name: 'Nivel de experiencia', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'] }
  ],

  // Comida para peces
  'pets-fish-food': [
    { id: 'fish_type', name: 'Tipo de pez', type: 'select', options: ['Tropical', 'Goldfish', 'Betta', 'Marino', 'Cíclidos', 'Todos los peces'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Escamas', 'Gránulos', 'Tabletas', 'Comida viva', 'Congelada', 'Liofilizada'] },
    { id: 'fish_size', name: 'Tamaño del pez', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Todos los tamaños'] },
    { id: 'feeding_level', name: 'Nivel de alimentación', type: 'select', options: ['Superficie', 'Medio', 'Fondo', 'Todos los niveles'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Mantenimiento', 'Crecimiento', 'Color', 'Reproducción', 'Digestión'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 100g', '100-250g', '250-500g', 'Más de 500g'] }
  ],

  // Acuarios y decoración
  'pets-fish-aquariums': [
    { id: 'tank_type', name: 'Tipo de acuario', type: 'select', options: ['Agua dulce', 'Marino', 'Plantado', 'Biotopo', 'Comunitario'] },
    { id: 'tank_size', name: 'Capacidad', type: 'select', options: ['Nano (20-40L)', 'Pequeño (40-100L)', 'Mediano (100-300L)', 'Grande (300-500L)', 'Extra grande (más de 500L)'] },
    { id: 'shape', name: 'Forma', type: 'select', options: ['Rectangular', 'Cuadrado', 'Cilíndrico', 'Bow front', 'Esquinero'] },
    { id: 'decoration_type', name: 'Tipo de decoración', type: 'select', options: ['Plantas artificiales', 'Rocas', 'Troncos', 'Cuevas', 'Castillos', 'Coral artificial', 'Sustrato'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Vidrio', 'Acrílico', 'Plástico', 'Cerámica', 'Resina', 'Natural'] }
  ],

  // Equipos y filtros
  'pets-fish-equipment': [
    { id: 'equipment_type', name: 'Tipo de equipo', type: 'select', options: ['Filtro', 'Bomba de aire', 'Calentador', 'Termómetro', 'Iluminación', 'UV esterilizador', 'Skimmer'] },
    { id: 'tank_size', name: 'Para acuario de', type: 'select', options: ['Hasta 40L', '40-100L', '100-300L', '300-500L', 'Más de 500L'] },
    { id: 'filter_type', name: 'Tipo de filtro', type: 'select', options: ['Interno', 'Externo', 'Cascada', 'Esponja', 'Canister', 'UV'] },
    { id: 'power', name: 'Potencia', type: 'select', options: ['Baja (menos de 10W)', 'Media (10-25W)', 'Alta (25-50W)', 'Muy alta (más de 50W)'] },
    { id: 'water_type', name: 'Tipo de agua', type: 'select', options: ['Dulce', 'Salada', 'Ambos'] }
  ],

  // Cuidado del agua
  'pets-fish-care': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Acondicionador de agua', 'Bacterias beneficiosas', 'pH ajustador', 'Test kit', 'Limpiador de algas', 'Clarificador'] },
    { id: 'water_type', name: 'Tipo de agua', type: 'select', options: ['Dulce', 'Marina', 'Ambos'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Ciclado', 'Mantenimiento', 'Emergencia', 'Clarificación', 'pH', 'Dureza', 'Cloro', 'Amoniaco'] },
    { id: 'form', name: 'Forma', type: 'select', options: ['Líquido', 'Polvo', 'Tabletas', 'Test strips'] },
    { id: 'tank_size', name: 'Para acuario de', type: 'select', options: ['Hasta 100L', '100-300L', 'Más de 300L', 'Todos los tamaños'] }
  ],

  // Animales pequeños (categoría general)
  'pets-small-animals': [
    { id: 'animal_type', name: 'Tipo de animal', type: 'select', options: ['Hámster', 'Conejo', 'Cobaya', 'Chinchilla', 'Hurón', 'Ratón', 'Rata', 'Jerbo', 'Degú'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Comida', 'Hábitat', 'Juguetes', 'Cama/Sustrato', 'Accesorios', 'Cuidado', 'Salud'] },
    { id: 'age_group', name: 'Edad', type: 'select', options: ['Cría', 'Juvenil', 'Adulto', 'Todas las edades'] }
  ],

  // Comida para roedores
  'pets-small-food': [
    { id: 'animal_type', name: 'Tipo de animal', type: 'select', options: ['Hámster', 'Conejo', 'Cobaya', 'Chinchilla', 'Hurón', 'Todos los roedores'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Pellets', 'Mezcla de semillas', 'Heno', 'Verduras deshidratadas', 'Premios', 'Suplementos'] },
    { id: 'age_group', name: 'Edad', type: 'select', options: ['Cría', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'special_diet', name: 'Dieta especial', type: 'tags', options: ['Alto en fibra', 'Digestión sensible', 'Control de peso', 'Pelaje brillante', 'Dental'] },
    { id: 'natural', name: 'Tipo', type: 'select', options: ['Natural', 'Orgánico', 'Convencional'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 500g', '500g-1kg', '1-3kg', 'Más de 3kg'] }
  ],

  // Jaulas y hábitats
  'pets-small-cages': [
    { id: 'animal_type', name: 'Para animal', type: 'select', options: ['Hámster', 'Conejo', 'Cobaya', 'Chinchilla', 'Hurón', 'Múltiples especies'] },
    { id: 'cage_type', name: 'Tipo de hábitat', type: 'select', options: ['Jaula básica', 'Jaula con tubos', 'Terrario', 'Corral', 'Casa exterior'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (30-50cm)', 'Mediano (50-80cm)', 'Grande (80-120cm)', 'Extra grande (más de 120cm)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Metal', 'Plástico', 'Madera', 'Vidrio', 'Mixto'] },
    { id: 'levels', name: 'Niveles', type: 'select', options: ['Un nivel', 'Dos niveles', 'Múltiples niveles'] },
    { id: 'accessories_included', name: 'Accesorios incluidos', type: 'tags', options: ['Comedero', 'Bebedero', 'Casa', 'Rueda', 'Escaleras', 'Plataformas'] }
  ],

  // Juguetes y enriquecimiento
  'pets-small-toys': [
    { id: 'animal_type', name: 'Para animal', type: 'select', options: ['Hámster', 'Conejo', 'Cobaya', 'Chinchilla', 'Todos los roedores'] },
    { id: 'toy_type', name: 'Tipo de juguete', type: 'select', options: ['Rueda de ejercicio', 'Túneles', 'Casitas', 'Juguetes masticables', 'Pelotas', 'Escaleras', 'Columpios'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Plástico', 'Metal', 'Cuerda', 'Cartón', 'Natural', 'Willow'] },
    { id: 'purpose', name: 'Propósito', type: 'tags', options: ['Ejercicio', 'Masticación', 'Escondite', 'Entretenimiento', 'Estimulación mental', 'Dental'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande'] }
  ],

  // Camas y sustratos
  'pets-small-bedding': [
    { id: 'animal_type', name: 'Para animal', type: 'select', options: ['Hámster', 'Conejo', 'Cobaya', 'Chinchilla', 'Todos los roedores'] },
    { id: 'bedding_type', name: 'Tipo de cama', type: 'select', options: ['Virutas de madera', 'Papel reciclado', 'Maíz', 'Hemp', 'Paja', 'Pellets'] },
    { id: 'absorbency', name: 'Absorción', type: 'select', options: ['Baja', 'Media', 'Alta', 'Extra alta'] },
    { id: 'dust_free', name: 'Sin polvo', type: 'select', options: ['Sí', 'No'] },
    { id: 'odor_control', name: 'Control de olor', type: 'select', options: ['Sí', 'No'] },
    { id: 'biodegradable', name: 'Biodegradable', type: 'select', options: ['Sí', 'No'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Pequeño (menos de 10L)', 'Mediano (10-30L)', 'Grande (30-60L)', 'Extra grande (más de 60L)'] }
  ],

  // Reptiles (categoría general)
  'pets-reptiles': [
    { id: 'reptile_type', name: 'Tipo de reptil', type: 'select', options: ['Gecko', 'Iguana', 'Serpiente', 'Tortuga', 'Lagarto', 'Camaleón', 'Dragón barbudo', 'Otros'] },
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Comida', 'Terrario', 'Calefacción', 'Iluminación', 'Sustrato', 'Decoración', 'Cuidado', 'Salud'] },
    { id: 'habitat_type', name: 'Tipo de hábitat', type: 'select', options: ['Desértico', 'Tropical', 'Templado', 'Acuático', 'Semi-acuático'] },
    { id: 'experience_level', name: 'Nivel de experiencia', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'] }
  ],

  // Comida para reptiles
  'pets-reptiles-food': [
    { id: 'reptile_type', name: 'Tipo de reptil', type: 'select', options: ['Gecko', 'Iguana', 'Serpiente', 'Tortuga terrestre', 'Tortuga acuática', 'Dragón barbudo', 'Todos los reptiles'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Pellets', 'Comida viva', 'Congelada', 'Verduras deshidratadas', 'Frutas', 'Insectos', 'Suplementos'] },
    { id: 'diet_type', name: 'Tipo de dieta', type: 'select', options: ['Herbívoro', 'Carnívoro', 'Omnívoro'] },
    { id: 'age_group', name: 'Edad', type: 'select', options: ['Juvenil', 'Adulto', 'Todas las edades'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Menos de 250g', '250-500g', '500g-1kg', 'Más de 1kg'] }
  ],

  // Terrarios y decoración
  'pets-reptiles-terrariums': [
    { id: 'reptile_size', name: 'Tamaño del reptil', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'terrarium_type', name: 'Tipo de terrario', type: 'select', options: ['Desértico', 'Tropical', 'Acuático', 'Semi-acuático', 'Básico'] },
    { id: 'size', name: 'Tamaño del terrario', type: 'select', options: ['40x30cm', '60x40cm', '80x50cm', '100x60cm', 'Más grande'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Vidrio', 'Plástico', 'Madera', 'Mixto'] },
    { id: 'decoration_type', name: 'Tipo de decoración', type: 'select', options: ['Rocas', 'Troncos', 'Plantas artificiales', 'Cuevas', 'Cascadas', 'Fondos'] },
    { id: 'ventilation', name: 'Ventilación', type: 'select', options: ['Superior', 'Lateral', 'Mixta'] }
  ],

  // Calefacción e iluminación
  'pets-reptiles-heating': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Lámpara calefactora', 'Manta térmica', 'Lámpara UV', 'Termostato', 'Termómetro/Higrómetro', 'Bombilla'] },
    { id: 'wattage', name: 'Potencia', type: 'select', options: ['25W', '50W', '75W', '100W', '150W', 'Más de 150W'] },
    { id: 'light_type', name: 'Tipo de luz', type: 'select', options: ['UVA', 'UVB', 'UVA/UVB', 'Calor', 'LED', 'Halógena'] },
    { id: 'terrarium_size', name: 'Para terrario de', type: 'select', options: ['Pequeño (hasta 60cm)', 'Mediano (60-100cm)', 'Grande (más de 100cm)'] },
    { id: 'day_night', name: 'Uso', type: 'select', options: ['Día', 'Noche', 'Día/Noche'] }
  ],

  // Sustratos y camas
  'pets-reptiles-substrate': [
    { id: 'reptile_type', name: 'Para reptil', type: 'select', options: ['Gecko', 'Iguana', 'Serpiente', 'Tortuga', 'Dragón barbudo', 'Todos los reptiles'] },
    { id: 'substrate_type', name: 'Tipo de sustrato', type: 'select', options: ['Arena', 'Corteza', 'Musgo', 'Papel', 'Fibra de coco', 'Tierra', 'Gravilla'] },
    { id: 'habitat_type', name: 'Tipo de hábitat', type: 'select', options: ['Desértico', 'Tropical', 'Templado', 'Acuático'] },
    { id: 'humidity', name: 'Retención de humedad', type: 'select', options: ['Baja', 'Media', 'Alta'] },
    { id: 'natural', name: 'Natural', type: 'select', options: ['Sí', 'No'] },
    { id: 'package_size', name: 'Tamaño del empaque', type: 'select', options: ['Pequeño (menos de 5L)', 'Mediano (5-15L)', 'Grande (15-30L)', 'Extra grande (más de 30L)'] }
  ]
} 