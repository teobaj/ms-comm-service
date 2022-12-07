const { ReplaySubject, BehaviorSubject } = require("rxjs");

/*
 * key: user1.id-user2.id
 * */

const chats = new Map([]);

/*
 *  Messages should look like
 *  text:string,
 *  from: user.name,
 *  to: user.name,
 *  date: string, 
 * */


const sendMessage = (message, chatId) => {
  let id = chatId.sort().toString();
  let chat = chats.get(id)
  if (!chat) {
    chats.set(id, new ReplaySubject())
    chat = chats.get(id)
  }
  chat.next(message)
  console.log(chats);
  return true;
}

const getChat = (chatId) => {
  let id = chatId.sort().toString();
  console.log(id, chats)
  let chat = chats.get(id);
  if (!chat) {
    chats.set(id, new ReplaySubject())
    chat = chats.get(id)
  }
  console.log(chats)
  return chat
}

module.exports = {
  sendMessage,
  getChat
}