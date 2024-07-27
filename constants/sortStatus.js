export function sortStatus(statusArray, contactArray) {
    const reformedStatus = []
    for (let i = 0; i < contactArray.length; i++) {
        const statusList = statusArray.filter(item => item.userId === contactArray[i].uid);
        if (statusList.length > 0) {
            reformedStatus.push({ ...contactArray[i], status: statusList, index: i  });
        }
        else {
            continue
        }
    }
    return reformedStatus;
}

export function sortUserStatus(statusArray, id) {
    const statusList = statusArray.filter(item => item.userId === id);
    return statusList;
}