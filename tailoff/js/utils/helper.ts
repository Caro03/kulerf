export class Helper {
  constructor() {}
  public static debounce(func, wait?, immediate?) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const callNow = immediate && !timeout;
      function later() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      }
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }
    public static extend(target) {
        target = Object(target);
        var argLen = arguments.length;
        var source, key;
        for (var i = 1; i < argLen; i++) {
            source = arguments[i];
            if (source !== null) {
                for (key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }
}
