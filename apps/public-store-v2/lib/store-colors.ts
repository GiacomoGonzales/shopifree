/**
 * 🚀 OPTIMIZACIÓN FASE 2: Code Splitting
 * Archivo separado para la lógica de colores de la tienda
 * Este código solo se carga cuando es necesario (lazy loading)
 */

// Función para calcular el color de texto con mejor contraste
// Siempre retorna blanco para mantener consistencia visual
function getTextColorForBackground(backgroundColor: string): string {
  return '#ffffff';
}

// Función auxiliar para oscurecer un color
function darkenColor(color: string, amount: number): string {
  // Si el color viene en formato hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const darkenedR = Math.floor(r * (1 - amount));
    const darkenedG = Math.floor(g * (1 - amount));
    const darkenedB = Math.floor(b * (1 - amount));

    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  }

  // Si no es hex, devolver el color original
  return color;
}

// Función auxiliar para aclarar un color
function lightenColor(color: string, amount: number): string {
  // Si el color viene en formato hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const lightenedR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const lightenedG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const lightenedB = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `#${lightenedR.toString(16).padStart(2, '0')}${lightenedG.toString(16).padStart(2, '0')}${lightenedB.toString(16).padStart(2, '0')}`;
  }

  // Si no es hex, devolver el color original
  return color;
}

