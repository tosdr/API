import { Classification } from "./Classification";
import { Links } from "./Links";
import { Timezone } from "./Timezone";
import {Case} from "./Case";

export namespace Points {

    export class v1 {

        constructor (
            private id: number,
            private title: string,
            private source: string,
            private status: string,
            private analysis: string,
            private $case: Case.v2,
            private quoteText: string|null,
            private document_id: number|null,
            private quoteStart: number|null,
            private quoteEnd: number|null,
            private updated_at: string,
            private created_at: string,
            private model_version: string|null,
            private ml_score: number|null
        ){}

        public static fromRow(row: any, $case: Case.v2): Points.v1 {
            return new Points.v1(
                row.id,
                row.title,
                row.source,
                row.status,
                row.analysis,
                $case,
                row.quoteText,
                row.document_id,
                row.quoteStart,
                row.quoteEnd,
                row.updated_at,
                row.created_at,
                row.model_version,
                row.ml_score
            );
        }


        public toObject(){
            return {
                id: Number(this.id),
                title: this.title,
                source: this.source,
                status: this.status,
                analysis: this.analysis,
                case: this.$case.toObject(),
                quoteText: this.quoteText,
                document_id: this.document_id ? Number(this.document_id) : null,
                quoteStart: this.quoteStart,
                quoteEnd: this.quoteEnd,
                updated_at: this.updated_at,
                created_at: this.created_at,
                model_version: this.model_version,
                ml_score: this.ml_score
            }
        }


    }
}
