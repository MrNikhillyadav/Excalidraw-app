import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";


const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws : WebSocket,
  room : [],
  userId : String
}

const users:User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch(e) {
    return null;
  }
  return null;
}

wss.on('connection', function connection(ws,req) {

  if(!url){
    return;
  }

  const url = req.url
  const queryParams = new URLSearchParams(url.split('?')[1])
  cont token = queryParams.get(token);

  const userId = checkUser(token)

  if(userId == null){
    ws.close()
    return null;
  }

  users.push({
    ws,
    userId,
    rooms : []
  })

  ws.on('message', async function message(data) {
    let parsedData;

    if(typeof data !== "string"){
      parsedData = JSON.parse(data.toString())
    }else{
      parsedData = JSON.parse(data)
    }

    if(parsedData.type == "join_room"){

      const user = users.filter((x) => x.ws == ws);
      user?.rooms.push(parsedData.roomId)

    }

     if(parsedData.type == "leave_room"){ 
      const user = users.find((x) => x.ws == ws);

      if(!user){
        return ;
      };
      
      user.room = user?.rooms.filter((x) => x !== parsedData.roomId )
    }

    if(parsedData.type == "chat"){

      await prismaClient.chat.create({
        data : {
          roomId : Number(parsedData.roomId),
          message : parsedData.message,
          userId ,
        }
      })

      const roomMembers = users.filter((x) => x.rooms.includes(parsedData.roomId))
      roomMembers.forEach( user => {
        user.send(JSON.stringify({
          type: "chat",
          roomId: parsedData.roomId,
          message : parsedData.message
        }))
      })
    }
  });
});