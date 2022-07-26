import mongoose from 'mongoose';
import { InvitedUserStatus, WorkspaceUserRole } from '../generated';
import { enumValues } from '../util/enum';

const LanguageTimezoneSchema = new mongoose.Schema({
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' },
  autoDetect: { type: Boolean, default: true },
});

const NotificationsSchema = new mongoose.Schema({
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: true },
  desktopNotifications: { type: Boolean, default: true },
  statusUpdates: { type: Boolean, default: true },
  workspaceUpdates: { type: Boolean, default: true },
  commentUpdates: { type: Boolean, default: true },
  // for admin
  newUserUpdates: { type: Boolean, default: true },
});

const GlossiUserSettingsSchema = new mongoose.Schema({
  languageTimezone: { type: LanguageTimezoneSchema },
  notifications: { type: NotificationsSchema },
});

export const UserDetailsSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String },
});

export const UserSchema = new mongoose.Schema({
  // change to defaultWorkspace
  workspaceId: { type: String },
  workspaces: {
    type: [String],
    required: true,
    default: () => [],
  },
  email: { type: String, required: true, unique: true },
  details: {
    type: UserDetailsSchema,
    required: true,
  },
});

export const UserReferenceSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, sparce: true },
  details: {
    type: UserDetailsSchema,
    required: true,
  },
});

// NOTE: To be used in cases where email does not need to be unique for a set of data (i.e. comments)
// prevents duplicate key issues in Mongo
export const UserNonReferencedSchema = new mongoose.Schema({
  email: { type: String, required: true, sparce: true },
  details: {
    type: UserDetailsSchema,
    required: true,
  },
});

export const Role = {
  type: String,
  required: true,
  enum: enumValues(WorkspaceUserRole),
};

export const WorkspaceUserSchema = new mongoose.Schema({
  // a hash of workspace.id and user.email
  // this is to ensure a workspace user is unique within a workspace, but not across workspaces
  role: Role,
  settings: {
    type: GlossiUserSettingsSchema,
    required: true,
    default: () => ({
      languageTimezone: {
        language: 'en',
        timezone: 'UTC',
        autoDetect: true,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        desktopNotifications: true,
        statusUpdates: true,
        workspaceUpdates: true,
        commentUpdates: true,
        // for admin
        newUserUpdates: true,
      },
    }),
  },
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  details: {
    type: UserDetailsSchema,
    required: true,
  },
});

export const InvitedWorkspaceUserSchema = new mongoose.Schema(
  {
    // a hash of workspace.id and user.email
    // this is to ensure a workspace user is unique within a workspace, but not across workspaces
    id: { type: String, required: true, unique: true, sparse: true },
    email: { type: String, required: true },
    role: Role,
    status: {
      type: String,
      required: true,
      enum: enumValues(InvitedUserStatus),
      default: () => InvitedUserStatus.Pending,
    },
    createdAt: { type: Date, required: true, default: () => Date.now() },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', UserSchema, 'users');
