import json
from datetime import datetime

server_address = '151.42.218.228'
server_name = 'server'

class Packet:

    def __init__(self) -> None:
        self.name = None
        self.address = None
        self.type = None
        self.content = None

    def __init__(self, packet: dict) -> None:
        self.name = packet['name']
        self.address = packet['address']
        self.type = packet['type']
        self.content = packet['content']

    def toJSON(self) -> dict:
        return {'name': self.name, 'address': self.address, 'type': self.type, 'content': self.content}

    def __str__(self) -> str:
        return json.dumps(self.toJSON())


class Session:
    def __init__(self, websocket, name, ip) -> None:
        self.websocket = websocket
        self.name = name
        self.ip = ip
        self.last = datetime.now()

    async def send(self, name = server_name, address = server_address, type = 'error-type', content = ''):
        message = Packet({'name': name, 'address': address,
                          'type': type, 'content': content})
        await self.websocket.send(str(message))