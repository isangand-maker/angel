import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Support() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/support/info", { replace: true });
  }, [setLocation]);
  return null;
}
