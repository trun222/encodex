import * as mongoose from 'mongoose';

const RenderSchema = new mongoose.Schema({
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
  projectId: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Renders', RenderSchema, 'renders');
