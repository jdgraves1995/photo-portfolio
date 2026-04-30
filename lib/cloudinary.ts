const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export function cloudinaryUrl(publicId: string, transform = "f_auto,q_auto:best,w_1200,c_limit") {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`
}

export function thumbUrl(publicId: string) {
  return cloudinaryUrl(publicId, "f_auto,q_auto,w_600,h_400,c_fill,g_auto")
}

export function fullUrl(publicId: string) {
  return cloudinaryUrl(publicId, "f_auto,q_auto:best,w_3000,c_limit")
}

export function ogImageUrl(publicId: string) {
  return cloudinaryUrl(publicId, "f_jpg,q_auto:good,w_1200,h_630,c_fill,g_auto")
}
