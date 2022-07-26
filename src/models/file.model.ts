import mongoose from 'mongoose';
import { MediaType } from '@/src/generated';
import { enumValues } from '@/src/util/enum';

export const ImageMediaDescriptionSchema = new mongoose.Schema(
  {
    thumb: {
      type: String,
      required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
    },
    cover: {
      type: String,
      required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
    },
    full: {
      type: String,
      required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
    },
    small: {
      type: String,
      required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
    },
    createdAt: { type: Number, required: true, default: () => Date.now() },
    updatedAt: { type: Number, required: true, default: () => Date.now() },
  },
  {
    timestamps: true,
  }
);

export const StreamMediaDescriptionSchema = new mongoose.Schema({
  thumb540: {
    type: String,
    required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
  },
  stream1080: {
    type: String,
    required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
  },
  stream720: {
    type: String,
    required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
  },
  stream540: {
    type: String,
    required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
  },
  stream360: {
    type: String,
    required: false, // These cannot be required. This is an event driven architecture. They won't be defined.
  },
});

export const MediaDescriptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, sparse: true },
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
