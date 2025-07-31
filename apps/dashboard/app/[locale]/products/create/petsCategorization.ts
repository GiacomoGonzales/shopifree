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

// Categorías completas de mascotas con navegación anidada
export const PETS_CATEGORY_OPTIONS: CategoryNode[] = [
  {
    id: 'pets-main-category',
    name: 'Productos para mascotas y animales',
    isLeaf: true, // Categoría principal también seleccionable
    children: [
      {
        id: 'pets-live-animals',
        name: 'Animales vivos',
        isLeaf: true,
        children: []
      },
      {
        id: 'pets-products',
        name: 'Productos para mascotas',
        isLeaf: true, // También puede ser seleccionado directamente
        children: [
          { id: 'pets-products-accesorios-cama', name: 'Accesorios de cama para mascotas', isLeaf: true },
          { id: 'pets-products-accesorios-exterior', name: 'Accesorios de exterior para mascotas', isLeaf: true },
          { id: 'pets-products-accesorios-mantas', name: 'Accesorios de mantas eléctricas para mascotas', isLeaf: true },
          { id: 'pets-products-accesorios-transportines', name: 'Accesorios para transportines y jaulas', isLeaf: true },
          { id: 'pets-products-alfombrillas', name: 'Alfombrillas para comederos', isLeaf: true },
          { id: 'pets-products-almohadillas', name: 'Almohadillas calefactoras para mascotas', isLeaf: true },
          { 
            id: 'pets-products-arneses-collares', 
            name: 'Arneses y collares para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-collares-seguridad-hebilla', name: 'Collares de seguridad y con hebilla de separación', isLeaf: true },
              { id: 'pets-products-chalecos', name: 'Chalecos', isLeaf: true },
              { id: 'pets-products-collares-antipulgas', name: 'Collares antipulgas', isLeaf: true },
              { id: 'pets-products-collares-gps', name: 'Collares GPS', isLeaf: true },
              { id: 'pets-products-arneses-especificos', name: 'Arneses', isLeaf: true },
              { id: 'pets-products-collares-led', name: 'Collares LED', isLeaf: true },
              { id: 'pets-products-collares-martingale', name: 'Collares martingale', isLeaf: true },
              { id: 'pets-products-collares-identificacion-personalizados', name: 'Collares de identificación personalizados', isLeaf: true },
              { id: 'pets-products-collares-estandar', name: 'Collares estándar', isLeaf: true },
              { id: 'pets-products-collares-entrenamiento', name: 'Collares de entrenamiento, estrangulamiento y dientes', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-barreras-vehiculos', 
            name: 'Barreras para mascotas para vehículos', 
            isLeaf: true,
            children: [
              { id: 'pets-products-barreras-asiento-trasero', name: 'Barreras del asiento trasero', isLeaf: true },
              { id: 'pets-products-barreras-maletero', name: 'Barreras del maletero', isLeaf: true },
              { id: 'pets-products-barreras-puerta', name: 'Barreras de puerta', isLeaf: true },
              { id: 'pets-products-barreras-ventana', name: 'Barreras de ventana', isLeaf: true },
              { id: 'pets-products-particiones', name: 'Particiones', isLeaf: true }
            ]
          },
          { id: 'pets-products-bases-platos', name: 'Bases de platos para mascotas', isLeaf: true },
          { id: 'pets-products-bolsas-basura', name: 'Bolsas de basura para mascotas', isLeaf: true },
          { id: 'pets-products-bozales', name: 'Bozales para mascotas', isLeaf: true },
          { 
            id: 'pets-products-camas', 
            name: 'Camas para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-camas-almohada', name: 'Camas con almohada', isLeaf: true },
              { id: 'pets-products-camas-enfriamiento', name: 'Camas de enfriamiento', isLeaf: true },
              { id: 'pets-products-camas-espuma', name: 'Camas de espuma', isLeaf: true },
              { id: 'pets-products-camas-ortopedicas', name: 'Camas ortopédicas', isLeaf: true },
              { id: 'pets-products-camas-radiador', name: 'Camas radiador', isLeaf: true },
              { id: 'pets-products-cestas', name: 'Cestas', isLeaf: true },
              { id: 'pets-products-cuevas', name: 'Cuevas', isLeaf: true },
              { id: 'pets-products-cunas', name: 'Cunas para mascotas', isLeaf: true },
              { id: 'pets-products-donuts', name: 'Donuts', isLeaf: true },
              { id: 'pets-products-hamacas', name: 'Hamacas', isLeaf: true },
              { id: 'pets-products-nidos', name: 'Nidos', isLeaf: true },
              { id: 'pets-products-sillas', name: 'Sillas para mascotas', isLeaf: true },
              { id: 'pets-products-torres', name: 'Torres', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-cascabeles-colgantes', 
            name: 'Cascabeles y colgantes para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-cascabeles-cuello', name: 'Cascabeles para el cuello', isLeaf: true },
              { id: 'pets-products-dijes-cuello', name: 'Dijes para el cuello', isLeaf: true },
              { id: 'pets-products-dijes-etiquetas', name: 'Dijes con etiquetas de identificación', isLeaf: true }
            ]
          },
          { id: 'pets-products-cintas-vendajes', name: 'Cintas y vendajes para mascotas', isLeaf: true },
          { 
            id: 'pets-products-cochecitos', 
            name: 'Cochecitos para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-cochecitos-dos-pisos', name: 'Cochecitos de dos pisos', isLeaf: true },
              { id: 'pets-products-cochecitos-estandar', name: 'Cochecitos estándar', isLeaf: true },
              { id: 'pets-products-cochecitos-multiples', name: 'Cochecitos múltiples', isLeaf: true },
              { id: 'pets-products-cochecitos-correr', name: 'Cochecitos para correr', isLeaf: true },
              { id: 'pets-products-cochecitos-transporte-desmontable', name: 'Cochecitos para mascotas con transporte desmontable', isLeaf: true }
            ]
          },
          { id: 'pets-products-collares-isabelinos', name: 'Collares isabelinos para mascotas', isLeaf: true },
          { 
            id: 'pets-products-contenedores-bolsas', 
            name: 'Contenedores y dispensadores de bolsas de excrementos', 
            isLeaf: true,
            children: [
              { id: 'pets-products-dispensadores-almacenamiento', name: 'Dispensadores con almacenamiento', isLeaf: true },
              { id: 'pets-products-dispensadores-linterna', name: 'Dispensadores con linterna', isLeaf: true },
              { id: 'pets-products-dispensadores-estandar', name: 'Dispensadores y contenedores estándar', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-contenedores-comida', 
            name: 'Contenedores de comida para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-cubiertas-latas', name: 'Cubiertas para latas', isLeaf: true },
              { id: 'pets-products-contenedores-almacenamiento', name: 'Contenedores de almacenamiento de alimentos', isLeaf: true },
              { id: 'pets-products-fiambreras', name: 'Fiambreras', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-control-pulgas', 
            name: 'Control de pulgas y garrapatas en mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-collares-pulgas', name: 'Collares contra pulgas y garrapatas', isLeaf: true },
              { id: 'pets-products-nebulizadores-pulgas', name: 'Nebulizadores contra pulgas y garrapatas', isLeaf: true },
              { id: 'pets-products-champus-pulgas', name: 'Champús contra pulgas y garrapatas', isLeaf: true },
              { id: 'pets-products-aerosoles-pulgas', name: 'Aerosoles contra pulgas y garrapatas', isLeaf: true },
              { id: 'pets-products-peines-pulgas', name: 'Peines para pulgas', isLeaf: true },
              { id: 'pets-products-medicacion-oral', name: 'Medicación oral', isLeaf: true },
              { id: 'pets-products-tratamientos-localizados', name: 'Tratamientos localizados', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-correas', 
            name: 'Correas para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-correas-dobles', name: 'Correas dobles para mascotas', isLeaf: true },
              { id: 'pets-products-correas-manos-libres', name: 'Correas manos libres', isLeaf: true },
              { id: 'pets-products-correas-antitirones', name: 'Correas antitirones', isLeaf: true },
              { id: 'pets-products-cables-deslizantes', name: 'Cables deslizantes', isLeaf: true },
              { id: 'pets-products-correas-estandar', name: 'Correas estándar', isLeaf: true },
              { id: 'pets-products-correas-entrenamiento', name: 'Correas de entrenamiento', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-cuencos-comederos', 
            name: 'Cuencos, comederos, y bebederos para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-alimentadores-automaticos', name: 'Alimentadores automáticos', isLeaf: true },
              { id: 'pets-products-tazones', name: 'Tazones', isLeaf: true },
              { id: 'pets-products-cuencos-elevados', name: 'Cuencos elevados', isLeaf: true },
              { id: 'pets-products-alimentadores-gravedad', name: 'Alimentadores por gravedad', isLeaf: true },
              { id: 'pets-products-cuencos-alimentacion-lenta', name: 'Cuencos de alimentación lenta', isLeaf: true },
              { id: 'pets-products-cuencos-viaje', name: 'Cuencos de viaje', isLeaf: true },
              { id: 'pets-products-dispensadores-agua', name: 'Dispensadores de agua', isLeaf: true },
              { id: 'pets-products-fuentes-agua', name: 'Fuentes de agua', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-cuidado-dental', 
            name: 'Cuidado dental para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-aditivos-agua-dental', name: 'Aditivos para el agua para el cuidado dental', isLeaf: true },
              { id: 'pets-products-aerosoles-dental', name: 'Aerosoles para el cuidado dental', isLeaf: true },
              { id: 'pets-products-cepillos-dientes', name: 'Cepillos de dientes', isLeaf: true },
              { id: 'pets-products-enjuagues-bucales', name: 'Enjuagues bucales', isLeaf: true },
              { id: 'pets-products-geles-dental', name: 'Geles para el cuidado dental', isLeaf: true },
              { id: 'pets-products-masticables-dientes', name: 'Masticables para limpiar los dientes', isLeaf: true },
              { id: 'pets-products-pasta-dientes', name: 'Pasta de dientes', isLeaf: true },
              { id: 'pets-products-toallitas-dental', name: 'Toallitas para el cuidado dental', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-dispositivos-biometricos', 
            name: 'Dispositivos biométricos para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-medidores-glucosa', name: 'Medidores de glucosa para mascotas', isLeaf: true },
              { id: 'pets-products-podometros', name: 'Podómetros para mascotas', isLeaf: true },
              { id: 'pets-products-termometros', name: 'Termómetros para mascotas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-equipos-ejercicio', 
            name: 'Equipos para el ejercicio de mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-anillos-saltos', name: 'Anillos para saltos', isLeaf: true },
              { id: 'pets-products-balancines', name: 'Balancines', isLeaf: true },
              { id: 'pets-products-barras-salto', name: 'Barras de salto', isLeaf: true },
              { id: 'pets-products-cajas-pausa', name: 'Cajas de pausa', isLeaf: true },
              { id: 'pets-products-empalizadas', name: 'Empalizadas', isLeaf: true },
              { id: 'pets-products-paseos-rampas', name: 'Paseos para perros y rampas', isLeaf: true },
              { id: 'pets-products-postes', name: 'Postes', isLeaf: true },
              { id: 'pets-products-tuneles-agilidad', name: 'Túneles de agilidad', isLeaf: true }
            ]
          },
          { id: 'pets-products-escalones-rampas', name: 'Escalones y rampas para mascotas', isLeaf: true },
          { id: 'pets-products-extensiones-correas', name: 'Extensiones para correas de mascotas', isLeaf: true },
          { 
            id: 'pets-products-herramientas-desecho', 
            name: 'Herramientas y sistemas de desecho de excrementos', 
            isLeaf: true,
            children: [
              { id: 'pets-products-bandejas-arena', name: 'Bandejas de arena', isLeaf: true },
              { id: 'pets-products-bolsas-perros', name: 'Bolsas para perros', isLeaf: true },
              { id: 'pets-products-recogedores-basura', name: 'Recogedores de basura', isLeaf: true },
              { id: 'pets-products-sistemas-eliminacion-desechos', name: 'Sistemas de eliminación de desechos de mascotas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-higiene', 
            name: 'Productos de higiene para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-peines-cepillos', name: 'Peines y cepillos para mascotas', isLeaf: true },
              { id: 'pets-products-esprais-desodorantes', name: 'Espráis desodorantes y colonias para mascotas', isLeaf: true },
              { id: 'pets-products-cortapelos', name: 'Cortapelos para mascotas', isLeaf: true },
              { id: 'pets-products-secadores', name: 'Secadores de pelo para mascotas', isLeaf: true },
              { id: 'pets-products-esmalte-unas', name: 'Esmalte de uñas para mascotas', isLeaf: true },
              { id: 'pets-products-herramientas-manicura', name: 'Herramientas de manicura para mascotas', isLeaf: true },
              { id: 'pets-products-champus-acondicionadores', name: 'Champús y acondicionadores para mascotas', isLeaf: true },
              { id: 'pets-products-toallitas', name: 'Toallitas para mascotas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-kits-adiestramiento', 
            name: 'Kits de adiestramiento para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-dispensadores-premios', name: 'Dispensadores de premios y contadores para adiestrar mascotas', isLeaf: true },
              { id: 'pets-products-empapadores-mascotas', name: 'Empapadores para mascotas', isLeaf: true },
              { id: 'pets-products-protectores-empapadores', name: 'Protectores de empapadores para mascotas', isLeaf: true },
              { id: 'pets-products-soluciones-esprais-adiestramiento', name: 'Soluciones y esprais de adiestramiento para mascotas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-kits-emergencias', 
            name: 'Kits de primeros auxilios y emergencias para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-botiquines-generales', name: 'Botiquines generales de primeros auxilios', isLeaf: true },
              { id: 'pets-products-kits-accidentes', name: 'Kits para accidentes', isLeaf: true },
              { id: 'pets-products-botiquines-viajes', name: 'Botiquines de primeros auxilios para viajes', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-lubricantes-gotas', 
            name: 'Lubricantes y gotas oftálmicas para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-tratamientos-conjuntivitis', name: 'Tratamientos de conjuntivitis', isLeaf: true },
              { id: 'pets-products-limpiadores-ojos', name: 'Limpiadores de ojos', isLeaf: true },
              { id: 'pets-products-soluciones-irrigacion-ocular', name: 'Soluciones de irrigación ocular', isLeaf: true },
              { id: 'pets-products-lubricantes-ojos', name: 'Lubricantes para ojos', isLeaf: true },
              { id: 'pets-products-colirios', name: 'Colirios', isLeaf: true },
              { id: 'pets-products-quitamanchas-lagrimas', name: 'Quitamanchas para lágrimas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-medicamentos', 
            name: 'Medicamentos para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-alivio-alergias', name: 'Alivio de alergias', isLeaf: true },
              { id: 'pets-products-antibioticos', name: 'Antibióticos', isLeaf: true },
              { id: 'pets-products-antiparasitarios', name: 'Antiparasitarios', isLeaf: true },
              { id: 'pets-products-alivio-ansiedad', name: 'Alivio de la ansiedad', isLeaf: true },
              { id: 'pets-products-ayudas-digestion', name: 'Ayudas para la digestión', isLeaf: true },
              { id: 'pets-products-medicina-oidos-ojos', name: 'Medicina para oídos y ojos', isLeaf: true },
              { id: 'pets-products-analgesicos', name: 'Analgésicos', isLeaf: true }
            ]
          },
          { id: 'pets-products-palas-comida', name: 'Palas de comida para mascotas', isLeaf: true },
          { id: 'pets-products-perchas-ropa', name: 'Perchas para ropa de mascotas', isLeaf: true },
          { 
            id: 'pets-products-placas-identificativas', 
            name: 'Placas identificativas para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-placas-qr', name: 'Placas con códigos QR digitales', isLeaf: true },
              { id: 'pets-products-placas-bordadas', name: 'Placas bordadas', isLeaf: true },
              { id: 'pets-products-etiquetas-alerta-medica', name: 'Etiquetas de alerta médica', isLeaf: true },
              { id: 'pets-products-etiquetas-cuello-deslizables', name: 'Etiquetas de cuello deslizables', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-productos-animales-pequenos', 
            name: 'Productos para animales pequeños', 
            isLeaf: true,
            children: [
              { id: 'pets-products-accesorios-habitaculos-pequenos', name: 'Accesorios para habitáculos para animales pequeños', isLeaf: true },
              { id: 'pets-products-alimento-animales-pequenos', name: 'Alimento para animales pequeños', isLeaf: true },
              { id: 'pets-products-articulos-camas-pequenos', name: 'Artículos para camas de animales pequeños', isLeaf: true },
              { id: 'pets-products-golosinas-animales-pequenos', name: 'Golosinas para animales pequeños', isLeaf: true },
              { id: 'pets-products-jaulas-habitaculos-pequenos', name: 'Jaulas y habitáculos para animales pequeños', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-productos-gatos', 
            name: 'Productos para gatos', 
            isLeaf: true,
            children: [
              { 
                id: 'pets-products-comida-gatos', 
                name: 'Comida para gatos', 
                isLeaf: true,
                children: [
                  { id: 'pets-products-comida-gatos-sin-prescripcion', name: 'Comida para gatos sin prescripción médica', isLeaf: true },
                  { id: 'pets-products-comida-gatos-con-prescripcion', name: 'Comida para gatos con prescripción médica', isLeaf: true }
                ]
              },
              { 
                id: 'pets-products-mobiliario-gatos', 
                name: 'Mobiliario para gatos', 
                isLeaf: true,
                children: [
                  { id: 'pets-products-torres-casas-gatos', name: 'Torres y casas para gatos', isLeaf: true },
                  { id: 'pets-products-posaderos-estantes-gatos', name: 'Posaderos y estantes para gatos', isLeaf: true },
                  { id: 'pets-products-rascadores-postes-gatos', name: 'Rascadores y postes rascadores para gatos', isLeaf: true },
                  { id: 'pets-products-escalones-rampas-gatos', name: 'Escalones y rampas para gatos', isLeaf: true },
                  { id: 'pets-products-arboles-torres-gatos', name: 'Árboles y torres para gatos', isLeaf: true },
                  { id: 'pets-products-camas-posaderos-ventanas-gatos', name: 'Camas y posaderos para ventanas para gatos', isLeaf: true },
                  { id: 'pets-products-casas-gatos-aire-libre', name: 'Casas para gatos al aire libre', isLeaf: true }
                ]
              },
              { id: 'pets-products-accesorios-muebles-gatos', name: 'Accesorios de muebles para gatos', isLeaf: true },
              { 
                id: 'pets-products-arena-higienica-gatos', 
                name: 'Arena higiénica para gatos', 
                isLeaf: true,
                children: [
                  { id: 'pets-products-forros-cajones-gatos', name: 'Forros para cajones de gatos', isLeaf: true },
                  { id: 'pets-products-alfombrillas-cajones-gatos', name: 'Alfombrillas para cajones de gatos', isLeaf: true },
                  { id: 'pets-products-cajones-arena-gatos', name: 'Cajones de arena higiénica para gatos', isLeaf: true }
                ]
              },
              { 
                id: 'pets-products-juguetes-gatos', 
                name: 'Juguetes para gatos', 
                isLeaf: true,
                children: [
                  { id: 'pets-products-pelotas-juegos-caza-gatos', name: 'Pelotas y juegos de caza', isLeaf: true },
                  { id: 'pets-products-peluches-relleno-gatos', name: 'Peluches y juguetes con relleno', isLeaf: true },
                  { id: 'pets-products-tuneles-gatos', name: 'Túneles', isLeaf: true },
                  { id: 'pets-products-varitas-gatos', name: 'Varitas', isLeaf: true },
                  { id: 'pets-products-juguetes-hierba-gatera', name: 'Juguetes con hierba gatera', isLeaf: true },
                  { id: 'pets-products-juguetes-masticar-gatos', name: 'Juguetes para masticar', isLeaf: true },
                  { id: 'pets-products-plumas-canas-gatos', name: 'Plumas y cañas', isLeaf: true },
                  { id: 'pets-products-juguetes-interactivos-gatos', name: 'Juguetes interactivos', isLeaf: true },
                  { id: 'pets-products-juguetes-laser-gatos', name: 'Juguetes láser', isLeaf: true },
                  { id: 'pets-products-dispensadores-golosinas-rompecabezas-gatos', name: 'Juguetes dispensadores de golosinas y rompecabezas', isLeaf: true },
                  { id: 'pets-products-juguetes-chillones-gatos', name: 'Juguetes chillones', isLeaf: true }
                ]
              },
              { id: 'pets-products-premios-gatos', name: 'Premios para gatos', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-productos-pajaros', 
            name: 'Productos para pájaros', 
            isLeaf: true,
            children: [
              { id: 'pets-products-pajaros-accesorios-jaulas', name: 'Accesorios de jaulas para pájaros', isLeaf: true },
              { id: 'pets-products-pajaros-pies-jaulas', name: 'Pies y jaulas para pájaros', isLeaf: true },
              { id: 'pets-products-pajaros-comida', name: 'Comida para pájaros', isLeaf: true },
              { id: 'pets-products-pajaros-zonas-juegos', name: 'Zonas de juegos y gimnasios para pájaros', isLeaf: true },
              { id: 'pets-products-pajaros-escaleras-juguetes', name: 'Escaleras y juguetes colgantes para pájaros', isLeaf: true },
              { id: 'pets-products-pajaros-juguetes', name: 'Juguetes para pájaros', isLeaf: true },
              { id: 'pets-products-pajaros-premios', name: 'Premios para pájaros', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-productos-perros', 
            name: 'Productos para perros', 
            isLeaf: true,
            children: [
              { id: 'pets-products-fundas-panal-cambiadores', name: 'Fundas de pañal y cambiadores para perros', isLeaf: true },
              { id: 'pets-products-panales-perros', name: 'Pañales para perros', isLeaf: true },
              { 
                id: 'pets-products-comida-perros', 
                name: 'Comida para perros', 
                isLeaf: true,
                children: [
                  { id: 'pets-products-comida-perros-sin-prescripcion', name: 'Comida para perros sin prescripción médica', isLeaf: true },
                  { id: 'pets-products-comida-perros-con-prescripcion', name: 'Comida para perros con prescripción médica', isLeaf: true }
                ]
              },
              { id: 'pets-products-casetas-perros', name: 'Casetas para perros', isLeaf: true },
              { id: 'pets-products-accesorios-casetas-cercados', name: 'Accesorios para casetas y cercados para perros', isLeaf: true },
              { 
                id: 'pets-products-casetas-cercados', 
                name: 'Casetas y cercados para perros', 
                isLeaf: true,
                children: [
                  { id: 'pets-products-corrales-perros', name: 'Corrales para perros', isLeaf: true },
                  { id: 'pets-products-cercados-perros', name: 'Cercados para perros', isLeaf: true },
                  { id: 'pets-products-casetas-interior', name: 'Casetas para perros de interior', isLeaf: true },
                  { id: 'pets-products-casetas-aire-libre', name: 'Casetas para perros al aire libre', isLeaf: true },
                  { id: 'pets-products-casetas-portatiles', name: 'Casetas para perros portátiles', isLeaf: true }
                ]
              },
              { id: 'pets-products-juguetes-perros', name: 'Juguetes para perros', isLeaf: true },
              { id: 'pets-products-cintas-caminar', name: 'Cintas de caminar para perros', isLeaf: true },
              { id: 'pets-products-premios-perros', name: 'Premios para perros', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-productos-reptiles', 
            name: 'Productos para reptiles y anfibios', 
            isLeaf: true,
            children: [
              { id: 'pets-products-accesorios-terrarios', name: 'Accesorios para terrarios de reptiles y anfibios', isLeaf: true },
              { id: 'pets-products-alimento-reptiles', name: 'Alimento para reptiles y anfibios', isLeaf: true },
              { id: 'pets-products-iluminacion-calefaccion', name: 'Iluminación y calefacción de terrarios para reptiles y anfibios', isLeaf: true },
              { id: 'pets-products-sustratos-reptiles', name: 'Sustratos para reptiles y anfibios', isLeaf: true },
              { id: 'pets-products-terrarios', name: 'Terrarios para reptiles y anfibios', isLeaf: true }
            ]
          },
          { id: 'pets-products-protector-solar', name: 'Protector solar para mascotas', isLeaf: true },
          { 
            id: 'pets-products-puertas-animales', 
            name: 'Puertas para animales domésticos', 
            isLeaf: true,
            children: [
              { id: 'pets-products-puertas-instalacion-puerta', name: 'Puertas para instalación en puerta', isLeaf: true },
              { id: 'pets-products-puertas-automaticas-electronicas', name: 'Puertas automáticas electrónicas', isLeaf: true },
              { id: 'pets-products-puertas-corredizas-vidrio', name: 'Puertas corredizas de vidrio', isLeaf: true },
              { id: 'pets-products-puertas-montadas-pared', name: 'Puertas montadas en la pared', isLeaf: true },
              { id: 'pets-products-puertas-montadas-ventanas', name: 'Puertas montadas en ventanas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-ropa', 
            name: 'Ropa para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-abrigos', name: 'Abrigos para mascotas', isLeaf: true },
              { id: 'pets-products-bufandas', name: 'Bufandas para mascotas', isLeaf: true },
              { id: 'pets-products-calcetines', name: 'Calcetines para mascotas', isLeaf: true },
              { id: 'pets-products-camisas', name: 'Camisas para mascotas', isLeaf: true },
              { id: 'pets-products-chalecos-seguridad', name: 'Chalecos de seguridad para mascotas', isLeaf: true },
              { id: 'pets-products-chaquetas', name: 'Chaquetas para mascotas', isLeaf: true },
              { id: 'pets-products-collares-lazos', name: 'Collares y lazos para mascotas', isLeaf: true },
              { id: 'pets-products-disfraces', name: 'Disfraces para mascotas', isLeaf: true },
              { id: 'pets-products-gafas-sol', name: 'Gafas de sol para mascotas', isLeaf: true },
              { id: 'pets-products-impermeables', name: 'Impermeables para mascotas', isLeaf: true },
              { id: 'pets-products-jerseis', name: 'Jerséis para mascotas', isLeaf: true },
              { id: 'pets-products-lazos-cintas', name: 'Lazos y cintas para mascotas', isLeaf: true },
              { id: 'pets-products-panuelos', name: 'Pañuelos para mascotas', isLeaf: true },
              { id: 'pets-products-sombreros', name: 'Sombreros para mascotas', isLeaf: true },
              { id: 'pets-products-sudaderas-capucha', name: 'Sudaderas con capucha para mascotas', isLeaf: true },
              { id: 'pets-products-vestidos', name: 'Vestidos para mascotas', isLeaf: true },
              { id: 'pets-products-zapatos', name: 'Zapatos para mascotas', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-sistemas-contencion', 
            name: 'Sistemas de contención para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-cercas-invisibles-electronicas', name: 'Cercas invisibles electrónicas', isLeaf: true },
              { id: 'pets-products-cercados-jaulas', name: 'Cercados y jaulas', isLeaf: true },
              { id: 'pets-products-jaulas-ejercicio', name: 'Jaulas de ejercicio', isLeaf: true },
              { id: 'pets-products-cercas-puertas', name: 'Cercas y puertas', isLeaf: true },
              { id: 'pets-products-perreras', name: 'Perreras', isLeaf: true },
              { id: 'pets-products-parques-juego', name: 'Parques de juego', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-suministros-acuarios', 
            name: 'Suministros para peces y acuarios', 
            isLeaf: true,
            children: [
              { id: 'pets-products-acuarios', name: 'Acuarios', isLeaf: true },
              { id: 'pets-products-alimento-peces', name: 'Alimento para peces', isLeaf: true },
              { id: 'pets-products-bases-acuarios', name: 'Bases para acuarios', isLeaf: true },
              { id: 'pets-products-comederos-peces', name: 'Comederos para peces', isLeaf: true },
              { id: 'pets-products-controladores-temperatura', name: 'Controladores de temperatura de acuarios', isLeaf: true },
              { id: 'pets-products-decoraciones-acuarios', name: 'Decoraciones para acuarios', isLeaf: true },
              { id: 'pets-products-difusores-bombas-aire', name: 'Difusores y bombas de aire para acuarios', isLeaf: true },
              { id: 'pets-products-fertilizantes-plantas', name: 'Fertilizantes para plantas acuáticas', isLeaf: true },
              { id: 'pets-products-filtros-acuarios', name: 'Filtros para acuarios', isLeaf: true },
              { id: 'pets-products-iluminacion-acuarios', name: 'Iluminación para acuarios', isLeaf: true },
              { id: 'pets-products-limpieza-acuarios', name: 'Productos de limpieza de acuarios', isLeaf: true },
              { id: 'pets-products-rebosaderos-acuarios', name: 'Rebosaderos para acuarios', isLeaf: true },
              { id: 'pets-products-redes-acuarios', name: 'Redes para acuarios', isLeaf: true },
              { id: 'pets-products-sustratos-arena', name: 'Sustratos y arena para acuarios', isLeaf: true },
              { id: 'pets-products-tratamientos-agua', name: 'Tratamientos del agua de acuarios', isLeaf: true },
              { id: 'pets-products-tuberias-acuarios', name: 'Tuberías para acuarios y estanques', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-suplementos-vitaminas', 
            name: 'Suplementos y vitaminas para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-aceite-pescado', name: 'Aceite de pescado', isLeaf: true },
              { id: 'pets-products-ayudas-sistema-inmune', name: 'Ayudas para el sistema inmune', isLeaf: true },
              { id: 'pets-products-calcio', name: 'Calcio', isLeaf: true },
              { id: 'pets-products-control-peso', name: 'Control de peso', isLeaf: true },
              { id: 'pets-products-multivitaminas', name: 'Multivitaminas', isLeaf: true },
              { id: 'pets-products-piel-pelaje', name: 'Piel y pelaje', isLeaf: true },
              { id: 'pets-products-probioticos', name: 'Probióticos', isLeaf: true },
              { id: 'pets-products-salud-articulaciones', name: 'Salud de las articulaciones', isLeaf: true },
              { id: 'pets-products-salud-dental', name: 'Salud dental', isLeaf: true },
              { id: 'pets-products-suplementos-cbd', name: 'Suplementos de CBD', isLeaf: true }
            ]
          },
          { 
            id: 'pets-products-transportines-cajas', 
            name: 'Transportines y cajas para mascotas', 
            isLeaf: true,
            children: [
              { id: 'pets-products-transportines-aereos', name: 'Transportines aprobados para viajes aéreos', isLeaf: true },
              { id: 'pets-products-transportines-laterales-acolchados', name: 'Transportines con laterales acolchados', isLeaf: true },
              { id: 'pets-products-jaulas-laterales-acolchados', name: 'Jaulas con laterales acolchados', isLeaf: true },
              { id: 'pets-products-transportines-ruedas', name: 'Transportines con ruedas', isLeaf: true },
              { id: 'pets-products-transportines-mochila', name: 'Transportines de mochila', isLeaf: true },
              { id: 'pets-products-jaulas-coches', name: 'Jaulas para coches', isLeaf: true },
              { id: 'pets-products-jaulas-estilo-mueble', name: 'Jaulas estilo mueble', isLeaf: true },
              { id: 'pets-products-transportines-rigidos', name: 'Transportines rígidos', isLeaf: true },
              { id: 'pets-products-transportines-pueden-rodar', name: 'Transportines que pueden rodar', isLeaf: true },
              { id: 'pets-products-canguros-transportines-portatiles', name: 'Canguros y transportines portátiles', isLeaf: true }
            ]
          }
        ]
      }
    ]
  }
]

// Metacampos por categoría
export const PETS_META_FIELDS_BY_CATEGORY: Record<string, MetaField[]> = {
  // Productos para mascotas y animales (categoría principal)
  'pets-main-category': [
    { id: 'pet_type', name: 'Tipo de mascota', type: 'select', options: ['Perro', 'Gato', 'Ave', 'Pez', 'Reptil', 'Conejo', 'Hámster', 'Todas las mascotas'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Cachorro/Cría', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Royal Canin', 'Hills', 'Purina', 'Pedigree', 'Whiskas', 'Eukanuba', 'Acana', 'Orijen'] }
  ],

  // Animales vivos
  'pets-live-animals': [
    { id: 'animal_type', name: 'Tipo de animal', type: 'select', options: ['Perro', 'Gato', 'Ave', 'Pez', 'Reptil', 'Anfibio', 'Roedor', 'Conejo'] },
    { id: 'age', name: 'Edad', type: 'select', options: ['Cachorro/Cría', 'Joven', 'Adulto', 'Senior'] },
    { id: 'gender', name: 'Sexo', type: 'select', options: ['Macho', 'Hembra', 'No especificado'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Muy pequeño', 'Pequeño', 'Mediano', 'Grande', 'Muy grande'] },
    { id: 'breed', name: 'Raza/Especie', type: 'text' },
    { id: 'health_status', name: 'Estado de salud', type: 'select', options: ['Excelente', 'Bueno', 'Regular', 'Requiere cuidados especiales'] }
  ],

  // Productos para mascotas (categoría general)
  'pets-products': [
    { id: 'pet_type', name: 'Tipo de mascota', type: 'tags', options: ['Perro', 'Gato', 'Ave', 'Pez', 'Reptil', 'Conejo', 'Hámster', 'Universal'] },
    { id: 'pet_size', name: 'Tamaño de mascota', type: 'select', options: ['Toy/Mini', 'Pequeño', 'Mediano', 'Grande', 'Gigante', 'Todas las tallas'] },
    { id: 'age_group', name: 'Grupo de edad', type: 'select', options: ['Cachorro/Cría', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Royal Canin', 'Hills', 'Purina', 'Kong', 'Flexi', 'Ferplast', 'Trixie'] }
  ],

  // Accesorios de cama para mascotas
  'pets-products-accesorios-cama': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Almohadas', 'Fundas', 'Mantas', 'Colchones', 'Elevadores', 'Calentadores'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Algodón', 'Poliéster', 'Memory foam', 'Lana', 'Sintético', 'Ortopédico'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['S (40x30cm)', 'M (60x45cm)', 'L (80x60cm)', 'XL (100x70cm)', 'XXL (120x80cm)'] },
    { id: 'washable', name: 'Lavable', type: 'select', options: ['Sí', 'No', 'Solo lavado a mano', 'Lavable en máquina'] },
    { id: 'pet_type', name: 'Tipo de mascota', type: 'tags', options: ['Perro', 'Gato', 'Universal'] }
  ],

  // Accesorios de exterior para mascotas
  'pets-products-accesorios-exterior': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Refugios', 'Casetas', 'Cercas', 'Bebederos exteriores', 'Juguetes outdoor', 'Protección solar'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Plástico', 'Metal', 'Tela impermeable', 'PVC', 'Acero inoxidable'] },
    { id: 'weather_resistant', name: 'Resistente al clima', type: 'select', options: ['Sí', 'No', 'Parcialmente'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'installation', name: 'Instalación', type: 'select', options: ['Fácil montaje', 'Requiere herramientas', 'Instalación profesional', 'Portátil'] }
  ],

  // Accesorios de mantas eléctricas para mascotas
  'pets-products-accesorios-mantas': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Fundas', 'Controladores', 'Repuestos', 'Adaptadores', 'Temporizadores'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'tags', options: ['Universal', 'Marca específica', 'Modelo específico'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Algodón', 'Poliéster', 'Polar', 'Microfibra'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Auto-apagado', 'Control de temperatura', 'Resistente a mordidas', 'Impermeable'] }
  ],

  // Accesorios para transportines y jaulas
  'pets-products-accesorios-transportines': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Ruedas', 'Correas', 'Comederos', 'Bebederos', 'Almohadas', 'Fundas', 'Cerraduras'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'select', options: ['Universal', 'Transportines específicos', 'Jaulas específicas'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Plástico', 'Metal', 'Tela', 'Acero inoxidable', 'Goma'] },
    { id: 'installation', name: 'Instalación', type: 'select', options: ['Clip', 'Tornillos', 'Velcro', 'Magnético', 'Encaje'] }
  ],

  // Alfombrillas para comederos
  'pets-products-alfombrillas': [
    { id: 'material', name: 'Material', type: 'select', options: ['Silicona', 'Goma', 'PVC', 'Tela', 'Bambú', 'Plástico'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeña (30x20cm)', 'Mediana (40x30cm)', 'Grande (50x35cm)', 'Extra grande (60x40cm)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antideslizante', 'Impermeable', 'Fácil limpieza', 'Elevada', 'Plegable'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Lisa', 'Con bordes', 'Con dibujos', 'Transparente', 'Colores'] },
    { id: 'dishwasher_safe', name: 'Apto lavavajillas', type: 'select', options: ['Sí', 'No'] }
  ],

  // Almohadillas calefactoras para mascotas
  'pets-products-almohadillas': [
    { id: 'power_type', name: 'Tipo de energía', type: 'select', options: ['Eléctrica', 'Autorrecargable', 'Microondas', 'Gel térmico'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['S (30x20cm)', 'M (40x30cm)', 'L (50x35cm)', 'XL (60x40cm)'] },
    { id: 'temperature_control', name: 'Control de temperatura', type: 'select', options: ['Fijo', 'Ajustable', 'Termostato', 'Multi-nivel'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Auto-apagado', 'Sobrecalentamiento', 'Resistente a mordidas', 'Cable reforzado'] },
    { id: 'cover_material', name: 'Material de funda', type: 'select', options: ['Polar', 'Algodón', 'Microfibra', 'Impermeable'] }
  ],

  // Arneses y collares para mascotas
  'pets-products-arneses-collares': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Collar', 'Arnés', 'Conjunto collar+arnés'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Cuero', 'Tela', 'Biothane', 'Metal', 'Silicona'] },
    { id: 'size', name: 'Talla', type: 'select', options: ['XS (20-30cm)', 'S (30-40cm)', 'M (40-55cm)', 'L (55-65cm)', 'XL (65-75cm)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Ajustable', 'Reflectivo', 'Acolchado', 'LED', 'GPS', 'Antitirones'] },
    { id: 'closure_type', name: 'Tipo de cierre', type: 'select', options: ['Hebilla', 'Clip', 'Velcro', 'Magnético', 'Automático'] },
    { id: 'pet_type', name: 'Tipo de mascota', type: 'select', options: ['Perro', 'Gato', 'Universal'] }
  ],

  // Barreras para mascotas para vehículos
  'pets-products-barreras-vehiculos': [
    { id: 'barrier_type', name: 'Tipo de barrera', type: 'select', options: ['Red', 'Rejilla metálica', 'Acrílico', 'Tela', 'Divisor rígido'] },
    { id: 'installation', name: 'Instalación', type: 'select', options: ['Sin herramientas', 'Atornillado', 'Presión', 'Ventosas', 'Clips'] },
    { id: 'vehicle_type', name: 'Tipo de vehículo', type: 'tags', options: ['Sedán', 'SUV', 'Hatchback', 'Station wagon', 'Universal'] },
    { id: 'adjustable', name: 'Ajustable', type: 'select', options: ['Sí', 'No', 'Altura', 'Ancho', 'Ambos'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Metal', 'Plástico', 'Tela', 'Acrílico', 'Nylon'] }
  ],

  // Bases de platos para mascotas
  'pets-products-bases-platos': [
    { id: 'material', name: 'Material', type: 'select', options: ['Silicona', 'Bambú', 'Acero inoxidable', 'Plástico', 'Madera', 'Cerámica'] },
    { id: 'bowl_capacity', name: 'Capacidad de platos', type: 'select', options: ['1 plato', '2 platos', '3 platos', '4+ platos'] },
    { id: 'height', name: 'Altura', type: 'select', options: ['Baja (0-5cm)', 'Media (5-15cm)', 'Alta (15-25cm)', 'Ajustable'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Antideslizante', 'Elevada', 'Plegable', 'Inclinada', 'Con almacenamiento'] },
    { id: 'pet_size', name: 'Tamaño recomendado', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Todas las tallas'] }
  ],

  // Bolsas de basura para mascotas
  'pets-products-bolsas-basura': [
    { id: 'bag_type', name: 'Tipo de bolsa', type: 'select', options: ['Biodegradables', 'Plásticas', 'Compostables', 'Perfumadas', 'Extra resistentes'] },
    { id: 'quantity', name: 'Cantidad', type: 'select', options: ['15-30 bolsas', '50-100 bolsas', '100-200 bolsas', '200+ bolsas'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Perfumadas', 'Sin perfume', 'Fácil apertura', 'Asa', 'Cierre hermético'] },
    { id: 'dispensing', name: 'Dispensado', type: 'select', options: ['Rollo', 'Caja dispensadora', 'Paquete individual'] }
  ],

  // Bozales para mascotas
  'pets-products-bozales': [
    { id: 'muzzle_type', name: 'Tipo de bozal', type: 'select', options: ['Canasta', 'Tela', 'Cuero', 'Plástico', 'Silicona'] },
    { id: 'size', name: 'Talla', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { id: 'breed_specific', name: 'Raza específica', type: 'tags', options: ['Hocico corto', 'Hocico largo', 'Universal', 'Bulldog', 'Pastor alemán'] },
    { id: 'breathability', name: 'Transpirabilidad', type: 'select', options: ['Alta', 'Media', 'Baja'] },
    { id: 'drinking_allowed', name: 'Permite beber', type: 'select', options: ['Sí', 'No', 'Limitado'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Nylon', 'Cuero', 'Plástico', 'Silicona', 'Metal'] }
  ],

  // Camas para mascotas
  'pets-products-camas': [
    { id: 'bed_type', name: 'Tipo de cama', type: 'select', options: ['Colchón', 'Cojín', 'Iglú', 'Sofá', 'Ortopédica', 'Elevada'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['XS (40x30cm)', 'S (50x35cm)', 'M (70x50cm)', 'L (90x65cm)', 'XL (110x80cm)'] },
    { id: 'material', name: 'Material de relleno', type: 'select', options: ['Memory foam', 'Espuma', 'Algodón', 'Poliéster', 'Gel', 'Aire'] },
    { id: 'cover_material', name: 'Material de funda', type: 'select', options: ['Algodón', 'Polar', 'Microfibra', 'Cuero sintético', 'Oxford'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Lavable', 'Antideslizante', 'Impermeable', 'Hipoalergénica', 'Ortopédica'] },
    { id: 'pet_type', name: 'Tipo de mascota', type: 'select', options: ['Perro', 'Gato', 'Universal'] }
  ],

  // Productos para pájaros (categoría general)
  'pets-products-productos-pajaros': [
    { id: 'bird_type', name: 'Tipo de ave', type: 'tags', options: ['Canario', 'Periquito', 'Loro', 'Cacatúa', 'Agapornis', 'Todas las aves'] },
    { id: 'bird_size', name: 'Tamaño de ave', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Todas las tallas'] },
    { id: 'age', name: 'Edad', type: 'select', options: ['Polluelo', 'Joven', 'Adulto', 'Todas las edades'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Versele-Laga', 'Zupreem', 'Kaytee', 'Higgins', 'Tropican'] }
  ],

  // Accesorios de jaulas para pájaros
  'pets-products-pajaros-accesorios-jaulas': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Perchas', 'Comederos', 'Bebederos', 'Nidos', 'Escaleras', 'Columpios'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera natural', 'Plástico', 'Metal', 'Cuerda', 'Acrílico', 'Cerámica'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Universal'] },
    { id: 'mounting', name: 'Tipo de montaje', type: 'select', options: ['Clip', 'Tornillo', 'Colgante', 'Apoyo', 'Magnético'] },
    { id: 'bird_size', name: 'Tamaño de ave recomendado', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Todas'] }
  ],

  // Pies y jaulas para pájaros
  'pets-products-pajaros-pies-jaulas': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Jaula completa', 'Pie/Base', 'Soporte', 'Ruedas', 'Gavetas'] },
    { id: 'cage_size', name: 'Tamaño de jaula', type: 'select', options: ['30x30cm', '40x40cm', '60x40cm', '80x50cm', '100x60cm'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Metal pintado', 'Acero inoxidable', 'Madera', 'Plástico', 'Hierro forjado'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Con ruedas', 'Plegable', 'Con gaveta', 'Múltiples puertas', 'Fácil limpieza'] },
    { id: 'bird_type', name: 'Tipo de ave', type: 'tags', options: ['Canarios', 'Periquitos', 'Loros medianos', 'Loros grandes', 'Todas'] }
  ],

  // Comida para pájaros
  'pets-products-pajaros-comida': [
    { id: 'food_type', name: 'Tipo de alimento', type: 'select', options: ['Semillas', 'Pellets', 'Frutas secas', 'Mezcla completa', 'Papilla', 'Néctar'] },
    { id: 'bird_type', name: 'Tipo de ave', type: 'tags', options: ['Canario', 'Periquito', 'Loro', 'Cacatúa', 'Agapornis', 'Universal'] },
    { id: 'age', name: 'Edad', type: 'select', options: ['Polluelo', 'Joven', 'Adulto', 'Reproductores', 'Todas las edades'] },
    { id: 'package_size', name: 'Tamaño del paquete', type: 'select', options: ['500g', '1kg', '2.5kg', '5kg', '10kg'] },
    { id: 'special_diet', name: 'Dieta especial', type: 'tags', options: ['Alto en proteína', 'Vitaminas extra', 'Sin conservantes', 'Orgánico', 'Probióticos'] },
    { id: 'brand', name: 'Marca', type: 'select', options: ['Versele-Laga', 'Zupreem', 'Kaytee', 'Tropican', 'Higgins'] }
  ],

  // Zonas de juegos y gimnasios para pájaros
  'pets-products-pajaros-zonas-juegos': [
    { id: 'playground_type', name: 'Tipo de zona de juego', type: 'select', options: ['Gimnasio de mesa', 'Torre de juegos', 'Parque exterior', 'Área de vuelo', 'Soporte T'] },
    { id: 'material', name: 'Material principal', type: 'select', options: ['Madera natural', 'Bambú', 'Metal', 'Cuerda', 'Acrílico'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeño (30cm)', 'Mediano (50cm)', 'Grande (70cm)', 'Extra grande (100cm+)'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Múltiples niveles', 'Comederos incluidos', 'Juguetes incluidos', 'Plegable', 'Con ruedas'] },
    { id: 'bird_size', name: 'Tamaño de ave', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Todas las tallas'] }
  ],

  // Escaleras y juguetes colgantes para pájaros
  'pets-products-pajaros-escaleras-juguetes': [
    { id: 'toy_type', name: 'Tipo de juguete', type: 'select', options: ['Escalera', 'Columpio', 'Juguete colgante', 'Cuerda', 'Cadena', 'Espiral'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera natural', 'Cuerda de algodón', 'Sisal', 'Cuero', 'Metal', 'Plástico seguro'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['10-15cm', '15-25cm', '25-35cm', '35cm+'] },
    { id: 'mounting', name: 'Montaje', type: 'select', options: ['Clip metálico', 'Gancho', 'Colgante', 'Enroscable'] },
    { id: 'safety', name: 'Características de seguridad', type: 'tags', options: ['No tóxico', 'Sin metales pesados', 'Bordes lisos', 'Colores naturales'] }
  ],

  // Juguetes para pájaros
  'pets-products-pajaros-juguetes': [
    { id: 'toy_category', name: 'Categoría de juguete', type: 'select', options: ['Masticación', 'Forrajeo', 'Ejercicio', 'Inteligencia', 'Musical', 'Destructible'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Madera', 'Papel', 'Cartón', 'Cuerda', 'Cuero', 'Plástico seguro', 'Metal'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Mini (5cm)', 'Pequeño (10cm)', 'Mediano (15cm)', 'Grande (20cm+)'] },
    { id: 'skill_level', name: 'Nivel de dificultad', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'] },
    { id: 'bird_behavior', name: 'Comportamiento objetivo', type: 'tags', options: ['Masticación', 'Forrajeo', 'Ejercicio', 'Estimulación mental', 'Reducir estrés'] }
  ],

  // Premios para pájaros
  'pets-products-pajaros-premios': [
    { id: 'treat_type', name: 'Tipo de premio', type: 'select', options: ['Barritas', 'Galletas', 'Frutas secas', 'Semillas especiales', 'Miel', 'Golosinas'] },
    { id: 'flavor', name: 'Sabor', type: 'tags', options: ['Frutas', 'Miel', 'Semillas', 'Verduras', 'Natural', 'Huevo'] },
    { id: 'function', name: 'Función', type: 'tags', options: ['Entrenamiento', 'Vitaminas', 'Digestión', 'Plumaje', 'Energía', 'Solo premio'] },
    { id: 'bird_type', name: 'Tipo de ave', type: 'tags', options: ['Canario', 'Periquito', 'Loro', 'Cacatúa', 'Todas las aves'] },
    { id: 'package_format', name: 'Formato', type: 'select', options: ['Barrita individual', 'Pack de barritas', 'Bolsa resellable', 'Dispensador'] }
  ],

  // Cascabeles y colgantes para mascotas (categoría general)
  'pets-products-cascabeles-colgantes': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Cascabel', 'Dije decorativo', 'Etiqueta identificación', 'Charm', 'Medallón'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Metal', 'Acero inoxidable', 'Latón', 'Plástico', 'Silicona', 'Aleación'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Mini (1cm)', 'Pequeño (1.5cm)', 'Mediano (2cm)', 'Grande (3cm+)'] },
    { id: 'attachment', name: 'Tipo de sujeción', type: 'select', options: ['Clip', 'Anilla', 'Mosquetón', 'Gancho', 'Directo al collar'] },
    { id: 'pet_type', name: 'Tipo de mascota', type: 'tags', options: ['Perro', 'Gato', 'Universal'] }
  ],

  // Cascabeles para el cuello
  'pets-products-cascabeles-cuello': [
    { id: 'bell_size', name: 'Tamaño del cascabel', type: 'select', options: ['Mini (8mm)', 'Pequeño (10mm)', 'Mediano (15mm)', 'Grande (20mm)'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Latón', 'Acero inoxidable', 'Metal plateado', 'Aleación'] },
    { id: 'sound_level', name: 'Nivel de sonido', type: 'select', options: ['Suave', 'Medio', 'Fuerte', 'Muy audible'] },
    { id: 'color', name: 'Color', type: 'tags', options: ['Dorado', 'Plateado', 'Bronce', 'Negro', 'Colorido'] },
    { id: 'quantity', name: 'Cantidad', type: 'select', options: ['1 unidad', 'Pack de 2', 'Pack de 3', 'Pack de 5'] },
    { id: 'pet_size', name: 'Tamaño de mascota', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Todas las tallas'] }
  ],

  // Dijes para el cuello
  'pets-products-dijes-cuello': [
    { id: 'charm_type', name: 'Tipo de dije', type: 'select', options: ['Decorativo', 'Hueso', 'Corazón', 'Estrella', 'Pata', 'Personalizado'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Acero inoxidable', 'Aleación', 'Plástico', 'Esmalte', 'Metal plateado'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Mini (1cm)', 'Pequeño (1.5cm)', 'Mediano (2.5cm)', 'Grande (3cm+)'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Liso', 'Con grabado', 'Con piedras', 'Esmaltado', 'Brillante', 'Mate'] },
    { id: 'attachment_type', name: 'Tipo de enganche', type: 'select', options: ['Anilla simple', 'Mosquetón', 'Clip', 'Gancho giratorio'] },
    { id: 'customizable', name: 'Personalizable', type: 'select', options: ['Sí', 'No', 'Grabado disponible'] }
  ],

  // Dijes con etiquetas de identificación
  'pets-products-dijes-etiquetas': [
    { id: 'tag_shape', name: 'Forma de etiqueta', type: 'select', options: ['Circular', 'Hueso', 'Corazón', 'Rectangular', 'Estrella', 'Pata'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Acero inoxidable', 'Latón', 'Aluminio', 'Plástico resistente', 'Aleación'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['Pequeña (2cm)', 'Mediana (2.5cm)', 'Grande (3cm)', 'Extra grande (4cm)'] },
    { id: 'engraving', name: 'Grabado', type: 'select', options: ['Frente', 'Frente y reverso', 'Solo reverso', 'Sin grabado'] },
    { id: 'info_capacity', name: 'Capacidad de información', type: 'select', options: ['Nombre', 'Nombre + teléfono', 'Información completa', 'QR code'] },
    { id: 'durability', name: 'Durabilidad', type: 'tags', options: ['Resistente al agua', 'Anti-rayones', 'Grabado láser', 'Resistente al desgaste'] },
    { id: 'attachment', name: 'Sujeción', type: 'select', options: ['Anilla reforzada', 'Doble anilla', 'Mosquetón', 'Clip de seguridad'] }
  ],

  // Dispositivos biométricos para mascotas (categoría general)
  'pets-products-dispositivos-biometricos': [
    { id: 'device_type', name: 'Tipo de dispositivo', type: 'select', options: ['Medidor glucosa', 'Podómetro', 'Termómetro', 'Monitor cardíaco', 'Sensor actividad'] },
    { id: 'technology', name: 'Tecnología', type: 'tags', options: ['Digital', 'Bluetooth', 'WiFi', 'Analógico', 'App móvil', 'GPS'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Batería', 'Recargable', 'Solar', 'Sin batería'] },
    { id: 'accuracy', name: 'Precisión', type: 'select', options: ['Básica', 'Estándar', 'Alta precisión', 'Veterinaria'] },
    { id: 'pet_type', name: 'Tipo de mascota', type: 'tags', options: ['Perro', 'Gato', 'Universal'] }
  ],

  // Medidores de glucosa para mascotas
  'pets-products-medidores-glucosa': [
    { id: 'meter_type', name: 'Tipo de medidor', type: 'select', options: ['Digital portátil', 'Monitor continuo', 'Strips desechables', 'Sistema completo'] },
    { id: 'measurement_range', name: 'Rango de medición', type: 'select', options: ['20-600 mg/dL', '10-900 mg/dL', 'Rango veterinario', 'Rango extendido'] },
    { id: 'sample_size', name: 'Tamaño de muestra', type: 'select', options: ['0.3μL', '0.5μL', '1.0μL', 'Variable'] },
    { id: 'test_time', name: 'Tiempo de prueba', type: 'select', options: ['5 segundos', '10 segundos', '15 segundos', '30 segundos'] },
    { id: 'memory', name: 'Memoria', type: 'select', options: ['50 resultados', '100 resultados', '500 resultados', 'Sin límite'] },
    { id: 'calibration', name: 'Calibración', type: 'select', options: ['Auto-calibración', 'Manual', 'No requiere', 'Plasma equivalente'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Bluetooth', 'USB', 'App móvil', 'Sin conectividad'] },
    { id: 'accessories_included', name: 'Accesorios incluidos', type: 'tags', options: ['Lancetas', 'Tiras reactivas', 'Estuche', 'Manual veterinario'] }
  ],

  // Podómetros para mascotas
  'pets-products-podometros': [
    { id: 'pedometer_type', name: 'Tipo de podómetro', type: 'select', options: ['Clip collar', 'Dispositivo wearable', 'GPS tracker', 'Monitor actividad', 'Smart collar'] },
    { id: 'metrics_tracked', name: 'Métricas monitoreadas', type: 'tags', options: ['Pasos', 'Distancia', 'Calorías', 'Tiempo activo', 'Sueño', 'Ubicación'] },
    { id: 'battery_life', name: 'Duración batería', type: 'select', options: ['1-3 días', '1 semana', '2 semanas', '1 mes', '3+ meses'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['No resistente', 'Salpicaduras', 'Sumergible', 'Natación', 'IP67/IP68'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['Bluetooth', 'WiFi', 'Cellular', 'App móvil', 'Sincronización'] },
    { id: 'size_compatibility', name: 'Compatibilidad de tamaño', type: 'select', options: ['Pequeño (hasta 15kg)', 'Mediano (15-30kg)', 'Grande (30kg+)', 'Universal'] },
    { id: 'mounting', name: 'Montaje', type: 'select', options: ['Clip collar', 'Arnés integrado', 'Collar propio', 'Adhesivo', 'Magnético'] },
    { id: 'features', name: 'Características especiales', type: 'tags', options: ['GPS', 'Geofencing', 'Alertas', 'Análisis salud', 'Múltiples mascotas'] }
  ],

  // Termómetros para mascotas
  'pets-products-termometros': [
    { id: 'thermometer_type', name: 'Tipo de termómetro', type: 'select', options: ['Digital rectal', 'Infrarrojo sin contacto', 'Oído', 'Temporal', 'Oral flexible'] },
    { id: 'measurement_time', name: 'Tiempo de medición', type: 'select', options: ['Instantáneo', '10 segundos', '30 segundos', '1 minuto', '2 minutos'] },
    { id: 'temperature_range', name: 'Rango de temperatura', type: 'select', options: ['32-42°C', '35-42°C', '0-100°C', 'Rango veterinario'] },
    { id: 'accuracy', name: 'Precisión', type: 'select', options: ['±0.1°C', '±0.2°C', '±0.3°C', '±0.5°C'] },
    { id: 'display', name: 'Pantalla', type: 'select', options: ['LCD básica', 'LCD retroiluminada', 'Digital grande', 'Colores indicadores'] },
    { id: 'memory', name: 'Memoria', type: 'select', options: ['Sin memoria', '1 lectura', '10 lecturas', '32 lecturas', '100+ lecturas'] },
    { id: 'features', name: 'Características', type: 'tags', options: ['Alarma fiebre', 'Apagado automático', 'Impermeable', 'Flexible', 'Desinfectable'] },
    { id: 'age_suitability', name: 'Edad recomendada', type: 'tags', options: ['Cachorros', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'ease_of_use', name: 'Facilidad de uso', type: 'select', options: ['Muy fácil', 'Fácil', 'Requiere entrenamiento', 'Profesional'] },
    { id: 'hygiene', name: 'Higiene', type: 'tags', options: ['Desechable', 'Reutilizable', 'Fundas protectoras', 'Desinfectable', 'Antibacteriano'] }
  ],

  // Cuencos, comederos, y bebederos para mascotas (categoría general)
  'pets-products-cuencos-comederos': [
    { id: 'feeding_type', name: 'Tipo de alimentación', type: 'select', options: ['Manual', 'Automático', 'Por gravedad', 'Programable', 'Inteligente'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Acero inoxidable', 'Cerámica', 'Plástico', 'Bambú', 'Silicona', 'Vidrio'] },
    { id: 'capacity', name: 'Capacidad', type: 'select', options: ['Pequeña (250ml)', 'Mediana (500ml)', 'Grande (1L)', 'Extra grande (2L+)'] },
    { id: 'pet_size', name: 'Tamaño de mascota', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande'] }
  ],

  // Alimentadores automáticos
  'pets-products-alimentadores-automaticos': [
    { id: 'food_capacity', name: 'Capacidad de comida', type: 'select', options: ['1kg', '2kg', '3kg', '4kg', '5kg+'] },
    { id: 'portion_control', name: 'Control de porciones', type: 'select', options: ['1-8 porciones', '1-12 porciones', '1-20 porciones', 'Personalizable'] },
    { id: 'timer_type', name: 'Tipo de temporizador', type: 'select', options: ['Digital', 'Programable', 'Smart/App', 'Básico'] },
    { id: 'meals_per_day', name: 'Comidas por día', type: 'select', options: ['1-2 comidas', '3-4 comidas', '5-6 comidas', '8+ comidas'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Eléctrico', 'Batería', 'Dual', 'Recargable'] },
    { id: 'connectivity', name: 'Conectividad', type: 'tags', options: ['WiFi', 'Bluetooth', 'App móvil', 'Sin conectividad'] },
    { id: 'voice_recording', name: 'Grabación de voz', type: 'select', options: ['Sí', 'No'] },
    { id: 'anti_jam', name: 'Anti-atasco', type: 'select', options: ['Sí', 'No'] }
  ],

  // Tazones
  'pets-products-tazones': [
    { id: 'bowl_type', name: 'Tipo de tazón', type: 'select', options: ['Individual', 'Doble', 'Triple', 'Con base'] },
    { id: 'material', name: 'Material', type: 'select', options: ['Acero inoxidable', 'Cerámica', 'Plástico', 'Bambú', 'Silicona'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['XS (100ml)', 'S (250ml)', 'M (500ml)', 'L (1L)', 'XL (1.5L+)'] },
    { id: 'anti_slip', name: 'Antideslizante', type: 'select', options: ['Sí', 'No'] },
    { id: 'dishwasher_safe', name: 'Apto lavavajillas', type: 'select', options: ['Sí', 'No'] },
    { id: 'design', name: 'Diseño', type: 'tags', options: ['Clásico', 'Moderno', 'Decorativo', 'Ergonómico', 'Plegable'] }
  ],

  // Cuencos elevados
  'pets-products-cuencos-elevados': [
    { id: 'height', name: 'Altura', type: 'select', options: ['Baja (5-10cm)', 'Media (11-20cm)', 'Alta (21-30cm)', 'Ajustable'] },
    { id: 'stand_material', name: 'Material del soporte', type: 'select', options: ['Madera', 'Metal', 'Plástico', 'Bambú', 'Acero inoxidable'] },
    { id: 'bowl_included', name: 'Cuencos incluidos', type: 'select', options: ['1 cuenco', '2 cuencos', '3 cuencos', 'Sin cuencos'] },
    { id: 'adjustable_height', name: 'Altura ajustable', type: 'select', options: ['Sí', 'No'] },
    { id: 'stability', name: 'Estabilidad', type: 'select', options: ['Base pesada', 'Antideslizante', 'Fijación al suelo', 'Básica'] },
    { id: 'easy_clean', name: 'Fácil limpieza', type: 'select', options: ['Desmontable', 'Superficies lisas', 'Resistente al agua'] }
  ],

  // Alimentadores por gravedad
  'pets-products-alimentadores-gravedad': [
    { id: 'food_capacity', name: 'Capacidad de comida', type: 'select', options: ['1kg', '2kg', '3kg', '5kg', '7kg+'] },
    { id: 'flow_control', name: 'Control de flujo', type: 'select', options: ['Automático', 'Regulable', 'Sin control'] },
    { id: 'refill_indicator', name: 'Indicador de recarga', type: 'select', options: ['Visual', 'Sonoro', 'Sin indicador'] },
    { id: 'easy_refill', name: 'Recarga fácil', type: 'select', options: ['Tapa superior', 'Apertura lateral', 'Desmontable'] },
    { id: 'base_design', name: 'Diseño de base', type: 'select', options: ['Antideslizante', 'Elevada', 'Pesada', 'Plegable'] }
  ],

  // Cuencos de alimentación lenta
  'pets-products-cuencos-alimentacion-lenta': [
    { id: 'slow_pattern', name: 'Patrón anti-voracidad', type: 'select', options: ['Laberinto', 'Espiral', 'Obstáculos', 'Crestas', 'Múltiple'] },
    { id: 'difficulty_level', name: 'Nivel de dificultad', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Extremo'] },
    { id: 'cleaning_ease', name: 'Facilidad de limpieza', type: 'select', options: ['Muy fácil', 'Fácil', 'Moderada', 'Requiere cepillo'] },
    { id: 'food_type', name: 'Tipo de comida', type: 'tags', options: ['Seca', 'Húmeda', 'Mixta', 'Premios', 'Líquidos'] },
    { id: 'eating_time', name: 'Tiempo de alimentación', type: 'select', options: ['2-3x más lento', '3-5x más lento', '5-10x más lento'] }
  ],

  // Cuencos de viaje
  'pets-products-cuencos-viaje': [
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Plegable', 'Apilable', 'Compacto', 'Con estuche'] },
    { id: 'attachment', name: 'Sujeción', type: 'tags', options: ['Mosquetón', 'Clip', 'Correa', 'Velcro', 'Imán'] },
    { id: 'leak_proof', name: 'A prueba de fugas', type: 'select', options: ['Sí', 'No', 'Parcialmente'] },
    { id: 'capacity_travel', name: 'Capacidad plegado', type: 'select', options: ['150ml', '300ml', '500ml', '750ml', '1L+'] },
    { id: 'durability', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Profesional'] }
  ],

  // Dispensadores de agua
  'pets-products-dispensadores-agua': [
    { id: 'water_capacity', name: 'Capacidad de agua', type: 'select', options: ['500ml', '1L', '2L', '3L', '5L+'] },
    { id: 'dispenser_type', name: 'Tipo de dispensador', type: 'select', options: ['Gravedad', 'Bomba manual', 'Eléctrico', 'Automático'] },
    { id: 'refill_frequency', name: 'Frecuencia de recarga', type: 'select', options: ['Diaria', 'Cada 2-3 días', 'Semanal', 'Quincenal'] },
    { id: 'bottle_type', name: 'Tipo de botella', type: 'select', options: ['Estándar', 'Intercambiable', 'Reutilizable', 'Desechable'] },
    { id: 'flow_rate', name: 'Velocidad de flujo', type: 'select', options: ['Lenta', 'Media', 'Rápida', 'Ajustable'] }
  ],

  // Fuentes de agua
  'pets-products-fuentes-agua': [
    { id: 'fountain_capacity', name: 'Capacidad de la fuente', type: 'select', options: ['1L', '2L', '3L', '4L', '6L+'] },
    { id: 'filtration', name: 'Sistema de filtración', type: 'tags', options: ['Carbón activado', 'Espuma', 'Multi-etapa', 'UV', 'Sin filtro'] },
    { id: 'pump_type', name: 'Tipo de bomba', type: 'select', options: ['Sumergible', 'Externa', 'Ultra silenciosa', 'Ajustable'] },
    { id: 'power_consumption', name: 'Consumo eléctrico', type: 'select', options: ['Bajo (2W)', 'Medio (3-4W)', 'Alto (5W+)', 'Variable'] },
    { id: 'water_levels', name: 'Niveles de agua', type: 'select', options: ['1 nivel', '2 niveles', '3 niveles', 'Múltiples'] },
    { id: 'noise_level', name: 'Nivel de ruido', type: 'select', options: ['Ultra silenciosa', 'Muy silenciosa', 'Silenciosa', 'Audible'] },
    { id: 'led_lights', name: 'Luces LED', type: 'select', options: ['Sí', 'No'] },
    { id: 'auto_shutoff', name: 'Apagado automático', type: 'select', options: ['Sí', 'No'] }
  ],

  // Transportines y cajas para mascotas (categoría general)
  'pets-products-transportines-cajas': [
    { id: 'carrier_type', name: 'Tipo de transportín', type: 'select', options: ['Rígido', 'Blando', 'Mochila', 'Con ruedas', 'Plegable'] },
    { id: 'material', name: 'Material', type: 'tags', options: ['Plástico', 'Metal', 'Tela', 'Malla', 'Bambú', 'Madera'] },
    { id: 'size', name: 'Tamaño', type: 'select', options: ['XS (35x25x25cm)', 'S (45x30x30cm)', 'M (60x40x40cm)', 'L (80x55x55cm)', 'XL (100x70x70cm)'] },
    { id: 'pet_type', name: 'Tipo de mascota', type: 'tags', options: ['Perro', 'Gato', 'Ave', 'Conejo', 'Universal'] },
    { id: 'ventilation', name: 'Ventilación', type: 'select', options: ['Básica', 'Mejorada', 'Multi-direccional', 'Clima controlado'] }
  ],

  // Transportines aprobados para viajes aéreos
  'pets-products-transportines-aereos': [
    { id: 'airline_approval', name: 'Aprobación aerolínea', type: 'tags', options: ['IATA', 'TSA', 'FAA', 'ICAO', 'Universal'] },
    { id: 'cabin_cargo', name: 'Tipo de viaje', type: 'select', options: ['Cabina', 'Bodega', 'Ambos', 'Solo cabina'] },
    { id: 'weight_limit', name: 'Límite de peso', type: 'select', options: ['Hasta 5kg', 'Hasta 10kg', 'Hasta 20kg', 'Hasta 30kg', '30kg+'] },
    { id: 'security_features', name: 'Características de seguridad', type: 'tags', options: ['Cerradura segura', 'Identificación', 'Etiquetas incluidas', 'Manual de viaje'] },
    { id: 'material_grade', name: 'Grado del material', type: 'select', options: ['Comercial', 'Aeronáutico', 'Reforzado', 'Premium'] },
    { id: 'size_compliance', name: 'Cumplimiento de tamaño', type: 'select', options: ['Cabina estándar', 'Internacional', 'Doméstico', 'Flexible'] },
    { id: 'ventilation_standard', name: 'Estándar de ventilación', type: 'select', options: ['IATA compliant', 'Mejorada', 'Premium', 'Clima controlado'] }
  ],

  // Transportines con laterales acolchados
  'pets-products-transportines-laterales-acolchados': [
    { id: 'padding_type', name: 'Tipo de acolchado', type: 'select', options: ['Espuma', 'Memory foam', 'Gel', 'Fibra sintética', 'Plumón'] },
    { id: 'padding_thickness', name: 'Grosor del acolchado', type: 'select', options: ['Fino (1-2cm)', 'Medio (2-4cm)', 'Grueso (4-6cm)', 'Extra grueso (6cm+)'] },
    { id: 'comfort_level', name: 'Nivel de comodidad', type: 'select', options: ['Básico', 'Confortable', 'Premium', 'Lujo'] },
    { id: 'washable_padding', name: 'Acolchado lavable', type: 'select', options: ['Sí', 'No', 'Desmontable', 'Solo funda'] },
    { id: 'anti_anxiety', name: 'Anti-ansiedad', type: 'tags', options: ['Diseño calmante', 'Colores relajantes', 'Textura suave', 'Espacio acogedor'] },
    { id: 'durability', name: 'Durabilidad', type: 'select', options: ['Básica', 'Resistente', 'Extra resistente', 'Comercial'] }
  ],

  // Jaulas con laterales acolchados
  'pets-products-jaulas-laterales-acolchados': [
    { id: 'cage_type', name: 'Tipo de jaula', type: 'select', options: ['Plegable', 'Rígida', 'Modular', 'Convertible'] },
    { id: 'padding_coverage', name: 'Cobertura del acolchado', type: 'select', options: ['Solo laterales', 'Laterales y fondo', 'Completa', 'Personalizable'] },
    { id: 'bar_spacing', name: 'Separación de barras', type: 'select', options: ['Estrecha (1cm)', 'Media (2cm)', 'Amplia (3cm)', 'Variable'] },
    { id: 'door_type', name: 'Tipo de puerta', type: 'select', options: ['Simple', 'Doble', 'Lateral', 'Superior', 'Múltiple'] },
    { id: 'assembly', name: 'Montaje', type: 'select', options: ['Sin herramientas', 'Herramientas básicas', 'Montaje complejo', 'Pre-montada'] },
    { id: 'protection_level', name: 'Nivel de protección', type: 'tags', options: ['Anti-mordidas', 'Resistente a arañazos', 'A prueba de escape', 'Seguridad total'] }
  ],

  // Transportines con ruedas
  'pets-products-transportines-ruedas': [
    { id: 'wheel_type', name: 'Tipo de ruedas', type: 'select', options: ['2 ruedas', '4 ruedas', 'Giratorias 360°', 'Todoterreno'] },
    { id: 'wheel_size', name: 'Tamaño de ruedas', type: 'select', options: ['Pequeñas (5cm)', 'Medianas (8cm)', 'Grandes (12cm)', 'Extra grandes (15cm+)'] },
    { id: 'handle_type', name: 'Tipo de asa', type: 'select', options: ['Telescópica', 'Fija', 'Ergonómica', 'Ajustable', 'Doble'] },
    { id: 'maneuverability', name: 'Maniobrabilidad', type: 'select', options: ['Básica', 'Buena', 'Excelente', 'Profesional'] },
    { id: 'terrain_suitability', name: 'Superficie recomendada', type: 'tags', options: ['Lisa', 'Rugosa', 'Exterior', 'Escaleras', 'Universal'] },
    { id: 'weight_capacity', name: 'Capacidad de peso', type: 'select', options: ['Hasta 10kg', 'Hasta 20kg', 'Hasta 30kg', 'Hasta 50kg'] },
    { id: 'storage', name: 'Almacenamiento adicional', type: 'tags', options: ['Bolsillos laterales', 'Compartimento superior', 'Área de accesorios', 'Sin almacenamiento'] }
  ],

  // Transportines de mochila
  'pets-products-transportines-mochila': [
    { id: 'backpack_style', name: 'Estilo de mochila', type: 'select', options: ['Tradicional', 'Astronauta', 'Ventana frontal', 'Lateral', 'Convertible'] },
    { id: 'weight_distribution', name: 'Distribución del peso', type: 'select', options: ['Básica', 'Ergonómica', 'Con cinturón', 'Profesional'] },
    { id: 'ventilation_system', name: 'Sistema de ventilación', type: 'select', options: ['Malla básica', 'Ventanas múltiples', 'Flujo de aire', 'Clima controlado'] },
    { id: 'comfort_features', name: 'Características de comodidad', type: 'tags', options: ['Tirantes acolchados', 'Soporte lumbar', 'Cinturón pecho', 'Distribución peso'] },
    { id: 'visibility', name: 'Visibilidad', type: 'select', options: ['Limitada', 'Ventana pequeña', 'Ventana grande', 'Vista panorámica'] },
    { id: 'hiking_suitable', name: 'Apto para senderismo', type: 'select', options: ['Sí', 'No', 'Uso ligero', 'Profesional'] },
    { id: 'safety_harness', name: 'Arnés de seguridad interno', type: 'select', options: ['Incluido', 'Opcional', 'No disponible'] }
  ],

  // Jaulas para coches
  'pets-products-jaulas-coches': [
    { id: 'car_compatibility', name: 'Compatibilidad vehicular', type: 'tags', options: ['Sedán', 'SUV', 'Hatchback', 'Station wagon', 'Universal'] },
    { id: 'installation_method', name: 'Método de instalación', type: 'select', options: ['Cinturones seguridad', 'Anclajes ISOFIX', 'Presión', 'Atornillado'] },
    { id: 'crash_protection', name: 'Protección en accidentes', type: 'select', options: ['Básica', 'Mejorada', 'Crash-tested', 'Certificada'] },
    { id: 'ventilation_car', name: 'Ventilación', type: 'select', options: ['Básica', 'Mejorada', 'Flujo cruzado', 'Clima interior'] },
    { id: 'visibility_driver', name: 'Visibilidad del conductor', type: 'select', options: ['No afecta', 'Mínima afectación', 'Requiere ajuste', 'Bloquea vista'] },
    { id: 'size_adjustment', name: 'Ajuste de tamaño', type: 'select', options: ['Fijo', 'Ajustable', 'Modular', 'Personalizable'] },
    { id: 'easy_access', name: 'Fácil acceso', type: 'tags', options: ['Puertas múltiples', 'Apertura superior', 'Acceso lateral', 'Desmontable'] }
  ],

  // Jaulas estilo mueble
  'pets-products-jaulas-estilo-mueble': [
    { id: 'furniture_style', name: 'Estilo de mueble', type: 'select', options: ['Mesa auxiliar', 'Cómoda', 'Aparador', 'Mesa centro', 'Personalizado'] },
    { id: 'wood_type', name: 'Tipo de madera', type: 'select', options: ['Pino', 'Roble', 'MDF', 'Bambú', 'Madera reciclada'] },
    { id: 'finish', name: 'Acabado', type: 'select', options: ['Natural', 'Barnizado', 'Pintado', 'Lacado', 'Envejecido'] },
    { id: 'dual_function', name: 'Función dual', type: 'select', options: ['Solo jaula', 'Mesa funcional', 'Almacenamiento', 'Decorativo'] },
    { id: 'assembly_required', name: 'Requiere montaje', type: 'select', options: ['No', 'Básico', 'Intermedio', 'Complejo'] },
    { id: 'room_suitability', name: 'Habitación recomendada', type: 'tags', options: ['Sala', 'Dormitorio', 'Cocina', 'Oficina', 'Universal'] },
    { id: 'hidden_cage', name: 'Jaula oculta', type: 'select', options: ['Completamente visible', 'Parcialmente oculta', 'Completamente oculta'] }
  ],

  // Transportines rígidos
  'pets-products-transportines-rigidos': [
    { id: 'material_strength', name: 'Resistencia del material', type: 'select', options: ['Estándar', 'Reforzado', 'Ultra resistente', 'Grado comercial'] },
    { id: 'construction_type', name: 'Tipo de construcción', type: 'select', options: ['Una pieza', 'Dos piezas', 'Modular', 'Soldado'] },
    { id: 'weather_resistance', name: 'Resistencia climática', type: 'tags', options: ['Resistente UV', 'Impermeable', 'Anti-heladas', 'Todo clima'] },
    { id: 'security_level', name: 'Nivel de seguridad', type: 'select', options: ['Básico', 'Mejorado', 'Alta seguridad', 'Máxima seguridad'] },
    { id: 'cleaning_ease', name: 'Facilidad de limpieza', type: 'select', options: ['Básica', 'Fácil', 'Muy fácil', 'Auto-limpiante'] },
    { id: 'stackable', name: 'Apilable', type: 'select', options: ['Sí', 'No', 'Con accesorios'] },
    { id: 'professional_grade', name: 'Grado profesional', type: 'select', options: ['Doméstico', 'Semi-profesional', 'Profesional', 'Veterinario'] }
  ],

  // Transportines que pueden rodar
  'pets-products-transportines-pueden-rodar': [
    { id: 'rolling_mechanism', name: 'Mecanismo de rodado', type: 'select', options: ['Ruedas retráctiles', 'Base con ruedas', 'Sistema modular', 'Convertible'] },
    { id: 'wheel_quality', name: 'Calidad de ruedas', type: 'select', options: ['Básicas', 'Reforzadas', 'Silenciosas', 'Profesionales'] },
    { id: 'conversion_ease', name: 'Facilidad de conversión', type: 'select', options: ['Instantánea', 'Rápida', 'Requiere montaje', 'Compleja'] },
    { id: 'stability_modes', name: 'Estabilidad en modos', type: 'select', options: ['Solo fijo estable', 'Ambos modos estables', 'Requiere frenos', 'Auto-estabilizante'] },
    { id: 'versatility', name: 'Versatilidad', type: 'tags', options: ['Casa/viaje', 'Multi-terreno', 'Interior/exterior', 'Universal'] },
    { id: 'weight_when_rolling', name: 'Peso al rodar', type: 'select', options: ['Ligero', 'Moderado', 'Pesado', 'Variable'] }
  ],

  // Canguros y transportines portátiles
  'pets-products-canguros-transportines-portatiles': [
    { id: 'carrying_style', name: 'Estilo de carga', type: 'select', options: ['Canguro frontal', 'Bandolera', 'Mochila', 'Brazo', 'Múltiple'] },
    { id: 'size_range', name: 'Rango de tamaño', type: 'select', options: ['Solo pequeños', 'Pequeño-mediano', 'Ajustable', 'Universal'] },
    { id: 'portability_level', name: 'Nivel de portabilidad', type: 'select', options: ['Ultra portátil', 'Muy portátil', 'Portátil', 'Semi-portátil'] },
    { id: 'hands_free', name: 'Manos libres', type: 'select', options: ['Completamente', 'Parcialmente', 'No', 'Opcional'] },
    { id: 'quick_access', name: 'Acceso rápido', type: 'select', options: ['Apertura completa', 'Apertura parcial', 'Cremallera', 'Velcro'] },
    { id: 'activity_suitability', name: 'Actividades recomendadas', type: 'tags', options: ['Paseos cortos', 'Compras', 'Viajes', 'Senderismo', 'Urbano'] },
    { id: 'pet_position', name: 'Posición de la mascota', type: 'select', options: ['Mirando hacia fuera', 'Mirando al portador', 'Ambas', 'Lateral'] }
  ],

  // Collares de seguridad y con hebilla de separación
  'pets-products-collares-seguridad-hebilla': [
    { id: 'safety_mechanism', name: 'Mecanismo de seguridad', type: 'select', options: ['Hebilla liberación rápida', 'Hebilla separación', 'Sistema anti-ahorcamiento', 'Punto de rotura'] },
    { id: 'release_force', name: 'Fuerza de liberación', type: 'select', options: ['Baja (2-4kg)', 'Media (4-8kg)', 'Alta (8-12kg)', 'Ajustable'] },
    { id: 'material_strength', name: 'Resistencia del material', type: 'select', options: ['Nylon estándar', 'Nylon reforzado', 'Biothane', 'Cuero tratado'] },
    { id: 'visibility', name: 'Visibilidad', type: 'tags', options: ['Reflectivo', 'Colores brillantes', 'LED integrado', 'Estándar'] },
    { id: 'size_range', name: 'Rango de tallas', type: 'select', options: ['XS-S (20-35cm)', 'M-L (35-55cm)', 'L-XL (55-75cm)', 'Ajustable universal'] },
    { id: 'certification', name: 'Certificación de seguridad', type: 'tags', options: ['CE', 'ISO', 'Veterinario aprobado', 'Sin certificación'] }
  ],

  // Chalecos
  'pets-products-chalecos': [
    { id: 'vest_purpose', name: 'Propósito del chaleco', type: 'select', options: ['Seguridad/Reflectivo', 'Entrenamiento', 'Terapéutico', 'Clima', 'Identificación'] },
    { id: 'material_type', name: 'Tipo de material', type: 'select', options: ['Malla transpirable', 'Neopreno', 'Nylon impermeable', 'Algodón', 'Material técnico'] },
    { id: 'visibility_features', name: 'Características de visibilidad', type: 'tags', options: ['Bandas reflectivas', 'LED integrado', 'Colores alta visibilidad', 'Luces intermitentes'] },
    { id: 'weather_protection', name: 'Protección climática', type: 'tags', options: ['Impermeable', 'Resistente al viento', 'Protección UV', 'Aislamiento térmico'] },
    { id: 'adjustment_points', name: 'Puntos de ajuste', type: 'select', options: ['2 puntos', '3 puntos', '4 puntos', '5+ puntos'] },
    { id: 'activity_type', name: 'Tipo de actividad', type: 'tags', options: ['Paseo urbano', 'Senderismo', 'Trabajo', 'Caza', 'Rescate'] },
    { id: 'load_capacity', name: 'Capacidad de carga', type: 'select', options: ['Sin carga', 'Ligera (0.5kg)', 'Media (1-2kg)', 'Pesada (3kg+)'] }
  ],

  // Collares antipulgas
  'pets-products-collares-antipulgas': [
    { id: 'active_ingredient', name: 'Ingrediente activo', type: 'select', options: ['Imidacloprid', 'Flumethrin', 'Deltametrina', 'Aceites naturales', 'Múltiple'] },
    { id: 'protection_duration', name: 'Duración de protección', type: 'select', options: ['1-3 meses', '4-6 meses', '7-8 meses', '12 meses'] },
    { id: 'pest_coverage', name: 'Cobertura de plagas', type: 'tags', options: ['Pulgas', 'Garrapatas', 'Mosquitos', 'Piojos', 'Ácaros'] },
    { id: 'age_suitability', name: 'Edad recomendada', type: 'select', options: ['Cachorros 12+ semanas', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['No resistente', 'Resistente a salpicaduras', 'Sumergible', 'Completamente impermeable'] },
    { id: 'natural_synthetic', name: 'Tipo de formulación', type: 'select', options: ['Sintético', 'Natural', 'Orgánico', 'Híbrido'] },
    { id: 'side_effects', name: 'Efectos secundarios', type: 'select', options: ['Mínimos', 'Posibles irritaciones', 'Requiere supervisión', 'Consultar veterinario'] }
  ],

  // Collares GPS
  'pets-products-collares-gps': [
    { id: 'gps_accuracy', name: 'Precisión GPS', type: 'select', options: ['3-5 metros', '1-3 metros', 'Sub-metro', 'Profesional'] },
    { id: 'battery_life', name: 'Duración batería', type: 'select', options: ['1-2 días', '3-7 días', '1-2 semanas', '1 mes+'] },
    { id: 'tracking_features', name: 'Características de rastreo', type: 'tags', options: ['Tiempo real', 'Historial rutas', 'Geo-cercas', 'Alertas movimiento'] },
    { id: 'connectivity_type', name: 'Tipo de conectividad', type: 'select', options: ['Cellular 2G', 'Cellular 4G', 'WiFi', 'Bluetooth', 'Híbrido'] },
    { id: 'subscription_required', name: 'Suscripción requerida', type: 'select', options: ['Sí - Mensual', 'Sí - Anual', 'Opcional', 'No requerida'] },
    { id: 'water_rating', name: 'Clasificación de agua', type: 'select', options: ['IPX4 (salpicaduras)', 'IPX7 (sumergible)', 'IPX8 (natación)', 'No resistente'] },
    { id: 'additional_sensors', name: 'Sensores adicionales', type: 'tags', options: ['Acelerómetro', 'Temperatura', 'Monitor actividad', 'Detector ladridos'] },
    { id: 'app_features', name: 'Características de app', type: 'tags', options: ['Mapas detallados', 'Múltiples usuarios', 'Notificaciones', 'Análisis actividad'] }
  ],

  // Arneses específicos
  'pets-products-arneses-especificos': [
    { id: 'harness_style', name: 'Estilo de arnés', type: 'select', options: ['Step-in', 'Over-the-head', 'Vest-style', 'H-style', 'Y-front'] },
    { id: 'control_level', name: 'Nivel de control', type: 'select', options: ['Básico', 'Anti-tirones', 'Control total', 'Entrenamiento avanzado'] },
    { id: 'padding_areas', name: 'Áreas acolchadas', type: 'tags', options: ['Pecho', 'Espalda', 'Axilas', 'Correas', 'Sin acolchado'] },
    { id: 'attachment_points', name: 'Puntos de enganche', type: 'select', options: ['Solo pecho', 'Solo espalda', 'Dual (pecho y espalda)', 'Múltiple'] },
    { id: 'size_adjustability', name: 'Ajustabilidad', type: 'select', options: ['Fijo', '2 puntos ajuste', '3-4 puntos ajuste', '5+ puntos ajuste'] },
    { id: 'escape_proof', name: 'A prueba de escape', type: 'select', options: ['Básico', 'Mejorado', 'Alta seguridad', 'Imposible escape'] },
    { id: 'special_needs', name: 'Necesidades especiales', type: 'tags', options: ['Post-cirugía', 'Ansiedad', 'Entrenamiento', 'Discapacidad', 'Estándar'] }
  ],

  // Collares LED
  'pets-products-collares-led': [
    { id: 'led_type', name: 'Tipo de LED', type: 'select', options: ['LED estándar', 'LED ultra brillante', 'LED multicolor', 'Fibra óptica'] },
    { id: 'light_modes', name: 'Modos de luz', type: 'tags', options: ['Constante', 'Intermitente', 'Estroboscópico', 'Patrón', 'Múltiples modos'] },
    { id: 'battery_type', name: 'Tipo de batería', type: 'select', options: ['Reemplazable', 'Recargable USB', 'Solar', 'Duración extendida'] },
    { id: 'visibility_distance', name: 'Distancia de visibilidad', type: 'select', options: ['100-300m', '300-500m', '500m-1km', '1km+'] },
    { id: 'color_options', name: 'Opciones de color', type: 'tags', options: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Blanco', 'Multicolor'] },
    { id: 'weather_resistance', name: 'Resistencia climática', type: 'select', options: ['Básica', 'Resistente lluvia', 'Completamente impermeable', 'Todo clima'] },
    { id: 'charging_time', name: 'Tiempo de carga', type: 'select', options: ['1-2 horas', '2-4 horas', '4-6 horas', 'Carga rápida'] }
  ],

  // Collares martingale
  'pets-products-collares-martingale': [
    { id: 'tightening_mechanism', name: 'Mecanismo de ajuste', type: 'select', options: ['Cadena tradicional', 'Tela doble', 'Sistema limitado', 'Anti-ahorcamiento'] },
    { id: 'size_range_martingale', name: 'Rango de ajuste', type: 'select', options: ['5cm variación', '7-10cm variación', '10-15cm variación', 'Máxima variación'] },
    { id: 'material_combination', name: 'Combinación de materiales', type: 'select', options: ['Nylon/Metal', 'Cuero/Metal', 'Biothane/Metal', 'Textil/Nylon'] },
    { id: 'control_effectiveness', name: 'Efectividad de control', type: 'select', options: ['Suave', 'Moderada', 'Firme', 'Máximo control'] },
    { id: 'breed_suitability', name: 'Razas recomendadas', type: 'tags', options: ['Galgos', 'Whippets', 'Cuello estrecho', 'Cabeza pequeña', 'Universal'] },
    { id: 'training_level', name: 'Nivel de entrenamiento', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'] }
  ],

  // Collares de identificación personalizados
  'pets-products-collares-identificacion-personalizados': [
    { id: 'personalization_method', name: 'Método de personalización', type: 'select', options: ['Bordado', 'Grabado láser', 'Impresión', 'Placa removible'] },
    { id: 'info_capacity', name: 'Capacidad de información', type: 'select', options: ['Solo nombre', 'Nombre + teléfono', 'Información completa', 'QR code'] },
    { id: 'durability_rating', name: 'Calificación durabilidad', type: 'select', options: ['Uso ligero', 'Uso regular', 'Uso intensivo', 'Profesional'] },
    { id: 'font_options', name: 'Opciones de fuente', type: 'tags', options: ['Arial', 'Cursiva', 'Bloque', 'Decorativa', 'Personalizada'] },
    { id: 'color_combinations', name: 'Combinaciones de color', type: 'select', options: ['2 colores', '3 colores', 'Multicolor', 'Personalizado'] },
    { id: 'lead_time', name: 'Tiempo de fabricación', type: 'select', options: ['24 horas', '2-3 días', '1 semana', '2+ semanas'] },
    { id: 'washability', name: 'Lavabilidad', type: 'select', options: ['No lavable', 'Lavado suave', 'Lavable máquina', 'Impermeable'] }
  ],

  // Collares estándar
  'pets-products-collares-estandar': [
    { id: 'closure_type', name: 'Tipo de cierre', type: 'select', options: ['Hebilla tradicional', 'Clip plástico', 'Hebilla metal', 'Cierre rápido'] },
    { id: 'width_options', name: 'Opciones de ancho', type: 'select', options: ['Estrecho (1-2cm)', 'Medio (2-3cm)', 'Ancho (3-5cm)', 'Extra ancho (5cm+)'] },
    { id: 'style_category', name: 'Categoría de estilo', type: 'select', options: ['Clásico', 'Moderno', 'Deportivo', 'Elegante', 'Casual'] },
    { id: 'pattern_design', name: 'Diseño/Patrón', type: 'tags', options: ['Liso', 'Estampado', 'Geométrico', 'Animal print', 'Personalizado'] },
    { id: 'hardware_quality', name: 'Calidad del hardware', type: 'select', options: ['Básico', 'Estándar', 'Premium', 'Profesional'] },
    { id: 'price_range', name: 'Rango de precio', type: 'select', options: ['Económico', 'Medio', 'Premium', 'Lujo'] }
  ],

  // Collares de entrenamiento, estrangulamiento y dientes
  'pets-products-collares-entrenamiento': [
    { id: 'training_type', name: 'Tipo de entrenamiento', type: 'select', options: ['Básico', 'Corrección suave', 'Entrenamiento avanzado', 'Profesional'] },
    { id: 'correction_method', name: 'Método de corrección', type: 'select', options: ['Presión limitada', 'Sonido', 'Vibración', 'Combinado'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Limitador presión', 'Parada automática', 'Supervisión requerida', 'Uso temporal'] },
    { id: 'trainer_recommended', name: 'Recomendado por entrenador', type: 'select', options: ['Sí', 'No', 'Solo con supervisión', 'Profesional únicamente'] },
    { id: 'experience_level', name: 'Nivel de experiencia requerido', type: 'select', options: ['Novato', 'Intermedio', 'Avanzado', 'Solo profesionales'] },
    { id: 'behavioral_issues', name: 'Problemas de comportamiento', type: 'tags', options: ['Tirar correa', 'Agresividad', 'Distracción', 'Escape', 'Múltiples'] },
    { id: 'veterinary_approval', name: 'Aprobación veterinaria', type: 'select', options: ['Recomendado', 'Aprobado', 'Con reservas', 'No recomendado'] }
  ],

  // Sistemas de contención para mascotas (categoría general)
  'pets-products-sistemas-contencion': [
    { id: 'containment_type', name: 'Tipo de contención', type: 'select', options: ['Física', 'Electrónica', 'Híbrida', 'Temporal', 'Permanente'] },
    { id: 'area_coverage', name: 'Cobertura de área', type: 'select', options: ['Interior', 'Exterior', 'Mixta', 'Portátil'] },
    { id: 'installation_complexity', name: 'Complejidad de instalación', type: 'select', options: ['Sin instalación', 'Básica', 'Intermedia', 'Profesional'] },
    { id: 'pet_size_suitability', name: 'Tamaño de mascota', type: 'tags', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande', 'Universal'] }
  ],

  // Cercas invisibles electrónicas
  'pets-products-cercas-invisibles-electronicas': [
    { id: 'system_type', name: 'Tipo de sistema', type: 'select', options: ['Alambre enterrado', 'Inalámbrico', 'GPS', 'Híbrido'] },
    { id: 'coverage_area', name: 'Área de cobertura', type: 'select', options: ['0.25 acres', '0.5 acres', '1 acre', '2+ acres', 'Ilimitada'] },
    { id: 'correction_levels', name: 'Niveles de corrección', type: 'select', options: ['Solo sonido', '1-8 niveles', '1-16 niveles', 'Personalizable'] },
    { id: 'collar_compatibility', name: 'Compatibilidad de collar', type: 'select', options: ['Collar específico', 'Múltiples collares', 'Universal', 'Terceros'] },
    { id: 'installation_method', name: 'Método de instalación', type: 'select', options: ['DIY básico', 'DIY avanzado', 'Profesional recomendado', 'Solo profesional'] },
    { id: 'boundary_flexibility', name: 'Flexibilidad de límites', type: 'tags', options: ['Formas irregulares', 'Múltiples zonas', 'Zonas seguras', 'Ajustes temporales'] },
    { id: 'weather_resistance', name: 'Resistencia climática', type: 'select', options: ['Básica', 'Resistente lluvia', 'Todo clima', 'Extrema'] },
    { id: 'backup_power', name: 'Respaldo de energía', type: 'select', options: ['Sin respaldo', 'Batería incluida', 'UPS recomendado', 'Solar'] }
  ],

  // Cercados y jaulas
  'pets-products-cercados-jaulas': [
    { id: 'enclosure_type', name: 'Tipo de cercado', type: 'select', options: ['Jaula tradicional', 'Corral', 'Cerca modular', 'Sistema expandible'] },
    { id: 'material_construction', name: 'Material de construcción', type: 'select', options: ['Metal galvanizado', 'Acero inoxidable', 'Aluminio', 'Plástico resistente', 'Madera tratada'] },
    { id: 'size_dimensions', name: 'Dimensiones', type: 'select', options: ['Pequeño (1x1m)', 'Mediano (2x2m)', 'Grande (3x3m)', 'Extra grande (4x4m+)', 'Personalizable'] },
    { id: 'height_options', name: 'Opciones de altura', type: 'select', options: ['Baja (60cm)', 'Media (120cm)', 'Alta (180cm)', 'Extra alta (240cm+)'] },
    { id: 'door_configuration', name: 'Configuración de puertas', type: 'select', options: ['Sin puerta', '1 puerta', '2 puertas', 'Múltiples accesos'] },
    { id: 'assembly_required', name: 'Requiere montaje', type: 'select', options: ['Pre-montado', 'Montaje simple', 'Montaje complejo', 'Herramientas especiales'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Fijo', 'Semi-portátil', 'Completamente portátil', 'Plegable'] }
  ],

  // Jaulas de ejercicio
  'pets-products-jaulas-ejercicio': [
    { id: 'exercise_purpose', name: 'Propósito del ejercicio', type: 'tags', options: ['Juego libre', 'Entrenamiento', 'Rehabilitación', 'Socialización', 'Contención temporal'] },
    { id: 'floor_type', name: 'Tipo de suelo', type: 'select', options: ['Sin suelo', 'Malla', 'Plástico sólido', 'Caucho', 'Césped artificial'] },
    { id: 'exercise_space', name: 'Espacio de ejercicio', type: 'select', options: ['Básico (2x2m)', 'Estándar (3x3m)', 'Amplio (4x4m)', 'Profesional (5x5m+)'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Bordes redondeados', 'Pestillos seguros', 'Base estable', 'Materiales no tóxicos'] },
    { id: 'weather_suitability', name: 'Adecuación climática', type: 'select', options: ['Solo interior', 'Interior/exterior', 'Todo clima', 'Resistente UV'] },
    { id: 'expandability', name: 'Expandibilidad', type: 'select', options: ['Tamaño fijo', 'Módulos adicionales', 'Completamente modular', 'Conexión múltiple'] }
  ],

  // Cercas y puertas
  'pets-products-cercas-puertas': [
    { id: 'fence_style', name: 'Estilo de cerca', type: 'select', options: ['Tradicional', 'Moderno', 'Decorativo', 'Industrial', 'Rústico'] },
    { id: 'gate_mechanism', name: 'Mecanismo de puerta', type: 'select', options: ['Manual', 'Auto-cierre', 'Magnético', 'Electrónico', 'Doble acción'] },
    { id: 'height_fence', name: 'Altura de cerca', type: 'select', options: ['Baja (90cm)', 'Media (150cm)', 'Alta (180cm)', 'Extra alta (240cm+)'] },
    { id: 'installation_surface', name: 'Superficie de instalación', type: 'tags', options: ['Césped', 'Concreto', 'Tierra', 'Grava', 'Universal'] },
    { id: 'security_level', name: 'Nivel de seguridad', type: 'select', options: ['Básico', 'Mejorado', 'Alto', 'Máximo'] },
    { id: 'maintenance_required', name: 'Mantenimiento requerido', type: 'select', options: ['Mínimo', 'Ocasional', 'Regular', 'Intensivo'] },
    { id: 'customization_options', name: 'Opciones de personalización', type: 'tags', options: ['Colores', 'Alturas', 'Longitudes', 'Accesorios', 'Diseños'] }
  ],

  // Perreras
  'pets-products-perreras': [
    { id: 'kennel_size', name: 'Tamaño de perrera', type: 'select', options: ['Individual pequeña', 'Individual grande', 'Múltiple pequeña', 'Múltiple grande', 'Comercial'] },
    { id: 'construction_grade', name: 'Grado de construcción', type: 'select', options: ['Residencial', 'Semi-comercial', 'Comercial', 'Industrial'] },
    { id: 'roofing_type', name: 'Tipo de techo', type: 'select', options: ['Sin techo', 'Techo parcial', 'Techo completo', 'Techo aislado'] },
    { id: 'drainage_system', name: 'Sistema de drenaje', type: 'select', options: ['Básico', 'Mejorado', 'Profesional', 'Automático'] },
    { id: 'run_length', name: 'Longitud del corredor', type: 'select', options: ['2-3 metros', '4-5 metros', '6-8 metros', '10+ metros'] },
    { id: 'separation_walls', name: 'Paredes de separación', type: 'select', options: ['Malla completa', 'Parcialmente sólida', 'Completamente sólida', 'Ajustable'] },
    { id: 'feeding_setup', name: 'Configuración de alimentación', type: 'tags', options: ['Área designada', 'Comederos incluidos', 'Sistema automático', 'Acceso externo'] }
  ],

  // Parques de juego
  'pets-products-parques-juego': [
    { id: 'playground_size', name: 'Tamaño del parque', type: 'select', options: ['Compacto (2x2m)', 'Estándar (4x4m)', 'Grande (6x6m)', 'Extra grande (8x8m+)'] },
    { id: 'play_equipment', name: 'Equipo de juego incluido', type: 'tags', options: ['Túneles', 'Rampas', 'Plataformas', 'Juguetes colgantes', 'Áreas de descanso'] },
    { id: 'surface_material', name: 'Material de superficie', type: 'select', options: ['Césped natural', 'Césped artificial', 'Caucho', 'Arena', 'Mulch'] },
    { id: 'age_group_design', name: 'Diseño por grupo de edad', type: 'select', options: ['Cachorros', 'Adultos jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'social_features', name: 'Características sociales', type: 'tags', options: ['Múltiples niveles', 'Áreas de encuentro', 'Separación por tamaño', 'Zona observación'] },
    { id: 'maintenance_access', name: 'Acceso para mantenimiento', type: 'select', options: ['Básico', 'Fácil acceso', 'Acceso total', 'Diseño auto-mantenimiento'] },
    { id: 'safety_standards', name: 'Estándares de seguridad', type: 'tags', options: ['Bordes suaves', 'Materiales no tóxicos', 'Espacios seguros', 'Certificación'] }
  ],

  // Productos para gatos (categoría general)
  'pets-products-productos-gatos': [
    { id: 'cat_age', name: 'Edad del gato', type: 'select', options: ['Gatito (0-12 meses)', 'Adulto joven (1-7 años)', 'Senior (7+ años)', 'Todas las edades'] },
    { id: 'cat_size', name: 'Tamaño del gato', type: 'select', options: ['Pequeño (2-4kg)', 'Mediano (4-6kg)', 'Grande (6kg+)', 'Todas las tallas'] },
    { id: 'indoor_outdoor', name: 'Estilo de vida', type: 'select', options: ['Interior', 'Exterior', 'Mixto', 'Universal'] },
    { id: 'special_needs', name: 'Necesidades especiales', type: 'tags', options: ['Sensibilidades alimentarias', 'Problemas urinarios', 'Control peso', 'Pelo largo', 'Sin necesidades especiales'] }
  ],

  // Comida para gatos
  'pets-products-comida-gatos': [
    { id: 'food_type', name: 'Tipo de alimento', type: 'select', options: ['Seco', 'Húmedo', 'Semi-húmedo', 'Crudo/BARF', 'Snacks'] },
    { id: 'life_stage', name: 'Etapa de vida', type: 'select', options: ['Gatito', 'Adulto', 'Senior', 'Gestación/Lactancia', 'Todas las edades'] },
    { id: 'protein_source', name: 'Fuente de proteína', type: 'tags', options: ['Pollo', 'Pescado', 'Ternera', 'Cordero', 'Pavo', 'Conejo', 'Múltiples proteínas'] },
    { id: 'special_formula', name: 'Fórmula especial', type: 'tags', options: ['Control peso', 'Pelo y piel', 'Digestión sensible', 'Urinario', 'Esterilizado', 'Sin cereales'] },
    { id: 'package_size', name: 'Tamaño del paquete', type: 'select', options: ['400g-1kg', '1-3kg', '3-7kg', '7kg+', 'Latas individuales'] },
    { id: 'texture', name: 'Textura', type: 'select', options: ['Croquetas', 'Paté', 'Trozos en salsa', 'Trozos en gelatina', 'Mousse'] },
    { id: 'prescription_diet', name: 'Dieta prescriptiva', type: 'select', options: ['Sí', 'No', 'Veterinario recomendado'] },
    { id: 'brand_tier', name: 'Gama de marca', type: 'select', options: ['Económica', 'Premium', 'Super Premium', 'Holística'] }
  ],

  // Mobiliario para gatos
  'pets-products-mobiliario-gatos': [
    { id: 'furniture_type', name: 'Tipo de mobiliario', type: 'select', options: ['Rascador', 'Árbol para gatos', 'Casa/cueva', 'Hamaca', 'Estante de pared', 'Centro de actividades'] },
    { id: 'height_range', name: 'Altura', type: 'select', options: ['Bajo (30-60cm)', 'Medio (60-120cm)', 'Alto (120-180cm)', 'Extra alto (180cm+)'] },
    { id: 'material_construction', name: 'Material de construcción', type: 'tags', options: ['Sisal', 'Madera', 'Cartón', 'Felpa', 'Carpet', 'Bambú'] },
    { id: 'stability_base', name: 'Estabilidad de la base', type: 'select', options: ['Básica', 'Reforzada', 'Extra pesada', 'Anclaje a pared'] },
    { id: 'features_included', name: 'Características incluidas', type: 'tags', options: ['Postes para rascar', 'Plataformas', 'Cuevas/casas', 'Juguetes colgantes', 'Hamacas', 'Escaleras'] },
    { id: 'assembly_difficulty', name: 'Dificultad de montaje', type: 'select', options: ['Sin montaje', 'Fácil', 'Intermedio', 'Complejo'] },
    { id: 'space_requirement', name: 'Espacio requerido', type: 'select', options: ['Compacto', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'multi_cat_suitable', name: 'Apto para múltiples gatos', type: 'select', options: ['Sí', 'No', 'Hasta 2 gatos', 'Hasta 3+ gatos'] }
  ],

  // Accesorios de muebles para gatos
  'pets-products-accesorios-muebles-gatos': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Repuestos sisal', 'Plataformas adicionales', 'Juguetes de repuesto', 'Cojines', 'Extensiones', 'Sistemas de anclaje'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'select', options: ['Universal', 'Marca específica', 'Modelo específico', 'Medidas estándar'] },
    { id: 'installation_method', name: 'Método de instalación', type: 'select', options: ['Clip', 'Tornillos', 'Velcro', 'Encaje', 'Adhesivo'] },
    { id: 'replacement_frequency', name: 'Frecuencia de reemplazo', type: 'select', options: ['1-3 meses', '3-6 meses', '6-12 meses', '1+ años'] },
    { id: 'material_upgrade', name: 'Mejora de material', type: 'tags', options: ['Sisal premium', 'Extra resistente', 'Tratamiento antibacteriano', 'Resistente a olores'] },
    { id: 'color_options', name: 'Opciones de color', type: 'tags', options: ['Natural', 'Marrón', 'Gris', 'Beige', 'Múltiples colores'] }
  ],

  // Arena higiénica para gatos
  'pets-products-arena-higienica-gatos': [
    { id: 'litter_material', name: 'Material de arena', type: 'select', options: ['Arcilla bentonita', 'Sílice gel', 'Madera', 'Papel reciclado', 'Maíz', 'Trigo', 'Tofu'] },
    { id: 'clumping_ability', name: 'Capacidad aglomerante', type: 'select', options: ['Aglomerante', 'No aglomerante', 'Super aglomerante', 'Aglomerante natural'] },
    { id: 'odor_control', name: 'Control de olores', type: 'select', options: ['Básico', 'Avanzado', 'Máximo', 'Natural', 'Con fragancia'] },
    { id: 'dust_level', name: 'Nivel de polvo', type: 'select', options: ['Sin polvo', 'Bajo polvo', 'Polvo mínimo', 'Estándar'] },
    { id: 'package_size', name: 'Tamaño del paquete', type: 'select', options: ['3-5kg', '5-10kg', '10-15kg', '15kg+', 'Bolsas individuales'] },
    { id: 'flushable', name: 'Biodegradable', type: 'select', options: ['Sí', 'No', 'Parcialmente', 'Compostable'] },
    { id: 'tracking_resistance', name: 'Resistencia al seguimiento', type: 'select', options: ['Básica', 'Mejorada', 'Máxima', 'Anti-tracking'] },
    { id: 'multiple_cats', name: 'Para múltiples gatos', type: 'select', options: ['1 gato', '2-3 gatos', '4+ gatos', 'Hogar multi-gato'] }
  ],

  // Juguetes para gatos
  'pets-products-juguetes-gatos': [
    { id: 'toy_category', name: 'Categoría de juguete', type: 'select', options: ['Caza/Persecución', 'Inteligencia/Puzzle', 'Ejercicio', 'Comfort/Relajación', 'Interactivo', 'Solitario'] },
    { id: 'play_style', name: 'Estilo de juego', type: 'tags', options: ['Cazar', 'Perseguir', 'Saltar', 'Morder', 'Arañar', 'Resolver problemas'] },
    { id: 'material_safety', name: 'Seguridad del material', type: 'tags', options: ['No tóxico', 'Fibras naturales', 'Sin piezas pequeñas', 'Resistente a mordidas', 'Lavable'] },
    { id: 'battery_required', name: 'Requiere batería', type: 'select', options: ['No', 'Sí - AA', 'Sí - AAA', 'Recargable', 'USB'] },
    { id: 'supervision_needed', name: 'Supervisión necesaria', type: 'select', options: ['No necesaria', 'Recomendada', 'Siempre', 'Solo inicial'] },
    { id: 'age_suitability', name: 'Edad apropiada', type: 'select', options: ['Gatitos', 'Adultos jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'activity_level', name: 'Nivel de actividad', type: 'select', options: ['Bajo', 'Moderado', 'Alto', 'Muy alto'] },
    { id: 'solo_interactive', name: 'Tipo de interacción', type: 'select', options: ['Juego solitario', 'Con humanos', 'Ambos', 'Multi-gato'] }
  ],

  // Premios para gatos
  'pets-products-premios-gatos': [
    { id: 'treat_type', name: 'Tipo de premio', type: 'select', options: ['Snacks secos', 'Snacks húmedos', 'Pasta/crema', 'Sticks', 'Liofilizados', 'Funcionales'] },
    { id: 'primary_protein', name: 'Proteína principal', type: 'select', options: ['Pollo', 'Pescado', 'Ternera', 'Cordero', 'Pavo', 'Hígado', 'Múltiples'] },
    { id: 'functional_benefit', name: 'Beneficio funcional', type: 'tags', options: ['Control peso', 'Cuidado dental', 'Pelo brillante', 'Digestión', 'Urinario', 'Vitaminas', 'Sin beneficio específico'] },
    { id: 'treat_size', name: 'Tamaño del premio', type: 'select', options: ['Mini', 'Pequeño', 'Mediano', 'Grande', 'Variado'] },
    { id: 'training_suitable', name: 'Apto para entrenamiento', type: 'select', options: ['Sí', 'No', 'Ideal para entrenamiento', 'Ocasional'] },
    { id: 'package_format', name: 'Formato del paquete', type: 'select', options: ['Bolsa resellable', 'Tubo dispensador', 'Bandeja', 'Stick individual', 'Multipack'] },
    { id: 'texture_consistency', name: 'Textura', type: 'select', options: ['Crujiente', 'Suave', 'Cremoso', 'Masticable', 'Liofilizado'] },
    { id: 'frequency_use', name: 'Frecuencia de uso', type: 'select', options: ['Diario', 'Ocasional', 'Entrenamiento', 'Especial', 'Según necesidad'] }
  ],

  // Comida para gatos sin prescripción médica
  'pets-products-comida-gatos-sin-prescripcion': [
    { id: 'food_type_commercial', name: 'Tipo de alimento', type: 'select', options: ['Seco (pienso)', 'Húmedo (latas/sobres)', 'Semi-húmedo', 'Snacks/premios', 'Complementos'] },
    { id: 'life_stage_commercial', name: 'Etapa de vida', type: 'select', options: ['Gatito (2-12 meses)', 'Adulto (1-7 años)', 'Senior (7+ años)', 'Gestación/Lactancia', 'Todas las edades'] },
    { id: 'protein_source_commercial', name: 'Fuente de proteína', type: 'tags', options: ['Pollo', 'Salmón', 'Atún', 'Ternera', 'Cordero', 'Pavo', 'Conejo', 'Múltiples proteínas'] },
    { id: 'special_formula_commercial', name: 'Fórmula especial', type: 'tags', options: ['Indoor/Interior', 'Esterilizado', 'Control peso', 'Pelo largo', 'Sensibilidades digestivas', 'Sin cereales', 'Orgánico'] },
    { id: 'brand_category', name: 'Categoría de marca', type: 'select', options: ['Económica', 'Premium', 'Super Premium', 'Holística', 'Natural'] },
    { id: 'package_size_commercial', name: 'Tamaño del paquete', type: 'select', options: ['85g-400g', '400g-1kg', '1-3kg', '3-7kg', '7kg+'] },
    { id: 'texture_commercial', name: 'Textura', type: 'select', options: ['Croquetas pequeñas', 'Croquetas grandes', 'Paté', 'Trozos en salsa', 'Trozos en gelatina', 'Mousse'] },
    { id: 'flavor_variety', name: 'Variedad de sabores', type: 'tags', options: ['Pollo', 'Pescado', 'Ternera', 'Cordero', 'Mix de sabores', 'Sabor único'] },
    { id: 'nutritional_benefits', name: 'Beneficios nutricionales', type: 'tags', options: ['Alto en proteínas', 'Omega 3-6', 'Vitaminas añadidas', 'Minerales balanceados', 'Antioxidantes', 'Probióticos'] }
  ],

  // Comida para gatos con prescripción médica
  'pets-products-comida-gatos-con-prescripcion': [
    { id: 'therapeutic_purpose', name: 'Propósito terapéutico', type: 'select', options: ['Problemas urinarios', 'Problemas renales', 'Problemas digestivos', 'Control de peso', 'Alergias alimentarias', 'Problemas hepáticos', 'Diabetes'] },
    { id: 'veterinary_brand', name: 'Marca veterinaria', type: 'select', options: ['Hill\'s Prescription Diet', 'Royal Canin Veterinary', 'Purina Pro Plan Veterinary', 'Farmina Vet Life', 'Specific'] },
    { id: 'prescription_required', name: 'Prescripción requerida', type: 'select', options: ['Sí - Obligatoria', 'Recomendación veterinaria', 'Supervisión veterinaria'] },
    { id: 'medical_condition', name: 'Condición médica específica', type: 'tags', options: ['FLUTD', 'Insuficiencia renal', 'Cálculos urinarios', 'Obesidad', 'Diabetes mellitus', 'Enfermedad intestinal', 'Dermatitis'] },
    { id: 'diet_restriction', name: 'Restricción dietética', type: 'tags', options: ['Bajo en fósforo', 'Bajo en sodio', 'Proteína hidrolizada', 'Sin granos', 'Bajo en carbohidratos', 'Alto en fibra'] },
    { id: 'administration_period', name: 'Período de administración', type: 'select', options: ['Corto plazo (1-3 meses)', 'Medio plazo (3-6 meses)', 'Largo plazo (6+ meses)', 'De por vida'] },
    { id: 'monitoring_required', name: 'Monitoreo requerido', type: 'select', options: ['Semanal', 'Mensual', 'Trimestral', 'Semestral', 'Según indicación veterinaria'] },
    { id: 'food_transition', name: 'Transición alimentaria', type: 'select', options: ['Inmediata', 'Gradual 7 días', 'Gradual 14 días', 'Según tolerancia'] },
    { id: 'contraindications', name: 'Contraindicaciones', type: 'tags', options: ['Gestación', 'Lactancia', 'Gatitos menores 12 meses', 'Enfermedad renal avanzada', 'Consultar veterinario'] }
  ],

  // Torres y casas para gatos
  'pets-products-torres-casas-gatos': [
    { id: 'structure_type', name: 'Tipo de estructura', type: 'select', options: ['Torre vertical', 'Casa cerrada', 'Torre con casa', 'Estructura modular', 'Centro de actividades'] },
    { id: 'height_tower', name: 'Altura de la torre', type: 'select', options: ['Baja (60-100cm)', 'Media (100-150cm)', 'Alta (150-200cm)', 'Extra alta (200cm+)'] },
    { id: 'number_levels', name: 'Número de niveles', type: 'select', options: ['1-2 niveles', '3-4 niveles', '5-6 niveles', '7+ niveles'] },
    { id: 'house_features', name: 'Características de casa', type: 'tags', options: ['Cueva cerrada', 'Múltiples entradas', 'Ventanas', 'Techo removible', 'Aislamiento'] },
    { id: 'base_stability', name: 'Estabilidad de la base', type: 'select', options: ['Base estándar', 'Base reforzada', 'Base extra pesada', 'Anclaje a pared requerido'] },
    { id: 'capacity_cats', name: 'Capacidad de gatos', type: 'select', options: ['1 gato', '2 gatos', '3-4 gatos', '5+ gatos'] },
    { id: 'material_frame', name: 'Material del armazón', type: 'select', options: ['MDF', 'Madera maciza', 'Metal', 'Bambú', 'Plástico reforzado'] },
    { id: 'assembly_complexity', name: 'Complejidad de montaje', type: 'select', options: ['Sin montaje', 'Fácil (30 min)', 'Intermedio (1-2 horas)', 'Complejo (3+ horas)'] }
  ],

  // Posaderos y estantes para gatos
  'pets-products-posaderos-estantes-gatos': [
    { id: 'mounting_type', name: 'Tipo de montaje', type: 'select', options: ['Montaje en pared', 'Soporte de pie', 'Ventosa', 'Clip de mesa', 'Sistema modular'] },
    { id: 'shelf_shape', name: 'Forma del estante', type: 'select', options: ['Rectangular', 'Circular', 'Media luna', 'Escalón', 'Forma personalizada'] },
    { id: 'weight_capacity', name: 'Capacidad de peso', type: 'select', options: ['Hasta 5kg', 'Hasta 10kg', 'Hasta 15kg', 'Hasta 20kg', '20kg+'] },
    { id: 'surface_material', name: 'Material de superficie', type: 'select', options: ['Madera', 'Felpa', 'Sisal', 'Carpet', 'Memory foam', 'Bambú'] },
    { id: 'installation_hardware', name: 'Hardware de instalación', type: 'tags', options: ['Tornillos incluidos', 'Anclajes de pared', 'Nivel incluido', 'Plantilla de instalación'] },
    { id: 'height_adjustment', name: 'Ajuste de altura', type: 'select', options: ['Altura fija', 'Ajustable', 'Múltiples posiciones', 'Completamente variable'] },
    { id: 'wall_protection', name: 'Protección de pared', type: 'tags', options: ['Almohadillas protectoras', 'Distribución de peso', 'Sistemas anti-daño', 'Sin protección especial'] }
  ],

  // Rascadores y postes rascadores para gatos
  'pets-products-rascadores-postes-gatos': [
    { id: 'scratcher_style', name: 'Estilo de rascador', type: 'select', options: ['Poste vertical', 'Tabla horizontal', 'Esquinero', 'Curvo/ondulado', 'Multi-ángulo'] },
    { id: 'scratching_material', name: 'Material para rascar', type: 'select', options: ['Sisal natural', 'Sisal sintético', 'Cartón corrugado', 'Carpet', 'Madera', 'Bambú'] },
    { id: 'post_height', name: 'Altura del poste', type: 'select', options: ['Bajo (30-50cm)', 'Medio (50-80cm)', 'Alto (80-120cm)', 'Extra alto (120cm+)'] },
    { id: 'base_design', name: 'Diseño de la base', type: 'select', options: ['Base circular', 'Base cuadrada', 'Base pesada', 'Sin base (montaje)', 'Base decorativa'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Uso extremo'] },
    { id: 'replacement_parts', name: 'Partes reemplazables', type: 'tags', options: ['Sisal reemplazable', 'Secciones intercambiables', 'Cartón recambiable', 'Sin repuestos'] },
    { id: 'additional_features', name: 'Características adicionales', type: 'tags', options: ['Juguetes incluidos', 'Área de descanso', 'Compartimento de almacenamiento', 'Solo rascar'] }
  ],

  // Escalones y rampas para gatos
  'pets-products-escalones-rampas-gatos': [
    { id: 'mobility_aid_type', name: 'Tipo de ayuda de movilidad', type: 'select', options: ['Escalones graduales', 'Rampa inclinada', 'Escalera con peldaños', 'Sistema combinado'] },
    { id: 'target_height', name: 'Altura objetivo', type: 'select', options: ['Cama (40-60cm)', 'Sofá (60-80cm)', 'Cama alta (80-120cm)', 'Personalizable'] },
    { id: 'step_number', name: 'Número de escalones', type: 'select', options: ['2 escalones', '3 escalones', '4 escalones', '5+ escalones'] },
    { id: 'surface_grip', name: 'Agarre de superficie', type: 'select', options: ['Superficie lisa', 'Antideslizante', 'Carpet', 'Texturizada', 'Grip máximo'] },
    { id: 'weight_support', name: 'Soporte de peso', type: 'select', options: ['Hasta 5kg', 'Hasta 10kg', 'Hasta 15kg', 'Hasta 20kg'] },
    { id: 'foldable', name: 'Plegable', type: 'select', options: ['No plegable', 'Parcialmente plegable', 'Completamente plegable', 'Telescópico'] },
    { id: 'special_needs', name: 'Necesidades especiales', type: 'tags', options: ['Gatos seniors', 'Problemas articulares', 'Post-cirugía', 'Sobrepeso', 'Uso general'] }
  ],

  // Árboles y torres para gatos
  'pets-products-arboles-torres-gatos': [
    { id: 'tree_complexity', name: 'Complejidad del árbol', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado', 'Profesional'] },
    { id: 'activity_zones', name: 'Zonas de actividad', type: 'tags', options: ['Áreas para rascar', 'Plataformas de descanso', 'Cuevas/casas', 'Juguetes colgantes', 'Hamacas', 'Túneles'] },
    { id: 'tree_height_category', name: 'Categoría de altura', type: 'select', options: ['Compacto (100-150cm)', 'Estándar (150-200cm)', 'Alto (200-250cm)', 'Gigante (250cm+)'] },
    { id: 'branch_configuration', name: 'Configuración de ramas', type: 'select', options: ['Simétrica', 'Asimétrica', 'Espiral', 'Multi-nivel', 'Personalizable'] },
    { id: 'stability_system', name: 'Sistema de estabilidad', type: 'select', options: ['Base pesada', 'Anclaje superior', 'Doble anclaje', 'Sistema híbrido'] },
    { id: 'cat_capacity_tree', name: 'Capacidad de gatos simultáneos', type: 'select', options: ['1-2 gatos', '3-4 gatos', '5-6 gatos', '7+ gatos'] },
    { id: 'design_theme', name: 'Tema de diseño', type: 'select', options: ['Natural', 'Moderno', 'Rústico', 'Minimalista', 'Decorativo'] }
  ],

  // Camas y posaderos para ventanas para gatos
  'pets-products-camas-posaderos-ventanas-gatos': [
    { id: 'window_attachment', name: 'Sistema de sujeción a ventana', type: 'select', options: ['Ventosas', 'Clips ajustables', 'Tornillos', 'Presión', 'Sistema universal'] },
    { id: 'window_type_compatibility', name: 'Compatibilidad de ventana', type: 'tags', options: ['Ventanas corredizas', 'Ventanas batientes', 'Ventanas fijas', 'Puertas cristal', 'Universal'] },
    { id: 'bed_style_window', name: 'Estilo de cama', type: 'select', options: ['Hamaca', 'Plataforma rígida', 'Cojín acolchado', 'Cueva/túnel', 'Multi-nivel'] },
    { id: 'weight_limit_window', name: 'Límite de peso', type: 'select', options: ['Hasta 5kg', 'Hasta 8kg', 'Hasta 12kg', 'Hasta 15kg'] },
    { id: 'cushion_material', name: 'Material del cojín', type: 'select', options: ['Felpa', 'Memory foam', 'Fibra sintética', 'Gel refrescante', 'Materiales naturales'] },
    { id: 'sun_protection', name: 'Protección solar', type: 'tags', options: ['Material UV resistente', 'Toldo incluido', 'Posición ajustable', 'Sin protección especial'] },
    { id: 'installation_difficulty', name: 'Dificultad de instalación', type: 'select', options: ['Muy fácil', 'Fácil', 'Intermedio', 'Requiere herramientas'] }
  ],

  // Casas para gatos al aire libre
  'pets-products-casas-gatos-aire-libre': [
    { id: 'outdoor_construction', name: 'Construcción para exterior', type: 'select', options: ['Madera tratada', 'Plástico resistente', 'Metal galvanizado', 'Materiales compuestos'] },
    { id: 'weather_resistance', name: 'Resistencia climática', type: 'tags', options: ['Impermeable', 'Resistente UV', 'Anti-heladas', 'Resistente viento', 'Todo clima'] },
    { id: 'insulation_type', name: 'Tipo de aislamiento', type: 'select', options: ['Sin aislamiento', 'Aislamiento básico', 'Aislamiento térmico', 'Aislamiento premium'] },
    { id: 'roof_design', name: 'Diseño del techo', type: 'select', options: ['Techo plano', 'Techo inclinado', 'Techo tipo casa', 'Techo removible'] },
    { id: 'ventilation_system', name: 'Sistema de ventilación', type: 'select', options: ['Ventilación natural', 'Rejillas ajustables', 'Sistema cruzado', 'Ventilación avanzada'] },
    { id: 'entrance_type', name: 'Tipo de entrada', type: 'select', options: ['Entrada abierta', 'Puerta con bisagras', 'Entrada múltiple', 'Sistema de túnel'] },
    { id: 'foundation_type', name: 'Tipo de fundación', type: 'select', options: ['Base elevada', 'Base al suelo', 'Patas ajustables', 'Sistema modular'] },
    { id: 'maintenance_requirements', name: 'Requerimientos de mantenimiento', type: 'select', options: ['Bajo mantenimiento', 'Mantenimiento ocasional', 'Mantenimiento regular', 'Mantenimiento intensivo'] }
  ],

  // Forros para cajones de gatos
  'pets-products-forros-cajones-gatos': [
    { id: 'liner_material', name: 'Material del forro', type: 'select', options: ['Plástico estándar', 'Plástico biodegradable', 'Papel reciclado', 'Material compostable', 'Plástico reforzado'] },
    { id: 'liner_thickness', name: 'Grosor del forro', type: 'select', options: ['Fino (0.5-1 mil)', 'Estándar (1-2 mil)', 'Grueso (2-3 mil)', 'Extra grueso (3+ mil)'] },
    { id: 'litter_box_size', name: 'Tamaño de caja compatible', type: 'select', options: ['Pequeña (30x20cm)', 'Mediana (40x30cm)', 'Grande (50x35cm)', 'Extra grande (60x40cm)', 'Universal'] },
    { id: 'liner_style', name: 'Estilo de forro', type: 'select', options: ['Bolsa simple', 'Con elástico', 'Auto-ajustable', 'Con solapas', 'Forma moldeada'] },
    { id: 'ease_of_removal', name: 'Facilidad de remoción', type: 'select', options: ['Básica', 'Fácil remoción', 'Sistema de cordón', 'Auto-sellable', 'Remoción rápida'] },
    { id: 'odor_barrier', name: 'Barrera de olores', type: 'select', options: ['Sin barrera', 'Barrera básica', 'Barrera avanzada', 'Tecnología anti-olores'] },
    { id: 'package_quantity', name: 'Cantidad por paquete', type: 'select', options: ['5-10 forros', '10-20 forros', '20-50 forros', '50+ forros'] },
    { id: 'leak_protection', name: 'Protección contra fugas', type: 'select', options: ['Básica', 'Mejorada', 'Prueba de fugas', 'Garantía anti-fugas'] }
  ],

  // Alfombrillas para cajones de gatos
  'pets-products-alfombrillas-cajones-gatos': [
    { id: 'mat_purpose', name: 'Propósito de la alfombrilla', type: 'select', options: ['Control de arena', 'Protección de suelo', 'Anti-bacterial', 'Decorativa', 'Multi-propósito'] },
    { id: 'mat_material', name: 'Material de la alfombrilla', type: 'select', options: ['PVC', 'Silicona', 'Goma', 'Microfibre', 'Bambú', 'Plástico reciclado'] },
    { id: 'texture_surface', name: 'Textura de superficie', type: 'select', options: ['Lisa', 'Texturizada', 'Con ranuras', 'Tipo rejilla', 'Panal de abeja'] },
    { id: 'mat_size', name: 'Tamaño de alfombrilla', type: 'select', options: ['Pequeña (40x30cm)', 'Mediana (60x40cm)', 'Grande (80x60cm)', 'Extra grande (100x70cm)'] },
    { id: 'litter_trapping', name: 'Capacidad de captura', type: 'select', options: ['Básica', 'Buena', 'Excelente', 'Máxima captura'] },
    { id: 'easy_cleaning', name: 'Facilidad de limpieza', type: 'select', options: ['Aspirar solamente', 'Sacudir', 'Lavable a mano', 'Lavable en máquina'] },
    { id: 'non_slip_backing', name: 'Base antideslizante', type: 'select', options: ['Sin base especial', 'Base de goma', 'Base antideslizante', 'Sistema de agarre'] },
    { id: 'waterproof', name: 'Impermeable', type: 'select', options: ['No impermeable', 'Resistente al agua', 'Impermeable', 'Completamente sellado'] }
  ],

  // Cajones de arena higiénica para gatos
  'pets-products-cajones-arena-gatos': [
    { id: 'litter_box_type', name: 'Tipo de caja de arena', type: 'select', options: ['Abierta básica', 'Con tapa', 'Auto-limpiante', 'Con puerta', 'Sistema modular'] },
    { id: 'box_size', name: 'Tamaño de la caja', type: 'select', options: ['Pequeña (40x30x15cm)', 'Mediana (50x35x15cm)', 'Grande (60x40x20cm)', 'Extra grande (70x50x20cm)'] },
    { id: 'entry_style', name: 'Estilo de entrada', type: 'select', options: ['Entrada baja', 'Entrada alta', 'Rampa de acceso', 'Entrada superior', 'Múltiples entradas'] },
    { id: 'hood_type', name: 'Tipo de tapa/capucha', type: 'select', options: ['Sin tapa', 'Tapa removible', 'Tapa con bisagras', 'Tapa con filtro', 'Sistema de ventilación'] },
    { id: 'cleaning_features', name: 'Características de limpieza', type: 'tags', options: ['Superficie lisa', 'Esquinas redondeadas', 'Base desmontable', 'Sistema de drenaje', 'Anti-adherente'] },
    { id: 'odor_control_system', name: 'Sistema de control de olores', type: 'select', options: ['Sin sistema', 'Filtro de carbón', 'Sistema de ventilación', 'Tecnología anti-olores', 'Filtros reemplazables'] },
    { id: 'privacy_level', name: 'Nivel de privacidad', type: 'select', options: ['Completamente abierta', 'Semi-privada', 'Privada', 'Completamente cerrada'] },
    { id: 'special_features', name: 'Características especiales', type: 'tags', options: ['Auto-limpiante', 'Sensor de movimiento', 'Contador de usos', 'App conectada', 'Sistema de pesaje'] },
    { id: 'age_suitability', name: 'Adecuación por edad', type: 'tags', options: ['Gatitos', 'Adultos', 'Seniors', 'Gatos con movilidad reducida', 'Todas las edades'] }
  ],

  // Pelotas y juegos de caza
  'pets-products-pelotas-juegos-caza-gatos': [
    { id: 'ball_type', name: 'Tipo de pelota', type: 'select', options: ['Pelota sólida', 'Pelota con cascabel', 'Pelota luminosa', 'Pelota motorizada', 'Pelota puzzle'] },
    { id: 'ball_material', name: 'Material de la pelota', type: 'select', options: ['Plástico', 'Goma', 'Foam', 'Sisal', 'Plumas', 'Materiales naturales'] },
    { id: 'ball_size', name: 'Tamaño de pelota', type: 'select', options: ['Mini (1-2cm)', 'Pequeña (2-3cm)', 'Mediana (3-4cm)', 'Grande (4cm+)'] },
    { id: 'hunting_simulation', name: 'Simulación de caza', type: 'tags', options: ['Movimiento errático', 'Sonidos de presa', 'Textura realista', 'Velocidad variable', 'Esconderse'] },
    { id: 'interactive_features', name: 'Características interactivas', type: 'tags', options: ['Auto-movimiento', 'Respuesta al tacto', 'Luces', 'Sonidos', 'Sin características especiales'] },
    { id: 'battery_operated', name: 'Funciona con batería', type: 'select', options: ['No', 'Sí - AA', 'Sí - AAA', 'Recargable USB', 'Energía solar'] },
    { id: 'hunting_instinct_level', name: 'Nivel de instinto de caza', type: 'select', options: ['Bajo', 'Moderado', 'Alto', 'Extremo'] }
  ],

  // Peluches y juguetes con relleno
  'pets-products-peluches-relleno-gatos': [
    { id: 'plush_type', name: 'Tipo de peluche', type: 'select', options: ['Animal realista', 'Forma abstracta', 'Juguete temático', 'Almohada', 'Personaje'] },
    { id: 'filling_material', name: 'Material de relleno', type: 'select', options: ['Fibra sintética', 'Hierba gatera', 'Valeriana', 'Papel crujiente', 'Cascabeles'] },
    { id: 'outer_fabric', name: 'Tela exterior', type: 'select', options: ['Felpa suave', 'Tela rugosa', 'Pelo sintético', 'Lana', 'Algodón orgánico'] },
    { id: 'size_plush', name: 'Tamaño del peluche', type: 'select', options: ['Mini (5-8cm)', 'Pequeño (8-15cm)', 'Mediano (15-25cm)', 'Grande (25cm+)'] },
    { id: 'catnip_content', name: 'Contenido de hierba gatera', type: 'select', options: ['Sin hierba gatera', 'Hierba gatera ligera', 'Hierba gatera intensa', 'Hierba gatera recargable'] },
    { id: 'washable', name: 'Lavable', type: 'select', options: ['No lavable', 'Lavado a mano', 'Lavable en máquina', 'Solo superficie'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Sin piezas pequeñas', 'Costuras reforzadas', 'Materiales no tóxicos', 'Ojos bordados'] }
  ],

  // Túneles
  'pets-products-tuneles-gatos': [
    { id: 'tunnel_structure', name: 'Estructura del túnel', type: 'select', options: ['Túnel recto', 'Túnel curvo', 'Túnel en Y', 'Túnel en T', 'Sistema modular'] },
    { id: 'tunnel_material', name: 'Material del túnel', type: 'select', options: ['Nylon', 'Poliéster', 'Papel crujiente', 'Sisal', 'Materiales mixtos'] },
    { id: 'tunnel_length', name: 'Longitud del túnel', type: 'select', options: ['Corto (30-50cm)', 'Mediano (50-80cm)', 'Largo (80-120cm)', 'Extra largo (120cm+)'] },
    { id: 'tunnel_diameter', name: 'Diámetro del túnel', type: 'select', options: ['Estrecho (20cm)', 'Estándar (25cm)', 'Amplio (30cm)', 'Extra amplio (35cm+)'] },
    { id: 'collapsible', name: 'Plegable', type: 'select', options: ['No plegable', 'Parcialmente plegable', 'Completamente plegable', 'Auto-desplegable'] },
    { id: 'openings', name: 'Aberturas', type: 'select', options: ['2 aberturas', '3 aberturas', '4+ aberturas', 'Aberturas laterales'] },
    { id: 'crinkle_sound', name: 'Sonido crujiente', type: 'select', options: ['Sin sonido', 'Sonido ligero', 'Sonido intenso', 'Sonido ajustable'] },
    { id: 'additional_features', name: 'Características adicionales', type: 'tags', options: ['Juguetes colgantes', 'Pelotas incluidas', 'Bolsillos', 'Ventanas', 'Sin extras'] }
  ],

  // Varitas
  'pets-products-varitas-gatos': [
    { id: 'wand_length', name: 'Longitud de la varita', type: 'select', options: ['Corta (20-30cm)', 'Mediana (30-50cm)', 'Larga (50-80cm)', 'Extra larga (80cm+)'] },
    { id: 'wand_material', name: 'Material de la varita', type: 'select', options: ['Plástico', 'Madera', 'Fibra de carbono', 'Metal', 'Materiales mixtos'] },
    { id: 'attachment_type', name: 'Tipo de accesorio', type: 'select', options: ['Plumas', 'Cordón con juguete', 'Ratón de tela', 'Múltiples accesorios', 'Intercambiable'] },
    { id: 'string_length', name: 'Longitud del cordón', type: 'select', options: ['Corto (30cm)', 'Mediano (50cm)', 'Largo (80cm)', 'Extra largo (100cm+)'] },
    { id: 'wand_grip', name: 'Agarre de la varita', type: 'select', options: ['Liso', 'Texturizado', 'Acolchado', 'Ergonómico', 'Antideslizante'] },
    { id: 'retractable', name: 'Retráctil', type: 'select', options: ['No retráctil', 'Telescópica', 'Cordón retráctil', 'Completamente plegable'] },
    { id: 'replacement_parts', name: 'Partes de repuesto', type: 'select', options: ['No disponibles', 'Accesorios intercambiables', 'Kit de repuestos', 'Accesorios por separado'] }
  ],

  // Juguetes con hierba gatera
  'pets-products-juguetes-hierba-gatera': [
    { id: 'catnip_form', name: 'Forma de hierba gatera', type: 'select', options: ['Hierba seca', 'Aceite concentrado', 'Spray', 'Gel', 'Polvo'] },
    { id: 'catnip_intensity', name: 'Intensidad de hierba gatera', type: 'select', options: ['Suave', 'Moderada', 'Intensa', 'Extra fuerte'] },
    { id: 'catnip_freshness', name: 'Frescura', type: 'select', options: ['Sellado hermético', 'Recargable', 'Una sola vez', 'Duración extendida'] },
    { id: 'toy_base', name: 'Base del juguete', type: 'select', options: ['Peluche', 'Pelota', 'Ratón', 'Bolsita', 'Juguete sólido'] },
    { id: 'catnip_source', name: 'Origen de hierba gatera', type: 'select', options: ['Hierba gatera tradicional', 'Valeriana', 'Madreselva', 'Mix de hierbas', 'Hierba gatera orgánica'] },
    { id: 'effect_duration', name: 'Duración del efecto', type: 'select', options: ['5-10 minutos', '10-15 minutos', '15-20 minutos', 'Variable por gato'] },
    { id: 'refillable', name: 'Recargable', type: 'select', options: ['No recargable', 'Recargable con kit', 'Fácil recarga', 'Sistema de reemplazo'] }
  ],

  // Juguetes para masticar
  'pets-products-juguetes-masticar-gatos': [
    { id: 'chew_material', name: 'Material para masticar', type: 'select', options: ['Goma natural', 'Goma sintética', 'Nylon', 'Madera', 'Materiales naturales'] },
    { id: 'chew_texture', name: 'Textura para masticar', type: 'select', options: ['Lisa', 'Rugosa', 'Con crestas', 'Múltiples texturas', 'Suave'] },
    { id: 'dental_benefits', name: 'Beneficios dentales', type: 'tags', options: ['Limpieza de dientes', 'Masaje de encías', 'Reducción de sarro', 'Fortalecimiento', 'Sin beneficios específicos'] },
    { id: 'flavoring', name: 'Saborización', type: 'select', options: ['Sin sabor', 'Sabor a pollo', 'Sabor a pescado', 'Hierba gatera', 'Sabores naturales'] },
    { id: 'hardness_level', name: 'Nivel de dureza', type: 'select', options: ['Muy suave', 'Suave', 'Medio', 'Duro', 'Extra duro'] },
    { id: 'age_appropriate', name: 'Apropiado por edad', type: 'select', options: ['Solo gatitos', 'Gatos jóvenes', 'Todas las edades', 'Gatos adultos', 'Gatos seniors'] },
    { id: 'digestible', name: 'Digestible', type: 'select', options: ['Completamente digestible', 'Parcialmente digestible', 'No digestible', 'Solo supervisado'] }
  ],

  // Plumas y cañas
  'pets-products-plumas-canas-gatos': [
    { id: 'feather_type', name: 'Tipo de pluma', type: 'select', options: ['Plumas naturales', 'Plumas sintéticas', 'Mix de plumas', 'Plumas coloridas', 'Plumas con brillo'] },
    { id: 'rod_material', name: 'Material de la caña', type: 'select', options: ['Bambú', 'Plástico', 'Madera', 'Fibra de vidrio', 'Metal flexible'] },
    { id: 'rod_length', name: 'Longitud de la caña', type: 'select', options: ['Corta (15-25cm)', 'Mediana (25-40cm)', 'Larga (40-60cm)', 'Extra larga (60cm+)'] },
    { id: 'attachment_method', name: 'Método de sujeción', type: 'select', options: ['Atado directo', 'Con clip', 'Magnético', 'Enroscado', 'Intercambiable'] },
    { id: 'feather_movement', name: 'Movimiento de plumas', type: 'select', options: ['Estático', 'Oscilación suave', 'Movimiento errático', 'Rotación', 'Múltiples patrones'] },
    { id: 'additional_elements', name: 'Elementos adicionales', type: 'tags', options: ['Cascabeles', 'Cintas', 'Cuentas', 'Lentejuelas', 'Solo plumas'] },
    { id: 'natural_vs_synthetic', name: 'Natural vs Sintético', type: 'select', options: ['100% natural', 'Mayormente natural', '50/50', 'Mayormente sintético', '100% sintético'] }
  ],

  // Juguetes interactivos
  'pets-products-juguetes-interactivos-gatos': [
    { id: 'interaction_type', name: 'Tipo de interacción', type: 'select', options: ['Sensor de movimiento', 'Activado por tacto', 'Control remoto', 'Programable', 'IA adaptativa'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Batería AA', 'Batería AAA', 'Recargable USB', 'Adaptador AC', 'Solar'] },
    { id: 'interactive_features', name: 'Características interactivas', type: 'tags', options: ['Luces LED', 'Sonidos', 'Movimiento', 'Dispensador de premios', 'Juegos múltiples'] },
    { id: 'difficulty_levels', name: 'Niveles de dificultad', type: 'select', options: ['Nivel único', '2 niveles', '3 niveles', 'Múltiples niveles', 'Adaptativo'] },
    { id: 'auto_shutoff', name: 'Apagado automático', type: 'select', options: ['Sin auto-apagado', '5 minutos', '10 minutos', '15 minutos', 'Configurable'] },
    { id: 'app_connectivity', name: 'Conectividad de app', type: 'select', options: ['Sin app', 'App básica', 'App avanzada', 'Control total por app', 'Monitoreo remoto'] },
    { id: 'learning_capability', name: 'Capacidad de aprendizaje', type: 'select', options: ['Sin aprendizaje', 'Patrones básicos', 'Adaptación moderada', 'IA avanzada'] }
  ],

  // Juguetes láser
  'pets-products-juguetes-laser-gatos': [
    { id: 'laser_type', name: 'Tipo de láser', type: 'select', options: ['Láser manual', 'Láser automático', 'Láser proyector', 'Láser con patrones', 'Láser interactivo'] },
    { id: 'laser_color', name: 'Color del láser', type: 'select', options: ['Rojo', 'Verde', 'Azul', 'Multicolor', 'Infrarrojo'] },
    { id: 'laser_power', name: 'Potencia del láser', type: 'select', options: ['Clase 1 (seguro)', 'Clase 2 (baja potencia)', 'Ajustable', 'Ultra bajo'] },
    { id: 'pattern_modes', name: 'Modos de patrón', type: 'select', options: ['Punto simple', 'Patrones fijos', 'Patrones aleatorios', 'Patrones programables', 'IA predictiva'] },
    { id: 'range_distance', name: 'Distancia de alcance', type: 'select', options: ['Corto (1-3m)', 'Medio (3-8m)', 'Largo (8-15m)', 'Extra largo (15m+)'] },
    { id: 'timer_function', name: 'Función de temporizador', type: 'select', options: ['Sin temporizador', 'Temporizador fijo', 'Temporizador ajustable', 'Múltiples temporizadores'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Auto-apagado', 'Potencia limitada', 'Sensor de obstáculos', 'Certificación de seguridad'] },
    { id: 'mounting_options', name: 'Opciones de montaje', type: 'tags', options: ['Portátil', 'Base estable', 'Montaje en pared', 'Techo', 'Múltiples posiciones'] }
  ],

  // Juguetes dispensadores de golosinas y rompecabezas
  'pets-products-dispensadores-golosinas-rompecabezas-gatos': [
    { id: 'puzzle_difficulty', name: 'Dificultad del rompecabezas', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Ajustable'] },
    { id: 'treat_capacity', name: 'Capacidad de golosinas', type: 'select', options: ['Pequeña (10-25ml)', 'Mediana (25-50ml)', 'Grande (50-100ml)', 'Extra grande (100ml+)'] },
    { id: 'dispensing_mechanism', name: 'Mecanismo de dispensado', type: 'select', options: ['Rodar', 'Empujar', 'Girar', 'Levantar', 'Múltiples acciones'] },
    { id: 'puzzle_type', name: 'Tipo de rompecabezas', type: 'select', options: ['Laberinto', 'Deslizadores', 'Giratorio', 'Apilable', 'Forrajeo'] },
    { id: 'material_construction', name: 'Material de construcción', type: 'select', options: ['Plástico duro', 'Madera', 'Cartón reciclado', 'Materiales mixtos', 'Eco-friendly'] },
    { id: 'cleaning_ease', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Lavavajillas', 'Auto-limpiante'] },
    { id: 'treat_size_compatibility', name: 'Compatibilidad de tamaño', type: 'select', options: ['Solo pequeños', 'Pequeños y medianos', 'Todos los tamaños', 'Ajustable'] },
    { id: 'mental_stimulation', name: 'Estimulación mental', type: 'select', options: ['Baja', 'Moderada', 'Alta', 'Extrema', 'Progresiva'] }
  ],

  // Juguetes chillones
  'pets-products-juguetes-chillones-gatos': [
    { id: 'sound_type', name: 'Tipo de sonido', type: 'select', options: ['Chillido agudo', 'Sonido grave', 'Múltiples tonos', 'Sonidos naturales', 'Sonidos electrónicos'] },
    { id: 'sound_activation', name: 'Activación del sonido', type: 'select', options: ['Presión', 'Movimiento', 'Mordida', 'Tacto ligero', 'Múltiples formas'] },
    { id: 'volume_level', name: 'Nivel de volumen', type: 'select', options: ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Ajustable'] },
    { id: 'sound_mechanism', name: 'Mecanismo de sonido', type: 'select', options: ['Squeaker tradicional', 'Electrónico', 'Papel crujiente', 'Cascabel interno', 'Híbrido'] },
    { id: 'durability_sound', name: 'Durabilidad del sonido', type: 'select', options: ['Temporal', 'Moderada', 'Duradera', 'Garantizada', 'Reemplazable'] },
    { id: 'toy_shape', name: 'Forma del juguete', type: 'select', options: ['Ratón', 'Pájaro', 'Pez', 'Forma abstracta', 'Múltiples formas'] },
    { id: 'size_squeaky', name: 'Tamaño del juguete', type: 'select', options: ['Mini (3-5cm)', 'Pequeño (5-8cm)', 'Mediano (8-12cm)', 'Grande (12cm+)'] },
    { id: 'safety_design', name: 'Diseño de seguridad', type: 'tags', options: ['Squeaker protegido', 'Sin piezas removibles', 'Material no tóxico', 'Costuras reforzadas'] }
  ],

  // Puertas para animales domésticos (categoría general)
  'pets-products-puertas-animales': [
    { id: 'door_type', name: 'Tipo de puerta', type: 'select', options: ['Manual', 'Automática', 'Electrónica', 'Magnética', 'Con sensor'] },
    { id: 'size_category', name: 'Categoría de tamaño', type: 'select', options: ['Extra pequeña', 'Pequeña', 'Mediana', 'Grande', 'Extra grande'] },
    { id: 'installation_surface', name: 'Superficie de instalación', type: 'select', options: ['Puerta de madera', 'Puerta de metal', 'Pared', 'Vidrio', 'Universal'] },
    { id: 'weather_sealing', name: 'Sellado climático', type: 'select', options: ['Básico', 'Mejorado', 'Completo', 'Profesional'] }
  ],

  // Puertas para instalación en puerta
  'pets-products-puertas-instalacion-puerta': [
    { id: 'door_material_compatibility', name: 'Compatibilidad de material', type: 'tags', options: ['Madera', 'Metal', 'PVC', 'Composite', 'Vidrio templado'] },
    { id: 'door_thickness', name: 'Grosor de puerta compatible', type: 'select', options: ['Hasta 25mm', '25-50mm', '50-75mm', '75mm+', 'Ajustable'] },
    { id: 'cutting_required', name: 'Corte requerido', type: 'select', options: ['No requiere corte', 'Corte circular', 'Corte rectangular', 'Corte personalizado'] },
    { id: 'flap_material', name: 'Material de la solapa', type: 'select', options: ['Plástico flexible', 'Plástico rígido', 'Vidrio', 'Acrílico', 'Composite'] },
    { id: 'locking_mechanism', name: 'Mecanismo de bloqueo', type: 'select', options: ['Sin bloqueo', 'Bloqueo manual', 'Bloqueo por gravedad', 'Bloqueo magnético', 'Múltiples opciones'] },
    { id: 'installation_complexity', name: 'Complejidad de instalación', type: 'select', options: ['DIY básico', 'DIY intermedio', 'Requiere herramientas', 'Instalación profesional'] },
    { id: 'reversible', name: 'Reversible', type: 'select', options: ['No reversible', 'Reversible', 'Configuración dual'] },
    { id: 'pet_size_range', name: 'Rango de tamaño de mascota', type: 'select', options: ['Hasta 7kg', '7-15kg', '15-25kg', '25-45kg', '45kg+'] }
  ],

  // Puertas automáticas electrónicas
  'pets-products-puertas-automaticas-electronicas': [
    { id: 'activation_method', name: 'Método de activación', type: 'select', options: ['Microchip', 'Collar magnético', 'Sensor de proximidad', 'Control remoto', 'App móvil'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Baterías AA', 'Baterías C/D', 'Adaptador AC', 'Dual (batería/AC)', 'Recargable'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['3-6 meses', '6-12 meses', '1-2 años', '2+ años', 'Depende del uso'] },
    { id: 'programming_options', name: 'Opciones de programación', type: 'tags', options: ['Horarios', 'Múltiples mascotas', 'Restricciones', 'Modo vacaciones', 'Configuración personalizada'] },
    { id: 'security_features', name: 'Características de seguridad', type: 'tags', options: ['Códigos únicos', 'Detección de intrusos', 'Registro de actividad', 'Bloqueo temporal', 'Alertas'] },
    { id: 'weather_resistance', name: 'Resistencia climática', type: 'select', options: ['Interior únicamente', 'Resistente a salpicaduras', 'Resistente lluvia', 'Todo clima'] },
    { id: 'smart_features', name: 'Características inteligentes', type: 'tags', options: ['Conectividad WiFi', 'Notificaciones móvil', 'Monitoreo remoto', 'Actualizaciones firmware', 'Integración domótica'] },
    { id: 'microchip_compatibility', name: 'Compatibilidad de microchip', type: 'select', options: ['ISO estándar', 'Múltiples frecuencias', 'Universal', 'Marcas específicas'] }
  ],

  // Puertas corredizas de vidrio
  'pets-products-puertas-corredizas-vidrio': [
    { id: 'glass_door_compatibility', name: 'Compatibilidad con vidrio', type: 'select', options: ['Vidrio simple', 'Vidrio doble', 'Vidrio templado', 'Todos los tipos'] },
    { id: 'installation_method_glass', name: 'Método de instalación', type: 'select', options: ['Adhesivo', 'Perforación', 'Sistema de clips', 'Montaje en marco'] },
    { id: 'glass_thickness', name: 'Grosor de vidrio', type: 'select', options: ['3-6mm', '6-10mm', '10-15mm', '15mm+', 'Ajustable'] },
    { id: 'sealing_system', name: 'Sistema de sellado', type: 'select', options: ['Sellos básicos', 'Sellos avanzados', 'Sistema hermético', 'Resistente intemperie'] },
    { id: 'sliding_mechanism', name: 'Mecanismo deslizante', type: 'select', options: ['Manual suave', 'Asistido', 'Automático', 'Bidireccional'] },
    { id: 'safety_glass', name: 'Vidrio de seguridad', type: 'select', options: ['No requerido', 'Recomendado', 'Incluido', 'Templado incluido'] },
    { id: 'track_system', name: 'Sistema de rieles', type: 'select', options: ['Rieles básicos', 'Rieles silenciosos', 'Sistema premium', 'Auto-lubricante'] }
  ],

  // Puertas montadas en la pared
  'pets-products-puertas-montadas-pared': [
    { id: 'wall_material', name: 'Material de pared', type: 'tags', options: ['Drywall', 'Ladrillo', 'Concreto', 'Madera', 'Bloques'] },
    { id: 'wall_thickness_range', name: 'Grosor de pared', type: 'select', options: ['5-10cm', '10-20cm', '20-30cm', '30cm+', 'Variable'] },
    { id: 'mounting_hardware', name: 'Hardware de montaje', type: 'tags', options: ['Tornillos incluidos', 'Anclajes de pared', 'Marco reforzado', 'Kit completo instalación'] },
    { id: 'opening_size', name: 'Tamaño de abertura', type: 'select', options: ['Pequeña (20x25cm)', 'Mediana (25x30cm)', 'Grande (30x35cm)', 'Extra grande (35x40cm)'] },
    { id: 'insulation_features', name: 'Características de aislamiento', type: 'tags', options: ['Aislamiento térmico', 'Aislamiento acústico', 'Sellos perimetrales', 'Espuma expandible'] },
    { id: 'structural_support', name: 'Soporte estructural', type: 'select', options: ['Básico', 'Reforzado', 'Profesional', 'Ingenieril'] },
    { id: 'access_control', name: 'Control de acceso', type: 'select', options: ['Acceso libre', 'Una dirección', 'Bloqueable', 'Programable'] }
  ],

  // Puertas montadas en ventanas
  'pets-products-puertas-montadas-ventanas': [
    { id: 'window_type_compatibility', name: 'Compatibilidad de ventana', type: 'tags', options: ['Ventana corrediza', 'Ventana batiente', 'Ventana fija', 'Guillotina', 'Universal'] },
    { id: 'window_frame_material', name: 'Material del marco', type: 'tags', options: ['Aluminio', 'Madera', 'PVC', 'Acero', 'Universal'] },
    { id: 'installation_hardware_window', name: 'Hardware de instalación', type: 'tags', options: ['Clips ajustables', 'Tornillos autoroscantes', 'Sistema de presión', 'Adhesivos especiales'] },
    { id: 'window_size_range', name: 'Rango de tamaño de ventana', type: 'select', options: ['Pequeña (hasta 60cm)', 'Mediana (60-100cm)', 'Grande (100-150cm)', 'Extra grande (150cm+)'] },
    { id: 'panel_replacement', name: 'Reemplazo de panel', type: 'select', options: ['Panel permanente', 'Panel removible', 'Panel estacional', 'Sistema modular'] },
    { id: 'ventilation_impact', name: 'Impacto en ventilación', type: 'select', options: ['Sin impacto', 'Impacto mínimo', 'Ventilación reducida', 'Sistema de ventilación incluido'] },
    { id: 'screen_compatibility', name: 'Compatibilidad con mosquitero', type: 'select', options: ['No compatible', 'Compatible con modificación', 'Totalmente compatible', 'Mosquitero incluido'] },
    { id: 'seasonal_use', name: 'Uso estacional', type: 'select', options: ['Todo el año', 'Primavera/Verano', 'Otoño/Invierno', 'Configurable'] }
  ],

  // Lubricantes y gotas oftálmicas para mascotas (categoría general)
  'pets-products-lubricantes-gotas': [
    { id: 'product_type_ophthalmic', name: 'Tipo de producto oftálmico', type: 'select', options: ['Gotas', 'Gel', 'Pomada', 'Solución', 'Spray'] },
    { id: 'prescription_status', name: 'Estado de prescripción', type: 'select', options: ['Sin receta', 'Con receta', 'Uso veterinario', 'OTC regulado'] },
    { id: 'application_method', name: 'Método de aplicación', type: 'select', options: ['Gotero', 'Aplicador directo', 'Jeringa', 'Pulverizador', 'Manual'] },
    { id: 'pet_compatibility', name: 'Compatibilidad de mascota', type: 'tags', options: ['Perros', 'Gatos', 'Conejos', 'Aves', 'Universal'] }
  ],

  // Tratamientos de conjuntivitis
  'pets-products-tratamientos-conjuntivitis': [
    { id: 'conjunctivitis_type', name: 'Tipo de conjuntivitis', type: 'select', options: ['Bacteriana', 'Viral', 'Alérgica', 'Irritativa', 'Múltiples causas'] },
    { id: 'active_ingredient', name: 'Ingrediente activo', type: 'select', options: ['Antibiótico', 'Antihistamínico', 'Antiinflamatorio', 'Antiséptico', 'Combinado'] },
    { id: 'treatment_duration', name: 'Duración del tratamiento', type: 'select', options: ['3-5 días', '5-7 días', '7-14 días', '14+ días', 'Según síntomas'] },
    { id: 'severity_level', name: 'Nivel de severidad', type: 'select', options: ['Leve', 'Moderado', 'Severo', 'Todos los niveles'] },
    { id: 'veterinary_supervision', name: 'Supervisión veterinaria', type: 'select', options: ['Requerida', 'Recomendada', 'Opcional', 'No necesaria'] },
    { id: 'side_effects', name: 'Efectos secundarios', type: 'tags', options: ['Mínimos', 'Irritación temporal', 'Sensibilidad', 'Consultar veterinario'] },
    { id: 'application_frequency', name: 'Frecuencia de aplicación', type: 'select', options: ['1-2 veces/día', '2-3 veces/día', '3-4 veces/día', 'Según necesidad'] }
  ],

  // Limpiadores de ojos
  'pets-products-limpiadores-ojos': [
    { id: 'cleaning_purpose', name: 'Propósito de limpieza', type: 'tags', options: ['Higiene diaria', 'Remoción de secreciones', 'Prevención infecciones', 'Post-tratamiento', 'Uso general'] },
    { id: 'formula_type', name: 'Tipo de fórmula', type: 'select', options: ['Solución salina', 'Base agua', 'Sin alcohol', 'Hipoalergénica', 'Orgánica'] },
    { id: 'cleaning_strength', name: 'Fuerza de limpieza', type: 'select', options: ['Suave', 'Moderada', 'Profunda', 'Intensiva'] },
    { id: 'ph_balance', name: 'Balance de pH', type: 'select', options: ['Neutro', 'Ligeramente ácido', 'Balanceado', 'Oftálmico especializado'] },
    { id: 'preservative_free', name: 'Libre de conservantes', type: 'select', options: ['Sí', 'No', 'Conservantes naturales', 'Mínimos conservantes'] },
    { id: 'usage_frequency', name: 'Frecuencia de uso', type: 'select', options: ['Diario', 'Cada 2-3 días', 'Semanal', 'Según necesidad'] },
    { id: 'gentle_formula', name: 'Fórmula suave', type: 'select', options: ['Extra suave', 'Suave', 'Estándar', 'Para ojos sensibles'] }
  ],

  // Soluciones de irrigación ocular
  'pets-products-soluciones-irrigacion-ocular': [
    { id: 'irrigation_purpose', name: 'Propósito de irrigación', type: 'select', options: ['Limpieza profunda', 'Remoción de cuerpos extraños', 'Post-cirugía', 'Emergencia', 'Mantenimiento'] },
    { id: 'solution_composition', name: 'Composición de la solución', type: 'select', options: ['Solución salina estéril', 'Solución balanceada', 'Solución isotónica', 'Formulación especializada'] },
    { id: 'sterility_level', name: 'Nivel de esterilidad', type: 'select', options: ['Estéril', 'Altamente purificada', 'Grado médico', 'Estándar'] },
    { id: 'volume_size', name: 'Tamaño del volumen', type: 'select', options: ['5-10ml', '10-30ml', '30-50ml', '50ml+', 'Uso único'] },
    { id: 'delivery_system', name: 'Sistema de entrega', type: 'select', options: ['Jeringa', 'Botella presión', 'Ampolla', 'Gotero grande', 'Sistema profesional'] },
    { id: 'buffering_capacity', name: 'Capacidad tamponadora', type: 'select', options: ['Sin buffer', 'Buffer básico', 'Buffer avanzado', 'Sistema dual'] },
    { id: 'emergency_use', name: 'Uso de emergencia', type: 'select', options: ['Sí', 'No', 'Primeros auxilios', 'Solo profesional'] }
  ],

  // Lubricantes para ojos
  'pets-products-lubricantes-ojos': [
    { id: 'lubricant_consistency', name: 'Consistencia del lubricante', type: 'select', options: ['Líquido', 'Gel ligero', 'Gel espeso', 'Pomada', 'Variable'] },
    { id: 'dry_eye_severity', name: 'Severidad de ojo seco', type: 'select', options: ['Leve', 'Moderada', 'Severa', 'Todas las severidades'] },
    { id: 'protection_duration', name: 'Duración de protección', type: 'select', options: ['1-2 horas', '2-4 horas', '4-8 horas', '8+ horas'] },
    { id: 'tear_replacement', name: 'Reemplazo de lágrimas', type: 'select', options: ['Básico', 'Avanzado', 'Artificial completo', 'Suplemento natural'] },
    { id: 'viscosity_level', name: 'Nivel de viscosidad', type: 'select', options: ['Baja', 'Media', 'Alta', 'Variable según temperatura'] },
    { id: 'comfort_enhancement', name: 'Mejora del confort', type: 'tags', options: ['Alivio inmediato', 'Hidratación prolongada', 'Reducción irritación', 'Protección ambiental'] },
    { id: 'compatibility_lenses', name: 'Compatibilidad con lentes', type: 'select', options: ['No aplicable', 'Compatible', 'Específico para lentes', 'Consultar veterinario'] }
  ],

  // Colirios
  'pets-products-colirios': [
    { id: 'therapeutic_action', name: 'Acción terapéutica', type: 'select', options: ['Antiinflamatoria', 'Antibiótica', 'Antialérgica', 'Lubricante', 'Múltiple'] },
    { id: 'drop_formulation', name: 'Formulación de gotas', type: 'select', options: ['Solución acuosa', 'Suspensión', 'Emulsión', 'Gel fluido'] },
    { id: 'concentration_strength', name: 'Concentración/Fuerza', type: 'select', options: ['Baja concentración', 'Concentración estándar', 'Alta concentración', 'Variable'] },
    { id: 'onset_of_action', name: 'Inicio de acción', type: 'select', options: ['Inmediato', '5-15 minutos', '15-30 minutos', '30+ minutos'] },
    { id: 'dosing_schedule', name: 'Horario de dosificación', type: 'select', options: ['1 vez/día', '2 veces/día', '3-4 veces/día', 'Según necesidad'] },
    { id: 'storage_requirements', name: 'Requisitos de almacenamiento', type: 'select', options: ['Temperatura ambiente', 'Refrigeración', 'Proteger de luz', 'Condiciones especiales'] },
    { id: 'multi_dose_bottle', name: 'Frasco multidosis', type: 'select', options: ['Sí', 'No', 'Dosis única', 'Sistema preservativo'] }
  ],

  // Quitamanchas para lágrimas
  'pets-products-quitamanchas-lagrimas': [
    { id: 'stain_type', name: 'Tipo de mancha', type: 'tags', options: ['Manchas rojas', 'Manchas marrones', 'Decoloración', 'Acumulación', 'Todas las manchas'] },
    { id: 'removal_method', name: 'Método de remoción', type: 'select', options: ['Limpieza química', 'Enzimático', 'Natural/orgánico', 'Mecánico', 'Combinado'] },
    { id: 'application_area', name: 'Área de aplicación', type: 'tags', options: ['Área ocular', 'Pelaje facial', 'Piel sensible', 'Universal'] },
    { id: 'safety_profile', name: 'Perfil de seguridad', type: 'select', options: ['Extra seguro', 'Seguro', 'Requiere precaución', 'Solo externo'] },
    { id: 'treatment_frequency', name: 'Frecuencia de tratamiento', type: 'select', options: ['Diario', 'Cada 2-3 días', 'Semanal', 'Según necesidad'] },
    { id: 'prevention_capability', name: 'Capacidad preventiva', type: 'select', options: ['Solo limpieza', 'Prevención básica', 'Prevención avanzada', 'Tratamiento completo'] },
    { id: 'coat_compatibility', name: 'Compatibilidad de pelaje', type: 'tags', options: ['Pelo claro', 'Pelo oscuro', 'Todos los colores', 'Pelo sensible'] },
    { id: 'results_timeline', name: 'Tiempo de resultados', type: 'select', options: ['Inmediato', '1-3 días', '3-7 días', '1-2 semanas'] }
  ],

  // Kits de primeros auxilios y emergencias para mascotas (categoría general)
  'pets-products-kits-emergencias': [
    { id: 'emergency_type', name: 'Tipo de emergencia', type: 'tags', options: ['Heridas', 'Intoxicación', 'Fracturas', 'Shock', 'Emergencias respiratorias', 'Todas las emergencias'] },
    { id: 'kit_completeness', name: 'Completitud del kit', type: 'select', options: ['Básico', 'Intermedio', 'Completo', 'Profesional'] },
    { id: 'included_items_count', name: 'Número de artículos incluidos', type: 'select', options: ['5-10 artículos', '10-20 artículos', '20-40 artículos', '40+ artículos'] },
    { id: 'expiration_management', name: 'Gestión de caducidad', type: 'select', options: ['Sin caducidad', 'Fechas marcadas', 'Sistema de reemplazo', 'Recordatorios incluidos'] },
    { id: 'storage_container', name: 'Contenedor de almacenamiento', type: 'select', options: ['Bolsa blanda', 'Caja rígida', 'Maletín profesional', 'Mochila especializada'] }
  ],

  // Botiquines generales de primeros auxilios
  'pets-products-botiquines-generales': [
    { id: 'skill_level_required', name: 'Nivel de habilidad requerido', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Cualquier nivel'] },
    { id: 'instruction_manual', name: 'Manual de instrucciones', type: 'select', options: ['Incluido', 'No incluido', 'Guía básica', 'Manual detallado', 'Videos QR'] },
    { id: 'bandage_variety', name: 'Variedad de vendajes', type: 'tags', options: ['Gasas estériles', 'Vendas elásticas', 'Vendas cohesivas', 'Parches adhesivos', 'Torniquetes'] },
    { id: 'medication_included', name: 'Medicamentos incluidos', type: 'tags', options: ['Antisépticos', 'Analgésicos', 'Antihistamínicos', 'Solución salina', 'Ninguno'] },
    { id: 'tools_included', name: 'Herramientas incluidas', type: 'tags', options: ['Tijeras', 'Pinzas', 'Termómetro', 'Jeringa', 'Linterna', 'Guantes'] },
    { id: 'pet_size_coverage', name: 'Cobertura por tamaño de mascota', type: 'tags', options: ['Perros pequeños', 'Perros medianos', 'Perros grandes', 'Gatos', 'Universal'] },
    { id: 'emergency_situations', name: 'Situaciones de emergencia cubiertas', type: 'tags', options: ['Heridas menores', 'Sangrado', 'Quemaduras', 'Alergias', 'Ingestión tóxica', 'Trauma'] },
    { id: 'refill_availability', name: 'Disponibilidad de recambios', type: 'select', options: ['Recambios disponibles', 'Kit cerrado', 'Artículos individuales', 'Paquetes de reposición'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['No resistente', 'Resistente a salpicaduras', 'Impermeable', 'Completamente sellado'] },
    { id: 'organization_system', name: 'Sistema de organización', type: 'select', options: ['Compartimentos etiquetados', 'Código de colores', 'Lista de verificación', 'Sistema modular'] }
  ],

  // Kits para accidentes
  'pets-products-kits-accidentes': [
    { id: 'accident_type_focus', name: 'Enfoque en tipo de accidente', type: 'tags', options: ['Accidentes automovilísticos', 'Caídas', 'Mordeduras', 'Cortes profundos', 'Traumatismo', 'Todos los accidentes'] },
    { id: 'trauma_response', name: 'Respuesta al trauma', type: 'tags', options: ['Estabilización', 'Control de hemorragias', 'Inmovilización', 'Transporte seguro'] },
    { id: 'bleeding_control', name: 'Control de sangrado', type: 'tags', options: ['Gasas hemostáticas', 'Vendas de presión', 'Torniquetes', 'Agentes coagulantes'] },
    { id: 'immobilization_supplies', name: 'Suministros de inmovilización', type: 'tags', options: ['Férulas', 'Vendas rígidas', 'Collares cervicales', 'Camillas pequeñas'] },
    { id: 'shock_prevention', name: 'Prevención de shock', type: 'tags', options: ['Mantas térmicas', 'Fluidos orales', 'Estimulantes circulatorios', 'Monitoreo vital'] },
    { id: 'transportation_aid', name: 'Ayuda para transporte', type: 'tags', options: ['Camilla plegable', 'Manta de rescate', 'Collar estabilizador', 'Bolsa de transporte'] },
    { id: 'critical_medications', name: 'Medicamentos críticos', type: 'tags', options: ['Epinefrina', 'Corticosteroides', 'Analgésicos fuertes', 'Sedantes leves'] },
    { id: 'documentation_tools', name: 'Herramientas de documentación', type: 'tags', options: ['Formularios de incidente', 'Etiquetas de identificación', 'Marcador permanente', 'Bolsas de evidencia'] },
    { id: 'communication_devices', name: 'Dispositivos de comunicación', type: 'tags', options: ['Silbato de emergencia', 'Reflectores', 'Luces de señalización', 'Teléfonos de emergencia'] },
    { id: 'severity_assessment', name: 'Evaluación de severidad', type: 'select', options: ['Accidentes menores', 'Moderados', 'Severos', 'Todas las severidades'] }
  ],

  // Botiquines de primeros auxilios para viajes
  'pets-products-botiquines-viajes': [
    { id: 'travel_duration', name: 'Duración del viaje', type: 'select', options: ['Día completo', 'Fin de semana', 'Semana', 'Viajes largos', 'Indefinido'] },
    { id: 'transport_method', name: 'Método de transporte', type: 'tags', options: ['Automóvil', 'Avión', 'Barco', 'Camping', 'Senderismo', 'Universal'] },
    { id: 'climate_consideration', name: 'Consideración climática', type: 'tags', options: ['Climas cálidos', 'Climas fríos', 'Humedad alta', 'Altitud', 'Universal'] },
    { id: 'portable_design', name: 'Diseño portátil', type: 'select', options: ['Ultra compacto', 'Compacto', 'Tamaño estándar', 'Kit expandible'] },
    { id: 'weight_consideration', name: 'Consideración de peso', type: 'select', options: ['Ultra liviano', 'Liviano', 'Peso moderado', 'Peso no crítico'] },
    { id: 'tsa_compliance', name: 'Cumplimiento TSA/Aerolíneas', type: 'select', options: ['Totalmente compatible', 'Requiere separación', 'Solo equipaje documentado', 'No compatible'] },
    { id: 'motion_sickness', name: 'Mal de movimiento', type: 'tags', options: ['Medicamentos anti-náusea', 'Toallitas calmantes', 'Bolsas para vómito', 'No incluido'] },
    { id: 'hydration_supplies', name: 'Suministros de hidratación', type: 'tags', options: ['Electrolitos', 'Jeringas para agua', 'Tazones plegables', 'Soluciones isotónicas'] },
    { id: 'stress_relief', name: 'Alivio del estrés', type: 'tags', options: ['Feromonas calmantes', 'Manta de confort', 'Juguetes familiares', 'Música relajante'] },
    { id: 'documentation_travel', name: 'Documentación de viaje', type: 'tags', options: ['Cartilla veterinaria', 'Contactos de emergencia', 'Alergias conocidas', 'Medicamentos actuales'] },
    { id: 'international_travel', name: 'Viaje internacional', type: 'select', options: ['Compatible', 'Requiere adaptación', 'Solo nacional', 'Consultar regulaciones'] },
    { id: 'emergency_contacts', name: 'Contactos de emergencia', type: 'tags', options: ['Veterinarios locales', 'Hospitales 24h', 'Números internacionales', 'Apps de emergencia'] }
  ],

  // Control de pulgas y garrapatas en mascotas (categoría general)
  'pets-products-control-pulgas': [
    { id: 'pest_type_target', name: 'Tipo de plaga objetivo', type: 'tags', options: ['Pulgas', 'Garrapatas', 'Piojos', 'Ácaros', 'Múltiples parásitos'] },
    { id: 'action_mechanism', name: 'Mecanismo de acción', type: 'select', options: ['Repelente', 'Insecticida', 'Acaricida', 'Regulador de crecimiento', 'Múltiple'] },
    { id: 'application_method', name: 'Método de aplicación', type: 'select', options: ['Tópico', 'Oral', 'Ambiental', 'Contacto directo', 'Combinado'] },
    { id: 'pet_age_suitability', name: 'Adecuado para edad de mascota', type: 'tags', options: ['Cachorros/Gatitos', 'Adultos jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'prescription_requirement', name: 'Requisito de prescripción', type: 'select', options: ['Sin receta', 'Con receta veterinaria', 'Recomendación profesional', 'OTC regulado'] }
  ],

  // Collares contra pulgas y garrapatas
  'pets-products-collares-pulgas': [
    { id: 'collar_duration', name: 'Duración del collar', type: 'select', options: ['1-3 meses', '3-6 meses', '6-8 meses', '8+ meses'] },
    { id: 'active_ingredients', name: 'Ingredientes activos', type: 'tags', options: ['Imidacloprid', 'Flumethrin', 'Deltamethrin', 'Propoxur', 'Naturales/Orgánicos'] },
    { id: 'collar_material', name: 'Material del collar', type: 'select', options: ['Plástico flexible', 'Caucho', 'Tela impregnada', 'Polímero especializado'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['No resistente', 'Resistente a salpicaduras', 'Resistente al agua', 'Completamente impermeable'] },
    { id: 'size_adjustability', name: 'Ajustabilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Ajustable básico', 'Altamente ajustable', 'Corte personalizable'] },
    { id: 'breakaway_safety', name: 'Seguridad de liberación', type: 'select', options: ['Sin liberación', 'Liberación de seguridad', 'Liberación rápida', 'Sistema anti-estrangulamiento'] },
    { id: 'scent_level', name: 'Nivel de aroma', type: 'select', options: ['Sin aroma', 'Aroma ligero', 'Aroma moderado', 'Aroma fuerte'] },
    { id: 'effectiveness_onset', name: 'Inicio de efectividad', type: 'select', options: ['Inmediato', '24-48 horas', '2-7 días', '1-2 semanas'] },
    { id: 'collar_width', name: 'Ancho del collar', type: 'select', options: ['Delgado (5-10mm)', 'Estándar (10-15mm)', 'Ancho (15-25mm)', 'Extra ancho (25mm+)'] },
    { id: 'reflective_features', name: 'Características reflectivas', type: 'select', options: ['Sin reflectivos', 'Rayas reflectivas', 'Totalmente reflectivo', 'LED integrado'] }
  ],

  // Nebulizadores contra pulgas y garrapatas
  'pets-products-nebulizadores-pulgas': [
    { id: 'coverage_area', name: 'Área de cobertura', type: 'select', options: ['Habitación pequeña', 'Habitación grande', 'Casa completa', 'Área comercial'] },
    { id: 'application_frequency', name: 'Frecuencia de aplicación', type: 'select', options: ['Una sola vez', 'Semanal', 'Quincenal', 'Mensual', 'Estacional'] },
    { id: 'fog_penetration', name: 'Penetración de nebulización', type: 'select', options: ['Superficial', 'Moderada', 'Profunda', 'Penetración total'] },
    { id: 'residual_effect', name: 'Efecto residual', type: 'select', options: ['Sin residual', '1-2 semanas', '2-4 semanas', '1-3 meses'] },
    { id: 'safety_precautions', name: 'Precauciones de seguridad', type: 'tags', options: ['Evacuar mascotas', 'Evacuar humanos', 'Ventilar área', 'Cubrir alimentos', 'Proteger acuarios'] },
    { id: 'particle_size', name: 'Tamaño de partícula', type: 'select', options: ['Micro partículas', 'Partículas finas', 'Partículas medianas', 'Niebla densa'] },
    { id: 'surface_compatibility', name: 'Compatibilidad de superficies', type: 'tags', options: ['Telas', 'Madera', 'Alfombras', 'Tapicería', 'Electrónicos', 'Todas las superficies'] },
    { id: 'professional_grade', name: 'Grado profesional', type: 'select', options: ['Uso doméstico', 'Semi-profesional', 'Profesional', 'Comercial/Industrial'] },
    { id: 'formulation_type', name: 'Tipo de formulación', type: 'select', options: ['Base agua', 'Base aceite', 'Aerosol presurizado', 'Concentrado diluible'] },
    { id: 'target_life_stage', name: 'Etapa de vida objetivo', type: 'tags', options: ['Huevos', 'Larvas', 'Pupas', 'Adultos', 'Todas las etapas'] }
  ],

  // Champús contra pulgas y garrapatas
  'pets-products-champus-pulgas': [
    { id: 'shampoo_formulation', name: 'Formulación del champú', type: 'select', options: ['Químico sintético', 'Natural/Orgánico', 'Medicinal', 'Hipoalergénico'] },
    { id: 'contact_time', name: 'Tiempo de contacto requerido', type: 'select', options: ['2-5 minutos', '5-10 minutos', '10-15 minutos', '15+ minutos'] },
    { id: 'kill_mechanism', name: 'Mecanismo de eliminación', type: 'select', options: ['Sofocación', 'Neurotóxico', 'Deshidratación', 'Repelente', 'Múltiple'] },
    { id: 'coat_conditioning', name: 'Acondicionamiento del pelaje', type: 'select', options: ['Sin acondicionador', 'Acondicionamiento básico', 'Acondicionamiento avanzado', 'Tratamiento profundo'] },
    { id: 'skin_sensitivity', name: 'Sensibilidad de la piel', type: 'select', options: ['Piel normal', 'Piel sensible', 'Piel muy sensible', 'Todas las pieles'] },
    { id: 'frequency_use', name: 'Frecuencia de uso', type: 'select', options: ['Una sola aplicación', 'Semanal', 'Quincenal', 'Mensual', 'Según necesidad'] },
    { id: 'rinse_requirement', name: 'Requisito de enjuague', type: 'select', options: ['Enjuague inmediato', 'Enjuague después del tiempo', 'Sin enjuague', 'Enjuague opcional'] },
    { id: 'preventive_effect', name: 'Efecto preventivo', type: 'select', options: ['Solo tratamiento', 'Prevención temporal', 'Prevención moderada', 'Prevención prolongada'] },
    { id: 'scent_profile', name: 'Perfil de aroma', type: 'select', options: ['Sin aroma', 'Aroma suave', 'Aromático', 'Medicinal', 'Personalizable'] },
    { id: 'age_restriction', name: 'Restricción de edad', type: 'select', options: ['Sin restricción', '3+ meses', '6+ meses', '1+ año', 'Solo adultos'] }
  ],

  // Aerosoles contra pulgas y garrapatas
  'pets-products-aerosoles-pulgas': [
    { id: 'spray_range', name: 'Alcance del spray', type: 'select', options: ['Contacto directo', 'Corto alcance', 'Alcance medio', 'Largo alcance'] },
    { id: 'droplet_size', name: 'Tamaño de gota', type: 'select', options: ['Micro gotas', 'Gotas finas', 'Gotas medianas', 'Gotas gruesas'] },
    { id: 'drying_time', name: 'Tiempo de secado', type: 'select', options: ['Secado rápido', 'Secado moderado', 'Secado lento', 'No se seca'] },
    { id: 'stain_potential', name: 'Potencial de manchas', type: 'select', options: ['Sin manchas', 'Manchas mínimas', 'Puede manchar', 'Alto riesgo manchas'] },
    { id: 'propellant_type', name: 'Tipo de propelente', type: 'select', options: ['Sin propelente', 'Propelente natural', 'Propelente sintético', 'Presión manual'] },
    { id: 'coverage_efficiency', name: 'Eficiencia de cobertura', type: 'select', options: ['Cobertura uniforme', 'Cobertura dirigida', 'Cobertura amplia', 'Cobertura concentrada'] },
    { id: 'application_precision', name: 'Precisión de aplicación', type: 'select', options: ['Aplicación general', 'Dirigida', 'Precisión alta', 'Ultra precisa'] },
    { id: 'environmental_impact', name: 'Impacto ambiental', type: 'select', options: ['Eco-friendly', 'Impacto bajo', 'Impacto moderado', 'Considerar ventilación'] },
    { id: 'residue_level', name: 'Nivel de residuo', type: 'select', options: ['Sin residuo', 'Residuo mínimo', 'Residuo moderado', 'Residuo visible'] },
    { id: 'reapplication_interval', name: 'Intervalo de reaplicación', type: 'select', options: ['Diario', 'Semanal', 'Quincenal', 'Mensual', 'Según necesidad'] }
  ],

  // Peines para pulgas
  'pets-products-peines-pulgas': [
    { id: 'tooth_spacing', name: 'Espaciado de dientes', type: 'select', options: ['Extra fino', 'Fino', 'Medio', 'Grueso', 'Variable'] },
    { id: 'comb_material', name: 'Material del peine', type: 'select', options: ['Metal', 'Plástico resistente', 'Acero inoxidable', 'Aleación especializada'] },
    { id: 'handle_design', name: 'Diseño del mango', type: 'select', options: ['Mango básico', 'Ergonómico', 'Antideslizante', 'Acolchado', 'Intercambiable'] },
    { id: 'effectiveness_level', name: 'Nivel de efectividad', type: 'select', options: ['Detección básica', 'Remoción moderada', 'Remoción alta', 'Remoción completa'] },
    { id: 'coat_compatibility', name: 'Compatibilidad de pelaje', type: 'tags', options: ['Pelo corto', 'Pelo medio', 'Pelo largo', 'Pelo rizado', 'Todos los pelajes'] },
    { id: 'flea_stage_detection', name: 'Detección de etapas de pulga', type: 'tags', options: ['Adultos vivos', 'Huevos', 'Larvas', 'Suciedad de pulga', 'Todas las etapas'] },
    { id: 'comfort_level', name: 'Nivel de comodidad', type: 'select', options: ['Puede ser incómodo', 'Neutral', 'Cómodo', 'Extra cómodo'] },
    { id: 'cleaning_ease', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil de limpiar', 'Limpieza estándar', 'Fácil limpieza', 'Auto-limpiante'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso intensivo', 'Uso profesional'] },
    { id: 'size_options', name: 'Opciones de tamaño', type: 'select', options: ['Tamaño único', 'Pequeño/Grande', 'Múltiples tamaños', 'Ajustable'] }
  ],

  // Medicación oral
  'pets-products-medicacion-oral': [
    { id: 'medication_form', name: 'Forma de medicación', type: 'select', options: ['Tabletas', 'Cápsulas', 'Líquido', 'Masticables', 'Polvo'] },
    { id: 'administration_frequency', name: 'Frecuencia de administración', type: 'select', options: ['Una dosis', 'Diario', 'Semanal', 'Mensual', 'Trimestral'] },
    { id: 'onset_of_action', name: 'Inicio de acción', type: 'select', options: ['12-24 horas', '1-3 días', '3-7 días', '1-2 semanas'] },
    { id: 'duration_of_effect', name: 'Duración del efecto', type: 'select', options: ['24 horas', '1 semana', '1 mes', '3 meses', '6+ meses'] },
    { id: 'prescription_status', name: 'Estado de prescripción', type: 'select', options: ['Sin receta', 'Con receta', 'Receta veterinaria', 'Controlado'] },
    { id: 'palatability', name: 'Palatabilidad', type: 'select', options: ['Sin sabor', 'Sabor neutro', 'Sabor agradable', 'Altamente palatable'] },
    { id: 'side_effects_profile', name: 'Perfil de efectos secundarios', type: 'tags', options: ['Mínimos', 'Gastrointestinales leves', 'Neurológicos', 'Dermatológicos', 'Consultar veterinario'] },
    { id: 'drug_interactions', name: 'Interacciones medicamentosas', type: 'select', options: ['Sin interacciones conocidas', 'Interacciones menores', 'Interacciones moderadas', 'Consultar veterinario'] },
    { id: 'weight_dosing', name: 'Dosificación por peso', type: 'select', options: ['Dosis fija', 'Por peso corporal', 'Por rango de peso', 'Personalizable'] },
    { id: 'storage_requirements', name: 'Requisitos de almacenamiento', type: 'select', options: ['Temperatura ambiente', 'Lugar fresco y seco', 'Refrigeración', 'Condiciones especiales'] }
  ],

  // Tratamientos localizados
  'pets-products-tratamientos-localizados': [
    { id: 'application_site', name: 'Sitio de aplicación', type: 'select', options: ['Entre omóplatos', 'Base del cuello', 'Múltiples puntos', 'Área específica'] },
    { id: 'absorption_rate', name: 'Tasa de absorción', type: 'select', options: ['Absorción rápida', 'Absorción moderada', 'Absorción lenta', 'Distribución sistémica'] },
    { id: 'volume_per_dose', name: 'Volumen por dosis', type: 'select', options: ['0.5-1ml', '1-2ml', '2-4ml', '4+ ml', 'Variable por peso'] },
    { id: 'systemic_distribution', name: 'Distribución sistémica', type: 'select', options: ['Local únicamente', 'Semi-sistémica', 'Sistémica completa', 'Distribución dirigida'] },
    { id: 'waterproof_duration', name: 'Duración impermeable', type: 'select', options: ['No impermeable', '24-48 horas', '1 semana', '2+ semanas'] },
    { id: 'reapplication_schedule', name: 'Programa de reaplicación', type: 'select', options: ['Semanal', 'Quincenal', 'Mensual', 'Bimensual', 'Trimestral'] },
    { id: 'spot_size_coverage', name: 'Cobertura del área de aplicación', type: 'select', options: ['Área pequeña', 'Área mediana', 'Área grande', 'Cobertura total'] },
    { id: 'grease_residue', name: 'Residuo graso', type: 'select', options: ['Sin residuo', 'Residuo mínimo', 'Residuo moderado', 'Residuo notable'] },
    { id: 'hair_parting_required', name: 'Separación de pelo requerida', type: 'select', options: ['No necesaria', 'Separación básica', 'Separación completa', 'Aplicación en piel'] },
    { id: 'application_precision', name: 'Precisión de aplicación', type: 'select', options: ['Aplicación general', 'Dirigida', 'Alta precisión', 'Ultra precisa'] }
  ],

  // Contenedores de comida para mascotas (categoría general)
  'pets-products-contenedores-comida': [
    { id: 'storage_type', name: 'Tipo de almacenamiento', type: 'select', options: ['Corto plazo', 'Largo plazo', 'Temporal', 'Permanente'] },
    { id: 'food_type_compatibility', name: 'Compatibilidad con tipo de comida', type: 'tags', options: ['Comida seca', 'Comida húmeda', 'Snacks', 'Líquidos', 'Universal'] },
    { id: 'sealing_mechanism', name: 'Mecanismo de sellado', type: 'select', options: ['Sin sellado', 'Tapa básica', 'Sellado hermético', 'Sellado al vacío'] },
    { id: 'material_construction', name: 'Material de construcción', type: 'select', options: ['Plástico', 'Metal', 'Vidrio', 'Silicona', 'Materiales mixtos'] },
    { id: 'capacity_range', name: 'Rango de capacidad', type: 'select', options: ['Pequeña (hasta 1L)', 'Mediana (1-5L)', 'Grande (5-15L)', 'Extra grande (15L+)'] }
  ],

  // Cubiertas para latas
  'pets-products-cubiertas-latas': [
    { id: 'can_size_compatibility', name: 'Compatibilidad con tamaño de lata', type: 'tags', options: ['Latas pequeñas (85g)', 'Latas medianas (200g)', 'Latas grandes (400g)', 'Latas gigantes (800g+)', 'Universal'] },
    { id: 'cover_material', name: 'Material de la cubierta', type: 'select', options: ['Silicona', 'Plástico flexible', 'Plástico rígido', 'Caucho', 'Material híbrido'] },
    { id: 'sealing_effectiveness', name: 'Efectividad del sellado', type: 'select', options: ['Sellado básico', 'Sellado hermético', 'Sellado al vacío', 'Sellado ultra hermético'] },
    { id: 'reusability', name: 'Reutilización', type: 'select', options: ['Un solo uso', 'Reutilizable limitado', 'Altamente reutilizable', 'Uso indefinido'] },
    { id: 'freshness_preservation', name: 'Preservación de frescura', type: 'select', options: ['Protección básica', 'Protección moderada', 'Protección avanzada', 'Preservación máxima'] },
    { id: 'refrigerator_safe', name: 'Seguro para refrigerador', type: 'select', options: ['No recomendado', 'Seguro para refrigerador', 'Optimizado para frío', 'Resistente a congelación'] },
    { id: 'ease_of_use', name: 'Facilidad de uso', type: 'select', options: ['Requiere esfuerzo', 'Uso estándar', 'Fácil de usar', 'Ultra fácil'] },
    { id: 'odor_containment', name: 'Contención de olores', type: 'select', options: ['Sin contención', 'Contención básica', 'Contención avanzada', 'Eliminación total de olores'] },
    { id: 'transparency_level', name: 'Nivel de transparencia', type: 'select', options: ['Opaco', 'Semi-transparente', 'Transparente', 'Cristalino'] },
    { id: 'dishwasher_safe', name: 'Seguro para lavavajillas', type: 'select', options: ['Solo lavado a mano', 'Lavavajillas seguro', 'Lavavajillas recomendado', 'Resistente a alta temperatura'] }
  ],

  // Contenedores de almacenamiento de alimentos
  'pets-products-contenedores-almacenamiento': [
    { id: 'storage_capacity', name: 'Capacidad de almacenamiento', type: 'select', options: ['1-5 kg', '5-10 kg', '10-20 kg', '20+ kg', 'Personalizable'] },
    { id: 'airtight_seal', name: 'Sellado hermético', type: 'select', options: ['Sin sellado hermético', 'Sellado básico', 'Sellado hermético', 'Sellado al vacío avanzado'] },
    { id: 'pest_resistance', name: 'Resistencia a plagas', type: 'select', options: ['Sin protección', 'Protección básica', 'Resistente a insectos', 'Prueba de roedores'] },
    { id: 'moisture_control', name: 'Control de humedad', type: 'select', options: ['Sin control', 'Resistente a humedad', 'Control de humedad', 'Deshumidificación activa'] },
    { id: 'dispensing_mechanism', name: 'Mecanismo de dispensado', type: 'select', options: ['Sin dispensador', 'Apertura manual', 'Dispensador controlado', 'Dispensador automático'] },
    { id: 'stackability', name: 'Apilabilidad', type: 'select', options: ['No apilable', 'Apilable básico', 'Diseño apilable', 'Sistema de apilado optimizado'] },
    { id: 'wheels_mobility', name: 'Movilidad con ruedas', type: 'select', options: ['Sin ruedas', 'Ruedas opcionales', 'Ruedas integradas', 'Sistema de movilidad avanzado'] },
    { id: 'measurement_markings', name: 'Marcas de medición', type: 'select', options: ['Sin marcas', 'Marcas básicas', 'Marcas detalladas', 'Sistema de medición preciso'] },
    { id: 'uv_protection', name: 'Protección UV', type: 'select', options: ['Sin protección UV', 'Protección básica', 'Protección UV avanzada', 'Blindaje UV completo'] },
    { id: 'temperature_resistance', name: 'Resistencia a temperatura', type: 'select', options: ['Temperatura ambiente', 'Resistente al calor', 'Resistente al frío', 'Resistencia extrema'] },
    { id: 'cleaning_difficulty', name: 'Dificultad de limpieza', type: 'select', options: ['Difícil de limpiar', 'Limpieza estándar', 'Fácil limpieza', 'Auto-limpiante'] },
    { id: 'food_grade_certification', name: 'Certificación grado alimentario', type: 'select', options: ['Sin certificación', 'Grado alimentario básico', 'Certificación FDA', 'Certificaciones múltiples'] }
  ],

  // Fiambreras
  'pets-products-fiambreras': [
    { id: 'portability_design', name: 'Diseño de portabilidad', type: 'select', options: ['Básico', 'Portátil', 'Ultra portátil', 'Sistema de transporte'] },
    { id: 'compartment_configuration', name: 'Configuración de compartimentos', type: 'select', options: ['Un compartimento', 'Dos compartimentos', 'Múltiples compartimentos', 'Compartimentos ajustables'] },
    { id: 'leak_proof_rating', name: 'Calificación a prueba de fugas', type: 'select', options: ['No a prueba de fugas', 'Resistente a fugas', 'A prueba de fugas', 'Sellado total'] },
    { id: 'insulation_properties', name: 'Propiedades de aislamiento', type: 'select', options: ['Sin aislamiento', 'Aislamiento básico', 'Aislamiento térmico', 'Aislamiento avanzado'] },
    { id: 'microwave_compatibility', name: 'Compatibilidad con microondas', type: 'select', options: ['No apto microondas', 'Parcialmente apto', 'Apto microondas', 'Optimizado microondas'] },
    { id: 'freezer_compatibility', name: 'Compatibilidad con congelador', type: 'select', options: ['No apto congelador', 'Resistente al frío', 'Apto congelador', 'Optimizado congelación'] },
    { id: 'portion_control', name: 'Control de porciones', type: 'select', options: ['Sin control', 'Marcas de porción', 'Control de porción', 'Sistema de dosificación'] },
    { id: 'carrying_handle', name: 'Asa de transporte', type: 'select', options: ['Sin asa', 'Asa básica', 'Asa ergonómica', 'Sistema de transporte múltiple'] },
    { id: 'freshness_indicator', name: 'Indicador de frescura', type: 'select', options: ['Sin indicador', 'Indicador básico', 'Indicador avanzado', 'Sistema de monitoreo'] },
    { id: 'size_variety', name: 'Variedad de tamaños', type: 'select', options: ['Tamaño único', 'Dos tamaños', 'Múltiples tamaños', 'Sistema modular'] },
    { id: 'travel_durability', name: 'Durabilidad de viaje', type: 'select', options: ['Uso casero', 'Viajes ocasionales', 'Uso frecuente', 'Uso profesional'] },
    { id: 'identification_system', name: 'Sistema de identificación', type: 'select', options: ['Sin identificación', 'Etiquetas básicas', 'Sistema de etiquetado', 'Identificación personalizable'] }
  ],

  // Productos de higiene para mascotas (categoría general)
  'pets-products-higiene': [
    { id: 'hygiene_category', name: 'Categoría de higiene', type: 'tags', options: ['Cepillado', 'Baño', 'Manicura', 'Desodorización', 'Limpieza facial', 'Higiene dental'] },
    { id: 'usage_frequency', name: 'Frecuencia de uso', type: 'select', options: ['Diario', 'Semanal', 'Quincenal', 'Mensual', 'Según necesidad'] },
    { id: 'pet_comfort_level', name: 'Nivel de comodidad para mascota', type: 'select', options: ['Puede causar estrés', 'Neutral', 'Cómodo', 'Relajante'] },
    { id: 'professional_vs_home', name: 'Uso profesional vs casero', type: 'select', options: ['Solo uso casero', 'Casero avanzado', 'Semi-profesional', 'Profesional'] },
    { id: 'skill_level_required', name: 'Nivel de habilidad requerido', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'] }
  ],

  // Peines y cepillos para mascotas
  'pets-products-peines-cepillos': [
    { id: 'brush_type', name: 'Tipo de cepillo', type: 'select', options: ['Cepillo de cerdas', 'Cepillo de alambre', 'Cepillo desenredante', 'Cepillo de goma', 'Peine de metal'] },
    { id: 'coat_type_suitability', name: 'Adecuado para tipo de pelaje', type: 'tags', options: ['Pelo corto', 'Pelo medio', 'Pelo largo', 'Pelo rizado', 'Pelo doble capa', 'Todos los pelajes'] },
    { id: 'bristle_firmness', name: 'Firmeza de cerdas', type: 'select', options: ['Muy suave', 'Suave', 'Media', 'Firme', 'Muy firme'] },
    { id: 'primary_function', name: 'Función principal', type: 'tags', options: ['Desenredar', 'Quitar pelo muerto', 'Distribución de aceites', 'Masaje', 'Limpieza general'] },
    { id: 'handle_ergonomics', name: 'Ergonomía del mango', type: 'select', options: ['Básico', 'Ergonómico', 'Antideslizante', 'Acolchado', 'Intercambiable'] },
    { id: 'self_cleaning', name: 'Auto-limpieza', type: 'select', options: ['Limpieza manual', 'Botón retráctil', 'Auto-limpiante', 'Sistema de limpieza incluido'] },
    { id: 'shedding_control', name: 'Control de muda', type: 'select', options: ['Sin control muda', 'Control básico', 'Control avanzado', 'Máximo control muda'] },
    { id: 'skin_stimulation', name: 'Estimulación de la piel', type: 'select', options: ['Sin estimulación', 'Estimulación suave', 'Estimulación moderada', 'Masaje profundo'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso intensivo', 'Uso profesional'] },
    { id: 'size_compatibility', name: 'Compatibilidad de tamaño', type: 'tags', options: ['Mascotas pequeñas', 'Mascotas medianas', 'Mascotas grandes', 'Universal'] }
  ],

  // Espráis desodorantes y colonias para mascotas
  'pets-products-esprais-desodorantes': [
    { id: 'fragrance_intensity', name: 'Intensidad de fragancia', type: 'select', options: ['Sin fragancia', 'Fragancia suave', 'Fragancia moderada', 'Fragancia fuerte'] },
    { id: 'scent_category', name: 'Categoría de aroma', type: 'select', options: ['Neutro', 'Floral', 'Frutal', 'Fresco', 'Herbal', 'Personalizado'] },
    { id: 'deodorizing_mechanism', name: 'Mecanismo desodorizante', type: 'select', options: ['Enmascaramiento', 'Neutralización', 'Eliminación enzimática', 'Absorción de olores'] },
    { id: 'application_area', name: 'Área de aplicación', type: 'tags', options: ['Pelaje completo', 'Áreas específicas', 'Patas', 'Zona facial', 'Evitar zonas sensibles'] },
    { id: 'lasting_duration', name: 'Duración del efecto', type: 'select', options: ['1-2 horas', '2-6 horas', '6-12 horas', '12+ horas'] },
    { id: 'skin_sensitivity', name: 'Sensibilidad de la piel', type: 'select', options: ['Piel normal', 'Piel sensible', 'Hipoalergénico', 'Dermatológicamente probado'] },
    { id: 'alcohol_content', name: 'Contenido de alcohol', type: 'select', options: ['Sin alcohol', 'Bajo alcohol', 'Contenido moderado', 'Alto contenido'] },
    { id: 'spray_pattern', name: 'Patrón de rociado', type: 'select', options: ['Rociado fino', 'Rociado amplio', 'Rociado dirigido', 'Nebulización'] },
    { id: 'natural_ingredients', name: 'Ingredientes naturales', type: 'select', options: ['Sintético', 'Parcialmente natural', 'Mayormente natural', 'Completamente natural'] },
    { id: 'stain_potential', name: 'Potencial de manchas', type: 'select', options: ['Sin manchas', 'Manchas mínimas', 'Puede manchar', 'Alto riesgo manchas'] }
  ],

  // Cortapelos para mascotas
  'pets-products-cortapelos': [
    { id: 'clipper_type', name: 'Tipo de cortapelos', type: 'select', options: ['Eléctrico con cable', 'Inalámbrico', 'Manual', 'Híbrido'] },
    { id: 'motor_power', name: 'Potencia del motor', type: 'select', options: ['Baja potencia', 'Potencia media', 'Alta potencia', 'Potencia profesional'] },
    { id: 'noise_level', name: 'Nivel de ruido', type: 'select', options: ['Muy silencioso', 'Silencioso', 'Ruido moderado', 'Ruidoso'] },
    { id: 'blade_material', name: 'Material de la cuchilla', type: 'select', options: ['Acero inoxidable', 'Cerámica', 'Titanio', 'Aleación especializada'] },
    { id: 'guard_attachments', name: 'Accesorios de protección', type: 'tags', options: ['Peines guía múltiples', 'Ajuste de longitud', 'Protectores de seguridad', 'Accesorios especializados'] },
    { id: 'battery_life', name: 'Duración de batería', type: 'select', options: ['No aplica', '30-60 min', '60-120 min', '120+ min', 'Uso continuo'] },
    { id: 'heat_generation', name: 'Generación de calor', type: 'select', options: ['Sin calentamiento', 'Calentamiento mínimo', 'Calentamiento moderado', 'Requiere descansos'] },
    { id: 'maintenance_difficulty', name: 'Dificultad de mantenimiento', type: 'select', options: ['Bajo mantenimiento', 'Mantenimiento estándar', 'Mantenimiento frecuente', 'Mantenimiento profesional'] },
    { id: 'cutting_precision', name: 'Precisión de corte', type: 'select', options: ['Corte básico', 'Corte estándar', 'Corte preciso', 'Precisión profesional'] },
    { id: 'vibration_level', name: 'Nivel de vibración', type: 'select', options: ['Sin vibración', 'Vibración mínima', 'Vibración moderada', 'Vibración notable'] }
  ],

  // Secadores de pelo para mascotas
  'pets-products-secadores': [
    { id: 'dryer_type', name: 'Tipo de secador', type: 'select', options: ['Secador de mano', 'Secador de pie', 'Secador de mesa', 'Sistema de secado'] },
    { id: 'heat_settings', name: 'Configuraciones de calor', type: 'select', options: ['Solo aire frío', 'Calor bajo/medio', 'Múltiples temperaturas', 'Control variable'] },
    { id: 'airflow_power', name: 'Potencia de flujo de aire', type: 'select', options: ['Flujo suave', 'Flujo moderado', 'Flujo fuerte', 'Flujo profesional'] },
    { id: 'noise_reduction', name: 'Reducción de ruido', type: 'select', options: ['Sin reducción', 'Reducción básica', 'Reducción avanzada', 'Ultra silencioso'] },
    { id: 'attachment_variety', name: 'Variedad de accesorios', type: 'tags', options: ['Boquilla concentradora', 'Difusor', 'Cepillo integrado', 'Accesorios especializados'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Protección sobrecalentamiento', 'Apagado automático', 'Temperatura controlada', 'Sistema de seguridad'] },
    { id: 'cord_length', name: 'Longitud del cable', type: 'select', options: ['Cable corto', 'Cable estándar', 'Cable largo', 'Inalámbrico'] },
    { id: 'weight_portability', name: 'Peso y portabilidad', type: 'select', options: ['Muy liviano', 'Liviano', 'Peso moderado', 'Pesado/Estacionario'] },
    { id: 'drying_efficiency', name: 'Eficiencia de secado', type: 'select', options: ['Secado lento', 'Secado estándar', 'Secado rápido', 'Secado ultra rápido'] },
    { id: 'professional_grade', name: 'Grado profesional', type: 'select', options: ['Uso doméstico', 'Semi-profesional', 'Profesional', 'Grado salon'] }
  ],

  // Esmalte de uñas para mascotas
  'pets-products-esmalte-unas': [
    { id: 'nail_polish_type', name: 'Tipo de esmalte', type: 'select', options: ['Base coat', 'Esmalte de color', 'Top coat', 'Kit completo'] },
    { id: 'safety_formulation', name: 'Formulación de seguridad', type: 'select', options: ['Formulación especial mascotas', 'No tóxico', 'Base agua', 'Removible fácilmente'] },
    { id: 'color_variety', name: 'Variedad de colores', type: 'select', options: ['Color único', 'Paleta básica', 'Amplia gama', 'Colores personalizados'] },
    { id: 'finish_type', name: 'Tipo de acabado', type: 'select', options: ['Mate', 'Satinado', 'Brillante', 'Glitter', 'Efecto especial'] },
    { id: 'application_ease', name: 'Facilidad de aplicación', type: 'select', options: ['Requiere experiencia', 'Aplicación estándar', 'Fácil aplicación', 'Ultra fácil'] },
    { id: 'drying_time', name: 'Tiempo de secado', type: 'select', options: ['Secado lento', 'Secado estándar', 'Secado rápido', 'Secado instantáneo'] },
    { id: 'durability_wear', name: 'Durabilidad del uso', type: 'select', options: ['1-3 días', '3-7 días', '1-2 semanas', '2+ semanas'] },
    { id: 'removal_method', name: 'Método de remoción', type: 'select', options: ['Remoción natural', 'Agua tibia', 'Removedor especial', 'Remoción profesional'] },
    { id: 'nail_health_impact', name: 'Impacto en salud de uñas', type: 'select', options: ['Sin impacto', 'Neutro', 'Beneficioso', 'Fortalecedor'] },
    { id: 'special_occasions', name: 'Ocasiones especiales', type: 'tags', options: ['Uso diario', 'Festivales', 'Fotografías', 'Competencias', 'Eventos especiales'] }
  ],

  // Herramientas de manicura para mascotas
  'pets-products-herramientas-manicura': [
    { id: 'tool_type', name: 'Tipo de herramienta', type: 'tags', options: ['Cortauñas', 'Lima de uñas', 'Desbastador eléctrico', 'Kit completo', 'Herramientas especializadas'] },
    { id: 'nail_size_compatibility', name: 'Compatibilidad con tamaño de uña', type: 'tags', options: ['Uñas pequeñas', 'Uñas medianas', 'Uñas grandes', 'Universal'] },
    { id: 'cutting_mechanism', name: 'Mecanismo de corte', type: 'select', options: ['Corte guillotina', 'Corte tijera', 'Corte bypass', 'Desbaste gradual'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Protector de corte', 'Guía de longitud', 'Bloqueo de seguridad', 'Superficie antideslizante'] },
    { id: 'blade_sharpness', name: 'Afilado de la cuchilla', type: 'select', options: ['Afilado estándar', 'Ultra afilado', 'Afilado profesional', 'Auto-afilable'] },
    { id: 'handle_comfort', name: 'Comodidad del mango', type: 'select', options: ['Mango básico', 'Ergonómico', 'Acolchado', 'Antideslizante'] },
    { id: 'precision_level', name: 'Nivel de precisión', type: 'select', options: ['Precisión básica', 'Precisión estándar', 'Alta precisión', 'Precisión profesional'] },
    { id: 'maintenance_requirement', name: 'Requisito de mantenimiento', type: 'select', options: ['Sin mantenimiento', 'Mantenimiento mínimo', 'Mantenimiento regular', 'Mantenimiento frecuente'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Manual', 'Batería', 'Eléctrico', 'Recargable'] },
    { id: 'noise_operation', name: 'Ruido de operación', type: 'select', options: ['Silencioso', 'Ruido mínimo', 'Ruido moderado', 'Ruidoso'] }
  ],

  // Champús y acondicionadores para mascotas
  'pets-products-champus-acondicionadores': [
    { id: 'product_type', name: 'Tipo de producto', type: 'select', options: ['Solo champú', 'Solo acondicionador', 'Champú 2 en 1', 'Kit completo'] },
    { id: 'coat_specific', name: 'Específico para pelaje', type: 'tags', options: ['Pelo graso', 'Pelo seco', 'Pelo normal', 'Pelo teñido', 'Todos los pelajes'] },
    { id: 'skin_condition_target', name: 'Condición de piel objetivo', type: 'tags', options: ['Piel normal', 'Piel sensible', 'Piel seca', 'Dermatitis', 'Alergias'] },
    { id: 'special_formulation', name: 'Formulación especial', type: 'tags', options: ['Hipoalergénico', 'Orgánico', 'Sin sulfatos', 'Sin parabenos', 'pH balanceado'] },
    { id: 'therapeutic_benefits', name: 'Beneficios terapéuticos', type: 'tags', options: ['Hidratación', 'Anti-caspa', 'Calmante', 'Reparador', 'Fortalecedor'] },
    { id: 'fragrance_profile', name: 'Perfil de fragancia', type: 'select', options: ['Sin fragancia', 'Fragancia suave', 'Aromático', 'Fragancia duradera'] },
    { id: 'concentration_level', name: 'Nivel de concentración', type: 'select', options: ['Concentrado', 'Fuerza estándar', 'Diluible', 'Listo para usar'] },
    { id: 'rinse_requirement', name: 'Requisito de enjuague', type: 'select', options: ['Enjuague completo', 'Enjuague ligero', 'Sin enjuague', 'Enjuague opcional'] },
    { id: 'age_suitability', name: 'Adecuado para edad', type: 'tags', options: ['Cachorros', 'Adultos jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'professional_grade', name: 'Grado profesional', type: 'select', options: ['Uso doméstico', 'Semi-profesional', 'Profesional', 'Grado salon'] }
  ],

  // Toallitas para mascotas
  'pets-products-toallitas': [
    { id: 'wipe_purpose', name: 'Propósito de las toallitas', type: 'tags', options: ['Limpieza general', 'Limpieza de patas', 'Limpieza facial', 'Limpieza de oídos', 'Desodorización'] },
    { id: 'material_composition', name: 'Composición del material', type: 'select', options: ['Algodón', 'Fibra sintética', 'Bambú', 'Material mixto', 'Biodegradable'] },
    { id: 'moisture_content', name: 'Contenido de humedad', type: 'select', options: ['Ligeramente húmedo', 'Húmedo estándar', 'Muy húmedo', 'Saturado'] },
    { id: 'cleaning_agents', name: 'Agentes de limpieza', type: 'tags', options: ['Solo agua', 'Jabón suave', 'Enzimas', 'Alcohol', 'Ingredientes naturales'] },
    { id: 'package_size', name: 'Tamaño del paquete', type: 'select', options: ['Paquete pequeño (10-25)', 'Paquete mediano (25-50)', 'Paquete grande (50-100)', 'Bulk (100+)'] },
    { id: 'resealable_package', name: 'Paquete resellable', type: 'select', options: ['No resellable', 'Adhesivo básico', 'Cierre hermético', 'Sistema de sellado avanzado'] },
    { id: 'skin_compatibility', name: 'Compatibilidad con la piel', type: 'select', options: ['Piel normal', 'Piel sensible', 'Hipoalergénico', 'Dermatológicamente probado'] },
    { id: 'antimicrobial_properties', name: 'Propiedades antimicrobianas', type: 'select', options: ['Sin propiedades', 'Antibacterial básico', 'Antimicrobial avanzado', 'Desinfectante'] },
    { id: 'fragrance_level', name: 'Nivel de fragancia', type: 'select', options: ['Sin fragancia', 'Fragancia ligera', 'Fragancia moderada', 'Fragancia fuerte'] },
    { id: 'disposal_method', name: 'Método de desecho', type: 'select', options: ['Basura regular', 'Compostable', 'Biodegradable', 'Reciclable'] },
    { id: 'texture_feeling', name: 'Textura y sensación', type: 'select', options: ['Suave', 'Texturizada', 'Exfoliante suave', 'Resistente'] },
    { id: 'portability_factor', name: 'Factor de portabilidad', type: 'select', options: ['Uso doméstico', 'Portátil básico', 'Viajes frecuentes', 'Ultra portátil'] }
  ],

  // Placas identificativas para mascotas (categoría general)
  'pets-products-placas-identificativas': [
    { id: 'identification_type', name: 'Tipo de identificación', type: 'tags', options: ['Nombre', 'Teléfono', 'Dirección', 'Información médica', 'Código QR', 'Múltiple información'] },
    { id: 'attachment_method', name: 'Método de sujeción', type: 'select', options: ['Anillo split', 'Clip directo', 'Soldadura', 'Sistema deslizable', 'Adhesivo'] },
    { id: 'visibility_level', name: 'Nivel de visibilidad', type: 'select', options: ['Básica', 'Alta visibilidad', 'Reflectante', 'Iluminada'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso intensivo', 'Extrema durabilidad'] },
    { id: 'customization_level', name: 'Nivel de personalización', type: 'select', options: ['Sin personalización', 'Personalización básica', 'Altamente personalizable', 'Completamente personalizable'] }
  ],

  // Placas con códigos QR digitales
  'pets-products-placas-qr': [
    { id: 'qr_technology', name: 'Tecnología QR', type: 'select', options: ['QR estático', 'QR dinámico', 'QR actualizable', 'QR con encriptación'] },
    { id: 'digital_profile_features', name: 'Características del perfil digital', type: 'tags', options: ['Información básica', 'Historial médico', 'Fotos múltiples', 'Contactos de emergencia', 'GPS tracking'] },
    { id: 'app_compatibility', name: 'Compatibilidad con app', type: 'select', options: ['App propietaria', 'Apps múltiples', 'Lector QR universal', 'Sistema web'] },
    { id: 'data_security', name: 'Seguridad de datos', type: 'select', options: ['Básica', 'Encriptación estándar', 'Alta seguridad', 'Encriptación militar'] },
    { id: 'profile_updates', name: 'Actualizaciones de perfil', type: 'select', options: ['Información fija', 'Actualizaciones limitadas', 'Actualizaciones ilimitadas', 'Actualizaciones en tiempo real'] },
    { id: 'offline_backup', name: 'Respaldo offline', type: 'select', options: ['Solo digital', 'Información básica grabada', 'Respaldo completo', 'Sistema híbrido'] },
    { id: 'battery_requirement', name: 'Requisito de batería', type: 'select', options: ['Sin batería', 'Batería reemplazable', 'Batería recargable', 'Energía solar'] },
    { id: 'weather_resistance', name: 'Resistencia al clima', type: 'select', options: ['Básica', 'Resistente al agua', 'Resistente a intemperie', 'Completamente sellado'] },
    { id: 'scan_range', name: 'Rango de escaneo', type: 'select', options: ['Contacto directo', 'Corto alcance', 'Alcance medio', 'Largo alcance'] },
    { id: 'subscription_model', name: 'Modelo de suscripción', type: 'select', options: ['Sin suscripción', 'Suscripción opcional', 'Suscripción requerida', 'Múltiples planes'] }
  ],

  // Placas bordadas
  'pets-products-placas-bordadas': [
    { id: 'fabric_material', name: 'Material de la tela', type: 'select', options: ['Algodón', 'Poliéster', 'Nylon', 'Canvas', 'Material mixto'] },
    { id: 'embroidery_technique', name: 'Técnica de bordado', type: 'select', options: ['Bordado a máquina', 'Bordado a mano', 'Bordado 3D', 'Bordado con hilo metálico'] },
    { id: 'thread_quality', name: 'Calidad del hilo', type: 'select', options: ['Hilo estándar', 'Hilo de alta calidad', 'Hilo resistente UV', 'Hilo antimicrobial'] },
    { id: 'color_options', name: 'Opciones de color', type: 'select', options: ['Colores limitados', 'Paleta estándar', 'Amplia gama', 'Colores personalizados'] },
    { id: 'backing_material', name: 'Material de respaldo', type: 'select', options: ['Sin respaldo', 'Papel backing', 'Tela backing', 'Respaldo adhesivo'] },
    { id: 'edge_finishing', name: 'Acabado de bordes', type: 'select', options: ['Bordes crudos', 'Bordes sellados', 'Bordes overlock', 'Bordes decorativos'] },
    { id: 'size_flexibility', name: 'Flexibilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Tamaños estándar', 'Tamaños personalizados', 'Completamente flexible'] },
    { id: 'attachment_system', name: 'Sistema de sujeción', type: 'tags', options: ['Velcro', 'Clip metálico', 'Cosido directo', 'Sistema deslizable'] },
    { id: 'wash_resistance', name: 'Resistencia al lavado', type: 'select', options: ['No lavable', 'Lavado a mano', 'Lavado máquina', 'Industrial washable'] },
    { id: 'fade_resistance', name: 'Resistencia al desvanecimiento', type: 'select', options: ['Fadeable', 'Resistencia básica', 'Alta resistencia', 'Garantía de color'] }
  ],

  // Etiquetas de alerta médica
  'pets-products-etiquetas-alerta-medica': [
    { id: 'medical_alert_type', name: 'Tipo de alerta médica', type: 'tags', options: ['Alergias', 'Medicamentos', 'Condiciones crónicas', 'Dieta especial', 'Emergencias específicas'] },
    { id: 'urgency_indication', name: 'Indicación de urgencia', type: 'select', options: ['Información general', 'Precaución', 'Alerta alta', 'Emergencia crítica'] },
    { id: 'medical_symbol', name: 'Símbolo médico', type: 'select', options: ['Sin símbolo', 'Cruz médica', 'Símbolo personalizado', 'Símbolos múltiples'] },
    { id: 'information_density', name: 'Densidad de información', type: 'select', options: ['Información mínima', 'Información básica', 'Información detallada', 'Información completa'] },
    { id: 'readability_design', name: 'Diseño de legibilidad', type: 'select', options: ['Texto estándar', 'Alto contraste', 'Letra grande', 'Diseño optimizado'] },
    { id: 'emergency_contact', name: 'Contacto de emergencia', type: 'select', options: ['Sin contacto', 'Un contacto', 'Múltiples contactos', 'Sistema de contactos'] },
    { id: 'veterinary_info', name: 'Información veterinaria', type: 'select', options: ['Sin info veterinaria', 'Clínica veterinaria', 'Veterinario específico', 'Historial médico'] },
    { id: 'update_frequency', name: 'Frecuencia de actualización', type: 'select', options: ['Información permanente', 'Actualización anual', 'Actualización frecuente', 'Actualización continua'] },
    { id: 'backup_information', name: 'Información de respaldo', type: 'select', options: ['Solo etiqueta', 'Código de respaldo', 'QR complementario', 'Sistema múltiple'] },
    { id: 'professional_consultation', name: 'Consulta profesional', type: 'select', options: ['Auto-completado', 'Recomendación veterinaria', 'Supervisión veterinaria', 'Prescripción médica'] }
  ],

  // Etiquetas de cuello deslizables
  'pets-products-etiquetas-cuello-deslizables': [
    { id: 'sliding_mechanism', name: 'Mecanismo deslizante', type: 'select', options: ['Tubo simple', 'Sistema de clip', 'Mecanismo de presión', 'Sistema de bloqueo'] },
    { id: 'collar_compatibility', name: 'Compatibilidad con collar', type: 'tags', options: ['Collares delgados', 'Collares estándar', 'Collares anchos', 'Universal'] },
    { id: 'material_flexibility', name: 'Flexibilidad del material', type: 'select', options: ['Rígido', 'Semi-flexible', 'Flexible', 'Ultra flexible'] },
    { id: 'information_capacity', name: 'Capacidad de información', type: 'select', options: ['Información mínima', 'Información básica', 'Información expandida', 'Información máxima'] },
    { id: 'rotation_prevention', name: 'Prevención de rotación', type: 'select', options: ['Libre rotación', 'Rotación limitada', 'Anti-rotación', 'Posición fija'] },
    { id: 'easy_removal', name: 'Facilidad de remoción', type: 'select', options: ['Permanente', 'Remoción difícil', 'Remoción fácil', 'Remoción instantánea'] },
    { id: 'size_adjustability', name: 'Ajustabilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Ajuste limitado', 'Ajuste amplio', 'Completamente ajustable'] },
    { id: 'noise_level', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Ruido mínimo', 'Ruido moderado', 'Ruidoso'] },
    { id: 'security_level', name: 'Nivel de seguridad', type: 'select', options: ['Baja seguridad', 'Seguridad estándar', 'Alta seguridad', 'Máxima seguridad'] },
    { id: 'visibility_enhancement', name: 'Mejora de visibilidad', type: 'select', options: ['Sin mejora', 'Colores brillantes', 'Material reflectante', 'Iluminación LED'] },
    { id: 'comfort_padding', name: 'Acolchado de comfort', type: 'select', options: ['Sin acolchado', 'Acolchado mínimo', 'Acolchado estándar', 'Acolchado premium'] },
    { id: 'maintenance_requirement', name: 'Requisito de mantenimiento', type: 'select', options: ['Sin mantenimiento', 'Mantenimiento mínimo', 'Mantenimiento regular', 'Mantenimiento frecuente'] }
  ],

  // Productos para perros (categoría general)
  'pets-products-productos-perros': [
    { id: 'dog_breed_suitability', name: 'Adecuado para raza de perro', type: 'tags', options: ['Razas pequeñas', 'Razas medianas', 'Razas grandes', 'Razas gigantes', 'Todas las razas'] },
    { id: 'dog_age_category', name: 'Categoría de edad del perro', type: 'tags', options: ['Cachorros', 'Jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'activity_level', name: 'Nivel de actividad', type: 'select', options: ['Bajo', 'Moderado', 'Alto', 'Muy alto', 'Variable'] },
    { id: 'indoor_outdoor_use', name: 'Uso interior/exterior', type: 'tags', options: ['Solo interior', 'Solo exterior', 'Interior/Exterior', 'Portátil'] },
    { id: 'training_purpose', name: 'Propósito de entrenamiento', type: 'tags', options: ['Entrenamiento básico', 'Comportamiento', 'Ejercicio', 'Estimulación mental', 'No aplica'] }
  ],

  // Fundas de pañal y cambiadores para perros
  'pets-products-fundas-panal-cambiadores': [
    { id: 'cover_material', name: 'Material de la funda', type: 'select', options: ['Algodón', 'Poliéster', 'Bambú', 'Material impermeable', 'Material mixto'] },
    { id: 'size_compatibility', name: 'Compatibilidad de tamaño', type: 'tags', options: ['Perros pequeños', 'Perros medianos', 'Perros grandes', 'Ajustable', 'Universal'] },
    { id: 'waterproof_level', name: 'Nivel de impermeabilidad', type: 'select', options: ['No impermeable', 'Resistente a líquidos', 'Impermeable', 'Completamente sellado'] },
    { id: 'ease_of_cleaning', name: 'Facilidad de limpieza', type: 'select', options: ['Lavado a mano', 'Lavado a máquina', 'Limpieza rápida', 'Auto-limpiante'] },
    { id: 'comfort_features', name: 'Características de comodidad', type: 'tags', options: ['Acolchado', 'Transpirable', 'Suave al tacto', 'Hipoalergénico'] },
    { id: 'attachment_system', name: 'Sistema de sujeción', type: 'select', options: ['Velcro', 'Botones a presión', 'Elástico', 'Cintas ajustables'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Uso doméstico', 'Portátil básico', 'Viajes frecuentes', 'Ultra portátil'] },
    { id: 'odor_control', name: 'Control de olores', type: 'select', options: ['Sin control', 'Control básico', 'Control avanzado', 'Eliminación completa'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso intensivo', 'Uso profesional'] },
    { id: 'design_aesthetics', name: 'Estética del diseño', type: 'select', options: ['Funcional básico', 'Atractivo', 'Elegante', 'Diseño personalizado'] }
  ],

  // Pañales para perros
  'pets-products-panales-perros': [
    { id: 'diaper_type', name: 'Tipo de pañal', type: 'select', options: ['Desechable', 'Reutilizable', 'Híbrido', 'Entrenamiento'] },
    { id: 'absorption_capacity', name: 'Capacidad de absorción', type: 'select', options: ['Baja', 'Media', 'Alta', 'Ultra alta'] },
    { id: 'size_range', name: 'Rango de tamaños', type: 'tags', options: ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large'] },
    { id: 'gender_specific', name: 'Específico por género', type: 'select', options: ['Unisex', 'Específico macho', 'Específico hembra', 'Opciones múltiples'] },
    { id: 'leak_protection', name: 'Protección contra fugas', type: 'select', options: ['Protección básica', 'Protección estándar', 'Protección avanzada', 'Protección máxima'] },
    { id: 'comfort_fit', name: 'Ajuste cómodo', type: 'select', options: ['Ajuste básico', 'Ajuste cómodo', 'Ajuste ergonómico', 'Ajuste personalizable'] },
    { id: 'mobility_impact', name: 'Impacto en movilidad', type: 'select', options: ['Sin restricción', 'Restricción mínima', 'Restricción moderada', 'Movilidad limitada'] },
    { id: 'indicators', name: 'Indicadores', type: 'tags', options: ['Indicador de humedad', 'Código de colores', 'Líneas de ajuste', 'Sin indicadores'] },
    { id: 'fastening_system', name: 'Sistema de sujeción', type: 'select', options: ['Adhesivo', 'Velcro', 'Clips', 'Sistema múltiple'] },
    { id: 'skin_friendliness', name: 'Amigable con la piel', type: 'select', options: ['Estándar', 'Hipoalergénico', 'Dermatológicamente probado', 'Extra suave'] }
  ],

  // Comida para perros
  'pets-products-comida-perros': [
    { id: 'food_type', name: 'Tipo de comida', type: 'select', options: ['Comida seca', 'Comida húmeda', 'Semi-húmeda', 'Comida cruda', 'Comida liofilizada'] },
    { id: 'life_stage', name: 'Etapa de vida', type: 'select', options: ['Cachorro', 'Adulto joven', 'Adulto', 'Senior', 'Todas las etapas'] },
    { id: 'breed_size', name: 'Tamaño de raza', type: 'select', options: ['Razas pequeñas', 'Razas medianas', 'Razas grandes', 'Razas gigantes', 'Universal'] },
    { id: 'special_diet', name: 'Dieta especial', type: 'tags', options: ['Sin granos', 'Orgánico', 'Natural', 'Limitados ingredientes', 'Hipoalergénico'] },
    { id: 'protein_source', name: 'Fuente de proteína', type: 'tags', options: ['Pollo', 'Res', 'Pescado', 'Cordero', 'Proteína vegetal', 'Múltiples fuentes'] },
    { id: 'nutritional_purpose', name: 'Propósito nutricional', type: 'tags', options: ['Mantenimiento', 'Crecimiento', 'Control de peso', 'Digestión sensible', 'Articulaciones'] },
    { id: 'package_size', name: 'Tamaño del paquete', type: 'select', options: ['Muestra (menos 1kg)', 'Pequeño (1-5kg)', 'Mediano (5-15kg)', 'Grande (15kg+)'] },
    { id: 'texture_consistency', name: 'Textura y consistencia', type: 'select', options: ['Croquetas pequeñas', 'Croquetas grandes', 'Paté', 'Trozos en salsa', 'Mezcla'] },
    { id: 'preservation_method', name: 'Método de conservación', type: 'select', options: ['Conservantes naturales', 'Conservantes sintéticos', 'Sin conservantes', 'Refrigeración requerida'] },
    { id: 'veterinary_recommendation', name: 'Recomendación veterinaria', type: 'select', options: ['Alimento general', 'Recomendado por veterinarios', 'Dieta terapéutica', 'Prescripción veterinaria'] }
  ],

  // Casetas para perros
  'pets-products-casetas-perros': [
    { id: 'construction_material', name: 'Material de construcción', type: 'select', options: ['Madera', 'Plástico', 'Metal', 'Tela', 'Material mixto'] },
    { id: 'weather_resistance', name: 'Resistencia al clima', type: 'select', options: ['Interior únicamente', 'Resistente a lluvia', 'Todo clima', 'Extrema resistencia'] },
    { id: 'insulation_level', name: 'Nivel de aislamiento', type: 'select', options: ['Sin aislamiento', 'Aislamiento básico', 'Aislamiento avanzado', 'Aislamiento premium'] },
    { id: 'assembly_difficulty', name: 'Dificultad de ensamblaje', type: 'select', options: ['Pre-ensamblado', 'Fácil ensamblaje', 'Ensamblaje moderado', 'Ensamblaje complejo'] },
    { id: 'ventilation_system', name: 'Sistema de ventilación', type: 'select', options: ['Sin ventilación', 'Ventilación básica', 'Ventilación avanzada', 'Ventilación controlada'] },
    { id: 'floor_type', name: 'Tipo de piso', type: 'select', options: ['Sin piso', 'Piso básico', 'Piso elevado', 'Piso aislado'] },
    { id: 'roof_design', name: 'Diseño del techo', type: 'select', options: ['Techo plano', 'Techo inclinado', 'Techo a dos aguas', 'Techo removible'] },
    { id: 'door_features', name: 'Características de la puerta', type: 'tags', options: ['Puerta básica', 'Puerta con bisagras', 'Puerta removible', 'Cortina de entrada'] },
    { id: 'mobility_features', name: 'Características de movilidad', type: 'select', options: ['Estacionaria', 'Portátil', 'Ruedas opcionales', 'Completamente móvil'] },
    { id: 'security_features', name: 'Características de seguridad', type: 'tags', options: ['Sin seguridad', 'Cierre básico', 'Sistema de bloqueo', 'Seguridad avanzada'] }
  ],

  // Accesorios para casetas y cercados para perros
  'pets-products-accesorios-casetas-cercados': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'tags', options: ['Puertas', 'Ventanas', 'Techos', 'Pisos', 'Sistemas de drenaje', 'Iluminación'] },
    { id: 'compatibility', name: 'Compatibilidad', type: 'select', options: ['Universal', 'Marca específica', 'Modelo específico', 'Personalizable'] },
    { id: 'installation_complexity', name: 'Complejidad de instalación', type: 'select', options: ['Sin instalación', 'Instalación fácil', 'Instalación moderada', 'Instalación profesional'] },
    { id: 'enhancement_purpose', name: 'Propósito de mejora', type: 'tags', options: ['Comfort', 'Seguridad', 'Funcionalidad', 'Estética', 'Durabilidad'] },
    { id: 'seasonal_use', name: 'Uso estacional', type: 'select', options: ['Todo el año', 'Verano', 'Invierno', 'Estaciones específicas'] },
    { id: 'maintenance_requirement', name: 'Requisito de mantenimiento', type: 'select', options: ['Sin mantenimiento', 'Mantenimiento mínimo', 'Mantenimiento regular', 'Mantenimiento intensivo'] },
    { id: 'security_enhancement', name: 'Mejora de seguridad', type: 'select', options: ['Sin mejora', 'Seguridad básica', 'Seguridad avanzada', 'Máxima seguridad'] },
    { id: 'comfort_improvement', name: 'Mejora de confort', type: 'tags', options: ['Temperatura', 'Ventilación', 'Acolchado', 'Iluminación', 'Reducción de ruido'] },
    { id: 'durability_enhancement', name: 'Mejora de durabilidad', type: 'select', options: ['Sin mejora', 'Protección básica', 'Protección avanzada', 'Protección máxima'] },
    { id: 'aesthetic_value', name: 'Valor estético', type: 'select', options: ['Funcional únicamente', 'Estética básica', 'Diseño atractivo', 'Premium design'] }
  ],

  // Casetas y cercados para perros
  'pets-products-casetas-cercados': [
    { id: 'structure_type', name: 'Tipo de estructura', type: 'select', options: ['Solo caseta', 'Solo cercado', 'Caseta con cercado', 'Sistema modular'] },
    { id: 'fencing_material', name: 'Material del cercado', type: 'select', options: ['Alambre', 'Malla metálica', 'Madera', 'Plástico', 'Material mixto'] },
    { id: 'height_options', name: 'Opciones de altura', type: 'select', options: ['Baja (hasta 1m)', 'Media (1-1.5m)', 'Alta (1.5-2m)', 'Extra alta (2m+)'] },
    { id: 'area_coverage', name: 'Cobertura de área', type: 'select', options: ['Pequeña (menos 5m²)', 'Mediana (5-15m²)', 'Grande (15-30m²)', 'Extra grande (30m²+)'] },
    { id: 'ground_anchoring', name: 'Anclaje al suelo', type: 'select', options: ['Sin anclaje', 'Estacas básicas', 'Anclaje profundo', 'Base de concreto'] },
    { id: 'gate_system', name: 'Sistema de puerta', type: 'select', options: ['Sin puerta', 'Puerta básica', 'Puerta con cerradura', 'Sistema de puertas múltiples'] },
    { id: 'expansion_capability', name: 'Capacidad de expansión', type: 'select', options: ['Tamaño fijo', 'Expansión limitada', 'Altamente expandible', 'Sistema modular infinito'] },
    { id: 'roof_coverage', name: 'Cobertura de techo', type: 'select', options: ['Sin techo', 'Techo parcial', 'Techo completo', 'Techo retráctil'] },
    { id: 'escape_prevention', name: 'Prevención de escape', type: 'select', options: ['Básica', 'Estándar', 'Alta seguridad', 'Escape-proof'] },
    { id: 'visibility_level', name: 'Nivel de visibilidad', type: 'select', options: ['Completamente abierto', 'Parcialmente visible', 'Limitada visibilidad', 'Privacidad completa'] }
  ],

  // Juguetes para perros
  'pets-products-juguetes-perros': [
    { id: 'toy_category', name: 'Categoría de juguete', type: 'select', options: ['Masticable', 'Interactivo', 'Peluche', 'Pelota', 'Cuerda', 'Puzzle'] },
    { id: 'primary_purpose', name: 'Propósito principal', type: 'tags', options: ['Masticación', 'Ejercicio', 'Estimulación mental', 'Comfort', 'Entrenamiento'] },
    { id: 'durability_level', name: 'Nivel de durabilidad', type: 'select', options: ['Uso suave', 'Uso moderado', 'Uso intensivo', 'Destructores extremos'] },
    { id: 'sound_features', name: 'Características de sonido', type: 'select', options: ['Silencioso', 'Squeaker básico', 'Múltiples sonidos', 'Sonidos interactivos'] },
    { id: 'interactive_level', name: 'Nivel interactivo', type: 'select', options: ['Pasivo', 'Interacción básica', 'Altamente interactivo', 'Tecnología avanzada'] },
    { id: 'safety_rating', name: 'Calificación de seguridad', type: 'select', options: ['Supervisión requerida', 'Seguridad básica', 'Alta seguridad', 'Ultra seguro'] },
    { id: 'material_composition', name: 'Composición del material', type: 'tags', options: ['Caucho natural', 'Plástico', 'Tela', 'Madera', 'Material mixto'] },
    { id: 'cleaning_difficulty', name: 'Dificultad de limpieza', type: 'select', options: ['Difícil de limpiar', 'Limpieza estándar', 'Fácil limpieza', 'Auto-limpiante'] },
    { id: 'treat_dispensing', name: 'Dispensador de premios', type: 'select', options: ['Sin dispensador', 'Cavidad para premios', 'Dispensador ajustable', 'Sistema automático'] },
    { id: 'mental_stimulation', name: 'Estimulación mental', type: 'select', options: ['Mínima', 'Básica', 'Moderada', 'Alta estimulación'] }
  ],

  // Cintas de caminar para perros
  'pets-products-cintas-caminar': [
    { id: 'treadmill_size', name: 'Tamaño de la cinta', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande', 'Ajustable'] },
    { id: 'weight_capacity', name: 'Capacidad de peso', type: 'select', options: ['Hasta 10kg', '10-25kg', '25-50kg', '50kg+', 'Industrial'] },
    { id: 'speed_range', name: 'Rango de velocidad', type: 'select', options: ['Muy lenta', 'Lenta-moderada', 'Moderada-rápida', 'Variable completa'] },
    { id: 'control_system', name: 'Sistema de control', type: 'select', options: ['Manual básico', 'Control remoto', 'Control digital', 'Control inteligente'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Paradas de emergencia', 'Barandas laterales', 'Superficie antideslizante', 'Sistema de monitoreo'] },
    { id: 'noise_level', name: 'Nivel de ruido', type: 'select', options: ['Muy silencioso', 'Silencioso', 'Ruido moderado', 'Ruidoso'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Manual', 'Eléctrico básico', 'Motor avanzado', 'Sistema híbrido'] },
    { id: 'assembly_requirement', name: 'Requisito de ensamblaje', type: 'select', options: ['Pre-ensamblado', 'Ensamblaje mínimo', 'Ensamblaje moderado', 'Ensamblaje complejo'] },
    { id: 'portability', name: 'Portabilidad', type: 'select', options: ['Estacionario', 'Portátil con esfuerzo', 'Fácilmente portátil', 'Ultra portátil'] },
    { id: 'monitoring_features', name: 'Características de monitoreo', type: 'tags', options: ['Sin monitoreo', 'Tiempo básico', 'Velocidad/Distancia', 'Monitoreo completo'] }
  ],

  // Premios para perros
  'pets-products-premios-perros': [
    { id: 'treat_type', name: 'Tipo de premio', type: 'select', options: ['Galletas', 'Masticables', 'Premios blandos', 'Premios liofilizados', 'Premios naturales'] },
    { id: 'primary_ingredient', name: 'Ingrediente principal', type: 'tags', options: ['Pollo', 'Res', 'Pescado', 'Cordero', 'Vegetales', 'Frutas'] },
    { id: 'training_suitability', name: 'Adecuado para entrenamiento', type: 'select', options: ['No ideal', 'Entrenamiento básico', 'Entrenamiento avanzado', 'Entrenamiento profesional'] },
    { id: 'size_consistency', name: 'Consistencia de tamaño', type: 'select', options: ['Tamaños variados', 'Tamaño estándar', 'Tamaño uniforme', 'Tamaño personalizable'] },
    { id: 'caloric_content', name: 'Contenido calórico', type: 'select', options: ['Bajo en calorías', 'Contenido moderado', 'Alto en calorías', 'Variable'] },
    { id: 'special_benefits', name: 'Beneficios especiales', type: 'tags', options: ['Higiene dental', 'Digestión', 'Articulaciones', 'Pelaje brillante', 'Solo premio'] },
    { id: 'texture_hardness', name: 'Textura y dureza', type: 'select', options: ['Muy suave', 'Suave', 'Semi-duro', 'Duro'] },
    { id: 'preservation_method', name: 'Método de conservación', type: 'select', options: ['Natural', 'Deshidratado', 'Liofilizado', 'Con conservantes'] },
    { id: 'allergen_information', name: 'Información de alérgenos', type: 'tags', options: ['Sin alérgenos conocidos', 'Contiene granos', 'Contiene lácteos', 'Hipoalergénico'] },
    { id: 'package_freshness', name: 'Frescura del paquete', type: 'select', options: ['Sellado básico', 'Sellado hermético', 'Empaque resellable', 'Control de frescura'] }
  ],

  // Comida para perros sin prescripción médica
  'pets-products-comida-perros-sin-prescripcion': [
    { id: 'food_type_general', name: 'Tipo de comida general', type: 'select', options: ['Comida seca', 'Comida húmeda', 'Semi-húmeda', 'Comida cruda', 'Comida liofilizada'] },
    { id: 'life_stage_general', name: 'Etapa de vida general', type: 'select', options: ['Cachorro', 'Adulto joven', 'Adulto', 'Senior', 'Todas las etapas'] },
    { id: 'breed_size_general', name: 'Tamaño de raza general', type: 'select', options: ['Razas pequeñas', 'Razas medianas', 'Razas grandes', 'Razas gigantes', 'Universal'] },
    { id: 'special_diet_general', name: 'Dieta especial general', type: 'tags', options: ['Sin granos', 'Orgánico', 'Natural', 'Limitados ingredientes', 'Hipoalergénico', 'Sin conservantes'] },
    { id: 'protein_source_general', name: 'Fuente de proteína general', type: 'tags', options: ['Pollo', 'Res', 'Pescado', 'Cordero', 'Pavo', 'Proteína vegetal', 'Múltiples fuentes'] },
    { id: 'nutritional_purpose_general', name: 'Propósito nutricional general', type: 'tags', options: ['Mantenimiento', 'Crecimiento', 'Control de peso', 'Digestión sensible', 'Articulaciones', 'Energía alta'] },
    { id: 'package_size_general', name: 'Tamaño del paquete general', type: 'select', options: ['Muestra (menos 1kg)', 'Pequeño (1-5kg)', 'Mediano (5-15kg)', 'Grande (15-25kg)', 'Extra grande (25kg+)'] },
    { id: 'texture_consistency_general', name: 'Textura y consistencia general', type: 'select', options: ['Croquetas pequeñas', 'Croquetas grandes', 'Paté', 'Trozos en salsa', 'Mezcla texturizada'] },
    { id: 'price_category', name: 'Categoría de precio', type: 'select', options: ['Económico', 'Gama media', 'Premium', 'Super premium'] },
    { id: 'brand_recognition', name: 'Reconocimiento de marca', type: 'select', options: ['Marca nueva', 'Marca conocida', 'Marca premium', 'Marca líder'] },
    { id: 'availability', name: 'Disponibilidad', type: 'select', options: ['Disponible ampliamente', 'Disponibilidad limitada', 'Solo tiendas especializadas', 'Solo online'] },
    { id: 'flavor_variety', name: 'Variedad de sabores', type: 'select', options: ['Sabor único', 'Pocos sabores', 'Amplia variedad', 'Sabores rotativos'] }
  ],

  // Comida para perros con prescripción médica
  'pets-products-comida-perros-con-prescripcion': [
    { id: 'medical_condition', name: 'Condición médica', type: 'tags', options: ['Problemas renales', 'Problemas hepáticos', 'Diabetes', 'Alergias alimentarias', 'Problemas digestivos', 'Obesidad', 'Problemas cardíacos'] },
    { id: 'prescription_requirement', name: 'Requisito de prescripción', type: 'select', options: ['Prescripción veterinaria requerida', 'Recomendación veterinaria', 'Consulta veterinaria sugerida', 'Supervisión veterinaria'] },
    { id: 'therapeutic_purpose', name: 'Propósito terapéutico', type: 'tags', options: ['Control de peso', 'Función renal', 'Función hepática', 'Control glucémico', 'Eliminación de alérgenos', 'Digestión facilitada'] },
    { id: 'ingredient_restriction', name: 'Restricción de ingredientes', type: 'tags', options: ['Proteína limitada', 'Fósforo reducido', 'Sodio reducido', 'Grasa reducida', 'Carbohidratos controlados', 'Sin alérgenos específicos'] },
    { id: 'monitoring_requirement', name: 'Requisito de monitoreo', type: 'select', options: ['Sin monitoreo', 'Monitoreo básico', 'Monitoreo regular', 'Monitoreo intensivo'] },
    { id: 'transition_period', name: 'Período de transición', type: 'select', options: ['Transición inmediata', 'Transición gradual 3-5 días', 'Transición gradual 7-10 días', 'Transición extendida'] },
    { id: 'clinical_evidence', name: 'Evidencia clínica', type: 'select', options: ['Evidencia básica', 'Estudios clínicos', 'Evidencia extensiva', 'Respaldo científico completo'] },
    { id: 'side_effects_monitoring', name: 'Monitoreo de efectos secundarios', type: 'select', options: ['Sin efectos conocidos', 'Monitoreo básico', 'Monitoreo cuidadoso', 'Monitoreo intensivo'] },
    { id: 'long_term_use', name: 'Uso a largo plazo', type: 'select', options: ['Uso temporal', 'Uso prolongado', 'Uso de por vida', 'Según evolución'] },
    { id: 'veterinary_brand', name: 'Marca veterinaria', type: 'select', options: ['Marca comercial', 'Marca veterinaria', 'Marca terapéutica', 'Marca especializada'] },
    { id: 'dosage_precision', name: 'Precisión de dosificación', type: 'select', options: ['Dosificación general', 'Dosificación específica', 'Dosificación precisa', 'Dosificación personalizada'] },
    { id: 'contraindications', name: 'Contraindicaciones', type: 'tags', options: ['Sin contraindicaciones', 'Contraindicaciones menores', 'Contraindicaciones importantes', 'Consultar veterinario'] }
  ],

  // Corrales para perros
  'pets-products-corrales-perros': [
    { id: 'corral_shape', name: 'Forma del corral', type: 'select', options: ['Cuadrado', 'Rectangular', 'Octagonal', 'Circular', 'Forma personalizable'] },
    { id: 'panel_configuration', name: 'Configuración de paneles', type: 'select', options: ['4 paneles', '6 paneles', '8 paneles', '12+ paneles', 'Configuración modular'] },
    { id: 'panel_height', name: 'Altura de paneles', type: 'select', options: ['Baja (30-45cm)', 'Media (45-60cm)', 'Alta (60-90cm)', 'Extra alta (90cm+)', 'Altura ajustable'] },
    { id: 'panel_material', name: 'Material de paneles', type: 'select', options: ['Metal recubierto', 'Alambre galvanizado', 'Plástico resistente', 'Madera tratada', 'Material mixto'] },
    { id: 'ground_attachment', name: 'Sujeción al suelo', type: 'select', options: ['Sin sujeción', 'Estacas incluidas', 'Sistema de anclaje', 'Base con peso'] },
    { id: 'door_system', name: 'Sistema de puerta', type: 'select', options: ['Sin puerta', 'Puerta con pestillo', 'Puerta doble seguridad', 'Múltiples puertas'] },
    { id: 'portability_level', name: 'Nivel de portabilidad', type: 'select', options: ['Estacionario', 'Semi-portátil', 'Portátil', 'Ultra portátil'] },
    { id: 'setup_complexity', name: 'Complejidad de instalación', type: 'select', options: ['Sin herramientas', 'Herramientas básicas', 'Instalación moderada', 'Instalación profesional'] },
    { id: 'expansion_options', name: 'Opciones de expansión', type: 'select', options: ['Tamaño fijo', 'Expansión limitada', 'Altamente expandible', 'Sistema modular infinito'] },
    { id: 'surface_compatibility', name: 'Compatibilidad de superficie', type: 'tags', options: ['Césped', 'Concreto', 'Arena', 'Gravilla', 'Superficies múltiples'] }
  ],

  // Cercados para perros
  'pets-products-cercados-perros': [
    { id: 'fencing_style', name: 'Estilo de cercado', type: 'select', options: ['Malla eslabonada', 'Listones verticales', 'Paneles sólidos', 'Diseño decorativo', 'Estilo invisible'] },
    { id: 'fence_height_options', name: 'Opciones de altura del cercado', type: 'select', options: ['Bajo (hasta 1m)', 'Medio (1-1.5m)', 'Alto (1.5-2m)', 'Extra alto (2m+)', 'Altura personalizable'] },
    { id: 'perimeter_coverage', name: 'Cobertura de perímetro', type: 'select', options: ['Área pequeña (hasta 50m)', 'Área mediana (50-150m)', 'Área grande (150-300m)', 'Área extensa (300m+)'] },
    { id: 'installation_method', name: 'Método de instalación', type: 'select', options: ['Postes clavados', 'Postes con concreto', 'Sistema de clips', 'Instalación temporal'] },
    { id: 'security_level', name: 'Nivel de seguridad', type: 'select', options: ['Contención básica', 'Seguridad estándar', 'Alta seguridad', 'Máxima seguridad'] },
    { id: 'visibility_through', name: 'Visibilidad a través del cercado', type: 'select', options: ['Completamente visible', 'Parcialmente visible', 'Visibilidad limitada', 'Privacidad completa'] },
    { id: 'weather_durability', name: 'Durabilidad climática', type: 'select', options: ['Protección básica', 'Resistente a intemperie', 'Todo clima', 'Extrema durabilidad'] },
    { id: 'maintenance_needs', name: 'Necesidades de mantenimiento', type: 'select', options: ['Libre de mantenimiento', 'Mantenimiento mínimo', 'Mantenimiento regular', 'Mantenimiento intensivo'] },
    { id: 'aesthetic_appeal', name: 'Atractivo estético', type: 'select', options: ['Funcional básico', 'Apariencia estándar', 'Diseño atractivo', 'Premium decorativo'] },
    { id: 'dig_prevention', name: 'Prevención de excavación', type: 'select', options: ['Sin prevención', 'Barrera básica', 'Sistema anti-excavación', 'Prevención completa'] }
  ],

  // Casetas para perros de interior
  'pets-products-casetas-interior': [
    { id: 'indoor_material', name: 'Material para interior', type: 'select', options: ['Tela acolchada', 'Plástico suave', 'Madera interior', 'Metal recubierto', 'Material híbrido'] },
    { id: 'floor_protection', name: 'Protección del piso', type: 'select', options: ['Sin protección', 'Base antideslizante', 'Protector de piso', 'Base elevada'] },
    { id: 'noise_insulation', name: 'Aislamiento acústico', type: 'select', options: ['Sin aislamiento', 'Reducción básica', 'Buen aislamiento', 'Excelente aislamiento'] },
    { id: 'ventilation_indoor', name: 'Ventilación interior', type: 'select', options: ['Ventilación natural', 'Ventilación mejorada', 'Sistema de ventilación', 'Ventilación controlada'] },
    { id: 'space_efficiency', name: 'Eficiencia de espacio', type: 'select', options: ['Requiere espacio amplio', 'Eficiente en espacio', 'Compacto', 'Ultra compacto'] },
    { id: 'furniture_compatibility', name: 'Compatibilidad con muebles', type: 'select', options: ['Independiente', 'Parcialmente integrable', 'Integrable', 'Diseño mueble'] },
    { id: 'cleaning_accessibility', name: 'Accesibilidad para limpieza', type: 'select', options: ['Difícil acceso', 'Acceso estándar', 'Fácil acceso', 'Acceso completo'] },
    { id: 'temperature_control', name: 'Control de temperatura', type: 'select', options: ['Sin control', 'Aislamiento básico', 'Control térmico', 'Sistema climatizado'] },
    { id: 'comfort_features', name: 'Características de confort', type: 'tags', options: ['Cojín incluido', 'Paredes acolchadas', 'Entrada suave', 'Múltiples comodidades'] },
    { id: 'assembly_indoor', name: 'Ensamblaje interior', type: 'select', options: ['Pre-ensamblado', 'Ensamblaje simple', 'Instalación moderada', 'Configuración compleja'] }
  ],

  // Casetas para perros al aire libre
  'pets-products-casetas-aire-libre': [
    { id: 'weather_protection', name: 'Protección climática', type: 'select', options: ['Protección básica', 'Resistente a lluvia', 'Todo clima', 'Extrema protección'] },
    { id: 'roof_type', name: 'Tipo de techo', type: 'select', options: ['Techo plano', 'Techo inclinado', 'Techo a dos aguas', 'Techo con alero', 'Techo removible'] },
    { id: 'foundation_type', name: 'Tipo de base', type: 'select', options: ['Sin base', 'Base elevada', 'Base aislada', 'Plataforma completa'] },
    { id: 'insulation_outdoor', name: 'Aislamiento exterior', type: 'select', options: ['Sin aislamiento', 'Aislamiento básico', 'Aislamiento avanzado', 'Aislamiento premium'] },
    { id: 'uv_protection', name: 'Protección UV', type: 'select', options: ['Sin protección UV', 'Protección básica', 'Protección avanzada', 'Protección máxima'] },
    { id: 'drainage_system', name: 'Sistema de drenaje', type: 'select', options: ['Sin drenaje', 'Drenaje básico', 'Sistema de drenaje', 'Drenaje avanzado'] },
    { id: 'wind_resistance', name: 'Resistencia al viento', type: 'select', options: ['Resistencia básica', 'Resistencia moderada', 'Alta resistencia', 'Resistencia extrema'] },
    { id: 'sun_shade', name: 'Sombra solar', type: 'select', options: ['Sin sombra', 'Sombra parcial', 'Buena sombra', 'Sombra completa'] },
    { id: 'predator_protection', name: 'Protección contra depredadores', type: 'select', options: ['Sin protección', 'Protección básica', 'Protección avanzada', 'Protección máxima'] },
    { id: 'seasonal_adaptability', name: 'Adaptabilidad estacional', type: 'select', options: ['Una estación', 'Dos estaciones', 'Tres estaciones', 'Cuatro estaciones'] }
  ],

  // Casetas para perros portátiles
  'pets-products-casetas-portatiles': [
    { id: 'portability_mechanism', name: 'Mecanismo de portabilidad', type: 'select', options: ['Plegable', 'Desmontable', 'Inflable', 'Modular portátil'] },
    { id: 'setup_time', name: 'Tiempo de instalación', type: 'select', options: ['Menos de 1 minuto', '1-5 minutos', '5-15 minutos', '15+ minutos'] },
    { id: 'transport_size', name: 'Tamaño de transporte', type: 'select', options: ['Ultra compacto', 'Compacto', 'Tamaño moderado', 'Voluminoso'] },
    { id: 'weight_portability', name: 'Peso para portabilidad', type: 'select', options: ['Ultra liviano (menos 2kg)', 'Liviano (2-5kg)', 'Moderado (5-15kg)', 'Pesado (15kg+)'] },
    { id: 'carrying_system', name: 'Sistema de transporte', type: 'select', options: ['Sin sistema', 'Bolsa de transporte', 'Mochila integrada', 'Sistema con ruedas'] },
    { id: 'stability_portable', name: 'Estabilidad portátil', type: 'select', options: ['Estabilidad básica', 'Estabilidad buena', 'Alta estabilidad', 'Estabilidad máxima'] },
    { id: 'durability_portable', name: 'Durabilidad portátil', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso frecuente', 'Uso intensivo'] },
    { id: 'multi_use_capability', name: 'Capacidad de uso múltiple', type: 'tags', options: ['Solo caseta', 'Caseta/transportín', 'Múltiples configuraciones', 'Sistema adaptable'] },
    { id: 'storage_features', name: 'Características de almacenamiento', type: 'tags', options: ['Sin almacenamiento', 'Bolsillos básicos', 'Compartimentos múltiples', 'Sistema de almacenamiento'] },
    { id: 'travel_compatibility', name: 'Compatibilidad de viaje', type: 'tags', options: ['Camping', 'Playa', 'Viajes en auto', 'Vuelos', 'Universal'] }
  ],

  // Correas para mascotas (categoría general)
  'pets-products-correas': [
    { id: 'leash_length', name: 'Longitud de la correa', type: 'select', options: ['Corta (1-2m)', 'Estándar (2-3m)', 'Larga (3-5m)', 'Extra larga (5m+)', 'Ajustable'] },
    { id: 'material_construction', name: 'Material de construcción', type: 'select', options: ['Nylon', 'Cuero', 'Cuerda', 'Metal', 'Material mixto'] },
    { id: 'handle_comfort', name: 'Comodidad del mango', type: 'select', options: ['Mango básico', 'Acolchado', 'Ergonómico', 'Antideslizante'] },
    { id: 'weight_capacity', name: 'Capacidad de peso', type: 'select', options: ['Pequeño (hasta 10kg)', 'Mediano (10-25kg)', 'Grande (25-50kg)', 'Extra grande (50kg+)'] },
    { id: 'weather_resistance', name: 'Resistencia al clima', type: 'select', options: ['Básica', 'Resistente al agua', 'Todo clima', 'Extrema resistencia'] }
  ],

  // Correas dobles para mascotas
  'pets-products-correas-dobles': [
    { id: 'dual_configuration', name: 'Configuración dual', type: 'select', options: ['Dos mascotas separadas', 'Una correa dividida', 'Sistema intercambiable', 'Configuración modular'] },
    { id: 'length_adjustment', name: 'Ajuste de longitud', type: 'select', options: ['Longitud fija', 'Ajuste básico', 'Ajuste independiente', 'Ajuste sincronizado'] },
    { id: 'tangle_prevention', name: 'Prevención de enredos', type: 'select', options: ['Sin prevención', 'Diseño anti-enredo', 'Sistema giratorio', 'Tecnología avanzada'] },
    { id: 'weight_distribution', name: 'Distribución de peso', type: 'select', options: ['Distribución básica', 'Equilibrio mejorado', 'Sistema balanceado', 'Distribución optimizada'] },
    { id: 'control_level', name: 'Nivel de control', type: 'select', options: ['Control básico', 'Control moderado', 'Alto control', 'Control máximo'] },
    { id: 'size_compatibility', name: 'Compatibilidad de tamaños', type: 'select', options: ['Mascotas similares', 'Tamaños diferentes', 'Altamente adaptable', 'Universal'] },
    { id: 'separation_distance', name: 'Distancia de separación', type: 'select', options: ['Cercanas', 'Separación moderada', 'Amplia separación', 'Distancia ajustable'] },
    { id: 'handle_design', name: 'Diseño del mango', type: 'select', options: ['Mango único', 'Mangos duales', 'Mango ergonómico', 'Sistema de mangos'] },
    { id: 'training_suitability', name: 'Adecuado para entrenamiento', type: 'select', options: ['No ideal', 'Entrenamiento básico', 'Entrenamiento avanzado', 'Entrenamiento especializado'] },
    { id: 'storage_convenience', name: 'Conveniencia de almacenamiento', type: 'select', options: ['Almacenamiento básico', 'Compacto', 'Fácil almacenamiento', 'Sistema de almacenamiento'] }
  ],

  // Correas manos libres
  'pets-products-correas-manos-libres': [
    { id: 'attachment_system', name: 'Sistema de sujeción', type: 'select', options: ['Cinturón básico', 'Arnés corporal', 'Sistema de pecho', 'Múltiples puntos'] },
    { id: 'activity_type', name: 'Tipo de actividad', type: 'tags', options: ['Caminar', 'Trotar', 'Correr', 'Ciclismo', 'Actividades múltiples'] },
    { id: 'shock_absorption', name: 'Absorción de impactos', type: 'select', options: ['Sin absorción', 'Absorción básica', 'Absorción avanzada', 'Sistema de amortiguación'] },
    { id: 'quick_release', name: 'Liberación rápida', type: 'select', options: ['Sin liberación rápida', 'Liberación básica', 'Sistema de liberación', 'Liberación de emergencia'] },
    { id: 'waist_size_range', name: 'Rango de talla de cintura', type: 'select', options: ['Talla única', 'Pequeña-Mediana', 'Mediana-Grande', 'Totalmente ajustable'] },
    { id: 'comfort_padding', name: 'Acolchado de confort', type: 'select', options: ['Sin acolchado', 'Acolchado básico', 'Acolchado premium', 'Sistema de confort'] },
    { id: 'reflective_features', name: 'Características reflectivas', type: 'select', options: ['Sin reflectivos', 'Rayas reflectivas', 'Paneles reflectivos', 'Sistema de alta visibilidad'] },
    { id: 'storage_pockets', name: 'Bolsillos de almacenamiento', type: 'select', options: ['Sin bolsillos', 'Bolsillo básico', 'Múltiples bolsillos', 'Sistema de almacenamiento'] },
    { id: 'leash_retraction', name: 'Retracción de correa', type: 'select', options: ['Longitud fija', 'Retracción manual', 'Retracción automática', 'Sistema inteligente'] },
    { id: 'exercise_intensity', name: 'Intensidad de ejercicio', type: 'select', options: ['Actividad suave', 'Moderada', 'Intensa', 'Extrema'] }
  ],

  // Correas antitirones
  'pets-products-correas-antitirones': [
    { id: 'anti_pull_mechanism', name: 'Mecanismo antitirones', type: 'select', options: ['Resistencia gradual', 'Sistema de freno', 'Redirección', 'Tecnología avanzada'] },
    { id: 'training_effectiveness', name: 'Efectividad de entrenamiento', type: 'select', options: ['Efectividad básica', 'Moderadamente efectiva', 'Altamente efectiva', 'Resultados garantizados'] },
    { id: 'comfort_for_pet', name: 'Comodidad para la mascota', type: 'select', options: ['Confort básico', 'Cómodo', 'Muy cómodo', 'Máximo confort'] },
    { id: 'behavior_modification', name: 'Modificación del comportamiento', type: 'select', options: ['Corrección suave', 'Corrección moderada', 'Corrección firme', 'Sistema progresivo'] },
    { id: 'size_adjustability', name: 'Ajustabilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Ajuste básico', 'Altamente ajustable', 'Sistema universal'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Durabilidad básica', 'Resistente', 'Muy duradero', 'Extrema durabilidad'] },
    { id: 'immediate_effect', name: 'Efecto inmediato', type: 'select', options: ['Efecto gradual', 'Efecto moderado', 'Efecto inmediato', 'Respuesta instantánea'] },
    { id: 'professional_recommendation', name: 'Recomendación profesional', type: 'select', options: ['Uso general', 'Recomendado por entrenadores', 'Aprobado por veterinarios', 'Estándar profesional'] },
    { id: 'learning_curve', name: 'Curva de aprendizaje', type: 'select', options: ['Fácil de usar', 'Requiere práctica', 'Entrenamiento requerido', 'Uso profesional'] },
    { id: 'stress_level', name: 'Nivel de estrés', type: 'select', options: ['Sin estrés', 'Estrés mínimo', 'Estrés moderado', 'Requiere supervisión'] }
  ],

  // Cables deslizantes
  'pets-products-cables-deslizantes': [
    { id: 'cable_length', name: 'Longitud del cable', type: 'select', options: ['Corto (5-10m)', 'Mediano (10-20m)', 'Largo (20-30m)', 'Extra largo (30m+)'] },
    { id: 'cable_material', name: 'Material del cable', type: 'select', options: ['Cable de acero', 'Cable recubierto', 'Cuerda sintética', 'Material especializado'] },
    { id: 'installation_method', name: 'Método de instalación', type: 'select', options: ['Instalación temporal', 'Semi-permanente', 'Instalación permanente', 'Sistema modular'] },
    { id: 'anchor_points', name: 'Puntos de anclaje', type: 'select', options: ['Dos puntos', 'Múltiples puntos', 'Sistema flexible', 'Configuración personalizable'] },
    { id: 'sliding_mechanism', name: 'Mecanismo deslizante', type: 'select', options: ['Deslizamiento básico', 'Sistema de rodillos', 'Deslizamiento suave', 'Tecnología avanzada'] },
    { id: 'weather_protection', name: 'Protección climática', type: 'select', options: ['Protección básica', 'Resistente a intemperie', 'Todo clima', 'Protección extrema'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Paradas de emergencia', 'Limitadores de velocidad', 'Sistema de freno', 'Seguridad múltiple'] },
    { id: 'noise_level', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Ruido mínimo', 'Ruido moderado', 'Puede ser ruidoso'] },
    { id: 'maintenance_requirement', name: 'Requisito de mantenimiento', type: 'select', options: ['Libre de mantenimiento', 'Mantenimiento mínimo', 'Mantenimiento regular', 'Mantenimiento frecuente'] },
    { id: 'terrain_compatibility', name: 'Compatibilidad con terreno', type: 'tags', options: ['Terreno plano', 'Terreno irregular', 'Pendientes', 'Universal'] }
  ],

  // Correas estándar
  'pets-products-correas-estandar': [
    { id: 'standard_length', name: 'Longitud estándar', type: 'select', options: ['1 metro', '1.5 metros', '2 metros', '3 metros', 'Longitud personalizable'] },
    { id: 'material_quality', name: 'Calidad del material', type: 'select', options: ['Calidad básica', 'Calidad estándar', 'Alta calidad', 'Calidad premium'] },
    { id: 'clasp_type', name: 'Tipo de broche', type: 'select', options: ['Broche básico', 'Broche giratorio', 'Broche de seguridad', 'Sistema de broche avanzado'] },
    { id: 'width_options', name: 'Opciones de ancho', type: 'select', options: ['Delgada (1cm)', 'Estándar (1.5-2cm)', 'Ancha (2.5-3cm)', 'Extra ancha (3cm+)'] },
    { id: 'color_variety', name: 'Variedad de colores', type: 'select', options: ['Color único', 'Pocos colores', 'Amplia gama', 'Colores personalizados'] },
    { id: 'everyday_use', name: 'Uso diario', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso diario', 'Uso intensivo'] },
    { id: 'budget_category', name: 'Categoría de presupuesto', type: 'select', options: ['Económico', 'Gama media', 'Premium', 'Lujo'] },
    { id: 'versatility', name: 'Versatilidad', type: 'select', options: ['Uso específico', 'Versatilidad básica', 'Muy versátil', 'Universal'] },
    { id: 'brand_recognition', name: 'Reconocimiento de marca', type: 'select', options: ['Marca genérica', 'Marca conocida', 'Marca premium', 'Marca líder'] },
    { id: 'warranty_coverage', name: 'Cobertura de garantía', type: 'select', options: ['Sin garantía', 'Garantía básica', 'Garantía extendida', 'Garantía completa'] }
  ],

  // Correas de entrenamiento
  'pets-products-correas-entrenamiento': [
    { id: 'training_purpose', name: 'Propósito de entrenamiento', type: 'tags', options: ['Obediencia básica', 'Control de tirones', 'Socialización', 'Entrenamiento avanzado', 'Rehabilitación'] },
    { id: 'length_variability', name: 'Variabilidad de longitud', type: 'select', options: ['Longitud fija', 'Dos longitudes', 'Múltiples longitudes', 'Ajuste continuo'] },
    { id: 'control_features', name: 'Características de control', type: 'tags', options: ['Control de velocidad', 'Paradas controladas', 'Dirección guiada', 'Señales táctiles'] },
    { id: 'trainer_recommended', name: 'Recomendado por entrenadores', type: 'select', options: ['No específicamente', 'Recomendado', 'Altamente recomendado', 'Estándar profesional'] },
    { id: 'skill_level_required', name: 'Nivel de habilidad requerido', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'] },
    { id: 'feedback_mechanism', name: 'Mecanismo de retroalimentación', type: 'select', options: ['Sin retroalimentación', 'Retroalimentación básica', 'Señales claras', 'Sistema de comunicación'] },
    { id: 'progressive_training', name: 'Entrenamiento progresivo', type: 'select', options: ['Entrenamiento básico', 'Progresión gradual', 'Sistema progresivo', 'Entrenamiento adaptativo'] },
    { id: 'behavioral_focus', name: 'Enfoque comportamental', type: 'tags', options: ['Atención', 'Obediencia', 'Socialización', 'Corrección', 'Refuerzo positivo'] },
    { id: 'age_suitability', name: 'Adecuado para edad', type: 'select', options: ['Cachorros', 'Jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'training_environment', name: 'Ambiente de entrenamiento', type: 'tags', options: ['Interior', 'Exterior', 'Parques', 'Calles', 'Ambientes múltiples'] }
  ],

  // Medicamentos para mascotas (categoría general)
  'pets-products-medicamentos': [
    { id: 'prescription_status', name: 'Estado de prescripción', type: 'select', options: ['Sin receta', 'Con receta veterinaria', 'Medicamento controlado', 'Solo uso veterinario'] },
    { id: 'administration_route', name: 'Vía de administración', type: 'select', options: ['Oral', 'Tópica', 'Inyectable', 'Inhalada', 'Múltiples vías'] },
    { id: 'dosage_form', name: 'Forma de dosificación', type: 'select', options: ['Tabletas', 'Cápsulas', 'Líquido', 'Crema/Gel', 'Inyección'] },
    { id: 'veterinary_supervision', name: 'Supervisión veterinaria', type: 'select', options: ['No requerida', 'Recomendada', 'Requerida', 'Estricta supervisión'] },
    { id: 'side_effects_profile', name: 'Perfil de efectos secundarios', type: 'select', options: ['Mínimos', 'Leves', 'Moderados', 'Requiere monitoreo'] }
  ],

  // Alivio de alergias
  'pets-products-alivio-alergias': [
    { id: 'allergy_type', name: 'Tipo de alergia', type: 'tags', options: ['Alimentaria', 'Ambiental', 'Estacional', 'Dermatitis atópica', 'Múltiples alergias'] },
    { id: 'active_ingredient_allergy', name: 'Ingrediente activo', type: 'select', options: ['Antihistamínicos', 'Corticosteroides', 'Inhibidores de citoquinas', 'Inmunosupresores', 'Combinación'] },
    { id: 'symptom_relief', name: 'Alivio de síntomas', type: 'tags', options: ['Picazón', 'Inflamación', 'Enrojecimiento', 'Ronchas', 'Síntomas respiratorios'] },
    { id: 'onset_of_action', name: 'Inicio de acción', type: 'select', options: ['Inmediato (minutos)', 'Rápido (1-2 horas)', 'Moderado (2-6 horas)', 'Gradual (6-24 horas)'] },
    { id: 'duration_of_effect', name: 'Duración del efecto', type: 'select', options: ['Corta (4-6 horas)', 'Moderada (6-12 horas)', 'Larga (12-24 horas)', 'Extendida (24+ horas)'] },
    { id: 'severity_treatment', name: 'Severidad del tratamiento', type: 'select', options: ['Síntomas leves', 'Moderados', 'Severos', 'Todos los niveles'] },
    { id: 'long_term_use', name: 'Uso a largo plazo', type: 'select', options: ['Solo agudo', 'Uso ocasional', 'Uso prolongado', 'Terapia de mantenimiento'] },
    { id: 'age_restrictions', name: 'Restricciones de edad', type: 'select', options: ['Sin restricción', 'Adultos únicamente', 'Requiere ajuste', 'Consultar veterinario'] },
    { id: 'drug_interactions', name: 'Interacciones medicamentosas', type: 'select', options: ['Sin interacciones conocidas', 'Interacciones menores', 'Requiere precaución', 'Consultar veterinario'] },
    { id: 'monitoring_required', name: 'Monitoreo requerido', type: 'select', options: ['Sin monitoreo', 'Monitoreo básico', 'Monitoreo regular', 'Monitoreo intensivo'] }
  ],

  // Antibióticos
  'pets-products-antibioticos': [
    { id: 'antibiotic_class', name: 'Clase de antibiótico', type: 'select', options: ['Penicilinas', 'Cefalosporinas', 'Fluoroquinolonas', 'Tetraciclinas', 'Macrólidos', 'Otros'] },
    { id: 'spectrum_activity', name: 'Espectro de actividad', type: 'select', options: ['Espectro estrecho', 'Espectro moderado', 'Amplio espectro', 'Espectro extendido'] },
    { id: 'bacterial_target', name: 'Objetivo bacteriano', type: 'tags', options: ['Gram positivas', 'Gram negativas', 'Anaerobios', 'Atípicas', 'Múltiples tipos'] },
    { id: 'infection_type', name: 'Tipo de infección', type: 'tags', options: ['Piel y tejidos blandos', 'Respiratoria', 'Urinaria', 'Gastrointestinal', 'Sistémica'] },
    { id: 'resistance_profile', name: 'Perfil de resistencia', type: 'select', options: ['Baja resistencia', 'Resistencia moderada', 'Alta resistencia', 'Resistencia emergente'] },
    { id: 'treatment_duration', name: 'Duración del tratamiento', type: 'select', options: ['Corto (3-5 días)', 'Estándar (7-10 días)', 'Prolongado (10-14 días)', 'Extendido (14+ días)'] },
    { id: 'food_interaction', name: 'Interacción con alimentos', type: 'select', options: ['Sin restricción', 'Con alimentos', 'Estómago vacío', 'Separar de lácteos'] },
    { id: 'bactericidal_static', name: 'Bactericida/Bacteriostático', type: 'select', options: ['Bacteriostático', 'Bactericida', 'Dependiente de concentración', 'Variable'] },
    { id: 'culture_sensitivity', name: 'Cultivo y sensibilidad', type: 'select', options: ['No requerido', 'Recomendado', 'Requerido', 'Obligatorio'] },
    { id: 'adverse_reactions', name: 'Reacciones adversas', type: 'tags', options: ['Gastrointestinales', 'Alérgicas', 'Hepáticas', 'Renales', 'Neurológicas'] }
  ],

  // Antiparasitarios
  'pets-products-antiparasitarios': [
    { id: 'parasite_type', name: 'Tipo de parásito', type: 'tags', options: ['Pulgas', 'Garrapatas', 'Gusanos intestinales', 'Gusanos del corazón', 'Ácaros', 'Múltiples parásitos'] },
    { id: 'parasite_location', name: 'Ubicación del parásito', type: 'tags', options: ['Externo', 'Intestinal', 'Sanguíneo', 'Respiratorio', 'Múltiples ubicaciones'] },
    { id: 'treatment_approach', name: 'Enfoque del tratamiento', type: 'select', options: ['Preventivo', 'Curativo', 'Preventivo/Curativo', 'Erradicación'] },
    { id: 'application_frequency', name: 'Frecuencia de aplicación', type: 'select', options: ['Una dosis', 'Semanal', 'Mensual', 'Trimestral', 'Según necesidad'] },
    { id: 'life_cycle_coverage', name: 'Cobertura del ciclo de vida', type: 'tags', options: ['Adultos', 'Larvas', 'Huevos', 'Todos los estadios', 'Estadios específicos'] },
    { id: 'seasonal_use', name: 'Uso estacional', type: 'select', options: ['Todo el año', 'Primavera/Verano', 'Según exposición', 'Regiones específicas'] },
    { id: 'safety_margin', name: 'Margen de seguridad', type: 'select', options: ['Margen estrecho', 'Margen estándar', 'Amplio margen', 'Muy seguro'] },
    { id: 'resistance_management', name: 'Manejo de resistencia', type: 'select', options: ['No aplicable', 'Rotación recomendada', 'Monitoreo requerido', 'Estrategia específica'] },
    { id: 'environmental_impact', name: 'Impacto ambiental', type: 'select', options: ['Impacto mínimo', 'Moderado', 'Considerar precauciones', 'Restricciones ambientales'] },
    { id: 'withdrawal_period', name: 'Período de retiro', type: 'select', options: ['No aplicable', 'Sin retiro', 'Período corto', 'Período específico'] }
  ],

  // Alivio de la ansiedad
  'pets-products-alivio-ansiedad': [
    { id: 'anxiety_type', name: 'Tipo de ansiedad', type: 'tags', options: ['Ansiedad por separación', 'Ruidos/Tormentas', 'Viajes', 'Visitas veterinarias', 'Ansiedad generalizada'] },
    { id: 'mechanism_action', name: 'Mecanismo de acción', type: 'select', options: ['GABA enhancer', 'Serotonina', 'Natural/Herbal', 'Feromonal', 'Múltiples mecanismos'] },
    { id: 'sedation_level', name: 'Nivel de sedación', type: 'select', options: ['Sin sedación', 'Sedación leve', 'Sedación moderada', 'Sedación marcada'] },
    { id: 'behavior_modification', name: 'Modificación del comportamiento', type: 'select', options: ['Solo farmacológico', 'Adjunto a terapia', 'Parte integral', 'Enfoque combinado'] },
    { id: 'dependency_potential', name: 'Potencial de dependencia', type: 'select', options: ['Sin dependencia', 'Dependencia baja', 'Riesgo moderado', 'Requiere monitoreo'] },
    { id: 'cognitive_function', name: 'Función cognitiva', type: 'select', options: ['Sin efecto', 'Efecto mínimo', 'Puede afectar', 'Afectación significativa'] },
    { id: 'situational_use', name: 'Uso situacional', type: 'select', options: ['Uso diario', 'Según necesidad', 'Eventos específicos', 'Flexible'] },
    { id: 'effectiveness_timeline', name: 'Cronología de efectividad', type: 'select', options: ['Inmediato', '30-60 minutos', '1-2 horas', '2+ horas'] },
    { id: 'withdrawal_symptoms', name: 'Síntomas de abstinencia', type: 'select', options: ['Sin síntomas', 'Mínimos', 'Requiere tapering', 'Monitoreo estricto'] },
    { id: 'quality_of_life', name: 'Calidad de vida', type: 'select', options: ['Mejora significativa', 'Mejora moderada', 'Mejora leve', 'Variable'] }
  ],

  // Ayudas para la digestión
  'pets-products-ayudas-digestion': [
    { id: 'digestive_issue', name: 'Problema digestivo', type: 'tags', options: ['Diarrea', 'Estreñimiento', 'Vómitos', 'Gases', 'Mala absorción', 'Múltiples problemas'] },
    { id: 'probiotic_content', name: 'Contenido probiótico', type: 'select', options: ['Sin probióticos', 'Probióticos básicos', 'Múltiples cepas', 'Probióticos especializados'] },
    { id: 'enzyme_supplementation', name: 'Suplementación enzimática', type: 'tags', options: ['Proteasas', 'Lipasas', 'Amilasas', 'Múltiples enzimas', 'Sin enzimas'] },
    { id: 'fiber_content', name: 'Contenido de fibra', type: 'select', options: ['Sin fibra', 'Fibra soluble', 'Fibra insoluble', 'Fibra mixta'] },
    { id: 'gut_health_support', name: 'Soporte de salud intestinal', type: 'tags', options: ['Prebióticos', 'Probióticos', 'Simbióticos', 'Moduladores inmunes', 'Múltiples enfoques'] },
    { id: 'acute_chronic', name: 'Agudo/Crónico', type: 'select', options: ['Solo agudo', 'Solo crónico', 'Ambos', 'Mantenimiento'] },
    { id: 'palatability', name: 'Palatabilidad', type: 'select', options: ['Neutral', 'Sabor agradable', 'Altamente palatable', 'Puede requerir mezcla'] },
    { id: 'dietary_compatibility', name: 'Compatibilidad dietética', type: 'select', options: ['Universal', 'Dietas específicas', 'Sin restricciones', 'Requiere ajuste'] },
    { id: 'response_time', name: 'Tiempo de respuesta', type: 'select', options: ['Inmediato', '24-48 horas', '3-7 días', '1-2 semanas'] },
    { id: 'maintenance_therapy', name: 'Terapia de mantenimiento', type: 'select', options: ['No requerida', 'Ocasional', 'Regular', 'Continua'] }
  ],

  // Medicina para oídos y ojos
  'pets-products-medicina-oidos-ojos': [
    { id: 'target_organ', name: 'Órgano objetivo', type: 'select', options: ['Solo oídos', 'Solo ojos', 'Ambos', 'Uso múltiple'] },
    { id: 'condition_treated', name: 'Condición tratada', type: 'tags', options: ['Infecciones', 'Inflamación', 'Limpieza', 'Lubricación', 'Múltiples condiciones'] },
    { id: 'antimicrobial_activity', name: 'Actividad antimicrobiana', type: 'tags', options: ['Antibacterial', 'Antifúngica', 'Antiviral', 'Múltiple espectro', 'Sin actividad'] },
    { id: 'anti_inflammatory', name: 'Antiinflamatorio', type: 'select', options: ['Sin actividad', 'Leve', 'Moderado', 'Potente'] },
    { id: 'application_method', name: 'Método de aplicación', type: 'select', options: ['Gotas', 'Ungüento', 'Spray', 'Limpiador', 'Múltiples formas'] },
    { id: 'frequency_application', name: 'Frecuencia de aplicación', type: 'select', options: ['Una vez', '2-3 veces/día', 'Según necesidad', 'Uso continuo'] },
    { id: 'anesthetic_properties', name: 'Propiedades anestésicas', type: 'select', options: ['Sin anestesia', 'Anestesia leve', 'Anestesia moderada', 'Anestesia potente'] },
    { id: 'drying_properties', name: 'Propiedades secantes', type: 'select', options: ['Sin efecto secante', 'Leve secado', 'Moderado secado', 'Fuerte secado'] },
    { id: 'cerumen_removal', name: 'Remoción de cerumen', type: 'select', options: ['No aplicable', 'Remoción suave', 'Remoción efectiva', 'Remoción profunda'] },
    { id: 'sensitivity_rating', name: 'Calificación de sensibilidad', type: 'select', options: ['Para tejidos sensibles', 'Estándar', 'Requiere precaución', 'Solo uso veterinario'] }
  ],

  // Analgésicos
  'pets-products-analgesicos': [
    { id: 'pain_type', name: 'Tipo de dolor', type: 'tags', options: ['Agudo', 'Crónico', 'Post-quirúrgico', 'Artrítico', 'Neuropático', 'Múltiples tipos'] },
    { id: 'analgesic_class', name: 'Clase de analgésico', type: 'select', options: ['NSAIDs', 'Opioides', 'Adjuvantes', 'Naturales', 'Múltiples clases'] },
    { id: 'potency_level', name: 'Nivel de potencia', type: 'select', options: ['Leve', 'Moderado', 'Potente', 'Muy potente'] },
    { id: 'anti_inflammatory_action', name: 'Acción antiinflamatoria', type: 'select', options: ['Sin actividad', 'Leve', 'Moderada', 'Potente'] },
    { id: 'organ_safety', name: 'Seguridad orgánica', type: 'tags', options: ['Seguro renal', 'Seguro hepático', 'Seguro gastrointestinal', 'Requiere monitoreo', 'Múltiples consideraciones'] },
    { id: 'duration_action', name: 'Duración de acción', type: 'select', options: ['Corta (2-4 horas)', 'Moderada (4-8 horas)', 'Larga (8-12 horas)', 'Extendida (12+ horas)'] },
    { id: 'tolerance_development', name: 'Desarrollo de tolerancia', type: 'select', options: ['Sin tolerancia', 'Tolerancia baja', 'Riesgo moderado', 'Alto riesgo'] },
    { id: 'multimodal_therapy', name: 'Terapia multimodal', type: 'select', options: ['Monoterapia', 'Combinable', 'Parte de protocolo', 'Requiere combinación'] },
    { id: 'breakthrough_pain', name: 'Dolor intercurrente', type: 'select', options: ['No aplicable', 'Prevención', 'Tratamiento', 'Ambos'] },
    { id: 'quality_of_life_impact', name: 'Impacto en calidad de vida', type: 'select', options: ['Mejora significativa', 'Mejora moderada', 'Mejora leve', 'Variable'] }
  ],

  // Cuidado dental para mascotas (categoría general)
  'pets-products-cuidado-dental': [
    { id: 'dental_benefit', name: 'Beneficio dental', type: 'tags', options: ['Limpieza de placa', 'Prevención de sarro', 'Aliento fresco', 'Salud de encías', 'Múltiples beneficios'] },
    { id: 'application_frequency_dental', name: 'Frecuencia de uso', type: 'select', options: ['Diario', 'Cada 2-3 días', 'Semanal', 'Según necesidad'] },
    { id: 'age_suitability_dental', name: 'Adecuado para edad', type: 'select', options: ['Cachorros', 'Jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'veterinary_approval', name: 'Aprobación veterinaria', type: 'select', options: ['VOHC aprobado', 'Recomendado por veterinarios', 'Clínicamente probado', 'Estándar de mercado'] },
    { id: 'ease_of_use', name: 'Facilidad de uso', type: 'select', options: ['Muy fácil', 'Fácil', 'Requiere entrenamiento', 'Requiere asistencia'] }
  ],

  // Aditivos para el agua para el cuidado dental
  'pets-products-aditivos-agua-dental': [
    { id: 'water_additive_type', name: 'Tipo de aditivo', type: 'select', options: ['Enzimático', 'Antimicrobiano', 'Oxigenante', 'Natural', 'Combinación'] },
    { id: 'dosage_per_liter', name: 'Dosificación por litro', type: 'select', options: ['1-5 ml', '5-10 ml', '10-15 ml', '15-20 ml', 'Según tamaño'] },
    { id: 'taste_neutrality', name: 'Neutralidad de sabor', type: 'select', options: ['Sin sabor', 'Sabor neutro', 'Ligeramente perceptible', 'Puede ser rechazado'] },
    { id: 'safety_if_ingested', name: 'Seguridad si se ingiere', type: 'select', options: ['Completamente seguro', 'Seguro en dosis normales', 'Límites de consumo', 'Solo uso supervisado'] },
    { id: 'bacterial_reduction', name: 'Reducción bacteriana', type: 'select', options: ['Hasta 50%', 'Hasta 70%', 'Hasta 90%', 'Más del 90%'] },
    { id: 'plaque_prevention', name: 'Prevención de placa', type: 'select', options: ['Básica', 'Moderada', 'Avanzada', 'Máxima'] },
    { id: 'breath_freshening', name: 'Refrescante del aliento', type: 'select', options: ['Efecto mínimo', 'Moderado', 'Notable', 'Duradero'] },
    { id: 'enzyme_activity', name: 'Actividad enzimática', type: 'tags', options: ['Glucosa oxidasa', 'Lactoperoxidasa', 'Lisozima', 'Múltiples enzimas', 'Sin enzimas'] },
    { id: 'duration_in_water', name: 'Duración en agua', type: 'select', options: ['12 horas', '24 horas', '48 horas', '72+ horas'] },
    { id: 'container_compatibility', name: 'Compatibilidad de recipientes', type: 'tags', options: ['Metal', 'Plástico', 'Cerámica', 'Vidrio', 'Todos los materiales'] }
  ],

  // Aerosoles para el cuidado dental
  'pets-products-aerosoles-dental': [
    { id: 'spray_mechanism', name: 'Mecanismo de spray', type: 'select', options: ['Pulverización fina', 'Spray dirigido', 'Nebulización', 'Espuma', 'Gel en spray'] },
    { id: 'active_ingredients_spray', name: 'Ingredientes activos', type: 'tags', options: ['Clorhexidina', 'Enzimas', 'Zinc', 'Aceites esenciales', 'Múltiples ingredientes'] },
    { id: 'application_area', name: 'Área de aplicación', type: 'tags', options: ['Dientes', 'Encías', 'Lengua', 'Toda la boca', 'Áreas específicas'] },
    { id: 'contact_time_required', name: 'Tiempo de contacto requerido', type: 'select', options: ['Instantáneo', '30 segundos', '1-2 minutos', '5+ minutos'] },
    { id: 'rinsing_required', name: 'Enjuague requerido', type: 'select', options: ['No requiere enjuague', 'Enjuague opcional', 'Enjuague recomendado', 'Enjuague obligatorio'] },
    { id: 'antimicrobial_spectrum', name: 'Espectro antimicrobiano', type: 'tags', options: ['Bacterias gram+', 'Bacterias gram-', 'Hongos', 'Virus', 'Amplio espectro'] },
    { id: 'residual_protection', name: 'Protección residual', type: 'select', options: ['Sin residual', '2-4 horas', '6-8 horas', '12+ horas'] },
    { id: 'pet_cooperation_needed', name: 'Cooperación de mascota requerida', type: 'select', options: ['Mínima', 'Moderada', 'Alta', 'Entrenamiento previo'] },
    { id: 'application_precision', name: 'Precisión de aplicación', type: 'select', options: ['Aplicación general', 'Dirigida', 'Muy precisa', 'Profesional'] },
    { id: 'flavor_masking', name: 'Enmascaramiento de sabor', type: 'select', options: ['Sin sabor', 'Sabor agradable', 'Sabor neutro', 'Puede ser desagradable'] }
  ],

  // Cepillos de dientes
  'pets-products-cepillos-dientes': [
    { id: 'brush_type', name: 'Tipo de cepillo', type: 'select', options: ['Cepillo tradicional', 'Cepillo de dedo', 'Cepillo doble cabeza', 'Cepillo eléctrico', 'Cepillo ultrasónico'] },
    { id: 'bristle_softness', name: 'Suavidad de cerdas', type: 'select', options: ['Extra suave', 'Suave', 'Medio', 'Firme'] },
    { id: 'bristle_material', name: 'Material de cerdas', type: 'select', options: ['Nylon', 'Silicona', 'Natural', 'Híbrido', 'Microfibra'] },
    { id: 'head_size', name: 'Tamaño de cabeza', type: 'select', options: ['Extra pequeña', 'Pequeña', 'Mediana', 'Grande', 'Variable'] },
    { id: 'handle_design', name: 'Diseño de mango', type: 'select', options: ['Recto', 'Angulado', 'Ergonómico', 'Antideslizante', 'Flexible'] },
    { id: 'pet_size_suitability', name: 'Adecuado para tamaño', type: 'tags', options: ['Toy/Pequeño', 'Mediano', 'Grande', 'Gigante', 'Universal'] },
    { id: 'bristle_arrangement', name: 'Disposición de cerdas', type: 'select', options: ['Uniforme', 'Multi-nivel', 'Angulada', 'Especializada', 'Variable'] },
    { id: 'replacement_frequency', name: 'Frecuencia de reemplazo', type: 'select', options: ['1 mes', '2-3 meses', '3-6 meses', '6+ meses'] },
    { id: 'cleaning_effectiveness', name: 'Efectividad de limpieza', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'Excelente'] },
    { id: 'gum_protection', name: 'Protección de encías', type: 'select', options: ['Estándar', 'Protección mejorada', 'Masaje suave', 'Terapéutica'] }
  ],

  // Enjuagues bucales
  'pets-products-enjuagues-bucales': [
    { id: 'mouthwash_formulation', name: 'Formulación', type: 'select', options: ['Base acuosa', 'Sin alcohol', 'Enzimática', 'Natural', 'Farmacéutica'] },
    { id: 'antimicrobial_agents', name: 'Agentes antimicrobianos', type: 'tags', options: ['Clorhexidina', 'Cetilpiridinio', 'Aceites esenciales', 'Zinc', 'Múltiples agentes'] },
    { id: 'fluoride_content', name: 'Contenido de flúor', type: 'select', options: ['Sin flúor', 'Bajo contenido', 'Contenido estándar', 'Alto contenido'] },
    { id: 'application_method_rinse', name: 'Método de aplicación', type: 'select', options: ['Aplicación directa', 'Diluir en agua', 'Spray', 'Aplicador', 'Jeringa'] },
    { id: 'contact_time_rinse', name: 'Tiempo de contacto', type: 'select', options: ['30 segundos', '1 minuto', '2 minutos', '5+ minutos'] },
    { id: 'palatability_rating', name: 'Calificación de palatabilidad', type: 'select', options: ['Muy aceptable', 'Aceptable', 'Neutral', 'Puede requerir adaptación'] },
    { id: 'therapeutic_claims', name: 'Declaraciones terapéuticas', type: 'tags', options: ['Anti-placa', 'Anti-gingivitis', 'Anti-halitosis', 'Remineralizante', 'Múltiples beneficios'] },
    { id: 'concentration_strength', name: 'Concentración/Fuerza', type: 'select', options: ['Suave', 'Estándar', 'Concentrado', 'Extra fuerte'] },
    { id: 'swallowing_safety', name: 'Seguridad al tragar', type: 'select', options: ['Seguro si se traga', 'Pequeñas cantidades OK', 'Evitar tragar', 'No debe tragarse'] },
    { id: 'staining_potential', name: 'Potencial de manchado', type: 'select', options: ['Sin manchado', 'Manchado mínimo', 'Puede manchar', 'Alto potencial'] }
  ],

  // Geles para el cuidado dental
  'pets-products-geles-dental': [
    { id: 'gel_consistency', name: 'Consistencia del gel', type: 'select', options: ['Líquido viscoso', 'Gel ligero', 'Gel espeso', 'Pasta gel', 'Adherente'] },
    { id: 'active_enzymes', name: 'Enzimas activas', type: 'tags', options: ['Glucosa oxidasa', 'Lactoperoxidasa', 'Mutanasa', 'Dextranasa', 'Múltiples enzimas'] },
    { id: 'adherence_properties', name: 'Propiedades de adherencia', type: 'select', options: ['Baja adherencia', 'Adherencia moderada', 'Alta adherencia', 'Adherencia prolongada'] },
    { id: 'application_technique', name: 'Técnica de aplicación', type: 'select', options: ['Frotado con dedo', 'Aplicador incluido', 'Cepillo', 'Jeringa', 'Múltiples métodos'] },
    { id: 'penetration_ability', name: 'Capacidad de penetración', type: 'select', options: ['Superficial', 'Moderada', 'Profunda', 'Sistémica'] },
    { id: 'biofilm_disruption', name: 'Disrupción de biofilm', type: 'select', options: ['Mínima', 'Moderada', 'Efectiva', 'Altamente efectiva'] },
    { id: 'residence_time', name: 'Tiempo de residencia', type: 'select', options: ['15-30 minutos', '1-2 horas', '4-6 horas', '8+ horas'] },
    { id: 'texture_preference', name: 'Preferencia de textura', type: 'select', options: ['Muy aceptada', 'Generalmente aceptada', 'Variable', 'Puede requerir adaptación'] },
    { id: 'whitening_properties', name: 'Propiedades blanqueadoras', type: 'select', options: ['Sin efecto blanqueador', 'Ligero', 'Moderado', 'Notable'] },
    { id: 'sensitivity_consideration', name: 'Consideración de sensibilidad', type: 'select', options: ['Para dientes sensibles', 'Estándar', 'Requiere precaución', 'Solo uso profesional'] }
  ],

  // Masticables para limpiar los dientes
  'pets-products-masticables-dientes': [
    { id: 'chew_hardness', name: 'Dureza del masticable', type: 'select', options: ['Suave', 'Semi-suave', 'Firme', 'Duro', 'Extra duro'] },
    { id: 'chew_duration', name: 'Duración de masticado', type: 'select', options: ['5-10 minutos', '15-30 minutos', '30-60 minutos', '1+ hora'] },
    { id: 'base_material', name: 'Material base', type: 'select', options: ['Cuero crudo', 'Colágeno', 'Vegetal', 'Sintético', 'Múltiples materiales'] },
    { id: 'dental_cleaning_mechanism', name: 'Mecanismo de limpieza', type: 'tags', options: ['Abrasión mecánica', 'Enzimas activas', 'Textura especializada', 'Químicos activos', 'Múltiples mecanismos'] },
    { id: 'digestibility', name: 'Digestibilidad', type: 'select', options: ['Completamente digestible', 'Altamente digestible', 'Moderadamente digestible', 'Baja digestibilidad'] },
    { id: 'caloric_content', name: 'Contenido calórico', type: 'select', options: ['Bajo (<50 cal)', 'Moderado (50-100 cal)', 'Alto (100-200 cal)', 'Muy alto (200+ cal)'] },
    { id: 'size_appropriateness', name: 'Apropiado para tamaño', type: 'tags', options: ['Pequeño (toy)', 'Mediano', 'Grande', 'Gigante', 'Multi-tamaño'] },
    { id: 'flavor_appeal', name: 'Atractivo del sabor', type: 'select', options: ['Muy atractivo', 'Atractivo', 'Neutral', 'Variable por mascota'] },
    { id: 'choking_risk', name: 'Riesgo de asfixia', type: 'select', options: ['Riesgo mínimo', 'Bajo riesgo', 'Supervisión recomendada', 'Alta supervisión'] },
    { id: 'dental_abrasiveness', name: 'Abrasividad dental', type: 'select', options: ['Suave', 'Moderada', 'Efectiva', 'Agresiva'] }
  ],

  // Pasta de dientes
  'pets-products-pasta-dientes': [
    { id: 'toothpaste_base', name: 'Base de pasta dental', type: 'select', options: ['Gel', 'Crema', 'Espuma', 'Líquido espeso', 'Polvo mezclable'] },
    { id: 'fluoride_free', name: 'Libre de flúor', type: 'select', options: ['Completamente libre', 'Bajo en flúor', 'Flúor estándar', 'Alto en flúor'] },
    { id: 'abrasive_level', name: 'Nivel abrasivo', type: 'select', options: ['No abrasivo', 'Ligeramente abrasivo', 'Moderadamente abrasivo', 'Altamente abrasivo'] },
    { id: 'enzymatic_activity', name: 'Actividad enzimática', type: 'tags', options: ['Glucosa oxidasa', 'Lactoperoxidasa', 'Papaína', 'Múltiples enzimas', 'Sin enzimas'] },
    { id: 'flavor_variety', name: 'Variedad de sabores', type: 'tags', options: ['Pollo', 'Res', 'Menta', 'Vainilla', 'Sin sabor', 'Múltiples sabores'] },
    { id: 'foaming_action', name: 'Acción espumante', type: 'select', options: ['Sin espuma', 'Espuma mínima', 'Espuma moderada', 'Alta espuma'] },
    { id: 'tartar_control', name: 'Control de sarro', type: 'select', options: ['Prevención básica', 'Control moderado', 'Control avanzado', 'Remoción activa'] },
    { id: 'breath_freshening_duration', name: 'Duración refrescante', type: 'select', options: ['1-2 horas', '3-4 horas', '6-8 horas', '12+ horas'] },
    { id: 'application_amount', name: 'Cantidad de aplicación', type: 'select', options: ['Pequeña cantidad', 'Cantidad moderada', 'Generosa', 'Según tamaño'] },
    { id: 'veterinary_formulation', name: 'Formulación veterinaria', type: 'select', options: ['Fórmula casera', 'Veterinaria estándar', 'Veterinaria especializada', 'Prescripción'] }
  ],

  // Toallitas para el cuidado dental
  'pets-products-toallitas-dental': [
    { id: 'wipe_material', name: 'Material de toallita', type: 'select', options: ['Algodón', 'Microfibra', 'Bambú', 'Sintético', 'Biodegradable'] },
    { id: 'wipe_texture', name: 'Textura de toallita', type: 'select', options: ['Lisa', 'Texturizada', 'Abrasiva suave', 'Multi-textura', 'Especializada'] },
    { id: 'solution_impregnation', name: 'Impregnación de solución', type: 'tags', options: ['Enzimas', 'Antimicrobianos', 'Fluoruro', 'Natural', 'Múltiples componentes'] },
    { id: 'individual_packaging', name: 'Empaque individual', type: 'select', options: ['Empaque individual', 'Paquete múltiple', 'Dispensador', 'Tubo dispensador'] },
    { id: 'finger_compatibility', name: 'Compatibilidad con dedo', type: 'select', options: ['Diseño de dedo', 'Envolver en dedo', 'Usar con pinzas', 'Aplicación libre'] },
    { id: 'cleaning_coverage', name: 'Cobertura de limpieza', type: 'tags', options: ['Solo dientes', 'Dientes y encías', 'Toda la boca', 'Lengua incluida', 'Cobertura completa'] },
    { id: 'moisture_retention', name: 'Retención de humedad', type: 'select', options: ['Se seca rápido', 'Humedad moderada', 'Larga duración', 'Extra húmeda'] },
    { id: 'disposal_method', name: 'Método de disposición', type: 'select', options: ['Biodegradable', 'Compostable', 'Reciclable', 'Basura estándar'] },
    { id: 'convenience_rating', name: 'Calificación de conveniencia', type: 'select', options: ['Muy conveniente', 'Conveniente', 'Moderadamente conveniente', 'Requiere preparación'] },
    { id: 'effectiveness_comparison', name: 'Comparación de efectividad', type: 'select', options: ['Equivale a cepillado', 'Complemento al cepillado', 'Mantenimiento básico', 'Limpieza de emergencia'] }
  ],

  // Cochecitos para mascotas (categoría general)
  'pets-products-cochecitos': [
    { id: 'stroller_frame_material', name: 'Material del armazón', type: 'select', options: ['Aluminio', 'Acero', 'Aleación ligera', 'Fibra de carbono', 'Materiales híbridos'] },
    { id: 'weight_capacity', name: 'Capacidad de peso', type: 'select', options: ['Hasta 10 kg', 'Hasta 20 kg', 'Hasta 30 kg', 'Hasta 50 kg', 'Más de 50 kg'] },
    { id: 'folding_mechanism', name: 'Mecanismo de plegado', type: 'select', options: ['Plegado compacto', 'Plegado rápido', 'Plegado con una mano', 'No plegable', 'Plegado parcial'] },
    { id: 'wheel_configuration', name: 'Configuración de ruedas', type: 'select', options: ['3 ruedas', '4 ruedas', '6 ruedas', 'Ruedas grandes', 'Ruedas todo terreno'] },
    { id: 'suspension_system', name: 'Sistema de suspensión', type: 'select', options: ['Sin suspensión', 'Suspensión básica', 'Suspensión completa', 'Suspensión ajustable'] },
    { id: 'weather_protection', name: 'Protección climática', type: 'tags', options: ['Cubierta impermeable', 'Protección UV', 'Protección viento', 'Malla transpirable', 'Múltiples protecciones'] },
    { id: 'safety_features', name: 'Características de seguridad', type: 'tags', options: ['Frenos de mano', 'Cinturones de seguridad', 'Reflectores', 'Luces LED', 'Múltiples características'] },
    { id: 'storage_capacity', name: 'Capacidad de almacenamiento', type: 'select', options: ['Sin almacenamiento', 'Almacenamiento básico', 'Múltiples compartimentos', 'Gran capacidad'] },
    { id: 'maneuverability', name: 'Maniobrabilidad', type: 'select', options: ['Básica', 'Buena', 'Excelente', 'Profesional'] },
    { id: 'terrain_suitability', name: 'Adecuado para terreno', type: 'tags', options: ['Pavimento', 'Césped', 'Senderos', 'Playa', 'Todo terreno'] }
  ],

  // Cochecitos de dos pisos
  'pets-products-cochecitos-dos-pisos': [
    { id: 'compartment_separation', name: 'Separación de compartimentos', type: 'select', options: ['Completamente separado', 'Parcialmente separado', 'Removible', 'Fijo'] },
    { id: 'access_configuration', name: 'Configuración de acceso', type: 'select', options: ['Acceso frontal ambos', 'Acceso lateral ambos', 'Acceso mixto', 'Acceso personalizable'] },
    { id: 'individual_weight_limit', name: 'Límite de peso individual', type: 'select', options: ['5 kg por piso', '10 kg por piso', '15 kg por piso', '20+ kg por piso'] },
    { id: 'ventilation_system', name: 'Sistema de ventilación', type: 'select', options: ['Ventilación básica', 'Ventilación independiente', 'Ventilación cruzada', 'Ventilación premium'] },
    { id: 'visibility_between_levels', name: 'Visibilidad entre niveles', type: 'select', options: ['Sin visibilidad', 'Visibilidad parcial', 'Visibilidad completa', 'Ventana ajustable'] },
    { id: 'loading_mechanism', name: 'Mecanismo de carga', type: 'tags', options: ['Carga frontal', 'Carga lateral', 'Carga superior', 'Múltiples accesos', 'Rampas incluidas'] },
    { id: 'stability_enhancement', name: 'Mejora de estabilidad', type: 'select', options: ['Estabilidad estándar', 'Base ampliada', 'Centro de gravedad bajo', 'Sistema anti-vuelco'] },
    { id: 'interaction_allowance', name: 'Permitir interacción', type: 'select', options: ['Separación completa', 'Interacción limitada', 'Interacción controlada', 'Interacción libre'] },
    { id: 'cleaning_accessibility', name: 'Accesibilidad para limpieza', type: 'select', options: ['Limpieza básica', 'Acceso mejorado', 'Compartimentos removibles', 'Fácil desmontaje'] },
    { id: 'comfort_features', name: 'Características de comodidad', type: 'tags', options: ['Acolchado individual', 'Regulación temperatura', 'Espacio personalizable', 'Juguetes integrados', 'Múltiples comodidades'] }
  ],

  // Cochecitos estándar
  'pets-products-cochecitos-estandar': [
    { id: 'cabin_size', name: 'Tamaño de cabina', type: 'select', options: ['Pequeña (toy)', 'Mediana', 'Grande', 'Extra grande', 'Ajustable'] },
    { id: 'entry_method', name: 'Método de entrada', type: 'select', options: ['Puerta frontal', 'Puerta lateral', 'Entrada superior', 'Múltiples entradas'] },
    { id: 'floor_material', name: 'Material del piso', type: 'select', options: ['Tela acolchada', 'Plástico duro', 'Espuma memory', 'Malla transpirable', 'Material removible'] },
    { id: 'window_configuration', name: 'Configuración de ventanas', type: 'tags', options: ['Ventana frontal', 'Ventanas laterales', 'Ventana trasera', 'Malla 360°', 'Múltiples ventanas'] },
    { id: 'handle_adjustment', name: 'Ajuste de mango', type: 'select', options: ['Altura fija', 'Altura ajustable', 'Mango ergonómico', 'Mango reversible'] },
    { id: 'brake_system', name: 'Sistema de frenos', type: 'select', options: ['Sin frenos', 'Freno de pie', 'Freno de mano', 'Freno automático', 'Doble sistema'] },
    { id: 'cup_holder', name: 'Portavasos', type: 'select', options: ['Sin portavasos', 'Un portavasos', 'Múltiples portavasos', 'Portavasos ajustable'] },
    { id: 'assembly_requirement', name: 'Requerimiento de ensamblaje', type: 'select', options: ['Pre-ensamblado', 'Ensamblaje mínimo', 'Ensamblaje moderado', 'Ensamblaje completo'] },
    { id: 'tire_type', name: 'Tipo de neumáticos', type: 'select', options: ['Ruedas sólidas', 'Neumáticos inflables', 'Ruedas de espuma', 'Ruedas todo clima'] },
    { id: 'color_variety', name: 'Variedad de colores', type: 'select', options: ['Color único', 'Pocos colores', 'Múltiples colores', 'Personalizable'] }
  ],

  // Cochecitos múltiples
  'pets-products-cochecitos-multiples': [
    { id: 'pet_capacity', name: 'Capacidad de mascotas', type: 'select', options: ['2 mascotas', '3 mascotas', '4 mascotas', '5+ mascotas'] },
    { id: 'compartment_layout', name: 'Distribución de compartimentos', type: 'select', options: ['Lado a lado', 'En línea', 'Configuración en L', 'Disposición personalizable'] },
    { id: 'individual_space_control', name: 'Control de espacio individual', type: 'select', options: ['Espacio compartido', 'Divisores removibles', 'Compartimentos fijos', 'Espacios ajustables'] },
    { id: 'weight_distribution', name: 'Distribución de peso', type: 'select', options: ['Distribución uniforme', 'Compensación automática', 'Ajuste manual', 'Sistema inteligente'] },
    { id: 'access_independence', name: 'Independencia de acceso', type: 'select', options: ['Acceso conjunto', 'Acceso semi-independiente', 'Acceso completamente independiente', 'Acceso programable'] },
    { id: 'size_accommodation', name: 'Acomodación de tamaños', type: 'select', options: ['Mismo tamaño', 'Tamaños similares', 'Tamaños mixtos', 'Completamente variable'] },
    { id: 'interaction_management', name: 'Manejo de interacción', type: 'tags', options: ['Separación completa', 'Interacción controlada', 'Supervisión visual', 'Interacción libre', 'Múltiples configuraciones'] },
    { id: 'cleaning_complexity', name: 'Complejidad de limpieza', type: 'select', options: ['Limpieza simple', 'Moderadamente compleja', 'Requiere desmontaje', 'Sistema de limpieza especializado'] },
    { id: 'maneuverability_multiple', name: 'Maniobrabilidad con múltiples', type: 'select', options: ['Estándar', 'Ligeramente reducida', 'Requiere práctica', 'Necesita experiencia'] },
    { id: 'noise_management', name: 'Manejo de ruido', type: 'select', options: ['Sin control de ruido', 'Amortiguación básica', 'Control de ruido avanzado', 'Aislamiento acústico'] }
  ],

  // Cochecitos para correr
  'pets-products-cochecitos-correr': [
    { id: 'aerodynamic_design', name: 'Diseño aerodinámico', type: 'select', options: ['Diseño básico', 'Parcialmente aerodinámico', 'Completamente aerodinámico', 'Optimizado para velocidad'] },
    { id: 'shock_absorption', name: 'Absorción de impacto', type: 'select', options: ['Absorción básica', 'Absorción media', 'Absorción avanzada', 'Absorción premium'] },
    { id: 'running_speed_rating', name: 'Clasificación de velocidad', type: 'select', options: ['Hasta 8 km/h', 'Hasta 15 km/h', 'Hasta 25 km/h', 'Velocidad profesional'] },
    { id: 'wheel_size_running', name: 'Tamaño de ruedas para correr', type: 'select', options: ['Ruedas medianas', 'Ruedas grandes', 'Ruedas extra grandes', 'Ruedas especializadas'] },
    { id: 'tracking_stability', name: 'Estabilidad de seguimiento', type: 'select', options: ['Estabilidad básica', 'Tracking mejorado', 'Estabilidad alta velocidad', 'Control profesional'] },
    { id: 'ventilation_high_speed', name: 'Ventilación alta velocidad', type: 'tags', options: ['Ventilación forzada', 'Flujo de aire optimizado', 'Enfriamiento activo', 'Regulación temperatura', 'Múltiples sistemas'] },
    { id: 'safety_running', name: 'Seguridad para correr', type: 'tags', options: ['Reflectores mejorados', 'Luces LED integradas', 'Señales de advertencia', 'Sistema de comunicación', 'Múltiples características'] },
    { id: 'runner_ergonomics', name: 'Ergonomía para corredor', type: 'tags', options: ['Mango ajustable', 'Agarre antideslizante', 'Distribución de peso', 'Reducción de vibración', 'Múltiples mejoras'] },
    { id: 'terrain_performance', name: 'Rendimiento en terreno', type: 'tags', options: ['Asfalto', 'Senderos', 'Pista de atletismo', 'Terreno mixto', 'Alto rendimiento'] },
    { id: 'maintenance_running', name: 'Mantenimiento para correr', type: 'select', options: ['Mantenimiento estándar', 'Mantenimiento frecuente', 'Mantenimiento especializado', 'Mantenimiento profesional'] }
  ],

  // Cochecitos con transporte desmontable
  'pets-products-cochecitos-transporte-desmontable': [
    { id: 'carrier_detachment', name: 'Desmontaje del transportín', type: 'select', options: ['Desmontaje simple', 'Sistema de liberación rápida', 'Mecanismo de seguridad', 'Desmontaje automático'] },
    { id: 'carrier_versatility', name: 'Versatilidad del transportín', type: 'tags', options: ['Transportín de mano', 'Transportín para auto', 'Transportín aéreo', 'Uso independiente', 'Múltiples usos'] },
    { id: 'attachment_security', name: 'Seguridad de sujeción', type: 'select', options: ['Sujeción básica', 'Sistema de bloqueo', 'Doble seguridad', 'Sistema anti-liberación'] },
    { id: 'transition_ease', name: 'Facilidad de transición', type: 'select', options: ['Transición básica', 'Fácil transición', 'Transición fluida', 'Transición instantánea'] },
    { id: 'carrier_weight', name: 'Peso del transportín', type: 'select', options: ['Ligero (<2kg)', 'Moderado (2-4kg)', 'Pesado (4-6kg)', 'Muy pesado (6kg+)'] },
    { id: 'ventilation_portable', name: 'Ventilación portátil', type: 'select', options: ['Ventilación estándar', 'Ventilación mejorada', 'Múltiples aberturas', 'Sistema de ventilación activa'] },
    { id: 'handle_options', name: 'Opciones de manijas', type: 'tags', options: ['Manija superior', 'Manijas laterales', 'Correa de hombro', 'Ruedas integradas', 'Múltiples opciones'] },
    { id: 'size_compatibility', name: 'Compatibilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Ajustable limitado', 'Completamente ajustable', 'Sistema modular'] },
    { id: 'airline_approval', name: 'Aprobación aerolínea', type: 'select', options: ['No certificado', 'Algunas aerolíneas', 'Mayoría aerolíneas', 'Certificación universal'] },
    { id: 'storage_when_detached', name: 'Almacenamiento desmontado', type: 'select', options: ['Almacenamiento básico', 'Plegado compacto', 'Almacenamiento eficiente', 'Diseño ultra compacto'] }
  ],

  // Suministros para peces y acuarios (categoría general)
  'pets-products-suministros-acuarios': [
    { id: 'aquarium_type_compatibility', name: 'Compatibilidad tipo de acuario', type: 'tags', options: ['Agua dulce', 'Agua salada', 'Marino', 'Plantado', 'Todos los tipos'] },
    { id: 'fish_type_suitability', name: 'Adecuado para tipo de pez', type: 'tags', options: ['Tropicales', 'Agua fría', 'Marinos', 'Cíclidos', 'Todos los peces'] },
    { id: 'maintenance_level', name: 'Nivel de mantenimiento', type: 'select', options: ['Bajo mantenimiento', 'Mantenimiento moderado', 'Alto mantenimiento', 'Mantenimiento profesional'] },
    { id: 'aquarium_size_range', name: 'Rango de tamaño de acuario', type: 'select', options: ['Nano (hasta 40L)', 'Pequeño (40-100L)', 'Mediano (100-300L)', 'Grande (300L+)', 'Universal'] },
    { id: 'installation_complexity', name: 'Complejidad de instalación', type: 'select', options: ['Instalación simple', 'Moderadamente complejo', 'Requiere experiencia', 'Instalación profesional'] }
  ],

  // Acuarios
  'pets-products-acuarios': [
    { id: 'tank_volume', name: 'Volumen del tanque', type: 'select', options: ['Hasta 40L', '40-100L', '100-300L', '300-500L', '500L+'] },
    { id: 'tank_shape', name: 'Forma del tanque', type: 'select', options: ['Rectangular', 'Cuadrado', 'Redondo', 'Bow front', 'Forma personalizada'] },
    { id: 'glass_type', name: 'Tipo de vidrio', type: 'select', options: ['Vidrio estándar', 'Vidrio templado', 'Acrílico', 'Vidrio de baja reflexión', 'Cristal óptico'] },
    { id: 'included_equipment', name: 'Equipo incluido', type: 'tags', options: ['Filtro', 'Iluminación', 'Calentador', 'Cubierta', 'Kit completo'] },
    { id: 'rim_type', name: 'Tipo de borde', type: 'select', options: ['Con marco', 'Sin marco', 'Marco delgado', 'Marco decorativo'] },
    { id: 'bottom_reinforcement', name: 'Refuerzo inferior', type: 'select', options: ['Sin refuerzo', 'Refuerzo básico', 'Refuerzo completo', 'Base estructural'] },
    { id: 'corner_style', name: 'Estilo de esquinas', type: 'select', options: ['Esquinas rectas', 'Esquinas redondeadas', 'Esquinas biseladas', 'Esquinas selladas'] },
    { id: 'water_type_designed', name: 'Diseñado para tipo de agua', type: 'tags', options: ['Agua dulce', 'Agua salada', 'Marino', 'Plantado', 'Todos los tipos'] },
    { id: 'stand_included', name: 'Soporte incluido', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Soporte decorativo', 'Gabinete completo'] },
    { id: 'drainage_system', name: 'Sistema de drenaje', type: 'select', options: ['Sin drenaje', 'Drenaje básico', 'Sistema de rebose', 'Drenaje completo'] }
  ],

  // Alimento para peces
  'pets-products-alimento-peces': [
    { id: 'food_type', name: 'Tipo de alimento', type: 'select', options: ['Escamas', 'Gránulos', 'Tabletas', 'Alimento vivo', 'Alimento congelado'] },
    { id: 'fish_species_target', name: 'Especie objetivo', type: 'tags', options: ['Tropicales', 'Goldfish', 'Cíclidos', 'Marinos', 'Bettas', 'Todos los peces'] },
    { id: 'nutritional_focus', name: 'Enfoque nutricional', type: 'tags', options: ['Crecimiento', 'Color', 'Inmunidad', 'Digestión', 'Reproducción'] },
    { id: 'feeding_level', name: 'Nivel de alimentación', type: 'select', options: ['Superficie', 'Medio', 'Fondo', 'Todos los niveles'] },
    { id: 'protein_content', name: 'Contenido de proteína', type: 'select', options: ['Bajo (25-35%)', 'Medio (35-45%)', 'Alto (45-55%)', 'Muy alto (55%+)'] },
    { id: 'life_stage', name: 'Etapa de vida', type: 'select', options: ['Alevines', 'Juveniles', 'Adultos', 'Reproductores', 'Todas las etapas'] },
    { id: 'special_diet', name: 'Dieta especial', type: 'tags', options: ['Vegetariano', 'Carnívoro', 'Omnívoro', 'Sin gluten', 'Orgánico'] },
    { id: 'preservation_method', name: 'Método de conservación', type: 'select', options: ['Seco', 'Congelado', 'Liofilizado', 'Refrigerado', 'Vivo'] },
    { id: 'feeding_frequency', name: 'Frecuencia de alimentación', type: 'select', options: ['Diario', '2-3 veces/día', 'Ocasional', 'Según necesidad'] },
    { id: 'digestibility', name: 'Digestibilidad', type: 'select', options: ['Fácil digestión', 'Digestión estándar', 'Requiere adaptación', 'Digestión especializada'] }
  ],

  // Bases para acuarios
  'pets-products-bases-acuarios': [
    { id: 'support_capacity', name: 'Capacidad de soporte', type: 'select', options: ['Hasta 100L', '100-300L', '300-500L', '500L+', 'Capacidad variable'] },
    { id: 'stand_material', name: 'Material del soporte', type: 'select', options: ['Madera', 'Metal', 'MDF', 'Vidrio templado', 'Materiales mixtos'] },
    { id: 'storage_features', name: 'Características de almacenamiento', type: 'tags', options: ['Gabinete cerrado', 'Estantes abiertos', 'Cajones', 'Compartimento filtro', 'Sin almacenamiento'] },
    { id: 'leveling_system', name: 'Sistema de nivelación', type: 'select', options: ['Sin nivelación', 'Patas ajustables', 'Sistema de nivelación', 'Nivelación automática'] },
    { id: 'door_configuration', name: 'Configuración de puertas', type: 'select', options: ['Sin puertas', 'Una puerta', 'Dos puertas', 'Puertas múltiples'] },
    { id: 'ventilation_design', name: 'Diseño de ventilación', type: 'select', options: ['Sin ventilación', 'Ventilación básica', 'Ventilación activa', 'Sistema de enfriamiento'] },
    { id: 'cable_management', name: 'Gestión de cables', type: 'select', options: ['Sin gestión', 'Orificios básicos', 'Sistema de cables', 'Gestión completa'] },
    { id: 'finish_quality', name: 'Calidad del acabado', type: 'select', options: ['Básico', 'Estándar', 'Premium', 'Lujo'] },
    { id: 'assembly_requirement', name: 'Requerimiento de ensamblaje', type: 'select', options: ['Pre-ensamblado', 'Ensamblaje simple', 'Ensamblaje moderado', 'Ensamblaje complejo'] },
    { id: 'mobility_features', name: 'Características de movilidad', type: 'select', options: ['Estático', 'Ruedas opcionales', 'Ruedas incluidas', 'Sistema móvil'] }
  ],

  // Comederos para peces
  'pets-products-comederos-peces': [
    { id: 'feeding_mechanism', name: 'Mecanismo de alimentación', type: 'select', options: ['Manual', 'Automático temporizado', 'Programable', 'Alimentación continua'] },
    { id: 'food_capacity', name: 'Capacidad de alimento', type: 'select', options: ['Pequeña (1-7 días)', 'Mediana (1-2 semanas)', 'Grande (2-4 semanas)', 'Extra grande (1+ mes)'] },
    { id: 'portion_control', name: 'Control de porciones', type: 'select', options: ['Porción fija', 'Porciones ajustables', 'Control preciso', 'Múltiples porciones'] },
    { id: 'food_type_compatibility', name: 'Compatibilidad tipo de alimento', type: 'tags', options: ['Escamas', 'Gránulos', 'Tabletas', 'Alimento líquido', 'Múltiples tipos'] },
    { id: 'power_source', name: 'Fuente de energía', type: 'select', options: ['Baterías', 'Eléctrico', 'Solar', 'Manual', 'Híbrido'] },
    { id: 'programming_options', name: 'Opciones de programación', type: 'select', options: ['Sin programación', 'Programación básica', 'Múltiples horarios', 'Programación avanzada'] },
    { id: 'mounting_type', name: 'Tipo de montaje', type: 'select', options: ['Flotante', 'Montaje en borde', 'Ventosa', 'Soporte independiente'] },
    { id: 'moisture_protection', name: 'Protección contra humedad', type: 'select', options: ['Sin protección', 'Protección básica', 'Hermético', 'A prueba de agua'] },
    { id: 'backup_features', name: 'Características de respaldo', type: 'select', options: ['Sin respaldo', 'Respaldo de batería', 'Memoria de configuración', 'Sistema de emergencia'] },
    { id: 'connectivity', name: 'Conectividad', type: 'select', options: ['Sin conectividad', 'Bluetooth', 'WiFi', 'App móvil'] }
  ],

  // Controladores de temperatura de acuarios
  'pets-products-controladores-temperatura': [
    { id: 'temperature_range', name: 'Rango de temperatura', type: 'select', options: ['18-26°C', '20-30°C', '22-32°C', '15-35°C', 'Rango amplio'] },
    { id: 'heating_capacity', name: 'Capacidad de calentamiento', type: 'select', options: ['25W', '50W', '100W', '150W+', 'Variable'] },
    { id: 'control_precision', name: 'Precisión de control', type: 'select', options: ['±2°C', '±1°C', '±0.5°C', '±0.1°C'] },
    { id: 'display_type', name: 'Tipo de pantalla', type: 'select', options: ['Sin pantalla', 'LED básico', 'LCD', 'Pantalla digital', 'Pantalla táctil'] },
    { id: 'safety_features_temp', name: 'Características de seguridad', type: 'tags', options: ['Protección sobrecalentamiento', 'Apagado automático', 'Alarma sonora', 'Backup de temperatura', 'Múltiples protecciones'] },
    { id: 'installation_type', name: 'Tipo de instalación', type: 'select', options: ['Sumergible', 'Externo', 'En línea', 'Controlador separado'] },
    { id: 'probe_type', name: 'Tipo de sonda', type: 'select', options: ['Sonda básica', 'Sonda de precisión', 'Múltiples sondas', 'Sonda inalámbrica'] },
    { id: 'programmability', name: 'Programabilidad', type: 'select', options: ['Temperatura fija', 'Programación básica', 'Múltiples programas', 'Programación avanzada'] },
    { id: 'connectivity_temp', name: 'Conectividad', type: 'select', options: ['Sin conectividad', 'Bluetooth', 'WiFi', 'App control'] },
    { id: 'backup_power', name: 'Energía de respaldo', type: 'select', options: ['Sin respaldo', 'Batería interna', 'UPS compatible', 'Sistema redundante'] }
  ],

  // Decoraciones para acuarios
  'pets-products-decoraciones-acuarios': [
    { id: 'decoration_type', name: 'Tipo de decoración', type: 'tags', options: ['Plantas artificiales', 'Rocas', 'Troncos', 'Ornamentos', 'Fondos'] },
    { id: 'material_decoration', name: 'Material', type: 'select', options: ['Resina', 'Cerámica', 'Silicona', 'Natural', 'Materiales mixtos'] },
    { id: 'size_category', name: 'Categoría de tamaño', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Extra grande', 'Conjunto'] },
    { id: 'theme_style', name: 'Estilo/Tema', type: 'tags', options: ['Natural', 'Tropical', 'Marino', 'Asiático', 'Moderno', 'Fantástico'] },
    { id: 'fish_safety', name: 'Seguridad para peces', type: 'select', options: ['Bordes suaves', 'Sin partes pequeñas', 'Material no tóxico', 'Seguridad completa'] },
    { id: 'water_compatibility', name: 'Compatibilidad con agua', type: 'tags', options: ['Agua dulce', 'Agua salada', 'pH neutro', 'Todos los tipos'] },
    { id: 'hiding_places', name: 'Lugares de escondite', type: 'select', options: ['Sin escondites', 'Escondites básicos', 'Múltiples escondites', 'Sistema de cuevas'] },
    { id: 'maintenance_ease', name: 'Facilidad de mantenimiento', type: 'select', options: ['Fácil limpieza', 'Mantenimiento estándar', 'Requiere cuidado', 'Alto mantenimiento'] },
    { id: 'color_stability', name: 'Estabilidad del color', type: 'select', options: ['Color permanente', 'Resistente UV', 'Puede desteñir', 'Color temporal'] },
    { id: 'interactive_features', name: 'Características interactivas', type: 'tags', options: ['Movimiento', 'Burbujas', 'Luces', 'Sonido', 'Sin características'] }
  ],

  // Difusores y bombas de aire para acuarios
  'pets-products-difusores-bombas-aire': [
    { id: 'air_flow_rate', name: 'Caudal de aire', type: 'select', options: ['1-3 L/min', '3-5 L/min', '5-10 L/min', '10+ L/min', 'Variable'] },
    { id: 'power_consumption', name: 'Consumo de energía', type: 'select', options: ['Bajo (1-3W)', 'Medio (3-5W)', 'Alto (5-10W)', 'Muy alto (10W+)'] },
    { id: 'noise_level', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Bajo ruido', 'Ruido moderado', 'Ruidoso'] },
    { id: 'outlet_configuration', name: 'Configuración de salidas', type: 'select', options: ['Una salida', 'Dos salidas', 'Múltiples salidas', 'Salidas ajustables'] },
    { id: 'diffuser_type', name: 'Tipo de difusor', type: 'tags', options: ['Piedra difusora', 'Difusor flexible', 'Cortina de burbujas', 'Difusor decorativo', 'Múltiples tipos'] },
    { id: 'installation_method', name: 'Método de instalación', type: 'select', options: ['Ventosa', 'Peso propio', 'Montaje en vidrio', 'Enterrado en sustrato'] },
    { id: 'pressure_output', name: 'Presión de salida', type: 'select', options: ['Baja presión', 'Presión estándar', 'Alta presión', 'Presión ajustable'] },
    { id: 'durability_rating', name: 'Calificación de durabilidad', type: 'select', options: ['Básica', 'Estándar', 'Alta durabilidad', 'Uso profesional'] },
    { id: 'check_valve_included', name: 'Válvula de retención incluida', type: 'select', options: ['No incluida', 'Incluida', 'Múltiples válvulas', 'Sistema avanzado'] },
    { id: 'bubble_size', name: 'Tamaño de burbujas', type: 'select', options: ['Burbujas finas', 'Burbujas medianas', 'Burbujas grandes', 'Tamaño variable'] }
  ],

  // Fertilizantes para plantas acuáticas
  'pets-products-fertilizantes-plantas': [
    { id: 'fertilizer_type', name: 'Tipo de fertilizante', type: 'select', options: ['Líquido', 'Tabletas', 'Polvo', 'Substrato enriquecido', 'Sistema CO2'] },
    { id: 'nutrient_focus', name: 'Enfoque nutricional', type: 'tags', options: ['Nitrógeno', 'Fósforo', 'Potasio', 'Hierro', 'Micronutrientes', 'Completo'] },
    { id: 'plant_stage_target', name: 'Etapa de planta objetivo', type: 'select', options: ['Plantación inicial', 'Crecimiento', 'Mantenimiento', 'Todas las etapas'] },
    { id: 'dosage_frequency', name: 'Frecuencia de dosificación', type: 'select', options: ['Diario', 'Semanal', 'Quincenal', 'Mensual', 'Según necesidad'] },
    { id: 'water_parameter_effect', name: 'Efecto en parámetros del agua', type: 'tags', options: ['pH neutro', 'Aumenta pH', 'Disminuye pH', 'Afecta dureza', 'Sin efecto'] },
    { id: 'plant_type_suitability', name: 'Adecuado para tipo de planta', type: 'tags', options: ['Plantas fáciles', 'Plantas exigentes', 'Musgos', 'Plantas rojas', 'Todas las plantas'] },
    { id: 'algae_prevention', name: 'Prevención de algas', type: 'select', options: ['Sin prevención', 'Prevención básica', 'Control activo', 'Prevención avanzada'] },
    { id: 'co2_requirement', name: 'Requerimiento de CO2', type: 'select', options: ['Sin CO2', 'CO2 opcional', 'CO2 recomendado', 'CO2 requerido'] },
    { id: 'lighting_dependency', name: 'Dependencia de iluminación', type: 'select', options: ['Luz baja', 'Luz media', 'Luz alta', 'Todas las intensidades'] },
    { id: 'fish_safety_fertilizer', name: 'Seguridad para peces', type: 'select', options: ['Seguro para todos', 'Seguro con precauciones', 'Requiere monitoreo', 'Solo plantas'] }
  ],

  // Filtros para acuarios
  'pets-products-filtros-acuarios': [
    { id: 'filter_type', name: 'Tipo de filtro', type: 'select', options: ['Interno', 'Externo', 'Cascada', 'Esponja', 'Canister', 'Sump'] },
    { id: 'filtration_stages', name: 'Etapas de filtración', type: 'tags', options: ['Mecánica', 'Biológica', 'Química', 'UV', 'Todas las etapas'] },
    { id: 'flow_rate', name: 'Caudal', type: 'select', options: ['100-300 L/h', '300-600 L/h', '600-1000 L/h', '1000+ L/h', 'Variable'] },
    { id: 'media_included', name: 'Medios incluidos', type: 'tags', options: ['Esponja mecánica', 'Medios biológicos', 'Carbón activado', 'Cerámica', 'Kit completo'] },
    { id: 'priming_method', name: 'Método de cebado', type: 'select', options: ['Auto-cebado', 'Cebado manual', 'Sistema de bomba', 'Sin cebado requerido'] },
    { id: 'maintenance_frequency', name: 'Frecuencia de mantenimiento', type: 'select', options: ['Semanal', 'Quincenal', 'Mensual', 'Bimestral', 'Variable'] },
    { id: 'noise_level_filter', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Muy bajo', 'Bajo', 'Moderado'] },
    { id: 'energy_efficiency', name: 'Eficiencia energética', type: 'select', options: ['Estándar', 'Eficiente', 'Muy eficiente', 'Ultra eficiente'] },
    { id: 'customization_options', name: 'Opciones de personalización', type: 'select', options: ['Configuración fija', 'Medios intercambiables', 'Compartimentos ajustables', 'Totalmente personalizable'] },
    { id: 'backup_features_filter', name: 'Características de respaldo', type: 'select', options: ['Sin respaldo', 'Alerta de flujo', 'Bomba de respaldo', 'Sistema redundante'] }
  ],

  // Iluminación para acuarios
  'pets-products-iluminacion-acuarios': [
    { id: 'light_type', name: 'Tipo de luz', type: 'select', options: ['LED', 'Fluorescente', 'Metal halide', 'T5', 'T8', 'Híbrido'] },
    { id: 'wattage', name: 'Potencia', type: 'select', options: ['10-20W', '20-40W', '40-80W', '80-150W', '150W+'] },
    { id: 'spectrum_coverage', name: 'Cobertura del espectro', type: 'tags', options: ['Espectro completo', 'Azul/Blanco', 'RGB', 'Plantas específico', 'Marino específico'] },
    { id: 'programmable_timing', name: 'Programación de tiempo', type: 'select', options: ['Sin programación', 'Timer básico', 'Programación múltiple', 'Control inteligente'] },
    { id: 'mounting_system', name: 'Sistema de montaje', type: 'select', options: ['Clips de borde', 'Soporte ajustable', 'Suspensión', 'Montaje fijo'] },
    { id: 'dimming_capability', name: 'Capacidad de atenuación', type: 'select', options: ['Sin atenuación', 'Atenuación básica', 'Atenuación precisa', 'Control total'] },
    { id: 'cooling_system', name: 'Sistema de enfriamiento', type: 'select', options: ['Sin enfriamiento', 'Disipadores pasivos', 'Ventiladores', 'Enfriamiento líquido'] },
    { id: 'par_output', name: 'Salida PAR', type: 'select', options: ['Bajo (50-100)', 'Medio (100-200)', 'Alto (200-300)', 'Muy alto (300+)'] },
    { id: 'size_compatibility', name: 'Compatibilidad de tamaño', type: 'select', options: ['30-60 cm', '60-90 cm', '90-120 cm', '120+ cm', 'Ajustable'] },
    { id: 'wireless_control', name: 'Control inalámbrico', type: 'select', options: ['Sin control', 'Bluetooth', 'WiFi', 'App control'] }
  ],

  // Productos de limpieza de acuarios
  'pets-products-limpieza-acuarios': [
    { id: 'cleaning_tool_type', name: 'Tipo de herramienta', type: 'tags', options: ['Raspador de algas', 'Aspiradora', 'Cepillos', 'Paños', 'Kit completo'] },
    { id: 'material_tool', name: 'Material de la herramienta', type: 'select', options: ['Plástico', 'Metal', 'Acero inoxidable', 'Silicona', 'Materiales múltiples'] },
    { id: 'handle_length', name: 'Longitud del mango', type: 'select', options: ['Corto (20-30cm)', 'Medio (30-50cm)', 'Largo (50-80cm)', 'Extra largo (80cm+)'] },
    { id: 'scratch_resistance', name: 'Resistencia a rayones', type: 'select', options: ['Para acrílico', 'Para vidrio', 'Universal seguro', 'Uso profesional'] },
    { id: 'algae_removal_efficiency', name: 'Eficiencia remoción algas', type: 'select', options: ['Algas suaves', 'Algas moderadas', 'Algas resistentes', 'Todas las algas'] },
    { id: 'ergonomic_design', name: 'Diseño ergonómico', type: 'select', options: ['Básico', 'Ergonómico', 'Muy ergonómico', 'Profesional'] },
    { id: 'replacement_parts', name: 'Partes reemplazables', type: 'select', options: ['Sin repuestos', 'Algunas partes', 'Múltiples partes', 'Completamente modular'] },
    { id: 'ease_of_use', name: 'Facilidad de uso', type: 'select', options: ['Muy fácil', 'Fácil', 'Requiere práctica', 'Uso experto'] },
    { id: 'storage_convenience', name: 'Conveniencia de almacenamiento', type: 'select', options: ['Compacto', 'Plegable', 'Desmontable', 'Almacenamiento integrado'] },
    { id: 'multi_functionality', name: 'Multifuncionalidad', type: 'tags', options: ['Solo limpieza', 'Múltiples usos', 'Kit todo-en-uno', 'Herramientas especializadas'] }
  ],

  // Rebosaderos para acuarios
  'pets-products-rebosaderos-acuarios': [
    { id: 'overflow_type', name: 'Tipo de rebosadero', type: 'select', options: ['Interno', 'Externo', 'Corner overflow', 'Centrado', 'Personalizable'] },
    { id: 'flow_capacity_overflow', name: 'Capacidad de flujo', type: 'select', options: ['500-1000 L/h', '1000-2000 L/h', '2000-3000 L/h', '3000+ L/h'] },
    { id: 'installation_complexity_overflow', name: 'Complejidad de instalación', type: 'select', options: ['Fácil instalación', 'Moderadamente complejo', 'Requiere modificación', 'Instalación profesional'] },
    { id: 'material_overflow', name: 'Material', type: 'select', options: ['Acrílico', 'Vidrio', 'PVC', 'ABS', 'Materiales premium'] },
    { id: 'noise_level_overflow', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Muy bajo', 'Bajo', 'Moderado'] },
    { id: 'emergency_drain', name: 'Drenaje de emergencia', type: 'select', options: ['Sin drenaje emergencia', 'Drenaje básico', 'Sistema doble', 'Sistema múltiple'] },
    { id: 'adjustability', name: 'Ajustabilidad', type: 'select', options: ['Fijo', 'Altura ajustable', 'Flujo ajustable', 'Completamente ajustable'] },
    { id: 'filtration_integration', name: 'Integración con filtración', type: 'select', options: ['Sin integración', 'Compatible filtros', 'Sistema integrado', 'Diseño personalizado'] },
    { id: 'surface_skimming', name: 'Desnatado de superficie', type: 'select', options: ['Sin desnatado', 'Desnatado básico', 'Desnatado eficiente', 'Desnatado premium'] },
    { id: 'maintenance_access', name: 'Acceso para mantenimiento', type: 'select', options: ['Acceso limitado', 'Acceso moderado', 'Fácil acceso', 'Acceso completo'] }
  ],

  // Redes para acuarios
  'pets-products-redes-acuarios': [
    { id: 'net_size', name: 'Tamaño de red', type: 'select', options: ['Pequeña (5-10cm)', 'Mediana (10-15cm)', 'Grande (15-25cm)', 'Extra grande (25cm+)'] },
    { id: 'mesh_density', name: 'Densidad de malla', type: 'select', options: ['Malla fina', 'Malla media', 'Malla gruesa', 'Malla especializada'] },
    { id: 'handle_material', name: 'Material del mango', type: 'select', options: ['Plástico', 'Aluminio', 'Acero inoxidable', 'Fibra de carbono'] },
    { id: 'net_depth', name: 'Profundidad de red', type: 'select', options: ['Poco profunda', 'Profundidad media', 'Profunda', 'Extra profunda'] },
    { id: 'fish_safety_net', name: 'Seguridad para peces', type: 'select', options: ['Bordes suaves', 'Malla protectora', 'Diseño atraumático', 'Seguridad máxima'] },
    { id: 'corner_design', name: 'Diseño de esquinas', type: 'select', options: ['Esquinas cuadradas', 'Esquinas redondeadas', 'Esquinas especiales', 'Sin esquinas'] },
    { id: 'telescopic_handle', name: 'Mango telescópico', type: 'select', options: ['Mango fijo', 'Extensión básica', 'Totalmente telescópico', 'Sistema modular'] },
    { id: 'specialized_use', name: 'Uso especializado', type: 'tags', options: ['Peces pequeños', 'Peces grandes', 'Plantas', 'Detritos', 'Uso general'] },
    { id: 'durability_net', name: 'Durabilidad', type: 'select', options: ['Uso básico', 'Uso estándar', 'Alta durabilidad', 'Uso profesional'] },
    { id: 'color_visibility', name: 'Visibilidad del color', type: 'select', options: ['Color neutro', 'Alta visibilidad', 'Camuflado', 'Color funcional'] }
  ],

  // Sustratos y arena para acuarios
  'pets-products-sustratos-arena': [
    { id: 'substrate_type', name: 'Tipo de sustrato', type: 'select', options: ['Grava', 'Arena', 'Sustrato plantado', 'Sustrato activo', 'Materiales mixtos'] },
    { id: 'grain_size', name: 'Tamaño de grano', type: 'select', options: ['Fino (1-2mm)', 'Medio (2-5mm)', 'Grueso (5-10mm)', 'Mixto', 'Extra fino'] },
    { id: 'color_substrate', name: 'Color', type: 'tags', options: ['Natural', 'Negro', 'Blanco', 'Colorido', 'Múltiples colores'] },
    { id: 'ph_effect', name: 'Efecto en pH', type: 'select', options: ['pH neutro', 'Aumenta pH', 'Disminuye pH', 'Estabiliza pH'] },
    { id: 'plant_nutrition', name: 'Nutrición para plantas', type: 'select', options: ['Sin nutrientes', 'Nutrientes básicos', 'Rico en nutrientes', 'Súper enriquecido'] },
    { id: 'biological_activity', name: 'Actividad biológica', type: 'select', options: ['Inerte', 'Ligeramente activo', 'Biológicamente activo', 'Muy activo'] },
    { id: 'cleaning_requirement', name: 'Requerimiento de limpieza', type: 'select', options: ['Sin limpieza', 'Enjuague ligero', 'Limpieza estándar', 'Limpieza exhaustiva'] },
    { id: 'fish_compatibility_substrate', name: 'Compatibilidad con peces', type: 'tags', options: ['Peces de fondo', 'Cíclidos', 'Peces pequeños', 'Todos los peces'] },
    { id: 'longevity', name: 'Longevidad', type: 'select', options: ['Corta duración', 'Duración media', 'Larga duración', 'Permanente'] },
    { id: 'special_properties', name: 'Propiedades especiales', type: 'tags', options: ['Absorbe amoníaco', 'Libera minerales', 'Bacterias beneficiosas', 'Múltiples propiedades'] }
  ],

  // Tratamientos del agua de acuarios
  'pets-products-tratamientos-agua': [
    { id: 'treatment_purpose', name: 'Propósito del tratamiento', type: 'tags', options: ['Acondicionador', 'pH ajuste', 'Dureza', 'Bacterias beneficiosas', 'Medicamentos'] },
    { id: 'dosage_form', name: 'Forma de dosificación', type: 'select', options: ['Líquido', 'Polvo', 'Tabletas', 'Gotas', 'Gel'] },
    { id: 'action_speed', name: 'Velocidad de acción', type: 'select', options: ['Instantáneo', 'Rápido (minutos)', 'Moderado (horas)', 'Lento (días)'] },
    { id: 'water_type_treatment', name: 'Tipo de agua', type: 'tags', options: ['Agua dulce', 'Agua salada', 'Marino', 'Todos los tipos'] },
    { id: 'safety_level', name: 'Nivel de seguridad', type: 'select', options: ['Seguro para todos', 'Precauciones menores', 'Requiere cuidado', 'Solo expertos'] },
    { id: 'concentration', name: 'Concentración', type: 'select', options: ['Baja concentración', 'Concentración media', 'Alta concentración', 'Ultra concentrado'] },
    { id: 'shelf_life', name: 'Vida útil', type: 'select', options: ['6 meses', '1 año', '2 años', '3+ años'] },
    { id: 'mixing_compatibility', name: 'Compatibilidad de mezcla', type: 'select', options: ['No mezclar', 'Algunas mezclas OK', 'Compatible mayoría', 'Totalmente compatible'] },
    { id: 'monitoring_required', name: 'Monitoreo requerido', type: 'select', options: ['Sin monitoreo', 'Monitoreo básico', 'Monitoreo regular', 'Monitoreo intensivo'] },
    { id: 'reversal_method', name: 'Método de reversión', type: 'select', options: ['No reversible', 'Cambio de agua', 'Carbón activado', 'Tiempo natural'] }
  ],

  // Tuberías para acuarios y estanques
  'pets-products-tuberias-acuarios': [
    { id: 'tube_diameter', name: 'Diámetro de tubería', type: 'select', options: ['6-10mm', '10-15mm', '15-20mm', '20-25mm', '25mm+'] },
    { id: 'material_tube', name: 'Material', type: 'select', options: ['PVC', 'Silicona', 'Vinilo', 'Polietileno', 'Materiales especiales'] },
    { id: 'flexibility', name: 'Flexibilidad', type: 'select', options: ['Rígido', 'Semi-flexible', 'Flexible', 'Ultra flexible'] },
    { id: 'pressure_rating', name: 'Clasificación de presión', type: 'select', options: ['Baja presión', 'Presión estándar', 'Alta presión', 'Presión extrema'] },
    { id: 'temperature_resistance', name: 'Resistencia a temperatura', type: 'select', options: ['Estándar', 'Resistente calor', 'Resistente frío', 'Amplio rango'] },
    { id: 'uv_resistance', name: 'Resistencia UV', type: 'select', options: ['Sin protección UV', 'Protección básica', 'Alta protección', 'Protección total'] },
    { id: 'connection_type', name: 'Tipo de conexión', type: 'tags', options: ['Barb fitting', 'Rosca', 'Compresión', 'Push-fit', 'Múltiples tipos'] },
    { id: 'transparency', name: 'Transparencia', type: 'select', options: ['Opaco', 'Translúcido', 'Transparente', 'Cristal claro'] },
    { id: 'algae_resistance', name: 'Resistencia a algas', type: 'select', options: ['Sin resistencia', 'Resistencia básica', 'Alta resistencia', 'Completamente resistente'] },
    { id: 'length_availability', name: 'Disponibilidad de longitudes', type: 'select', options: ['Longitudes fijas', 'Múltiples opciones', 'Corte personalizado', 'Rollos grandes'] }
  ],

  // Kits de adiestramiento para mascotas (categoría general)
  'pets-products-kits-adiestramiento': [
    { id: 'training_method', name: 'Método de entrenamiento', type: 'tags', options: ['Refuerzo positivo', 'Entrenamiento con clicker', 'Corrección suave', 'Entrenamiento de casa', 'Múltiples métodos'] },
    { id: 'skill_level_required_training', name: 'Nivel de habilidad requerido', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Entrenador profesional'] },
    { id: 'age_suitability_training', name: 'Adecuado para edad', type: 'select', options: ['Cachorros', 'Jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'training_environment', name: 'Ambiente de entrenamiento', type: 'tags', options: ['Interior', 'Exterior', 'Ambos ambientes', 'Espacios específicos'] },
    { id: 'behavioral_focus_training', name: 'Enfoque comportamental', type: 'tags', options: ['Obediencia básica', 'Corrección de problemas', 'Trucos avanzados', 'Socialización', 'Múltiples aspectos'] },
    { id: 'time_commitment', name: 'Compromiso de tiempo', type: 'select', options: ['5-10 min/día', '15-30 min/día', '30-60 min/día', '1+ hora/día'] },
    { id: 'results_timeline', name: 'Cronología de resultados', type: 'select', options: ['Inmediatos', '1-2 semanas', '1 mes', '2-3 meses', 'Variable'] }
  ],

  // Dispensadores de premios y contadores para adiestrar mascotas
  'pets-products-dispensadores-premios': [
    { id: 'dispenser_type', name: 'Tipo de dispensador', type: 'select', options: ['Manual', 'Semi-automático', 'Automático', 'Activado por voz', 'Controlado por app'] },
    { id: 'treat_capacity', name: 'Capacidad de premios', type: 'select', options: ['Pequeña (10-20 premios)', 'Mediana (20-50 premios)', 'Grande (50-100 premios)', 'Extra grande (100+ premios)'] },
    { id: 'treat_size_compatibility', name: 'Compatibilidad tamaño de premio', type: 'tags', options: ['Premios pequeños', 'Premios medianos', 'Premios grandes', 'Múltiples tamaños', 'Ajustable'] },
    { id: 'dispensing_mechanism', name: 'Mecanismo de dispensado', type: 'select', options: ['Gravedad', 'Resorte', 'Motorizado', 'Neumático', 'Múltiples sistemas'] },
    { id: 'counter_functionality', name: 'Funcionalidad de contador', type: 'select', options: ['Sin contador', 'Contador básico', 'Contador digital', 'Sistema de seguimiento'] },
    { id: 'portion_control_dispenser', name: 'Control de porciones', type: 'select', options: ['Porción fija', 'Porciones ajustables', 'Control preciso', 'Programable'] },
    { id: 'durability_dispenser', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso estándar', 'Uso intensivo', 'Uso profesional'] },
    { id: 'cleaning_ease_dispenser', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil limpieza', 'Limpieza estándar', 'Fácil limpieza', 'Autolimpiante'] },
    { id: 'portability_dispenser', name: 'Portabilidad', type: 'select', options: ['Estacionario', 'Semi-portátil', 'Completamente portátil', 'De bolsillo'] },
    { id: 'sound_features', name: 'Características de sonido', type: 'tags', options: ['Silencioso', 'Click audible', 'Tonos programables', 'Grabación de voz', 'Múltiples sonidos'] }
  ],

  // Empapadores para mascotas
  'pets-products-empapadores-mascotas': [
    { id: 'absorbency_level', name: 'Nivel de absorción', type: 'select', options: ['Absorción básica', 'Absorción estándar', 'Alta absorción', 'Ultra absorción'] },
    { id: 'size_pad', name: 'Tamaño del empapador', type: 'select', options: ['Pequeño (30x45cm)', 'Mediano (45x60cm)', 'Grande (60x90cm)', 'Extra grande (90x120cm)', 'Múltiples tamaños'] },
    { id: 'leak_proof_backing', name: 'Respaldo a prueba de fugas', type: 'select', options: ['Sin protección', 'Protección básica', 'A prueba de fugas', 'Protección total'] },
    { id: 'odor_control_pad', name: 'Control de olores', type: 'select', options: ['Sin control', 'Control básico', 'Control avanzado', 'Eliminación completa'] },
    { id: 'adhesive_strips', name: 'Tiras adhesivas', type: 'select', options: ['Sin adhesivo', 'Adhesivo básico', 'Adhesivo fuerte', 'Sistema de fijación'] },
    { id: 'training_indicators', name: 'Indicadores de entrenamiento', type: 'tags', options: ['Sin indicadores', 'Aroma atrayente', 'Colores guía', 'Marcas visuales', 'Múltiples indicadores'] },
    { id: 'disposability', name: 'Desechabilidad', type: 'select', options: ['Desechable', 'Parcialmente reutilizable', 'Lavable', 'Biodegradable'] },
    { id: 'quick_dry_technology', name: 'Tecnología de secado rápido', type: 'select', options: ['Secado estándar', 'Secado rápido', 'Secado instantáneo', 'Tecnología avanzada'] },
    { id: 'multi_layer_construction', name: 'Construcción multicapa', type: 'select', options: ['Capa simple', '2 capas', '3 capas', '4+ capas'] },
    { id: 'attractant_scent', name: 'Aroma atrayente', type: 'tags', options: ['Sin aroma', 'Aroma suave', 'Aroma atrayente', 'Feromonas', 'Múltiples aromas'] }
  ],

  // Protectores de empapadores para mascotas
  'pets-products-protectores-empapadores': [
    { id: 'protection_material', name: 'Material de protección', type: 'select', options: ['Plástico básico', 'Vinilo', 'TPU', 'Materiales avanzados', 'Múltiples capas'] },
    { id: 'size_compatibility_protector', name: 'Compatibilidad de tamaños', type: 'select', options: ['Tamaño específico', 'Múltiples tamaños', 'Ajustable', 'Universal'] },
    { id: 'edge_design', name: 'Diseño de bordes', type: 'select', options: ['Bordes planos', 'Bordes elevados', 'Bordes contorneados', 'Sistema de barrera'] },
    { id: 'slip_resistance', name: 'Resistencia al deslizamiento', type: 'select', options: ['Sin resistencia', 'Resistencia básica', 'Alta resistencia', 'Sistema antideslizante'] },
    { id: 'waterproof_rating', name: 'Clasificación impermeable', type: 'select', options: ['Resistente al agua', 'Parcialmente impermeable', 'Completamente impermeable', 'Barrera total'] },
    { id: 'ease_of_cleaning_protector', name: 'Facilidad de limpieza', type: 'select', options: ['Limpieza básica', 'Fácil limpieza', 'Auto-limpiante', 'Lavable en máquina'] },
    { id: 'durability_protector', name: 'Durabilidad', type: 'select', options: ['Uso básico', 'Uso moderado', 'Uso intensivo', 'Uso profesional'] },
    { id: 'storage_convenience_protector', name: 'Conveniencia de almacenamiento', type: 'select', options: ['Voluminoso', 'Almacenamiento estándar', 'Compacto', 'Plegable'] },
    { id: 'floor_protection_level', name: 'Nivel de protección del piso', type: 'select', options: ['Protección básica', 'Protección estándar', 'Protección completa', 'Protección premium'] },
    { id: 'reusability', name: 'Reutilización', type: 'select', options: ['Uso único', 'Reutilizable limitado', 'Altamente reutilizable', 'Uso permanente'] }
  ],

  // Soluciones y esprais de adiestramiento para mascotas
  'pets-products-soluciones-esprais-adiestramiento': [
    { id: 'solution_purpose', name: 'Propósito de la solución', type: 'tags', options: ['Atrayente para entrenamiento', 'Repelente de áreas', 'Eliminador de olores', 'Neutralizador', 'Múltiples propósitos'] },
    { id: 'active_ingredients_training', name: 'Ingredientes activos', type: 'tags', options: ['Enzimas', 'Feromonas', 'Aceites esenciales', 'Compuestos sintéticos', 'Ingredientes naturales'] },
    { id: 'application_method_spray', name: 'Método de aplicación', type: 'select', options: ['Spray directo', 'Nebulización', 'Aplicación con paño', 'Difusión', 'Múltiples métodos'] },
    { id: 'surface_compatibility', name: 'Compatibilidad de superficies', type: 'tags', options: ['Telas', 'Madera', 'Plástico', 'Metal', 'Todas las superficies'] },
    { id: 'effectiveness_duration', name: 'Duración de efectividad', type: 'select', options: ['1-2 horas', '4-6 horas', '12-24 horas', '2-7 días', 'Hasta nuevo tratamiento'] },
    { id: 'safety_rating_spray', name: 'Calificación de seguridad', type: 'select', options: ['Seguro para mascotas', 'Seguro para familia', 'No tóxico', 'Orgánico certificado'] },
    { id: 'scent_strength', name: 'Intensidad del aroma', type: 'select', options: ['Sin aroma', 'Aroma suave', 'Aroma moderado', 'Aroma fuerte'] },
    { id: 'stain_prevention', name: 'Prevención de manchas', type: 'select', options: ['Sin prevención', 'Prevención básica', 'Prevención avanzada', 'Protección completa'] },
    { id: 'training_stage_target', name: 'Etapa de entrenamiento objetivo', type: 'tags', options: ['Entrenamiento inicial', 'Refuerzo', 'Corrección de problemas', 'Mantenimiento', 'Todas las etapas'] },
    { id: 'environmental_impact', name: 'Impacto ambiental', type: 'select', options: ['Estándar', 'Eco-friendly', 'Biodegradable', 'Orgánico certificado'] }
  ],

  // Suplementos y vitaminas para mascotas (categoría general)
  'pets-products-suplementos-vitaminas': [
    { id: 'supplement_form', name: 'Forma del suplemento', type: 'select', options: ['Tabletas', 'Cápsulas', 'Polvo', 'Líquido', 'Masticables', 'Pasta'] },
    { id: 'administration_method', name: 'Método de administración', type: 'select', options: ['Mezclado con comida', 'Administración directa', 'Disolución en agua', 'Como premio', 'Múltiples métodos'] },
    { id: 'age_target_supplement', name: 'Edad objetivo', type: 'tags', options: ['Cachorros/Gatitos', 'Jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'species_compatibility', name: 'Compatibilidad de especies', type: 'tags', options: ['Solo perros', 'Solo gatos', 'Perros y gatos', 'Múltiples especies', 'Aves', 'Peces'] },
    { id: 'dosage_frequency', name: 'Frecuencia de dosificación', type: 'select', options: ['Una vez al día', 'Dos veces al día', 'Con cada comida', 'Según necesidad', 'Variable'] },
    { id: 'veterinary_recommendation', name: 'Recomendación veterinaria', type: 'select', options: ['Sin prescripción', 'Recomendado por veterinarios', 'Requiere consulta', 'Solo con prescripción'] },
    { id: 'natural_synthetic', name: 'Natural/Sintético', type: 'select', options: ['100% natural', 'Principalmente natural', 'Mezcla natural-sintética', 'Sintético'] },
    { id: 'palatability_supplement', name: 'Palatabilidad', type: 'select', options: ['Muy apetecible', 'Apetecible', 'Neutro', 'Puede requerir mezcla'] },
    { id: 'shelf_life_supplement', name: 'Vida útil', type: 'select', options: ['6 meses', '1 año', '2 años', '3+ años'] },
    { id: 'packaging_protection', name: 'Protección del empaque', type: 'select', options: ['Básica', 'Protección UV', 'Hermético', 'Protección premium'] }
  ],

  // Aceite de pescado
  'pets-products-aceite-pescado': [
    { id: 'fish_source', name: 'Fuente de pescado', type: 'tags', options: ['Salmón', 'Sardina', 'Anchoa', 'Krill', 'Múltiples fuentes'] },
    { id: 'omega_content', name: 'Contenido de omega', type: 'select', options: ['Omega-3 básico', 'Alto en EPA', 'Alto en DHA', 'EPA+DHA balanceado', 'Omega 3-6-9'] },
    { id: 'extraction_method', name: 'Método de extracción', type: 'select', options: ['Prensado en frío', 'Extracción molecular', 'CO2 supercrítico', 'Tradicional'] },
    { id: 'purity_level', name: 'Nivel de pureza', type: 'select', options: ['Estándar', 'Purificado', 'Ultra purificado', 'Grado farmacéutico'] },
    { id: 'heavy_metals_tested', name: 'Testeo de metales pesados', type: 'select', options: ['No testado', 'Testeo básico', 'Testeo completo', 'Certificación terceros'] },
    { id: 'sustainability_rating', name: 'Calificación de sostenibilidad', type: 'select', options: ['No certificado', 'Pesca responsable', 'MSC certificado', 'Oceano sostenible'] },
    { id: 'antioxidant_added', name: 'Antioxidantes agregados', type: 'tags', options: ['Vitamina E', 'Tocoferoles', 'Rosemary extract', 'Múltiples antioxidantes', 'Sin antioxidantes'] },
    { id: 'concentration_potency', name: 'Concentración/Potencia', type: 'select', options: ['Concentración estándar', 'Alta concentración', 'Ultra concentrado', 'Potencia máxima'] },
    { id: 'flavoring', name: 'Saborizante', type: 'select', options: ['Sabor natural', 'Sin sabor', 'Sabor agregado', 'Enmascarado'] },
    { id: 'packaging_fish_oil', name: 'Empaque', type: 'select', options: ['Botella plástica', 'Botella vidrio', 'Cápsulas individuales', 'Pump dispenser'] }
  ],

  // Ayudas para el sistema inmune
  'pets-products-ayudas-sistema-inmune': [
    { id: 'immune_ingredients', name: 'Ingredientes inmunes', type: 'tags', options: ['Vitamina C', 'Vitamina E', 'Zinc', 'Selenio', 'Beta-glucanos', 'Múltiples ingredientes'] },
    { id: 'immune_mechanism', name: 'Mecanismo inmune', type: 'tags', options: ['Antioxidante', 'Inmunomodulador', 'Anti-inflamatorio', 'Adaptógeno', 'Múltiples mecanismos'] },
    { id: 'condition_support', name: 'Soporte de condición', type: 'tags', options: ['Inmunidad general', 'Recuperación', 'Estrés', 'Alergias', 'Enfermedades crónicas'] },
    { id: 'herbal_components', name: 'Componentes herbales', type: 'tags', options: ['Echinacea', 'Astrágalo', 'Reishi', 'Turmeric', 'Múltiples hierbas', 'Sin hierbas'] },
    { id: 'probiotic_inclusion', name: 'Inclusión probiótica', type: 'select', options: ['Sin probióticos', 'Probióticos básicos', 'Múltiples cepas', 'Simbióticos'] },
    { id: 'stress_support', name: 'Soporte para estrés', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Adaptógenos', 'Fórmula anti-estrés'] },
    { id: 'seasonal_use', name: 'Uso estacional', type: 'select', options: ['Uso continuo', 'Temporadas frías', 'Cambios estacionales', 'Según necesidad'] },
    { id: 'research_backing', name: 'Respaldo científico', type: 'select', options: ['Sin estudios', 'Estudios preliminares', 'Estudios clínicos', 'Amplio respaldo'] },
    { id: 'contraindications', name: 'Contraindicaciones', type: 'tags', options: ['Ninguna conocida', 'Medicamentos específicos', 'Condiciones médicas', 'Requiere supervisión'] },
    { id: 'onset_immune_effects', name: 'Inicio de efectos', type: 'select', options: ['Inmediato', '1-2 semanas', '1 mes', '2-3 meses'] }
  ],

  // Calcio
  'pets-products-calcio': [
    { id: 'calcium_source', name: 'Fuente de calcio', type: 'select', options: ['Carbonato de calcio', 'Citrato de calcio', 'Fosfato de calcio', 'Calcio quelado', 'Fuentes múltiples'] },
    { id: 'phosphorus_ratio', name: 'Relación calcio:fósforo', type: 'select', options: ['1:1', '1.2:1', '1.5:1', '2:1', 'Variable'] },
    { id: 'vitamin_d_included', name: 'Vitamina D incluida', type: 'select', options: ['Sin vitamina D', 'D2', 'D3', 'D2+D3'] },
    { id: 'magnesium_content', name: 'Contenido de magnesio', type: 'select', options: ['Sin magnesio', 'Bajo magnesio', 'Moderado magnesio', 'Alto magnesio'] },
    { id: 'bioavailability', name: 'Biodisponibilidad', type: 'select', options: ['Estándar', 'Mejorada', 'Alta biodisponibilidad', 'Máxima absorción'] },
    { id: 'target_life_stage', name: 'Etapa de vida objetivo', type: 'tags', options: ['Crecimiento', 'Lactancia', 'Adultos activos', 'Seniors', 'Todas las etapas'] },
    { id: 'bone_health_focus', name: 'Enfoque salud ósea', type: 'tags', options: ['Desarrollo óseo', 'Mantenimiento', 'Reparación', 'Prevención osteoporosis', 'Múltiples enfoques'] },
    { id: 'dental_benefits', name: 'Beneficios dentales', type: 'select', options: ['Sin beneficios', 'Beneficios básicos', 'Soporte dental', 'Salud dental completa'] },
    { id: 'stomach_sensitivity', name: 'Sensibilidad estomacal', type: 'select', options: ['Puede causar molestias', 'Neutral', 'Suave para estómago', 'Fórmula gentil'] },
    { id: 'additional_minerals', name: 'Minerales adicionales', type: 'tags', options: ['Solo calcio', 'Zinc', 'Manganeso', 'Boro', 'Múltiples minerales'] }
  ],

  // Control de peso
  'pets-products-control-peso': [
    { id: 'weight_goal', name: 'Objetivo de peso', type: 'select', options: ['Pérdida de peso', 'Mantenimiento', 'Control apetito', 'Aumento metabólico'] },
    { id: 'mechanism_action_weight', name: 'Mecanismo de acción', type: 'tags', options: ['Supresor apetito', 'Bloqueador grasa', 'Acelerador metabólico', 'Quemador grasa', 'Múltiples mecanismos'] },
    { id: 'fiber_content_weight', name: 'Contenido de fibra', type: 'select', options: ['Sin fibra', 'Fibra moderada', 'Alta fibra', 'Fibra especializada'] },
    { id: 'carnitine_inclusion', name: 'Inclusión de L-carnitina', type: 'select', options: ['Sin L-carnitina', 'L-carnitina básica', 'Alta L-carnitina', 'L-carnitina premium'] },
    { id: 'thermogenic_ingredients', name: 'Ingredientes termogénicos', type: 'tags', options: ['Sin termogénicos', 'Té verde', 'Cafeína', 'Capsaicina', 'Múltiples termogénicos'] },
    { id: 'satiety_enhancement', name: 'Mejora de saciedad', type: 'select', options: ['Sin mejora', 'Mejora básica', 'Alta saciedad', 'Saciedad prolongada'] },
    { id: 'chromium_content', name: 'Contenido de cromo', type: 'select', options: ['Sin cromo', 'Cromo básico', 'Cromo picolinato', 'Cromo quelado'] },
    { id: 'safety_profile_weight', name: 'Perfil de seguridad', type: 'select', options: ['Requiere supervisión', 'Generalmente seguro', 'Muy seguro', 'Ingredientes naturales'] },
    { id: 'exercise_dependency', name: 'Dependencia del ejercicio', type: 'select', options: ['Requiere ejercicio', 'Mejora con ejercicio', 'Independiente ejercicio', 'Reemplaza ejercicio'] },
    { id: 'monitoring_required_weight', name: 'Monitoreo requerido', type: 'select', options: ['Sin monitoreo', 'Monitoreo básico', 'Monitoreo regular', 'Supervisión veterinaria'] }
  ],

  // Multivitaminas
  'pets-products-multivitaminas': [
    { id: 'vitamin_spectrum', name: 'Espectro vitamínico', type: 'tags', options: ['Vitaminas básicas', 'Vitaminas completas', 'Vitaminas + minerales', 'Fórmula premium', 'Espectro completo'] },
    { id: 'water_fat_soluble', name: 'Vitaminas solubles', type: 'tags', options: ['Solo hidrosolubles', 'Solo liposolubles', 'Ambos tipos', 'Balanceadas', 'Especializadas'] },
    { id: 'life_stage_specific', name: 'Específico para etapa de vida', type: 'select', options: ['Cachorros/Gatitos', 'Adultos', 'Seniors', 'Reproductores', 'Universal'] },
    { id: 'breed_size_specific', name: 'Específico para tamaño de raza', type: 'select', options: ['Razas pequeñas', 'Razas medianas', 'Razas grandes', 'Razas gigantes', 'Universal'] },
    { id: 'bioactive_forms', name: 'Formas bioactivas', type: 'select', options: ['Formas básicas', 'Algunas bioactivas', 'Mayoría bioactivas', 'Todas bioactivas'] },
    { id: 'chelation_status', name: 'Estado de quelación', type: 'select', options: ['Sin quelación', 'Parcialmente quelado', 'Minerales quelados', 'Totalmente quelado'] },
    { id: 'allergen_free', name: 'Libre de alérgenos', type: 'tags', options: ['Gluten-free', 'Soy-free', 'Dairy-free', 'Grain-free', 'Múltiples restricciones'] },
    { id: 'digestive_support', name: 'Soporte digestivo', type: 'select', options: ['Sin soporte', 'Enzimas básicas', 'Probióticos incluidos', 'Soporte completo'] },
    { id: 'energy_support', name: 'Soporte energético', type: 'select', options: ['Sin soporte', 'Vitaminas B', 'CoQ10', 'Soporte completo'] },
    { id: 'antioxidant_complex', name: 'Complejo antioxidante', type: 'tags', options: ['Básico', 'Vitaminas C+E', 'Selenio incluido', 'Complejo completo', 'Sin antioxidantes'] }
  ],

  // Piel y pelaje
  'pets-products-piel-pelaje': [
    { id: 'primary_benefit', name: 'Beneficio primario', type: 'tags', options: ['Brillo del pelaje', 'Reducir muda', 'Piel saludable', 'Picazón', 'Múltiples beneficios'] },
    { id: 'omega_ratio', name: 'Relación omega', type: 'select', options: ['Solo omega-3', 'Solo omega-6', 'Omega 3:6 balanceado', 'Omega 3-6-9', 'Ácidos grasos múltiples'] },
    { id: 'coat_type_target', name: 'Tipo de pelaje objetivo', type: 'tags', options: ['Pelaje corto', 'Pelaje largo', 'Pelaje rizado', 'Doble capa', 'Todos los tipos'] },
    { id: 'biotin_content', name: 'Contenido de biotina', type: 'select', options: ['Sin biotina', 'Biotina básica', 'Alta biotina', 'Biotina optimizada'] },
    { id: 'zinc_inclusion', name: 'Inclusión de zinc', type: 'select', options: ['Sin zinc', 'Zinc básico', 'Zinc quelado', 'Zinc optimizado'] },
    { id: 'sulfur_compounds', name: 'Compuestos de azufre', type: 'tags', options: ['MSM', 'Metionina', 'Cisteína', 'Múltiples compuestos', 'Sin azufre'] },
    { id: 'vitamin_a_content', name: 'Contenido de vitamina A', type: 'select', options: ['Sin vitamina A', 'Vitamina A básica', 'Beta-caroteno', 'Múltiples formas'] },
    { id: 'seasonal_shedding', name: 'Muda estacional', type: 'select', options: ['No específico', 'Reduce muda', 'Control estacional', 'Muda mínima'] },
    { id: 'allergy_skin_support', name: 'Soporte piel alérgica', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Anti-inflamatorio', 'Soporte especializado'] },
    { id: 'collagen_support', name: 'Soporte de colágeno', type: 'select', options: ['Sin soporte', 'Vitamina C', 'Péptidos colágeno', 'Soporte completo'] }
  ],

  // Probióticos
  'pets-products-probioticos': [
    { id: 'bacterial_strains', name: 'Cepas bacterianas', type: 'tags', options: ['Lactobacillus', 'Bifidobacterium', 'Enterococcus', 'Múltiples géneros', 'Cepas específicas'] },
    { id: 'cfu_count', name: 'Conteo CFU', type: 'select', options: ['1-5 billones', '5-10 billones', '10-50 billones', '50+ billones CFU'] },
    { id: 'strain_diversity', name: 'Diversidad de cepas', type: 'select', options: ['1-2 cepas', '3-5 cepas', '6-10 cepas', '10+ cepas'] },
    { id: 'prebiotic_inclusion', name: 'Inclusión de prebióticos', type: 'select', options: ['Sin prebióticos', 'FOS', 'Inulina', 'Múltiples prebióticos'] },
    { id: 'stability_guarantee', name: 'Garantía de estabilidad', type: 'select', options: ['Sin garantía', 'Fabricación', 'Vida útil', 'Entrega garantizada'] },
    { id: 'refrigeration_required', name: 'Refrigeración requerida', type: 'select', options: ['Refrigeración necesaria', 'Estable en estante', 'Tecnología dual', 'Ultra estable'] },
    { id: 'digestive_targeting', name: 'Objetivo digestivo', type: 'tags', options: ['Intestino delgado', 'Colon', 'Todo el tracto', 'Estómago resistente', 'Múltiples objetivos'] },
    { id: 'immune_support_probiotic', name: 'Soporte inmune', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Inmunomodulación', 'Soporte especializado'] },
    { id: 'antibiotic_recovery', name: 'Recuperación antibiótica', type: 'select', options: ['No específico', 'Post-antibiótico', 'Durante antibióticos', 'Recuperación rápida'] },
    { id: 'species_specific_strains', name: 'Cepas específicas de especie', type: 'select', options: ['Cepas generales', 'Específicas para perros', 'Específicas para gatos', 'Especies múltiples'] }
  ],

  // Salud de las articulaciones
  'pets-products-salud-articulaciones': [
    { id: 'joint_ingredients', name: 'Ingredientes articulares', type: 'tags', options: ['Glucosamina', 'Condroitina', 'MSM', 'Ácido hialurónico', 'Múltiples ingredientes'] },
    { id: 'glucosamine_source', name: 'Fuente de glucosamina', type: 'select', options: ['Sintética', 'Caparazón crustáceos', 'Vegetariana', 'Múltiples fuentes'] },
    { id: 'chondroitin_molecular_weight', name: 'Peso molecular condroitina', type: 'select', options: ['Peso estándar', 'Bajo peso molecular', 'Alto peso molecular', 'Peso optimizado'] },
    { id: 'anti_inflammatory_herbs', name: 'Hierbas antiinflamatorias', type: 'tags', options: ['Turmeric/Curcuma', 'Boswellia', 'Yucca', 'Múltiples hierbas', 'Sin hierbas'] },
    { id: 'cartilage_support', name: 'Soporte de cartílago', type: 'select', options: ['Mantenimiento', 'Reparación', 'Regeneración', 'Soporte completo'] },
    { id: 'mobility_improvement', name: 'Mejora de movilidad', type: 'select', options: ['Soporte básico', 'Mejora moderada', 'Mejora significativa', 'Restauración movilidad'] },
    { id: 'pain_management', name: 'Manejo del dolor', type: 'select', options: ['Sin manejo dolor', 'Alivio suave', 'Alivio moderado', 'Alivio significativo'] },
    { id: 'collagen_type', name: 'Tipo de colágeno', type: 'tags', options: ['Tipo I', 'Tipo II', 'Tipo III', 'Múltiples tipos', 'Sin colágeno'] },
    { id: 'joint_fluid_support', name: 'Soporte líquido sinovial', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Ácido hialurónico', 'Soporte completo'] },
    { id: 'activity_level_target', name: 'Nivel de actividad objetivo', type: 'tags', options: ['Baja actividad', 'Actividad moderada', 'Alta actividad', 'Atlético', 'Todos los niveles'] }
  ],

  // Salud dental
  'pets-products-salud-dental': [
    { id: 'dental_mechanism', name: 'Mecanismo dental', type: 'tags', options: ['Enzimas', 'Abrasión suave', 'Quelación', 'pH balanceado', 'Múltiples mecanismos'] },
    { id: 'plaque_tartar_control', name: 'Control placa/sarro', type: 'select', options: ['Prevención placa', 'Reducción sarro', 'Control combinado', 'Remoción activa'] },
    { id: 'breath_freshening_supplement', name: 'Refrescante del aliento', type: 'select', options: ['Sin efecto', 'Efecto suave', 'Refrescante moderado', 'Refrescante duradero'] },
    { id: 'calcium_phosphorus_dental', name: 'Calcio/Fósforo dental', type: 'select', options: ['Sin minerales', 'Calcio básico', 'Relación balanceada', 'Fórmula dental específica'] },
    { id: 'enzyme_types', name: 'Tipos de enzimas', type: 'tags', options: ['Glucosa oxidasa', 'Lactoperoxidasa', 'Lisozima', 'Múltiples enzimas', 'Sin enzimas'] },
    { id: 'gum_health_support', name: 'Soporte salud de encías', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Anti-inflamatorio', 'Soporte especializado'] },
    { id: 'chewing_required', name: 'Masticación requerida', type: 'select', options: ['Solo ingestión', 'Masticación básica', 'Masticación activa', 'Masticación prolongada'] },
    { id: 'enamel_protection', name: 'Protección del esmalte', type: 'select', options: ['Sin protección', 'Protección básica', 'Remineralización', 'Protección avanzada'] },
    { id: 'bacterial_control', name: 'Control bacteriano', type: 'select', options: ['Sin control', 'Control básico', 'Antibacterial', 'Control especializado'] },
    { id: 'professional_grade', name: 'Grado profesional', type: 'select', options: ['Uso doméstico', 'Calidad profesional', 'Veterinario aprobado', 'Grado clínico'] }
  ],

  // Suplementos de CBD
  'pets-products-suplementos-cbd': [
    { id: 'cbd_source', name: 'Fuente de CBD', type: 'select', options: ['Hemp full-spectrum', 'Hemp broad-spectrum', 'CBD aislado', 'CO2 extracted'] },
    { id: 'thc_content', name: 'Contenido de THC', type: 'select', options: ['0% THC', '<0.3% THC', 'Trazas mínimas', 'No detectable'] },
    { id: 'cbd_concentration', name: 'Concentración de CBD', type: 'select', options: ['Baja (1-5mg)', 'Moderada (5-15mg)', 'Alta (15-30mg)', 'Extra alta (30mg+)'] },
    { id: 'carrier_oil', name: 'Aceite portador', type: 'select', options: ['MCT oil', 'Hemp seed oil', 'Olive oil', 'Coconut oil', 'Sin aceite'] },
    { id: 'third_party_testing', name: 'Testeo de terceros', type: 'select', options: ['No testeado', 'Testeo básico', 'Testeo completo', 'COA disponible'] },
    { id: 'intended_effects', name: 'Efectos pretendidos', type: 'tags', options: ['Calma/Relajación', 'Dolor/Inflamación', 'Ansiedad', 'Sueño', 'Múltiples efectos'] },
    { id: 'dosing_precision', name: 'Precisión de dosificación', type: 'select', options: ['Dosificación aproximada', 'Dosificación medida', 'Dosificación precisa', 'Micro-dosificación'] },
    { id: 'onset_time_cbd', name: 'Tiempo de inicio', type: 'select', options: ['15-30 minutos', '30-60 minutos', '1-2 horas', 'Variable'] },
    { id: 'organic_certification', name: 'Certificación orgánica', type: 'select', options: ['No orgánico', 'Orgánico certificado', 'USDA Organic', 'Certificación múltiple'] },
    { id: 'legal_compliance', name: 'Cumplimiento legal', type: 'select', options: ['Estado específico', 'Federalmente legal', 'Internacional OK', 'Verificar local'] }
  ],

  // Contenedores y dispensadores de bolsas de excrementos (categoría general)
  'pets-products-contenedores-bolsas': [
    { id: 'mounting_type_dispenser', name: 'Tipo de montaje', type: 'select', options: ['Clip de correa', 'Velcro', 'Mosquetón', 'Fijo a collar', 'Portátil sin montaje'] },
    { id: 'bag_capacity_dispenser', name: 'Capacidad de bolsas', type: 'select', options: ['1 rollo', '2-3 rollos', '4-5 rollos', '6+ rollos'] },
    { id: 'bag_size_compatibility', name: 'Compatibilidad tamaño de bolsa', type: 'tags', options: ['Bolsas estándar', 'Bolsas grandes', 'Bolsas biodegradables', 'Múltiples tamaños', 'Tamaño específico'] },
    { id: 'dispensing_mechanism_bags', name: 'Mecanismo de dispensado', type: 'select', options: ['Jalado manual', 'Dispensado fácil', 'Sistema de resorte', 'Dispensado automático'] },
    { id: 'weather_resistance_dispenser', name: 'Resistencia al clima', type: 'select', options: ['Interior únicamente', 'Resistente agua', 'Resistente intemperie', 'A prueba de clima'] },
    { id: 'material_dispenser', name: 'Material', type: 'select', options: ['Plástico básico', 'Plástico resistente', 'Silicona', 'Materiales mixtos'] },
    { id: 'ease_of_refill', name: 'Facilidad de recarga', type: 'select', options: ['Requiere desmontaje', 'Apertura simple', 'Recarga fácil', 'Sistema quick-load'] },
    { id: 'visibility_bags', name: 'Visibilidad de bolsas', type: 'select', options: ['Sin visibilidad', 'Ventana pequeña', 'Ventana grande', 'Transparente'] },
    { id: 'size_portability', name: 'Tamaño/Portabilidad', type: 'select', options: ['Compacto', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'additional_features_dispenser', name: 'Características adicionales', type: 'tags', options: ['Sin características extra', 'Clip adicional', 'Compartimento extra', 'Múltiples funciones'] }
  ],

  // Dispensadores con almacenamiento
  'pets-products-dispensadores-almacenamiento': [
    { id: 'storage_compartments', name: 'Compartimentos de almacenamiento', type: 'select', options: ['1 compartimento', '2 compartimentos', '3 compartimentos', '4+ compartimentos'] },
    { id: 'storage_capacity', name: 'Capacidad de almacenamiento', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande'] },
    { id: 'stored_items', name: 'Artículos almacenables', type: 'tags', options: ['Bolsas extra', 'Premios', 'Llaves', 'Teléfono', 'Dinero', 'Múltiples artículos'] },
    { id: 'compartment_closure', name: 'Cierre de compartimentos', type: 'select', options: ['Sin cierre', 'Velcro', 'Cremallera', 'Cierre magnético', 'Múltiples cierres'] },
    { id: 'organization_features', name: 'Características de organización', type: 'tags', options: ['Divisores', 'Bolsillos internos', 'Elásticos', 'Clips internos', 'Sistema modular'] },
    { id: 'access_convenience', name: 'Conveniencia de acceso', type: 'select', options: ['Acceso básico', 'Fácil acceso', 'Acceso con una mano', 'Acceso rápido'] },
    { id: 'waterproof_storage', name: 'Almacenamiento impermeable', type: 'select', options: ['No impermeable', 'Resistente salpicaduras', 'Resistente agua', 'Completamente impermeable'] },
    { id: 'size_expandability', name: 'Expandibilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Ligeramente expandible', 'Muy expandible', 'Sistema modular'] },
    { id: 'security_features', name: 'Características de seguridad', type: 'tags', options: ['Sin seguridad', 'Velcro seguro', 'Cremallera YKK', 'Cierre con llave', 'Múltiples seguros'] },
    { id: 'ergonomic_design_storage', name: 'Diseño ergonómico', type: 'select', options: ['Básico', 'Ergonómico', 'Muy ergonómico', 'Diseño profesional'] }
  ],

  // Dispensadores con linterna
  'pets-products-dispensadores-linterna': [
    { id: 'light_type', name: 'Tipo de luz', type: 'select', options: ['LED básico', 'LED brillante', 'LED múltiple', 'LED recargable'] },
    { id: 'battery_type', name: 'Tipo de batería', type: 'select', options: ['Baterías desechables', 'Batería recargable', 'Solar', 'Sin batería (manual)'] },
    { id: 'light_activation', name: 'Activación de luz', type: 'select', options: ['Botón manual', 'Automática al abrir', 'Sensor de movimiento', 'Múltiples activaciones'] },
    { id: 'brightness_levels', name: 'Niveles de brillo', type: 'select', options: ['Un nivel', '2 niveles', '3 niveles', 'Brillo variable'] },
    { id: 'light_duration', name: 'Duración de luz', type: 'select', options: ['5-10 horas', '10-20 horas', '20-50 horas', '50+ horas'] },
    { id: 'waterproof_light', name: 'Resistencia al agua (luz)', type: 'select', options: ['No resistente', 'Resistente salpicaduras', 'Resistente lluvia', 'Sumergible'] },
    { id: 'light_positioning', name: 'Posicionamiento de luz', type: 'select', options: ['Fija hacia abajo', 'Ajustable', 'Direccional', 'Múltiples direcciones'] },
    { id: 'charging_method', name: 'Método de carga', type: 'select', options: ['No recargable', 'USB', 'Solar', 'Inducción', 'Múltiples métodos'] },
    { id: 'light_color', name: 'Color de luz', type: 'tags', options: ['Blanco', 'Azul', 'Rojo', 'Múltiples colores', 'Color variable'] },
    { id: 'emergency_features', name: 'Características de emergencia', type: 'tags', options: ['Modo SOS', 'Luz estroboscópica', 'Luz de advertencia', 'Múltiples modos', 'Sin características'] }
  ],

  // Dispensadores y contenedores estándar
  'pets-products-dispensadores-estandar': [
    { id: 'design_style', name: 'Estilo de diseño', type: 'select', options: ['Básico funcional', 'Moderno', 'Clásico', 'Deportivo', 'Premium'] },
    { id: 'attachment_method', name: 'Método de sujeción', type: 'select', options: ['Clip simple', 'Velcro ajustable', 'Mosquetón', 'Correa', 'Múltiples métodos'] },
    { id: 'durability_standard', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Uso profesional'] },
    { id: 'color_options', name: 'Opciones de color', type: 'select', options: ['Un color', 'Pocos colores', 'Múltiples colores', 'Personalizable'] },
    { id: 'weight_dispenser', name: 'Peso', type: 'select', options: ['Muy ligero', 'Ligero', 'Peso moderado', 'Pesado'] },
    { id: 'maintenance_required', name: 'Mantenimiento requerido', type: 'select', options: ['Sin mantenimiento', 'Limpieza ocasional', 'Limpieza regular', 'Mantenimiento frecuente'] },
    { id: 'replacement_parts', name: 'Partes de repuesto', type: 'select', options: ['Sin repuestos', 'Algunas partes', 'Mayoría de partes', 'Todas las partes'] },
    { id: 'value_rating', name: 'Calificación de valor', type: 'select', options: ['Económico', 'Buen valor', 'Premium', 'Lujo'] },
    { id: 'user_age_target', name: 'Usuario objetivo por edad', type: 'select', options: ['Niños', 'Adultos', 'Seniors', 'Universal'] },
    { id: 'brand_reputation', name: 'Reputación de marca', type: 'select', options: ['Nueva marca', 'Marca conocida', 'Marca establecida', 'Marca premium'] }
  ],

  // Herramientas y sistemas de desecho de excrementos (categoría general)
  'pets-products-herramientas-desecho': [
    { id: 'waste_type_target', name: 'Tipo de desecho objetivo', type: 'tags', options: ['Sólidos', 'Líquidos', 'Ambos tipos', 'Vómito', 'Múltiples tipos'] },
    { id: 'indoor_outdoor_use', name: 'Uso interior/exterior', type: 'select', options: ['Solo interior', 'Solo exterior', 'Ambos ambientes', 'Específico por clima'] },
    { id: 'cleaning_efficiency', name: 'Eficiencia de limpieza', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'Excelente'] },
    { id: 'odor_control_waste', name: 'Control de olores', type: 'select', options: ['Sin control', 'Control básico', 'Control avanzado', 'Eliminación completa'] },
    { id: 'hygiene_level', name: 'Nivel de higiene', type: 'select', options: ['Básico', 'Estándar', 'Alto', 'Grado sanitario'] },
    { id: 'ease_of_disposal', name: 'Facilidad de disposición', type: 'select', options: ['Requiere procesamiento', 'Disposición simple', 'Muy fácil', 'Automática'] },
    { id: 'environmental_impact_waste', name: 'Impacto ambiental', type: 'select', options: ['Estándar', 'Eco-friendly', 'Biodegradable', 'Compostable'] },
    { id: 'user_contact_level', name: 'Nivel de contacto del usuario', type: 'select', options: ['Contacto directo', 'Contacto mínimo', 'Sin contacto', 'Completamente sanitario'] },
    { id: 'pet_safety_waste', name: 'Seguridad para mascotas', type: 'select', options: ['Requiere supervisión', 'Generalmente seguro', 'Muy seguro', 'Completamente seguro'] },
    { id: 'maintenance_frequency_waste', name: 'Frecuencia de mantenimiento', type: 'select', options: ['Diario', 'Cada pocos días', 'Semanal', 'Mensual'] }
  ],

  // Bandejas de arena
  'pets-products-bandejas-arena': [
    { id: 'litter_box_size', name: 'Tamaño de bandeja', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande', 'Múltiples tamaños'] },
    { id: 'litter_box_style', name: 'Estilo de bandeja', type: 'select', options: ['Abierta', 'Con tapa', 'Auto-limpiante', 'Esquinera', 'Múltiples estilos'] },
    { id: 'entry_height', name: 'Altura de entrada', type: 'select', options: ['Baja', 'Estándar', 'Alta', 'Ajustable'] },
    { id: 'litter_type_compatibility', name: 'Compatibilidad tipo de arena', type: 'tags', options: ['Arcilla', 'Aglomerante', 'Silica gel', 'Natural', 'Todos los tipos'] },
    { id: 'odor_control_system', name: 'Sistema control de olores', type: 'select', options: ['Sin sistema', 'Filtro básico', 'Filtro carbón', 'Sistema avanzado'] },
    { id: 'cleaning_mechanism', name: 'Mecanismo de limpieza', type: 'select', options: ['Manual', 'Semi-automático', 'Automático', 'Auto-flush'] },
    { id: 'waste_disposal_method', name: 'Método disposición desechos', type: 'select', options: ['Bolsa desechable', 'Contenedor removible', 'Flush directo', 'Sistema sellado'] },
    { id: 'privacy_level', name: 'Nivel de privacidad', type: 'select', options: ['Completamente abierta', 'Semi-privada', 'Privacidad alta', 'Completamente cerrada'] },
    { id: 'tracking_reduction', name: 'Reducción de seguimiento', type: 'select', options: ['Sin reducción', 'Reducción básica', 'Alta reducción', 'Eliminación completa'] },
    { id: 'multi_cat_suitability', name: 'Adecuado para múltiples gatos', type: 'select', options: ['Un gato', '2 gatos', '3-4 gatos', '5+ gatos'] }
  ],

  // Bolsas para perros
  'pets-products-bolsas-perros': [
    { id: 'bag_material', name: 'Material de bolsa', type: 'select', options: ['Plástico estándar', 'Plástico reciclado', 'Biodegradable', 'Compostable', 'Materiales mixtos'] },
    { id: 'bag_thickness', name: 'Grosor de bolsa', type: 'select', options: ['Básico', 'Estándar', 'Extra grueso', 'Ultra resistente'] },
    { id: 'bag_size_dimension', name: 'Dimensiones de bolsa', type: 'select', options: ['Pequeña', 'Estándar', 'Grande', 'Extra grande'] },
    { id: 'closure_mechanism', name: 'Mecanismo de cierre', type: 'select', options: ['Sin cierre', 'Tie handles', 'Cordón', 'Adhesivo', 'Múltiples opciones'] },
    { id: 'scent_addition', name: 'Adición de aroma', type: 'select', options: ['Sin aroma', 'Aroma suave', 'Aroma fresco', 'Aroma fuerte'] },
    { id: 'leak_resistance', name: 'Resistencia a fugas', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'A prueba de fugas'] },
    { id: 'quantity_per_roll', name: 'Cantidad por rollo', type: 'select', options: ['10-20 bolsas', '20-50 bolsas', '50-100 bolsas', '100+ bolsas'] },
    { id: 'perforation_quality', name: 'Calidad de perforación', type: 'select', options: ['Básica', 'Buena', 'Fácil separación', 'Separación perfecta'] },
    { id: 'decomposition_time', name: 'Tiempo de descomposición', type: 'select', options: ['No biodegradable', '6-12 meses', '3-6 meses', '1-3 meses'] },
    { id: 'carrying_comfort', name: 'Comodidad de carga', type: 'select', options: ['Básica', 'Cómoda', 'Muy cómoda', 'Ergonómica'] }
  ],

  // Recogedores de basura
  'pets-products-recogedores-basura': [
    { id: 'scooper_type', name: 'Tipo de recogedor', type: 'select', options: ['Pala simple', 'Pinzas', 'Rake & pan', 'Sistema cerrado', 'Múltiples tipos'] },
    { id: 'handle_length_scooper', name: 'Longitud del mango', type: 'select', options: ['Corto (15-30cm)', 'Medio (30-60cm)', 'Largo (60-90cm)', 'Extra largo (90cm+)'] },
    { id: 'collection_capacity', name: 'Capacidad de recolección', type: 'select', options: ['Pequeña', 'Mediana', 'Grande', 'Extra grande'] },
    { id: 'material_construction', name: 'Material de construcción', type: 'select', options: ['Plástico básico', 'Plástico resistente', 'Metal', 'Materiales mixtos'] },
    { id: 'cleaning_ease_scooper', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Auto-limpiante'] },
    { id: 'ground_surface_suitability', name: 'Adecuado para superficie', type: 'tags', options: ['Césped', 'Concreto', 'Gravilla', 'Arena', 'Múltiples superficies'] },
    { id: 'waste_size_capacity', name: 'Capacidad tamaño de desecho', type: 'select', options: ['Pequeño', 'Mediano', 'Grande', 'Todos los tamaños'] },
    { id: 'storage_convenience_scooper', name: 'Conveniencia de almacenamiento', type: 'select', options: ['Voluminoso', 'Moderado', 'Compacto', 'Plegable'] },
    { id: 'durability_scooper', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Uso profesional'] },
    { id: 'ergonomic_features', name: 'Características ergonómicas', type: 'tags', options: ['Mango básico', 'Agarre cómodo', 'Diseño ergonómico', 'Múltiples características', 'Sin características'] }
  ],

  // Sistemas de eliminación de desechos de mascotas
  'pets-products-sistemas-eliminacion-desechos': [
    { id: 'system_type', name: 'Tipo de sistema', type: 'select', options: ['Digestor enzimático', 'Incinerador', 'Compostaje', 'Flush system', 'Sistema híbrido'] },
    { id: 'processing_capacity', name: 'Capacidad de procesamiento', type: 'select', options: ['1-2 mascotas', '3-5 mascotas', '6-10 mascotas', '10+ mascotas'] },
    { id: 'installation_complexity', name: 'Complejidad de instalación', type: 'select', options: ['Plug & play', 'Instalación simple', 'Instalación moderada', 'Instalación profesional'] },
    { id: 'processing_time', name: 'Tiempo de procesamiento', type: 'select', options: ['Inmediato', '1-24 horas', '1-7 días', '1+ semana'] },
    { id: 'waste_output', name: 'Salida de desecho', type: 'select', options: ['Sin residuo', 'Compost', 'Cenizas', 'Líquido tratado', 'Múltiples salidas'] },
    { id: 'energy_requirements', name: 'Requerimientos de energía', type: 'select', options: ['Sin energía', 'Baterías', 'Eléctrico', 'Solar', 'Múltiples fuentes'] },
    { id: 'maintenance_complexity', name: 'Complejidad de mantenimiento', type: 'select', options: ['Sin mantenimiento', 'Mantenimiento básico', 'Mantenimiento regular', 'Mantenimiento especializado'] },
    { id: 'environmental_compliance', name: 'Cumplimiento ambiental', type: 'select', options: ['Estándar', 'Eco-friendly', 'Certificado verde', 'Zero waste'] },
    { id: 'automation_level', name: 'Nivel de automatización', type: 'select', options: ['Manual', 'Semi-automático', 'Automático', 'Completamente automatizado'] },
    { id: 'safety_certifications', name: 'Certificaciones de seguridad', type: 'tags', options: ['Sin certificación', 'EPA aprobado', 'Certificación sanitaria', 'Múltiples certificaciones'] }
  ],

  // Productos para reptiles y anfibios (categoría general)
  'pets-products-productos-reptiles': [
    { id: 'species_compatibility', name: 'Compatibilidad de especies', type: 'tags', options: ['Reptiles terrestres', 'Reptiles acuáticos', 'Anfibios', 'Lagartijas', 'Serpientes', 'Tortugas', 'Salamandras', 'Todas las especies'] },
    { id: 'habitat_type', name: 'Tipo de hábitat', type: 'select', options: ['Tropical', 'Desértico', 'Templado', 'Acuático', 'Semi-acuático', 'Múltiples hábitats'] },
    { id: 'temperature_range', name: 'Rango de temperatura', type: 'select', options: ['Frío (15-20°C)', 'Templado (20-25°C)', 'Cálido (25-30°C)', 'Muy cálido (30-35°C)', 'Variable'] },
    { id: 'humidity_requirements', name: 'Requerimientos de humedad', type: 'select', options: ['Baja (30-50%)', 'Media (50-70%)', 'Alta (70-90%)', 'Muy alta (90%+)', 'Variable'] },
    { id: 'uv_lighting_needs', name: 'Necesidades iluminación UV', type: 'select', options: ['Sin UV', 'UV-A básico', 'UV-B esencial', 'Espectro completo', 'Variable por especie'] },
    { id: 'care_level', name: 'Nivel de cuidado', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'] },
    { id: 'safety_reptiles', name: 'Seguridad para reptiles', type: 'select', options: ['Requiere supervisión', 'Generalmente seguro', 'Muy seguro', 'Completamente seguro'] },
    { id: 'terrarium_size_requirement', name: 'Requerimiento tamaño terrario', type: 'select', options: ['Pequeño (40L)', 'Mediano (80L)', 'Grande (200L)', 'Extra grande (400L+)', 'Variable'] },
    { id: 'substrate_compatibility', name: 'Compatibilidad sustrato', type: 'tags', options: ['Arena', 'Tierra', 'Musgo', 'Corteza', 'Papel', 'Múltiples sustratos'] },
    { id: 'feeding_method', name: 'Método de alimentación', type: 'select', options: ['Manual', 'Comedero automático', 'Alimentación en vivo', 'Alimentación variada'] }
  ],

  // Accesorios para terrarios de reptiles y anfibios
  'pets-products-accesorios-terrarios': [
    { id: 'accessory_type', name: 'Tipo de accesorio', type: 'select', options: ['Decorativo', 'Funcional', 'Escondite', 'Plataforma', 'Bebedero', 'Comedero', 'Múltiples funciones'] },
    { id: 'material_terrarium', name: 'Material', type: 'select', options: ['Plástico', 'Cerámica', 'Madera natural', 'Resina', 'Piedra artificial', 'Múltiples materiales'] },
    { id: 'placement_location', name: 'Ubicación de colocación', type: 'select', options: ['Suelo', 'Pared', 'Esquina', 'Centro', 'Flotante', 'Múltiples ubicaciones'] },
    { id: 'size_compatibility_terrarium', name: 'Compatibilidad de tamaño', type: 'select', options: ['Terrarios pequeños', 'Terrarios medianos', 'Terrarios grandes', 'Todos los tamaños'] },
    { id: 'cleaning_ease_terrarium', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Muy fácil'] },
    { id: 'water_resistance', name: 'Resistencia al agua', type: 'select', options: ['No resistente', 'Resistente a salpicaduras', 'Resistente al agua', 'Completamente impermeable'] },
    { id: 'natural_appearance', name: 'Apariencia natural', type: 'select', options: ['Artificial', 'Semi-natural', 'Natural', 'Hiperrealista'] },
    { id: 'hiding_functionality', name: 'Funcionalidad de escondite', type: 'select', options: ['Sin escondite', 'Escondite parcial', 'Escondite completo', 'Múltiples escondites'] },
    { id: 'basking_area', name: 'Área de asoleado', type: 'select', options: ['Sin área', 'Área básica', 'Área óptima', 'Múltiples áreas'] },
    { id: 'stability_terrarium', name: 'Estabilidad', type: 'select', options: ['Inestable', 'Estable', 'Muy estable', 'Extremadamente estable'] }
  ],

  // Alimento para reptiles y anfibios
  'pets-products-alimento-reptiles': [
    { id: 'food_type_reptiles', name: 'Tipo de alimento', type: 'select', options: ['Pellets secos', 'Alimento vivo', 'Alimento congelado', 'Vegetales frescos', 'Suplementos', 'Alimento mixto'] },
    { id: 'target_species_food', name: 'Especies objetivo', type: 'tags', options: ['Iguanas', 'Geckos', 'Serpientes', 'Tortugas terrestres', 'Tortugas acuáticas', 'Salamandras', 'Ranas', 'Todas las especies'] },
    { id: 'life_stage_food', name: 'Etapa de vida', type: 'select', options: ['Juvenil', 'Adulto', 'Senior', 'Todas las etapas'] },
    { id: 'nutritional_focus', name: 'Enfoque nutricional', type: 'tags', options: ['Alto en proteína', 'Alto en fibra', 'Bajo en grasa', 'Vitaminas añadidas', 'Minerales añadidos', 'Balanceado'] },
    { id: 'feeding_frequency', name: 'Frecuencia de alimentación', type: 'select', options: ['Diario', 'Cada 2-3 días', 'Semanal', 'Variable por especie'] },
    { id: 'preparation_required', name: 'Preparación requerida', type: 'select', options: ['Listo para usar', 'Rehidratar', 'Descongelar', 'Preparación especial'] },
    { id: 'storage_requirements_food', name: 'Requerimientos de almacenamiento', type: 'select', options: ['Temperatura ambiente', 'Refrigeración', 'Congelación', 'Lugar seco'] },
    { id: 'protein_source', name: 'Fuente de proteína', type: 'tags', options: ['Insectos', 'Pescado', 'Carne', 'Vegetales', 'Huevos', 'Múltiples fuentes'] },
    { id: 'supplement_added', name: 'Suplementos añadidos', type: 'tags', options: ['Calcio', 'Vitamina D3', 'Vitaminas A/E', 'Probióticos', 'Omega-3', 'Sin suplementos'] },
    { id: 'digestibility', name: 'Digestibilidad', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'Excelente'] }
  ],

  // Iluminación y calefacción de terrarios para reptiles y anfibios
  'pets-products-iluminacion-calefaccion': [
    { id: 'lighting_type', name: 'Tipo de iluminación', type: 'select', options: ['LED', 'Fluorescente', 'Halógeno', 'Mercury vapor', 'Cerámica', 'Múltiples tipos'] },
    { id: 'uv_spectrum', name: 'Espectro UV', type: 'tags', options: ['UV-A', 'UV-B', 'UV-C', 'Espectro completo', 'Sin UV'] },
    { id: 'heat_output', name: 'Producción de calor', type: 'select', options: ['Sin calor', 'Calor bajo', 'Calor moderado', 'Calor alto', 'Calor variable'] },
    { id: 'wattage_power', name: 'Potencia en watts', type: 'select', options: ['10-25W', '25-50W', '50-100W', '100-150W', '150W+'] },
    { id: 'heating_method', name: 'Método de calentamiento', type: 'select', options: ['Calentador de aire', 'Pad térmico', 'Lámpara de calor', 'Cable térmico', 'Roca térmica', 'Múltiples métodos'] },
    { id: 'temperature_control', name: 'Control de temperatura', type: 'select', options: ['Sin control', 'Termostato básico', 'Termostato digital', 'Control inteligente'] },
    { id: 'day_night_cycle', name: 'Ciclo día/noche', type: 'select', options: ['Sin ciclo', 'Manual', 'Timer básico', 'Control automático'] },
    { id: 'coverage_area', name: 'Área de cobertura', type: 'select', options: ['Punto focal', 'Área parcial', 'Cobertura completa', 'Múltiples zonas'] },
    { id: 'installation_type', name: 'Tipo de instalación', type: 'select', options: ['Clip-on', 'Montaje en tapa', 'Suspendido', 'Integrado', 'Múltiples opciones'] },
    { id: 'lifespan_bulb', name: 'Vida útil', type: 'select', options: ['6 meses', '1 año', '2 años', '3+ años'] }
  ],

  // Sustratos para reptiles y anfibios
  'pets-products-sustratos-reptiles': [
    { id: 'substrate_material', name: 'Material del sustrato', type: 'select', options: ['Arena', 'Corteza', 'Musgo', 'Papel', 'Coconut fiber', 'Cypress mulch', 'Múltiples materiales'] },
    { id: 'moisture_retention', name: 'Retención de humedad', type: 'select', options: ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'] },
    { id: 'drainage_capability', name: 'Capacidad de drenaje', type: 'select', options: ['Sin drenaje', 'Drenaje básico', 'Buen drenaje', 'Excelente drenaje'] },
    { id: 'dust_level', name: 'Nivel de polvo', type: 'select', options: ['Sin polvo', 'Polvo mínimo', 'Polvo moderado', 'Polvo alto'] },
    { id: 'natural_vs_artificial', name: 'Natural vs Artificial', type: 'select', options: ['100% natural', 'Mayormente natural', 'Mixto', 'Artificial'] },
    { id: 'ph_level', name: 'Nivel de pH', type: 'select', options: ['Ácido (5-6)', 'Ligeramente ácido (6-7)', 'Neutro (7)', 'Ligeramente alcalino (7-8)', 'Variable'] },
    { id: 'decomposition_rate', name: 'Tasa de descomposición', type: 'select', options: ['No se descompone', 'Muy lenta', 'Lenta', 'Moderada', 'Rápida'] },
    { id: 'ingestion_safety', name: 'Seguridad por ingestión', type: 'select', options: ['Peligroso', 'Precaución', 'Generalmente seguro', 'Completamente seguro'] },
    { id: 'odor_control_substrate', name: 'Control de olores', type: 'select', options: ['Sin control', 'Control básico', 'Buen control', 'Excelente control'] },
    { id: 'reusability', name: 'Reutilización', type: 'select', options: ['Desechable', 'Parcialmente reutilizable', 'Reutilizable', 'Múltiples usos'] }
  ],

  // Terrarios para reptiles y anfibios
  'pets-products-terrarios': [
    { id: 'terrarium_size', name: 'Tamaño del terrario', type: 'select', options: ['40L', '80L', '120L', '200L', '300L', '400L+'] },
    { id: 'terrarium_type', name: 'Tipo de terrario', type: 'select', options: ['Terrestre', 'Arbóreo', 'Acuático', 'Semi-acuático', 'Paludario', 'Múltiples tipos'] },
    { id: 'ventilation_system', name: 'Sistema de ventilación', type: 'select', options: ['Básico', 'Cruzada', 'Forzada', 'Inteligente'] },
    { id: 'access_points', name: 'Puntos de acceso', type: 'select', options: ['Tapa superior', 'Puerta frontal', 'Acceso lateral', 'Múltiples accesos'] },
    { id: 'viewing_area', name: 'Área de visualización', type: 'select', options: ['Frontal', 'Tres lados', 'Vista completa', 'Vista panorámica'] },
    { id: 'background_included', name: 'Fondo incluido', type: 'select', options: ['Sin fondo', 'Fondo básico', 'Fondo 3D', 'Fondo personalizable'] },
    { id: 'lighting_accommodation', name: 'Acomodación para iluminación', type: 'select', options: ['Sin preparación', 'Montajes básicos', 'Sistema integrado', 'Completamente equipado'] },
    { id: 'water_feature_capacity', name: 'Capacidad para características acuáticas', type: 'select', options: ['Sin capacidad', 'Área pequeña', 'Área moderada', 'Sistema completo'] },
    { id: 'assembly_complexity', name: 'Complejidad de ensamble', type: 'select', options: ['Pre-ensamblado', 'Ensamble simple', 'Ensamble moderado', 'Ensamble complejo'] },
    { id: 'expansion_options', name: 'Opciones de expansión', type: 'select', options: ['Sin expansión', 'Módulos adicionales', 'Sistema modular', 'Completamente modular'] }
  ],

  // Productos para animales pequeños (categoría general)
  'pets-products-productos-animales-pequenos': [
    { id: 'small_animal_species', name: 'Especies de animales pequeños', type: 'tags', options: ['Hámsters', 'Conejos', 'Cobayas', 'Chinchillas', 'Hurones', 'Ratones', 'Ratas', 'Jerbos', 'Todas las especies'] },
    { id: 'age_group_small', name: 'Grupo de edad', type: 'select', options: ['Bebé', 'Juvenil', 'Adulto', 'Senior', 'Todas las edades'] },
    { id: 'housing_type_compatibility', name: 'Compatibilidad tipo de vivienda', type: 'tags', options: ['Jaulas de alambre', 'Acuarios', 'Habitáculos de plástico', 'Corrales', 'Todos los tipos'] },
    { id: 'indoor_outdoor_small', name: 'Uso interior/exterior', type: 'select', options: ['Solo interior', 'Solo exterior', 'Ambos ambientes', 'Portátil'] },
    { id: 'safety_small_animals', name: 'Seguridad para animales pequeños', type: 'select', options: ['Requiere supervisión', 'Generalmente seguro', 'Muy seguro', 'Completamente seguro'] },
    { id: 'size_appropriateness', name: 'Apropiado para tamaño', type: 'select', options: ['Animales muy pequeños', 'Animales pequeños', 'Animales medianos', 'Todos los tamaños'] },
    { id: 'chew_resistance', name: 'Resistencia a mordiscos', type: 'select', options: ['No resistente', 'Resistencia básica', 'Alta resistencia', 'A prueba de mordiscos'] },
    { id: 'enrichment_value', name: 'Valor de enriquecimiento', type: 'select', options: ['Básico', 'Moderado', 'Alto', 'Máximo enriquecimiento'] },
    { id: 'social_housing_suitable', name: 'Adecuado para vivienda social', type: 'select', options: ['Un animal', 'Pareja', 'Grupo pequeño', 'Grupo grande'] },
    { id: 'maintenance_frequency_small', name: 'Frecuencia de mantenimiento', type: 'select', options: ['Diario', 'Cada pocos días', 'Semanal', 'Mensual'] }
  ],

  // Accesorios para habitáculos para animales pequeños
  'pets-products-accesorios-habitaculos-pequenos': [
    { id: 'accessory_function_small', name: 'Función del accesorio', type: 'select', options: ['Alimentación', 'Hidratación', 'Ejercicio', 'Descanso', 'Juego', 'Higiene', 'Múltiples funciones'] },
    { id: 'mounting_method_small', name: 'Método de montaje', type: 'select', options: ['Clip-on', 'Colgante', 'Base independiente', 'Magnético', 'Integrado', 'Múltiples opciones'] },
    { id: 'material_safety_small', name: 'Seguridad del material', type: 'select', options: ['Plástico seguro', 'Metal inoxidable', 'Madera natural', 'Cerámica', 'Múltiples materiales seguros'] },
    { id: 'size_adjustability', name: 'Ajustabilidad de tamaño', type: 'select', options: ['Tamaño fijo', 'Ligeramente ajustable', 'Muy ajustable', 'Completamente modular'] },
    { id: 'cleaning_ease_small', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Muy fácil'] },
    { id: 'escape_prevention', name: 'Prevención de escape', type: 'select', options: ['Sin prevención', 'Prevención básica', 'Alta prevención', 'A prueba de escape'] },
    { id: 'interaction_encouragement', name: 'Fomento de interacción', type: 'select', options: ['Sin interacción', 'Interacción básica', 'Alta interacción', 'Máxima interacción'] },
    { id: 'noise_level_accessory', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Ruido mínimo', 'Ruido moderado', 'Ruidoso'] },
    { id: 'durability_small_habitat', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Uso profesional'] },
    { id: 'multi_level_compatibility', name: 'Compatibilidad multi-nivel', type: 'select', options: ['Solo nivel único', 'Adaptable', 'Multi-nivel', 'Sistema modular vertical'] }
  ],

  // Alimento para animales pequeños
  'pets-products-alimento-animales-pequenos': [
    { id: 'food_form_small', name: 'Forma del alimento', type: 'select', options: ['Pellets', 'Mezcla de semillas', 'Heno', 'Verduras frescas', 'Frutas secas', 'Alimento mixto'] },
    { id: 'target_species_small', name: 'Especies objetivo', type: 'tags', options: ['Conejos', 'Cobayas', 'Hámsters', 'Chinchillas', 'Hurones', 'Jerbos', 'Ratones', 'Todas las especies'] },
    { id: 'life_stage_small', name: 'Etapa de vida', type: 'select', options: ['Bebé', 'Juvenil', 'Adulto', 'Embarazo/lactancia', 'Senior', 'Todas las etapas'] },
    { id: 'nutritional_profile_small', name: 'Perfil nutricional', type: 'tags', options: ['Alto en fibra', 'Alto en proteína', 'Bajo en calcio', 'Rico en vitamina C', 'Balanceado', 'Especializado'] },
    { id: 'texture_preference', name: 'Preferencia de textura', type: 'select', options: ['Suave', 'Crujiente', 'Mixta', 'Variable'] },
    { id: 'grain_free_option', name: 'Opción libre de granos', type: 'select', options: ['Con granos', 'Libre de granos', 'Granos limitados', 'Natural'] },
    { id: 'feeding_method_small', name: 'Método de alimentación', type: 'select', options: ['Alimentación libre', 'Porciones controladas', 'Alimentación programada', 'Alimentación mixta'] },
    { id: 'storage_life_small', name: 'Vida de almacenamiento', type: 'select', options: ['1-3 meses', '3-6 meses', '6-12 meses', '12+ meses'] },
    { id: 'natural_vs_processed', name: 'Natural vs Procesado', type: 'select', options: ['100% natural', 'Mayormente natural', 'Procesado balanceado', 'Altamente procesado'] },
    { id: 'special_dietary_needs', name: 'Necesidades dietéticas especiales', type: 'tags', options: ['Sin restricciones', 'Sensibilidades alimentarias', 'Problemas digestivos', 'Control de peso', 'Múltiples necesidades'] }
  ],

  // Artículos para camas de animales pequeños
  'pets-products-articulos-camas-pequenos': [
    { id: 'bedding_material_small', name: 'Material de cama', type: 'select', options: ['Papel reciclado', 'Virutas de madera', 'Heno', 'Fibra de coco', 'Tela', 'Múltiples materiales'] },
    { id: 'absorbency_level', name: 'Nivel de absorción', type: 'select', options: ['Baja absorción', 'Absorción moderada', 'Alta absorción', 'Máxima absorción'] },
    { id: 'dust_free_rating', name: 'Calificación libre de polvo', type: 'select', options: ['Contiene polvo', 'Polvo mínimo', 'Muy bajo polvo', 'Completamente libre de polvo'] },
    { id: 'odor_control_bedding', name: 'Control de olores', type: 'select', options: ['Sin control', 'Control básico', 'Buen control', 'Excelente control'] },
    { id: 'comfort_level_bedding', name: 'Nivel de comodidad', type: 'select', options: ['Básico', 'Cómodo', 'Muy cómodo', 'Máxima comodidad'] },
    { id: 'biodegradability', name: 'Biodegradabilidad', type: 'select', options: ['No biodegradable', 'Parcialmente biodegradable', 'Biodegradable', 'Compostable'] },
    { id: 'allergen_free', name: 'Libre de alérgenos', type: 'select', options: ['Contiene alérgenos', 'Alérgenos mínimos', 'Mayormente libre', 'Completamente libre'] },
    { id: 'nesting_suitability', name: 'Adecuado para anidar', type: 'select', options: ['No adecuado', 'Básicamente adecuado', 'Muy adecuado', 'Ideal para anidar'] },
    { id: 'expansion_volume', name: 'Volumen de expansión', type: 'select', options: ['Sin expansión', 'Expansión mínima', 'Buena expansión', 'Máxima expansión'] },
    { id: 'respiratory_safety', name: 'Seguridad respiratoria', type: 'select', options: ['Precaución requerida', 'Generalmente seguro', 'Muy seguro', 'Completamente seguro'] }
  ],

  // Golosinas para animales pequeños
  'pets-products-golosinas-animales-pequenos': [
    { id: 'treat_type_small', name: 'Tipo de golosina', type: 'select', options: ['Frutas secas', 'Verduras deshidratadas', 'Semillas', 'Galletas', 'Palitos masticables', 'Golosinas mixtas'] },
    { id: 'treat_purpose', name: 'Propósito de la golosina', type: 'select', options: ['Recompensa', 'Enriquecimiento', 'Suplemento nutricional', 'Cuidado dental', 'Múltiples propósitos'] },
    { id: 'hardness_level', name: 'Nivel de dureza', type: 'select', options: ['Muy suave', 'Suave', 'Moderadamente duro', 'Muy duro'] },
    { id: 'sugar_content', name: 'Contenido de azúcar', type: 'select', options: ['Sin azúcar añadido', 'Azúcar natural bajo', 'Azúcar moderado', 'Alto en azúcar'] },
    { id: 'treat_frequency', name: 'Frecuencia de administración', type: 'select', options: ['Diario', 'Varias veces por semana', 'Semanal', 'Ocasional'] },
    { id: 'digestibility_treats', name: 'Digestibilidad', type: 'select', options: ['Difícil digestión', 'Digestión moderada', 'Fácil digestión', 'Muy fácil digestión'] },
    { id: 'foraging_encouragement', name: 'Fomento de forrajeo', type: 'select', options: ['Sin fomento', 'Fomento básico', 'Alto fomento', 'Máximo fomento'] },
    { id: 'teeth_health_benefit', name: 'Beneficio para salud dental', type: 'select', options: ['Sin beneficio', 'Beneficio mínimo', 'Buen beneficio', 'Excelente beneficio'] },
    { id: 'portion_control', name: 'Control de porciones', type: 'select', options: ['Porción libre', 'Porciones sugeridas', 'Porciones controladas', 'Porciones individuales'] },
    { id: 'ingredient_simplicity', name: 'Simplicidad de ingredientes', type: 'select', options: ['Múltiples ingredientes', 'Ingredientes moderados', 'Pocos ingredientes', 'Ingrediente único'] }
  ],

  // Jaulas y habitáculos para animales pequeños
  'pets-products-jaulas-habitaculos-pequenos': [
    { id: 'habitat_size_small', name: 'Tamaño del hábitat', type: 'select', options: ['Pequeño (50-100cm)', 'Mediano (100-150cm)', 'Grande (150-200cm)', 'Extra grande (200cm+)'] },
    { id: 'habitat_type_small', name: 'Tipo de hábitat', type: 'select', options: ['Jaula de alambre', 'Acuario de vidrio', 'Hábitat de plástico', 'Corral modular', 'Múltiples tipos'] },
    { id: 'bar_spacing', name: 'Espaciado entre barras', type: 'select', options: ['Muy estrecho (6mm)', 'Estrecho (9mm)', 'Estándar (12mm)', 'Amplio (15mm+)', 'Variable'] },
    { id: 'ventilation_quality', name: 'Calidad de ventilación', type: 'select', options: ['Ventilación limitada', 'Ventilación básica', 'Buena ventilación', 'Excelente ventilación'] },
    { id: 'multi_level_design', name: 'Diseño multi-nivel', type: 'select', options: ['Un solo nivel', 'Dos niveles', 'Múltiples niveles', 'Completamente modular'] },
    { id: 'access_ease_habitat', name: 'Facilidad de acceso', type: 'select', options: ['Acceso limitado', 'Acceso básico', 'Buen acceso', 'Acceso completo'] },
    { id: 'assembly_complexity_habitat', name: 'Complejidad de ensamble', type: 'select', options: ['Pre-ensamblado', 'Ensamble simple', 'Ensamble moderado', 'Ensamble complejo'] },
    { id: 'portability_habitat', name: 'Portabilidad', type: 'select', options: ['No portátil', 'Portabilidad limitada', 'Moderadamente portátil', 'Muy portátil'] },
    { id: 'expansion_capability', name: 'Capacidad de expansión', type: 'select', options: ['Sin expansión', 'Expansión limitada', 'Buena expansión', 'Expansión completa'] },
    { id: 'security_level_habitat', name: 'Nivel de seguridad', type: 'select', options: ['Seguridad básica', 'Seguridad estándar', 'Alta seguridad', 'Máxima seguridad'] }
  ],

  // Barreras para mascotas para vehículos (categoría general)
  'pets-products-barreras-vehiculos': [
    { id: 'vehicle_compatibility', name: 'Compatibilidad vehicular', type: 'tags', options: ['Sedán', 'SUV', 'Hatchback', 'Station wagon', 'Pickup truck', 'Van', 'Todos los vehículos'] },
    { id: 'installation_method_vehicle', name: 'Método de instalación', type: 'select', options: ['Clips', 'Tensión', 'Atornillado', 'Velcro', 'Magnético', 'Múltiples métodos'] },
    { id: 'barrier_material_vehicle', name: 'Material de barrera', type: 'select', options: ['Metal', 'Plástico resistente', 'Malla', 'Tela reforzada', 'Materiales mixtos'] },
    { id: 'adjustment_capability', name: 'Capacidad de ajuste', type: 'select', options: ['Tamaño fijo', 'Ligeramente ajustable', 'Muy ajustable', 'Completamente ajustable'] },
    { id: 'crash_safety_rating', name: 'Calificación seguridad en crash', type: 'select', options: ['No testada', 'Seguridad básica', 'Seguridad estándar', 'Seguridad alta'] },
    { id: 'pet_size_suitability', name: 'Adecuado para tamaño de mascota', type: 'select', options: ['Mascotas pequeñas', 'Mascotas medianas', 'Mascotas grandes', 'Todos los tamaños'] },
    { id: 'visibility_impact', name: 'Impacto en visibilidad', type: 'select', options: ['Sin impacto', 'Impacto mínimo', 'Impacto moderado', 'Impacto significativo'] },
    { id: 'removal_ease', name: 'Facilidad de remoción', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Muy fácil'] },
    { id: 'durability_vehicle', name: 'Durabilidad', type: 'select', options: ['Uso ocasional', 'Uso regular', 'Uso intensivo', 'Uso profesional'] },
    { id: 'interference_car_functions', name: 'Interferencia con funciones del auto', type: 'select', options: ['Sin interferencia', 'Interferencia mínima', 'Interferencia moderada', 'Interferencia significativa'] }
  ],

  // Barreras del asiento trasero
  'pets-products-barreras-asiento-trasero': [
    { id: 'back_seat_coverage', name: 'Cobertura asiento trasero', type: 'select', options: ['Parcial', 'Completa', 'Zona específica', 'Personalizable'] },
    { id: 'seat_attachment_points', name: 'Puntos de fijación al asiento', type: 'tags', options: ['Reposacabezas', 'Cinturones de seguridad', 'Clips laterales', 'Base del asiento', 'Múltiples puntos'] },
    { id: 'height_adjustment_back', name: 'Ajuste de altura', type: 'select', options: ['Altura fija', 'Ajuste básico', 'Ajuste amplio', 'Completamente ajustable'] },
    { id: 'pet_access_restriction', name: 'Restricción acceso mascota', type: 'select', options: ['Acceso libre', 'Acceso limitado', 'Acceso controlado', 'Acceso completamente bloqueado'] },
    { id: 'front_seat_protection', name: 'Protección asiento delantero', type: 'select', options: ['Sin protección', 'Protección básica', 'Protección completa', 'Protección reforzada'] },
    { id: 'mesh_density', name: 'Densidad de malla', type: 'select', options: ['Malla abierta', 'Malla media', 'Malla densa', 'Barrera sólida'] },
    { id: 'side_coverage', name: 'Cobertura lateral', type: 'select', options: ['Sin cobertura', 'Cobertura parcial', 'Cobertura completa', 'Cobertura extendida'] },
    { id: 'storage_pockets', name: 'Bolsillos de almacenamiento', type: 'select', options: ['Sin bolsillos', '1-2 bolsillos', '3-4 bolsillos', '5+ bolsillos'] },
    { id: 'zipper_access', name: 'Acceso con cremallera', type: 'select', options: ['Sin acceso', 'Acceso básico', 'Múltiples accesos', 'Acceso completo'] },
    { id: 'impact_resistance_back', name: 'Resistencia al impacto', type: 'select', options: ['Resistencia básica', 'Resistencia moderada', 'Alta resistencia', 'Resistencia máxima'] }
  ],

  // Barreras del maletero
  'pets-products-barreras-maletero': [
    { id: 'cargo_area_fit', name: 'Ajuste área de carga', type: 'select', options: ['Ajuste básico', 'Ajuste preciso', 'Ajuste perfecto', 'Ajuste universal'] },
    { id: 'loading_ease', name: 'Facilidad de carga', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Muy fácil'] },
    { id: 'trunk_lid_clearance', name: 'Espacio libre tapa maletero', type: 'select', options: ['Clearance limitado', 'Clearance adecuado', 'Clearance amplio', 'Sin restricciones'] },
    { id: 'cabin_separation', name: 'Separación cabina', type: 'select', options: ['Separación parcial', 'Separación buena', 'Separación completa', 'Separación hermética'] },
    { id: 'ventilation_allowance', name: 'Permitir ventilación', type: 'select', options: ['Ventilación limitada', 'Ventilación básica', 'Buena ventilación', 'Ventilación óptima'] },
    { id: 'cargo_organization', name: 'Organización de carga', type: 'select', options: ['Sin organización', 'Organización básica', 'Buena organización', 'Organización completa'] },
    { id: 'rear_visibility_impact', name: 'Impacto visibilidad trasera', type: 'select', options: ['Sin impacto', 'Impacto leve', 'Impacto moderado', 'Impacto alto'] },
    { id: 'folding_capability_trunk', name: 'Capacidad de plegado', type: 'select', options: ['No plegable', 'Plegado básico', 'Plegado compacto', 'Plegado ultra-compacto'] },
    { id: 'weight_capacity_barrier', name: 'Capacidad de peso', type: 'select', options: ['Hasta 20kg', 'Hasta 40kg', 'Hasta 60kg', '60kg+'] },
    { id: 'escape_prevention_trunk', name: 'Prevención de escape', type: 'select', options: ['Prevención básica', 'Prevención buena', 'Prevención alta', 'A prueba de escape'] }
  ],

  // Barreras de puerta
  'pets-products-barreras-puerta': [
    { id: 'door_opening_restriction', name: 'Restricción apertura puerta', type: 'select', options: ['Sin restricción', 'Restricción parcial', 'Restricción completa', 'Bloqueo total'] },
    { id: 'window_integration', name: 'Integración con ventana', type: 'select', options: ['Sin integración', 'Integración básica', 'Integración completa', 'Sistema unificado'] },
    { id: 'quick_release_mechanism', name: 'Mecanismo liberación rápida', type: 'select', options: ['Sin liberación rápida', 'Liberación básica', 'Liberación fácil', 'Liberación instantánea'] },
    { id: 'door_handle_accessibility', name: 'Accesibilidad manija puerta', type: 'select', options: ['Acceso bloqueado', 'Acceso limitado', 'Acceso normal', 'Acceso completo'] },
    { id: 'emergency_exit_provision', name: 'Provisión salida emergencia', type: 'select', options: ['Sin provisión', 'Provisión básica', 'Provisión buena', 'Provisión completa'] },
    { id: 'door_panel_protection', name: 'Protección panel puerta', type: 'select', options: ['Sin protección', 'Protección básica', 'Protección completa', 'Protección reforzada'] },
    { id: 'air_circulation_door', name: 'Circulación de aire', type: 'select', options: ['Circulación limitada', 'Circulación básica', 'Buena circulación', 'Circulación óptima'] },
    { id: 'scratch_resistance_door', name: 'Resistencia a rayones', type: 'select', options: ['Resistencia básica', 'Resistencia buena', 'Alta resistencia', 'Resistencia máxima'] },
    { id: 'child_lock_compatibility', name: 'Compatibilidad seguro niños', type: 'select', options: ['No compatible', 'Parcialmente compatible', 'Compatible', 'Totalmente compatible'] },
    { id: 'universal_door_fit', name: 'Ajuste universal puertas', type: 'select', options: ['Ajuste limitado', 'Ajuste moderado', 'Buen ajuste', 'Ajuste universal'] }
  ],

  // Barreras de ventana
  'pets-products-barreras-ventana': [
    { id: 'window_size_compatibility', name: 'Compatibilidad tamaño ventana', type: 'select', options: ['Ventanas pequeñas', 'Ventanas medianas', 'Ventanas grandes', 'Todos los tamaños'] },
    { id: 'ventilation_maintenance', name: 'Mantenimiento ventilación', type: 'select', options: ['Ventilación bloqueada', 'Ventilación reducida', 'Ventilación normal', 'Ventilación mejorada'] },
    { id: 'window_operation_impact', name: 'Impacto operación ventana', type: 'select', options: ['Operación bloqueada', 'Operación limitada', 'Operación normal', 'Sin impacto'] },
    { id: 'uv_protection_window', name: 'Protección UV', type: 'select', options: ['Sin protección UV', 'Protección básica', 'Buena protección', 'Protección máxima'] },
    { id: 'transparency_level', name: 'Nivel de transparencia', type: 'select', options: ['Opaco', 'Semi-transparente', 'Transparente', 'Ultra-transparente'] },
    { id: 'wind_resistance', name: 'Resistencia al viento', type: 'select', options: ['Resistencia básica', 'Resistencia moderada', 'Alta resistencia', 'Resistencia máxima'] },
    { id: 'paw_protection', name: 'Protección de patas', type: 'select', options: ['Protección básica', 'Protección buena', 'Alta protección', 'Protección máxima'] },
    { id: 'installation_window_type', name: 'Tipo instalación ventana', type: 'select', options: ['Manual', 'Eléctrica', 'Ambas', 'Universal'] },
    { id: 'removal_frequency_tolerance', name: 'Tolerancia frecuencia remoción', type: 'select', options: ['Uso permanente', 'Remoción ocasional', 'Remoción frecuente', 'Uso temporal'] },
    { id: 'aesthetic_impact_window', name: 'Impacto estético', type: 'select', options: ['Impacto alto', 'Impacto moderado', 'Impacto mínimo', 'Sin impacto'] }
  ],

  // Particiones
  'pets-products-particiones': [
    { id: 'partition_scope', name: 'Alcance de partición', type: 'select', options: ['Área específica', 'Sección completa', 'Múltiples secciones', 'Vehículo completo'] },
    { id: 'modularity_partition', name: 'Modularidad', type: 'select', options: ['Sistema fijo', 'Modularidad básica', 'Alta modularidad', 'Completamente modular'] },
    { id: 'space_division_efficiency', name: 'Eficiencia división espacio', type: 'select', options: ['Eficiencia básica', 'Eficiencia buena', 'Alta eficiencia', 'Eficiencia máxima'] },
    { id: 'passenger_space_impact', name: 'Impacto espacio pasajeros', type: 'select', options: ['Impacto significativo', 'Impacto moderado', 'Impacto mínimo', 'Sin impacto'] },
    { id: 'reconfiguration_ease', name: 'Facilidad reconfiguración', type: 'select', options: ['Difícil', 'Moderada', 'Fácil', 'Muy fácil'] },
    { id: 'multi_pet_accommodation', name: 'Acomodación múltiples mascotas', type: 'select', options: ['Una mascota', 'Dos mascotas', 'Múltiples mascotas', 'Grupos grandes'] },
    { id: 'isolation_level', name: 'Nivel de aislamiento', type: 'select', options: ['Aislamiento básico', 'Aislamiento moderado', 'Alto aislamiento', 'Aislamiento completo'] },
    { id: 'access_control_partition', name: 'Control de acceso', type: 'select', options: ['Acceso libre', 'Acceso controlado', 'Acceso selectivo', 'Acceso restringido'] },
    { id: 'structural_integrity', name: 'Integridad estructural', type: 'select', options: ['Estructura básica', 'Estructura sólida', 'Alta integridad', 'Integridad máxima'] },
    { id: 'climate_zone_creation', name: 'Creación zonas climáticas', type: 'select', options: ['Sin zonificación', 'Zonificación básica', 'Buena zonificación', 'Zonificación completa'] }
  ],

  // Equipos para el ejercicio de mascotas (categoría general)
  'pets-products-equipos-ejercicio': [
    { id: 'exercise_type', name: 'Tipo de ejercicio', type: 'tags', options: ['Agilidad', 'Salto', 'Equilibrio', 'Fuerza', 'Flexibilidad', 'Coordinación', 'Múltiples tipos'] },
    { id: 'skill_level_required', name: 'Nivel de habilidad requerido', type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'] },
    { id: 'dog_size_suitability', name: 'Adecuado para tamaño de perro', type: 'select', options: ['Perros pequeños', 'Perros medianos', 'Perros grandes', 'Todos los tamaños'] },
    { id: 'indoor_outdoor_exercise', name: 'Uso interior/exterior', type: 'select', options: ['Solo interior', 'Solo exterior', 'Ambos ambientes', 'Preferencia exterior'] },
    { id: 'assembly_complexity_exercise', name: 'Complejidad de armado', type: 'select', options: ['Pre-armado', 'Armado simple', 'Armado moderado', 'Armado complejo'] },
    { id: 'portability_exercise', name: 'Portabilidad', type: 'select', options: ['Fijo', 'Semi-portátil', 'Portátil', 'Ultra-portátil'] },
    { id: 'weather_resistance_exercise', name: 'Resistencia al clima', type: 'select', options: ['Solo interior', 'Resistencia básica', 'Alta resistencia', 'Todo clima'] },
    { id: 'safety_features_exercise', name: 'Características de seguridad', type: 'tags', options: ['Superficies antideslizantes', 'Bordes redondeados', 'Materiales acolchados', 'Sistemas de fijación', 'Múltiples características'] },
    { id: 'training_progression', name: 'Progresión de entrenamiento', type: 'select', options: ['Nivel único', 'Ajustable', 'Múltiples niveles', 'Completamente progresivo'] },
    { id: 'space_requirement', name: 'Requerimiento de espacio', type: 'select', options: ['Espacio mínimo', 'Espacio moderado', 'Espacio amplio', 'Espacio muy amplio'] }
  ],

  // Anillos para saltos
  'pets-products-anillos-saltos': [
    { id: 'ring_diameter', name: 'Diámetro del anillo', type: 'select', options: ['30-40cm', '40-50cm', '50-60cm', '60cm+', 'Ajustable'] },
    { id: 'ring_material', name: 'Material del anillo', type: 'select', options: ['Plástico', 'Metal', 'Madera', 'Material compuesto', 'Múltiples materiales'] },
    { id: 'height_adjustment_ring', name: 'Ajuste de altura', type: 'select', options: ['Altura fija', 'Ajuste básico', 'Múltiples alturas', 'Ajuste continuo'] },
    { id: 'stability_ring', name: 'Estabilidad', type: 'select', options: ['Estabilidad básica', 'Estabilidad buena', 'Alta estabilidad', 'Estabilidad máxima'] },
    { id: 'ring_visibility', name: 'Visibilidad del anillo', type: 'select', options: ['Básica', 'Buena', 'Alta visibilidad', 'Colores contrastantes'] },
    { id: 'breakaway_feature', name: 'Característica de ruptura', type: 'select', options: ['Rígido', 'Semi-flexible', 'Breakaway seguro', 'Sistema de liberación'] },
    { id: 'base_design_ring', name: 'Diseño de base', type: 'select', options: ['Base simple', 'Base pesada', 'Base extendida', 'Base ajustable'] },
    { id: 'ring_thickness', name: 'Grosor del anillo', type: 'select', options: ['Fino', 'Estándar', 'Grueso', 'Extra grueso'] },
    { id: 'surface_texture_ring', name: 'Textura de superficie', type: 'select', options: ['Lisa', 'Texturizada', 'Antideslizante', 'Acolchada'] },
    { id: 'competitive_compliance_ring', name: 'Cumplimiento competitivo', type: 'select', options: ['No competitivo', 'Parcialmente conforme', 'Totalmente conforme', 'Certificado oficial'] }
  ],

  // Balancines
  'pets-products-balancines': [
    { id: 'balance_board_size', name: 'Tamaño de tabla de equilibrio', type: 'select', options: ['Pequeña (30-40cm)', 'Mediana (40-60cm)', 'Grande (60-80cm)', 'Extra grande (80cm+)'] },
    { id: 'tilt_range', name: 'Rango de inclinación', type: 'select', options: ['Inclinación mínima', 'Inclinación moderada', 'Alta inclinación', 'Inclinación variable'] },
    { id: 'surface_material_balance', name: 'Material de superficie', type: 'select', options: ['Madera', 'Plástico antideslizante', 'Goma', 'Material compuesto', 'Superficie acolchada'] },
    { id: 'stability_adjustment', name: 'Ajuste de estabilidad', type: 'select', options: ['Estabilidad fija', 'Ligeramente ajustable', 'Muy ajustable', 'Completamente personalizable'] },
    { id: 'weight_capacity_balance', name: 'Capacidad de peso', type: 'select', options: ['Hasta 10kg', 'Hasta 25kg', 'Hasta 50kg', '50kg+'] },
    { id: 'balance_difficulty', name: 'Dificultad de equilibrio', type: 'select', options: ['Muy fácil', 'Fácil', 'Moderada', 'Difícil'] },
    { id: 'fulcrum_design', name: 'Diseño del fulcro', type: 'select', options: ['Fulcro simple', 'Fulcro curvo', 'Fulcro ajustable', 'Múltiples fulcros'] },
    { id: 'safety_edges_balance', name: 'Bordes de seguridad', type: 'select', options: ['Bordes básicos', 'Bordes redondeados', 'Bordes acolchados', 'Bordes de seguridad máxima'] },
    { id: 'noise_level_balance', name: 'Nivel de ruido', type: 'select', options: ['Silencioso', 'Ruido mínimo', 'Ruido moderado', 'Ruidoso'] },
    { id: 'progression_levels_balance', name: 'Niveles de progresión', type: 'select', options: ['Un nivel', 'Dos niveles', 'Múltiples niveles', 'Infinitos niveles'] }
  ],

  // Barras de salto
  'pets-products-barras-salto': [
    { id: 'bar_height_range', name: 'Rango de altura de barra', type: 'select', options: ['15-30cm', '30-60cm', '60-90cm', '15-90cm variable'] },
    { id: 'bar_material_jump', name: 'Material de barra', type: 'select', options: ['PVC', 'Madera', 'Metal ligero', 'Material compuesto', 'Múltiples materiales'] },
    { id: 'post_stability_jump', name: 'Estabilidad de postes', type: 'select', options: ['Estabilidad básica', 'Estabilidad mejorada', 'Alta estabilidad', 'Estabilidad profesional'] },
    { id: 'bar_flexibility', name: 'Flexibilidad de barra', type: 'select', options: ['Rígida', 'Semi-flexible', 'Flexible', 'Ultra-flexible'] },
    { id: 'knockdown_safety', name: 'Seguridad de caída', type: 'select', options: ['Caída básica', 'Caída segura', 'Sistema de liberación', 'Caída ultra-segura'] },
    { id: 'adjustment_mechanism_jump', name: 'Mecanismo de ajuste', type: 'select', options: ['Clips', 'Pines', 'Sistema deslizante', 'Ajuste rápido'] },
    { id: 'base_width_jump', name: 'Ancho de base', type: 'select', options: ['Base estrecha', 'Base estándar', 'Base ancha', 'Base extra ancha'] },
    { id: 'color_visibility_jump', name: 'Visibilidad de color', type: 'select', options: ['Colores básicos', 'Colores brillantes', 'Alto contraste', 'Colores competitivos'] },
    { id: 'multi_bar_capability', name: 'Capacidad múltiples barras', type: 'select', options: ['Barra única', 'Dos barras', 'Múltiples barras', 'Sistema expansible'] },
    { id: 'competition_standard_jump', name: 'Estándar de competición', type: 'select', options: ['Recreativo', 'Semi-competitivo', 'Estándar competitivo', 'Profesional certificado'] }
  ],

  // Cajas de pausa
  'pets-products-cajas-pausa': [
    { id: 'pause_box_size', name: 'Tamaño de caja de pausa', type: 'select', options: ['Pequeña (30x30cm)', 'Mediana (60x60cm)', 'Grande (90x90cm)', 'Personalizable'] },
    { id: 'box_height', name: 'Altura de caja', type: 'select', options: ['Baja (10-20cm)', 'Media (20-40cm)', 'Alta (40-60cm)', 'Ajustable'] },
    { id: 'surface_texture_box', name: 'Textura de superficie', type: 'select', options: ['Lisa', 'Texturizada', 'Antideslizante', 'Acolchada'] },
    { id: 'edge_design_box', name: 'Diseño de bordes', type: 'select', options: ['Bordes rectos', 'Bordes biselados', 'Bordes redondeados', 'Bordes acolchados'] },
    { id: 'pause_duration_design', name: 'Diseño para duración de pausa', type: 'select', options: ['Pausa corta', 'Pausa media', 'Pausa larga', 'Pausa variable'] },
    { id: 'material_durability_box', name: 'Durabilidad del material', type: 'select', options: ['Uso ligero', 'Uso regular', 'Uso intensivo', 'Uso profesional'] },
    { id: 'weather_resistance_box', name: 'Resistencia al clima', type: 'select', options: ['Solo interior', 'Resistencia básica', 'Resistencia alta', 'Todo clima'] },
    { id: 'stackability_box', name: 'Capacidad de apilado', type: 'select', options: ['No apilable', 'Apilado básico', 'Apilado eficiente', 'Apilado optimizado'] },
    { id: 'comfort_level_box', name: 'Nivel de comodidad', type: 'select', options: ['Básico', 'Cómodo', 'Muy cómodo', 'Máximo confort'] },
    { id: 'training_feedback_box', name: 'Retroalimentación de entrenamiento', type: 'select', options: ['Sin retroalimentación', 'Feedback visual', 'Feedback táctil', 'Feedback múltiple'] }
  ],

  // Empalizadas
  'pets-products-empalizadas': [
    { id: 'palisade_height', name: 'Altura de empalizada', type: 'select', options: ['Baja (30-60cm)', 'Media (60-90cm)', 'Alta (90-120cm)', 'Extra alta (120cm+)'] },
    { id: 'palisade_length', name: 'Longitud de empalizada', type: 'select', options: ['Corta (1-2m)', 'Media (2-4m)', 'Larga (4-6m)', 'Extra larga (6m+)'] },
    { id: 'post_spacing', name: 'Espaciado de postes', type: 'select', options: ['Espaciado estrecho', 'Espaciado estándar', 'Espaciado amplio', 'Espaciado variable'] },
    { id: 'climbing_difficulty', name: 'Dificultad de escalada', type: 'select', options: ['Muy fácil', 'Fácil', 'Moderada', 'Difícil'] },
    { id: 'palisade_material', name: 'Material de empalizada', type: 'select', options: ['Madera', 'PVC', 'Metal', 'Material compuesto', 'Múltiples materiales'] },
    { id: 'modular_design_palisade', name: 'Diseño modular', type: 'select', options: ['Estructura fija', 'Parcialmente modular', 'Altamente modular', 'Completamente modular'] },
    { id: 'safety_features_palisade', name: 'Características de seguridad', type: 'tags', options: ['Puntas redondeadas', 'Superficies lisas', 'Bordes protegidos', 'Bases estables', 'Múltiples características'] },
    { id: 'ground_anchoring', name: 'Anclaje al suelo', type: 'select', options: ['Sin anclaje', 'Anclaje básico', 'Anclaje seguro', 'Anclaje profesional'] },
    { id: 'visibility_through_palisade', name: 'Visibilidad a través', type: 'select', options: ['Sin visibilidad', 'Visibilidad limitada', 'Buena visibilidad', 'Visibilidad completa'] },
    { id: 'maintenance_requirement_palisade', name: 'Requerimiento de mantenimiento', type: 'select', options: ['Sin mantenimiento', 'Mantenimiento mínimo', 'Mantenimiento regular', 'Mantenimiento frecuente'] }
  ],

  // Paseos para perros y rampas
  'pets-products-paseos-rampas': [
    { id: 'ramp_length', name: 'Longitud de rampa', type: 'select', options: ['Corta (1-2m)', 'Media (2-4m)', 'Larga (4-6m)', 'Extra larga (6m+)'] },
    { id: 'ramp_width', name: 'Ancho de rampa', type: 'select', options: ['Estrecha (30-50cm)', 'Estándar (50-80cm)', 'Ancha (80-120cm)', 'Extra ancha (120cm+)'] },
    { id: 'incline_angle', name: 'Ángulo de inclinación', type: 'select', options: ['Suave (5-15°)', 'Moderado (15-25°)', 'Pronunciado (25-35°)', 'Ajustable'] },
    { id: 'surface_grip_ramp', name: 'Agarre de superficie', type: 'select', options: ['Superficie lisa', 'Textura básica', 'Alta tracción', 'Máximo agarre'] },
    { id: 'weight_capacity_ramp', name: 'Capacidad de peso', type: 'select', options: ['Hasta 25kg', 'Hasta 50kg', 'Hasta 75kg', '75kg+'] },
    { id: 'foldability_ramp', name: 'Capacidad de plegado', type: 'select', options: ['No plegable', 'Plegado básico', 'Plegado compacto', 'Ultra-compacto'] },
    { id: 'edge_protection_ramp', name: 'Protección de bordes', type: 'select', options: ['Sin protección', 'Protección básica', 'Protección completa', 'Protección elevada'] },
    { id: 'ramp_material_construction', name: 'Material de construcción', type: 'select', options: ['Plástico', 'Aluminio', 'Madera', 'Material compuesto', 'Múltiples materiales'] },
    { id: 'adjustable_height_ramp', name: 'Altura ajustable', type: 'select', options: ['Altura fija', 'Ajuste básico', 'Múltiples alturas', 'Ajuste continuo'] },
    { id: 'confidence_building', name: 'Construcción de confianza', type: 'select', options: ['Nivel básico', 'Nivel intermedio', 'Nivel avanzado', 'Progresión completa'] }
  ],

  // Postes
  'pets-products-postes': [
    { id: 'post_height', name: 'Altura de poste', type: 'select', options: ['Bajo (30-60cm)', 'Medio (60-120cm)', 'Alto (120-180cm)', 'Ajustable'] },
    { id: 'post_material', name: 'Material del poste', type: 'select', options: ['PVC', 'Aluminio', 'Acero', 'Madera', 'Material compuesto'] },
    { id: 'base_design_post', name: 'Diseño de base', type: 'select', options: ['Base simple', 'Base pesada', 'Base expandible', 'Base de agua/arena'] },
    { id: 'attachment_points', name: 'Puntos de fijación', type: 'select', options: ['1-2 puntos', '3-4 puntos', '5-6 puntos', 'Múltiples puntos'] },
    { id: 'weather_resistance_post', name: 'Resistencia al clima', type: 'select', options: ['Interior únicamente', 'Resistencia básica', 'Alta resistencia', 'Todo clima'] },
    { id: 'portability_post', name: 'Portabilidad', type: 'select', options: ['Fijo', 'Semi-portátil', 'Portátil', 'Ultra-portátil'] },
    { id: 'stability_mechanism', name: 'Mecanismo de estabilidad', type: 'select', options: ['Peso únicamente', 'Anclaje básico', 'Sistema avanzado', 'Estabilidad máxima'] },
    { id: 'multi_use_capability', name: 'Capacidad multiuso', type: 'select', options: ['Uso único', 'Pocos usos', 'Múltiples usos', 'Versátil completo'] },
    { id: 'assembly_time_post', name: 'Tiempo de armado', type: 'select', options: ['Instantáneo', 'Rápido (1-5 min)', 'Moderado (5-15 min)', 'Lento (15+ min)'] },
    { id: 'professional_grade_post', name: 'Grado profesional', type: 'select', options: ['Recreativo', 'Semi-profesional', 'Profesional', 'Competición'] }
  ],

  // Túneles de agilidad
  'pets-products-tuneles-agilidad': [
    { id: 'tunnel_length', name: 'Longitud del túnel', type: 'select', options: ['Corto (2-4m)', 'Medio (4-6m)', 'Largo (6-8m)', 'Extra largo (8m+)'] },
    { id: 'tunnel_diameter', name: 'Diámetro del túnel', type: 'select', options: ['Pequeño (40-50cm)', 'Medio (50-60cm)', 'Grande (60-70cm)', 'Extra grande (70cm+)'] },
    { id: 'tunnel_rigidity', name: 'Rigidez del túnel', type: 'select', options: ['Completamente rígido', 'Semi-rígido', 'Flexible', 'Ultra-flexible'] },
    { id: 'entrance_design_tunnel', name: 'Diseño de entrada', type: 'select', options: ['Entrada simple', 'Entrada reforzada', 'Entrada acolchada', 'Entrada decorativa'] },
    { id: 'tunnel_material', name: 'Material del túnel', type: 'select', options: ['Tela básica', 'Nylon resistente', 'Material impermeable', 'Material profesional'] },
    { id: 'collapsibility_tunnel', name: 'Capacidad de colapso', type: 'select', options: ['No colapsable', 'Parcialmente colapsable', 'Completamente colapsable', 'Plegado ultra-compacto'] },
    { id: 'anchoring_system_tunnel', name: 'Sistema de anclaje', type: 'select', options: ['Sin anclaje', 'Anclaje básico', 'Anclaje múltiple', 'Sistema de anclaje avanzado'] },
    { id: 'visibility_into_tunnel', name: 'Visibilidad hacia interior', type: 'select', options: ['Sin visibilidad', 'Visibilidad parcial', 'Buena visibilidad', 'Visibilidad completa'] },
    { id: 'ventilation_tunnel', name: 'Ventilación', type: 'select', options: ['Ventilación básica', 'Buena ventilación', 'Ventilación excelente', 'Ventilación máxima'] },
    { id: 'shape_configuration', name: 'Configuración de forma', type: 'select', options: ['Forma fija', 'Forma ajustable', 'Múltiples formas', 'Configuración libre'] }
  ],

  // Ropa para mascotas (categoría general)
  'pets-products-ropa': [
    { id: 'pet_size_clothing', name: 'Talla de mascota', type: 'select', options: ['XS (Toy)', 'S (Pequeño)', 'M (Mediano)', 'L (Grande)', 'XL (Extra grande)', 'XXL (Gigante)'] },
    { id: 'clothing_material', name: 'Material de ropa', type: 'tags', options: ['Algodón', 'Poliéster', 'Lana', 'Fleece', 'Nylon', 'Cuero', 'Materiales mixtos'] },
    { id: 'season_suitability', name: 'Adecuado para temporada', type: 'tags', options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año'] },
    { id: 'weather_protection', name: 'Protección climática', type: 'tags', options: ['Lluvia', 'Viento', 'Frío', 'Sol/UV', 'Nieve', 'Sin protección especial'] },
    { id: 'ease_of_wear', name: 'Facilidad de uso', type: 'select', options: ['Muy difícil', 'Difícil', 'Moderada', 'Fácil', 'Muy fácil'] },
    { id: 'washing_care', name: 'Cuidado de lavado', type: 'select', options: ['Solo lavado en seco', 'Lavado a mano', 'Máquina agua fría', 'Máquina cualquier temperatura'] },
    { id: 'comfort_level_clothing', name: 'Nivel de comodidad', type: 'select', options: ['Básico', 'Cómodo', 'Muy cómodo', 'Máximo confort'] },
    { id: 'mobility_restriction', name: 'Restricción de movilidad', type: 'select', options: ['Sin restricción', 'Restricción mínima', 'Restricción moderada', 'Restricción alta'] },
    { id: 'style_category', name: 'Categoría de estilo', type: 'select', options: ['Casual', 'Elegante', 'Deportivo', 'Temático', 'Funcional'] },
    { id: 'gender_target', name: 'Género objetivo', type: 'select', options: ['Unisex', 'Masculino', 'Femenino', 'Neutro'] }
  ],

  // Abrigos para mascotas
  'pets-products-abrigos': [
    { id: 'coat_length', name: 'Longitud del abrigo', type: 'select', options: ['Corto', 'Medio', 'Largo', 'Extra largo'] },
    { id: 'insulation_type', name: 'Tipo de aislamiento', type: 'select', options: ['Sin aislamiento', 'Ligero', 'Medio', 'Pesado', 'Ultra-cálido'] },
    { id: 'closure_type_coat', name: 'Tipo de cierre', type: 'select', options: ['Velcro', 'Cremallera', 'Botones', 'Broches', 'Sin cierre'] },
    { id: 'hood_feature', name: 'Característica de capucha', type: 'select', options: ['Sin capucha', 'Capucha fija', 'Capucha removible', 'Capucha ajustable'] },
    { id: 'waterproof_level', name: 'Nivel de impermeabilidad', type: 'select', options: ['No impermeable', 'Resistente a salpicaduras', 'Resistente al agua', 'Completamente impermeable'] },
    { id: 'wind_resistance', name: 'Resistencia al viento', type: 'select', options: ['Sin resistencia', 'Resistencia básica', 'Alta resistencia', 'Cortavientos'] },
    { id: 'reflective_elements', name: 'Elementos reflectantes', type: 'select', options: ['Sin elementos', 'Elementos mínimos', 'Elementos moderados', 'Alta visibilidad'] },
    { id: 'fit_style_coat', name: 'Estilo de ajuste', type: 'select', options: ['Ajustado', 'Regular', 'Holgado', 'Oversized'] },
    { id: 'collar_style_coat', name: 'Estilo de cuello', type: 'select', options: ['Sin cuello', 'Cuello básico', 'Cuello alto', 'Cuello forrado'] },
    { id: 'pocket_features', name: 'Características de bolsillos', type: 'select', options: ['Sin bolsillos', '1 bolsillo', '2 bolsillos', '3+ bolsillos'] }
  ],

  // Bufandas para mascotas
  'pets-products-bufandas': [
    { id: 'scarf_length', name: 'Longitud de bufanda', type: 'select', options: ['Corta', 'Media', 'Larga', 'Extra larga'] },
    { id: 'scarf_width', name: 'Ancho de bufanda', type: 'select', options: ['Estrecha', 'Estándar', 'Ancha', 'Extra ancha'] },
    { id: 'attachment_method_scarf', name: 'Método de sujeción', type: 'select', options: ['Anudada', 'Velcro', 'Clip', 'Elástica', 'Magnética'] },
    { id: 'warmth_level_scarf', name: 'Nivel de calor', type: 'select', options: ['Decorativo únicamente', 'Calor ligero', 'Calor moderado', 'Muy cálido'] },
    { id: 'pattern_design_scarf', name: 'Diseño de patrón', type: 'select', options: ['Sólido', 'Rayas', 'Cuadros', 'Estampado', 'Bordado'] },
    { id: 'reversible_feature', name: 'Característica reversible', type: 'select', options: ['No reversible', 'Reversible', 'Doble cara', 'Múltiples estilos'] },
    { id: 'texture_scarf', name: 'Textura', type: 'select', options: ['Lisa', 'Texturizada', 'Peluda', 'Suave', 'Rugosa'] },
    { id: 'seasonal_theme_scarf', name: 'Tema estacional', type: 'select', options: ['Sin tema', 'Navidad', 'Halloween', 'Primavera', 'Verano'] },
    { id: 'safety_scarf', name: 'Seguridad', type: 'select', options: ['Básica', 'Breakaway', 'Ajuste seguro', 'Máxima seguridad'] },
    { id: 'layering_capability', name: 'Capacidad de capas', type: 'select', options: ['Capa única', 'Compatible con ropa', 'Diseñado para capas', 'Sistema de capas'] }
  ],

  // Calcetines para mascotas
  'pets-products-calcetines': [
    { id: 'sock_height', name: 'Altura del calcetín', type: 'select', options: ['Tobillo', 'Bajo', 'Medio', 'Alto'] },
    { id: 'paw_protection_level', name: 'Nivel de protección de patas', type: 'select', options: ['Protección mínima', 'Protección básica', 'Protección alta', 'Protección máxima'] },
    { id: 'grip_sole', name: 'Suela antideslizante', type: 'select', options: ['Sin agarre', 'Agarre básico', 'Buen agarre', 'Máximo agarre'] },
    { id: 'breathability_sock', name: 'Transpirabilidad', type: 'select', options: ['Baja', 'Moderada', 'Alta', 'Máxima'] },
    { id: 'elasticity_sock', name: 'Elasticidad', type: 'select', options: ['Rígido', 'Ligeramente elástico', 'Elástico', 'Muy elástico'] },
    { id: 'claw_accommodation', name: 'Acomodación de garras', type: 'select', options: ['Sin acomodación', 'Acomodación básica', 'Buena acomodación', 'Acomodación completa'] },
    { id: 'moisture_wicking', name: 'Absorción de humedad', type: 'select', options: ['Sin absorción', 'Absorción básica', 'Buena absorción', 'Absorción máxima'] },
    { id: 'temperature_regulation', name: 'Regulación de temperatura', type: 'select', options: ['Sin regulación', 'Regulación básica', 'Buena regulación', 'Regulación óptima'] },
    { id: 'stay_on_ability', name: 'Capacidad de mantenerse puesto', type: 'select', options: ['Se desliza', 'Se mantiene básico', 'Se mantiene bien', 'Se mantiene perfectamente'] },
    { id: 'indoor_outdoor_sock', name: 'Uso interior/exterior', type: 'select', options: ['Solo interior', 'Principalmente interior', 'Ambos usos', 'Principalmente exterior'] }
  ],

  // Camisas para mascotas
  'pets-products-camisas': [
    { id: 'shirt_style', name: 'Estilo de camisa', type: 'select', options: ['T-shirt', 'Polo', 'Tank top', 'Manga larga', 'Camisa abierta'] },
    { id: 'neckline_style', name: 'Estilo de escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello alto', 'Sin cuello definido'] },
    { id: 'sleeve_length', name: 'Longitud de manga', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga 3/4', 'Manga larga'] },
    { id: 'fabric_weight', name: 'Peso de tela', type: 'select', options: ['Muy ligero', 'Ligero', 'Medio', 'Pesado'] },
    { id: 'stretch_capability', name: 'Capacidad de estiramiento', type: 'select', options: ['Sin estiramiento', 'Poco estiramiento', 'Buen estiramiento', 'Muy elástico'] },
    { id: 'collar_design_shirt', name: 'Diseño de collar', type: 'select', options: ['Sin collar', 'Collar básico', 'Collar ribeteado', 'Collar decorativo'] },
    { id: 'print_decoration', name: 'Decoración/estampado', type: 'select', options: ['Sin decoración', 'Estampado simple', 'Estampado complejo', 'Bordado', 'Aplicaciones'] },
    { id: 'button_closure', name: 'Cierre con botones', type: 'select', options: ['Sin botones', 'Botones funcionales', 'Botones decorativos', 'Sistema mixto'] },
    { id: 'tail_accommodation_shirt', name: 'Acomodación de cola', type: 'select', options: ['Sin acomodación', 'Abertura básica', 'Abertura ajustable', 'Diseño especial'] },
    { id: 'layering_compatibility_shirt', name: 'Compatibilidad de capas', type: 'select', options: ['Capa única', 'Base para capas', 'Capa intermedia', 'Múltiples usos'] }
  ],

  // Chalecos de seguridad para mascotas
  'pets-products-chalecos-seguridad': [
    { id: 'visibility_level', name: 'Nivel de visibilidad', type: 'select', options: ['Básica', 'Alta visibilidad', 'Muy alta visibilidad', 'Máxima visibilidad'] },
    { id: 'reflective_coverage', name: 'Cobertura reflectante', type: 'select', options: ['Elementos mínimos', 'Cobertura parcial', 'Cobertura extensa', 'Cobertura completa'] },
    { id: 'led_integration', name: 'Integración LED', type: 'select', options: ['Sin LED', 'LED básico', 'LED múltiple', 'Sistema LED avanzado'] },
    { id: 'safety_certification', name: 'Certificación de seguridad', type: 'select', options: ['Sin certificación', 'Estándar básico', 'Certificación industrial', 'Certificación profesional'] },
    { id: 'weather_resistance_safety', name: 'Resistencia al clima', type: 'select', options: ['Interior únicamente', 'Resistencia básica', 'Alta resistencia', 'Todo clima'] },
    { id: 'adjustment_safety', name: 'Ajustabilidad', type: 'select', options: ['Talla fija', 'Ligeramente ajustable', 'Muy ajustable', 'Completamente ajustable'] },
    { id: 'comfort_safety', name: 'Comodidad', type: 'select', options: ['Básica', 'Cómoda', 'Muy cómoda', 'Máximo confort'] },
    { id: 'activity_compatibility', name: 'Compatibilidad de actividad', type: 'tags', options: ['Caminata', 'Correr', 'Ciclismo', 'Trabajo', 'Emergencias', 'Todas las actividades'] },
    { id: 'battery_life_safety', name: 'Vida de batería (si aplica)', type: 'select', options: ['No aplica', '1-5 horas', '5-10 horas', '10+ horas', 'Recargable'] },
    { id: 'washability_safety', name: 'Lavabilidad', type: 'select', options: ['No lavable', 'Limpieza puntual', 'Lavable a mano', 'Lavable a máquina'] }
  ],

  // Chaquetas para mascotas
  'pets-products-chaquetas': [
    { id: 'jacket_weight', name: 'Peso de chaqueta', type: 'select', options: ['Muy liviana', 'Liviana', 'Media', 'Pesada'] },
    { id: 'insulation_rating', name: 'Calificación de aislamiento', type: 'select', options: ['Sin aislamiento', 'Aislamiento ligero', 'Aislamiento medio', 'Aislamiento pesado'] },
    { id: 'ventilation_system', name: 'Sistema de ventilación', type: 'select', options: ['Sin ventilación', 'Ventilación básica', 'Buena ventilación', 'Sistema avanzado'] },
    { id: 'zipper_quality', name: 'Calidad de cremallera', type: 'select', options: ['Cremallera básica', 'Cremallera resistente', 'Cremallera premium', 'Sistema de cremalleras'] },
    { id: 'storm_protection', name: 'Protección contra tormentas', type: 'select', options: ['Sin protección', 'Protección básica', 'Buena protección', 'Protección máxima'] },
    { id: 'mobility_jacket', name: 'Movilidad', type: 'select', options: ['Restricción alta', 'Restricción moderada', 'Buena movilidad', 'Movilidad completa'] },
    { id: 'packability', name: 'Empaquetabilidad', type: 'select', options: ['No empaquetable', 'Empaquetable básico', 'Muy empaquetable', 'Ultra-compacto'] },
    { id: 'durability_jacket', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Uso extremo'] },
    { id: 'style_versatility', name: 'Versatilidad de estilo', type: 'select', options: ['Estilo único', 'Pocos estilos', 'Versátil', 'Múltiples configuraciones'] },
    { id: 'temperature_range_jacket', name: 'Rango de temperatura', type: 'select', options: ['Templado únicamente', 'Fresco a templado', 'Frío a templado', 'Extremo frío'] }
  ],

  // Collares y lazos para mascotas
  'pets-products-collares-lazos': [
    { id: 'accessory_type_collar', name: 'Tipo de accesorio', type: 'select', options: ['Collar decorativo', 'Lazo/corbata', 'Pajarita', 'Collar con lazo', 'Set completo'] },
    { id: 'formality_level', name: 'Nivel de formalidad', type: 'select', options: ['Casual', 'Semi-formal', 'Formal', 'Muy formal'] },
    { id: 'occasion_suitability', name: 'Adecuado para ocasión', type: 'tags', options: ['Uso diario', 'Eventos especiales', 'Bodas', 'Fiestas', 'Fotografía', 'Múltiples ocasiones'] },
    { id: 'attachment_security', name: 'Seguridad de sujeción', type: 'select', options: ['Sujeción básica', 'Sujeción segura', 'Sujeción muy segura', 'Sistema de seguridad'] },
    { id: 'size_adjustability_collar', name: 'Ajustabilidad de tamaño', type: 'select', options: ['Talla fija', 'Ligeramente ajustable', 'Muy ajustable', 'Talla única ajustable'] },
    { id: 'material_luxury', name: 'Nivel de lujo del material', type: 'select', options: ['Básico', 'Estándar', 'Premium', 'Lujo'] },
    { id: 'color_coordination', name: 'Coordinación de colores', type: 'select', options: ['Color único', 'Dos colores', 'Múltiples colores', 'Sistema de coordinación'] },
    { id: 'maintenance_collar', name: 'Mantenimiento', type: 'select', options: ['Alto mantenimiento', 'Mantenimiento moderado', 'Bajo mantenimiento', 'Sin mantenimiento'] },
    { id: 'comfort_wear_collar', name: 'Comodidad de uso', type: 'select', options: ['Uso corto', 'Uso moderado', 'Uso prolongado', 'Uso continuo'] },
    { id: 'photo_readiness', name: 'Preparado para fotos', type: 'select', options: ['Básico', 'Fotogénico', 'Muy fotogénico', 'Perfecto para fotos'] }
  ],

  // Disfraces para mascotas
  'pets-products-disfraces': [
    { id: 'costume_theme', name: 'Tema del disfraz', type: 'select', options: ['Animales', 'Personajes de película', 'Profesiones', 'Objetos', 'Fantástico', 'Histórico'] },
    { id: 'complexity_level', name: 'Nivel de complejidad', type: 'select', options: ['Simple', 'Moderado', 'Complejo', 'Muy complejo'] },
    { id: 'piece_count', name: 'Cantidad de piezas', type: 'select', options: ['1 pieza', '2-3 piezas', '4-5 piezas', '6+ piezas'] },
    { id: 'comfort_duration', name: 'Duración de comodidad', type: 'select', options: ['Uso muy corto', 'Uso corto', 'Uso moderado', 'Uso prolongado'] },
    { id: 'realism_level', name: 'Nivel de realismo', type: 'select', options: ['Abstracto', 'Básico', 'Realista', 'Muy realista'] },
    { id: 'interactive_elements', name: 'Elementos interactivos', type: 'tags', options: ['Sin elementos', 'Sonidos', 'Luces', 'Movimiento', 'Múltiples elementos'] },
    { id: 'age_appropriateness', name: 'Apropiado para edad', type: 'select', options: ['Cachorros', 'Adultos jóvenes', 'Adultos', 'Seniors', 'Todas las edades'] },
    { id: 'event_specific', name: 'Específico para evento', type: 'tags', options: ['Halloween', 'Navidad', 'Carnaval', 'Cumpleaños', 'Fotografía', 'General'] },
    { id: 'recognition_factor', name: 'Factor de reconocimiento', type: 'select', options: ['Poco reconocible', 'Reconocible', 'Muy reconocible', 'Icónico'] },
    { id: 'safety_costume', name: 'Seguridad del disfraz', type: 'select', options: ['Requiere supervisión', 'Generalmente seguro', 'Muy seguro', 'Completamente seguro'] }
  ],

  // Gafas de sol para mascotas
  'pets-products-gafas-sol': [
    { id: 'uv_protection_level', name: 'Nivel de protección UV', type: 'select', options: ['Protección básica', 'UV-A', 'UV-B', 'Protección completa UV'] },
    { id: 'lens_type', name: 'Tipo de lente', type: 'select', options: ['Lente básico', 'Polarizado', 'Fotocromático', 'Espejo', 'Graduado'] },
    { id: 'frame_material_glasses', name: 'Material del marco', type: 'select', options: ['Plástico', 'Metal', 'Titanio', 'Material flexible', 'Materiales mixtos'] },
    { id: 'strap_security', name: 'Seguridad de correa', type: 'select', options: ['Sin correa', 'Correa básica', 'Correa ajustable', 'Sistema de sujeción múltiple'] },
    { id: 'comfort_fit_glasses', name: 'Ajuste cómodo', type: 'select', options: ['Ajuste básico', 'Buen ajuste', 'Muy cómodo', 'Ajuste perfecto'] },
    { id: 'lens_coverage', name: 'Cobertura de lente', type: 'select', options: ['Cobertura parcial', 'Cobertura estándar', 'Cobertura extendida', 'Cobertura completa'] },
    { id: 'style_glasses', name: 'Estilo', type: 'select', options: ['Deportivo', 'Casual', 'Fashion', 'Vintage', 'Futurista'] },
    { id: 'ventilation_glasses', name: 'Ventilación', type: 'select', options: ['Sin ventilación', 'Ventilación básica', 'Buena ventilación', 'Ventilación óptima'] },
    { id: 'impact_resistance', name: 'Resistencia al impacto', type: 'select', options: ['Resistencia básica', 'Resistencia estándar', 'Alta resistencia', 'Resistencia máxima'] },
    { id: 'prescription_compatibility', name: 'Compatibilidad con prescripción', type: 'select', options: ['No compatible', 'Parcialmente compatible', 'Compatible', 'Completamente adaptable'] }
  ],

  // Impermeables para mascotas
  'pets-products-impermeables': [
    { id: 'waterproof_rating', name: 'Calificación de impermeabilidad', type: 'select', options: ['Resistente a salpicaduras', 'Resistente al agua', 'Impermeable', 'Completamente impermeable'] },
    { id: 'breathability_rain', name: 'Transpirabilidad', type: 'select', options: ['No transpirable', 'Ligeramente transpirable', 'Bien transpirable', 'Muy transpirable'] },
    { id: 'coverage_area_rain', name: 'Área de cobertura', type: 'select', options: ['Torso únicamente', 'Torso y parte del abdomen', 'Cobertura extendida', 'Cobertura completa'] },
    { id: 'hood_rain', name: 'Capucha', type: 'select', options: ['Sin capucha', 'Capucha básica', 'Capucha ajustable', 'Capucha con visera'] },
    { id: 'seam_sealing', name: 'Sellado de costuras', type: 'select', options: ['Sin sellado', 'Sellado básico', 'Sellado completo', 'Sellado profesional'] },
    { id: 'mobility_rain', name: 'Movilidad bajo lluvia', type: 'select', options: ['Restricción alta', 'Restricción moderada', 'Buena movilidad', 'Movilidad completa'] },
    { id: 'quick_dry', name: 'Secado rápido', type: 'select', options: ['Secado lento', 'Secado normal', 'Secado rápido', 'Secado ultra-rápido'] },
    { id: 'wind_resistance_rain', name: 'Resistencia al viento', type: 'select', options: ['Sin resistencia', 'Resistencia básica', 'Buena resistencia', 'Resistencia máxima'] },
    { id: 'storage_rain', name: 'Almacenamiento', type: 'select', options: ['Voluminoso', 'Plegable', 'Compacto', 'Ultra-compacto'] },
    { id: 'visibility_rain', name: 'Visibilidad', type: 'select', options: ['Colores básicos', 'Colores brillantes', 'Elementos reflectantes', 'Alta visibilidad'] }
  ],

  // Jerséis para mascotas
  'pets-products-jerseis': [
    { id: 'knit_type', name: 'Tipo de tejido', type: 'select', options: ['Punto básico', 'Punto acanalado', 'Cable knit', 'Punto jacquard', 'Punto mixto'] },
    { id: 'yarn_weight', name: 'Peso del hilo', type: 'select', options: ['Muy fino', 'Fino', 'Medio', 'Grueso', 'Muy grueso'] },
    { id: 'warmth_rating_sweater', name: 'Calificación de calor', type: 'select', options: ['Calor ligero', 'Calor moderado', 'Muy cálido', 'Extremadamente cálido'] },
    { id: 'stretch_recovery', name: 'Recuperación de estiramiento', type: 'select', options: ['Poca recuperación', 'Recuperación moderada', 'Buena recuperación', 'Excelente recuperación'] },
    { id: 'cable_pattern', name: 'Patrón de cables', type: 'select', options: ['Sin cables', 'Cables simples', 'Cables complejos', 'Cables artísticos'] },
    { id: 'collar_style_sweater', name: 'Estilo de cuello', type: 'select', options: ['Cuello redondo', 'Cuello tortuga', 'Cuello en V', 'Cuello cruzado'] },
    { id: 'hem_finish', name: 'Acabado de dobladillo', type: 'select', options: ['Dobladillo básico', 'Dobladillo ribeteado', 'Dobladillo elástico', 'Dobladillo decorativo'] },
    { id: 'pilling_resistance', name: 'Resistencia al pilling', type: 'select', options: ['Baja resistencia', 'Resistencia moderada', 'Alta resistencia', 'Resistencia máxima'] },
    { id: 'care_complexity_sweater', name: 'Complejidad de cuidado', type: 'select', options: ['Cuidado complejo', 'Cuidado moderado', 'Cuidado fácil', 'Cuidado mínimo'] },
    { id: 'handmade_quality', name: 'Calidad artesanal', type: 'select', options: ['Producción masiva', 'Semi-artesanal', 'Artesanal', 'Hecho a mano premium'] }
  ],

  // Lazos y cintas para mascotas
  'pets-products-lazos-cintas': [
    { id: 'bow_size', name: 'Tamaño del lazo', type: 'select', options: ['Mini', 'Pequeño', 'Mediano', 'Grande', 'Extra grande'] },
    { id: 'ribbon_width', name: 'Ancho de cinta', type: 'select', options: ['Muy estrecho', 'Estrecho', 'Medio', 'Ancho', 'Muy ancho'] },
    { id: 'attachment_bow', name: 'Método de sujeción', type: 'select', options: ['Clip', 'Elástico', 'Adhesivo', 'Magnético', 'Cosido'] },
    { id: 'bow_shape', name: 'Forma del lazo', type: 'select', options: ['Clásico', 'Mariposa', 'Roseta', 'Múltiples lazos', 'Forma personalizada'] },
    { id: 'edge_finish_ribbon', name: 'Acabado de borde', type: 'select', options: ['Borde cortado', 'Borde sellado', 'Borde decorativo', 'Borde con encaje'] },
    { id: 'texture_ribbon', name: 'Textura de cinta', type: 'select', options: ['Lisa', 'Texturizada', 'Metálica', 'Terciopelo', 'Encaje'] },
    { id: 'seasonal_bow', name: 'Temática estacional', type: 'tags', options: ['Sin tema', 'Primavera', 'Verano', 'Otoño', 'Invierno', 'Fiestas'] },
    { id: 'durability_bow', name: 'Durabilidad', type: 'select', options: ['Uso único', 'Uso limitado', 'Uso regular', 'Uso prolongado'] },
    { id: 'color_fastness', name: 'Solidez del color', type: 'select', options: ['Decolora fácil', 'Decolora moderado', 'Color estable', 'Color permanente'] },
    { id: 'matching_set_availability', name: 'Disponibilidad de set', type: 'select', options: ['Pieza única', 'Set de 2', 'Set múltiple', 'Colección completa'] }
  ],

  // Pañuelos para mascotas
  'pets-products-panuelos': [
    { id: 'bandana_size', name: 'Tamaño del pañuelo', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'Ajustable'] },
    { id: 'bandana_shape', name: 'Forma del pañuelo', type: 'select', options: ['Triangular', 'Cuadrado', 'Rectangular', 'Forma personalizada'] },
    { id: 'tie_method', name: 'Método de anudado', type: 'select', options: ['Anudado tradicional', 'Velcro', 'Clip', 'Elástico', 'Múltiples opciones'] },
    { id: 'print_bandana', name: 'Estampado', type: 'select', options: ['Sólido', 'Patrón geométrico', 'Motivos animales', 'Texto', 'Personalizado'] },
    { id: 'reversible_bandana', name: 'Reversible', type: 'select', options: ['No reversible', 'Reversible', 'Doble diseño', 'Múltiples configuraciones'] },
    { id: 'absorbency_bandana', name: 'Capacidad absorbente', type: 'select', options: ['No absorbente', 'Ligeramente absorbente', 'Bien absorbente', 'Muy absorbente'] },
    { id: 'personalization_bandana', name: 'Personalización', type: 'select', options: ['Sin personalización', 'Nombre básico', 'Texto personalizado', 'Diseño completo'] },
    { id: 'holiday_theme_bandana', name: 'Temática de fiestas', type: 'tags', options: ['Sin tema', 'Navidad', 'Halloween', 'Día patrio', 'Cumpleaños', 'Múltiples temas'] },
    { id: 'fabric_bandana', name: 'Tipo de tela', type: 'select', options: ['Algodón básico', 'Algodón premium', 'Poliéster', 'Mezcla', 'Materiales especiales'] },
    { id: 'edge_treatment_bandana', name: 'Tratamiento de borde', type: 'select', options: ['Borde cortado', 'Borde cosido', 'Borde decorativo', 'Borde reforzado'] }
  ],

  // Sombreros para mascotas
  'pets-products-sombreros': [
    { id: 'hat_type', name: 'Tipo de sombrero', type: 'select', options: ['Gorra', 'Sombrero de ala', 'Boina', 'Gorro', 'Sombrero temático'] },
    { id: 'sun_protection_hat', name: 'Protección solar', type: 'select', options: ['Sin protección', 'Protección básica', 'Buena protección', 'Protección máxima'] },
    { id: 'ear_accommodation', name: 'Acomodación de orejas', type: 'select', options: ['Sin acomodación', 'Aberturas básicas', 'Aberturas ajustables', 'Diseño especial'] },
    { id: 'chin_strap', name: 'Correa de barbilla', type: 'select', options: ['Sin correa', 'Correa básica', 'Correa ajustable', 'Sistema de sujeción múltiple'] },
    { id: 'brim_size', name: 'Tamaño del ala', type: 'select', options: ['Sin ala', 'Ala pequeña', 'Ala mediana', 'Ala grande'] },
    { id: 'crown_height', name: 'Altura de copa', type: 'select', options: ['Copa baja', 'Copa media', 'Copa alta', 'Copa ajustable'] },
    { id: 'ventilation_hat', name: 'Ventilación', type: 'select', options: ['Sin ventilación', 'Ventilación básica', 'Buena ventilación', 'Ventilación máxima'] },
    { id: 'decorative_elements_hat', name: 'Elementos decorativos', type: 'tags', options: ['Sin decoración', 'Flores', 'Plumas', 'Broches', 'Bordado', 'Múltiples elementos'] },
    { id: 'stability_hat', name: 'Estabilidad', type: 'select', options: ['Se mueve fácil', 'Estabilidad básica', 'Bien estable', 'Muy estable'] },
    { id: 'occasion_hat', name: 'Ocasión de uso', type: 'tags', options: ['Uso diario', 'Eventos especiales', 'Playa', 'Fotografía', 'Cosplay', 'Múltiples ocasiones'] }
  ],

  // Sudaderas con capucha para mascotas
  'pets-products-sudaderas-capucha': [
    { id: 'hoodie_weight', name: 'Peso de sudadera', type: 'select', options: ['Peso ligero', 'Peso medio', 'Peso pesado', 'Peso extra pesado'] },
    { id: 'hood_functionality', name: 'Funcionalidad de capucha', type: 'select', options: ['Decorativa únicamente', 'Funcional básica', 'Totalmente funcional', 'Sistema avanzado'] },
    { id: 'drawstring_feature', name: 'Característica de cordón', type: 'select', options: ['Sin cordón', 'Cordón decorativo', 'Cordón funcional', 'Sistema de ajuste'] },
    { id: 'pocket_hoodie', name: 'Bolsillo canguro', type: 'select', options: ['Sin bolsillo', 'Bolsillo decorativo', 'Bolsillo funcional', 'Múltiples bolsillos'] },
    { id: 'fleece_lining', name: 'Forro polar', type: 'select', options: ['Sin forro', 'Forro ligero', 'Forro medio', 'Forro pesado'] },
    { id: 'ear_holes_hood', name: 'Agujeros para orejas', type: 'select', options: ['Sin agujeros', 'Agujeros básicos', 'Agujeros ajustables', 'Sistema de orejas'] },
    { id: 'zipper_hoodie', name: 'Cremallera', type: 'select', options: ['Sin cremallera', 'Cremallera parcial', 'Cremallera completa', 'Doble cremallera'] },
    { id: 'cuff_style_hoodie', name: 'Estilo de puños', type: 'select', options: ['Puños básicos', 'Puños ribeteados', 'Puños elásticos', 'Puños ajustables'] },
    { id: 'length_hoodie', name: 'Longitud', type: 'select', options: ['Longitud corta', 'Longitud media', 'Longitud larga', 'Longitud extra larga'] },
    { id: 'activity_hoodie', name: 'Actividad recomendada', type: 'tags', options: ['Descanso', 'Paseo casual', 'Ejercicio ligero', 'Todas las actividades'] }
  ],

  // Vestidos para mascotas
  'pets-products-vestidos': [
    { id: 'dress_length', name: 'Longitud del vestido', type: 'select', options: ['Mini', 'Corto', 'Medio', 'Largo', 'Extra largo'] },
    { id: 'dress_style', name: 'Estilo del vestido', type: 'select', options: ['A-line', 'Recto', 'Princesa', 'Vintage', 'Moderno'] },
    { id: 'sleeve_dress', name: 'Mangas', type: 'select', options: ['Sin mangas', 'Manga corta', 'Manga larga', 'Manga abullonada', 'Múltiples estilos'] },
    { id: 'embellishment_dress', name: 'Adornos', type: 'tags', options: ['Sin adornos', 'Encaje', 'Lentejuelas', 'Bordado', 'Perlas', 'Múltiples adornos'] },
    { id: 'neckline_dress', name: 'Escote', type: 'select', options: ['Cuello redondo', 'Cuello en V', 'Cuello halter', 'Sin cuello definido'] },
    { id: 'back_closure_dress', name: 'Cierre trasero', type: 'select', options: ['Sin cierre', 'Velcro', 'Cremallera', 'Botones', 'Lazos'] },
    { id: 'skirt_fullness', name: 'Amplitud de falda', type: 'select', options: ['Falda recta', 'Ligeramente amplia', 'Amplia', 'Muy amplia'] },
    { id: 'lining_dress', name: 'Forro', type: 'select', options: ['Sin forro', 'Forro parcial', 'Forro completo', 'Forro acolchado'] },
    { id: 'formal_level_dress', name: 'Nivel de formalidad', type: 'select', options: ['Casual', 'Semi-formal', 'Formal', 'Muy formal'] },
    { id: 'movement_dress', name: 'Libertad de movimiento', type: 'select', options: ['Restricción alta', 'Restricción moderada', 'Buena movilidad', 'Movilidad completa'] }
  ],

  // Zapatos para mascotas
  'pets-products-zapatos': [
    { id: 'shoe_type', name: 'Tipo de zapato', type: 'select', options: ['Botines', 'Zapatos deportivos', 'Botas altas', 'Sandalias', 'Zapatos formales'] },
    { id: 'sole_material', name: 'Material de suela', type: 'select', options: ['Goma básica', 'Goma resistente', 'Cuero', 'Sintético', 'Múltiples materiales'] },
    { id: 'traction_sole', name: 'Tracción de suela', type: 'select', options: ['Tracción básica', 'Buena tracción', 'Alta tracción', 'Tracción máxima'] },
    { id: 'waterproof_shoe', name: 'Impermeabilidad', type: 'select', options: ['No impermeable', 'Resistente a salpicaduras', 'Resistente al agua', 'Completamente impermeable'] },
    { id: 'closure_shoe', name: 'Sistema de cierre', type: 'select', options: ['Velcro', 'Cordones', 'Elástico', 'Cremallera', 'Sin cierre'] },
    { id: 'ankle_support', name: 'Soporte de tobillo', type: 'select', options: ['Sin soporte', 'Soporte ligero', 'Buen soporte', 'Soporte máximo'] },
    { id: 'toe_protection', name: 'Protección de dedos', type: 'select', options: ['Sin protección', 'Protección básica', 'Buena protección', 'Protección completa'] },
    { id: 'breathability_shoe', name: 'Transpirabilidad', type: 'select', options: ['No transpirable', 'Ligeramente transpirable', 'Bien transpirable', 'Muy transpirable'] },
    { id: 'terrain_suitability', name: 'Adecuado para terreno', type: 'tags', options: ['Interior', 'Pavimento', 'Césped', 'Tierra', 'Nieve', 'Múltiples terrenos'] },
    { id: 'break_in_period', name: 'Período de adaptación', type: 'select', options: ['Sin adaptación', 'Adaptación corta', 'Adaptación moderada', 'Adaptación larga'] }
  ],

  // Camas para mascotas (categoría general)
  'pets-products-camas': [
    { id: 'bed_size_pet', name: 'Tamaño de cama', type: 'select', options: ['XS (hasta 5kg)', 'S (5-15kg)', 'M (15-25kg)', 'L (25-45kg)', 'XL (45kg+)'] },
    { id: 'sleep_style_accommodation', name: 'Acomodación estilo de sueño', type: 'tags', options: ['Estirado', 'Enrollado', 'De lado', 'Boca abajo', 'Múltiples posiciones'] },
    { id: 'support_level_bed', name: 'Nivel de soporte', type: 'select', options: ['Suave', 'Medio', 'Firme', 'Extra firme'] },
    { id: 'temperature_regulation_bed', name: 'Regulación de temperatura', type: 'select', options: ['Sin regulación', 'Transpirable', 'Refrescante', 'Calentamiento', 'Adaptativo'] },
    { id: 'washability_bed', name: 'Lavabilidad', type: 'select', options: ['No lavable', 'Funda removible', 'Lavable completo', 'Lavable a máquina'] },
    { id: 'joint_support', name: 'Soporte articular', type: 'select', options: ['Sin soporte especial', 'Soporte básico', 'Soporte ortopédico', 'Soporte terapéutico'] },
    { id: 'edge_support', name: 'Soporte de bordes', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Bordes reforzados', 'Soporte perimetral completo'] },
    { id: 'durability_bed', name: 'Durabilidad', type: 'select', options: ['Uso ligero', 'Uso moderado', 'Uso intensivo', 'Uso extremo'] },
    { id: 'indoor_outdoor_bed', name: 'Uso interior/exterior', type: 'select', options: ['Solo interior', 'Principalmente interior', 'Ambos usos', 'Diseñado para exterior'] },
    { id: 'anxiety_relief', name: 'Alivio de ansiedad', type: 'select', options: ['Sin características especiales', 'Características calmantes', 'Diseño anti-ansiedad', 'Terapia de presión'] }
  ],

  // Camas con almohada
  'pets-products-camas-almohada': [
    { id: 'pillow_type', name: 'Tipo de almohada', type: 'select', options: ['Almohada integrada', 'Almohada removible', 'Múltiples almohadas', 'Almohada ajustable'] },
    { id: 'pillow_firmness', name: 'Firmeza de almohada', type: 'select', options: ['Muy suave', 'Suave', 'Media', 'Firme'] },
    { id: 'head_neck_support', name: 'Soporte cabeza/cuello', type: 'select', options: ['Soporte básico', 'Buen soporte', 'Soporte ergonómico', 'Soporte ortopédico'] },
    { id: 'pillow_material', name: 'Material de almohada', type: 'select', options: ['Fibra sintética', 'Espuma viscoelástica', 'Plumas', 'Gel', 'Materiales mixtos'] },
    { id: 'pillow_cover', name: 'Funda de almohada', type: 'select', options: ['Sin funda', 'Funda básica', 'Funda removible', 'Funda impermeable'] },
    { id: 'elevated_design', name: 'Diseño elevado', type: 'select', options: ['Al nivel del suelo', 'Ligeramente elevado', 'Moderadamente elevado', 'Altamente elevado'] },
    { id: 'pillow_positioning', name: 'Posicionamiento de almohada', type: 'select', options: ['Posición fija', 'Ligeramente ajustable', 'Totalmente ajustable', 'Múltiples configuraciones'] },
    { id: 'sleeping_position_support', name: 'Soporte posición de sueño', type: 'tags', options: ['Posición lateral', 'Posición ventral', 'Posición curled up', 'Todas las posiciones'] },
    { id: 'breathability_pillow', name: 'Transpirabilidad de almohada', type: 'select', options: ['Baja', 'Moderada', 'Alta', 'Máxima'] },
    { id: 'maintenance_pillow', name: 'Mantenimiento de almohada', type: 'select', options: ['Alto mantenimiento', 'Mantenimiento moderado', 'Bajo mantenimiento', 'Sin mantenimiento'] }
  ],

  // Camas de enfriamiento
  'pets-products-camas-enfriamiento': [
    { id: 'cooling_technology', name: 'Tecnología de enfriamiento', type: 'select', options: ['Gel refrigerante', 'Espuma con gel', 'Malla transpirable', 'Material phase-change', 'Múltiples tecnologías'] },
    { id: 'cooling_duration', name: 'Duración del enfriamiento', type: 'select', options: ['1-2 horas', '2-4 horas', '4-8 horas', '8+ horas'] },
    { id: 'activation_method', name: 'Método de activación', type: 'select', options: ['Auto-activación', 'Presión corporal', 'Refrigeración previa', 'Sin activación requerida'] },
    { id: 'temperature_reduction', name: 'Reducción de temperatura', type: 'select', options: ['1-3°C', '3-5°C', '5-8°C', '8°C+'] },
    { id: 'hot_weather_suitability', name: 'Adecuado para clima caliente', type: 'select', options: ['Clima templado', 'Clima cálido', 'Clima muy caliente', 'Clima extremo'] },
    { id: 'gel_distribution', name: 'Distribución del gel', type: 'select', options: ['Distribución básica', 'Distribución uniforme', 'Zonas específicas', 'Distribución adaptativa'] },
    { id: 'recharge_time', name: 'Tiempo de recarga', type: 'select', options: ['Sin recarga necesaria', '15-30 min', '30-60 min', '1+ hora'] },
    { id: 'cooling_zones', name: 'Zonas de enfriamiento', type: 'select', options: ['Enfriamiento uniforme', 'Zonas específicas', 'Enfriamiento gradual', 'Múltiples zonas'] },
    { id: 'summer_comfort', name: 'Comodidad verano', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'Excelente'] },
    { id: 'overheating_prevention', name: 'Prevención sobrecalentamiento', type: 'select', options: ['Prevención básica', 'Prevención efectiva', 'Prevención avanzada', 'Prevención máxima'] }
  ],

  // Camas de espuma
  'pets-products-camas-espuma': [
    { id: 'foam_type', name: 'Tipo de espuma', type: 'select', options: ['Espuma básica', 'Espuma de alta densidad', 'Espuma viscoelástica', 'Espuma de gel', 'Espuma híbrida'] },
    { id: 'foam_density', name: 'Densidad de espuma', type: 'select', options: ['Baja densidad', 'Densidad media', 'Alta densidad', 'Densidad variable'] },
    { id: 'pressure_relief', name: 'Alivio de presión', type: 'select', options: ['Alivio básico', 'Buen alivio', 'Alto alivio', 'Alivio máximo'] },
    { id: 'foam_firmness', name: 'Firmeza de espuma', type: 'select', options: ['Muy suave', 'Suave', 'Media', 'Firme', 'Muy firme'] },
    { id: 'contouring_ability', name: 'Capacidad de contorno', type: 'select', options: ['Sin contorno', 'Contorno básico', 'Buen contorno', 'Contorno perfecto'] },
    { id: 'recovery_time', name: 'Tiempo de recuperación', type: 'select', options: ['Recuperación lenta', 'Recuperación media', 'Recuperación rápida', 'Recuperación inmediata'] },
    { id: 'heat_retention', name: 'Retención de calor', type: 'select', options: ['Alta retención', 'Retención moderada', 'Baja retención', 'Sin retención'] },
    { id: 'foam_quality', name: 'Calidad de espuma', type: 'select', options: ['Calidad básica', 'Buena calidad', 'Alta calidad', 'Calidad premium'] },
    { id: 'thickness_foam', name: 'Grosor de espuma', type: 'select', options: ['Fino (2-5cm)', 'Medio (5-10cm)', 'Grueso (10-15cm)', 'Extra grueso (15cm+)'] },
    { id: 'motion_isolation', name: 'Aislamiento de movimiento', type: 'select', options: ['Sin aislamiento', 'Aislamiento básico', 'Buen aislamiento', 'Aislamiento completo'] }
  ],

  // Camas ortopédicas
  'pets-products-camas-ortopedicas': [
    { id: 'orthopedic_support_level', name: 'Nivel de soporte ortopédico', type: 'select', options: ['Soporte básico', 'Soporte moderado', 'Alto soporte', 'Soporte máximo'] },
    { id: 'joint_condition_target', name: 'Condición articular objetivo', type: 'tags', options: ['Artritis', 'Displasia de cadera', 'Problemas de columna', 'Lesiones', 'Prevención', 'Múltiples condiciones'] },
    { id: 'spine_alignment', name: 'Alineación de columna', type: 'select', options: ['Sin características especiales', 'Soporte básico', 'Alineación correcta', 'Alineación óptima'] },
    { id: 'hip_support', name: 'Soporte de cadera', type: 'select', options: ['Sin soporte específico', 'Soporte básico', 'Soporte especializado', 'Soporte terapéutico'] },
    { id: 'age_group_orthopedic', name: 'Grupo de edad', type: 'select', options: ['Cachorros', 'Adultos jóvenes', 'Adultos mayores', 'Seniors', 'Todas las edades'] },
    { id: 'medical_grade', name: 'Grado médico', type: 'select', options: ['No médico', 'Grado veterinario', 'Grado médico', 'Grado hospitalario'] },
    { id: 'therapeutic_benefits', name: 'Beneficios terapéuticos', type: 'tags', options: ['Alivio dolor', 'Mejora circulación', 'Reducción inflamación', 'Recuperación', 'Múltiples beneficios'] },
    { id: 'vet_recommended', name: 'Recomendado por veterinario', type: 'select', options: ['No recomendado', 'Ocasionalmente recomendado', 'Frecuentemente recomendado', 'Altamente recomendado'] },
    { id: 'recovery_support', name: 'Soporte de recuperación', type: 'select', options: ['Sin soporte especial', 'Soporte básico', 'Soporte de recuperación', 'Soporte post-quirúrgico'] },
    { id: 'mobility_improvement', name: 'Mejora de movilidad', type: 'select', options: ['Sin mejora específica', 'Mejora ligera', 'Mejora notable', 'Mejora significativa'] }
  ],

  // Camas radiador
  'pets-products-camas-radiador': [
    { id: 'heating_source', name: 'Fuente de calentamiento', type: 'select', options: ['Radiador tradicional', 'Calefacción central', 'Calefactor eléctrico', 'Múltiples fuentes'] },
    { id: 'attachment_method_radiator', name: 'Método de fijación', type: 'select', options: ['Clips', 'Ganchos', 'Velcro', 'Magnético', 'Sistema múltiple'] },
    { id: 'heat_distribution', name: 'Distribución de calor', type: 'select', options: ['Distribución básica', 'Distribución uniforme', 'Zonas específicas', 'Distribución óptima'] },
    { id: 'temperature_control_radiator', name: 'Control de temperatura', type: 'select', options: ['Sin control', 'Control básico', 'Termostato', 'Control inteligente'] },
    { id: 'safety_radiator', name: 'Seguridad', type: 'select', options: ['Seguridad básica', 'Seguridad estándar', 'Alta seguridad', 'Seguridad máxima'] },
    { id: 'installation_ease', name: 'Facilidad de instalación', type: 'select', options: ['Instalación compleja', 'Instalación moderada', 'Instalación fácil', 'Instalación inmediata'] },
    { id: 'radiator_compatibility', name: 'Compatibilidad radiador', type: 'select', options: ['Radiadores específicos', 'Mayoría de radiadores', 'Radiadores estándar', 'Radiadores universales'] },
    { id: 'heat_efficiency', name: 'Eficiencia de calor', type: 'select', options: ['Eficiencia básica', 'Buena eficiencia', 'Alta eficiencia', 'Máxima eficiencia'] },
    { id: 'winter_comfort', name: 'Comodidad invernal', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'Excelente'] },
    { id: 'space_utilization', name: 'Utilización del espacio', type: 'select', options: ['Uso básico', 'Buen uso', 'Uso eficiente', 'Uso óptimo'] }
  ],

  // Cestas
  'pets-products-cestas': [
    { id: 'basket_material', name: 'Material de cesta', type: 'select', options: ['Mimbre natural', 'Ratán', 'Plástico', 'Metal', 'Tela', 'Materiales mixtos'] },
    { id: 'basket_style', name: 'Estilo de cesta', type: 'select', options: ['Tradicional', 'Moderno', 'Rústico', 'Elegante', 'Minimalista'] },
    { id: 'cushion_included', name: 'Cojín incluido', type: 'select', options: ['Sin cojín', 'Cojín básico', 'Cojín removible', 'Múltiples cojines'] },
    { id: 'ventilation_basket', name: 'Ventilación', type: 'select', options: ['Ventilación limitada', 'Ventilación básica', 'Buena ventilación', 'Ventilación excelente'] },
    { id: 'portability_basket', name: 'Portabilidad', type: 'select', options: ['No portátil', 'Parcialmente portátil', 'Portátil', 'Muy portátil'] },
    { id: 'basket_height', name: 'Altura de cesta', type: 'select', options: ['Baja', 'Media', 'Alta', 'Ajustable'] },
    { id: 'entry_ease', name: 'Facilidad de entrada', type: 'select', options: ['Entrada difícil', 'Entrada moderada', 'Entrada fácil', 'Entrada muy fácil'] },
    { id: 'durability_basket', name: 'Durabilidad', type: 'select', options: ['Delicada', 'Durabilidad básica', 'Duradera', 'Muy duradera'] },
    { id: 'cleaning_basket', name: 'Facilidad de limpieza', type: 'select', options: ['Difícil de limpiar', 'Limpieza moderada', 'Fácil de limpiar', 'Muy fácil de limpiar'] },
    { id: 'decorative_value', name: 'Valor decorativo', type: 'select', options: ['Funcional únicamente', 'Ligeramente decorativo', 'Decorativo', 'Altamente decorativo'] }
  ],

  // Cuevas
  'pets-products-cuevas': [
    { id: 'cave_opening_size', name: 'Tamaño de abertura', type: 'select', options: ['Abertura pequeña', 'Abertura mediana', 'Abertura grande', 'Abertura ajustable'] },
    { id: 'enclosure_level', name: 'Nivel de encerramiento', type: 'select', options: ['Parcialmente cerrado', 'Mayormente cerrado', 'Completamente cerrado', 'Variable'] },
    { id: 'anxiety_relief_cave', name: 'Alivio de ansiedad', type: 'select', options: ['Alivio básico', 'Buen alivio', 'Alto alivio', 'Máximo alivio'] },
    { id: 'privacy_level_cave', name: 'Nivel de privacidad', type: 'select', options: ['Privacidad básica', 'Buena privacidad', 'Alta privacidad', 'Privacidad completa'] },
    { id: 'cave_shape', name: 'Forma de cueva', type: 'select', options: ['Redonda', 'Ovalada', 'Cuadrada', 'Forma natural', 'Forma personalizada'] },
    { id: 'interior_space', name: 'Espacio interior', type: 'select', options: ['Compacto', 'Estándar', 'Espacioso', 'Extra espacioso'] },
    { id: 'cave_stability', name: 'Estabilidad', type: 'select', options: ['Poco estable', 'Estabilidad básica', 'Bien estable', 'Muy estable'] },
    { id: 'temperature_retention_cave', name: 'Retención de temperatura', type: 'select', options: ['Sin retención', 'Retención básica', 'Buena retención', 'Excelente retención'] },
    { id: 'den_instinct_satisfaction', name: 'Satisfacción instinto de madriguera', type: 'select', options: ['Satisfacción básica', 'Buena satisfacción', 'Alta satisfacción', 'Satisfacción completa'] },
    { id: 'security_feeling', name: 'Sensación de seguridad', type: 'select', options: ['Seguridad básica', 'Buena seguridad', 'Alta seguridad', 'Máxima seguridad'] }
  ],

  // Cunas para mascotas
  'pets-products-cunas': [
    { id: 'crib_size', name: 'Tamaño de cuna', type: 'select', options: ['Muy pequeña', 'Pequeña', 'Mediana', 'Grande'] },
    { id: 'elevated_design_crib', name: 'Diseño elevado', type: 'select', options: ['Al nivel del suelo', 'Ligeramente elevado', 'Moderadamente elevado', 'Altamente elevado'] },
    { id: 'side_walls', name: 'Paredes laterales', type: 'select', options: ['Sin paredes', 'Paredes bajas', 'Paredes medianas', 'Paredes altas'] },
    { id: 'crib_mobility', name: 'Movilidad de cuna', type: 'select', options: ['Fija', 'Semicportátil', 'Portátil', 'Muy portátil'] },
    { id: 'newborn_suitability', name: 'Adecuado para recién nacidos', type: 'select', options: ['No adecuado', 'Parcialmente adecuado', 'Adecuado', 'Ideal'] },
    { id: 'growth_accommodation', name: 'Acomodación de crecimiento', type: 'select', options: ['Tamaño fijo', 'Ligeramente expandible', 'Expandible', 'Totalmente ajustable'] },
    { id: 'safety_crib', name: 'Seguridad', type: 'select', options: ['Seguridad básica', 'Buena seguridad', 'Alta seguridad', 'Máxima seguridad'] },
    { id: 'bedding_included_crib', name: 'Ropa de cama incluida', type: 'select', options: ['Sin ropa de cama', 'Ropa básica', 'Ropa completa', 'Set completo'] },
    { id: 'supervision_level', name: 'Nivel de supervisión requerido', type: 'select', options: ['Supervisión constante', 'Supervisión frecuente', 'Supervisión ocasional', 'Supervisión mínima'] },
    { id: 'maternal_comfort', name: 'Comodidad maternal', type: 'select', options: ['Básica', 'Buena', 'Muy buena', 'Excelente'] }
  ],

  // Donuts
  'pets-products-donuts': [
    { id: 'donut_diameter', name: 'Diámetro del donut', type: 'select', options: ['Pequeño (40-60cm)', 'Mediano (60-80cm)', 'Grande (80-100cm)', 'Extra grande (100cm+)'] },
    { id: 'raised_rim_height', name: 'Altura del borde elevado', type: 'select', options: ['Borde bajo', 'Borde medio', 'Borde alto', 'Borde extra alto'] },
    { id: 'rim_firmness', name: 'Firmeza del borde', type: 'select', options: ['Muy suave', 'Suave', 'Firme', 'Muy firme'] },
    { id: 'center_depression', name: 'Depresión central', type: 'select', options: ['Depresión mínima', 'Depresión moderada', 'Depresión profunda', 'Depresión variable'] },
    { id: 'curling_support', name: 'Soporte para acurrucarse', type: 'select', options: ['Soporte básico', 'Buen soporte', 'Alto soporte', 'Soporte perfecto'] },
    { id: 'head_rest_capability', name: 'Capacidad de reposacabezas', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Buen soporte', 'Soporte ergonómico'] },
    { id: 'anxiety_calming', name: 'Efecto calmante ansiedad', type: 'select', options: ['Efecto mínimo', 'Efecto moderado', 'Buen efecto', 'Efecto máximo'] },
    { id: 'filling_distribution', name: 'Distribución del relleno', type: 'select', options: ['Distribución básica', 'Distribución uniforme', 'Distribución estratégica', 'Distribución óptima'] },
    { id: 'shape_retention', name: 'Retención de forma', type: 'select', options: ['Retención básica', 'Buena retención', 'Alta retención', 'Retención permanente'] },
    { id: 'sleeping_position_donut', name: 'Posición de sueño soportada', type: 'tags', options: ['Acurrucado', 'Lateral', 'Circular', 'Múltiples posiciones'] }
  ],

  // Hamacas
  'pets-products-hamacas': [
    { id: 'suspension_method', name: 'Método de suspensión', type: 'select', options: ['Clips', 'Ganchos', 'Correas', 'Sistema integrado', 'Múltiples métodos'] },
    { id: 'hammock_material', name: 'Material de hamaca', type: 'select', options: ['Lona', 'Malla', 'Tela resistente', 'Material transpirable', 'Materiales mixtos'] },
    { id: 'weight_capacity_hammock', name: 'Capacidad de peso', type: 'select', options: ['Hasta 5kg', 'Hasta 15kg', 'Hasta 30kg', '30kg+'] },
    { id: 'height_adjustment_hammock', name: 'Ajuste de altura', type: 'select', options: ['Altura fija', 'Ligeramente ajustable', 'Muy ajustable', 'Completamente ajustable'] },
    { id: 'installation_location', name: 'Ubicación de instalación', type: 'tags', options: ['Entre muebles', 'En esquinas', 'Jaulas', 'Paredes', 'Múltiples ubicaciones'] },
    { id: 'cooling_effect_hammock', name: 'Efecto refrescante', type: 'select', options: ['Sin efecto', 'Efecto ligero', 'Buen efecto', 'Efecto máximo'] },
    { id: 'sway_stability', name: 'Estabilidad del balanceo', type: 'select', options: ['Muy inestable', 'Ligeramente inestable', 'Estable', 'Muy estable'] },
    { id: 'space_efficiency', name: 'Eficiencia del espacio', type: 'select', options: ['Uso básico', 'Buen uso', 'Uso eficiente', 'Uso óptimo'] },
    { id: 'observation_advantage', name: 'Ventaja de observación', type: 'select', options: ['Sin ventaja', 'Ventaja básica', 'Buena ventaja', 'Ventaja máxima'] },
    { id: 'multi_pet_use', name: 'Uso múltiples mascotas', type: 'select', options: ['Una mascota', 'Ocasionalmente múltiples', 'Diseñado para múltiples', 'Ideal para múltiples'] }
  ],

  // Nidos
  'pets-products-nidos': [
    { id: 'nest_depth', name: 'Profundidad del nido', type: 'select', options: ['Superficial', 'Moderada', 'Profunda', 'Muy profunda'] },
    { id: 'nest_shape', name: 'Forma del nido', type: 'select', options: ['Redondo', 'Ovalado', 'Cuadrado', 'Forma natural', 'Forma irregular'] },
    { id: 'wall_height_nest', name: 'Altura de paredes', type: 'select', options: ['Paredes bajas', 'Paredes medianas', 'Paredes altas', 'Paredes variables'] },
    { id: 'nesting_instinct', name: 'Satisfacción instinto de nidificación', type: 'select', options: ['Satisfacción básica', 'Buena satisfacción', 'Alta satisfacción', 'Satisfacción completa'] },
    { id: 'maternal_behavior', name: 'Apoyo comportamiento maternal', type: 'select', options: ['Sin apoyo especial', 'Apoyo básico', 'Buen apoyo', 'Apoyo completo'] },
    { id: 'nest_lining', name: 'Forro del nido', type: 'select', options: ['Sin forro', 'Forro básico', 'Forro suave', 'Forro premium'] },
    { id: 'protection_level_nest', name: 'Nivel de protección', type: 'select', options: ['Protección mínima', 'Protección básica', 'Buena protección', 'Protección máxima'] },
    { id: 'warmth_retention_nest', name: 'Retención de calor', type: 'select', options: ['Sin retención especial', 'Retención básica', 'Buena retención', 'Retención máxima'] },
    { id: 'puppy_kitten_safe', name: 'Seguro para cachorros/gatitos', type: 'select', options: ['Requiere supervisión', 'Generalmente seguro', 'Muy seguro', 'Completamente seguro'] },
    { id: 'easy_access_nest', name: 'Fácil acceso', type: 'select', options: ['Acceso difícil', 'Acceso moderado', 'Fácil acceso', 'Acceso muy fácil'] }
  ],

  // Sillas para mascotas
  'pets-products-sillas': [
    { id: 'chair_style', name: 'Estilo de silla', type: 'select', options: ['Silla básica', 'Sillón', 'Silla reclinable', 'Silla ergonómica', 'Silla temática'] },
    { id: 'back_support_chair', name: 'Soporte de espalda', type: 'select', options: ['Sin soporte', 'Soporte básico', 'Buen soporte', 'Soporte ergonómico'] },
    { id: 'armrest_feature', name: 'Característica de reposabrazos', type: 'select', options: ['Sin reposabrazos', 'Reposabrazos fijos', 'Reposabrazos ajustables', 'Reposabrazos acolchados'] },
    { id: 'elevated_seating', name: 'Asiento elevado', type: 'select', options: ['Nivel del suelo', 'Ligeramente elevado', 'Moderadamente elevado', 'Altamente elevado'] },
    { id: 'chair_mobility', name: 'Movilidad de silla', type: 'select', options: ['Fija', 'Semi-portátil', 'Portátil', 'Muy portátil'] },
    { id: 'dignity_enhancement', name: 'Mejora de dignidad', type: 'select', options: ['Sin mejora especial', 'Mejora básica', 'Buena mejora', 'Mejora máxima'] },
    { id: 'senior_pet_support', name: 'Soporte para mascotas seniors', type: 'select', options: ['No específico', 'Parcialmente adecuado', 'Adecuado', 'Ideal'] },
    { id: 'chair_cushioning', name: 'Acolchado de silla', type: 'select', options: ['Sin acolchado', 'Acolchado básico', 'Buen acolchado', 'Acolchado premium'] },
    { id: 'viewing_height', name: 'Altura de visualización', type: 'select', options: ['Altura baja', 'Altura media', 'Altura alta', 'Altura ajustable'] },
    { id: 'stability_chair', name: 'Estabilidad', type: 'select', options: ['Poco estable', 'Estabilidad básica', 'Bien estable', 'Muy estable'] }
  ],

  // Torres
  'pets-products-torres': [
    { id: 'tower_height', name: 'Altura de torre', type: 'select', options: ['Baja (50-100cm)', 'Media (100-150cm)', 'Alta (150-200cm)', 'Muy alta (200cm+)'] },
    { id: 'level_count', name: 'Número de niveles', type: 'select', options: ['2 niveles', '3 niveles', '4 niveles', '5+ niveles'] },
    { id: 'climbing_features', name: 'Características para trepar', type: 'tags', options: ['Escalones', 'Rampas', 'Postes', 'Plataformas', 'Múltiples características'] },
    { id: 'activity_centers', name: 'Centros de actividad', type: 'tags', options: ['Área de descanso', 'Área de juego', 'Rascadores', 'Juguetes', 'Múltiples centros'] },
    { id: 'base_stability_tower', name: 'Estabilidad de base', type: 'select', options: ['Base ligera', 'Base estándar', 'Base pesada', 'Base ultra-estable'] },
    { id: 'multi_pet_capacity', name: 'Capacidad múltiples mascotas', type: 'select', options: ['Una mascota', '2 mascotas', '3-4 mascotas', '5+ mascotas'] },
    { id: 'vertical_space_usage', name: 'Uso del espacio vertical', type: 'select', options: ['Uso básico', 'Buen uso', 'Uso eficiente', 'Uso óptimo'] },
    { id: 'assembly_complexity_tower', name: 'Complejidad de ensamble', type: 'select', options: ['Ensamble simple', 'Ensamble moderado', 'Ensamble complejo', 'Ensamble profesional'] },
    { id: 'modular_expansion', name: 'Expansión modular', type: 'select', options: ['Sin expansión', 'Expansión limitada', 'Buena expansión', 'Expansión completa'] },
    { id: 'entertainment_value', name: 'Valor de entretenimiento', type: 'select', options: ['Entretenimiento básico', 'Buen entretenimiento', 'Alto entretenimiento', 'Máximo entretenimiento'] }
  ]
}