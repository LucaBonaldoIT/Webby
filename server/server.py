import asyncio
from sqlite3 import connect
import websockets
import json
from datetime import datetime

server_address = 'localhost'
server_name = 'server'

class Chat:
    text = f'<p>Server started on {datetime.now()}</p>'


class Message:

    def __init__(self) -> None:
        self.name = None
        self.address = None
        self.type = None
        self.content = None

    def __init__(self, message: dict) -> None:
        self.name = message['name']
        self.address = message['address']
        self.type = message['type']
        self.content = message['content']

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
        message = Message({'name': name, 'address': address,
                          'type': type, 'content': content})
        await self.websocket.send(str(message))


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
            session = Session(websocket, message.name, message.address)

            if(message.type == 'handshake'):

                # Check if username is already used
                for s in Connections.sessions:
                    if session.name == s.name:
                        if (datetime.now() - s.last).total_seconds() > 60:
                            Connections.sessions.remove(s)
                            break
                        await session.send(type='handshake', content='username-taken')
                        print(
                            f'[HANDSHAKE] [{message.name}] [{message.address}]: Failed! Username already in use!')
                        return

                # Add current client to clients list
                Connections.add(session)

                # Send the message and print
                await session.send(type='handshake', content='success')
                print(
                    f'[HANDSHAKE] [{message.name}] [{message.address}]: {message.content}')

            # Handle text request
            elif(message.type == 'text'):

                Chat.text += '<p>' + '<b>' + message.address + \
                    ':</b>\t' + message.content + '</p>'

                # Notify every clients
                for session in Connections.sessions:
                    if not session.websocket.closed:
                        await session.send(name=message.name, address=message.address, type='text', content=Chat.text)
                print(
                    f'[TEXT] [{message.name}] [{message.address}]: {message.content}')

            # Handle ping request
            elif(message.type == 'ping'):

                for s in Connections.sessions:
                    if s.name == session.name:
                        s.last = datetime.now()

                # Send ping back
                await session.send(type='ping', content='alive')
                print(
                    f'[PING] [{message.name}] [{message.address}]: {message.content}')

            else:
                print(f'[UNKNOWN TYPE]: {message.type}')

    # Exception handling
    except websockets.exceptions.ConnectionClosedError:
        print("[ERROR] Client disconnected ungracefully")
    except json.decoder.JSONDecodeError:
        print(f"[ERROR] JSONDecodeError! (Bad request?) {message}")
    except KeyError:
        print(f"[ERROR] Key error! (Bad request?) {message}")


async def main():
    async with websockets.serve(process, "0.0.0.0", 8763):
        await asyncio.Future()  # run forever


asyncio.run(main())
