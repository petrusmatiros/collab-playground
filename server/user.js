class User {
    position= {x: 0, y: 0};
    constructor(id, name, color, position= {x: 0, y: 0}, cursorPoisition = {x: 0, y: 0}) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.position = position;
        this.cursorPoisition = cursorPoisition;
    }    
}

module.exports = User;