/**
 * Skill 與 slash command 模板的匯出聚合。
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export {
  getApplySkillTemplate,
  getOplgApplyCommandTemplate,
} from './workflows/apply.js';

export {
  getRecordSkillTemplate,
  getOplgRecordCommandTemplate,
} from './workflows/record.js';
