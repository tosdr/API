export namespace PhoenixLinks {  
    export class v1 {

        constructor(
            private _case: string,
            private new_comment: string,
            private edit: string
        ){}

        public getCase(): string {
            return this._case;
        }
        
        public getNewComment(): string {
            return this.new_comment;
        }
        
        public getEdit(): string {
            return this.edit;
        }

        public toObject(): any {
            return {
                case: this._case,
                new_comment: this.new_comment,
                edit: this.edit
            };
        }
    }
}