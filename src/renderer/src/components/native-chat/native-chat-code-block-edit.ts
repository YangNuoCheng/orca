/** The fence an edited code block goes back to the agent in: longer than any backtick run inside
 *  the text, so a block that itself holds a fence stays one block. */
export function fenceEditedCodeBlock(text: string, language: string | undefined): string {
  const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length))
  const fence = '`'.repeat(Math.max(3, longestRun + 1))
  const body = text.endsWith('\n') ? text : `${text}\n`
  return `${fence}${language ?? ''}\n${body}${fence}`
}
