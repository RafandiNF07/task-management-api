-- Query performance indexes
CREATE INDEX IF NOT EXISTS "ProjectMember_projectId_role_idx"
ON "ProjectMember" ("projectId", "role");

CREATE INDEX IF NOT EXISTS "ProjectMember_userId_idx"
ON "ProjectMember" ("userId");

CREATE INDEX IF NOT EXISTS "Task_projectId_isArchived_status_deadline_idx"
ON "Task" ("projectId", "isArchived", "status", "deadline");

CREATE INDEX IF NOT EXISTS "Task_assigneeId_isArchived_status_idx"
ON "Task" ("assigneeId", "isArchived", "status");

CREATE INDEX IF NOT EXISTS "Task_projectId_isArchived_priority_createdAt_idx"
ON "Task" ("projectId", "isArchived", "priority", "createdAt");

CREATE INDEX IF NOT EXISTS "Comment_taskId_createdAt_idx"
ON "Comment" ("taskId", "createdAt");

CREATE INDEX IF NOT EXISTS "ActivityLog_taskId_createdAt_idx"
ON "ActivityLog" ("taskId", "createdAt");

-- Business rule guard: one active assigned task per user
CREATE UNIQUE INDEX IF NOT EXISTS "Task_one_active_task_per_assignee_idx"
ON "Task" ("assigneeId")
WHERE "assigneeId" IS NOT NULL
  AND "isArchived" = false
  AND "status" IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'REVISION');
