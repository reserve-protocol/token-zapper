"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
const DefaultMap_1 = require("../base/DefaultMap");
class Measurement {
    name;
    count;
    total;
    max;
    min;
    context = new DefaultMap_1.DefaultMap((name) => {
        return new Measurement(name);
    });
    constructor(name, count = 0, total = 0, max = 0, min = Infinity) {
        this.name = name;
        this.count = count;
        this.total = total;
        this.max = max;
        this.min = min;
    }
    get average() {
        return this.total / this.count;
    }
    addPoint(time) {
        this.count++;
        this.total += time;
        this.max = Math.max(this.max, time);
        this.min = Math.min(this.min, time);
    }
    begin(context) {
        const start = Date.now();
        return () => {
            const end = Date.now();
            const time = end - start;
            this.addPoint(time);
            if (context) {
                this.context.get(context).addPoint(time);
            }
        };
    }
    get contextStats() {
        return Array.from(this.context.values());
    }
    toString() {
        return `${this.name}: ${this.count} calls, avg: ${this.average.toFixed(2)}, max: ${this.max}, min: ${this.min}`;
    }
}
class PerformanceMonitor {
    stats = new DefaultMap_1.DefaultMap((name) => {
        return new Measurement(name);
    });
    measure(name, fn, context) {
        const end = this.begin(name, context);
        const result = fn();
        try {
            end();
        }
        catch (e) {
            // console.log('Error during measurement of ' + name)
            // console.log(e)
            throw e;
        }
        return result;
    }
    begin(name, context) {
        return this.stats.get(name).begin(context);
    }
    async measureAsync(name, fn, context) {
        const end = this.begin(name, context);
        try {
            const out = await fn();
            end();
            return out;
        }
        catch (e) {
            end();
            throw e;
        }
    }
    async measurePromise(name, promise, context) {
        const end = this.begin(name, context);
        try {
            const out = await promise;
            end();
            return out;
        }
        catch (e) {
            // console.log('Error during measurement of ' + name)
            // console.log(e)
            end();
            throw e;
        }
    }
    wrapFunction(name, fn, context) {
        return ((...args) => {
            return this.measure(name, () => fn(...args), context);
        });
    }
    wrapAsyncFunction(name, fn, context) {
        return (async (...args) => {
            return this.measurePromise(name, fn(...args), context);
        });
    }
    printStats() {
        return Array.from(this.stats.values()).map((m) => m.toString());
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.js.map