import * as mongoose from 'mongoose';

const TextureSchema = new mongoose.Schema({
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
    required: true,
  },
});

export default mongoose.model('Textures', TextureSchema, 'textures');
