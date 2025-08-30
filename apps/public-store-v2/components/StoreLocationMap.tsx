"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { googleMapsLoader } from '../lib/google-maps';

type StoreLocation = {
    name: string;
    address: string;
    lat?: number;
    lng?: number;
};

type Props = {
    location: StoreLocation;
    className?: string;
};

export default function StoreLocationMap({ location, className = '' }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);

    // Memoizar la ubicación para evitar re-renders innecesarios
    const memoizedLocation = useMemo(() => ({
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng
    }), [location.name, location.address, location.lat, location.lng]);

    // Función memoizada para geocodificar direcciones
    const geocodeAddress = useCallback(async (address: string): Promise<{lat: number; lng: number}> => {
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                    resolve(results);
                } else {
                    reject(new Error(`No se pudo geocodificar la dirección: ${status}`));
                }
            });
        });

        const firstResult = result[0];
        return {
            lat: firstResult.geometry.location.lat(),
            lng: firstResult.geometry.location.lng()
        };
    }, []);

    // Función memoizada para crear el mapa
    const createMap = useCallback(async (lat: number, lng: number) => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        });

        mapInstanceRef.current = map;

        // Crear marcador
        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: memoizedLocation.name,
            icon: {
                url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
                        <circle cx="12" cy="10" r="3" fill="#ffffff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            }
        });

        markerRef.current = marker;

        // Crear ventana de información
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 8px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${memoizedLocation.name}</h3>
                    <p style="margin: 0; font-size: 12px; color: #666;">${memoizedLocation.address}</p>
                </div>
            `
        });

        // Mostrar ventana de información al hacer clic en el marcador
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }, [memoizedLocation.name, memoizedLocation.address]);

    // Efecto principal optimizado
    useEffect(() => {
        let isCancelled = false;

        const initializeMap = async () => {
            try {
                // Si ya tenemos un mapa, no recrearlo
                if (mapInstanceRef.current) return;

                // Cargar Google Maps API
                await googleMapsLoader.load();
                
                if (isCancelled) return;

                let lat = memoizedLocation.lat;
                let lng = memoizedLocation.lng;

                // Si no tenemos coordenadas, geocodificar la dirección
                if (!lat || !lng) {
                    if (!memoizedLocation.address) {
                        throw new Error('No hay dirección disponible para mostrar en el mapa');
                    }

                    const coords = await geocodeAddress(memoizedLocation.address);
                    lat = coords.lat;
                    lng = coords.lng;
                }

                if (isCancelled) return;

                setCoordinates({ lat, lng });
                await createMap(lat, lng);
                
                if (!isCancelled) {
                    setIsLoaded(true);
                }

            } catch (err) {
                if (!isCancelled) {
                    console.error('Error inicializando el mapa:', err);
                    setError(err instanceof Error ? err.message : 'Error desconocido');
                }
            }
        };

        initializeMap();

        // Cleanup function
        return () => {
            isCancelled = true;
        };
    }, [memoizedLocation, geocodeAddress, createMap]);

    // Cleanup del mapa cuando el componente se desmonta
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
        };
    }, []);

    if (error) {
        return (
            <div className={`nbd-store-map-error ${className}`}>
                <div className="nbd-store-map-error-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p>No se pudo cargar el mapa</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`nbd-store-map ${className}`}>
            <div 
                ref={mapRef} 
                className="nbd-store-map-container"
                style={{ 
                    width: '100%', 
                    height: '200px',
                    borderRadius: '8px',
                    opacity: isLoaded ? 1 : 0.5,
                    transition: 'opacity 0.3s ease'
                }}
            />
            {!isLoaded && (
                <div className="nbd-store-map-loading">
                    <div className="nbd-store-map-loading-spinner"></div>
                    <p>Cargando mapa...</p>
                </div>
            )}
        </div>
    );
}
