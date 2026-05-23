"use client";

import { createContext, useContext, type ReactNode } from "react";

import { resolveSiteContacts, type ResolvedSiteContacts } from "@/lib/site-contacts";

const Ctx = createContext<ResolvedSiteContacts>(resolveSiteContacts(null));

export function SiteContactsProvider({
  contacts,
  children,
}: {
  contacts: ResolvedSiteContacts;
  children: ReactNode;
}) {
  return <Ctx.Provider value={contacts}>{children}</Ctx.Provider>;
}

export function useSiteContacts(): ResolvedSiteContacts {
  return useContext(Ctx);
}
