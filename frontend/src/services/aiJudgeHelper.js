/**
 * Extracts a structured problem statement from a lesson or challenge unit
 * to send to the AI Judge (ai/check_submit.py)
 * @param {object} unit
 * @param {string} [levelTitle]
 * @returns {string}
 */
export function buildLessonProblemText(unit, levelTitle = "") {
  if (!unit) return "";

  const sections = [];

  if (levelTitle) {
    sections.push(`Level Context: ${levelTitle}`);
  }

  if (unit.title) {
    sections.push(`Unit Title: ${unit.title}`);
  }

  if (unit.subtitle) {
    sections.push(`Unit Subtitle: ${unit.subtitle}`);
  }

  // Extract lesson explanation text if available
  const data = unit.data || {};
  if (data.blocks && Array.isArray(data.blocks)) {
    const textBlocks = data.blocks
      .filter((b) => b && (b.type === "text" || b.type === "tip") && b.content)
      .map((b) => `${b.title ? `${b.title}: ` : ""}${b.content}`)
      .join("\n\n");

    if (textBlocks) {
      sections.push(`Lesson Concepts & Theory:\n${textBlocks}`);
    }
  }

  // Extract mission requirements
  const mission = unit.kind === "lesson" ? data.mission : data;
  if (mission) {
    if (mission.title) {
      sections.push(`Mission Goal: ${mission.title}`);
    }

    if (mission.instructions) {
      const instr = Array.isArray(mission.instructions)
        ? mission.instructions.map((it, idx) => `${idx + 1}. ${it}`).join("\n")
        : String(mission.instructions);
      sections.push(`Instructions & Requirements:\n${instr}`);
    }

    if (mission.task) {
      sections.push(`Task: ${mission.task}`);
    }

    if (mission.prompt) {
      sections.push(`Prompt: ${mission.prompt}`);
    }

    if (mission.validation && Array.isArray(mission.validation)) {
      const valDesc = mission.validation
        .map((v) => {
          if (v.type === "cppOutputContains") return `Output should contain: "${v.value}"`;
          if (v.type === "cppCodeContains") return `Code should contain: "${v.value}"`;
          return JSON.stringify(v);
        })
        .join("; ");
      if (valDesc) {
        sections.push(`Expected Criteria: ${valDesc}`);
      }
    }
  }

  return sections.join("\n\n---\n\n");
}
