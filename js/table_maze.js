/*
Table Maze

Copyright 2019 Brian Puthuff

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* Modified by Jiazhou Chen 2023 */
let Maze = /** @class */ (function () {
    // constructor
    function Maze(cw, ch, preset) {
        if (preset) {
            this.cells_w = preset.cells_w;
            this.cells_h = preset.cells_h;
            this.maze_array = preset.maze_array;
        } else {
            this.cells_w = cw;
            this.cells_h = ch;
            // initialize maze
            this.maze_array = new Array(this.cells_w * this.cells_h);
            // fill maze array with walls (1)
            for (let i = 0; i < this.cells_h * this.cells_w; i += 1) {
                this.maze_array[i] = true;
            }
            console.log("The maze dimensions are set to (w = " + this.cells_w + ", h = " + this.cells_h + ").");
            console.log("The maze has been initialized.");
            // generate maze
            this.dig(1, 1);
            console.log("The maze has been generated.");
        }

    }
    // internal recursive path building (depth first)
    Maze.prototype.dig = function (cy, cx) {
        var count = 4;
        var direction = Math.floor((Math.random() * 4));
        // plot cell
        this.maze_array[(cy * this.cells_w) + cx] = false;
        // recursive path building
        while (count > 0) {
            switch (direction) {
                case 0:
                    if ((cy - 2) > 0) {
                        if (this.maze_array[((cy - 2) * this.cells_w) + cx] === true) {
                            this.maze_array[((cy - 1) * this.cells_w) + cx] = false;
                            this.dig(cy - 2, cx);
                        }
                    }
                    break;
                case 1:
                    if ((cx + 2) < (this.cells_w - 1)) {
                        if (this.maze_array[(cy * this.cells_w) + (cx + 2)] === true) {
                            this.maze_array[(cy * this.cells_w) + (cx + 1)] = false;
                            this.dig(cy, cx + 2);
                        }
                    }
                    break;
                case 2:
                    if ((cy + 2) < (this.cells_h - 1)) {
                        if (this.maze_array[((cy + 2) * this.cells_w) + cx] === true) {
                            this.maze_array[((cy + 1) * this.cells_w) + cx] = false;
                            this.dig(cy + 2, cx);
                        }
                    }
                    break;
                case 3:
                    if ((cx - 2) > 0) {
                        if (this.maze_array[(cy * this.cells_w) + (cx - 2)] === true) {
                            this.maze_array[(cy * this.cells_w) + (cx - 1)] = false;
                            this.dig(cy, cx - 2);
                        }
                    }
                    break;
            }
            // next direction
            direction += 1;
            if (direction === 4) {
                direction = 0;
            }
            // reduce loop count
            count -= 1;
        }
    };
    Maze.prototype.displayMaze = function () {
        var output = '';
        var r = 0;
        var c = 0;
        // output string renders as table with style classes defined elsewhere
        // use JS elements:
        const tbl = document.createElement('table')
        tbl.className = 'mzTight'
        tbl.id = 'maze'
        const tbr = document.createElement('tr')
        tbr.className = 'mzTR'
        const tbw = document.createElement('td')
        tbw.className = 'mzW'
        tbw.setAttribute('type','wall')
        const tbf = document.createElement('td')
        tbf.className = 'mzF'
        tbf.setAttribute('type','floor')
        for (r = 0; r < this.cells_h; r += 1) {
            tbl.appendChild(tbr.cloneNode())
            for (c = 0; c < this.cells_w; c += 1) {
                if (this.maze_array[r * this.cells_w + c] === true) {
                    tbl.rows[r].appendChild(tbw.cloneNode())
                }
                else {
                    tbl.rows[r].appendChild(tbf.cloneNode())
                }

            }
        }
        return tbl
    };
    return Maze;
}());
// entry call
function aMazeMe(w, h, preset) {
    // minimum width is three
    if (w < 3) {
        w = 3;
    }
    // height optional, if not included, it will be same as width
    if (h) {
        // minimum height is three
        if (h < 3) {
            h = 3;
        }
    }
    else {
        h = w;
    }
    // values must be odd
    if (w % 2 === 0) {
        w += 1;
    }
    if (h % 2 === 0) {
        h += 1;
    }
    // instantiate, create and display maze
    return new Maze(w, h, preset);;
}
