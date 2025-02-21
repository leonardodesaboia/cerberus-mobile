type Callback = () => void;

class PointsUpdateEvent {
    private static listeners: Callback[] = [];

    static subscribe(callback: Callback) {
        this.listeners.push(callback);
    }

    static unsubscribe(callback: Callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    static emit() {
        this.listeners.forEach(listener => listener());
    }
}

export default PointsUpdateEvent;