import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Server } from "lucide-react";

interface DiscordAction {
  label: string;
  emoji?: string;
  style: "primary" | "secondary" | "success" | "danger";
}

interface UserInfo {
  user: string;
  referrer: string;
  joinDate: string;
  userId: string;
}

interface DiscordEmbedProps {
  type: "configuration" | "verification" | "admin-notification";
  title: string;
  description: string;
  serverIcon?: string;
  instructions?: string[];
  userInfo?: UserInfo;
  actions: DiscordAction[];
}

export default function DiscordEmbed({
  type,
  title,
  description,
  serverIcon,
  instructions,
  userInfo,
  actions,
}: DiscordEmbedProps) {
  const getButtonStyle = (style: string) => {
    switch (style) {
      case "primary":
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
      case "success":
        return "bg-accent hover:bg-accent/90 text-accent-foreground";
      case "secondary":
        return "bg-secondary hover:bg-secondary/90 text-secondary-foreground";
      case "danger":
        return "bg-destructive hover:bg-destructive/90 text-destructive-foreground";
      default:
        return "bg-muted hover:bg-muted/90 text-muted-foreground";
    }
  };

  return (
    <div className="discord-embed rounded-lg p-6 mb-6 max-w-2xl" data-testid={`discord-embed-${type}`}>
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
          {serverIcon ? (
            <img src={serverIcon} alt="Server Icon" className="w-full h-full rounded-full" />
          ) : (
            <Server className="text-gray-300 w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2" data-testid={`embed-title-${type}`}>
            {title}
          </h3>
          <p className="text-gray-300 text-sm mb-4" data-testid={`embed-description-${type}`}>
            {description}
          </p>
          
          {instructions && (
            <div className="bg-gray-800 rounded-md p-3 mb-4 text-sm">
              <p className="text-gray-300 mb-2"><strong>Como funciona:</strong></p>
              <ol className="text-gray-400 space-y-1 text-xs list-decimal list-inside">
                {instructions.map((instruction, index) => (
                  <li key={index} data-testid={`instruction-${index}`}>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {userInfo && (
            <div className="bg-gray-800 rounded-md p-4 mb-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between" data-testid="user-info-user">
                  <span className="text-gray-400">Usuário:</span>
                  <span className="text-white">{userInfo.user}</span>
                </div>
                <div className="flex justify-between" data-testid="user-info-referrer">
                  <span className="text-gray-400">Indicado por:</span>
                  <span className="text-white">{userInfo.referrer}</span>
                </div>
                <div className="flex justify-between" data-testid="user-info-join-date">
                  <span className="text-gray-400">Data de entrada:</span>
                  <span className="text-white">{userInfo.joinDate}</span>
                </div>
                <div className="flex justify-between" data-testid="user-info-user-id">
                  <span className="text-gray-400">ID do usuário:</span>
                  <span className="text-white font-mono text-xs">{userInfo.userId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={cn(
        "flex gap-3",
        type === "configuration" ? "grid grid-cols-1 sm:grid-cols-2" : "flex-wrap"
      )}>
        {actions.map((action, index) => (
          <Button
            key={index}
            className={cn(
              "discord-button font-medium transition-all",
              getButtonStyle(action.style)
            )}
            data-testid={`action-button-${index}`}
          >
            {action.emoji && <span className="mr-2">{action.emoji}</span>}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <span data-testid="embed-footer">Bot oficial da Gurizes - cpxd</span>
        <span data-testid="embed-timestamp">Hoje às 14:32</span>
      </div>
    </div>
  );
}
