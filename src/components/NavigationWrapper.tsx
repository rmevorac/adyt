'use client';

import { usePathname } from "next/navigation";
import TopNavigation from "./TopNavigation";

export default function NavigationWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return null;
  }

  return <TopNavigation />;
} 