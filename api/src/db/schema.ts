import { pgTable, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubId: integer("github_id").notNull().unique(),
  login: text("login").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const watchedRepos = pgTable("watched_repos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  owner: text("owner").notNull(),
  repo: text("repo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchedWorkflows = pgTable("watched_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  watchedRepoId: uuid("watched_repo_id").notNull().references(() => watchedRepos.id, { onDelete: "cascade" }),
  workflowId: integer("workflow_id").notNull(),
  workflowName: text("workflow_name").notNull(),
  workflowPath: text("workflow_path").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchedRepos: many(watchedRepos),
}));

export const watchedReposRelations = relations(watchedRepos, ({ one, many }) => ({
  user: one(users, { fields: [watchedRepos.userId], references: [users.id] }),
  watchedWorkflows: many(watchedWorkflows),
}));

export const watchedWorkflowsRelations = relations(watchedWorkflows, ({ one }) => ({
  watchedRepo: one(watchedRepos, { fields: [watchedWorkflows.watchedRepoId], references: [watchedRepos.id] }),
}));
