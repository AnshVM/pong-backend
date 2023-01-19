import { WebSocketOP, WebSocketServer } from 'ws';
import { rooms, createRoomAndAssign, assignRoom, unassignSocketFromRoom, getOpponent } from './Room';
import { v4 as uuid } from 'uuid'

const wss = new WebSocketServer({ port: 5000 });


wss.on('connection', (ws: WebSocketOP) => {
  ws.id = uuid();
  if (!assignRoom(ws)) createRoomAndAssign(ws);


  ws.send(JSON.stringify(
    {
      type: "init",
      data: {
        id: ws.id, roomId: ws.roomId, side: ws.side
      }
    }
  ));

  if(rooms[ws.roomId].leftClient && rooms[ws.roomId].rightClient){
    ws.send(JSON.stringify({
      type:"message",
      data:"START",
    }))
   getOpponent(ws)?.send(
    JSON.stringify({
      type:"message",
      data:"START",
    })
   ) 
  }

  ws.on('message', (data: string) => {
    const str = data.toString();
    getOpponent(ws)?.send(
      JSON.stringify({
        type: "action",
        data: str
      }));
  })

  ws.on('close', () => {
    unassignSocketFromRoom(ws);
  })

})

console.log('Server started on port 5000')


