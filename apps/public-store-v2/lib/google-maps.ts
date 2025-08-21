// Módulo centralizado para gestionar Google Maps API en public-store-v2
declare global {
  interface Window {
    googleMapsCallback?: () => void;
    googleMapsLoaded?: boolean;
  }
}

type GoogleMapsLoadCallback = () => void;

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private callbacks: GoogleMapsLoadCallback[] = [];
  private isLoaded = false;

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  load(): Promise<void> {
    // Si ya está cargado, resolver inmediatamente
    if (this.isLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    // Si ya hay una carga en progreso, devolver esa promesa
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Crear nueva promesa de carga
    this.loadPromise = new Promise((resolve, reject) => {
      // Verificar si ya está cargado (por otra instancia o script)
      if (window.google?.maps?.places) {
        console.log('Google Maps API already loaded');
        this.isLoaded = true;
        window.googleMapsLoaded = true;
        resolve();
        return;
      }

      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already in DOM, waiting for load...');
        
        // Esperar a que se cargue
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places) {
            console.log('Google Maps API loaded from existing script');
            clearInterval(checkInterval);
            this.isLoaded = true;
            window.googleMapsLoaded = true;
            resolve();
          }
        }, 100);

        // Timeout después de 10 segundos
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Google Maps load timeout'));
        }, 10000);
        
        return;
      }

      // Crear callback global
      const callbackName = 'googleMapsCallback';
      window[callbackName] = () => {
        console.log('Google Maps API loaded via callback');
        this.isLoaded = true;
        window.googleMapsLoaded = true;
        resolve();
        
        // Ejecutar todos los callbacks pendientes
        this.callbacks.forEach(cb => cb());
        this.callbacks = [];
      };

      // Crear y añadir el script
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      if (!apiKey) {
        console.warn('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found. Google Maps features disabled.');
        reject(new Error('Google Maps API key not configured. Features like location mapping will not be available.'));
        return;
      }

      // Configuración optimizada para móviles
      const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
      const loadingParams = new URLSearchParams({
        key: apiKey,
        libraries: 'places',
        language: 'es',
        callback: callbackName,
        // Agregar parámetros específicos para móviles
        ...(isMobileDevice && {
          loading: 'async',
          region: 'PE' // Región Perú para mejor rendimiento local
        })
      });
      
      script.src = `https://maps.googleapis.com/maps/api/js?${loadingParams.toString()}`;
      script.async = true;
      script.defer = true;
      
      // Mejorar manejo de errores para móviles
      script.onerror = (error) => {
        console.error('❌ Error loading Google Maps API:', error);
        console.log('🔍 Debug info:', {
          isMobileDevice,
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        });
        reject(new Error('Failed to load Google Maps API'));
      };
      
      // Agregar evento de carga exitosa
      script.onload = () => {
        console.log('✅ Google Maps script loaded successfully');
        if (isMobileDevice) {
          console.log('📱 Google Maps loaded on mobile device');
        }
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  onLoad(callback: GoogleMapsLoadCallback): void {
    if (this.isLoaded) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  // Método específico para dispositivos móviles
  isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return isMobileUA || (isSmallScreen && isTouchDevice);
  }

  // Método para forzar carga en móviles con reintentos
  async loadForMobile(): Promise<void> {
    if (!this.isMobileDevice()) {
      return this.load();
    }

    console.log('📱 Loading Google Maps specifically for mobile device...');
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`🔄 Mobile load attempt ${attempts}/${maxAttempts}`);
        
        await this.load();
        
        if (this.isGoogleMapsLoaded()) {
          console.log('✅ Google Maps successfully loaded for mobile');
          return;
        }
        
        // Esperar antes del siguiente intento
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      } catch (error) {
        console.warn(`⚠️ Mobile load attempt ${attempts} failed:`, error);
        
        if (attempts === maxAttempts) {
          throw new Error(`Failed to load Google Maps after ${maxAttempts} attempts on mobile`);
        }
      }
    }
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
