export function structureDataForList(array) {
    const result = [];
    if (array.length > 0) {
        array.forEach(item => {
        const date = getDate(item.timestamp);
        let dateGroup = result.find(group => group.date === date);
        if (!dateGroup) {
            dateGroup = { date: date, data: [] };
            result.push(dateGroup)
        }
        dateGroup.data.push(item);
    });
    }
    return result
}

function getDate(time) {
   const date =  new Date(time)
    return date.toISOString().split('T')[0];
}