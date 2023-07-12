import { Classification } from "./Classification";
import { Links } from "./Links";
import { Timezone } from "./Timezone";

export namespace DocumentMinimal {

    export class v1 {

        constructor (
            private id: number,
            private name: string,
            private url: string,
            private updated_at: string,
            private created_at: string
        ){}

        public static fromRow(row: any): DocumentMinimal.v1 {
            return new DocumentMinimal.v1(
                row.id,
                row.name,
                row.url,
                row.updated_at,
                row.created_at
            );
        }


        public toObject(){
            return {
                id: Number(this.id),
                name: this.name,
                url: this.url,
                updated_at: this.updated_at,
                created_at: this.created_at,
            }
        }


    }
}
