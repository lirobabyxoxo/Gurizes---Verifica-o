import { Check, Clock } from "lucide-react";
import type { VerificationRequest } from "@shared/schema";

interface RecentActivityProps {
  activities?: VerificationRequest[];
  isLoading: boolean;
}

export default function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <section className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full mb-2" />
                <div className="h-4 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="text-accent-foreground w-4 h-4" />;
      case "rejected":
        return <Check className="text-destructive-foreground w-4 h-4" />;
      default:
        return <Clock className="text-primary-foreground w-4 h-4" />;
    }
  };

  const getActivityBgColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent";
      case "rejected":
        return "bg-destructive";
      default:
        return "bg-primary";
    }
  };

  const getActivityText = (activity: VerificationRequest) => {
    if (activity.status === "approved") {
      return (
        <>
          <span className="font-medium">{activity.approvedByUsername}</span> aprovou a verificação de{" "}
          <span className="font-medium">{activity.username}</span>
        </>
      );
    } else if (activity.status === "rejected") {
      return (
        <>
          <span className="font-medium">{activity.approvedByUsername}</span> negou a verificação de{" "}
          <span className="font-medium">{activity.username}</span>
        </>
      );
    } else {
      return (
        <>
          <span className="font-medium">{activity.username}</span> solicitou verificação indicado por{" "}
          <span className="font-medium">{activity.referrerUsername}</span>
        </>
      );
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "agora mesmo";
    if (diffInMinutes === 1) return "1 minuto atrás";
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hora atrás";
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 dia atrás";
    return `${diffInDays} dias atrás`;
  };

  return (
    <section className="bg-card rounded-lg p-6 border border-border" data-testid="recent-activity">
      <h2 className="text-xl font-bold text-foreground mb-4" data-testid="activity-title">
        Atividade Recente
      </h2>
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg"
              data-testid={`activity-item-${index}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBgColor(
                  activity.status
                )}`}
              >
                {getActivityIcon(activity.status)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground" data-testid={`activity-text-${index}`}>
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-time-${index}`}>
                  {formatTimeAgo(activity.updatedAt!)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground" data-testid="no-activity-message">
              Nenhuma atividade recente encontrada
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
