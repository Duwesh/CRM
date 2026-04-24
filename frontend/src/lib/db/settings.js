import { supabase } from "@/lib/supabase";
import { getFirmId } from "./utils";

export async function getFirmProfile() {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Firms")
    .select("*")
    .eq("id", firm_id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateFirmProfile(payload) {
  const firm_id = await getFirmId();
  const { data, error } = await supabase
    .from("Tbl_Firms")
    .update(payload)
    .eq("id", firm_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadFirmLogo(file) {
  const firm_id = await getFirmId();
  const ext = file.name.split(".").pop();
  const path = `logos/${firm_id}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("firm-assets")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("firm-assets").getPublicUrl(path);
  await updateFirmProfile({ logo_url: data.publicUrl });
  return data.publicUrl;
}
