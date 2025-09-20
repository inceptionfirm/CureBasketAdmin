#!/usr/bin/env node

/**
 * Client Setup Script
 * Automates the process of setting up a new client for the pharmaceutical e-commerce platform
 * 
 * Usage: node scripts/setup-client.js <client-name>
 * Example: node scripts/setup-client.js "MediCare Plus"
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// Client configuration template
const createClientConfig = (clientData) => ({
  id: clientData.id,
  name: clientData.name,
  domain: clientData.domain,
  branding: {
    name: clientData.name,
    logo: clientData.logo || '/logo.png',
    favicon: clientData.favicon || '/favicon.ico',
    primaryColor: clientData.primaryColor || '#3b82f6',
    secondaryColor: clientData.secondaryColor || '#1e40af',
    accentColor: clientData.accentColor || '#06b6d4',
    backgroundColor: clientData.backgroundColor || '#ffffff',
    textColor: clientData.textColor || '#1f2937',
    fontFamily: clientData.fontFamily || 'Inter, sans-serif',
  },
  features: {
    enableInventory: clientData.features?.inventory ?? true,
    enablePrescriptions: clientData.features?.prescriptions ?? true,
    enableBulkUpload: clientData.features?.bulkUpload ?? true,
    enableAnalytics: clientData.features?.analytics ?? true,
    enableReports: clientData.features?.reports ?? true,
    enableNotifications: clientData.features?.notifications ?? true,
    enableMultiLanguage: clientData.features?.multiLanguage ?? true,
    enableMultiCurrency: clientData.features?.multiCurrency ?? true,
    enableUserManagement: clientData.features?.userManagement ?? true,
    enableRoleManagement: clientData.features?.roleManagement ?? true,
    enableAuditLogs: clientData.features?.auditLogs ?? true,
    enableBackup: clientData.features?.backup ?? true,
    enableAPI: clientData.features?.api ?? true,
    enablePrescriptionUpload: clientData.features?.prescriptionUpload ?? true,
    enableDoctorVerification: clientData.features?.doctorVerification ?? true,
    enableInsuranceIntegration: clientData.features?.insuranceIntegration ?? false,
    enableDeliveryTracking: clientData.features?.deliveryTracking ?? true,
    enableStockManagement: clientData.features?.stockManagement ?? true,
  },
  modules: {
    dashboard: clientData.modules?.dashboard ?? true,
    products: clientData.modules?.products ?? true,
    orders: clientData.modules?.orders ?? true,
    customers: clientData.modules?.customers ?? true,
    inventory: clientData.modules?.inventory ?? true,
    prescriptions: clientData.modules?.prescriptions ?? true,
    medicines: clientData.modules?.medicines ?? true,
    categories: clientData.modules?.categories ?? true,
    manufacturers: clientData.modules?.manufacturers ?? true,
    blogs: clientData.modules?.blogs ?? true,
    banners: clientData.modules?.banners ?? true,
    notifications: clientData.modules?.notifications ?? true,
    users: clientData.modules?.users ?? true,
    roles: clientData.modules?.roles ?? true,
    settings: clientData.modules?.settings ?? true,
    analytics: clientData.modules?.analytics ?? true,
    reports: clientData.modules?.reports ?? true,
  },
  api: {
    baseURL: clientData.api?.baseURL || `https://api.${clientData.domain}`,
    version: clientData.api?.version || 'v1',
    endpoints: {
      auth: '/auth',
      products: '/products',
      orders: '/orders',
      customers: '/customers',
      prescriptions: '/prescriptions',
      medicines: '/medicines',
      categories: '/categories',
      users: '/users',
      analytics: '/analytics',
      upload: '/upload',
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  },
  settings: {
    timezone: clientData.settings?.timezone || 'Asia/Kolkata',
    currency: clientData.settings?.currency || 'INR',
    language: clientData.settings?.language || 'en',
    dateFormat: clientData.settings?.dateFormat || 'DD/MM/YYYY',
    numberFormat: clientData.settings?.numberFormat || 'en-IN',
  },
  deployment: {
    environment: 'production',
    version: '1.0.0',
    buildDate: new Date().toISOString(),
  },
});

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt function
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

// Main setup function
async function setupClient() {
  try {
    log.header('🏥 Pharmaceutical E-commerce Platform - Client Setup');
    
    const clientName = process.argv[2];
    if (!clientName) {
      log.error('Please provide a client name');
      log.info('Usage: node scripts/setup-client.js <client-name>');
      process.exit(1);
    }

    log.info(`Setting up client: ${clientName}`);

    // Collect client information
    const clientData = {
      id: clientName.toLowerCase().replace(/\s+/g, '-'),
      name: clientName,
    };

    // Basic information
    clientData.domain = await prompt('Domain (e.g., medicare-plus.com): ') || `${clientData.id}.com`;
    
    // Branding
    log.info('\n🎨 Branding Configuration:');
    clientData.primaryColor = await prompt('Primary color (default: #3b82f6): ') || '#3b82f6';
    clientData.secondaryColor = await prompt('Secondary color (default: #1e40af): ') || '#1e40af';
    clientData.accentColor = await prompt('Accent color (default: #06b6d4): ') || '#06b6d4';
    clientData.logo = await prompt('Logo path (default: /logo.png): ') || '/logo.png';
    clientData.favicon = await prompt('Favicon path (default: /favicon.ico): ') || '/favicon.ico';

    // Features
    log.info('\n⚙️ Feature Configuration:');
    const enablePrescriptions = await prompt('Enable prescriptions? (y/n, default: y): ');
    clientData.features = {
      prescriptions: enablePrescriptions.toLowerCase() !== 'n',
    };

    const enableInsurance = await prompt('Enable insurance integration? (y/n, default: n): ');
    clientData.features.insuranceIntegration = enableInsurance.toLowerCase() === 'y';

    // Modules
    log.info('\n📦 Module Configuration:');
    const enableBlogs = await prompt('Enable blogs module? (y/n, default: y): ');
    clientData.modules = {
      blogs: enableBlogs.toLowerCase() !== 'n',
    };

    const enableBanners = await prompt('Enable banners module? (y/n, default: y): ');
    clientData.modules.banners = enableBanners.toLowerCase() !== 'n';

    // API Configuration
    log.info('\n🔌 API Configuration:');
    clientData.api = {
      baseURL: await prompt(`API Base URL (default: https://api.${clientData.domain}): `) || `https://api.${clientData.domain}`,
    };

    // Settings
    log.info('\n🌍 Regional Settings:');
    clientData.settings = {
      timezone: await prompt('Timezone (default: Asia/Kolkata): ') || 'Asia/Kolkata',
      currency: await prompt('Currency (default: INR): ') || 'INR',
      language: await prompt('Language (default: en): ') || 'en',
    };

    // Generate configuration
    const config = createClientConfig(clientData);

    // Create client directory
    const clientDir = path.join(__dirname, '..', 'clients', clientData.id);
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
      log.success(`Created client directory: ${clientDir}`);
    }

    // Save configuration
    const configPath = path.join(clientDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log.success(`Saved client configuration: ${configPath}`);

    // Create environment file
    const envContent = `# ${clientData.name} Configuration
VITE_CLIENT_ID=${clientData.id}
VITE_CLIENT_NAME=${clientData.name}
VITE_API_BASE_URL=${clientData.api.baseURL}
VITE_PRIMARY_COLOR=${clientData.primaryColor}
VITE_SECONDARY_COLOR=${clientData.secondaryColor}
VITE_ACCENT_COLOR=${clientData.accentColor}
`;

    const envPath = path.join(clientDir, '.env');
    fs.writeFileSync(envPath, envContent);
    log.success(`Created environment file: ${envPath}`);

    // Create build script
    const buildScript = `#!/bin/bash
# Build script for ${clientData.name}

echo "🏥 Building ${clientData.name}..."

# Copy client configuration
cp clients/${clientData.id}/config.json src/config/client.json

# Build the application
npm run build

echo "✅ Build completed for ${clientData.name}"
echo "📁 Output: dist/"
`;

    const buildScriptPath = path.join(clientDir, 'build.sh');
    fs.writeFileSync(buildScriptPath, buildScript);
    fs.chmodSync(buildScriptPath, '755');
    log.success(`Created build script: ${buildScriptPath}`);

    // Create deployment script
    const deployScript = `#!/bin/bash
# Deployment script for ${clientData.name}

echo "🚀 Deploying ${clientData.name}..."

# Build the application
./build.sh

# Deploy to Vercel (example)
vercel --prod --name ${clientData.id}

echo "✅ Deployment completed for ${clientData.name}"
`;

    const deployScriptPath = path.join(clientDir, 'deploy.sh');
    fs.writeFileSync(deployScriptPath, deployScript);
    fs.chmodSync(deployScriptPath, '755');
    log.success(`Created deployment script: ${deployScriptPath}`);

    // Create README
    const readmeContent = `# ${clientData.name} - Pharmaceutical E-commerce Platform

## Overview
This is a customized pharmaceutical e-commerce platform for ${clientData.name}.

## Configuration
- **Client ID**: ${clientData.id}
- **Domain**: ${clientData.domain}
- **API Base URL**: ${clientData.api.baseURL}
- **Primary Color**: ${clientData.primaryColor}
- **Currency**: ${clientData.settings.currency}
- **Language**: ${clientData.settings.language}

## Features Enabled
${Object.entries(clientData.features || {})
  .filter(([_, enabled]) => enabled)
  .map(([feature, _]) => `- ${feature}`)
  .join('\n')}

## Modules Enabled
${Object.entries(clientData.modules || {})
  .filter(([_, enabled]) => enabled)
  .map(([module, _]) => `- ${module}`)
  .join('\n')}

## Quick Start

1. **Build the application**:
   \`\`\`bash
   ./build.sh
   \`\`\`

2. **Deploy to production**:
   \`\`\`bash
   ./deploy.sh
   \`\`\`

## Customization

To customize this client:
1. Edit \`config.json\` for configuration changes
2. Edit \`.env\` for environment variables
3. Rebuild and redeploy

## Support

For support, contact the development team.
`;

    const readmePath = path.join(clientDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    log.success(`Created README: ${readmePath}`);

    // Summary
    log.header('✅ Client Setup Complete!');
    log.success(`Client: ${clientData.name}`);
    log.success(`ID: ${clientData.id}`);
    log.success(`Domain: ${clientData.domain}`);
    log.success(`Configuration: ${configPath}`);
    log.success(`Build Script: ${buildScriptPath}`);
    log.success(`Deploy Script: ${deployScriptPath}`);

    log.info('\n🚀 Next Steps:');
    log.info('1. Review the configuration in the clients directory');
    log.info('2. Add your logo and favicon files');
    log.info('3. Configure your backend API endpoints');
    log.info('4. Run the build script to create the application');
    log.info('5. Deploy to your hosting platform');

    log.info('\n📚 Documentation:');
    log.info('- Client configuration: clients/' + clientData.id + '/README.md');
    log.info('- API integration: docs/api-integration.md');
    log.info('- Customization guide: docs/customization.md');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupClient();
