function getEnvOrDefault(env: string, defaultValue: string) {
    return process.env[env] ?? defaultValue;
}

const config = {
    githubUsername: getEnvOrDefault("APP_GITHUB_USER", "laurci"),
} as const;

export default config;