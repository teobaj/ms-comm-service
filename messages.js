const { ReplaySubject, BehaviorSubject } = require("rxjs");

/*
 * key: user1.id-user2.id
 * */

const chats = new Map([]);

const chatsIds = [...chats.entries()].map(([key]) => key)

/*
 *  Messages should look like
 *  text:string,
 *  from: user.name,
 *  to: user.name,
 *  date: string, 
 * */


const sendMessage = (message, chatId) => {
  let id = JSON.stringify(chatId.sort());
  let chat = chats.get(id)
  if (!chat) {
    chats.set(id, new ReplaySubject())
    chatsIds.push(id)
    chat = chats.get(id)
  }
  console.log(message)
  chat.next(message)
  console.log(chats);
  return true;
}

const getChat = (chatId) => {
  let id = JSON.stringify(chatId.sort());
  console.log(id, chats)
  let chat = chats.get(id);
  if (!chat) {
    chats.set(id, new ReplaySubject())
    chatsIds.push(id);
    chat = chats.get(id)
  }
  console.log(chats)
  return chat
}

const getChatsByUserId = (userId) => {
  let id = parseInt(userId)
  const arrIds = chatsIds.map((id) => JSON.parse(id));
  const userChatsIds = arrIds.filter((chatId) => chatId.includes(id));
  console.log(id, arrIds, userChatsIds)
  return userChatsIds
}

module.exports = {
  getChatsByUserId,
  sendMessage,
  getChat
}