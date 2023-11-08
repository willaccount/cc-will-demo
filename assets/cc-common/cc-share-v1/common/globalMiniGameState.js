
function globalMiniGameState() {
    this.gameState = {
        '5999': {
            isOpen: false,
            isMinimized: false,
            data: {
                // wallet: 0,
                // winAmount: 0,
                // betValue: 0,
                // spinTimes: 0,
                // isAutoSpin: false,
                // freeSpin: 0,
                // isTurbo: false
            }
        }
    };

    const updateDataForGame = (gameId, data) => {
        Object.keys(data).map((key) => {
            this.gameState[gameId].data[key] = data[key];
        });
    };
    const updateOpenGame = (gameId, isOpen) => {
        this.gameState[gameId].isOpen = isOpen;
    };

    const updateMinimizeGame = (gameId, isMinimized) => {
        this.gameState[gameId].isMinimized = isMinimized;
    };

    const getListGameState = () => {
        return this.gameState;
    };

    return {
        updateDataForGame,
        updateMinimizeGame,
        updateOpenGame,
        getListGameState
    };
}


module.exports = new globalMiniGameState();
