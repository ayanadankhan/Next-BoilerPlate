"use client"

import AuthForm from "@/components/AuthForm"
import { useState } from "react";

export default function LoginPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    return (<AuthForm onSuccess={() => { setIsAuthModalOpen(false) }} />);
}