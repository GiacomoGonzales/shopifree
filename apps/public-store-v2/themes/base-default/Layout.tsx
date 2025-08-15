"use client";

import { ReactNode } from "react";
import "./base-default.css";

type Props = {
    children: ReactNode;
};

export default function Layout({ children }: Props) {
    return (
        <div data-theme="base-default" className="bd-theme">
            {children}
        </div>
    );
}
