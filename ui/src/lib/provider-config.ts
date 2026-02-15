import {
  CLIPROXY_PROVIDER_IDS,
  getProviderCapabilities,
  mapExternalProviderName,
  type OAuthFlowType,
} from '../../../src/cliproxy/provider-capabilities';
import type { CLIProxyProvider as CanonicalCLIProxyProvider } from '../../../src/cliproxy/types';

/**
 * Canonical list of CLIProxy provider IDs (backend-defined).
 */
export const CLIPROXY_PROVIDERS: readonly CanonicalCLIProxyProvider[] = [...CLIPROXY_PROVIDER_IDS];

export type CLIProxyProvider = CanonicalCLIProxyProvider;
export type ProviderOAuthFlowType = OAuthFlowType;

interface ProviderMetadata {
  displayName: string;
  setupName: string;
  setupDescription: string;
  deviceCodeDisplayName: string;
  color: string;
  assetPath: string | null;
  oauthFlow: ProviderOAuthFlowType;
  nicknameRequired: boolean;
  logoFallbackTextClass: string;
  logoFallbackLetter: string;
  wizardOrder: number;
}

interface UiProviderMetadataInput {
  color: string;
  setupDescription: string;
  deviceCodeDisplayName?: string;
  logoFallbackTextClass: string;
  logoFallbackLetter: string;
  wizardOrder: number;
}

const UI_PROVIDER_METADATA: Record<CLIProxyProvider, UiProviderMetadataInput> = {
  gemini: {
    color: '#4285F4',
    setupDescription: 'Gemini Pro/Flash models',
    deviceCodeDisplayName: 'Gemini',
    logoFallbackTextClass: 'text-blue-600',
    logoFallbackLetter: 'G',
    wizardOrder: 3,
  },
  codex: {
    color: '#10a37f',
    setupDescription: 'GPT-4 and codex models',
    deviceCodeDisplayName: 'Codex',
    logoFallbackTextClass: 'text-emerald-600',
    logoFallbackLetter: 'X',
    wizardOrder: 4,
  },
  agy: {
    color: '#f3722c',
    setupDescription: 'Antigravity AI models',
    deviceCodeDisplayName: 'Antigravity',
    logoFallbackTextClass: 'text-violet-600',
    logoFallbackLetter: 'A',
    wizardOrder: 1,
  },
  qwen: {
    color: '#6236FF',
    setupDescription: 'Qwen Code models',
    deviceCodeDisplayName: 'Qwen Code',
    logoFallbackTextClass: 'text-cyan-600',
    logoFallbackLetter: 'Q',
    wizardOrder: 5,
  },
  iflow: {
    color: '#f94144',
    setupDescription: 'iFlow AI models',
    deviceCodeDisplayName: 'iFlow',
    logoFallbackTextClass: 'text-indigo-600',
    logoFallbackLetter: 'I',
    wizardOrder: 6,
  },
  kiro: {
    color: '#4d908e',
    setupDescription: 'AWS CodeWhisperer models',
    deviceCodeDisplayName: 'Kiro (AWS)',
    logoFallbackTextClass: 'text-teal-600',
    logoFallbackLetter: 'K',
    wizardOrder: 7,
  },
  ghcp: {
    color: '#43aa8b',
    setupDescription: 'GitHub Copilot via OAuth',
    deviceCodeDisplayName: 'GitHub Copilot',
    logoFallbackTextClass: 'text-green-600',
    logoFallbackLetter: 'C',
    wizardOrder: 8,
  },
  claude: {
    color: '#D97757',
    setupDescription: 'Claude Opus/Sonnet models',
    deviceCodeDisplayName: 'Claude',
    logoFallbackTextClass: 'text-orange-600',
    logoFallbackLetter: 'C',
    wizardOrder: 2,
  },
};

const PROVIDER_METADATA: Record<CLIProxyProvider, ProviderMetadata> = CLIPROXY_PROVIDERS.reduce(
  (metadata, provider) => {
    const capabilities = getProviderCapabilities(provider);
    const uiMetadata = UI_PROVIDER_METADATA[provider];
    metadata[provider] = {
      displayName: capabilities.displayName,
      setupName: capabilities.displayName,
      setupDescription: uiMetadata.setupDescription,
      deviceCodeDisplayName: uiMetadata.deviceCodeDisplayName ?? capabilities.displayName,
      color: uiMetadata.color,
      assetPath: capabilities.logoAssetPath,
      oauthFlow: capabilities.oauthFlow,
      nicknameRequired: capabilities.features.requiresNickname,
      logoFallbackTextClass: uiMetadata.logoFallbackTextClass,
      logoFallbackLetter: uiMetadata.logoFallbackLetter,
      wizardOrder: uiMetadata.wizardOrder,
    };
    return metadata;
  },
  {} as Record<CLIProxyProvider, ProviderMetadata>
);

const LEGACY_PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  vertex: 'Vertex AI',
};

const LEGACY_PROVIDER_COLORS: Record<string, string> = {
  vertex: '#4285F4',
};

