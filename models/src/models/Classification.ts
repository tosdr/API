export namespace Classification {   
    export class v1 {

        constructor(
            private hex: number,
            private human: string
        ) {}

        public getHex(): number {
            return this.hex;
        }

        public getHuman(): string {
            return this.human;
        }

        public toObject(): any {
            return {
                hex: this.hex,
                human: this.human
            }
        }
    }
}