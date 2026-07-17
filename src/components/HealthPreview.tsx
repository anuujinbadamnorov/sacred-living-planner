"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export interface HealthPreviewData {
  readiness: number;
  sleep: number;
  activity: number;
  date: string;
}

interface HealthPreviewProps {
  token: string;
  onDataLoaded?: (data: HealthPreviewData) => void;
}

export default function HealthPreview({ token, onDataLoaded }: HealthPreviewProps) {
  const [data, setData] = useState<HealthPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/oura?token=${token}&date=${today}`);

        if (!res.ok) {
          throw new Error("Failed to fetch Oura data");
        }

        const ouraData = await res.json();

        const healthData: HealthPreviewData = {
          readiness: ouraData.readiness?.score ?? ouraData.readiness_score ?? 0,
          sleep: ouraData.sleep?.score ?? ouraData.sleep_score ?? 0,
          activity: ouraData.activity?.score ?? ouraData.activity_score ?? 0,
          date: today,
        };

        setData(healthData);
        onDataLoaded?.(healthData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, onDataLoaded]);

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          {error ? `Oura: ${error}` : "No Oura data available"}
        </p>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Health Overview</h3>
        <span className="text-xs text-muted-foreground">{data.date}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Readiness</p>
          <p className={`text-2xl font-bold ${getScoreColor(data.readiness)}`}>
            {data.readiness}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Sleep</p>
          <p className={`text-2xl font-bold ${getScoreColor(data.sleep)}`}>
            {data.sleep}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Activity</p>
          <p className={`text-2xl font-bold ${getScoreColor(data.activity)}`}>
            {data.activity}
          </p>
        </div>
      </div>
    </Card>
  );
}

export { HealthPreview };
