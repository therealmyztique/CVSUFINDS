import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { supabase } from "../lib/supabaseClient";

interface LostReport {
  id: string;
  reporter_id: string;
  title: string;
  category: string;
  description: string;
  last_seen: string;
  lost_at: string;
  contact_preference: string;
  contact_value: string;
  reward: string;
  notes: string;
  created_at: string;
  updated_at: string;
  image_url: string;

  // added: populated from profiles table
  reporter_name?: string;
  avatar_url?: string;
}

interface LostItemsProps {
  onDataLoaded: (data: LostReport[]) => void;
  filter?: string;
}

const LostItems: React.FC<LostItemsProps> = ({
  onDataLoaded,
  filter = "All",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLostReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("lost_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter && filter !== "All" && filter !== "Lost") {
        // If filtering for "Found", return empty since this is lost_reports
        onDataLoaded([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        onDataLoaded([]);
        return;
      }

      const reports = (data || []) as LostReport[];

      if (reports.length === 0) {
        onDataLoaded([]);
        return;
      }

      // get unique reporter_ids
      const reporterIds = Array.from(
        new Set(reports.map((r) => r.reporter_id))
      ).filter(Boolean);

      let profilesMap: Record<
        string,
        {
          id: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string;
        }
      > = {};

      if (reporterIds.length > 0) {
        // try a narrow select first (preferred)
        let profilesData: any[] | null = null;
        let profilesError: any = null;

        try {
          const res = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", reporterIds);
          profilesData = res.data as any[] | null;
          profilesError = res.error;
        } catch (e: any) {
          profilesError = e;
        }

        // if that failed (possible wrong column names), retry with select('*')
        if (profilesError) {
          console.warn(
            "Profiles narrow select failed, retrying with '*':",
            profilesError.message || profilesError
          );
          try {
            const res2 = await supabase
              .from("profiles")
              .select("*")
              .in("id", reporterIds);
            profilesData = res2.data as any[] | null;
            profilesError = res2.error;
          } catch (e: any) {
            profilesError = e;
          }
        }

        if (profilesError) {
          console.warn(
            "Failed to fetch profiles:",
            profilesError.message || profilesError
          );
        } else if (profilesData) {
          profilesData.forEach((p: any) => {
            const firstName = p.first_name ?? "";
            const avatar = p.avatar_url ?? "";
            profilesMap[p.id] = {
              id: p.id,
              first_name: firstName,
              last_name: p.last_name ?? "",
              avatar_url: avatar,
            };
          });
        }
      }

      const enriched = reports.map((r) => ({
        ...r,
        reporter_name: profilesMap[r.reporter_id]?.first_name || "",
        avatar_url: profilesMap[r.reporter_id]?.avatar_url || "",
      }));

      onDataLoaded(enriched);
    } catch (err: any) {
      setError(err.message || "Failed to fetch lost reports");
      onDataLoaded([]);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded, filter]);

  useEffect(() => {
    fetchLostReports();
  }, [fetchLostReports]);

  if (loading) {
    return (
      <View className="p-4 items-center justify-center">
        <ActivityIndicator size="small" color="#f43f5e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4 items-center justify-center">
        <Text className="text-lost-light text-sm text-center">{error}</Text>
      </View>
    );
  }

  return null; // Data is passed via onDataLoaded callback
};

export default LostItems;
