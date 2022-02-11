class Minesweeper {
    static SIZE = 10;
    field;
    resources;
    bombs = null;
    origin = null;
    gameOver = false;
    nMines = 10;
    moves = 0;

    constructor(resourceFolder) {
        this.resources = resourceFolder;
        console.log("INITALIZED");
        this.loadTiles();
    }

    loadTiles() {
        this.field = document.getElementById('field');

        for (let i = 0; i < Minesweeper.SIZE; i++) {
            for (let j = 0; j < Minesweeper.SIZE; j++) {
                this.field.innerHTML += `<input type='image' id="${j},${i}" value="0" class="tile" src="${this.resources + '/alpha.png'}">`
            }
        }
        this.field.addEventListener('click', (event) => {
            if (event.target.type !== 'image' || this.gameOver) return;
            const tile = event.target;
            const [x, y] = tile.id.split(',').map(z => parseInt(z));

            tile.disabled = true;

            if (this.bombs === null) {
                this.origin = tile;
                this.layMines();
            }

            switch (tile.value) {
                case 'bomb':
                    this.lose();
                    tile.className = 'bomb-game-over';
                    break;
                default:
                    tile.className = 't' + tile.value;
                    this.moves++;
                    this.checkWin();

            }
        })

        this.field.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                const tile = event.target;
                if (tile.type !== 'image' || this.origin === null || this.gameOver) return;

                console.log(tile.value);
                switch (tile.className) {
                    case 'tile':
                        tile.className = 'flag';
                        break;
                    case 'flag':
                        tile.className = 'tile';
                        break;
                }
            }
        );
    }

    getRandTile() {
        return this.getTile(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10));
    }

    layMines() {
        this.bombs = new Set();

        while (this.bombs.size < this.nMines) {
            let bomb = this.getRandTile();
            if (bomb === this.origin) continue;
            this.bombs.add(bomb);
            bomb.value = 'bomb'
        }

        this.bombs.forEach((bomb) => {
            this.executeAdjacent(
                bomb,
                this.incrementValue,
                (b) => {
                    return b !== 'bomb';
                });
        });
    }


    executeAdjacent(target, callback, filterCallback) {
        let [x, y] = target.id.split(',').map(z => parseInt(z));
        for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, Minesweeper.SIZE); i++)
            for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, Minesweeper.SIZE); j++) {
                if (x === i && y === j) continue;
                let tile = this.getTile(i, j);
                if (filterCallback(tile.value)) {
                    callback(tile);
                }
            }
    }

    incrementValue(tile) {
        let val = parseInt(tile.value);
        tile.value = `${val + 1}`;
    }

    getTile(x, y) {
        return document.getElementById(`${x},${y}`);
    }

    getTiles() {
        return document.getElementsByTagName('input');
    }

    changeMessage(msg) {
        document.getElementById("message").innerHTML = msg;
    }

    lose() {
        let tiles = this.getTiles();
        for (let tile of tiles)
            tile.disabled = true;

        this.changeMessage("You Lose! <a href='.'>Play again?</a>");
        this.bombs.forEach((bomb) => {
            bomb.className = 'bomb';
        })
        this.gameOver = true;
    }

    win() {
        this.changeMessage("You Win! <a href='.'>Play again?</a>");
        this.gameOver = true;
    }

    checkWin() {
        if (this.moves === (Minesweeper.SIZE * Minesweeper.SIZE) - this.bombs.size)
            this.win();
    }
}

window.addEventListener("load", () => {
    new Minesweeper('../resources/minesweeper');
});