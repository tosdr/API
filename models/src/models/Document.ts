export namespace Document {

    export class v1 {

        constructor (
            private id: number,
            private name: string,
            private url: string,
            private text: string,
            private updated_at: string,
            private created_at: string,
            private text_version: string
        ){}

        public static fromRow(row: any): Document.v1 {
            return new Document.v1(
                row.id,
                row.name,
                row.url,
                row.text,
                row.updated_at,
                row.created_at,
                row.text_version
            );
        }

        public toObject(){
            return {
                id: Number(this.id),
                name: this.name,
                url: this.url,
                text: this.text,
                updated_at: this.updated_at,
                created_at: this.created_at,
                text_version: this.text_version
            }
        }
    }
}
