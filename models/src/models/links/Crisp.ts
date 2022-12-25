export namespace CrispLinks {  
    export class v1 {


        constructor(
            private api: string
        ) {}

        public getApi(): string {
            return this.api;
        }

        public toObject(): any {
            return {
                api: this.api
            };
        }
    }
}