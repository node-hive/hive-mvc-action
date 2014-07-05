function ActionState(req, res, action) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.out = {};
}

ActionState.prototype = {

};

HIVE_MVC.ActionState = ActionState;
