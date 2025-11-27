"use client";

import AuthForm from "@/components/AuthForm";
import { useAuth } from '../app/context/AuthContext'; // Import useAuth
import Navbar from "@/components/Navbar";

function Content({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return (
            <main className="container mx-auto px-4 py-8">
                <AuthForm onSuccess={() => { }} />
            </main>
        );
    }
    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </>
    );
}

export default Content;