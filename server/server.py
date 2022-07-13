import asyncio
from struct import pack
import websockets

import re
import json
from datetime import date, datetime

import threading

from websocket import Packet, Session
from message import Message

#
#   Global variables shared across every websocket
#


class Chats:

    messages = []

    class Global:
        messages = []

        @staticmethod
        def getJSON():
            return {'messages': Chats.Global.messages}

        @staticmethod
        def getString():
            return json.dumps(Chats.Global.getJSON())

    @staticmethod
    def get(recipient: str):
        return Chats.messages[recipient]


class Clients:

    sessions = []

    @staticmethod
    def add(session):
        Clients.sessions.append(session)


#
#   Cleaning function for dandling sockets
#


def clean():
    print('[CLEANING]')
    for s in Clients.sessions:
        if (datetime.now() - s.last).total_seconds() > 60:
            Clients.sessions.remove(s)

    threading.Timer(30, clean).start()


#
#   Main program logic
#


async def process(websocket):
    try:
        async for packet in websocket:

            packet = Packet(json.loads(packet))
            client = Session(websocket, packet.name, packet.address)

            if(packet.type == 'handshake'):

                # Check username validity
                if len(client.name) < 3 or not re.fullmatch('^[a-zA-Z0-9]+$', client.name):
                    await client.send(type='handshake', content='username-invalid')
                    print(
                        f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Invalid username!')
                    return

                # Check ip address validity
                if not re.fullmatch('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', client.ip):
                    await client.send(type='handshake', content='address-invalid')
                    print(
                        f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Invalid IP address!')
                    return

                # Check if username is already used
                for s in Clients.sessions:
                    if client.name == s.name:
                        # In case the ip is the same is just a reconnection
                        if client.ip == s.ip:
                            # Send the message and print
                            await client.send(type='handshake', content='success')
                            print(
                                f'[HANDSHAKE] [{packet.name}] [{packet.address}]: {packet.content}')
                            return
                        await client.send(type='handshake', content='username-taken')
                        print(
                            f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Username already in use!')
                        return

                # Add current client to clients list
                Clients.add(client)

                # Send the message and print
                await client.send(type='handshake', content='success')
                print(
                    f'[HANDSHAKE] [{packet.name}] [{packet.address}]: {packet.content}')

            # Handle text request
            elif(packet.type == 'text'):

                message = Message(packet.content)

                # Todo - Add global as restrict username

                if message.recipient == 'global':
                    Chats.Global.messages.append(message)

                    # Notify every clients
                    for client in Clients.sessions:
                        if not client.websocket.closed:
                            await client.send(name=packet.name, address=packet.address, type='text', content=message.text)
                    print(
                        f'[TEXT] [{packet.name}] [{packet.address}]: {packet.content}')

            # Handle chat request
            elif(packet.type == 'chat-request'):
                if packet.content == 'global':
                    await client.send(type='chat-request', content=Chats.Global.getString())

            # Handle ping request
            elif(packet.type == 'ping'):

                for s in Clients.sessions:
                    if s.name == client.name:
                        s.last = datetime.now()

                # Send ping back
                await client.send(type='ping', content='alive')
                print(
                    f'[PING] [{packet.name}] [{packet.address}]: {packet.content}')

            # Handle errors
            else:
                await client.send(type='error', content='unknown-type')
                print(f'[UNKNOWN TYPE]: {packet.type}')

    # Exception handling
    except websockets.exceptions.ConnectionClosedError:
        print("[ERROR] Client disconnected ungracefully")
    except json.decoder.JSONDecodeError:
        print(f"[ERROR] JSONDecodeError! (Bad request?) {packet}")
    except KeyError:
        print(f"[ERROR] Key error! (Bad request?) {packet}")


async def main():

    Chats.Global.messages.append(Message({'recipient': 'global', 'sender': 'Server',
                                 'text': 'Server started! Enjoy your stay!', 'timestamp': datetime.now().strftime('%H:%M')}))

    clean()
    async with websockets.serve(process, "0.0.0.0", 8763):
        await asyncio.Future()  # run forever


asyncio.run(main())
