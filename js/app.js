'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos
var gBallsCollected = 0
var gBallsInMap = 2
var keyDisable = false


function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    setInterval(placeRandomBall, 3000)
    setInterval(placeRandomGlue,5000)
    victory()
    gBallsCollected = 0
    gBallsInMap = 2
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    board[0][5].type = FLOOR
    board[5][0].type = FLOOR
    board[9][5].type = FLOOR
    board[5][11].type = FLOOR

    // board[5][11].type=FLOOR 

    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL


    console.log(board)
    return board
}
function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }
            else if (currCell.gameElement === GLUE) {
                strHTML += GLUE_IMG
            }
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}
function moveTo(i, j) {
    if (keyDisable) return

    var nearBalls = countNegs(i, j, gBoard)
    var elNearByBalls = document.querySelector('.NearbyBalls')
    elNearByBalls.innerText = 'Nearby balls:  ' + nearBalls
    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === 11) || (iAbsDiff === 9 && jAbsDiff === 0)) {
        if (targetCell.gameElement === BALL) {
            gBallsCollected++
            var elBallsCollected = document.querySelector('.ballsCollected')
            elBallsCollected.innerText = 'Balls collected:  ' + gBallsCollected
            gBallsInMap--
            var elBallsInMap = document.querySelector('.ballsInMap')
            elBallsInMap.innerText = 'Balls in map: ' + gBallsInMap
            var audioPop = new Audio('img/si.wav')
            audioPop.play()
            if (gBallsInMap === 0) {
                victory('block')
                gBallsCollected = 0
            }
        }
        else if (targetCell.gameElement === GLUE) {
            
            keyDisable=true
            setTimeout(disableMove,3000)
            // console.log('glue here');
        }
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        renderCell(gGamerPos, '')
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        renderCell(gGamerPos, GAMER_IMG)
    }
}
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            if (j === 0) {
                moveTo(i, 11)
                break
            }
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (j === 11) {
                moveTo(i, 0)
                break
            }
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (i === 0) {
                moveTo(9, j)
                break
            }
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (i === 9) {
                moveTo(0, j)
                break
            }
            moveTo(i + 1, j)
            break
    }
}


function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}
function findEmptyCells(board) {
    var emptyIdxs = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            ///console.log('board', gBoard[i])
            var currCell = board[i][j]
            if (currCell.type === FLOOR && !currCell.gameElement) {
                emptyIdxs.push({ i, j })
            }
        }
    }
    return emptyIdxs
}

function placeRandomBall() {
    var Idxs = findEmptyCells(gBoard)
    var randIdxs = shuffle(Idxs)
    //console.log(randIdxs);
    var currEmptyIdx = randIdxs[0]
    gBoard[currEmptyIdx.i][currEmptyIdx.j].gameElement = BALL
    renderCell(currEmptyIdx, BALL_IMG)
    gBallsInMap++
    var elNumberCount = document.querySelector('.ballsInMap')
    elNumberCount.innerText = 'Balls in map: ' + gBallsInMap
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }
    return array
}

function victory(none = 'none') {
    var elWinningMessage = document.querySelector('.winning-message')
    var elNewGame = document.querySelector('.winning-message .newGame')
    elWinningMessage.style.display = none
    elNewGame.style.display = none
    var elBallCounter = document.querySelector('.ballsCollected')
    elBallCounter.innerText = 'Balls collected: ' + 0
}

function countNegs(cellI, cellJ, mat) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            // if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) negsCount++
            if (mat[i][j].gameElement === BALL) negsCount++
        }
    }
    return negsCount
}

function placeRandomGlue() {
    var Idxs = findEmptyCells(gBoard)
    var randIdxs = shuffle(Idxs)
    var currEmptyIdx = randIdxs[0]
    var currGlue = gBoard[currEmptyIdx.i][currEmptyIdx.j].gameElement = GLUE
    renderCell(currEmptyIdx, GLUE_IMG)


}


function disableMove(){
    keyDisable=false
}
// 
// function cantMove() {
//     for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
//             if (j < 0 || j >= gBoard[0].length) continue
//             if (i === gGamerPos.i && j === gGamerPos.j) continue
//             gBoard[i][j].type = WALL
//             gBoard[i - 1][j - 1].type = WALL

//         }
//     }
// }
// function canMove() {
//     for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
//             if (j < 0 || j >= gBoard[0].length) continue
//             if (i === gGamerPos.i && j === gGamerPos.j) continue
//             gBoard[i][j].type = FLOOR
//             gBoard[i - 1][j - 1].type = FLOOR

//         }
//     }
// }



