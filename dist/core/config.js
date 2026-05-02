export const OPENLOG_DIR_NAME = 'openlog';
export const AI_TOOLS = [
    {
        name: 'Claude Code',
        value: 'claude',
        available: true,
        skillsDir: '.claude',
        supportsSkills: true,
    },
    {
        name: 'GitHub Copilot',
        value: 'github-copilot',
        available: true,
        skillsDir: '.github',
        supportsSkills: false,
    },
];
export function findToolByValue(value) {
    return AI_TOOLS.find((tool) => tool.value === value);
}
//# sourceMappingURL=config.js.map