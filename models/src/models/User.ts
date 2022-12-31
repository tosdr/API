import { Classification } from "./Classification";
import { Links } from "./Links";
import { Timezone } from "./Timezone";

export namespace User {
    export class v1 {

        constructor (
            private id: number,
            private weight: number,
            private title: string,
            private description: string,
            private updated_at: Timezone.v1,
            private created_at: Timezone.v1,
            private topic: number,
            private classification: Classification.v1,
            private links: Links.v1
        ){}


        public toObject(){
            return {
                id: this.id,
                weight: this.weight,
                title: this.title,
                description: this.description,
                updated_at: this.updated_at.toObject(),
                created_at: this.created_at.toObject(),
                topic: this.topic,
                classification: this.classification.toObject(),
                links: this.links.toObject()
            }
        }
        

    } 
}
