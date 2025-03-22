# Copyright (C) 2024 Urufusan
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import functools
import json
import os
import time
from collections import defaultdict
from io import BytesIO
from pprint import pprint

from flask import Flask, Response, after_this_request, jsonify, redirect, request, send_file, url_for
from flask_sock import Sock as FlaskWSocket
from simple_websocket.ws import Server

app = Flask(__name__)

BASE_PATH = os.path.dirname(os.path.realpath(__file__))
os.chdir(BASE_PATH)

SERVER_NAME = "REACTBOTWEB"


class TerminalColors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    ORANGE = "\033[33m"

    @staticmethod
    def terminalpaint(color):
        if isinstance(color, str):
            if color.startswith("#"):
                color = color[1:]
            r, g, b = tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))
        elif isinstance(color, tuple) and len(color) == 3:
            r, g, b = color
        else:
            raise ValueError("Invalid color format")

        color_code = f"\x1b[38;2;{r};{g};{b}m"
        return color_code

    def print_ctext(self, _text, color="#964bb4"):
        _raw_pp_str = str(_text)
        print(f"{self.terminalpaint(color)}{_raw_pp_str}{self.ENDC}")


tc = TerminalColors()
printfc = tc.print_ctext

app = Flask(SERVER_NAME, static_folder="static", static_url_path="")

# https://github.com/miguelgrinberg/flask-sock
app.config["SOCK_SERVER_OPTIONS"] = {"ping_interval": 10}
wsock = FlaskWSocket(app)

# ws_client_list: list[Server] = []
# payload_queue = []
clients_map: dict[str, list[Server]] = defaultdict(list)


@app.route("/doreact/<string(length=2):rbsharedsecret>", methods=["POST", "GET"])
def doreact(rbsharedsecret: str):
    # print(request.headers)

    printfc(clients_map, "#e0ae75")
    for _ws_client in clients_map[rbsharedsecret].copy():
        if _ws_client.connected:
            _ws_client.send("trigger_reaction")
            return Response("OK", 200, mimetype="text/plain")
        else:
            clients_map[rbsharedsecret].remove(_ws_client)

    if not clients_map[rbsharedsecret]:
        clients_map.pop(rbsharedsecret)
        return Response("NO CLIENTS", 410, mimetype="text/plain")



@wsock.route("/wsp")
def wsock_frontend_com(ws: Server):

    printfc(f"[WS] New websocket connection! - {request.user_agent.string}", color="#3dfa4d")
    _shared_secret = request.cookies.get("rbsharedsecret")[:10]
    @after_this_request
    def _nuke_ws_client(_ws_resp_ctx):
        printfc(f"[WS] {request.user_agent.string} Disconnected!", color="#ff4444")
        clients_map[_shared_secret].remove(ws)
        return _ws_resp_ctx

    clients_map[_shared_secret].append(ws)
    while True:
        data = ws.receive(None)
        if data:
            print(f"{tc.terminalpaint('#3357bb')}[WS DATA - {type(data).__name__}]{tc.ENDC}", data)


# @app.route("/")
# def goto_correct():
#     print(request.args.to_dict())
#     _wurl_params = {key: value for key, value in request.args.items()}
#     return redirect(url_for("static", filename="index.html", **_wurl_params))


@app.route("/")
def root_pth():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    # t = threading.Thread(target=msg_broadcaster)
    # t.daemon = True
    # t.start()

    print(tc.terminalpaint("#964bb4"), "/// ReactBotWeb ///", tc.ENDC)
    app.run(host="0.0.0.0", port=3000, debug=False)
