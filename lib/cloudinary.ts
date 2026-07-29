/** Insert Cloudinary transforms after `/upload/`. */
export function withCloudinaryTransform(src: string, transform: string) {
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }
  if (src.includes(`/upload/${transform}/`)) return src;
  return src.replace("/upload/", `/upload/${transform}/`);
}

export const CLD_PHOTO =
  "f_auto,q_auto,c_fill,g_face,w_640,h_800";
export const CLD_LOGO = "f_auto,q_auto,h_96";
export const CLD_HERO =
  "e_blur:600,q_auto,f_auto,c_fill,g_auto,w_1920";
