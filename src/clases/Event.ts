export class Event {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    run() {
        console.log("eveny", this.name, "executed");
    }
}
