"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


export async function registerEmail(formdata: FormData) {
    const name = formdata.get("name") as string;
    const email = formdata.get("email") as string;
    const password = formdata.get("password") as string;
    const confirmPassword = formdata.get("confirmPassword") as string;

    if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
    }

    if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    try {
        const result = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
            headers: await headers(),
        });
        
        const cookieStore = await cookies();
        cookieStore.set("registration_success", email, {
            httpOnly: true,
            maxAge: 60,
            path: "/",
        });
        
        redirect('/login');
    } catch (error: any) {
        if (error.message?.includes("already exists") || error.code === "USER_ALREADY_EXISTS") {
            throw new Error("Este correo ya está registrado");
        }
        throw error;
    }
}

export async function loginEmail(formdata: FormData) {
    const email = formdata.get("email") as string;
    const password = formdata.get("password") as string;

    try {
        const result = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        });
        console.log("Login result:", result);
    } catch (error) {
        console.error("Error en login:", error);
        throw error;
    }

    redirect('/dashboard');
}

export async function signOut() {
    const result = await auth.api.signOut({
        headers: await headers(),
    });

    redirect('/');
}