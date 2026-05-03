/**
 * `/oplg:verify` workflow: review code changes made by `/oplg:apply` in the
 * current session.
 *
 * Outputs:
 *   - Skill: `openlog-verify`, triggered when the user asks to review recent
 *     apply changes or runs `/oplg:verify`.
 *   - Command: `/oplg:verify`, explicitly invoked by the user.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
export declare function getVerifySkillTemplate(): SkillTemplate;
export declare function getOplgVerifyCommandTemplate(): CommandTemplate;
//# sourceMappingURL=verify.d.ts.map