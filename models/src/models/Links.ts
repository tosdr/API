import { CrispLinks } from "./links/Crisp";
import { PhoenixLinks } from "./links/Phoenix";

export namespace Links {   
    export class v1 {


        constructor(
            private phoenix: PhoenixLinks.v1,
            private crisp: CrispLinks.v1
        ) {}

        public getPhoenix(): PhoenixLinks.v1 {
            return this.phoenix;
        }
        
        public getCrisp(): CrispLinks.v1 {
            return this.crisp;
        }

        public toObject(): any {
            return {
                phoenix: this.phoenix.toObject(),
                crisp: this.crisp.toObject()
            };
        }

    }
}