import { v4 as uuid } from 'uuid';
import { WebSocketOP } from 'ws';

class Room {
  id: string;
  leftClient: WebSocketOP | null;
  rightClient: WebSocketOP | null;

  constructor(rightClient?: WebSocketOP, leftClient?: WebSocketOP) {
    this.id = uuid();
    this.rightClient = rightClient ?? null;
    this.leftClient = leftClient ?? null;
  }
}


export let rooms: { [key: string]: Room } = {};

export let emptyRoomQueue: string[] = []; //stack of room ids. every time a room is created with an empty space for a player, or a player leaves the room, the room_id is adde to the stack

export const deleteRoom = (roomId: string) => {
  emptyRoomQueue = emptyRoomQueue.filter((r: string) => r !== roomId);
  delete rooms[roomId];
}

export const assignRoom = (ws: WebSocketOP): boolean => {
  if (emptyRoomQueue.length === 0) return false;


  const room_id = emptyRoomQueue.pop() as string;

  if (!rooms[room_id].rightClient) {
    ws.roomId = room_id;
    rooms[room_id].rightClient = ws;
    return true;
  }

  else if (!rooms[room_id].leftClient) {
    ws.roomId = room_id;
    rooms[room_id].leftClient = ws;
    return true;
  }

  return false;
}

export const createRoomAndAssign = (ws: WebSocketOP) => {
  const newRoom = new Room(ws);
  ws.roomId = newRoom.id;
  newRoom.rightClient = ws;
  emptyRoomQueue.push(newRoom.id);
  rooms[newRoom.id] = newRoom;
}

export const unassignSocketFromRoom = (ws: WebSocketOP) => {
  const room = rooms[ws.roomId];

  if (room.leftClient && room.leftClient.id === ws.id) {
    if(!room.rightClient) deleteRoom(room.id);
    room.leftClient = null;
    emptyRoomQueue.push(room.id);
    rooms[ws.roomId] = room;
  }
  else if (room.rightClient && room.rightClient.id === ws.id) {
    if(!room.leftClient) deleteRoom(room.id);
    room.rightClient = null;
    emptyRoomQueue.push(room.id);
    rooms[ws.roomId] = room;
  }
}
