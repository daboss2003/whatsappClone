import { findUsers } from "./findUsers";

export function filterListByNameAndNumber(list, text) {
    if (text === '') return list;
    const filtered = list.filter(item => item.knownName.includes(text) || item.username.includes(text) || item.phoneNo.replace('+234', '').includes(text));
    return filtered
}

export function filterForChats(list, text, userID) {
    if (text === '') return list;
    const filtered = [];
    for (const obj of list) {
        const senderID = obj.users.find(item => item !== userID)
        findUsers(senderID).then(sender => {
            if (sender) {
                if (sender.knownName.includes(text) || sender.username.includes(text) || sender.phoneNo.replace('+234', '').includes(text)) {
                    filtered.push(obj)
                }
            }
        }).catch(err => console.log(err)); 
    }
    return filtered
}

export function filterForCalls(list, text, userID) {
    if (text === '') return list;
    const filtered = [];
    for (const obj of list) {
        const senderID = obj.calls.find(item => item !== userID)
        findUsers(senderID).then(sender => {
            if (sender) {
                if (sender.knownName.includes(text) || sender.username.includes(text) || sender.phoneNo.replace('+234', '').includes(text)) {
                    filtered.push(obj)
                }
            }
        }).catch(err => console.log(err)); 
    }
    return filtered
}
