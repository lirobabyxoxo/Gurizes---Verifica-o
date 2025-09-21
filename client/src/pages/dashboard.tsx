import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import DiscordEmbed from "@/components/discord-embed";
import VerificationStats from "@/components/verification-stats";
import RecentActivity from "@/components/recent-activity";
import type { ServerConfig, VerificationStats as StatsType, VerificationRequest } from "@shared/schema";

export default function Dashboard() {
  const serverId = "demo-server-123"; // Demo server ID

  const { data: serverConfig, isLoading: configLoading } = useQuery<ServerConfig>({
    queryKey: ["/api/server-config", serverId],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<StatsType>({
    queryKey: ["/api/verification-stats", serverId],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<VerificationRequest[]>({
    queryKey: ["/api/recent-activity", serverId],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Shield className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-foreground" data-testid="header-title">
                Gurizes - Sistema de Verificação
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Bot oficial da Gurizes - cpxd</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Configuration Panel */}
        <section className="bg-card rounded-lg p-6 border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="config-title">
              Comando: /configurar verificar
            </h2>
            <p className="text-muted-foreground">Configure o sistema de verificação do seu servidor</p>
          </div>

          <DiscordEmbed
            type="configuration"
            title="🔧 Configuração de Verificação"
            description="Configure as opções de verificação para novos membros do servidor."
            serverIcon="/api/placeholder-icon.png"
            actions={[
              { label: "Configurar Canal", emoji: "📝", style: "primary" },
              { label: "Configurar Cargo", emoji: "🏷️", style: "success" },
              { label: "Configurar Embed", emoji: "✏️", style: "secondary" },
              { label: "Configurar Logs", emoji: "📋", style: "secondary" },
            ]}
          />
        </section>

        {/* Verification Embed */}
        <section className="bg-card rounded-lg p-6 border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="verification-title">
              Embed de Verificação - Visão do Usuário
            </h2>
            <p className="text-muted-foreground">Como os novos membros verão a interface de verificação</p>
          </div>

          <DiscordEmbed
            type="verification"
            title="🔐 Sistema de Verificação"
            description="Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente."
            serverIcon="/api/placeholder-icon.png"
            instructions={[
              "Clique no botão 'Verificar' abaixo",
              "Selecione um membro que você conhece no servidor",
              "Aguarde a aprovação de um administrador",
              "Após aprovado, você receberá acesso completo!",
            ]}
            actions={[
              { label: "🔐 Verificar", style: "success" },
            ]}
          />
        </section>

        {/* Admin Notification */}
        <section className="bg-card rounded-lg p-6 border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="admin-notification-title">
              Notificação para Administradores
            </h2>
            <p className="text-muted-foreground">Como os admins recebem as solicitações de verificação</p>
          </div>

          <DiscordEmbed
            type="admin-notification"
            title="⚠️ Nova Solicitação de Verificação"
            description="NovoMembro solicitou verificação e foi indicado por MembroAntigo"
            serverIcon="/api/placeholder-icon.png"
            userInfo={{
              user: "NovoMembro#1234",
              referrer: "MembroAntigo#5678",
              joinDate: "15 de Nov, 2024",
              userId: "123456789012345678",
            }}
            actions={[
              { label: "Aprovar", emoji: "✅", style: "success" },
              { label: "Negar", emoji: "❌", style: "danger" },
              { label: "Ver Perfil", emoji: "👤", style: "secondary" },
            ]}
          />
        </section>

        {/* Stats */}
        <VerificationStats stats={stats} isLoading={statsLoading} />

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} isLoading={activityLoading} />
      </main>

      <footer className="bg-card border-t border-border py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Bot oficial da Gurizes - cpxd | Sistema de Verificação Discord</p>
        </div>
      </footer>
    </div>
  );
}
