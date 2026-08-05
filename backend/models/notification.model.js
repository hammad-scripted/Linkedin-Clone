import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';


const notificationSchema = new Schema(
{


    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    type:{
        type: String,
        required: true,
        enum:[
            'like','comment','connectionAccepted'],
    },
    relatedUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    relatedPost:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    read:{
        type: Boolean,
        default: false,
    }
},{
})

export const Notification = model('Notification', notificationSchema);