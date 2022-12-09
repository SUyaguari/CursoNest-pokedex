import { Document } from "mongoose";
import {Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Pokemon extends Document{

    //id: string; //Mongo asigna solito
    @Prop({
        unique: true,
        index: true,
    })
    name: string;

    @Prop({
        unique: true,
        index: true,
    })
    no: number;

}

export const poquemonSchema = SchemaFactory.createForClass(Pokemon);
