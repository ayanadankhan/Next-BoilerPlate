"use client";

import { Fragment, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

export default function Content({ children }: { children: React.ReactNode; }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== "/login") {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) return null;

    if (!isAuthenticated && pathname === "/login") {
        return (
            <main className="container mx-auto px-4 py-8">
                <AuthForm onSuccess={() => router.replace("/")} />
            </main>
        );
    }

    if (isAuthenticated) {
        return (
            <Fragment>
                <Navbar />
                <main className="container mx-auto px-4 py-8 max-w-[1600px]">
                    {children}
                </main>
            </Fragment>
        );
    }
}