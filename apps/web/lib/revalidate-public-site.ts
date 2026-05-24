import { revalidatePath, revalidateTag } from "next/cache";

import {
  PUBLIC_COACHES_TAG,
  PUBLIC_GALLERY_TAG,
  PUBLIC_SITE_TAG,
  PUBLIC_VIDEOS_TAG,
} from "@/lib/public-cache-tags";

/** Сброс кэша главной, layout и связанных fetch после правок в админке. */
export function revalidatePublicSite(): void {
  revalidateTag(PUBLIC_SITE_TAG);
  revalidateTag(PUBLIC_COACHES_TAG);
  revalidateTag(PUBLIC_GALLERY_TAG);
  revalidateTag(PUBLIC_VIDEOS_TAG);

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/contacts");
}
