// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const hfApiUrl = mustGetEnv("HF_API_URL");
const hfApiToken = mustGetEnv("HF_API_TOKEN");
const supabaseUrl = mustGetEnv("EDGE_SUPABASE_URL");
const supabaseKey = mustGetEnv("EDGE_SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

function mustGetEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

/*async function buildImageEmbedding(imageUrl: string): Promise<number[]> {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < byteArray.length; i += 1) {
    binary += String.fromCharCode(byteArray[i]);
  }
  const base64Image = btoa(binary);

  const requestPayload = {
    inputs: [
      {
        name: "inputs",
        shape: [1],
        datatype: "BYTES",
        data: [base64Image],
      },
    ],
    parameters: {
      model_id: "sentence-transformers/clip-ViT-B-32",
      wait_for_model: true,
    },
  };

  const response = await fetch(hfApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfApiToken}`,
      "Content-Type": "application/json",
      "X-Wait-For-Model": "true",
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  let embedding: number[] | undefined;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    embedding = data[0];
  } else if (Array.isArray(data)) {
    embedding = data;
  } else if (data && typeof data === "object" && Array.isArray(data.embedding)) {
    embedding = data.embedding;
  }

  if (!embedding) {
    throw new Error("Embedding payload missing in HuggingFace response");
  }

  if (embedding.length !== 512) {
    throw new Error(`Embedding size mismatch: expected 512, got ${embedding.length}`);
  }

  return embedding.map((value) => Number(value));
}*/

/*async function buildImageEmbedding(imageUrl: string): Promise<number[]> {
  const response = await fetch(hfApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: imageUrl
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HF error ${response.status}: ${text}`);
  }

  const data = await response.json();

  // HF returns: number[][]
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error("Unexpected HF embedding format");
  }

  const embedding = data[0];

  if (embedding.length !== 512) {
    throw new Error(`Expected 512-dim embedding, got ${embedding.length}`);
  }

  return embedding;
}*/


Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { image_url: imageUrl, report_id: reportId, report_type: reportType } = await req.json();

    if (typeof imageUrl !== "string" || !imageUrl.trim()) {
      return new Response(JSON.stringify({ error: "image_url is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (typeof reportId !== "string" && typeof reportId !== "number") {
      return new Response(JSON.stringify({ error: "report_id must be string or number" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const normalizedType = typeof reportType === "string" ? reportType.toLowerCase() : "";
    if (!["lost", "found"].includes(normalizedType)) {
      return new Response(JSON.stringify({ error: "report_type must be 'lost' or 'found'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const embedding = await buildImageEmbedding(imageUrl);
    const targetTable = normalizedType === "lost" ? "lost_reports" : "found_reports";

    const { error } = await supabase
      .from(targetTable)
      .update({ image_emb: embedding })
      .eq("id", reportId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, embedding_dimensions: embedding.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});