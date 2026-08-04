import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const userSchema = new Schema({});

export const User = model('User', userSchema);