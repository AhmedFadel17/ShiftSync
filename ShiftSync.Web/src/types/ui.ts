import { JSX } from "react";

export type AppRoute = {
    path: string;
    label: string;
    element: JSX.Element;
}
export type SidebarRoute = {
    path: string;
    label: string;
    icon: JSX.Element;
    subItems?: {
        path: string;
        label: string;
        icon: JSX.Element;
        pro?: boolean;
        new?: boolean
    }[]
}