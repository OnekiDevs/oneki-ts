class Event {
    constructor(name) {
        this.name = name;
    }

    run(){
        console.log('event '+this.name+' executed')
    }
}

module.exports = Event