const players = [];

const createNewPlayer = (player) => {
    players.push(player);
}

const getPlayer = (id) => {
    return players.find(player => player.id === id);
}

const getWaitingPlayers = () => {
    return players.filter(player => player.isPlaying === false)
}

const removePlayer = (id) => {
    const index = players.findIndex(player => player.id === id);

    if (index !== -1) {
        players.splice(index, 1)
        return true
    }
}

module.exports = {
    createNewPlayer,
    getPlayer,
    getWaitingPlayers,
    removePlayer
}