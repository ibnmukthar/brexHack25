/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@logistics/engine'],
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    WORKFLOW_MODEL: process.env.WORKFLOW_MODEL,
    WORKFLOW_MAX_TOKENS: process.env.WORKFLOW_MAX_TOKENS,
    WORKFLOW_TEMPERATURE: process.env.WORKFLOW_TEMPERATURE,
  },
}

module.exports = nextConfig