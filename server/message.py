import json

class Message(dict):
    def __init__(self, message: dict) -> None:
        self.recipient = message['recipient']
        self.sender = message['sender']
        self.text = message['text']
        self.timestamp = message['timestamp']
        dict.__init__(self, recipient=message['recipient'], sender=message['sender'], text=message['text'], timestamp=message['timestamp'])

    def toJSON(self) -> dict:
        return {'recipient': self.recipient, 'sender': self.sender, 'text': self.text, 'timestamp': self.timestamp}

    def __str__(self) -> str:
        return json.dumps(self.toJSON())