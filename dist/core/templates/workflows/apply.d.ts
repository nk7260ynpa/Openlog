/**
 * `/oplg:apply` workflow: directly modify code based on the user's described action.
 *
 * Outputs:
 *   - Skill: `openlog-apply`, triggered when the user asks to modify code or
 *     runs `/oplg:apply`.
 *   - Command: `/oplg:apply <action>`, explicitly invoked by the user.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
export declare function getApplySkillTemplate(): SkillTemplate;
export declare function getOplgApplyCommandTemplate(): CommandTemplate;
//# sourceMappingURL=apply.d.ts.map