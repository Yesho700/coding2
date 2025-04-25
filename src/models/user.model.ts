import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserDocument = User & Document;


export enum Role{
    USER = "USER",
    ADMIN = "ADMIN"
}

@Schema({timestamps: true})
export class User {

    @Prop({required: true})
    name: string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({type: Date, default: Date.now})
    DOJ: Date;

    @Prop()
    profile: string;

    @Prop({type: Number, default: 6})
    remainingLeaves: number;

    @Prop({default: 0})
    plannedLeave: number;

    @Prop({default: 0})
    emergencyLeave: number;

    @Prop({ type: String, enum: Role, default: Role.USER})
    role: string;
}


export const UserSchema = SchemaFactory.createForClass(User);