'use client';

import Script from 'next/script';

interface SEOScriptsProps {
  storeSubdomain: string;
  googleAnalytics?: string;
  googleSearchConsole?: string;
  metaPixel?: string;
  tiktokPixel?: string;
  structuredDataEnabled?: boolean;
  storeInfo?: {
    name: string;
    description: string;
    url: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export default function SEOScripts({
  storeSubdomain,
  googleAnalytics,
  googleSearchConsole,
  metaPixel,
  tiktokPixel,
  structuredDataEnabled = true,
  storeInfo
}: SEOScriptsProps) {
  // Generar datos estructurados JSON-LD para la tienda
  const generateStoreStructuredData = () => {
    if (!structuredDataEnabled || !storeInfo) return null;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": storeInfo.name,
      "description": storeInfo.description,
      "url": storeInfo.url,
      "logo": storeInfo.logoUrl,
      "address": storeInfo.address ? {
        "@type": "PostalAddress",
        "streetAddress": storeInfo.address
      } : undefined,
      "telephone": storeInfo.phone,
      "email": storeInfo.email,
      "potentialAction": {
        "@type": "ViewAction",
        "target": storeInfo.url
      }
    };

    // Limpiar campos undefined
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key as keyof typeof structuredData] === undefined) {
        delete structuredData[key as keyof typeof structuredData];
      }
    });

    return structuredData;
  };

  const storeStructuredData = generateStoreStructuredData();

  return (
    <>
      {/* Google Analytics 4 */}
      {googleAnalytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalytics}', {
                page_title: document.title,
                page_location: window.location.href
              });
            `}
          </Script>
        </>
      )}

      {/* Google Search Console verification se maneja en el metadata del servidor */}

      {/* Meta Pixel (Facebook) */}
      {metaPixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixel}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {tiktokPixel && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixel}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* Datos Estructurados JSON-LD */}
      {storeStructuredData && (
        <Script 
          id="store-structured-data" 
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(storeStructuredData)}
        </Script>
      )}

      {/* Debug logging */}
      <Script id="seo-debug" strategy="afterInteractive">
        {`
          console.log('🔍 [SEO] Scripts cargados para ${storeSubdomain}:', {
            googleAnalytics: ${!!googleAnalytics},
            metaPixel: ${!!metaPixel},
            tiktokPixel: ${!!tiktokPixel},
            structuredData: ${!!storeStructuredData}
          });
        `}
      </Script>
    </>
  );
}
