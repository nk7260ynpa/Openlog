/**
 * Shared module exports.
 */

export {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
  type SkillTemplateEntry,
  type CommandTemplateEntry,
} from './skill-generation.js';

export {
  SKILL_NAMES,
  COMMAND_IDS,
  type SkillName,
  type CommandId,
} from './tool-detection.js';
