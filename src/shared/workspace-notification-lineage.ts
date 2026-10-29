import type { WorkspaceLineage, WorktreeLineage } from './worktree/lineage-types'
import { parseWorkspaceKey, worktreeWorkspaceKey } from './workspace-scope'

/** Recorded parentage, independent of sidebar expansion, visibility, or CLI provenance. */
export function hasWorkspaceNotificationParent(
  workspaceId: string,
  worktreeLineageById: Readonly<Record<string, WorktreeLineage>>,
  workspaceLineageByChildKey: Readonly<Record<string, WorkspaceLineage>>
): boolean {
  const scope = parseWorkspaceKey(workspaceId)
  const key = scope ? workspaceId : worktreeWorkspaceKey(workspaceId)
  const workspaceLineage = workspaceLineageByChildKey[key]
  if (workspaceLineage) {
    return (
      workspaceLineage.childWorkspaceKey === key &&
      workspaceLineage.parentWorkspaceKey !== key &&
      parseWorkspaceKey(workspaceLineage.parentWorkspaceKey) !== null
    )
  }
  if (scope?.type === 'folder') {
    return false
  }
  const id = scope?.type === 'worktree' ? scope.worktreeId : workspaceId
  const lineage = worktreeLineageById[id]
  return (
    lineage !== undefined &&
    lineage.worktreeId === id &&
    lineage.parentWorktreeId.length > 0 &&
    lineage.parentWorktreeId !== id
  )
}
