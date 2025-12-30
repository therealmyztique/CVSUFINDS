import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

interface FoundReport {
  id: string;
  reporter_id: string;
  title: string;
  category: string;
  description: string;
  location_found: string;
  found_at: string;
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

interface FoundItemsProps {
  onDataLoaded: (data: FoundReport[]) => void;
  filter?: string;
}

const FoundItems: React.FC<FoundItemsProps> = ({
  onDataLoaded,
  filter = "All",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoundReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("found_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter && filter !== "All" && filter !== "Found") {
        // If filtering for "Lost", return empty since this is found_reports
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

      const reports = (data || []) as FoundReport[];

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
          full_name?: string;
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
            .select("id, first_name, full_name, avatar_url")
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
            const name = p.first_name ?? p.full_name ?? p.name ?? "";
            const avatar =
              p.avatar_url ?? p.avatar ?? p.avatarPath ?? p.avatarUrl ?? "";
            profilesMap[p.id] = {
              id: p.id,
              first_name: name,
              full_name: p.full_name,
              avatar_url: avatar,
            };
          });
        }
      }

      const enriched = reports.map((r) => ({
        ...r,
        reporter_name:
          profilesMap[r.reporter_id]?.first_name ||
          profilesMap[r.reporter_id]?.full_name ||
          "",
        avatar_url: profilesMap[r.reporter_id]?.avatar_url || "",
      }));

      onDataLoaded(enriched);
    } catch (err: any) {
      setError(err.message || "Failed to fetch found reports");
      onDataLoaded([]);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded, filter]);

  useEffect(() => {
    fetchFoundReports();
  }, [fetchFoundReports]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2bee79" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return null; // Data is passed via onDataLoaded callback
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#f43f5e",
    fontSize: 14,
    textAlign: "center",
  },
});

export default FoundItems;
