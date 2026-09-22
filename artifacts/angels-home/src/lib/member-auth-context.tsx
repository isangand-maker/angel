import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { memberApi } from "./member-api";

interface MemberAuthState {
  member: { email: string; name: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthState | null>(null);

export function MemberAuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await memberApi.me();
      setMember(res);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (member && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: "member-login", email: member.email }));
    }
  }, [member]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await memberApi.login(email, password);
    setMember(res);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string }) => {
    const res = await memberApi.register(data);
    setMember(res);
  }, []);

  const logout = useCallback(async () => {
    await memberApi.logout();
    setMember(null);
  }, []);

  return (
    <MemberAuthContext.Provider value={{ member, loading, login, register, logout }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMemberAuth must be used within MemberAuthProvider");
  return ctx;
}
