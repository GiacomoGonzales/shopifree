"use client";

import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";
import { useStoreLanguage } from "../../lib/store-language-context";
import StoreLocationMap from "../../components/StoreLocationMap";
import { useMemo } from "react";

type Props = {
    storeInfo: StoreBasicInfo | null;
    categories: Category[] | null;
    storeSubdomain: string;
    storeId?: string;
};

export default function Footer({ storeInfo, categories, storeSubdomain, storeId }: Props) {
    const currentYear = new Date().getFullYear();
    const topCategories = Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : [];
    const { t } = useStoreLanguage();

    // Memoizar la lógica de local físico basada en la configuración de contacto
    const { hasPhysicalStore, storeLocation } = useMemo(() => {
        const hasStore = storeInfo?.hasPhysicalLocation && 
                        storeInfo?.location && 
                        storeInfo.location.address.length > 0;
        
        const location = hasStore && storeInfo?.location 
            ? {
                name: storeInfo.storeName || "Nuestra tienda",
                address: storeInfo.location.address,
                lat: storeInfo.location.lat,
                lng: storeInfo.location.lng
              }
            : null;

        return { hasPhysicalStore: hasStore, storeLocation: location };
    }, [storeInfo?.hasPhysicalLocation, storeInfo?.location, storeInfo?.storeName]);

    return (
        <footer className="nbd-footer">
            <div className="nbd-footer-container">
                
                {/* Footer principal */}
                <div className="nbd-footer-main">
                    
                    {/* Información de la tienda */}
                    <div className="nbd-footer-section nbd-footer-section--brand">
                        {storeInfo?.storefrontImageUrl ? (
                            <img
                                src={storeInfo.storefrontImageUrl}
                                alt={storeInfo.storeName || storeSubdomain}
                                className="nbd-footer-logo"
                                style={{ maxHeight: '60px', objectFit: 'contain' }}
                            />
                        ) : (
                            <h3 className="nbd-footer-title">
                                {storeInfo?.storeName || storeSubdomain}
                            </h3>
                        )}
                        {storeInfo?.description && (
                            <p className="nbd-footer-description">
                                {storeInfo.description}
                            </p>
                        )}
                        
                        {/* Redes sociales */}
                        <div className="nbd-social-links">
                            {storeInfo?.socialMedia?.instagram && (
                                <a
                                    href={storeInfo.socialMedia.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nbd-social-link"
                                    aria-label="Instagram"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12S8.597 18.163 12 18.163S18.162 15.404 18.162 12S15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM18.406 4.155C18.406 4.955 17.761 5.6 16.961 5.6C16.161 5.6 15.516 4.955 15.516 4.155C15.516 3.355 16.161 2.71 16.961 2.71C17.761 2.71 18.406 3.355 18.406 4.155Z"/>
                                    </svg>
                                </a>
                            )}
                            {storeInfo?.socialMedia?.facebook && (
                                <a
                                    href={storeInfo.socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nbd-social-link"
                                    aria-label="Facebook"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.564H7.078V12.073H10.125V9.404C10.125 6.369 11.917 4.715 14.658 4.715C15.97 4.715 17.344 4.953 17.344 4.953V7.928H15.83C14.341 7.928 13.875 8.814 13.875 9.725V12.073H17.203L16.671 15.564H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/>
                                    </svg>
                                </a>
                            )}
                            {storeInfo?.socialMedia?.tiktok && (
                                <a
                                    href={storeInfo.socialMedia.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nbd-social-link"
                                    aria-label="TikTok"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                </a>
                            )}
                            {storeInfo?.socialMedia?.youtube && (
                                <a
                                    href={storeInfo.socialMedia.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nbd-social-link"
                                    aria-label="YouTube"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </a>
                            )}
                            {(storeInfo?.socialMedia?.twitter || storeInfo?.socialMedia?.x) && (
                                <a
                                    href={storeInfo.socialMedia.x || storeInfo.socialMedia.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nbd-social-link"
                                    aria-label={storeInfo.socialMedia.x ? "X (Twitter)" : "Twitter"}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Navegación */}
                    <div className="nbd-footer-section nbd-footer-navigation">
                        <h3 className="nbd-footer-title">{t('navigation')}</h3>
                        <ul className="nbd-footer-links">
                            <li>
                                <a href="#categorias" className="nbd-footer-link">
                                    {t('categories')}
                                </a>
                            </li>
                            <li>
                                <a href="#productos" className="nbd-footer-link">
                                    {t('products')}
                                </a>
                            </li>
                            {topCategories.slice(0, 4).map((category) => (
                                <li key={category.id}>
                                    <a 
                                        href={`#categoria-${category.slug}`} 
                                        className="nbd-footer-link"
                                    >
                                        {category.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacto / Ubícanos */}
                    <div className="nbd-footer-section">
                        <h3 className="nbd-footer-title">
                            {hasPhysicalStore ? t('findUs') : t('contact')}
                        </h3>
                        
                        {hasPhysicalStore && storeLocation ? (
                            <div className="nbd-location-info">
                                {/* Mapa de ubicación */}
                                <StoreLocationMap 
                                    location={{
                                        name: storeLocation.name,
                                        address: storeLocation.address
                                    }}
                                    className="nbd-footer-map"
                                />
                                
                                {/* Información de contacto debajo del mapa */}
                                <div className="nbd-contact-info" style={{ marginTop: 'var(--nbd-space-md)' }}>
                                    <div className="nbd-contact-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{storeLocation.address}</span>
                                    </div>
                                    
                                    {storeInfo?.phone && (
                                        <div className="nbd-contact-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59344 1.99532 8.06546 2.16718 8.43235 2.48363C8.79925 2.80008 9.04207 3.23954 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span>{storeInfo.phone}</span>
                                        </div>
                                    )}
                                    
                                    {storeInfo?.emailStore && (
                                        <div className="nbd-contact-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span>{storeInfo.emailStore}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="nbd-contact-info">
                                {storeInfo?.phone && (
                                    <div className="nbd-contact-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59344 1.99532 8.06546 2.16718 8.43235 2.48363C8.79925 2.80008 9.04207 3.23954 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{storeInfo.phone}</span>
                                    </div>
                                )}
                                {storeInfo?.emailStore && (
                                    <div className="nbd-contact-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{storeInfo.emailStore}</span>
                                    </div>
                                )}
                                {storeInfo?.address && (
                                    <div className="nbd-contact-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{storeInfo.address}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Información adicional */}
                    <div className="nbd-footer-section">
                        <h3 className="nbd-footer-title">{t('information')}</h3>
                        <ul className="nbd-footer-links">
                            <li>
                                <a href="#sobre-nosotros" className="nbd-footer-link">
                                    {t('aboutUs')}
                                </a>
                            </li>
                            <li>
                                <a href="#politicas" className="nbd-footer-link">
                                    {t('privacyPolicy')}
                                </a>
                            </li>
                            <li>
                                <a href="#terminos" className="nbd-footer-link">
                                    {t('termsConditions')}
                                </a>
                            </li>
                            <li>
                                <a href="#envios" className="nbd-footer-link">
                                    {t('shippingReturns')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="nbd-footer-bottom">
                    <div className="nbd-footer-bottom-content">
                        <p className="nbd-footer-copyright">
                            © {currentYear} {storeInfo?.storeName || 'Shopifree'}. {t('allRightsReserved')}.
                        </p>
                        <div className="nbd-footer-credits">
                            <span>{t('poweredBy')}</span>
                            <a 
                                href="https://shopifree.app" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="nbd-footer-brand"
                            >
                                Shopifree
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
