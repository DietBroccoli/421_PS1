async function loaded() {
    game = new Hangman('../resources/hangman/words.txt')
}


class Hangman {
    static alpha = 'qwertyuiopasdfghjklzxcvbnm'.split('');
    words = null;
    target = null;
    guessed = new Set();

    dashes = "_";
    letters;
    wordFile;
    guessArea;

    state = 0;

    constructor(wordFile) {
        this.wordFile = wordFile;
        this.initialize();
    }

    async readWordFile() {
        await $.get(this.wordFile).then((res) => {
            this.words = res.split('\r\n');
        });
    }

    async initialize() {
        await this.readWordFile()
                  .catch((reason) => {
                      console.log(reason);
                  });

        this.randomTarget();
        this.loadLetters();
        this.loadKeyboard();
        this.loadGuessed();
    }

    randomTarget() {
        this.target = randomChoice(this.words);
        console.log("TARGET WORD: ", this.target); // for cheating
    }

    loadKeyboard() {
        let keyboard = $('div#keyboard');
        let htmlButtons = '';
        Hangman.alpha.forEach((letter) => {
            htmlButtons += `<button type="button" value=${this.target.includes(letter)} style="border-color:whitesmoke background-color:whitesmoke">${letter}</button>`
            if (letter.includes('l') || letter.includes('p'))
                htmlButtons += '<br>';
        })
        keyboard.html(htmlButtons);

        document.getElementById('keyboard')
                .addEventListener('click', (event) => {
                    if (event.target.type !== 'button') return;
                    let button = event.target;
                    let letter = button.innerText;

                    if (this.guessed.has(letter)) return;
                    this.guess(letter);
                    button.disabled = true;

                });
    }

    loadLetters() {
        let letters = document.getElementById('letters');
        letters.innerHTML = this.dashes.repeat(this.target.length)
                                .split('')
                                .join(' ');
        this.letters = letters;
    }

    loadGuessed() {
        this.guessArea = document.getElementById('guessed');

        this.guessArea.innerHTML = '';
    }

    buildGallows() {
        let gallows = document.getElementById('gallows');

        gallows.src = `../resources/hangman/${++this.state}.jpg`

        if (this.state === 10)
            this.lose();
    }

    guess(letter) {
        this.guessed.add(letter);
        if (!this.target.includes(letter)) {
            this.guessArea.innerText += `${letter} `;
            this.buildGallows();
            return false;
        }


        let chars = this.target
                        .split('')
                        .map((c) => {
                            return this.guessed.has(c) ? `${c}` : this.dashes;
                        })

        document.getElementById('letters').innerHTML = chars.join(' ');

        this.checkWin();
        return true;
    }

    lose() {
        let msg = document.getElementById('message');
        msg.innerHTML = "You Lose! <a href='.'>Play again?</a>";
        this.disableButtons();

        let tarr = this.target.split('');
        tarr = tarr.map((c) => { return this.guessed.has(c) ? `${c}&nbsp;` : `<span class='missed'>${c}</span>&nbsp;`; })

        document.getElementById('letters').innerHTML = tarr.join('');
    }

    win() {
        let msg = document.getElementById('message');
        msg.innerHTML = "You Win! <a href='.'>Play again?</a>";
        this.disableButtons();
    }

    checkWin() {
        for (let i = 0; i < this.target.length; i++) {
            if (!this.guessed.has(this.target.charAt(i)))
                return;
        }
        this.win();
    }

    disableButtons() {
        let buttons = document.getElementsByTagName('button');
        for (let button of buttons) {
            button.disabled = true;
        }

    }
}

// https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

window.addEventListener("load", loaded);
