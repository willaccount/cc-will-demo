cc.Class({
	extends: cc.Component,

	onLoad() {
		this.fadeSpeed = 0.2;
		this.isFading = false;
	},

	closePopups() {
		if (this.isFading) return;
		this.isFading = true;
		this.scheduleOnce(() => {
			this.isFading = false;
		}, this.fadeSpeed);
		let mainDirector = this.node.mainDirector;
		if (!mainDirector || !mainDirector.director) return;
		let director = mainDirector.director;
		director.closePopups && director.closePopups();
	},
});
