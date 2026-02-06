"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ClientDate from "@/components/ClientDate";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }
        getUser();
    }, [supabase]);

    async function signOut() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6 text-card-foreground">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        👤
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">{user?.email}</h2>
                        <p className="text-sm text-muted-foreground">Administrator</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                            <div className="text-sm text-muted-foreground mb-1">User ID</div>
                            <div className="font-mono text-xs text-foreground break-all">{user?.id}</div>
                        </div>
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Last Sign In</div>
                            <div className="font-medium text-foreground">
                                <ClientDate iso={user?.last_sign_in_at} />
                            </div>
                        </div>
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Created At</div>
                            <div className="font-medium text-foreground">
                                <ClientDate iso={user?.created_at} />
                            </div>
                        </div>
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                            <div className="text-sm text-muted-foreground mb-1">Role</div>
                            <div className="font-medium text-foreground">{user?.role}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end">
                    <button
                        onClick={signOut}
                        className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
