import * as mongoose from 'mongoose';
import { RevisionCommentType } from '../generated';
import { MediaDescriptionSchema } from './file.model';
import { UserNonReferencedSchema } from './user.model';

export const makeRevisionCommentSchema = (type: RevisionCommentType) =>
  new mongoose.Schema(
    {
      author: {
        type: UserNonReferencedSchema,
        required: true,
      },
      contents: { type: String, required: true },
      videoTimestamp: { type: Number, required: false },
      type: {
        type: String,
        enum: [type],
        required: true,
      },
      replies: {
        type: [RevisionReplySchema],
        required: true,
        default: () => [],
      },
    },
    {
      timestamps: true,
    }
  );

export const RevisionReplySchema = makeRevisionCommentSchema(
  RevisionCommentType.Reply
);
export const RevisionCommentSchema = makeRevisionCommentSchema(
  RevisionCommentType.Comment
);

export const RevisionSchema = new mongoose.Schema(
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

// NOTE: Necessary for Revisions to be a flat collection that can be referenced outside of Products
const AbridgedRevisionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    sparse: true,
    unique: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Workspace',
  },
  productId: {
    type: String,
  },
  projectId: {
    type: String,
  },
});

export default mongoose.model('Revisions', AbridgedRevisionSchema, 'revisions');
