from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from math import e
import uuid
import os
import datetime


def to_valid_int(value:object, min:int, max:int, default:int) -> int:
    """
    Convert a value to an integer within a specified range, or return a default value.

    Args:
        value (object): The value to convert to an integer.
        min (int): The minimum allowed value.
        max (int): The maximum allowed value.
        default (int): The default value to return if the conversion fails or the value is out of range.

    Returns:
        int: The converted value within the specified range, or the default value.
    """
    try:
        int_value = int(value)
        if min <= int_value <= max:
            return int_value
    except (ValueError, TypeError):
        pass
    return default


def to_valid_task(value:list[str|int]) -> list[str|int]:
    """
    Convert a task value to a string and a times value to an integer within a specified range.

    Args:
        value (list[str|int]): The task value and times value to convert.

    Returns:
        list[str|int]: The converted task value and times value.
    """
    if not isinstance(value, list): # type: ignore
      value = []
    if len(value) < 1:
      value.append('???')
    if len(value) < 2:
      value.append(6)
    if len(value) > 2:
      value = value[:2]
    task = str(value[0] or '???')
    times = to_valid_int(value[1], -1, 6, 6)
    task = task.strip().replace('\n', ' ').replace('\r', '').replace('\t', ' ').replace('\0', '').replace('"', '').replace('\'', '')
    if len(task) > 100:
      task = task[:100]
    return [task, times]


def CleanSessionData(data:dict[str,object]) -> dict[str,object]:
    print(data)
    realData:dict[str,object] = {}
    realData['s'] = str(uuid.UUID(str(data['s']), version=4))
    realData['do'] = to_valid_int(data['do'], 0, 6, 6)
    tasks:list[list[str|int]] = data.get('t', []) # type: ignore
    if len(tasks) > 50:
      tasks = tasks[:50]
    realData['t'] = [to_valid_task(t) for t in tasks]
    checks:list[list[str]] = []
    taskI = 0
    for t in realData['t']:
      _, times = t
      tc = [' ' for i in range(times)]
      checks.append(tc)
      for i in range(times):
        try:
          tc[i] = data['c'][taskI][i] # type: ignore
        except IndexError:
          pass
      taskI += 1
    realData['c'] = checks
    return realData


def SaveSessionData(data:dict[str,object]) -> None:
  path = f'sessions/{data["s"]}.json'
  with open(path, 'w') as f:
    json.dump(data, f)


def LoadSessionData(session_id_str:str) -> dict[str,object]:
  path = f'sessions/{session_id_str}.json'
  if not os.path.exists(path):
    return {'status': 'error', 'message': 'Session not found'}
  with open(path, 'r') as f:
    data = json.load(f)
  return data


def NewSession(data:dict[str,object]) -> object:
    try:
      data['s'] = str(uuid.uuid4())
      checks:list[list[str]] = []
      for t in data.get('t', []): # type: ignore
        _, times = t # type: ignore
        tc = []
        for _ in range(times): # type: ignore
          tc.append('') # type: ignore
        checks.append(tc) # type: ignore
      data['c'] = checks
      data = CleanSessionData(data)
      SaveSessionData(data)
    except Exception:
      return {'status': 'error', 'message': 'Invalid data'}
    return data


def CleanParams(params:dict[str,object]) -> dict[str,object]:
    realParams:dict[str,object] = {}
    realParams['s'] = uuid.UUID(str(params['s']), version=4)
    realParams['do'] = to_valid_int(params['do'], 0, 6, 6)
    tasks:list[list[str|int]] = params.get('t', []) # type: ignore
    realParams['t'] = [to_valid_task(task) for task in tasks]
    return realParams # type: ignore


