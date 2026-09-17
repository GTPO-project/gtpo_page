"""Exercise the real HTTP handler without binding a port."""
import io
import tempfile
from pathlib import Path
from serve import MediaHandler

class Socket:
    def __init__(self, data):
        self.input = io.BytesIO(data)
        self.output = io.BytesIO()
    def makefile(self, *args):
        return self.input
    def sendall(self, data):
        self.output.write(data)

with tempfile.TemporaryDirectory() as directory:
    Path(directory, 'clip.m4v').write_bytes(b'0123456789')
    for method, byte_range, code, body, expected_length in [
        ('GET', '0-3', 206, b'0123', '4'),
        ('GET', '5-', 206, b'56789', '5'),
        ('GET', '-3', 206, b'789', '3'),
        ('GET', '20-', 416, b'', '0'),
        ('GET', '5-2', 416, b'', '0'),
        ('HEAD', '0-3', 206, b'', '4'),
        ('GET', None, 200, b'0123456789', '10'),
    ]:
        header = f'Range: bytes={byte_range}\r\n' if byte_range else ''
        socket = Socket(f'{method} /clip.m4v HTTP/1.1\r\nHost: localhost\r\n{header}Connection: close\r\n\r\n'.encode())
        MediaHandler(socket, ('127.0.0.1', 1), None, directory=directory)
        response, payload = socket.output.getvalue().split(b'\r\n\r\n', 1)
        assert f' {code} '.encode() in response, response
        assert payload == body, payload
        assert f'Content-Length: {expected_length}'.encode() in response, response
        assert b'Accept-Ranges: bytes' in response
        if code != 416:
            assert b'content-type: video/mp4' in response.lower()
    print('PASS: full video, prefix/suffix/open ranges, invalid ranges, HEAD, MIME.')
