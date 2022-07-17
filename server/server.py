import asyncio
import hashlib
import websockets

import re
import json
from datetime import date, datetime

import threading

from websocket import Packet, Session
from message import Message
from database import Users, Texts

#
#   Global variables shared across every websocket
#

class Log:

    verbose = False

    def print(text):
        if Log.verbose:
            print(text)

class Chats:

    data: dict = {}

    class Global:
        messages = []

        @staticmethod
        def getJSON():
            return {'messages': Chats.Global.messages}

        @staticmethod
        def getString():
            return json.dumps(Chats.Global.getJSON())

    @staticmethod
    def getString(clients):
        return json.dumps(Chats.getJSON(clients))

    @staticmethod
    def getClientsHash(clients):
        clients = sorted(clients)
        clients = hashlib.md5((clients[0] + clients[1]).encode()).hexdigest()
        return clients

    @staticmethod
    def getJSON(clients):
        clients_hash = Chats.getClientsHash(clients)
        if clients_hash in Chats.data:
            return {'messages': Chats.data[clients_hash]}
        else:
            return {'messages':''}

    @staticmethod
    def append(message: Message):
        clients_hash = Chats.getClientsHash([message.sender, message.recipient])

        if clients_hash in Chats.data:
            Chats.data[clients_hash].append(message)
        else:
            Chats.data[clients_hash] = [message]

    @staticmethod
    def is_username_valid(username):
        if username == 'global':
            return 'username-invalid'

        if len(username) < 3 or not re.fullmatch('^[a-zA-Z0-9]+$', username):
            return 'username-invalid'

        return 'no-error'

    @staticmethod
    def load():
        print(Texts.get_all())
    @staticmethod
    def save():
        for clients, _ in Chats.data.items():
            Texts.save(clients, Chats.getString(clients))

class Clients:

    sessions = []

    @staticmethod
    def add(session):
        Clients.sessions.append(session)


#
#   Cleaning function for dandling sockets
#


def clean():
    Log.print('[CLEANING]')

    to_remove = []

    for s in Clients.sessions:
        if (datetime.now() - s.last).total_seconds() > 60:
            to_remove.append(s)

    for s in to_remove:
        Clients.sessions.remove(s)

    threading.Timer(30, clean).start()

def save():
    Log.print('[SAVING]')

    Chats.save()

    threading.Timer(30, save).start()

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
                res = Chats.is_username_valid(client.name)

                if res != 'no-error':
                    await client.send(type='handshake', content='username-invalid')
                    Log.print(
                        f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Invalid username!')
                    return

                # Check ip address validity
                if not re.fullmatch('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', client.ip):
                    await client.send(type='handshake', content='address-invalid')
                    Log.print(
                        f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Invalid IP address!')
                    return

                # Check if username is already signup and password match
                if Users.exists(client.name):
                    if not Users.check(client.name, packet.content):
                        await client.send(type='handshake', content='password-invalid')
                        Log.print(
                            f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Invalid password!')
                        return
                else:
                    Users.add(client.name, packet.content)

                # Check if username is already used
                for s in Clients.sessions:
                    if client.name == s.name:
                        # In case the ip is the same is just a reconnection
                        if client.ip == s.ip:
                            # Send the message and print
                            Clients.sessions.remove(s)
                            break
                        await client.send(type='handshake', content='username-taken')
                        Log.print(
                            f'[HANDSHAKE] [{packet.name}] [{packet.address}]: Failed! Username already in use!')
                        return

                # Add current client to clients list
                Clients.add(client)

                # Send the message and print
                await client.send(type='handshake', content='success')
                Log.print(
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
                            await client.send(name=packet.name, address=packet.address, type='text', content=str(message))
                    Log.print(
                        f'[TEXT] [{packet.name}] [{packet.address}]: {packet.content}')

                else:
                    if Chats.is_username_valid(message.recipient) == 'no-error':
                        Chats.append(message)
                        # Todo - Implement hashable sessions for faster performance
                        for client in Clients.sessions:
                            if client.name == message.recipient:
                                await client.send(name=packet.name, address=packet.address, type='text', content=str(message))
                                Log.print(
                                    f'[TEXT] [{packet.name}] [{packet.address}]: {packet.content}')

            # Handle chat request
            elif(packet.type == 'chat-request'):
                if packet.content == 'global':
                    await client.send(type='chat-request', content=Chats.Global.getString())

                else:
                    if Chats.is_username_valid(packet.content) == 'no-error':
                        clients = [packet.name, packet.content]
                        await client.send(type='chat-request', content=Chats.getString(clients))

            # Handle ping request
            elif(packet.type == 'ping'):

                for s in Clients.sessions:
                    if s.name == client.name:
                        s.last = datetime.now()

                # Send ping back
                await client.send(type='ping', content='alive')
                Log.print(
                    f'[PING] [{packet.name}] [{packet.address}]: {packet.content}')

            # Handle errors
            else:
                await client.send(type='error', content='unknown-type')
                Log.print(f'[UNKNOWN TYPE]: {packet.type}')

    # Exception handling
    except websockets.exceptions.ConnectionClosedError:
        Log.print("[ERROR] Client disconnected ungracefully")
    except json.decoder.JSONDecodeError:
        Log.print(f"[ERROR] JSONDecodeError! (Bad request?) {packet}")
    except KeyError:
        Log.print(f"[ERROR] Key error! (Bad request?) {packet}")
    except websockets.exceptions.ConnectionClosedOK:
        Log.print(f"[ERROR] ConnectionClosedOK error! (Bad request?) {packet}")
    except TypeError:
        Log.print(f"[ERROR] Type error! (Bad request?) {packet}")
    #except:
    #    Log.print("[ERROR] Unknown error!")

async def main():

    Log.verbose = True

    Users.init()
    Texts.init()

    Chats.load()

    Chats.Global.messages.append(Message({'recipient': 'global', 'sender': 'Server',
                                 'text': 'Server started! Enjoy your stay!', 'timestamp': datetime.now().strftime('%H:%M')}))

    save()
    clean()
    async with websockets.serve(process, "0.0.0.0", 8763):
        await asyncio.Future()  # run forever


asyncio.run(main())