def WorkOnSession(session_id_str:str, params:dict[str,object]) -> object:
    task, time, icon = params
    data = LoadSessionData(session_id_str)
    if data['t'][task][1] == 0: # type: ignore
      if time <= -1: # type: ignore
        data['c'][task] = [] # type: ignore
      else:
        data['c'][task].append(icon) # type: ignore
        if len(data['c'][task]) > 10: # type: ignore
          data['c'][task] = data['c'][task][-10:] # type: ignore
    else:
      if len(data['c'][task][time]) > 0: # type: ignore
        data['c'][task][time] = '' # type: ignore
      else:
        data['c'][task][time] = icon # type: ignore
    SaveSessionData(data)
    return data


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args): # type: ignore
        # Override this method to suppress standard messages
        pass

    def log_error(self, format, *args): # type: ignore
        # Override this method to suppress error messages or customize the output
        pass

    def do_GET(self) -> None:
        """
        Handle GET requests to serve specific files or respond with JSON data for GUID paths.
        """
        # Serve the four files only
        if self.path == '/':
            self.serve_file('index.html')
        elif self.path == '/style.css':
            self.serve_file('style.css')
        elif self.path == '/script.js':
            self.serve_file('script.js')
        elif self.path == '/favicon.png':
            self.serve_file('favicon.png')
        elif self.path == '/appicon.png':
            self.serve_file('appicon.png')
        elif self.path == '/manifest.json':
            # Serve the manifest file that always returns a new version based on the current datetime
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'name': 'Weekly Task Planner',
                'short_name': 'Weekly Tasks',
                'autor': 'derDere',
                'display': 'standalone',
                'background_color': '#ffffff',
                'theme_color': '#ffffff',
                'version': datetime.datetime.now().strftime('%Y%m%d%H%M%S'),
                'icons': [
                    {
                        'src': '/appicon.png',
                        'sizes': '192x192',
                        'type': 'image/png'
                    }
                ]
            }).encode('utf-8'))
        # Serve GUID JSON response
        elif self.is_valid_uuid(self.path.strip('/')): # c32d8b45-92fe-44f6-8b61-42c2107dfe87
            guid = self.path.strip('/')
            response = LoadSessionData(guid)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            # Return 404 for any other paths
            self.send_error(404, "File not found")

    def do_POST(self) -> None:
        """
        Handle POST requests to GUID paths, expecting JSON data in the request body.
        """
        # Process POST request for GUID path
        if self.is_valid_uuid(self.path.strip('/')):
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                json_data = json.loads(post_data)
                # Do further work with the posted JSON data here
                response:object = WorkOnSession(self.path.strip('/'), json_data)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")

        elif self.path == '/new':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                json_data = json.loads(post_data)
                response = NewSession(json_data)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")

        else:
            # Return 404 for any other paths
            self.send_error(404, "File not found")

    def serve_file(self, filename:str) -> None:
        """
        Serve a file from the current directory if it exists.

        Args:
            filename (str): The name of the file to be served.
        """
        if os.path.exists(filename):
            self.send_response(200)
            # Set content type based on file extension
            if filename.endswith('.html'):
                self.send_header('Content-Type', 'text/html')
            elif filename.endswith('.css'):
                self.send_header('Content-Type', 'text/css')
            elif filename.endswith('.js'):
                self.send_header('Content-Type', 'application/javascript')
            elif filename.endswith('.png'):
                self.send_header('Content-Type', 'image/png')
            self.end_headers()
            with open(filename, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_error(404, "File not found")

    def is_valid_uuid(self, guid:str) -> bool:
        """
        Check if a given string is a valid UUID (version 4).

        Args:
            guid (str): The string to validate as a UUID.

        Returns:
            bool: True if the string is a valid UUID, False otherwise.
        """
        try:
            uuid_obj = uuid.UUID(guid, version=4)
            return str(uuid_obj) == guid
        except ValueError:
            return False


def run(server_class:type=HTTPServer, handler_class:type=SimpleHTTPRequestHandler, port:int=8000) -> None:
    """
    Start the HTTP server.

    Args:
        server_class (type): The server class to use (default is HTTPServer).
        handler_class (type): The handler class to use (default is SimpleHTTPRequestHandler).
        port (int): The port on which the server will listen (default is 8000).
    """
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Serving on port {port}")
    httpd.serve_forever()


if __name__ == '__main__':
    import sys
    if len(sys.argv) == 2:
        if str(sys.argv[1]).isnumeric():
            run(port=int(sys.argv[1]))
        else:
            print("Invalid port number")
    else:
        run()
