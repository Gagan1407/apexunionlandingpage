/** Insert Cloudinary transforms after `/upload/`. */
export function withCloudinaryTransform(src: string, transform: string) {
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }
  if (src.includes(`/upload/${transform}/`)) return src;
  return src.replace("/upload/", `/upload/${transform}/`);
}

/** Hero atmosphere image (same asset as landing hero background). */
export const APEX_HERO_IMAGE_SRC =
  "https://res.cloudinary.com/dz1681irz/image/upload/v1785241410/ChatGPT_Image_Jul_28_2026_05_52_18_PM_jz2nbl.png";

/** Square face crop for circular mentor/founder avatars (avoids cutting heads). */
export const CLD_PHOTO =
  "f_auto,q_auto,c_fill,g_auto:face,ar_1:1,w_800,h_800";
export const CLD_LOGO = "f_auto,q_auto,h_96";
/** Open Graph / Twitter share crop from the hero image. */
export const CLD_OG = "f_auto,q_auto,c_fill,g_auto,w_1200,h_630";

export const APEX_OG_IMAGE_URL = withCloudinaryTransform(
  APEX_HERO_IMAGE_SRC,
  CLD_OG
);
