import mongoose from 'mongoose';
import { Material } from './models';
import { StudentDeliveryDoc } from '../models/studentDelivery';

// An interface that describes the properties
// that are requried to create a new Material
export interface MaterialAttrs {
  name: string;
  filePath: string;
  fileType: string;
  lastUpdate: string;
}

// An interface that describes the properties
// that a Material Model has
export interface MaterialModel extends mongoose.Model<MaterialDoc> {
  build(attrs: MaterialAttrs): MaterialDoc;
}

// An interface that describes the properties
// that a Material Document has
export interface MaterialDoc extends mongoose.Document {
  name: string;
  filePath: string;
  fileType: string;
  lastUpdate: string;
}

export const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    lastUpdate: {
      type: String,
      default: Date.now().toString(),
    },
  },

  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

materialSchema.statics.build = (attrs: MaterialAttrs) => {
  return new Material(attrs);
};
