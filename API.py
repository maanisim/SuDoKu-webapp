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

'''
Load html page for SuDoKu board
'''
@app.route("/")
def index():
    return render_template('game.html')

@app.route("/tutorial")
def tutorial():
    return render_template('tutorial.html')

'''
Creates a brand new puzzle when GET requested

http://127.0.0.1:5000/new
http://127.0.0.1:5000/new?keepCells=40
keepCells declares how many cells are to be kept as the rest will be purged
'''
class setAPuzzle(Resource):
    def get(self):
        board = [[0 for x in range(boardSize)] for y in range(boardSize)]
        setPuzzle(board,0 ,0, True)
        
        # user input is super evil so we default to a puzzle instead of humouring them :P
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
solves the puzzle GET revolsed with one

Why GET and not POST? because javascript is evil.

Since I didn't know if some of the zeros would be cut off I used dots instead of 0's
http://127.0.0.1:5000/solve?puzzle=....8.9716.34.7852798..134643....5....71..43.5.2349.1.3...1...4..59..163..6.3....
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

'''
If user has submitted a puzzle we want to know whether it's valid or not this function check and responds with
isValid:	true
isValid:	false

http://127.0.0.1:5000/valid?puzzle=254683971613497852798251346431768529967125438582349617329516784845972163176834295
http://127.0.0.1:5000/valid?puzzle=154683971613497852798251346431768529967125438582349617329516784845972163176834295
'''
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
    app.run(debug=False)