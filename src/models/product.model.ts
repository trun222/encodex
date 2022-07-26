import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { ProductStateStatus } from '../generated';
import { enumValues } from '../util/enum';
import { MediaDescriptionSchema } from './file.model';
import { ProjectSchema } from './project.model';
import { RevisionSchema } from './revision.model';
import { UserNonReferencedSchema } from './user.model';

export const ProductMedia = new mongoose.Schema({
  models: {
    type: [MediaDescriptionSchema],
    required: true,
    default: () => [],
  },
  references: {
    type: [MediaDescriptionSchema],
    required: true,
    default: () => [],
  },
  textures: {
    type: [MediaDescriptionSchema],
    required: true,
    default: () => [],
  },
});

export const ApproverSchema = new mongoose.Schema({
  user: { type: UserNonReferencedSchema, required: true },
  at: { type: Number, required: true, default: () => Date.now() },
});

export const AssetStateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: enumValues(ProductStateStatus),
    required: true,
  },
  approvedBy: { type: ApproverSchema, required: false },
  note: { type: String, required: false },
});

export const FrameIOSchema = new mongoose.Schema({
  productFolderId: { type: String, required: true },
  referencesFolderId: { type: String, required: true },
  decalsFolderId: { type: String, required: true },
  modelsFolderId: { type: String, required: true },
  productAssetId: {
    type: String,
  },
  versionStackId: { type: String, default: () => '' },
});

const ModelUploadCommentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  createdAt: { type: Number, required: true, default: () => Date.now() },
  updatedAt: { type: Number, required: true, default: () => Date.now() },
  author: { type: UserNonReferencedSchema, required: true },
  contents: { type: String, required: true },
});

export const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    frameIO: {
      type: FrameIOSchema,
      required: true,
    },
    workspaceId: { type: String, required: true },
    name: { type: String, required: true },
    previewUrl: { type: String, required: false },
    category: { type: String, required: false },
    sku: { type: String, required: true, default: () => randomUUID() },
    media: {
      type: ProductMedia,
      required: true,
      default: () => ({
        models: [],
        references: [],
        textures: [],
      }),
    },
    projects: {
      type: [ProjectSchema],
      required: true,
      default: () => [],
    },
    revisions: {
      type: [RevisionSchema],
      required: true,
      default: () => [],
    },
    state: {
      type: AssetStateSchema,
      required: true,
      default: () => ({ status: ProductStateStatus.ModelRequired }),
    },
    comments: {
      type: [ModelUploadCommentSchema],
      required: true,
      default: () => [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Product', ProductSchema, 'products');

export const ProductModelUploadSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  workspaceId: { type: String, required: true },
  url: { type: String, required: true },
  userId: { type: String, required: true },
});

export const ProductModelUpload = mongoose.model(
  'ProductModelUpload',
  ProductModelUploadSchema,
  'productModelUploads'
);
