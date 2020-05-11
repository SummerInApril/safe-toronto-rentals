import os
import re
from flask import Flask, jsonify, render_template, request

from cs50 import SQL
from helpers import lookup

# Configure application
app = Flask(__name__)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///mashup.db")


# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
def index():
    """Render map"""
    return render_template("index.html")


@app.route("/articles", methods=["GET", "POST"])
def articles():
    #if request.methods =="GET":
    location=request.args.get("geo")
    #print("location is",location)
    #print("news is",news)
    #return jsonify(news)


@app.route("/search", methods=["GET", "POST"])
def search():

    searchO=request.args.get("q")
    if searchO.isnumeric()==True:
        #user input is year
        length=len(searchO)

    if int(searchO) == 2003:
        rows=db.execute("SELECT * FROM events")
    else:
        rows=db.execute("SELECT * FROM events WHERE year LIKE(:fid)", fid="%"+searchO+"%")

    return jsonify(rows)


@app.route("/update")
def update():
    """Find up to 10 places within view"""

    # Ensure parameters are present
    if not request.args.get("sw"):
        raise RuntimeError("missing sw")
    if not request.args.get("ne"):
        raise RuntimeError("missing ne")

    # Ensure parameters are in lat,lng format
    if not re.search("^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$", request.args.get("sw")):
        raise RuntimeError("invalid sw")
    if not re.search("^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$", request.args.get("ne")):
        raise RuntimeError("invalid ne")

    # Explode southwest corner into two variables
    sw_lat, sw_lng = map(float, request.args.get("sw").split(","))

    # Explode northeast corner into two variables
    ne_lat, ne_lng = map(float, request.args.get("ne").split(","))

    # Find 10 cities within view, pseudorandomly chosen if more within view
    if sw_lng <= ne_lng:

        # Doesn't cross the antimeridian
        rows = db.execute("""SELECT * FROM events
                          WHERE :sw_lat <= lat AND lat <= :ne_lat AND (:sw_lng <= long AND long <= :ne_lng)
                          ORDER BY RANDOM()
                          """,
                          sw_lat=sw_lat, ne_lat=ne_lat, sw_lng=sw_lng, ne_lng=ne_lng)

    else:

        # Crosses the antimeridian
        rows = db.execute("""SELECT * FROM events
                          WHERE :sw_lat <= lat AND lat <= :ne_lat AND (:sw_lng <= long OR long <= :ne_lng)
                          ORDER BY RANDOM()
                          """,
                          sw_lat=sw_lat, ne_lat=ne_lat, sw_lng=sw_lng, ne_lng=ne_lng)

    # Output places as JSON
    return jsonify(rows)


