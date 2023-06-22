import {DocumentMinimal} from "./DocumentMinimal";
import {Points} from "./Points";

export namespace Service {
    export class v2 {

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
            private documents: DocumentMinimal.v1[],
            private points: Points.v1[],
        ){}


        public static fromRow(row: any, image: string, documents: DocumentMinimal.v1[], points: Points.v1[]): Service.v2 {
            return new Service.v2(
                row.id,
                row.is_comprehensively_reviewed,
                row.name,
                row.updated_at,
                row.created_at,
                row.slug,
                row.rating,
                row.url.split(","),
                image,
                documents,
                points
            );
        }

        public toObject(){

            let documentsObj: any[] = [];
            let pointsObj: any[] = [];
            let rating = this.rating;

            this.documents.forEach((document) => {
                documentsObj.push(document.toObject());
            });
            this.points.forEach((point) => {
                pointsObj.push(point.toObject());
            });


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
                documents: documentsObj,
                points: pointsObj,
            }
        }


    }
}
