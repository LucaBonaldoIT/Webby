import asyncio
import websockets
import json
from datetime import datetime

server_address = '151.42.218.228'

class Chat:
    text = f'<p>Server started on {datetime.now()}</p>'

class Message:

    def __init__(self) -> None:
        self.address = None
        self.type = None
        self.content = None

    def __init__(self, message: dict) -> None:
        self.address = message['address']
        self.type = message['type']
        self.content = message['content']

    def toJSON(self) -> dict:
        return {'address':self.address, 'type': self.type, 'content': self.content}


class Session:
    def __init__(self, ip) -> None:
        self.ip = ip


class Connections:
    sessions = []

    @staticmethod
    def add(session):
        Connections.sessions.append(session)

#
#
#
#
#

async def process(websocket):
    try:
        async for message in websocket:

            message = Message(json.loads(message))

            if(message.type == 'handshake'):
                Connections.add(websocket)
                response = Message({'address': server_address, 'type':'handshake', 'content':'success'})
                await websocket.send(json.dumps(response.toJSON()))
                print(f'[HANDSHAKE] [{message.address}]: {message.content}')

            elif(message.type == 'text'):
                Chat.text += '<p>' + '<b>' + message.address + ':</b>\t' + message.content + '</p>'
                response = Message({'address': message.address, 'type':'text', 'content':Chat.text})
                for session in Connections.sessions:
                    if not session.closed:
                        await session.send(json.dumps(response.toJSON()))
                print(f'[TEXT] [{message.address}]: {message.content}')
            elif(message.type == 'ping'):
                response = Message({'address': server_address, 'type':'ping', 'content':'alive'})
                await websocket.send(json.dumps(response.toJSON()))
                print(f'[PING] [{message.address}]: {message.content}')
            else:
                print(f'[UNKNOWN TYPE]: {message.type}')
    except websockets.exceptions.ConnectionClosedError:
        print("[ERROR] Client disconnected ungracefully")

async def main():
    async with websockets.serve(process, "0.0.0.0", 8763):
        await asyncio.Future()  # run forever


asyncio.run(main())
