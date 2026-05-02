export declare const OPENLOG_DIR_NAME = "openlog";
export interface AIToolOption {
    name: string;
    value: string;
    available: boolean;
    /**
     * Root directory for the tool's configuration (e.g. `.claude`, `.github`).
     */
    skillsDir: string;
    /**
     * Whether the tool supports the Anthropic Agent Skills spec.
     *
     * - `true`: write a skill file at `<skillsDir>/skills/<dir>/SKILL.md`
     *   (Claude Code).
     * - `false`: skip the skill file and only write slash-command / prompt files
     *   (GitHub Copilot, etc.).
     */
    supportsSkills: boolean;
}
export declare const AI_TOOLS: AIToolOption[];
export declare function findToolByValue(value: string): AIToolOption | undefined;
//# sourceMappingURL=config.d.ts.map