import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

// Configuration interface
interface SecretConfig {
  provider: "aws" | "azure";
  secretName: string;
  region?: string; // For AWS
  vaultUrl?: string; // For Azure
}

// Secret retrieval result
interface SecretResult {
  success: boolean;
  data?: Record<string, string>;
  error?: string;
}

/**
 * AWS Secrets Manager Client
 */
class AWSSecretsManager {
  private client: SecretsManagerClient;
  private secretArn: string;

  constructor(secretArn: string, region: string = "us-east-1") {
    this.secretArn = secretArn;
    this.client = new SecretsManagerClient({ region });
  }

  async getSecret(): Promise<SecretResult> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: this.secretArn,
      });

      const response = await this.client.send(command);

      if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);
        return {
          success: true,
          data: secrets,
        };
      }

      return {
        success: false,
        error: "No secret string found",
      };
    } catch (error: any) {
      console.error("AWS Secrets Manager error:", error);
      return {
        success: false,
        error: `Failed to retrieve secret: ${error.message}`,
      };
    }
  }

  // Get specific secret value
  async getSecretValue(key: string): Promise<string | null> {
    const result = await this.getSecret();
    if (result.success && result.data) {
      return result.data[key] || null;
    }
    return null;
  }
}

/**
 * Azure Key Vault Client
 */
class AzureKeyVault {
  private client: SecretClient;

  constructor(vaultName: string) {
    const vaultUrl = `https://${vaultName}.vault.azure.net`;
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(vaultUrl, credential);
  }

  async getSecret(secretName: string): Promise<SecretResult> {
    try {
      const secret = await this.client.getSecret(secretName);
      return {
        success: true,
        data: { [secretName]: secret.value! },
      };
    } catch (error: any) {
      console.error("Azure Key Vault error:", error);
      return {
        success: false,
        error: `Failed to retrieve secret: ${error.message}`,
      };
    }
  }

  async getSecretValue(secretName: string): Promise<string | null> {
    try {
      const secret = await this.client.getSecret(secretName);
      return secret.value || null;
    } catch (error: any) {
      console.error("Azure Key Vault error:", error);
      return null;
    }
  }

  // Get multiple secrets
  async getSecrets(secretNames: string[]): Promise<SecretResult> {
    try {
      const secrets: Record<string, string> = {};

      for (const name of secretNames) {
        const secret = await this.client.getSecret(name);
        if (secret.value) {
          secrets[name] = secret.value;
        }
      }

      return {
        success: true,
        data: secrets,
      };
    } catch (error: any) {
      console.error("Azure Key Vault batch error:", error);
      return {
        success: false,
        error: `Failed to retrieve secrets: ${error.message}`,
      };
    }
  }
}

/**
 * Universal Secret Manager
 */
export class SecretManager {
  private awsManager: AWSSecretsManager | null = null;
  private azureManager: AzureKeyVault | null = null;
  private provider: "aws" | "azure";

  constructor(config: SecretConfig) {
    this.provider = config.provider;

    if (config.provider === "aws" && process.env.SECRET_ARN) {
      this.awsManager = new AWSSecretsManager(
        process.env.SECRET_ARN,
        config.region
      );
    } else if (config.provider === "azure" && process.env.KEYVAULT_NAME) {
      this.azureManager = new AzureKeyVault(process.env.KEYVAULT_NAME);
    }
  }

  // Get all secrets
  async getAllSecrets(): Promise<SecretResult> {
    if (this.provider === "aws" && this.awsManager) {
      return await this.awsManager.getSecret();
    } else if (this.provider === "azure" && this.azureManager) {
      // For Azure, we need to know which secrets to retrieve
      const secretNames = [
        "DATABASE_URL",
        "JWT_SECRET",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "SENDGRID_API_KEY",
      ];
      return await this.azureManager.getSecrets(secretNames);
    }

    return {
      success: false,
      error: "Secret manager not configured or environment variables missing",
    };
  }

  // Get specific secret value
  async getSecretValue(key: string): Promise<string | null> {
    if (this.provider === "aws" && this.awsManager) {
      return await this.awsManager.getSecretValue(key);
    } else if (this.provider === "azure" && this.azureManager) {
      return await this.azureManager.getSecretValue(key);
    }
    return null;
  }

  // Initialize with fallback to environment variables
  static async initializeWithFallback(
    config: SecretConfig
  ): Promise<Record<string, string>> {
    const manager = new SecretManager(config);
    const result = await manager.getAllSecrets();

    if (result.success && result.data) {
      console.log("✅ Secrets retrieved from cloud provider");
      return result.data;
    }

    console.warn("⚠️  Falling back to environment variables");
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      JWT_SECRET: process.env.JWT_SECRET || "",
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
      AWS_REGION: process.env.AWS_REGION || "us-east-1",
      AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "kalvium-app-storage",
    };
  }
}

// Export utility functions
export async function getSecrets(): Promise<Record<string, string>> {
  // Determine provider based on environment variables
  const provider = process.env.SECRET_ARN
    ? "aws"
    : process.env.KEYVAULT_NAME
      ? "azure"
      : null;

  if (!provider) {
    console.warn(
      "No cloud secret provider configured, using environment variables"
    );
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      JWT_SECRET: process.env.JWT_SECRET || "",
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
      AWS_REGION: process.env.AWS_REGION || "us-east-1",
      AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "kalvium-app-storage",
    };
  }

  const config: SecretConfig = {
    provider: provider as "aws" | "azure",
    secretName: provider === "aws" ? process.env.SECRET_ARN! : "app-secrets",
    region: process.env.AWS_REGION || "us-east-1",
    vaultUrl:
      provider === "azure"
        ? `https://${process.env.KEYVAULT_NAME}.vault.azure.net`
        : undefined,
  };

  return await SecretManager.initializeWithFallback(config);
}

// Export individual secret retrieval
export async function getSecretValue(key: string): Promise<string | null> {
  const provider = process.env.SECRET_ARN
    ? "aws"
    : process.env.KEYVAULT_NAME
      ? "azure"
      : null;

  if (!provider) {
    return process.env[key] || null;
  }

  const config: SecretConfig = {
    provider: provider as "aws" | "azure",
    secretName: provider === "aws" ? process.env.SECRET_ARN! : key,
    region: process.env.AWS_REGION || "us-east-1",
  };

  const manager = new SecretManager(config);
  return await manager.getSecretValue(key);
}

// Export managers for direct use
export { AWSSecretsManager, AzureKeyVault };
