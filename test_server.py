import asyncio
import websockets
from websockets.server import WebSocketServerProtocol
from typing import Set, Dict

# List to keep track of connected clients
connected_clients: Set[WebSocketServerProtocol] = set()

# Internal state to broadcast
internal_state: Dict[str, int] = {"counter": 0}

# WebSocket handler to manage clients
async def handler(websocket: WebSocketServerProtocol, path: str) -> None:
    # Register the new client
    connected_clients.add(websocket)
    try:
        # Keep the connection open
        async for message in websocket:
            pass
    except websockets.exceptions.ConnectionClosedOK:
        pass
    finally:
        # Unregister the client
        connected_clients.remove(websocket)

import json

# Function to periodically update and broadcast the internal state
async def broadcast_state() -> None:
    while True:
        # Update the internal state (example: increment a counter)
        internal_state["counter"] += 1

        # Broadcast the internal state to all connected clients
        if connected_clients:  # Only send if there are connected clients
            message = json.dumps(internal_state)
            await asyncio.wait([client.send(message) for client in connected_clients])

        # Wait for a second before updating the state again
        await asyncio.sleep(1)

# Main function to start the WebSocket server
async def main() -> None:
    # Start the WebSocket server
    async with websockets.serve(handler, "localhost", 8766) as server:
        print("WebSocket server started on ws://localhost:8766")

        # Start the broadcast state task
        await broadcast_state()

        # Run the server forever
        await server.wait_closed()

# Run the WebSocket server
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
