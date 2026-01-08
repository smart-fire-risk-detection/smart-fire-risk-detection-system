import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useSensorData, Alert } from "../../hooks/useSensorData";
import { AlertTriangle, Bell, CheckCircle, XCircle } from "lucide-react";

export const RealTimeAlerts = () => {
  const { alerts = [], loading = false } = useSensorData();
  const [displayedAlerts, setDisplayedAlerts] = useState<Alert[]>([]);
  
  // Add console log to debug alerts data
  console.log("RealTimeAlerts component:", { alerts, loading });
  
  // Filter alerts to only show recent ones (last 24 hours)
  useEffect(() => {
    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      setDisplayedAlerts([]);
      return;
    }
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    try {
      const recent = alerts
        .filter(alert => alert && alert.created_at && new Date(alert.created_at) > oneDayAgo)
        .slice(0, 5); // Show only latest 5
      
      setDisplayedAlerts(recent);
    } catch (error) {
      console.error("Error filtering alerts:", error);
      setDisplayedAlerts([]);
    }
  }, [alerts]);

  // Get alert icon based on severity
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'medium':
        return <Bell className="h-4 w-4 text-yellow-400" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/50 dark:border-slate-800/60 bg-white/50 backdrop-blur-md dark:bg-slate-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          Real-Time Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className={loading ? "opacity-70" : ""}>
        {loading && displayedAlerts.length === 0 ? (
          <div className="text-center p-6 animate-pulse">
            <Bell className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-70" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading alerts...</p>
          </div>
        ) : displayedAlerts.length > 0 ? (
          <div className="space-y-3 stagger-children">
            {displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm border 
                ${alert.severity === 'critical' 
                  ? 'border-red-300/30 dark:border-red-800/30' 
                  : alert.severity === 'high'
                    ? 'border-orange-300/30 dark:border-orange-800/30'
                    : 'border-slate-200/30 dark:border-slate-800/30'
                }
                transition-all hover:bg-white/30 dark:hover:bg-slate-900/60`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.severity)}
                    <Badge 
                      className={`${
                        alert.severity === 'critical' 
                          ? 'bg-red-500/90 hover:bg-red-600 text-white animate-pulse-glow' 
                          : alert.severity === 'high'
                            ? 'bg-orange-500/90 hover:bg-orange-600 text-white'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-500/90 hover:bg-yellow-600 text-white'
                              : 'bg-blue-500/90 hover:bg-blue-600 text-white'
                      } px-2 py-0.5 text-xs font-semibold uppercase`}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'Unknown time'}
                  </span>
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent alerts</p>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/30 text-center">
          <button className="text-xs text-emerald-500 dark:text-emerald-400 font-medium hover:text-emerald-600 dark:hover:text-emerald-300">
            View All Alerts →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};