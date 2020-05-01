const readline = require('readline');
const fs = require("fs");
const path = require("path");

class WordBank {
     constructor(fileToOpen) {
        this.words = [];
        let fileInterface = readline.createInterface({
            input: fs.createReadStream((path.join(__dirname, 'WordData/FrenchWords'))),
            console: false
        });

         fileInterface.on('line', (line) => {
            this.words.push(line);
         });

    }

    getRandomWords(nb) {
        let randomWordsArray = [];

        for (let i = 0; i < nb; i++) {
            let word = "";
            let gardeFou = 0;

            do {
                let random = Math.floor(Math.random() * (this.words.length - 1));
                word = this.words[random];
                gardeFou++;
            } while (randomWordsArray.indexOf(word) !== -1 && gardeFou < 100);
            randomWordsArray.push(word);
        }
        return (randomWordsArray);
    }
}

module.exports = WordBank;