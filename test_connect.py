import asyncio
import websockets
from websockets.client import WebSocketClientProtocol

async def listen_to_server(uri: str) -> None:
    print(uri)
    async with websockets.connect(uri) as websocket:
        print("Connected to server")
        while True:
            try:
                message = await websocket.recv()
                print(f"Received from server: {message}")
            except websockets.exceptions.ConnectionClosedOK:
                print("Connection closed by server")
                break

if __name__ == "__main__":
    uri = "ws://localhost:8766"
    loop = asyncio.get_event_loop()
    loop.run_until_complete(listen_to_server(uri))
