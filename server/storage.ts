import { type User, type InsertUser, type ServerConfig, type InsertServerConfig, type VerificationRequest, type InsertVerificationRequest, type VerificationStats, type InsertVerificationStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Server config methods
  getServerConfig(serverId: string): Promise<ServerConfig | undefined>;
  createOrUpdateServerConfig(serverId: string, config: Partial<InsertServerConfig>): Promise<ServerConfig>;

  // Verification request methods
  getVerificationRequests(serverId: string, status?: string): Promise<VerificationRequest[]>;
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  updateVerificationRequest(id: string, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined>;

  // Stats methods
  getVerificationStats(serverId: string): Promise<VerificationStats | undefined>;
  updateVerificationStats(serverId: string, stats: Partial<InsertVerificationStats>): Promise<VerificationStats>;

  // Recent activity
  getRecentActivity(serverId: string, limit?: number): Promise<VerificationRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serverConfigs: Map<string, ServerConfig>;
  private verificationRequests: Map<string, VerificationRequest>;
  private verificationStats: Map<string, VerificationStats>;

  constructor() {
    this.users = new Map();
    this.serverConfigs = new Map();
    this.verificationRequests = new Map();
    this.verificationStats = new Map();

    // Initialize with sample data for demo server
    const demoServerId = "demo-server-123";
    this.serverConfigs.set(demoServerId, {
      id: randomUUID(),
      serverId: demoServerId,
      verificationChannelId: "verification-channel-123",
      verificationRoleId: "verified-role-123",
      logsChannelId: "logs-channel-123",
      embedTitle: "🔐 Sistema de Verificação",
      embedDescription: "Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.verificationStats.set(demoServerId, {
      id: randomUUID(),
      serverId: demoServerId,
      totalVerified: "247",
      totalPending: "8",
      totalRejected: "12",
      updatedAt: new Date(),
    });

    // Add some sample verification requests
    const sampleRequests = [
      {
        id: randomUUID(),
        serverId: demoServerId,
        userId: "user-123",
        username: "NovoUsuario#5678",
        referrerId: "referrer-123",
        referrerUsername: "Veterano#1111",
        status: "approved",
        approvedBy: "admin-123",
        approvedByUsername: "Admin#1234",
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        updatedAt: new Date(Date.now() - 2 * 60 * 1000),
      },
      {
        id: randomUUID(),
        serverId: demoServerId,
        userId: "user-456",
        username: "OutroMembro#9999",
        referrerId: "referrer-456",
        referrerUsername: "Veterano#1111",
        status: "pending",
        approvedBy: null,
        approvedByUsername: null,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        updatedAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    ];

    sampleRequests.forEach(req => {
      this.verificationRequests.set(req.id, req);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getServerConfig(serverId: string): Promise<ServerConfig | undefined> {
    return Array.from(this.serverConfigs.values()).find(
      config => config.serverId === serverId
    );
  }

  async createOrUpdateServerConfig(serverId: string, config: Partial<InsertServerConfig>): Promise<ServerConfig> {
    const existing = await this.getServerConfig(serverId);
    
    if (existing) {
      const updated: ServerConfig = {
        ...existing,
        ...config,
        serverId,
        updatedAt: new Date(),
      };
      this.serverConfigs.set(existing.id, updated);
      return updated;
    } else {
      const newConfig: ServerConfig = {
        id: randomUUID(),
        serverId,
        verificationChannelId: null,
        verificationRoleId: null,
        logsChannelId: null,
        embedTitle: "🔐 Sistema de Verificação",
        embedDescription: "Bem-vindo ao servidor! Para ter acesso completo, você precisa ser verificado por um membro existente.",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...config,
      };
      this.serverConfigs.set(newConfig.id, newConfig);
      return newConfig;
    }
  }

  async getVerificationRequests(serverId: string, status?: string): Promise<VerificationRequest[]> {
    return Array.from(this.verificationRequests.values())
      .filter(req => req.serverId === serverId && (!status || req.status === status))
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest> {
    const id = randomUUID();
    const newRequest: VerificationRequest = {
      id,
      ...request,
      status: "pending",
      approvedBy: null,
      approvedByUsername: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.verificationRequests.set(id, newRequest);
    return newRequest;
  }

  async updateVerificationRequest(id: string, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined> {
    const existing = this.verificationRequests.get(id);
    if (!existing) return undefined;

    const updated: VerificationRequest = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.verificationRequests.set(id, updated);
    return updated;
  }

  async getVerificationStats(serverId: string): Promise<VerificationStats | undefined> {
    return Array.from(this.verificationStats.values()).find(
      stats => stats.serverId === serverId
    );
  }

  async updateVerificationStats(serverId: string, stats: Partial<InsertVerificationStats>): Promise<VerificationStats> {
    const existing = await this.getVerificationStats(serverId);
    
    if (existing) {
      const updated: VerificationStats = {
        ...existing,
        ...stats,
        updatedAt: new Date(),
      };
      this.verificationStats.set(existing.id, updated);
      return updated;
    } else {
      const newStats: VerificationStats = {
        id: randomUUID(),
        serverId,
        totalVerified: "0",
        totalPending: "0",
        totalRejected: "0",
        updatedAt: new Date(),
        ...stats,
      };
      this.verificationStats.set(newStats.id, newStats);
      return newStats;
    }
  }

  async getRecentActivity(serverId: string, limit: number = 10): Promise<VerificationRequest[]> {
    return Array.from(this.verificationRequests.values())
      .filter(req => req.serverId === serverId && req.status !== 'pending')
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
