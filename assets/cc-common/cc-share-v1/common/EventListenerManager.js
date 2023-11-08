var EventListenerManager = (function(){
    var instanceObject = {};
    function createInstance(serviceId){
        var _serviceId = serviceId;
        var _listeners = new cc.EventTarget();
        return {
            on: function(type, callback, target){
                if(!_listeners) _listeners = new cc.EventTarget();
                return _listeners.on(type, callback, target);
            },

            once: function(type, callback, target){
                if(_listeners) _listeners.once(type, callback, target);
            },

            off: function(type, callback, target){
                if(_listeners) _listeners.off(type, callback, target);
            },

            emit: function(type, arg1, arg2, arg3, arg4, arg5){
                if(_listeners) _listeners.emit(type, arg1, arg2, arg3, arg4, arg5);
            },

            dispatchEvent: function(event){
                if(_listeners) _listeners.dispatchEvent(event);
            },

            targetOff: function(target){
                if(_listeners) _listeners.targetOff(target);
            },

            getServiceId: function(){
                return _serviceId;
            },
        };
    }
    function hasInstance(serviceId){
        return instanceObject[serviceId];
    }
    return {
        getInstance: function(serviceId){
            var _instance = hasInstance(serviceId);
            if(!_instance){
                _instance = new createInstance(serviceId);
                delete _instance.constructor;
                instanceObject[serviceId] = _instance;
            }
            return _instance;
        }
    };
})();

module.exports = EventListenerManager;