function getCanonicalProvider(provider: string): CLIProxyProvider | null {
  const normalized = provider.trim().toLowerCase();
  if (CLIPROXY_PROVIDERS.includes(normalized as CLIProxyProvider)) {
    return normalized as CLIProxyProvider;
  }
  return mapExternalProviderName(normalized);
}

export function isValidProvider(provider: string): provider is CLIProxyProvider {
  return getCanonicalProvider(provider) !== null;
}

export function getProviderMetadata(provider: string): ProviderMetadata | null {
  const canonicalProvider = getCanonicalProvider(provider);
  if (!canonicalProvider) {
    return null;
  }
  return PROVIDER_METADATA[canonicalProvider];
}

export const PROVIDER_ASSETS: Record<string, string> = CLIPROXY_PROVIDERS.reduce(
  (assets, provider) => {
    const assetPath = PROVIDER_METADATA[provider].assetPath;
    if (assetPath) {
      assets[provider] = assetPath;
    }
    return assets;
  },
  {} as Record<string, string>
);

export const PROVIDER_COLORS: Record<string, string> = {
  ...CLIPROXY_PROVIDERS.reduce(
    (colors, provider) => {
      colors[provider] = PROVIDER_METADATA[provider].color;
      return colors;
    },
    {} as Record<string, string>
  ),
  ...LEGACY_PROVIDER_COLORS,
};

export function getProviderDisplayName(provider: string): string {
  const metadata = getProviderMetadata(provider);
  if (metadata) {
    return metadata.displayName;
  }
  return LEGACY_PROVIDER_DISPLAY_NAMES[provider.toLowerCase()] || provider;
}

export function getProviderDeviceCodeDisplayName(provider: string): string {
  const metadata = getProviderMetadata(provider);
  if (metadata) {
    return metadata.deviceCodeDisplayName;
  }
  return getProviderDisplayName(provider);
}

export function getProviderSetupInfo(provider: CLIProxyProvider): {
  name: string;
  description: string;
} {
  const metadata = PROVIDER_METADATA[provider];
  return {
    name: metadata.setupName,
    description: metadata.setupDescription,
  };
}

export function getProviderLogoMetadata(provider: string): {
  assetPath: string | null;
  textClass: string;
  letter: string;
} {
  const metadata = getProviderMetadata(provider);
  if (metadata) {
    return {
      assetPath: metadata.assetPath,
      textClass: metadata.logoFallbackTextClass,
      letter: metadata.logoFallbackLetter,
    };
  }
  return {
    assetPath: null,
    textClass: 'text-gray-600',
    letter: provider[0]?.toUpperCase() || '?',
  };
}

export const DEVICE_CODE_PROVIDERS: CLIProxyProvider[] = CLIPROXY_PROVIDERS.filter(
  (provider) => PROVIDER_METADATA[provider].oauthFlow === 'device_code'
);

export const WIZARD_PROVIDER_ORDER: CLIProxyProvider[] = [...CLIPROXY_PROVIDERS].sort(
  (left, right) => PROVIDER_METADATA[left].wizardOrder - PROVIDER_METADATA[right].wizardOrder
);

export function isDeviceCodeProvider(provider: string): boolean {
  const metadata = getProviderMetadata(provider);
  return metadata?.oauthFlow === 'device_code';
}

export const NICKNAME_REQUIRED_PROVIDERS: CLIProxyProvider[] = CLIPROXY_PROVIDERS.filter(
  (provider) => PROVIDER_METADATA[provider].nicknameRequired
);

export function isNicknameRequiredProvider(provider: string): boolean {
  const metadata = getProviderMetadata(provider);
  return metadata?.nicknameRequired ?? false;
}

export const KIRO_AUTH_METHODS = ['aws', 'aws-authcode', 'google', 'github'] as const;
export type KiroAuthMethod = (typeof KIRO_AUTH_METHODS)[number];

export type KiroFlowType = 'authorization_code' | 'device_code';
export type KiroStartEndpoint = 'start' | 'start-url';

export interface KiroAuthMethodOption {
  id: KiroAuthMethod;
  label: string;
  description: string;
  flowType: KiroFlowType;
  startEndpoint: KiroStartEndpoint;
}

export const DEFAULT_KIRO_AUTH_METHOD: KiroAuthMethod = 'aws';

export const KIRO_AUTH_METHOD_OPTIONS: readonly KiroAuthMethodOption[] = [
  {
    id: 'aws',
    label: 'AWS Builder ID (Recommended)',
    description: 'Device code flow for AWS organizations and Builder ID accounts.',
    flowType: 'device_code',
    startEndpoint: 'start',
  },
  {
    id: 'aws-authcode',
    label: 'AWS Builder ID (Auth Code)',
    description: 'Authorization code flow via CLI binary.',
    flowType: 'authorization_code',
    startEndpoint: 'start',
  },
  {
    id: 'google',
    label: 'Google OAuth',
    description: 'Social OAuth flow with callback URL support.',
    flowType: 'authorization_code',
    startEndpoint: 'start-url',
  },
  {
    id: 'github',
    label: 'GitHub OAuth',
    description: 'Social OAuth flow via management API callback.',
    flowType: 'authorization_code',
    startEndpoint: 'start-url',
  },
];
