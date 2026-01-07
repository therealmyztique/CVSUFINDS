import { supabase } from './supabaseClient';

/**
 * Triggers the generation of a CLIP ViT-B-32 image embedding for a report.
 * This calls the Supabase edge function which uses HuggingFace's inference API.
 * 
 * @param imageUrl - The public URL of the uploaded image
 * @param reportId - The ID of the report (lost or found)
 * @param reportType - Either 'lost' or 'found'
 * @returns Promise with the result of the embedding generation
 */
export async function generateImageEmbedding(
  imageUrl: string,
  reportId: string | number,
  reportType: 'lost' | 'found'
): Promise<{ success: boolean; embeddingDimensions?: number; error?: string }> {
  try {
    console.log(`Generating embedding for ${reportType} report ${reportId}`);
    
    const { data, error } = await supabase.functions.invoke('generate-image-embedding', {
      body: {
        image_url: imageUrl,
        report_id: reportId,
        report_type: reportType,
      },
    });

    if (error) {
      // Try to get more details from the error
      let errorMessage = error.message;
      if (error.context) {
        try {
          const contextData = await error.context.json();
          if (contextData?.error) {
            errorMessage = contextData.error;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
      console.error('Edge function error:', errorMessage);
      return { success: false, error: errorMessage };
    }

    if (data?.error) {
      console.error('Embedding generation error:', data.error);
      return { success: false, error: data.error };
    }

    console.log('Embedding generated successfully:', data);
    return {
      success: true,
      embeddingDimensions: data?.embedding_dimensions || 384,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error generating embedding';
    console.error('generateImageEmbedding error:', message);
    return { success: false, error: message };
  }
}

export interface MatchedItem {
  id: number;
  title: string;
  category: string;
  description: string | null;
  location_found?: string;
  last_seen?: string;
  image_url: string | null;
  found_at?: string;
  lost_at?: string;
  similarity: number;
  contact_preference?: string;
  contact_value?: string;
  reporter_id?: string;
}

/**
 * Finds matching found items for a lost report using CLIP image similarity.
 * Waits for the embedding to be generated, then searches for similar items.
 * 
 * @param lostReportId - The ID of the lost report to find matches for
 * @param matchThreshold - Minimum similarity score (0-1), default 0.5
 * @param matchCount - Maximum number of matches to return, default 10
 * @returns Promise with matched found items
 */
export async function findMatchesForLostItem(
  lostReportId: number | string,
  matchThreshold: number = 0.5,
  matchCount: number = 10
): Promise<{ success: boolean; matches?: MatchedItem[]; error?: string }> {
  try {
    // Call the RPC function to find matches
    const { data, error } = await supabase.rpc('find_matches_for_lost_item', {
      p_lost_report_id: lostReportId,
      p_match_threshold: matchThreshold,
      p_match_count: matchCount,
    });

    if (error) {
      console.error('RPC error finding matches:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      matches: data || [],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error finding matches';
    console.error('findMatchesForLostItem error:', message);
    return { success: false, error: message };
  }
}
