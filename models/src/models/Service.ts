export namespace Service {
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