// Función para aplicar colores dinámicos de la tienda al tema
export function applyStoreColors(primaryColor: string, secondaryColor?: string): void {
  if (typeof document === 'undefined') return; // SSR safety

  // Aplicar color primario como color de éxito (newsletters, botones, etc.)
  if (primaryColor) {
    console.log(`🎨 Applying primary color: ${primaryColor}`);

    // Generar variaciones del color primario
    const lighterColor = lightenColor(primaryColor, 0.1);
    const darkerColor = darkenColor(primaryColor, 0.2);
    const muchDarkerColor = darkenColor(primaryColor, 0.4);

    // Aplicar el color primario y sus variaciones
    document.documentElement.style.setProperty('--nbd-success', primaryColor);
    document.documentElement.style.setProperty('--nbd-success-light', lighterColor);
    document.documentElement.style.setProperty('--nbd-success-dark', darkerColor);
    document.documentElement.style.setProperty('--nbd-success-darker', muchDarkerColor);

    // CALCULAR COLOR DE TEXTO CON MEJOR CONTRASTE
    const primaryTextColor = getTextColorForBackground(primaryColor);
    const secondaryTextColor = getTextColorForBackground(darkerColor);

    // APLICAR VARIABLES CSS PRINCIPALES para botones, selectores de variantes, etc.
    document.documentElement.style.setProperty('--nbd-primary', primaryColor);
    document.documentElement.style.setProperty('--nbd-primary-color', primaryColor);
    document.documentElement.style.setProperty('--nbd-primary-dark', darkerColor);
    document.documentElement.style.setProperty('--nbd-secondary', darkerColor);

    // APLICAR COLORES DE TEXTO DINÁMICOS CON CONTRASTE AUTOMÁTICO
    document.documentElement.style.setProperty('--nbd-primary-text', primaryTextColor);
    document.documentElement.style.setProperty('--nbd-secondary-text', secondaryTextColor);
    console.log(`✨ Auto-contrast text colors: primary-text=${primaryTextColor}, secondary-text=${secondaryTextColor}`);

    // CONVERTIR COLORES A RGB PARA USAR CON rgba()
    const hexToRgb = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length !== 6) return '0, 0, 0'; // fallback
      const r = parseInt(cleanHex.slice(0, 2), 16);
      const g = parseInt(cleanHex.slice(2, 4), 16);
      const b = parseInt(cleanHex.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    };

    document.documentElement.style.setProperty('--nbd-primary-rgb', hexToRgb(primaryColor));
    document.documentElement.style.setProperty('--nbd-secondary-rgb', hexToRgb(darkerColor));
    console.log(`🎨 RGB values set: primary-rgb=${hexToRgb(primaryColor)}, secondary-rgb=${hexToRgb(darkerColor)}`);

    // APLICAR VARIABLES CSS PARA NEWSLETTER basadas en el color secundario
    if (secondaryColor) {
      const newsletterDark = darkenColor(secondaryColor, 0.4);
      const newsletterDarker = darkenColor(secondaryColor, 0.6);

      document.documentElement.style.setProperty('--nbd-newsletter-dark', newsletterDark);
      document.documentElement.style.setProperty('--nbd-newsletter-darker', newsletterDarker);
      console.log(`📧 Newsletter gradient colors set: dark=${newsletterDark}, darker=${newsletterDarker} (based on secondary: ${secondaryColor})`);

      // APLICAR VARIABLES CSS PARA CHECKOUT basadas en el color secundario
      const checkoutLight = lightenColor(secondaryColor, 0.1);
      const checkoutDark = darkenColor(secondaryColor, 0.2);

      document.documentElement.style.setProperty('--nbd-checkout-primary', secondaryColor);
      document.documentElement.style.setProperty('--nbd-checkout-light', checkoutLight);
      document.documentElement.style.setProperty('--nbd-checkout-dark', checkoutDark);
      console.log(`🛒 Checkout colors set: primary=${secondaryColor}, light=${checkoutLight}, dark=${checkoutDark} (based on secondary color)`);
    }

    console.log(`🎨 CSS Variables set: --nbd-primary=${primaryColor}, --nbd-secondary=${darkerColor}`);

    // APLICAR COLOR PRIMARIO DIRECTAMENTE AL DROPDOWN ACTIVO
    const applyDropdownColors = () => {
      const activeDropdownOptions = document.querySelectorAll('.nbd-dropdown-option--active') as NodeListOf<HTMLElement>;
      activeDropdownOptions.forEach(option => {
        option.style.setProperty('background', primaryColor, 'important');
        option.style.setProperty('background-color', primaryColor, 'important');
        option.style.setProperty('color', primaryTextColor, 'important'); // Color dinámico con contraste
      });
    };

    // Aplicar inmediatamente
    applyDropdownColors();

    // Detectar cuando se hace clic en el botón de ordenar para aplicar colores
    const observeDropdownClicks = () => {
      const sortButtons = document.querySelectorAll('.nbd-control-btn') as NodeListOf<HTMLElement>;
      sortButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Aplicar colores después de que se abra el dropdown
          setTimeout(applyDropdownColors, 50);
          setTimeout(applyDropdownColors, 200);
        });
      });
    };

    // Observer para detectar cuando aparece el dropdown
    const dropdownObserver = new MutationObserver(() => {
      applyDropdownColors();
    });

    // Observar cambios en el documento para detectar el dropdown
    dropdownObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Aplicar cuando se abra el dropdown
    setTimeout(applyDropdownColors, 100);
    setTimeout(applyDropdownColors, 500);
    setTimeout(observeDropdownClicks, 1000);

    // SOLUCIÓN MEJORADA: Aplicar estilos a selectores de variantes con limpieza previa
    const applyVariantColors = () => {
      // PRIMERO: Limpiar TODOS los estilos inline de variantes (EXCEPTO variantes con precios)
      const allVariants = document.querySelectorAll('.nbd-variant-option:not(.nbd-variant-option--pricing)') as NodeListOf<HTMLElement>;
      allVariants.forEach(variant => {
        variant.style.removeProperty('background-color');
        variant.style.removeProperty('border-color');
        variant.style.removeProperty('color');
      });

      // SEGUNDO: Aplicar estilos solo a elementos seleccionados (EXCEPTO variantes con precios)
      const selectedVariants = document.querySelectorAll('.nbd-variant-option--selected:not(.nbd-variant-option--pricing)') as NodeListOf<HTMLElement>;
      selectedVariants.forEach(variant => {
        variant.style.setProperty('background-color', primaryColor, 'important');
        variant.style.setProperty('border-color', primaryColor, 'important');
        variant.style.setProperty('color', 'white', 'important');
      });

      // Observer mejorado para nuevas selecciones (EXCEPTO variantes con precios)
      const handleVariantClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('nbd-variant-option') && !target.classList.contains('nbd-variant-option--pricing')) {
          // Pequeño delay para que la clase --selected se aplique primero
          setTimeout(() => {
            // Limpiar TODOS los elementos de la misma variante
            const parentGroup = target.closest('.nbd-variant-group');
            if (parentGroup) {
              const siblingVariants = parentGroup.querySelectorAll('.nbd-variant-option:not(.nbd-variant-option--pricing)') as NodeListOf<HTMLElement>;
              siblingVariants.forEach(sibling => {
                sibling.style.removeProperty('background-color');
                sibling.style.removeProperty('border-color');
                sibling.style.removeProperty('color');
              });
            }

            // Aplicar estilo solo al seleccionado
            if (target.classList.contains('nbd-variant-option--selected')) {
              target.style.setProperty('background-color', primaryColor, 'important');
              target.style.setProperty('border-color', primaryColor, 'important');
              target.style.setProperty('color', 'white', 'important');
                    }
          }, 10);
        }
      };

      // Remover listeners existentes y agregar uno nuevo
      document.removeEventListener('click', handleVariantClick);
      document.addEventListener('click', handleVariantClick);
    };

    // Aplicar inmediatamente y después de un delay
    applyVariantColors();
    setTimeout(applyVariantColors, 100);

    // APLICAR COLOR DINÁMICO A TEXTURAS DE FONDO
    const applyTextureColors = () => {
      // Usar el color secundario real de la tienda, no el calculado
      const realSecondaryColor = secondaryColor || darkerColor;

      // Validar que tenemos un color válido
      if (!realSecondaryColor || !realSecondaryColor.startsWith('#')) {
        return;
      }

      // Convertir color secundario a rgba con opacidad aumentada
      const hexToRgba = (hex: string, opacity: number) => {
        const cleanHex = hex.replace('#', '');
        if (cleanHex.length !== 6) {
          return `rgba(0, 0, 0, ${opacity})`; // fallback
        }
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

      // Crear SVGs dinámicos con el color de la tienda
      const colorHex = realSecondaryColor.replace('#', '%23');

      // Crear estilos dinámicos para cada textura con el color secundario
      const dynamicStyles = `
        /* Texturas con color secundario dinámico */
        .texture-subtle-dots {
          background-image: radial-gradient(circle, ${hexToRgba(realSecondaryColor, 0.04)} 1px, transparent 1px) !important;
        }

        .texture-geometric-grid {
          background-image:
            linear-gradient(${hexToRgba(realSecondaryColor, 0.035)} 1px, transparent 1px),
            linear-gradient(90deg, ${hexToRgba(realSecondaryColor, 0.035)} 1px, transparent 1px) !important;
        }

        .texture-organic-waves {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }

        .texture-diagonal-lines {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            ${hexToRgba(realSecondaryColor, 0.025)} 8px,
            ${hexToRgba(realSecondaryColor, 0.025)} 10px
          ) !important;
        }

        .texture-fabric-weave {
          background-image:
            linear-gradient(45deg, ${hexToRgba(realSecondaryColor, 0.02)} 25%, transparent 25%),
            linear-gradient(-45deg, ${hexToRgba(realSecondaryColor, 0.02)} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${hexToRgba(realSecondaryColor, 0.02)} 75%),
            linear-gradient(-45deg, transparent 75%, ${hexToRgba(realSecondaryColor, 0.02)} 75%) !important;
        }

        .texture-hexagon-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.035'%3E%3Cpath d='M20 0l15.5 9v18L20 36 4.5 27V9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }

        .texture-floating-bubbles {
          background-image:
            radial-gradient(circle at 20% 30%, ${hexToRgba(realSecondaryColor, 0.025)} 2px, transparent 2px),
            radial-gradient(circle at 60% 70%, ${hexToRgba(realSecondaryColor, 0.035)} 3px, transparent 3px),
            radial-gradient(circle at 40% 90%, ${hexToRgba(realSecondaryColor, 0.02)} 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, ${hexToRgba(realSecondaryColor, 0.03)} 2px, transparent 2px) !important;
        }

        .texture-asymmetric-waves {
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.025'%3E%3Cpath d='M0 40c8-12 20-8 25-2s18 8 25-2 12-18 25-15c8 2 15 12 5 20-8 6-18 2-25 8s-15 12-25 5c-8-5-12-15-5-20 5-3 12 1 15-8s-8-15-15-10c-5 3-8 12-15 8s-10-15-10-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }

        .texture-scattered-leaves {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${colorHex}' fill-opacity='0.028'%3E%3Cpath d='M15 25c3-8 12-5 8 2-2 4-8 3-8-2zm35 10c5-6 10-2 6 4-3 4-8 1-6-4zm60 15c4-7 11-3 7 3-3 4-9 2-7-3zm20 35c6-5 9 0 5 5-3 3-8 1-5-5zm45 20c3-6 8-2 5 3-2 3-7 1-5-3z'/%3E%3Cpath d='M25 60c-2 5-8 3-6-2 1-3 6-2 6 2zm70 5c-3 6-9 2-6-3 2-3 7-1 6 3zm10 25c-4 4-8 0-5-4 2-2 6-1 5 4zm55 10c-2 4-6 1-4-2 1-2 5-1 4 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }

        .texture-paper-texture {
          background-image:
            radial-gradient(circle at 25% 25%, ${hexToRgba(realSecondaryColor, 0.015)} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${hexToRgba(realSecondaryColor, 0.02)} 0.5px, transparent 0.5px),
            linear-gradient(0deg, transparent 24%, ${hexToRgba(realSecondaryColor, 0.008)} 25%, ${hexToRgba(realSecondaryColor, 0.008)} 26%, transparent 27%, transparent 74%, ${hexToRgba(realSecondaryColor, 0.008)} 75%, ${hexToRgba(realSecondaryColor, 0.008)} 76%, transparent 77%),
            linear-gradient(90deg, transparent 24%, ${hexToRgba(realSecondaryColor, 0.008)} 25%, ${hexToRgba(realSecondaryColor, 0.008)} 26%, transparent 27%, transparent 74%, ${hexToRgba(realSecondaryColor, 0.008)} 75%, ${hexToRgba(realSecondaryColor, 0.008)} 76%, transparent 77%) !important;
        }
      `;

      // Aplicar estilos dinámicos
      let styleElement = document.getElementById('dynamic-texture-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-texture-styles';
        document.head.appendChild(styleElement);
      }

      styleElement.textContent = dynamicStyles;

      // Verificar que las clases de textura existen en el DOM
      const textureElements = document.querySelectorAll('[class*="texture-"]');

    };

    // Aplicar colores de texturas con múltiples intentos
    applyTextureColors();
    setTimeout(applyTextureColors, 200);
    setTimeout(applyTextureColors, 500);
    setTimeout(applyTextureColors, 1000);

    // Observer para detectar cuando se aplican las clases de textura
    const textureObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          const className = target.className || '';
          if (typeof className === 'string' && className.includes('texture-')) {
            setTimeout(applyTextureColors, 50);
          }
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const className = element.className || '';
              if (typeof className === 'string' && className.includes('texture-')) {
                setTimeout(applyTextureColors, 50);
              }
            }
          });
        }
      });
    });

    textureObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true
    });


    // SOLUCIÓN DEFINITIVA: Aplicar gradiente directamente al ícono del newsletter
    const newsletterIcon = document.querySelector('.nbd-newsletter-icon') as HTMLElement;
    if (newsletterIcon) {
      const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      newsletterIcon.style.background = dynamicGradient;
    }

    // TAMBIÉN aplicar DEGRADADO dinámico al botón de suscribirse (igual que el ícono)
    const newsletterButton = document.querySelector('.nbd-newsletter-submit') as HTMLElement;
    if (newsletterButton) {
      const dynamicButtonGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      newsletterButton.style.background = dynamicButtonGradient;

      // Aplicar hover gradient también (más oscuro)
      const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      newsletterButton.addEventListener('mouseenter', () => {
        newsletterButton.style.background = hoverGradient;
      });
      newsletterButton.addEventListener('mouseleave', () => {
        newsletterButton.style.background = dynamicButtonGradient;
      });
    }

    // APLICAR DEGRADADO dinámico a los botones de la hero section
    const heroPrimaryButton = document.querySelector('.nbd-hero-actions .nbd-btn--primary') as HTMLElement;
    if (heroPrimaryButton) {
      const dynamicHeroPrimaryGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      heroPrimaryButton.style.background = dynamicHeroPrimaryGradient;
      heroPrimaryButton.style.borderColor = primaryColor;

      // Aplicar hover gradient para el botón primario
      const heroPrimaryHoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      heroPrimaryButton.addEventListener('mouseenter', () => {
        heroPrimaryButton.style.background = heroPrimaryHoverGradient;
        heroPrimaryButton.style.borderColor = darkerColor;
      });
      heroPrimaryButton.addEventListener('mouseleave', () => {
        heroPrimaryButton.style.background = dynamicHeroPrimaryGradient;
        heroPrimaryButton.style.borderColor = primaryColor;
      });
    }

    // APLICAR ESTILO dinámico al botón secundario de la hero section (transparente con borde y texto del color dinámico)
    const heroSecondaryButton = document.querySelector('.nbd-hero-actions .nbd-btn--secondary') as HTMLElement;
    if (heroSecondaryButton) {
      heroSecondaryButton.style.background = 'transparent';
      heroSecondaryButton.style.borderColor = primaryColor;
      heroSecondaryButton.style.color = primaryColor;

      // Aplicar hover para el botón secundario (se rellena con el degradado)
      const heroSecondaryHoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      heroSecondaryButton.addEventListener('mouseenter', () => {
        heroSecondaryButton.style.background = heroSecondaryHoverGradient;
        heroSecondaryButton.style.color = 'white';
        heroSecondaryButton.style.borderColor = primaryColor;
      });
      heroSecondaryButton.addEventListener('mouseleave', () => {
        heroSecondaryButton.style.background = 'transparent';
        heroSecondaryButton.style.color = primaryColor;
        heroSecondaryButton.style.borderColor = primaryColor;
      });
    }

    // APLICAR DEGRADADO dinámico al botón "Proceder al checkout" del carrito
    const cartCheckoutButton = document.querySelector('.nbd-cart-checkout') as HTMLElement;
    if (cartCheckoutButton) {
      const dynamicCartCheckoutGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      cartCheckoutButton.style.background = dynamicCartCheckoutGradient;
      cartCheckoutButton.style.borderColor = primaryColor;

      // Aplicar hover gradient para el botón de checkout
      const cartCheckoutHoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      cartCheckoutButton.addEventListener('mouseenter', () => {
        const isDisabled = (cartCheckoutButton as HTMLButtonElement).disabled || cartCheckoutButton.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          cartCheckoutButton.style.background = cartCheckoutHoverGradient;
          cartCheckoutButton.style.borderColor = darkerColor;
        }
      });
      cartCheckoutButton.addEventListener('mouseleave', () => {
        const isDisabled = (cartCheckoutButton as HTMLButtonElement).disabled || cartCheckoutButton.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          cartCheckoutButton.style.background = dynamicCartCheckoutGradient;
          cartCheckoutButton.style.borderColor = primaryColor;
        }
      });
    }

    // APLICAR ESTILO dinámico al botón "Seguir comprando" del carrito (transparente con borde y texto del color dinámico)
    const cartContinueButton = document.querySelector('.nbd-cart-continue') as HTMLElement;
    if (cartContinueButton) {
      cartContinueButton.style.background = 'transparent';
      cartContinueButton.style.borderColor = primaryColor;
      cartContinueButton.style.color = primaryColor;

      // Aplicar hover para el botón "Seguir comprando" (se rellena con el degradado)
      const cartContinueHoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      cartContinueButton.addEventListener('mouseenter', () => {
        cartContinueButton.style.background = cartContinueHoverGradient;
        cartContinueButton.style.color = 'white';
        cartContinueButton.style.borderColor = primaryColor;
      });
      cartContinueButton.addEventListener('mouseleave', () => {
        cartContinueButton.style.background = 'transparent';
        cartContinueButton.style.color = primaryColor;
        cartContinueButton.style.borderColor = primaryColor;
      });
    }

    // APLICAR DEGRADADO dinámico a TODOS los botones primarios del sitio (.nbd-btn--primary) - EXCEPTO WhatsApp
    const allPrimaryButtons = document.querySelectorAll('.nbd-btn--primary:not(.nbd-hero-actions .nbd-btn--primary):not(.nbd-cart-checkout):not(.nbd-newsletter-submit):not(.nbd-btn--whatsapp)') as NodeListOf<HTMLElement>;
    allPrimaryButtons.forEach(button => {
      const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      button.style.background = dynamicGradient;
      button.style.borderColor = primaryColor;

      // Aplicar hover gradient
      const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
      button.addEventListener('mouseenter', () => {
        const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          button.style.background = hoverGradient;
          button.style.borderColor = darkerColor;
        }
      });
      button.addEventListener('mouseleave', () => {
        const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
        if (!isDisabled) {
          button.style.background = dynamicGradient;
          button.style.borderColor = primaryColor;
        }
      });
    });

    // APLICAR ESTILO dinámico a TODOS los botones secundarios del sitio (.nbd-btn--secondary)
    const allSecondaryButtons = document.querySelectorAll('.nbd-btn--secondary:not(.nbd-hero-actions .nbd-btn--secondary)') as NodeListOf<HTMLElement>;
    allSecondaryButtons.forEach(button => {
      button.style.background = 'transparent';
      button.style.borderColor = primaryColor;
      button.style.color = primaryColor;

      // Aplicar hover
      const hoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
      button.addEventListener('mouseenter', () => {
        button.style.background = hoverGradient;
        button.style.color = 'white';
        button.style.borderColor = primaryColor;
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
        button.style.color = primaryColor;
        button.style.borderColor = primaryColor;
      });
    });

    // APLICAR ESTILO dinámico a botones ghost que interactúan con colores primarios
    const ghostButtons = document.querySelectorAll('.nbd-btn--ghost') as NodeListOf<HTMLElement>;
    ghostButtons.forEach(button => {
      // Mantener el estilo ghost original pero mejorar el hover
      const originalColor = button.style.color;
      button.addEventListener('mouseenter', () => {
        button.style.color = primaryColor;
        button.style.borderColor = primaryColor;
      });
      button.addEventListener('mouseleave', () => {
        button.style.color = originalColor || '';
        button.style.borderColor = '';
      });
    });

    // APLICAR color dinámico a todos los botones de agregar al carrito (existentes)
    const addToCartButtons = document.querySelectorAll('.nbd-add-to-cart--loading') as NodeListOf<HTMLElement>;
    addToCartButtons.forEach(button => {
      button.style.backgroundColor = primaryColor;
    });

    // Observer para detectar cambios de clase en botones existentes
    const classObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as HTMLElement;
          if (target.classList.contains('nbd-add-to-cart--loading')) {
            // Se acaba de agregar la clase loading - aplicar color INMEDIATAMENTE
            target.style.setProperty('background-color', primaryColor, 'important');
            target.style.setProperty('transition', 'none', 'important'); // Sin transición para evitar el verde

            // Restaurar transición después de un frame para futuras interacciones
            setTimeout(() => {
              target.style.removeProperty('transition');
            }, 0);

          }
        }
      });
    });

    // También escuchar para botones que se crean dinámicamente
    const nodeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Buscar botones de carrito en el elemento agregado
            const cartButtons = element.querySelectorAll?.('.nbd-add-to-cart') as NodeListOf<HTMLElement>;
            cartButtons?.forEach(button => {
              // Observar cambios de clase en cada botón
              classObserver.observe(button, { attributes: true, attributeFilter: ['class'] });
            });

            // También aplicar color si ya tiene la clase loading
            const loadingButtons = element.querySelectorAll?.('.nbd-add-to-cart--loading') as NodeListOf<HTMLElement>;
            loadingButtons?.forEach(button => {
              button.style.backgroundColor = primaryColor;
            });

            // DETECTAR botones del carrito modal cuando se crean dinámicamente
            const newCartCheckoutButton = element.querySelector?.('.nbd-cart-checkout') as HTMLElement;
            if (newCartCheckoutButton) {
              const dynamicCartCheckoutGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              newCartCheckoutButton.style.background = dynamicCartCheckoutGradient;
              newCartCheckoutButton.style.borderColor = primaryColor;

              // Aplicar hover gradient
              const cartCheckoutHoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
              newCartCheckoutButton.addEventListener('mouseenter', () => {
                const isDisabled = (newCartCheckoutButton as HTMLButtonElement).disabled || newCartCheckoutButton.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  newCartCheckoutButton.style.background = cartCheckoutHoverGradient;
                  newCartCheckoutButton.style.borderColor = darkerColor;
                }
              });
              newCartCheckoutButton.addEventListener('mouseleave', () => {
                const isDisabled = (newCartCheckoutButton as HTMLButtonElement).disabled || newCartCheckoutButton.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  newCartCheckoutButton.style.background = dynamicCartCheckoutGradient;
                  newCartCheckoutButton.style.borderColor = primaryColor;
                }
              });
            }

            const newCartContinueButton = element.querySelector?.('.nbd-cart-continue') as HTMLElement;
            if (newCartContinueButton) {
              newCartContinueButton.style.background = 'transparent';
              newCartContinueButton.style.borderColor = primaryColor;
              newCartContinueButton.style.color = primaryColor;

              // Aplicar hover
              const cartContinueHoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              newCartContinueButton.addEventListener('mouseenter', () => {
                newCartContinueButton.style.background = cartContinueHoverGradient;
                newCartContinueButton.style.color = 'white';
                newCartContinueButton.style.borderColor = primaryColor;
              });
              newCartContinueButton.addEventListener('mouseleave', () => {
                newCartContinueButton.style.background = 'transparent';
                newCartContinueButton.style.color = primaryColor;
                newCartContinueButton.style.borderColor = primaryColor;
              });
            }

            // DETECTAR TODOS los botones primarios dinámicos - EXCEPTO WhatsApp
            const newPrimaryButtons = element.querySelectorAll?.('.nbd-btn--primary:not(.nbd-hero-actions .nbd-btn--primary):not(.nbd-cart-checkout):not(.nbd-newsletter-submit):not(.nbd-btn--whatsapp)') as NodeListOf<HTMLElement>;
            newPrimaryButtons?.forEach(button => {
              const dynamicGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              button.style.background = dynamicGradient;
              button.style.borderColor = primaryColor;

              const hoverGradient = `linear-gradient(135deg, ${darkerColor} 0%, ${muchDarkerColor} 100%)`;
              button.addEventListener('mouseenter', () => {
                const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  button.style.background = hoverGradient;
                  button.style.borderColor = darkerColor;
                }
              });
              button.addEventListener('mouseleave', () => {
                const isDisabled = (button as HTMLButtonElement).disabled || button.classList.contains('nbd-btn--disabled');
                if (!isDisabled) {
                  button.style.background = dynamicGradient;
                  button.style.borderColor = primaryColor;
                }
              });
            });

            // DETECTAR TODOS los botones secundarios dinámicos
            const newSecondaryButtons = element.querySelectorAll?.('.nbd-btn--secondary:not(.nbd-hero-actions .nbd-btn--secondary)') as NodeListOf<HTMLElement>;
            newSecondaryButtons?.forEach(button => {
              button.style.background = 'transparent';
              button.style.borderColor = primaryColor;
              button.style.color = primaryColor;

              const hoverGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${darkerColor} 100%)`;
              button.addEventListener('mouseenter', () => {
                button.style.background = hoverGradient;
                button.style.color = 'white';
                button.style.borderColor = primaryColor;
              });
              button.addEventListener('mouseleave', () => {
                button.style.background = 'transparent';
                button.style.color = primaryColor;
                button.style.borderColor = primaryColor;
              });
            });

            // DETECTAR botones ghost dinámicos
            const newGhostButtons = element.querySelectorAll?.('.nbd-btn--ghost') as NodeListOf<HTMLElement>;
            newGhostButtons?.forEach(button => {
              const originalColor = button.style.color;
              button.addEventListener('mouseenter', () => {
                button.style.color = primaryColor;
                button.style.borderColor = primaryColor;
              });
              button.addEventListener('mouseleave', () => {
                button.style.color = originalColor || '';
                button.style.borderColor = '';
              });
            });
          }
        });
      });
    });

    // Observar todos los botones existentes para cambios de clase
    const existingCartButtons = document.querySelectorAll('.nbd-add-to-cart') as NodeListOf<HTMLElement>;
    existingCartButtons.forEach(button => {
      classObserver.observe(button, { attributes: true, attributeFilter: ['class'] });
    });

    nodeObserver.observe(document.body, { childList: true, subtree: true });

    // APLICAR color dinámico a las tarjetas "Ver todos" de colecciones
    const applyCollectionViewAllColors = () => {
      const viewAllCards = document.querySelectorAll('.collection-view-all-card') as NodeListOf<HTMLElement>;
      viewAllCards.forEach(card => {
        card.style.backgroundColor = primaryColor;
      });

      const viewAllIcons = document.querySelectorAll('.collection-view-all-icon') as NodeListOf<HTMLElement>;
      viewAllIcons.forEach(icon => {
        icon.style.color = primaryColor;
      });
    };

    // Aplicar inmediatamente
    applyCollectionViewAllColors();

    // Aplicar después de delays para lazy-loaded components
    setTimeout(applyCollectionViewAllColors, 100);
    setTimeout(applyCollectionViewAllColors, 500);
    setTimeout(applyCollectionViewAllColors, 1000);

    // Observer para detectar nuevas tarjetas "Ver todos" cuando se carguen dinámicamente
    const collectionObserver = new MutationObserver(() => {
      applyCollectionViewAllColors();
    });

    collectionObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Forzar repaint para asegurar que los cambios se apliquen
    document.documentElement.offsetHeight;

  }

  // Aplicar color secundario si está disponible
  if (secondaryColor) {
    document.documentElement.style.setProperty('--nbd-secondary-custom', secondaryColor);
  }
}
