// ============================================================
// Configuración de Supabase para Bella Glam
// ------------------------------------------------------------
// Estas dos constantes son PÚBLICAS y está bien que se vean en
// el navegador: están hechas justamente para eso. La seguridad
// real no la da la clave, la dan las políticas RLS de la base
// de datos (quién puede leer y quién puede escribir cada fila).
//
// ⚠️ NUNCA pongas aquí la clave "secret" (sb_secret_...) ni la
//    antigua "service_role": esas saltan TODAS las reglas de
//    seguridad y no deben estar nunca en una página web.
// ============================================================

const SUPABASE_URL = "https://mstrkunnmkthrcrbzwcm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_F6NmL1ujs7Pi6hNgO5RVSg_VxSKEWmd";

// `supabase` es la librería que llega desde el CDN en el HTML.
// Le pedimos que cree el cliente de nuestra tienda. Lo llamamos
// `supabaseClient` para no confundirlo con la librería.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
