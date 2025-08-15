"use client";

import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";

type Props = {
    storeInfo: StoreBasicInfo | null;
    categories: Category[] | null;
    storeSubdomain: string;
};

export default function Footer({ storeInfo, categories, storeSubdomain }: Props) {
    const currentYear = new Date().getFullYear();
    const topCategories = Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : [];

    return (
        <footer className="bd-footer">
            <div className="bd-footer-container">
                <div className="bd-footer-content">
                    
                    {/* Información de la tienda */}
                    <div className="bd-footer-section">
                        <h3 className="bd-footer-title">
                            {storeInfo?.storeName || storeSubdomain}
                        </h3>
                        {storeInfo?.description && (
                            <p className="bd-footer-description">
                                {storeInfo.description}
                            </p>
                        )}
                        
                        {/* Información de contacto */}
                        <div className="bd-footer-contact">
                            {storeInfo?.phone && (
                                <div className="bd-contact-item">
                                    <svg className="bd-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.41 21 0 11.59 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08V3.08" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>{storeInfo.phone}</span>
                                </div>
                            )}
                            {storeInfo?.emailStore && (
                                <div className="bd-contact-item">
                                    <svg className="bd-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>{storeInfo.emailStore}</span>
                                </div>
                            )}
                            {storeInfo?.address && (
                                <div className="bd-contact-item">
                                    <svg className="bd-contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>{storeInfo.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navegación */}
                    <div className="bd-footer-section">
                        <h3 className="bd-footer-title">Navegación</h3>
                        {topCategories.length > 0 ? (
                            <ul className="bd-footer-links">
                                {topCategories.map((category) => (
                                    <li key={category.id}>
                                        <a 
                                            href={`#categoria-${category.slug}`} 
                                            className="bd-footer-link"
                                        >
                                            {category.name}
                                        </a>
                                    </li>
                                ))}
                                <li>
                                    <a href="#productos" className="bd-footer-link">
                                        Todos los productos
                                    </a>
                                </li>
                                <li>
                                    <a href="#ofertas" className="bd-footer-link">
                                        Ofertas especiales
                                    </a>
                                </li>
                            </ul>
                        ) : (
                            <p className="bd-footer-text">Categorías próximamente</p>
                        )}
                    </div>

                    {/* Redes sociales */}
                    <div className="bd-footer-section">
                        <h3 className="bd-footer-title">Síguenos</h3>
                        <div className="bd-social-links">
                            {storeInfo?.socialMedia?.instagram && (
                                <a
                                    href={storeInfo.socialMedia.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bd-social-link"
                                    aria-label="Seguir en Instagram"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0ZM12 5.838C8.597 5.838 5.838 8.597 5.838 12S8.597 18.163 12 18.163S18.162 15.404 18.162 12S15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16ZM18.406 4.155C18.406 4.955 17.761 5.6 16.961 5.6C16.161 5.6 15.516 4.955 15.516 4.155C15.516 3.355 16.161 2.71 16.961 2.71C17.761 2.71 18.406 3.355 18.406 4.155Z"/>
                                    </svg>
                                    <span>Instagram</span>
                                </a>
                            )}
                            {storeInfo?.socialMedia?.facebook && (
                                <a
                                    href={storeInfo.socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bd-social-link"
                                    aria-label="Seguir en Facebook"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.564H7.078V12.073H10.125V9.404C10.125 6.369 11.917 4.715 14.658 4.715C15.97 4.715 17.344 4.953 17.344 4.953V7.928H15.83C14.341 7.928 13.875 8.814 13.875 9.725V12.073H17.203L16.671 15.564H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/>
                                    </svg>
                                    <span>Facebook</span>
                                </a>
                            )}
                            {storeInfo?.socialMedia?.tiktok && (
                                <a
                                    href={storeInfo.socialMedia.tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bd-social-link"
                                    aria-label="Seguir en TikTok"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.525.02C13.978.1 15.311.615 16.462 1.47C17.369 2.126 18.071 3.018 18.497 4.055C18.881 4.984 19.034 5.996 18.943 7.002C18.855 7.904 18.543 8.771 18.037 9.526C17.531 10.282 16.848 10.903 16.045 11.336C15.391 11.69 14.67 11.906 13.928 11.972V17.544C13.928 18.394 13.581 19.21 12.965 19.826C12.349 20.442 11.533 20.789 10.683 20.789C9.833 20.789 9.017 20.442 8.401 19.826C7.785 19.21 7.438 18.394 7.438 17.544C7.438 16.694 7.785 15.878 8.401 15.262C9.017 14.646 9.833 14.299 10.683 14.299C11.017 14.299 11.347 14.358 11.661 14.473V11.972C10.919 11.906 10.198 11.69 9.544 11.336C8.741 10.903 8.058 10.282 7.552 9.526C7.046 8.771 6.734 7.904 6.646 7.002C6.555 5.996 6.708 4.984 7.092 4.055C7.518 3.018 8.22 2.126 9.127 1.47C10.278 .615 11.611 .1 13.064.02C13.218.009 13.371.009 13.525.02"/>
                                    </svg>
                                    <span>TikTok</span>
                                </a>
                            )}
                            {storeInfo?.socialMedia?.whatsapp && (
                                <a
                                    href={storeInfo.socialMedia.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bd-social-link"
                                    aria-label="Contactar por WhatsApp"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382C17.367 14.382 17.188 14.328 16.935 14.22C16.682 14.112 15.376 13.471 15.136 13.381C14.896 13.291 14.722 13.246 14.548 13.499C14.374 13.752 13.846 14.339 13.698 14.513C13.55 14.687 13.402 14.713 13.149 14.605C12.896 14.497 12.049 14.207 11.026 13.3C10.23 12.595 9.692 11.717 9.544 11.464C9.396 11.211 9.526 11.076 9.634 10.968C9.732 10.87 9.852 10.718 9.96 10.57C10.068 10.422 10.122 10.313 10.212 10.139C10.302 9.965 10.257 9.817 10.203 9.709C10.149 9.601 9.611 8.295 9.397 7.789C9.183 7.283 8.969 7.35 8.821 7.343C8.673 7.336 8.499 7.336 8.325 7.336C8.151 7.336 7.872 7.39 7.632 7.643C7.392 7.896 6.697 8.537 6.697 9.843C6.697 11.149 7.659 12.401 7.767 12.575C7.875 12.749 9.611 15.375 12.221 16.516C12.818 16.785 13.282 16.943 13.644 17.055C14.241 17.247 14.781 17.221 15.208 17.167C15.689 17.107 16.735 16.544 16.949 15.922C17.163 15.3 17.163 14.774 17.109 14.686C17.055 14.598 16.881 14.544 16.628 14.436C16.375 14.328 16.735 14.382 17.472 14.382Z"/>
                                    </svg>
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>
                        
                        {/* Si no hay redes sociales configuradas */}
                        {!storeInfo?.socialMedia?.instagram && 
                         !storeInfo?.socialMedia?.facebook && 
                         !storeInfo?.socialMedia?.tiktok && 
                         !storeInfo?.socialMedia?.whatsapp && (
                            <p className="bd-footer-text">
                                Conéctate con nosotros próximamente
                            </p>
                        )}
                    </div>

                    {/* Enlaces útiles */}
                    <div className="bd-footer-section">
                        <h3 className="bd-footer-title">Información</h3>
                        <ul className="bd-footer-links">
                            <li>
                                <a href="#sobre-nosotros" className="bd-footer-link">
                                    Sobre nosotros
                                </a>
                            </li>
                            <li>
                                <a href="#politica-privacidad" className="bd-footer-link">
                                    Política de privacidad
                                </a>
                            </li>
                            <li>
                                <a href="#terminos-condiciones" className="bd-footer-link">
                                    Términos y condiciones
                                </a>
                            </li>
                            <li>
                                <a href="#envios-devoluciones" className="bd-footer-link">
                                    Envíos y devoluciones
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea divisoria */}
                <div className="bd-footer-divider"></div>

                {/* Footer bottom */}
                <div className="bd-footer-bottom">
                    <div className="bd-footer-bottom-content">
                        <p className="bd-footer-copyright">
                            © {currentYear} {storeInfo?.storeName || 'Shopifree'}. 
                            Todos los derechos reservados.
                        </p>
                        <div className="bd-footer-credits">
                            <span>Powered by</span>
                            <a 
                                href="https://shopifree.app" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bd-footer-brand-link"
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
