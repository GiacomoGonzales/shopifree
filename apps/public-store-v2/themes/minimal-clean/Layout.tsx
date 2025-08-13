import './minimal-clean.css';
import Header from './Header';
import Footer from './Footer';
import type { StoreBasicInfo } from '../../lib/store';
import type { Category } from '../../lib/categories';

type Props = {
  children: React.ReactNode;
  storeInfo: StoreBasicInfo | null;
  categories: Category[] | null;
  storeSubdomain: string;
};

export default function MinimalCleanLayout({ children, storeInfo, categories, storeSubdomain }: Props) {
  return (
    <div data-theme="minimal-clean">
      <Header storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
      {children}
      <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
    </div>
  );
}


