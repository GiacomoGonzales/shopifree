"use client";

import { ReactNode } from "react";
import "./new-base-default.css";
import { StoreBasicInfo } from "../../lib/store";
import { Category } from "../../lib/categories";
import Header from "./Header";
import Footer from "./Footer";

type Props = {
    children: ReactNode;
    storeInfo?: StoreBasicInfo | null;
    categories?: Category[] | null;
    storeSubdomain?: string;
};

export default function Layout({ children, storeInfo, categories, storeSubdomain }: Props) {
    return (
        <div data-theme="new-base-default" className="nbd-theme">
            {(storeInfo || categories || storeSubdomain) && (
                <Header 
                    storeInfo={storeInfo || null} 
                    categories={categories || null} 
                    storeSubdomain={storeSubdomain || ''} 
                />
            )}
            <main>{children}</main>
            {(storeInfo || categories || storeSubdomain) && (
                <Footer 
                    storeInfo={storeInfo || null} 
                    categories={categories || null} 
                    storeSubdomain={storeSubdomain || ''} 
                />
            )}
        </div>
    );
}
