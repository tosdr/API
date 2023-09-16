export namespace DocbotRecord {

    export class v1 {

        constructor (
            private id: number,
            private case_id: number,
            private document_id: number,
            private updated_at: string,
            private created_at: string,
            private text_version: string,
            private char_start: number,
            private char_end: number,
            private ml_score: number,
            private docbot_version: string
        ){}

        public static fromRow(row: any): DocbotRecord.v1 {
            return new DocbotRecord.v1(
                row.id,
                row.case_id,
                row.document_id,
                row.updated_at,
                row.created_at,
                row.text_version,
                row.char_start,
                row.char_end,
                row.ml_score,
                row.docbot_version
            );
        }


        public toObject(){
            return {
                id: Number(this.id),
                case_id: Number(this.case_id),
                document_id: Number(this.document_id),
                updated_at: this.updated_at,
                created_at: this.created_at,
                text_version: this.text_version,
                char_start: Number(this.char_start),
                char_end: Number(this.char_end),
                ml_score: Number(this.ml_score),
                docbot_version: this.docbot_version
            }
        }


    }
}
