/**
 * `/oplg:explore` workflow: read-only investigation that produces a
 * structured handoff payload for `/oplg:apply`.
 *
 * Outputs:
 *   - Skill: `openlog-explore`, triggered when the user runs /oplg:explore
 *     or asks to "investigate / survey / map out X" before any code change.
 *   - Command: `/oplg:explore <topic>`, explicitly invoked by the user.
 *
 * Hard rule: this workflow MUST NOT modify any file in the repo, MUST NOT
 * commit, MUST NOT push, and MUST NOT install or run side-effecting commands.
 * Any code or content modification has to be deferred to `/oplg:apply`.
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';
export declare function getExploreSkillTemplate(): SkillTemplate;
export declare function getOplgExploreCommandTemplate(): CommandTemplate;
//# sourceMappingURL=explore.d.ts.map