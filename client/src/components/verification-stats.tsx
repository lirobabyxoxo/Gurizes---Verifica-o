import { Users, Clock, Ban } from "lucide-react";
import type { VerificationStats } from "@shared/schema";

interface VerificationStatsProps {
  stats?: VerificationStats;
  isLoading: boolean;
}

export default function VerificationStats({ stats, isLoading }: VerificationStatsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg p-6 border border-border">
            <div className="animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full mb-3" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="verification-stats">
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
            <Users className="text-accent w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground" data-testid="verified-label">
              Membros Verificados
            </h3>
            <p className="text-2xl font-bold text-accent" data-testid="verified-count">
              {stats?.totalVerified || "0"}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Total de membros verificados no servidor</p>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Clock className="text-primary w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground" data-testid="pending-label">
              Aguardando
            </h3>
            <p className="text-2xl font-bold text-primary" data-testid="pending-count">
              {stats?.totalPending || "0"}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Verificações pendentes</p>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
            <Ban className="text-destructive w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground" data-testid="rejected-label">
              Rejeitadas
            </h3>
            <p className="text-2xl font-bold text-destructive" data-testid="rejected-count">
              {stats?.totalRejected || "0"}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Verificações negadas este mês</p>
      </div>
    </section>
  );
}
