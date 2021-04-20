from flask import Flask,request,render_template
from flask_restful import Resource, Api
from sudoku import setPuzzle,decodeSudoku,solvePuzzle,removeRandomNumbers,isValidBoard
import configparser
import multiprocessing
import time

config = configparser.ConfigParser()
config.read('config.ini')
boardSize = int(config['DEFAULT']['boardSize'])

app = Flask(__name__, static_url_path='')
api = Api(app)

@app.route("/")
def hello():
    return render_template('game.html')

'''
Creates a brand new puzzle when GET requested
'''
class setAPuzzle(Resource):
    def get(self):
        board = [[0 for x in range(boardSize)] for y in range(boardSize)]
        setPuzzle(board,0 ,0, True)
        
        
        
        # user input is super evil so we default to a semi-hard puzzle if they try to play with API instead :P
        try:
            keepCells = int(request.args.get('keepCells'))
            if(keepCells != None and (keepCells > 0) and keepCells < (boardSize*boardSize-1)):
                removeRandomNumbers(board,keepCells)
            else:
                removeRandomNumbers(board,40)
        except:
            removeRandomNumbers(board,40)       
        return {'board': board}
api.add_resource(setAPuzzle, '/new')

'''
Since I didn't know if some of the zeros would be cut off I used dots instead '.' of 0's
solves the puzzle
#127.0.0.1:5000/solve?puzzle=123456789123456789123456789123456789123456789123456789123456789123456789123456789
'''
class solveAPuzzle(Resource):
    def get(self):
        board = [[0 for x in range(boardSize)] for y in range(boardSize)]        
        puzzle = request.args.get('puzzle')
        if(puzzle != None):
            outputBoard = decodeSudoku(puzzle)
            if(outputBoard == None):
                return {'message': 'Undefined input'}
            else:
                result,outputBoard = (solvePuzzle(outputBoard,0,0))
                if(result == None):
                    result = "False"
                if(outputBoard == None):
                    outputBoard = "False"
                return {'isSolvable': result,'board': outputBoard}
api.add_resource(solveAPuzzle, '/solve')

class isAValidPuzzle(Resource):
    def get(self):
        board = [[0 for x in range(boardSize)] for y in range(boardSize)]        
        puzzle = request.args.get('puzzle')
        if(puzzle != None):
            outputBoard = decodeSudoku(puzzle)
            if(outputBoard == None):
                return {'message': 'Undefined input'}
            else:
                return {'isValid': isValidBoard(outputBoard)}
api.add_resource(isAValidPuzzle, '/valid')


if __name__ == '__main__':
    app.run(debug=True)