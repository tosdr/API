import { Classification } from "./Classification";
import { Links } from "./Links";
import { Timezone } from "./Timezone";

export namespace Case {

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

    export class v2 {

        constructor (
            private id: number,
            private weight: number,
            private title: string,
            private description: string,
            private updated_at: string,
            private created_at: string,
            private topic: number,
            private classification: string,
        ){}

        public static fromRow(row: any): Case.v2 {
            return new Case.v2(
                row.id,
                row.score,
                row.title,
                row.description,
                row.updated_at,
                row.created_at,
                row.topic_id,
                row.classification
            )
        }

        public toObject(){
            return {
                id: Number(this.id),
                weight: Number(this.weight),
                title: this.title,
                description: this.description,
                updated_at: this.updated_at,
                created_at: this.created_at,
                topic_id: Number(this.topic),
                classification: this.classification,
            }
        }


    }
}
