# SuDoKu Game
Made purely in JS/HTML/CSS/PYTHON with support for Firefox, Chrome and Safari.
![](showcase.gif)

# How to setup on Windows
```
git init
git pull https://github.com/michalani/SuDoKu.git
python3 -m venv venv
venv\Scripts\activate
pip3 install -r requirements.txt
```

# How to run on Windows (localy)
```
venv\Scripts\activate
python3 api.py
open in browser http://<SERVERIP>:5000/
```

# How to setup on Linux
```
sudo apt-get install python3 python3-venv git -y
git init
git pull https://github.com/michalani/SuDoKu.git
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

# How to run Linux (local or on server)
If you want to run it on a server please keep in mind that you will also have to change the serverDomain var in static/game.pretty.js 
```
export FLASK_APP=API.py
nohup flask run --host=<SERVERIP> --port=80
open in browser http://<SERVERIP>/
```