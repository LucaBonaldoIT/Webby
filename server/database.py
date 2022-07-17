import sqlite3
import os.path
from os import path
import hashlib

class Texts:
    database: sqlite3.Connection = None

    insert: str = 'INSERT INTO TEXTS (clients, chat) values(?, ?)'
    get: str = 'SELECT chat FROM TEXTS WHERE clients = ?'
    get_all_command: str = 'SELECT * FROM TEXTS'
    update: str = 'UPDATE TEXTS SET chat = ? WHERE clients = ?'

    @staticmethod
    def init():
        was_there = path.exists('databases/texts.db')
        Texts.database = sqlite3.connect('databases/texts.db', check_same_thread=False)

        if not was_there:
            with Texts.database:
                Texts.database.execute("""
                                       CREATE TABLE TEXTS (
                                            clients TEXT,
                                            chat TEXT
                                        );

                                       """
                                       )

    @staticmethod
    def exists(clients):
        with Texts.database:
            return Texts.database.execute(Texts.get, [clients]).fetchall() != []

    @staticmethod
    def save(clients, chat):
        if Texts.exists(clients):
            Texts.database.execute(Texts.update, (chat, clients))
        else:
            Texts.database.execute(Texts.insert, (clients, chat))

    @staticmethod
    def get_all():
        return Texts.database.execute(Texts.get_all_command).fetchall()

class Users:

    database: sqlite3.Connection = None

    insert: str = 'INSERT INTO USER (username, password) values(?, ?)'
    get: str = 'SELECT password FROM USER WHERE username = ?'

    @staticmethod
    def init():
        was_there = path.exists('databases/users.db')
        Users.database = sqlite3.connect('databases/users.db', check_same_thread=False)

        if not was_there:
            with Users.database:
                Users.database.execute("""
                                       CREATE TABLE USER (
                                            username TEXT,
                                            password TEXT
                                        );

                                       """
                                       )

    @staticmethod
    def hash_password(password: str):
        password_hashed = hashlib.md5(password.encode()).hexdigest()
        password_hashed = hashlib.sha1((password_hashed + password).encode()).hexdigest()
        password_hashed = hashlib.sha256((password_hashed + password).encode()).hexdigest()
        return password_hashed

    @staticmethod
    def exists(username):
        with Users.database:
            return Users.database.execute(Users.get, [username]).fetchall() != []

    @staticmethod
    def add(username, password):
        with Users.database:
            if Users.database.execute(Users.get, [username]).fetchall() == []:
                Users.database.execute(Users.insert, (username, Users.hash_password(password)))

    @staticmethod
    def check(username, password) -> bool:
        with Users.database:
            fetch = Users.database.execute(Users.get, [username]).fetchone()
            if fetch == None:
                return False
            hashed_password = fetch[0]
            return hashed_password == Users.hash_password(password)
