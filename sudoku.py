import random
import configparser
import math

# - Setting variables -
config = configparser.ConfigParser()
config.read('config.ini')
boardSize = int(config['DEFAULT']['boardSize'])# how long is full row or column
boardSizeCell = int(config['DEFAULT']['boardSizeCell']) # how long is full row of cell or full column of cell
emptyNo = int(config['DEFAULT']['emptyNo'])
validNumbers = [x for x in range(1,boardSize+1)] #1..9

def selectrandomRowAndCol():
    return (random.randint(0,8),random.randint(0,8))

# select random [row,column] check if any other number can be fit into where valid number resided
def setNewUniquePuzzle(boardToBeUnique,difficulty):    
    for _ in range(difficulty):
        r,c = (random.randint(0,8),random.randint(0,8))
        tmpValue = boardToBeUnique[r][c]
        boardToBeUnique[r][c] = 0
        for n in validNumbers:
            if(tmpValue != 0 and isValid(boardToBeUnique, n, r, c) == True and n != tmpValue):
                boardToBeUnique[r][c] = tmpValue
                


def main():
    #-- Ignore -- Debugging the uniqness of the board
    '''
    BoardsList = []
    board = [[0 for x in range(boardSize)] for y in range(boardSize)]
    s,boardToBeUnique = solvePuzzleRandomly(board,0 ,0)
    #5 easy, #15 medium, #50 hard
    setNewUniquePuzzle(boardToBeUnique,50)#easy
    for a in boardToBeUnique:
        print(a)
    print("--------------")
    s,b = solvePuzzle(boardToBeUnique, 0, 0)
    print(s)
    for a in b:
        print(a)
    '''
    for _ in range(999):
        board = [[0 for x in range(boardSize)] for y in range(boardSize)]
        setPuzzle(board,0 ,0, True)
        assert (isValidBoard(board) == True), "setPuzzle generated board that does not follow Sudoku Rules! \n{0}".format(board)

# check if the whole puzzle follows sudoku rules
def isValidBoard(boardToCheck):
    tmpValue = None
    for row in range(0,boardSize):
        for col in range(0,boardSize-1):
            tmpValue = boardToCheck[row][col]
            boardToCheck[row][col] = 0
            if((isValid(boardToCheck, tmpValue, row, col)) == False):
                print("{0} {1} {2}".format(tmpValue, row, col))
                return False
            boardToCheck[row][col] = tmpValue
    return True
                
# Finds a starting position for 3x3 row/or col given it's current position
def setPos(rowOrCol):
    return 3*(rowOrCol // boardSizeCell)

# Can board be placed at that position while following rules : (full row [1..9],col [1..9], 3x3 1..9)
def isValid(board, num, row, col):
    
    # isValid 3x3 cell
    for smallRow in range(setPos(row), setPos(row) + boardSizeCell):
        for smallCol in range(setPos(col), setPos(col) + boardSizeCell):
            if(board[smallRow][smallCol] == num):
                return False

    # isValid columm
    for tmpRow in range(0,boardSize):
        if(board[tmpRow][col] == num):
            return False

    # isValid row
    if num in board[row]:
        return False
    return True

# solver is actually part of the same algorithm that generates boards
def solvePuzzle(board,row ,col):
    return setPuzzle(board,row ,col,False), board

def solvePuzzleRandomly(board,row ,col):
    return setPuzzle(board,row ,col,True), board


# shuffle 1..9
def setShuffleNumbers():
    random.shuffle(validNumbers)
    return (validNumbers[:])

# [DEPRECATED] removes random numbers from the board
'''
def removeRandomNumbers(board,howManyNumbers):
    totalBoardSize =(boardSize*boardSize-1)
    tmp = [i for i in range(0,totalBoardSize)]
    #--- https://stackoverflow.com/questions/44883905/randomly-remove-x-elements-from-a-list copied from stack overflow
    to_delete = set(random.sample(range(len(tmp)),howManyNumbers))
    newTmp = [x for i,x in enumerate(tmp) if not i in to_delete]
    # -----------
    for i in range(0,len(newTmp)):
        row = (math.trunc(newTmp[i]/9))-1
        col = (newTmp[i]%9)-1
        board[row][col] = 0
''' 

# creates new (filled) puzzle from scratch
def setPuzzle(board,row ,col,setNewPuzzle):
    '''
    Solve OR create sudoku using a backtracking algorithm

    Changelog:
    v0.1 used for loops, bad idea broke the pythons limit of recursions and it looked like spaghetti
    v0.2 better optimized and ony 1 for loop :P
    v0.3 added puzzle generation and removed old way of doing it
    '''
   # IF whole board scanned then it's solved ELSE increase the row
    if(boardSize == col):
        if(boardSize - 1 == row): # finished
            return True
        else:
            row,col = row+1,0 # not finished iterate row  
    
    # IF solved go to next col
    if emptyNo != board[row][col]:
        return setPuzzle(board, row, (1+col),setNewPuzzle)
    
    if(setNewPuzzle == True):
        numbers = setShuffleNumbers()
    else:
        numbers = validNumbers
    
    for num in numbers:
        # IF isValid placement set value on board
        if(isValid(board, num, row, col) == True):
            board[row][col] = num

            # recurse to the next column if values left
            if setPuzzle(board, row, (1+col),setNewPuzzle):
                return True
        
        #guess was wrong! so we backtrack the answer
        board[row][col] = emptyNo
    return False

# This is to decode API recieved input
def decodeSudoku(encodedSudoku):
    try:
        parts = [encodedSudoku[i:i+boardSize] for i in range(0, len(encodedSudoku), boardSize)]    
        finalArray = []
        for i in range(0,boardSize):
            tmpRow = []
            for j in range(0,boardSize):
                if(parts[i][j] == "."):
                    tmpRow.append(0)
                else:
                    tmpRow.append(int(parts[i][j]))
                if(j == boardSize-1):
                    finalArray.append(tmpRow)
        return finalArray
    except:
        print("invalid size or input in decodeSudoku")
        # we will not let users know what went wrong cause they were probably doing this with malicious intent

if __name__ == "__main__":
    main()