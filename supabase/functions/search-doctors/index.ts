import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Google Places API key not configured",
          results: [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { lat, lng, specialty, radius = 5000 } = await req.json();

    if (!lat || !lng || !specialty) {
      return new Response(
        JSON.stringify({ error: "Missing lat, lng, or specialty", results: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map specialty to search keyword
    const specialtyKeywords: Record<string, string> = {
      cardiology: "cardiologist",
      dermatology: "dermatologist",
      orthopedics: "orthopedic doctor",
      neurology: "neurologist",
      pediatrics: "pediatrician",
      ophthalmology: "ophthalmologist",
      ent: "ENT doctor",
      psychiatry: "psychiatrist",
      gynecology: "gynecologist",
      urology: "urologist",
      gastroenterology: "gastroenterologist",
      pulmonology: "pulmonologist",
      endocrinology: "endocrinologist",
      general: "general physician",
      dental: "dentist",
      diabetes: "diabetologist",
    };

    const keyword = specialtyKeywords[specialty] || `${specialty} doctor`;

    // Google Places Text Search (new)
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword)}&location=${lat},${lng}&radius=${radius}&type=doctor&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: `Google Places API: ${data.status}`, results: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = (data.results || []).slice(0, 20).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      openNow: place.opening_hours?.open_now ?? null,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      types: place.types || [],
    }));

    return new Response(
      JSON.stringify({ results, error: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in search-doctors:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", results: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
