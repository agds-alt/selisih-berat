/**
 * Environment Configuration
 *
 * Type-safe environment variable access with validation.
 * All environment variables should be accessed through this module.
 */

/**
 * Get environment variable with type safety
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key]

  if (!value && !defaultValue) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    console.warn(`Missing environment variable: ${key}`)
    return ''
  }

  return value || defaultValue || ''
}

/**
 * Get required environment variable (throws if missing)
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue = false): boolean {
  const value = process.env[key]

  if (!value) {
    return defaultValue
  }

  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, defaultValue?: number): number {
  const value = process.env[key]

  if (!value) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required number environment variable: ${key}`)
    }
    return defaultValue
  }

  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`)
  }

  return parsed
}

/**
 * Get array environment variable (comma-separated)
 */
function getArrayEnv(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key]

  if (!value) {
    return defaultValue
  }

  return value.split(',').map(v => v.trim()).filter(Boolean)
}

/**
 * Environment configuration object
 */
export const env = {
  // Node Environment
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
  isTest: getEnv('NODE_ENV', 'development') === 'test',

  // Server
  PORT: getNumberEnv('PORT', 3000),

  // Supabase
  supabase: {
    url: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },

  // Cloudinary
  cloudinary: {
    cloudName: getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    uploadPreset: getEnv('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'),
    folder: getEnv('NEXT_PUBLIC_CLOUDINARY_FOLDER', 'selisih-berat'),
  },

  // Security
  security: {
    allowedOrigins: getArrayEnv('ALLOWED_ORIGINS', ['http://localhost:3000']),
    sessionSecret: getEnv('SESSION_SECRET'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
  },

  // Rate Limiting
  rateLimit: {
    loginWindow: getNumberEnv('LOGIN_RATE_LIMIT_WINDOW', 900000), // 15 minutes
    loginMax: getNumberEnv('LOGIN_RATE_LIMIT_MAX', 5),
    apiWindow: getNumberEnv('API_RATE_LIMIT_WINDOW', 60000), // 1 minute
    apiMax: getNumberEnv('API_RATE_LIMIT_MAX', 30),
  },

  // Analytics
  analytics: {
    enabled: getBooleanEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', false),
    endpoint: getEnv('NEXT_PUBLIC_ANALYTICS_ENDPOINT'),
    googleAnalyticsId: getEnv('NEXT_PUBLIC_GA_ID'),
  },

  // Features
  features: {
    enablePWA: getBooleanEnv('NEXT_PUBLIC_ENABLE_PWA', true),
    enableOfflineMode: getBooleanEnv('NEXT_PUBLIC_ENABLE_OFFLINE', true),
    enablePhotoUpload: getBooleanEnv('NEXT_PUBLIC_ENABLE_PHOTO_UPLOAD', true),
    enableBarcodeScanner: getBooleanEnv('NEXT_PUBLIC_ENABLE_BARCODE_SCANNER', true),
  },

  // App Configuration
  app: {
    name: getEnv('NEXT_PUBLIC_APP_NAME', 'Selisih Berat'),
    version: getEnv('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
    baseUrl: getEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000'),
  },
} as const

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'JWT_SECRET',
  ]

  const missing: string[] = []

  requiredVars.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`

    if (env.isProduction) {
      throw new Error(message)
    } else {
      console.warn(`⚠️  ${message}`)
    }
  }

  return missing.length === 0
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof env.features): boolean {
  return env.features[feature]
}

/**
 * Get all environment variables (sanitized for logging)
 */
export function getEnvSummary() {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    supabaseConfigured: Boolean(env.supabase.url && env.supabase.anonKey),
    cloudinaryConfigured: Boolean(env.cloudinary.cloudName),
    analyticsEnabled: env.analytics.enabled,
    features: env.features,
  }
}

// Validate on module load in production
if (env.isProduction) {
  validateEnv()
}

export default env
