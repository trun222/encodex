import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { ProjectStatus, ProductStateStatus, MediaType } from '../generated';
import { enumValues } from '../util/enum';
import {
  ImageMediaDescriptionSchema,
  StreamMediaDescriptionSchema,
} from './file.model';
import { RevisionCommentSchema } from './revision.model';
import { UserNonReferencedSchema } from './user.model';

const ProjectProducerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
});

const MediaDescriptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: enumValues(MediaType),
      // required: true, // NOTE: Was breaking product import because not available initially do to transcoding time delay
    },
    fileType: { type: String, required: false },
    image: {
      type: ImageMediaDescriptionSchema,
      // required: true, // NOTE: Was breaking product import because not available initially do to transcoding time delay
    },
    stream: {
      type: StreamMediaDescriptionSchema,
      // required: true, // NOTE: Was breaking product import because not available initially do to transcoding time delay
    },
    createdAt: { type: Number, required: true, default: () => Date.now() },
    updatedAt: { type: Number, required: true, default: () => Date.now() },
  },
  {
    timestamps: true,
  }
);

const RevisionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    comments: {
      type: [RevisionCommentSchema],
      required: false,
      default: () => [],
    },
    version: {
      type: Number,
      required: true,
      default: () => 0,
    },
    // Common across asset types
    media: {
      type: MediaDescriptionSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ApproverSchema = new mongoose.Schema({
  user: { type: UserNonReferencedSchema, required: true },
  at: { type: Number, required: true, default: () => Date.now() },
});

const AssetStateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: enumValues(ProductStateStatus),
    required: true,
  },
  approvedBy: { type: ApproverSchema, required: false },
});

export const ProjectGalleryAssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: {
    type: AssetStateSchema,
    required: true,
    default: () => ({ status: ProductStateStatus.Ready }), // Change to make statuses generic
  },
  revisions: {
    type: [RevisionSchema],
    required: true,
    default: () => [],
  },
});

const ProductMedia = new mongoose.Schema({
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

const ProductApprover = new mongoose.Schema({
  user: { type: UserNonReferencedSchema, required: true },
  at: { type: Number, required: true, default: () => Date.now() },
});

const ProductState = new mongoose.Schema({
  status: {
    type: String,
    enum: enumValues(ProductStateStatus),
    required: true,
  },
  approvedBy: { type: ProductApprover, required: false },
  note: { type: String, required: false },
});

const FrameIOSchema = new mongoose.Schema({
  productFolderId: { type: String, required: true },
  referencesFolderId: { type: String, required: true },
  decalsFolderId: { type: String, required: true },
  modelsFolderId: { type: String, required: true },
  productAssetId: {
    type: String,
  },
  versionStackId: { type: String, default: () => '' },
});

const ProjectFrameIOSchema = new mongoose.Schema({
  projectFolderId: { type: String, required: true },
  customRendersFolderId: {
    type: String,
    required: true,
  },
  unrealRendersFolderId: {
    type: String,
    required: true,
  },
  bookmarksFolderId: { type: String, required: true },
  featuresFolderId: { type: String, required: true },
  shotsFolderId: { type: String, required: true },
  versionStackId: { type: String, default: () => '' },
  projectAssetId: {
    type: String,
    default: () => '',
  },
});

const AbridgedProductProjectSchema = new mongoose.Schema(
  {
    // a hash of the project's name and the workspaceId
    id: {
      type: String,
      required: true,
    },
    frameIO: {
      type: ProjectFrameIOSchema,
      required: true,
    },
    workspaceId: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    media: {
      type: MediaDescriptionSchema,
    },
    gallery: {
      type: [ProjectGalleryAssetSchema],
      required: true,
      default: () => [],
    },
    products: {
      type: [ProjectProductSchema],
      required: true,
      default: () => [],
    },
    producer: {
      type: ProjectProducerSchema,
      required: true,
      default: () => ({
        name: 'Jake Black',
        title: 'Lead Glossi Producer',
        bio: 'I’d love to connect with you to get a better idea of your creative goals and provide some resources along the way. Feel free to book a time that works best for you here.',
        avatar: 'https://glossi-assets-public.s3.amazonaws.com/jake.png',
      }),
    },
    status: {
      type: String,
      enum: enumValues(ProjectStatus),
      required: true,
      default: () => ProjectStatus.Pending,
    },
    bookmarks: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
    features: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
    shots: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
    renders: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
  },
  {
    timestamps: true,
  }
);

var ProjectProductSchema = new mongoose.Schema(
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
      type: [AbridgedProductProjectSchema],
      required: true,
      default: () => [],
    },
    revisions: {
      type: [RevisionSchema],
      required: true,
      default: () => [],
    },
    state: {
      type: ProductState,
      required: true,
      default: () => ({ status: ProductStateStatus.ModelRequired }),
    },
  },
  {
    timestamps: true,
  }
);

export var ProjectSchema = new mongoose.Schema(
  {
    // a hash of the project's name and the workspaceId
    id: {
      type: String,
      required: true,
    },
    frameIO: {
      type: ProjectFrameIOSchema,
      required: true,
    },
    workspaceId: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    media: {
      type: MediaDescriptionSchema,
    },
    gallery: {
      type: [ProjectGalleryAssetSchema],
      required: true,
      default: () => [],
    },
    products: {
      type: [ProjectProductSchema],
      required: true,
      default: () => [],
    },
    producer: {
      type: ProjectProducerSchema,
      required: true,
      default: () => ({
        name: 'Jake Black',
        title: 'Lead Glossi Producer',
        bio: 'I’d love to connect with you to get a better idea of your creative goals and provide some resources along the way. Feel free to book a time that works best for you here.',
        avatar: 'https://glossi-assets-public.s3.amazonaws.com/jake.png',
      }),
    },
    status: {
      type: String,
      enum: enumValues(ProjectStatus),
      required: true,
      default: () => ProjectStatus.Pending,
    },
    bookmarks: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
    features: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
    shots: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
    renders: {
      type: [MediaDescriptionSchema],
      required: true,
      default: () => [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Project', ProjectSchema, 'projects');
