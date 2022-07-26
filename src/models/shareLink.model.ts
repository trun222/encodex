import mongoose from 'mongoose';
import { ResourceType, ExpirationType } from '@/src/generated';
import { Role } from '@/src/models/user.model';
import { enumValues } from '@/src/util/enum';

export const ResourceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: enumValues(ResourceType),
  },
  workspaceId: { type: String, required: true }, // TODO: Change to workspace slug once we move to workspaces/custom domains
});

export const ExpirationSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  type: { type: String, required: true, enum: enumValues(ExpirationType) },
});

export const ShareLinkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    resource: { type: ResourceSchema, required: true },
    role: Role,
    expiration: { type: ExpirationSchema, required: true },
  },
  { timestamps: true }
);

export const ShareLinkModel = mongoose.model(
  'ShareLink',
  ShareLinkSchema,
  'sharelinks'
);
