import WebSocket, { WebSocketOP } from 'ws'
import { rooms, emptyRoomQueue } from '../src/Room';


type InitConnData = {
  id: string;
  roomId: string;
}

const waitForSocketState = (socket: WebSocketOP, state: number) =>  {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (socket.readyState === state) resolve(); 
      else waitForSocketState(socket, state).then(resolve); 
    }, 5);
  });
}


const createConnection = async (): Promise<{id:string, roomId: string,socket:WebSocketOP}> => {
  const ws = new WebSocket('ws://localhost:5000') as WebSocketOP;
  await waitForSocketState(ws,ws.OPEN);
  let id:string, roomId: string;
  let recievedStatus = 0;
  const RECIEVED = 1;
  

  ws.on('message',(str: string) => {
    const data:InitConnData = JSON.parse(str);
    id = data.id;
    roomId = data.roomId;
    recievedStatus = 1;
  })



  const waitForResponse = async ():Promise<void> => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if(recievedStatus === RECIEVED) resolve();
        else waitForResponse().then(resolve)
      },5)
    })
  }

  await waitForResponse();
  return {id:id!,roomId:roomId!,socket:ws};
}

describe('initial connection', () => {

  // test('id and room is assigned', async () => {
  //   const {id,roomId,socket} = await createConnection();
  //   expect(id!).toBeDefined();
  //   expect(roomId!).toBeDefined();
  //   socket.close();
  // })

  // test('first 2 players join the same room', async () => {
  //   const client1 = await createConnection();

  //   const client2 = await createConnection();

  //   expect(client1.roomId).toBe(client2.roomId);

  //   client1.socket.close();
  //   client2.socket.close();
  // })

  test('first 4 players', async() => {
    const client1 = await createConnection();
    const client2 = await createConnection();
    const client3 = await createConnection();
    const client4 = await createConnection();

    expect(client1.roomId).toBe(client2.roomId);
    expect(client3.roomId).toBe(client4.roomId)


  }) 

})