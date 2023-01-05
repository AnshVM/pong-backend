import { setMaxListeners } from 'events';
import { ClientRequest } from 'http';
import { client } from 'websocket';
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

  test('id and room is assigned', async () => {
    const {id,roomId,socket} = await createConnection();
    expect(id!).toBeDefined();
    expect(roomId!).toBeDefined();
    socket.close();
  })

  test('first 2 players join the same room', async () => {
    const client1 = await createConnection();

    const client2 = await createConnection();

    expect(client1.roomId).toBe(client2.roomId);

    client1.socket.close();
    client2.socket.close();
  })

  test('first 4 players', async() => {
    const client1 = await createConnection();
    const client2 = await createConnection();
    const client3 = await createConnection();
    const client4 = await createConnection();

    expect(client1.roomId).toBe(client2.roomId);
    expect(client3.roomId).toBe(client4.roomId)

    client1.socket.close();
    client2.socket.close();
    client3.socket.close();
    client4.socket.close();
  }) 


  test('2 players join and one leaves and a new player joins', async () => {
    const client1 = await createConnection();
    const client2 = await createConnection();
    client1.socket.close();
    await waitForSocketState(client1.socket,client1.socket.CLOSED);
    const client3 = await createConnection();
    expect(client2.roomId).toBe(client3.roomId);
    client2.socket.close();
    client3.socket.close();
  })

  test('n players', async() => {
    const n = Number(process.argv.filter(arg => arg.startsWith('-n_clients='))[0].split('=')[1]);
    let rooms:{[key:string]:number} = {};
    let sockets:WebSocketOP[] = [];
    for(let i=0;i<n;i++){
      const client = await createConnection();
      rooms[client.roomId] = rooms[client.roomId] ? rooms[client.roomId]++ : 0; 
      sockets.push(client.socket);  
    }

    for(let i=0;i<n;i++){
      sockets[i].close();
    }
    expect(Object.keys(rooms).length).toBe(n/2);
  },20000)

})