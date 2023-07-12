export namespace ServiceMinimal {
    export class v1 {

        constructor (
            private id: number,
            private is_comprehensively_reviewed: boolean,
            private name: string,
            private updated_at: string,
            private created_at: string,
            private slug: string|null,
            private rating: string|null,
            private urls: string[],
            private image: string,
        ){}


        public static fromRow(row: any, image: string): ServiceMinimal.v1 {
            return new ServiceMinimal.v1(
                row.id,
                row.is_comprehensively_reviewed,
                row.name,
                row.updated_at,
                row.created_at,
                row.slug,
                row.rating,
                row.url.split(","),
                image
            );
        }

        public toObject(){

            let rating = this.rating;

            if(this.rating == "N/A" || !this.is_comprehensively_reviewed){
                rating = null;
            }

            return {
                id: Number(this.id),
                is_comprehensively_reviewed: Boolean(this.is_comprehensively_reviewed),
                name: this.name,
                updated_at: this.updated_at,
                created_at: this.created_at,
                slug: this.slug,
                rating: rating,
                urls: this.urls,
                image: this.image,
            }
        }


    }
}
