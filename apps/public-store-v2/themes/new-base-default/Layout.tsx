"use client";

import { ReactNode } from "react";
import "./new-base-default.css";

type Props = {
    children: ReactNode;
};

export default function Layout({ children }: Props) {
    return (
        <div data-theme="new-base-default" className="nbd-theme">
            {children}
        </div>
    );
}
