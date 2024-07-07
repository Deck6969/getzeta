import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { generateStringId } from 'src/utils/utils';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: String, default: generateStringId })
  _id: string;
  @Prop({ type: String, default: '' })
  fullname: string;
  @Prop({ type: String, default: '' })
  image: string;
  @Prop({ type: String, default: '' })
  email: string;
  @Prop({ type: String, default: '' })
  password: string;
  @Prop({ type: String, default: '' })
  username: string;
  @Prop({ type: String, default: '' })
  phone: string;
  @Prop({ type: String, default: '' })
  bankName: string;
  @Prop({ type: String, default: '' })
  accountNumber: string;
  @Prop({ type: String, default: '' })
  accountName: string;
  @Prop({ type: String, default: '' })
  authSecret: string;
  @Prop({ type: String, default: '' })
  authUrl: string;
  @Prop({ type: Boolean, default: false })
  isAuthEnabled: boolean;
  @Prop({ type: Boolean, default: false })
  isBiometricEnabled: boolean;
  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;
  @Prop({ type: Boolean, default: false })
  isSuperAdmin: boolean;
  @Prop({ type: Boolean, default: false })
  isVerified: boolean;
  @Prop({ type: Boolean, default: false })
  isActive: boolean;
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
  @Prop({ type: String, default: '' })
  currencyId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret.__v;
    delete ret._id;
  },
});

UserSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret.__v;
    delete ret._id;
  },
});

UserSchema.set('timestamps', true);
UserSchema.set('autoIndex', true);

UserSchema.pre('save', function (this: any, next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

UserSchema.pre('findOneAndUpdate', function (this: any, next) {
  if (!this._update.password) return next();
  this.this._update.password = bcrypt.hashSync(this._update.password, 10);
  next();
});

UserSchema.pre('updateOne', function (this: any, next) {
  if (!this._update.password) return next();
  this._update.password = bcrypt.hashSync(this._update.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};
