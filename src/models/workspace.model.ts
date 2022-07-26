import mongoose from 'mongoose';
import { NotificationSchema } from './notification.model';
import { InvitedWorkspaceUserSchema, WorkspaceUserSchema } from './user.model';

const WorkspaceCreatorSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userWorkType: { type: String, required: true },
});

const LinkSharingSettingsSchema = new mongoose.Schema({
  allowPublic: { type: Boolean, required: true },
  allowPrivate: { type: Boolean, required: true },
});

const InvitationsSharingSettingsSchema = new mongoose.Schema({
  allow: { type: Boolean, required: true },
});

const EmailSecuritySharingSettingsSchema = new mongoose.Schema({
  restrict: { type: Boolean, required: true },
  approvedDomains: { type: [String], required: true },
});

const WorkspaceSharingSettingsSchema = new mongoose.Schema({
  links: { type: LinkSharingSettingsSchema, required: true },
  invitations: { type: InvitationsSharingSettingsSchema, required: true },
  emailSecurity: { type: EmailSecuritySharingSettingsSchema, required: true },
});

const WorkspaceSettingsSchema = new mongoose.Schema({
  sharing: { type: WorkspaceSharingSettingsSchema, required: true },
});

const InvoiceSummarySchema = new mongoose.Schema({
  plan: { type: String, required: true },
  seats: { type: Number, required: true },
  projects: { type: Number, required: true },
});

const InvoiceSchema = new mongoose.Schema({
  total: { type: String, required: true },
  date: { type: Number, required: true },
  currency: { type: String, required: true },
  summary: { type: InvoiceSummarySchema, required: true },
});

const FrameIOSchema = new mongoose.Schema({
  workspaceAssetId: { type: String, required: true, unique: true },
  productsAssetId: { type: String, required: true, unique: true },
  projectsAssetId: { type: String, required: true, unique: true },
});

const WorkspaceSchema = new mongoose.Schema({
  frameIO: {
    type: FrameIOSchema,
    required: true,
  },
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, required: true },
  logo: { type: String },
  workspaceCreator: { type: WorkspaceCreatorSchema, required: true },
  companyName: { type: String, required: true },
  companySize: { type: String, required: true },
  type: { type: String, required: true, default: () => 'Work' },
  invoices: { type: [InvoiceSchema], required: true, default: () => [] },
  // brands: { type: [BrandSchema], required: true, default: () => [] },
  users: { type: [WorkspaceUserSchema], required: true, default: () => [] },
  // todo: move this to workspace user schema
  markAllNotificationsAsRead: {
    type: Boolean,
    required: true,
    default: () => false,
  },
  emailInvites: {
    type: [InvitedWorkspaceUserSchema],
    required: true,
    default: () => [],
  },
  notifications: {
    type: [NotificationSchema],
    required: true,
    default: () => [],
  },
  settings: {
    type: WorkspaceSettingsSchema,
    required: true,
    default: () => ({
      sharing: {
        links: {
          allowPublic: true,
          allowPrivate: true,
        },
        invitations: {
          allow: true,
        },
        emailSecurity: {
          restrict: true,
          approvedDomains: [],
        },
      },
    }),
  },
});

export default mongoose.model('Workspace', WorkspaceSchema, 'workspaces');
