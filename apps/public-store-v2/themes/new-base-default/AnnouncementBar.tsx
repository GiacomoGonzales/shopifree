"use client";

import { useEffect, useState } from "react";
import { StoreBasicInfo } from "../../lib/store";
import "./announcement-bar-animations.css";

type Props = {
    storeInfo?: StoreBasicInfo | null;
};

export default function AnnouncementBar({ storeInfo }: Props) {
    const [isHomePage, setIsHomePage] = useState(false);

    useEffect(() => {
        // Verificar si estamos en la página home
        const checkHomePage = () => {
            const path = window.location.pathname;
            // Es home si es la raíz o solo tiene el subdominio
            const isHome = path === '/' || path.split('/').filter(segment => segment !== '').length === 0;
            setIsHomePage(isHome);
        };

        checkHomePage();

        // Verificar en cambios de URL
        window.addEventListener('popstate', checkHomePage);
        return () => window.removeEventListener('popstate', checkHomePage);
    }, []);

    // Si no hay configuración de announcement bar, no mostrar nada
    if (!storeInfo?.announcementBar?.enabled) {
        return null;
    }

    // Solo mostrar en página home
    if (!isHomePage) {
        return null;
    }

    const config = storeInfo.announcementBar;

    // Determinar las clases de animación
    const getAnimationClasses = () => {
        const speedClass = `animation-${config.animationSpeed}`;

        switch (config.animation) {
            case 'slide':
                return `announcement-slide ${speedClass}`;
            case 'fade':
                return `announcement-fade ${speedClass}`;
            case 'bounce':
                return `announcement-bounce ${speedClass}`;
            default:
                return '';
        }
    };

    // Para animación slide, necesitamos duplicar el contenido
    const renderContent = () => {
        const content = (
            <>
                <span dangerouslySetInnerHTML={{ __html: config.message }} />
                {config.link && config.linkText && (
                    <a
                        href={config.link}
                        style={{
                            color: config.textColor,
                            marginLeft: '12px',
                            textDecoration: 'underline'
                        }}
                    >
                        {config.linkText}
                    </a>
                )}
            </>
        );

        if (config.animation === 'slide') {
            return (
                <div className="slide-content">
                    <span>{content}</span>
                    <span>{content}</span>
                    <span>{content}</span>
                    <span>{content}</span>
                    <span>{content}</span>
                    <span>{content}</span>
                </div>
            );
        }

        return content;
    };

    const isTopPosition = config.position === 'top';
    const animationClasses = getAnimationClasses();

    return (
        <div
            className={animationClasses}
            style={{
                backgroundColor: config.backgroundColor,
                color: config.textColor,
                padding: '8px 16px',
                textAlign: 'center',
                fontSize: '14px',
                lineHeight: '25px',
                height: '41px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                position: 'fixed',
                left: 0,
                right: 0,
                zIndex: isTopPosition ? 1001 : 999,
                top: isTopPosition ? 0 : '80px',
                bottom: undefined,
                overflow: config.animation === 'slide' ? 'hidden' : 'visible',
                // Asegurar que se mantenga visible como el header
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', // Safari
                margin: 0,
                border: 'none'
            }}
        >
            {renderContent()}
        </div>
    );
}