export namespace Timezone {   
    export class v1 {

        constructor(
            private timezone: string,
            private pgsql: string,
            private unix: number
        ) {}


        public getTimezone(): string {
            return this.timezone;
        }

        public getPgsql(): string {
            return this.pgsql;
        }

        public getUnix(): number {
            return this.unix;
        }


        public toObject(): any {
            return {
                timezone: this.timezone,
                pgsql: this.pgsql,
                unix: this.unix
            };
        }
    }
}