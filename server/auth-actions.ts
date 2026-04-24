"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export async function registerEmail(formdata: FormData) {
    const name = formdata.get("name") as string;
    const email = formdata.get("email") as string;
    const password = formdata.get("password") as string;

    const result = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        },
        headers: await headers(),
    });

    redirect('/');
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