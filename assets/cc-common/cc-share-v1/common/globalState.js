function globalState() {
    this.enableFirstSceneLoad = true;

    const getStatusFirstSceneLoad = () => {
        return this.enableFirstSceneLoad;
    };

    const setStatusFirstSceneLoad = (status) => {
        this.enableFirstSceneLoad = status;
    };

    return {
        getStatusFirstSceneLoad,
        setStatusFirstSceneLoad
    };
}

module.exports = new globalState();