import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);

export async function uploadImage(file, path = "products") {
  if (!file) return null;
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("public-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("uploadImage", error);
    return null;
  }

  const { data: imageData, error: urlError } = supabase.storage
    .from("public-images")
    .getPublicUrl(filePath);

  if (urlError) {
    console.error("urlError", urlError);
    return null;
  }

  return imageData.publicUrl;
}
