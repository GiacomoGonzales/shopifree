"use client";

import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";

type Props = {
  storeInfo: StoreBasicInfo | null;
  categories: Category[] | null;
  storeSubdomain: string;
};

export default function Footer({ storeInfo, categories, storeSubdomain }: Props) {
  return (
    <footer className="mc-footer">
      <div className="mc-footer-inner">
        <div className="mc-footer-grid">
          <div>
            <h4 className="mc-footer-title">{storeInfo?.storeName || storeSubdomain}</h4>
            {storeInfo?.description ? (
              <p className="mc-footer-text">{storeInfo.description}</p>
            ) : null}
            <div className="mc-footer-text" style={{ marginTop: 8 }}>
              {storeInfo?.phone ? <div>Tel: {storeInfo.phone}</div> : null}
              {storeInfo?.emailStore ? <div>Email: {storeInfo.emailStore}</div> : null}
              {storeInfo?.address ? <div>Dirección: {storeInfo.address}</div> : null}
            </div>
          </div>

          <div>
            <h4 className="mc-footer-title">Navegación</h4>
            {Array.isArray(categories) && categories.filter(c => !c.parentCategoryId).length > 0 ? (
              <ul className="mc-footer-list">
                {categories.filter(c => !c.parentCategoryId).map((c) => (
                  <li key={`fcat-${c.id}`}><a className="mc-footer-link" href={`/#cat-${c.slug}`}>{c.name}</a></li>
                ))}
              </ul>
            ) : (
              <p className="mc-footer-text">Sin categorías</p>
            )}
          </div>

          <div>
            <h4 className="mc-footer-title">Síguenos</h4>
            <div className="mc-socials">
              {storeInfo?.socialMedia?.instagram ? (
                <a className="mc-social-link" href={storeInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              ) : null}
              {storeInfo?.socialMedia?.facebook ? (
                <a className="mc-social-link" href={storeInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
              ) : null}
              {storeInfo?.socialMedia?.tiktok ? (
                <a className="mc-social-link" href={storeInfo.socialMedia.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
              ) : null}
              {storeInfo?.socialMedia?.whatsapp ? (
                <a className="mc-social-link" href={storeInfo.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mc-footer-bottom">© {new Date().getFullYear()} {storeInfo?.storeName || 'Shopifree'}</div>
      </div>
    </footer>
  );
}


