export class Formatter {
  constructor() {}
  public static sprintf(string: string, parameters) {
    if ("object" === typeof parameters) {
      for (var i in parameters) string = this.sprintf(string, parameters[i]);
      return string;
    }
    return "string" === typeof string ? string.replace(/%s/i, parameters) : "";
  }
  public static serialize(obj, prefix?) {
    let str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        const k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
        str.push(
          v !== null && typeof v === "object"
            ? this.serialize(v, k)
            : encodeURIComponent(k) + "=" + encodeURIComponent(v)
        );
      }
    }
    return str.join("&");
  }
}