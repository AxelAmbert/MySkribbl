const readline = require('readline');
const fs = require("fs");
const path = require("path");

class UsernameGenerator {
    constructor() {
        this.adjectives = [];
        this.words = [];


        let fileInterface = readline.createInterface({
            input: fs.createReadStream((path.join(__dirname, './WordData/Adjective'))),
            console: false
        });

        fileInterface.on('line', (line) => {
            this.adjectives.push(line);
        });

        fileInterface = readline.createInterface({
            input: fs.createReadStream((path.join(__dirname, './WordData/Words'))),
            console: false
        });

        fileInterface.on('line', (line) => {
            this.words.push(line);
        });

    }

    getARandomUsername() {
        let word = this.words[Math.floor(Math.random() * (this.words.length - 1))];
        let adjective = this.adjectives[Math.floor(Math.random() * (this.adjectives.length - 1))];

        return (adjective + " " + word);
    }
}

module.exports = UsernameGenerator;