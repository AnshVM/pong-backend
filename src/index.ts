import { WebSocketOP, WebSocketServer } from 'ws';
import { createRoomAndAssign, assignRoom, unassignSocketFromRoom } from './Room';
import { v4 as uuid } from 'uuid'

const wss = new WebSocketServer({ port: 5000 });


wss.on('connection', (ws: WebSocketOP) => {
  ws.id = uuid();
  if (!assignRoom(ws)) createRoomAndAssign(ws);

  // setTimeout(() => {
  //   ws.send(JSON.stringify({ id: ws.id, roomId: ws.roomId }));
  // }, 1000);

  ws.send(JSON.stringify({ id: ws.id, roomId: ws.roomId }));

  ws.on('close', () => {
    unassignSocketFromRoom(ws);
  })

})

console.log('Server started on port 5000')


