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
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error('Error loading Google Maps API:', error);
        reject(new Error('Failed to load Google Maps API'));
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
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
